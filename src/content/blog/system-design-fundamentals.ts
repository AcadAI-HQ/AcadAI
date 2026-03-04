import type { BlogPost } from '@/types/blog';

const post: BlogPost = {
  slug: 'system-design-fundamentals',
  title: 'System Design 101: What Every Developer Needs to Know',
  date: '2026-02-17',
  excerpt:
    'System design interviews trip up even experienced developers. The reason isn\'t a lack of technical knowledge — it\'s not knowing how to think about systems at scale.',
  readTime: '10 min read',
  tags: ['System Design', 'Interviews', 'Backend'],
  coverImage: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&auto=format',
  content: `System design interviews trip up even experienced developers. The reason isn't a lack of technical knowledge — it's not knowing how to *think* about systems.

This post covers the core concepts that show up repeatedly in system design discussions, whether you're interviewing or just trying to build better software.

## Why System Design Matters

Writing code that works on your laptop is one skill. Designing systems that serve millions of users, stay available during failures, and can evolve over years — that's a different discipline entirely.

Even if you're not interviewing right now, understanding these concepts makes you a better engineer day-to-day.

## The Building Blocks

![Server infrastructure in a modern data center](https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=1200&q=80&auto=format)

### 1. Scalability

Scalability is about handling growth. There are two kinds:

**Vertical scaling** — make the machine bigger (more RAM, faster CPU). Simple, but has limits. One server can only get so big.

**Horizontal scaling** — add more machines. More complex, but theoretically limitless. This is how every large-scale system works.

The catch: horizontal scaling requires your application to be *stateless* — it can't store session data on one specific server if any server might handle the next request.

### 2. Load Balancing

When you have multiple servers, something needs to decide which server handles each request. That's a load balancer.

Common strategies:
- **Round robin** — distribute requests evenly in sequence
- **Least connections** — send to the server handling fewest active requests
- **IP hash** — same IP always goes to same server (useful for stateful sessions)

Load balancers also handle health checking — if a server goes down, traffic stops going to it automatically.

### 3. Caching

Caching is storing expensive computation results so you don't repeat them. It's one of the highest-leverage optimizations in system design.

**Cache layers:**
- **Client-side** — browser caching, CDN caching
- **Server-side** — in-memory caches like Redis or Memcached
- **Database query caching** — store frequently-run query results

The cache invalidation problem: how do you know when cached data is stale? This is genuinely one of the hard problems in computer science. Common strategies include TTL (time-to-live), write-through caching, and event-driven invalidation.

### 4. Databases

**Relational databases** (PostgreSQL, MySQL) — structured data, ACID transactions, joins. Use when data relationships matter and consistency is critical.

**NoSQL databases** — several types:
- **Document** (MongoDB) — flexible schema, good for varied data shapes
- **Key-value** (Redis) — extremely fast, good for caching and sessions
- **Column-family** (Cassandra) — optimized for writes, good for time-series data
- **Graph** (Neo4j) — relationship-heavy data like social networks

The "SQL vs NoSQL" debate is mostly resolved: use the right tool for the job. Most applications use both.

### 5. CAP Theorem

In a distributed system, you can only guarantee two of three properties:

- **Consistency** — every read gets the most recent write
- **Availability** — every request gets a response (even if it's not the most recent data)
- **Partition tolerance** — the system keeps working even if some nodes can't communicate

Since network partitions are inevitable in distributed systems, you're really choosing between consistency and availability. This choice shapes your entire database and architecture strategy.

### 6. Message Queues

When service A needs to tell service B to do something, you have options:

**Synchronous** — A calls B directly and waits. Simple, but B becoming slow makes A slow.

**Asynchronous** — A puts a message in a queue. B reads from the queue when ready. A doesn't wait.

Message queues (Kafka, RabbitMQ, SQS) decouple services, handle traffic spikes by absorbing bursts, and improve reliability — if B is down, messages wait in the queue.

### 7. Content Delivery Networks (CDNs)

A CDN is a network of servers distributed geographically. When someone requests a static asset (image, CSS, JS), it's served from the CDN node closest to them — not from your origin server in one data center.

This reduces latency dramatically for global users and offloads traffic from your servers.

## Thinking Through a System

The real skill in system design isn't knowing all the components — it's knowing how to reason about a problem.

A framework that works:

1. **Clarify requirements** — scale, features, constraints. "How many users?" is the most important question.
2. **Estimate scale** — rough numbers for reads/writes/storage
3. **Sketch the high-level design** — boxes and arrows, major components
4. **Drill into components** — database schema, API design, caching strategy
5. **Identify bottlenecks** — where will this break under load?
6. **Discuss tradeoffs** — every decision has a cost; name them

Interviewers aren't looking for the perfect answer. They're looking for structured thinking and awareness of tradeoffs.

## Common Patterns

**Rate limiting** — prevent abuse and protect services from overload. Usually implemented with sliding window counters in Redis.

**Circuit breaker** — if a downstream service is failing, stop calling it for a period to let it recover. Prevents cascading failures.

**Database sharding** — split a database horizontally across multiple machines by some key (user ID, geography). Enables horizontal scaling of databases.

**Read replicas** — add read-only copies of your database. Offload read traffic so the primary can focus on writes.

**Event sourcing** — instead of storing current state, store every event that led to that state. Enables audit logs, time travel, and event-driven architectures.

## What to Study Next

Start with these resources to go deeper:

- *Designing Data-Intensive Applications* by Martin Kleppmann — the definitive book
- AWS/GCP architecture whitepapers — real systems documented in detail
- Engineering blogs (Uber, Airbnb, Netflix, Discord) — how production systems evolved

System design improves with deliberate practice. Start with simple problems (design a URL shortener) before moving to complex ones (design Twitter). Explain your thinking out loud — the communication matters as much as the answer.

In a structured backend development or fullstack development roadmap, system design typically appears at the intermediate-to-advanced stage — after you've built real projects and understand individual components through direct experience. If you're working through a backend learning path and want to know exactly where system design fits relative to everything else you need to learn, [AcadAI](https://www.acadai.org) maps out the full progression from fundamentals to senior-level concepts.`,
};

export default post;
