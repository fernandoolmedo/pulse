## Pulse → Ads Analytics Relevance

This project reflects core patterns used in modern ad-platform analytics:

- Designed a MongoDB schema capturing **atomic, event-level user interactions**, analogous to impressions, clicks, and engagement signals
- Modeled sentiment reactions as structured telemetry to enable **metrics, experimentation, and ranking use-cases**
- Built transformation logic to reshape raw inputs into **dimensional, analytics-ready datasets**
- Implemented authenticated APIs and logging endpoints demonstrating production engineering practices
- Deployed via Heroku using fully **environment-driven configuration and secret management**
- Established auditable user × item × sentiment × timestamp records suitable for future behavioral models

### Tech Stack

- Backend: Node.js, Express, MongoDB Atlas
- Templating/UI: EJS, Bootstrap
- Analytics Design: event logging and sentiment aggregation
- Infrastructure: Heroku hosting with Git-based deployment
