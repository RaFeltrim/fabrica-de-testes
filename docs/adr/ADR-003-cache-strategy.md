# ADR-003: Caching Strategy with Redis

**Status:** Proposed  
**Date:** December 10, 2025  
**Decision Maker:** Engineering Team  
**Implementation Phase:** Phase 4 (Week 7-8)

---

## Context

As QADash grows, certain API endpoints become slow with large datasets, particularly:
- `GET /api/v1/trends` - Aggregates data across multiple time periods
- `GET /api/v1/results` - Lists with complex filters
- Dashboard stats calculation (total tests, success rates, etc.)

With 10,000+ test results per day and 30-day retention, queries can take 200-500ms, causing poor user experience.

### Current Performance:
| Endpoint | Response Time | Query Complexity |
|----------|--------------|------------------|
| GET /api/v1/trends | 200-500ms | Multiple JOINs + GROUP BY |
| GET /api/v1/results | 100-200ms | Filters + Pagination |
| Dashboard Stats | 150-300ms | COUNT + SUM aggregations |

### Requirements:
- Reduce API response time to <50ms for cached data
- Cache invalidation when new results arrive
- TTL-based expiration for stale data
- Minimal code changes to existing controllers

---

## Decision

**Implement Redis caching with Cache-Aside pattern and automatic invalidation on data changes.**

### Cache Strategy:
```
1. Request arrives at controller
2. Check Redis for cached response
   - If HIT: Return immediately (<10ms)
   - If MISS: Query database, store in cache (TTL=5min), return
3. On new test result: Invalidate relevant cache keys
```

---

## Rationale

### Why Redis:

1. **Performance**
   - In-memory storage (sub-millisecond access)
   - 50x-100x faster than SQLite queries
   - Reduces database load significantly

2. **Simplicity**
   - Key-value store (simple to use)
   - Built-in TTL (auto-expiration)
   - Pattern-based deletion (`trends:*`)

3. **Scalability**
   - Handles 100,000+ ops/second
   - Can be scaled separately from app
   - Shared cache across multiple instances

4. **Developer Experience**
   - Rich Node.js client (`redis` npm package)
   - Well-documented
   - Easy to debug (redis-cli)

### Why Cache-Aside Pattern:

```
Application controls caching logic:
┌─────────────┐
│ Controller  │
└──────┬──────┘
       │
   1. Check cache
       │
    ┌──▼──┐  HIT    ┌────────┐
    │Redis│◄────────│ Return │
    └──┬──┘         └────────┘
       │ MISS
   2. Query DB
       │
    ┌──▼────────┐
    │ Database  │
    └──┬────────┘
       │
   3. Store + Return
```

**Advantages:**
- Full control over what to cache
- Easy to implement gradually
- Simple invalidation logic
- No database coupling

---

## Implementation

### 1. Redis Setup (Docker Compose):
```yaml
# docker-compose.yml
services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  redis-data:
```

### 2. Cache Service:
```javascript
// services/cacheService.js
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379',
  socket: {
    reconnectStrategy: (retries) => Math.min(retries * 50, 500)
  }
});

client.on('error', (err) => console.error('Redis error:', err));
client.connect();

async function getFromCache(key) {
  try {
    const cached = await client.get(key);
    return cached ? JSON.parse(cached) : null;
  } catch (error) {
    console.error('Cache get error:', error);
    return null; // Fallback to database
  }
}

async function setToCache(key, value, ttlSeconds = 300) {
  try {
    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch (error) {
    console.error('Cache set error:', error);
  }
}

async function invalidateCache(pattern) {
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(keys);
    }
  } catch (error) {
    console.error('Cache invalidation error:', error);
  }
}

module.exports = { getFromCache, setToCache, invalidateCache };
```

### 3. Controller Integration:
```javascript
// controllers/trendsController.js
const cache = require('../services/cacheService');

async function getTrends(req, res) {
  const filters = { 
    startDate: req.query.start_date,
    endDate: req.query.end_date,
    groupBy: req.query.group_by || 'day'
  };
  
  // Generate cache key
  const cacheKey = `trends:${JSON.stringify(filters)}`;
  
  // Check cache
  const cached = await cache.getFromCache(cacheKey);
  if (cached) {
    return res.json({ trends: cached, cached: true });
  }
  
  // Query database
  const trends = await db.getTrends(filters);
  
  // Store in cache (5 minutes)
  await cache.setToCache(cacheKey, trends, 300);
  
  res.json({ trends, cached: false });
}
```

