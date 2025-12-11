# ADR-002: Real-time Communication - WebSocket vs Polling

**Status:** Accepted  
**Date:** December 10, 2025  
**Decision Maker:** Engineering Team  
**Last Updated:** December 10, 2025

---

## Context

QADash needs real-time updates on the dashboard when new test results arrive. Users should see new data without manually refreshing the page. The dashboard displays metrics, charts, and test result lists that need to update automatically.

### Requirements:
- Real-time dashboard updates when new test results arrive
- Low latency (<500ms from result submission to dashboard update)
- Support for multiple concurrent users
- Reliable message delivery
- Graceful degradation if real-time connection fails
- Minimal server resource usage

### Options Considered:
1. **WebSocket (Socket.IO)** - Bidirectional persistent connection
2. **Short Polling** - Client requests updates every N seconds
3. **Long Polling** - Client waits for server response
4. **Server-Sent Events (SSE)** - Server pushes updates to client

---

## Decision

**We will use WebSocket (Socket.IO) as the PRIMARY real-time communication method with Short Polling as FALLBACK.**

### Implementation Strategy:
```
PRIMARY:   WebSocket (Socket.IO)
FALLBACK:  HTTP Short Polling (30-second interval)
```

---

## Rationale

### Why WebSocket (Socket.IO):

1. **True Bi-directional Communication**
   - Server can push updates instantly
   - Client can request data on demand
   - Both directions on same connection

2. **Lower Latency**
   - No polling overhead
   - Sub-100ms update delivery
   - Real-time user experience

3. **Efficient Resource Usage**
   - Single persistent connection
   - Less network traffic than polling
   - Lower server load

4. **Battle-tested Library**
   - Socket.IO handles reconnection automatically
   - Built-in fallback mechanisms
   - Wide browser support
   - Active community and documentation

5. **Better UX**
   - Instant updates feel more responsive
   - Connection status indicators
   - No visible "waiting" for updates

### Why Short Polling as Fallback:

1. **Maximum Compatibility**
   - Works everywhere (no WebSocket required)
   - Firewall-friendly
   - Proxy-friendly

2. **Graceful Degradation**
   - If WebSocket fails, polling kicks in
   - User still gets updates (just slower)

3. **Simple Implementation**
   - Already have REST API endpoints
   - `setInterval()` on frontend

---

## Consequences

### Positive:
✅ Real-time dashboard updates (<100ms latency)  
✅ Better user experience (no manual refresh)  
✅ Lower network traffic vs polling  
✅ Automatic reconnection on disconnect  
✅ Built-in heartbeat/ping-pong  
✅ Room support for future multi-project filtering  

### Negative:
⚠️ More complex than simple polling  
⚠️ Requires maintaining persistent connections  
⚠️ Slightly higher server memory usage  
⚠️ Need to handle connection lifecycle  

### Trade-offs:
- **Memory vs Latency**: Higher memory for lower latency (acceptable)
- **Complexity vs UX**: More code for better experience (worth it)
- **Compatibility vs Performance**: WebSocket primary, polling fallback (best of both)

---

## Implementation

### Backend (Node.js + Socket.IO):
```javascript
// server.js
const io = require('socket.io')(httpServer, {
  cors: { origin: process.env.FRONTEND_URL },
  transports: ['websocket', 'polling'],
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: 5
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Emit when new result arrives
function notifyNewResult(result) {
  io.emit('newResult', result);
}
```

### Frontend (React + Socket.IO Client):
```javascript
// Dashboard.jsx
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001', {
  transports: ['websocket', 'polling'],
  reconnection: true
});

socket.on('newResult', (result) => {
  setResults(prev => [result, ...prev]);
  setLastUpdate(new Date());
});

// Fallback polling
useEffect(() => {
  const interval = setInterval(() => {
    if (!socket.connected) {
      fetchResults(); // REST API call
    }
  }, 30000); // 30 seconds

  return () => clearInterval(interval);
}, [socket.connected]);
```

---

## Performance Considerations

### Connection Limits:
- Expected: 10-50 concurrent users in MVP
- Socket.IO can handle 10,000+ connections per server
- **Verdict:** No concerns for MVP scale

### Memory Usage:
- ~5-10 KB per WebSocket connection
- 50 users = ~500 KB (negligible)
- **Verdict:** Acceptable overhead

### Latency:
- WebSocket: <100ms typical
- Polling (30s): Up to 30 seconds delay
- **Verdict:** WebSocket provides 300x better latency

---

## Alternatives Considered

### 1. Short Polling Only
```javascript
setInterval(() => fetchResults(), 5000); // Every 5 seconds
```
- ❌ High network traffic
- ❌ Higher latency (5s minimum)
- ❌ Unnecessary server load
- ❌ Poor user experience
- **Verdict:** Not acceptable as primary method

### 2. Long Polling
```javascript
async function longPoll() {
  const data = await fetch('/api/v1/results/wait');
  handleData(data);
  longPoll(); // Recursive
}
```
- ✅ Lower latency than short polling
- ❌ More complex than WebSocket
- ❌ Connection management issues
- **Verdict:** WebSocket is simpler and better

### 3. Server-Sent Events (SSE)
```javascript
const eventSource = new EventSource('/api/v1/events');
eventSource.onmessage = (e) => handleData(e.data);
```
- ✅ Simpler than WebSocket
- ❌ One-way only (server → client)
- ❌ Less browser support
- ❌ Harder to implement bi-directional features later
- **Verdict:** WebSocket more flexible

---

## Migration Path

**Current:** REST API only (manual refresh)  
**Phase 1:** Add WebSocket for real-time updates ✅  
**Phase 2:** Add polling fallback ✅  
**Future:** Room-based broadcasting for multi-project filtering  

---

## Monitoring & Metrics

Track these metrics in production:

| Metric | Target | Alert Threshold |
|--------|--------|----------------|
| WebSocket Connection Success Rate | >95% | <90% |
| Average Connection Latency | <100ms | >500ms |
| Reconnection Attempts per User | <2/hour | >5/hour |
| Concurrent Connections | 10-50 | >500 |
| Message Delivery Time | <100ms | >1000ms |

---

## References

- [Socket.IO Documentation](https://socket.io/docs/v4/)
- [WebSocket vs Polling](https://ably.com/topic/websockets-vs-polling)
- [MDN WebSocket API](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket)

---

## Review History

| Date | Reviewer | Status | Notes |
|------|----------|--------|-------|
| 2025-12-10 | Engineering Team | Approved | Initial implementation complete |

---

**Next Review Date:** Q2 2026 (after performance data available)
