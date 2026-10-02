# SafeNest — Connected Child Safety Platform v3

This version combines the original SafeNest safety website and the Live Location/Geofence website into ONE connected React + Express application.

## Included
- Guardian dashboard
- Child profile/status
- Live GPS location tracking using browser/device geolocation
- Live OpenStreetMap view
- Continuous location updates while tracking is enabled
- Circular safe boundary/geofence
- Automatic server-side boundary-crossing detection
- Browser notifications for geofence alerts
- Alert history
- Test alert
- Optional Twilio SMS integration
- SOS workflow
- Safety reports
- Trusted contacts with call links
- Safety resources
- Responsive mobile/desktop frontend
- Shared backend and JSON persistence

## Run
From the `child-safety-platform` folder:

```powershell
npm install
npm --prefix server install
npm --prefix client install
npm run dev
```

Open `http://localhost:5173`.

## npm allow-scripts warning
If npm reports that `esbuild` has an install script pending, approve it only if npm requires it for the client to run:

```powershell
npm approve-scripts esbuild
```

## Real SMS
Copy `server/.env.example` to `server/.env` and configure Twilio credentials. Never put Twilio credentials in frontend code.

## Important tracking limitation
A normal browser can provide continuous location updates while the tracking page is active and permission is granted. It cannot guarantee background GPS tracking after the browser is closed or the OS suspends it. A production child-safety system should use a dedicated mobile app/background-location service, authentication, HTTPS, encrypted location storage, consent, access controls, audit logging and retention/deletion rules.

## Demo safety note
The SOS endpoint records the workflow; it does not automatically contact emergency services. For production, connect it to verified guardian/emergency contacts and a compliant telephony provider.