### 4. Invalidation on New Results:
```javascript
// controllers/resultsController.js
async function saveResult(req, res) {
  const result = await db.insert(req.body);
  
  // Invalidate all trend caches
  await cache.invalidateCache('trends:*');
  
  // Invalidate results lists
  await cache.invalidateCache('results:*');
  
  // Emit WebSocket notification
  io.emit('newResult', result);
  
  res.status(201).json(result);
}
```

---

## Consequences

### Positive:
✅ **90% faster response times** (200-500ms → 5-50ms)  
✅ **Lower database load** (fewer queries)  
✅ **Better user experience** (instant dashboard updates)  
✅ **Scalability** (can handle 10x more users)  
✅ **Graceful degradation** (works without Redis)  

### Negative:
⚠️ **Additional infrastructure** (Redis server required)  
⚠️ **Complexity** (cache invalidation logic)  
⚠️ **Memory usage** (cache storage)  
⚠️ **Potential stale data** (if invalidation fails)  

### Trade-offs:
- **Memory vs Speed**: More RAM for faster responses (worth it)
- **Complexity vs Performance**: More code for better UX (acceptable)
- **Consistency vs Latency**: Slightly stale data for instant response (acceptable with 5min TTL)

---

## Performance Projections

### Before Caching:
```
GET /api/v1/trends        → 350ms (database query)
GET /api/v1/results       → 150ms (database query)
Dashboard Stats           → 200ms (aggregations)
Total Page Load           → ~700ms
```

### After Caching:
```
GET /api/v1/trends        → 8ms (cache hit)
GET /api/v1/results       → 5ms (cache hit)
Dashboard Stats           → 6ms (cache hit)
Total Page Load           → ~20ms (35x improvement)
```

### Cache Hit Rate Target:
- **Expected**: 85-95% hit rate
- **Invalidation**: On every new result submission
- **TTL**: 5 minutes (300 seconds)

---

## Cache Key Strategy

### Pattern-based Keys:
```javascript
trends:{startDate}:{endDate}:{groupBy}:{filters...}
results:{page}:{limit}:{filters...}
stats:dashboard:{date}
failure-analysis:{period}
```

### Example Keys:
```
trends:2025-12-01:2025-12-10:day:frontend
results:1:50:status=failed
stats:dashboard:2025-12-10
```

---

## Monitoring Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Cache Hit Rate | >85% | <70% |
| Average Response Time (cached) | <50ms | >100ms |
| Redis Memory Usage | <500MB | >1GB |
| Cache Invalidation Rate | <10/min | >100/min |
| Failed Cache Operations | <1% | >5% |

---

## Alternatives Considered

### 1. In-Memory Cache (Node.js)
```javascript
const cache = new Map();
```
- ✅ No external dependency
- ❌ Lost on server restart
- ❌ Can't share across instances
- **Verdict:** Not suitable for production

### 2. Database Query Optimization Only
- ✅ No new infrastructure
- ❌ Still 100-200ms response times
- ❌ Database bottleneck remains
- **Verdict:** Not enough improvement

### 3. Memcached
- ✅ Similar to Redis
- ❌ No data persistence
- ❌ Fewer features (no pattern matching)
- **Verdict:** Redis is better

### 4. HTTP Caching (ETags)
- ✅ Browser-level caching
- ❌ Doesn't help server load
- ❌ Not suitable for real-time data
- **Verdict:** Complement, not replacement

---

## Migration Plan

**Phase 1 (Week 7):** Setup Redis + Basic Caching
- Install Redis via Docker
- Create cacheService.js
- Cache `/api/v1/trends` endpoint

**Phase 2 (Week 8):** Expand Coverage
- Cache `/api/v1/results` endpoint
- Cache dashboard stats
- Implement invalidation logic

**Phase 3 (Post-MVP):** Advanced Features
- Cache warming on startup
- Distributed caching for multi-instance
- Cache analytics dashboard

---

## Rollback Strategy

If Redis causes issues:
1. Set `ENABLE_CACHE=false` environment variable
2. Controllers fall back to direct database queries
3. No data loss (cache is ephemeral)
4. System continues working (just slower)

```javascript
// Graceful fallback
async function getFromCache(key) {
  if (!process.env.ENABLE_CACHE) return null;
  // ... normal cache logic
}
```

---

## References

- [Redis Documentation](https://redis.io/docs/)
- [Cache-Aside Pattern](https://learn.microsoft.com/en-us/azure/architecture/patterns/cache-aside)
- [Node Redis Client](https://github.com/redis/node-redis)

---

## Review History

| Date | Reviewer | Status | Notes |
|------|----------|--------|-------|
| 2025-12-10 | Engineering Team | Proposed | Implementation in Phase 4 |

---

**Next Review Date:** After implementation (Week 8)
