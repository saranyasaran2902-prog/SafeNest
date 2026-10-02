# Child Safety Project — Full-Stack MVP

A beginner-friendly child-safety web application with:

- Safety dashboard
- SOS/emergency action panel
- Incident reporting
- Trusted contacts
- Safety resources
- Local browser storage for the demo profile
- Express REST API with JSON-file persistence
- Responsive React/Vite frontend

## Important
This is a project/demo system, not a certified emergency service. The SOS button in this version demonstrates the workflow and does not automatically contact police, parents, hospitals, or emergency services.

## Requirements
- Node.js 18+
- npm

## Run

From this folder:

```bash
npm install
npm run install-all
npm run dev
```

Then open:

http://localhost:5173

API:

http://localhost:5000/api/health

## Project structure

```text
child-safety-project/
├── client/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── data/
│   │   └── db.json
│   ├── server.js
│   └── package.json
└── package.json
```

## API endpoints

GET `/api/health`

GET `/api/reports`

POST `/api/reports`

GET `/api/contacts`

POST `/api/contacts`

POST `/api/sos`

The API stores demo data in `server/data/db.json`.

## Next integration points

For a production version, replace the JSON file with a database, add authenticated parent/guardian/admin accounts, secure the API, add proper audit logs, and integrate only verified emergency/notification services.
