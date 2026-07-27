# Pulse

Pulse is a social polling application.

## Architecture
- Backend: Node.js, Express, MongoDB
- Frontend: Flutter 

## Rules
- Do not change API response shapes without explaining the impact.
- Never commit secrets or modify production credentials.
- Run relevant tests and linting after changes.
- Keep backend and Flutter models synchronized.
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