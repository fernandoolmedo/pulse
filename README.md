## Pulse – Real-Time Opinion Aggregation for Analytics-Driven Insights

Pulse captures and organizes what people think—instantly.
It’s a social platform built to transform scattered consumer opinions into **high-signal, structured data** that can be used the same way modern ad platforms use impressions and clicks.

### Why Pulse Exists

Today, understanding public opinion requires scraping reviews from Google, Yelp, and company sites, then stitching them together with sentiment models and manual aggregation.

Pulse solves that problem by generating analytics-ready telemetry at the source.

Instead of unstructured text, the platform collects:
- Atomic, event-level reactions
- Consistent sentiment categories
- Authenticated user interactions
- Reliable timestamps and item identifiers

All in a format designed for experimentation and machine learning.

### Analytics Design
Pulse was engineered from day one to mirror the data patterns used in large-scale ad systems:
- A MongoDB schema that records **impressions, clicks, and engagement-style events** as discrete interaction records
- Sentiment reactions modeled as structured telemetry
- Aggregation logic that reshapes raw activity into dimensional datasets
- Logging endpoints that enable auditability and confident reprocessing

These design choices make Pulse an ideal foundation for:
- Category classification and search
- Personalized recommender systems
- Ranking models based on real behavioral signals

### Tech Stack

#### Backend
- Node.js
- Express
- MongoDB Atlas

#### UI
- EJS templating
- Bootstrap 5
- Static image hosting

#### Infrastructure
- Heroku deployment
- Environment-driven configuration
- Secret management and versioned releases
