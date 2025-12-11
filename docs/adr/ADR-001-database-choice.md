# ADR-001: Database Choice - SQLite vs PostgreSQL

**Status:** Accepted  
**Date:** December 10, 2025  
**Decision Maker:** Engineering Team  
**Last Updated:** December 10, 2025

---

## Context

QADash needs a database to store test automation results from multiple frameworks and CI/CD platforms. The system receives test results via API endpoints and webhooks, storing them for visualization and historical analysis. We need to choose between SQLite and PostgreSQL for the MVP.

### Requirements:
- Store test results (executions, metrics, trends)
- Support up to 10,000 test results per day initially
- Simple deployment and maintenance
- Fast queries for dashboard visualization
- Support for data aggregation and filtering

### Options Considered:
1. **SQLite** - File-based, embedded database
2. **PostgreSQL** - Full-featured relational database server
3. **MySQL** - Alternative relational database (not deeply evaluated)

---

## Decision

**We will use SQLite for the MVP (v1.0) with a planned migration path to PostgreSQL in v2.0.**

### Rationale:

**Why SQLite for MVP:**
1. **Zero Configuration**: No database server to install/manage
2. **Simplified Deployment**: Single file database, easy backup
3. **Fast Development**: Perfect for rapid prototyping and MVP
4. **Sufficient Performance**: Can handle 1M+ records with proper indexing
5. **Lower Operational Cost**: No server hosting costs
6. **Portable**: Easy to move between environments

**PostgreSQL Advantages (for future):**
1. Better concurrency support (multiple writers)
2. Advanced indexing and query optimization
3. Better for multi-user scenarios
4. Horizontal scalability options
5. Robust backup and replication

---

## Consequences

### Positive:
✅ Faster MVP delivery (no DB server setup)  
✅ Lower infrastructure costs initially  
✅ Simpler deployment process  
✅ Easier local development setup  
✅ Good performance for expected load (<10k results/day)  

### Negative:
⚠️ Limited concurrent write operations  
⚠️ Not ideal for multi-instance deployments  
⚠️ Migration required when scaling beyond 100k daily results  
⚠️ Limited stored procedures and advanced features  

### Mitigation Strategies:
1. **Design ORM-agnostic code** using Knex.js (supports both SQLite and PostgreSQL)
2. **Plan migration path** with database abstraction layer
3. **Monitor performance metrics** to identify when migration is needed
4. **Document migration procedure** in advance
5. **Use connection pooling** even with SQLite for better performance

---

## Implementation Notes

### Current Setup:
```javascript
// knexfile.js
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './database/qadash.db'
    },
    useNullAsDefault: true
  }
};
```

### Future Migration Path:
```javascript
// knexfile.js (PostgreSQL)
module.exports = {
  production: {
    client: 'postgresql',
    connection: {
      host: process.env.DB_HOST,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD
    },
    pool: { min: 2, max: 10 }
  }
};
```

---

## Migration Triggers

**Consider migrating to PostgreSQL when:**
- Daily test results exceed 100,000
- Multiple application instances needed (horizontal scaling)
- Advanced analytics queries become slow (>2 seconds)
- Multi-tenant features required
- Concurrent write operations cause locks

---

## Alternatives Considered

### PostgreSQL from Start
- ❌ Overhead for MVP
- ❌ Requires server setup
- ✅ Better long-term scalability
- **Verdict:** Premature optimization for MVP

### MySQL
- ⚖️ Similar pros/cons to PostgreSQL
- ❌ Less common in Node.js ecosystem
- **Verdict:** No significant advantage over PostgreSQL

### NoSQL (MongoDB)
- ❌ Overkill for structured test data
- ❌ Harder to query aggregated metrics
- **Verdict:** Not suitable for this use case

---

## References

- [SQLite When To Use](https://www.sqlite.org/whentouse.html)
- [Knex.js Documentation](http://knexjs.org/)
- [PostgreSQL vs SQLite Performance](https://www.digitalocean.com/community/tutorials/sqlite-vs-mysql-vs-postgresql-a-comparison-of-relational-database-management-systems)

---

## Review History

| Date | Reviewer | Status | Notes |
|------|----------|--------|-------|
| 2025-12-10 | Engineering Team | Approved | Initial decision for MVP |

---

**Next Review Date:** March 2026 (after 3 months of production data)
