# Pulse

Pulse is a social polling application.

## Architecture
- Backend: Node.js, Express 5, MongoDB Atlas (Mongoose)
- Frontend: server-rendered EJS templates with Bootstrap 5
  - Views in `views/`, static assets in `public/`
  - The only client-side JavaScript is `public/js/reactions.js`
- A Flutter client is planned but not yet in this repo. `fluttertest.dart`
  at the root is a scratch file against the `/pythonrequest` demo endpoint,
  not an app.

## Commands
- `npm run dev` — start with nodemon
- `npm start` — start the server
- `npm test` — unit tests (`node --test`, no database required)
- `npm run lint` — eslint

## Rules
- Do not change API response shapes without explaining the impact.
- Never commit secrets or modify production credentials.
- Run relevant tests and linting after changes.
- Ask before performing database migrations.

## Git Workflow

- Never commit directly to main.
- Always create a feature or fix branch.
- Use conventional commits.
- Run tests before committing.
- Push the branch to origin.
- Open a pull request targeting main.
- Never merge a pull request without explicit approval.
- Never force-push.
- Never commit secrets or .env files.
