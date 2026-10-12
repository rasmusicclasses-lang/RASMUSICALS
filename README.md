# RASMUSICALS Agora room for Wix

A small HTTPS-hosted Agora RTC web application intended to be embedded into a Wix Editor page. The App Certificate stays on the server; the browser requests a short-lived RTC token. The room has a UI for up to five participants.

## Before deployment

1. Create an Agora RTC project at https://console.agora.io/.
2. Copy the App ID and enable/copy the App Certificate. Keep the certificate private.
3. Deploy this project as a Node web service with Node 20+ and HTTPS.
4. Set environment variables in the host dashboard (do not commit `.env`):
   - `AGORA_APP_ID`
   - `AGORA_APP_CERTIFICATE`
   - `ROOM_PASSCODE` (a long random access code shared with intended participants only)
5. Build command: `npm install`
6. Start command: `npm start`
7. Check `https://YOUR-HOST/health` returns `{"ok":true}`.

## Wix Editor embedding

1. In Wix Editor, add a page named **Online Music Room**.
2. Add Elements → Embed Code → Embed a Site (preferred for a hosted application), or use the site embed option available in your editor.
3. Set the embedded website URL to your deployed HTTPS URL, for example `https://your-app.example.com/`.
4. Make the embed large enough (suggested minimum 900px wide and 700px tall on desktop; use a full-width responsive section).
5. Publish the Wix site and test on the published URL, not the editor preview.
6. Click Join Room and allow camera/microphone when prompted.

## Camera/microphone iframe permissions

The browser requires HTTPS and the *outermost Wix-created iframe* must permit camera and microphone. The app cannot grant itself permission if Wix's outer iframe blocks it. If the browser reports permission denied, inspect the iframe permissions in browser DevTools and Wix's current embed settings/support. Do not assume adding an `allow` attribute inside this app fixes the Wix-created outer iframe. If Wix does not grant these permissions to an embedded site, the reliable alternative is to open the hosted room as a same-tab page on your domain rather than in an iframe.

## Important limitations

- This is a starter implementation, not a fully authenticated booking system. The shared room passcode is a basic gate, not individual identity verification. Anyone who obtains it can request a token.
- The five-person limit is presented in the interface, but this starter does not have a distributed server-side seat lock. For a strict five-person cap, add a persistent seat manager and identity-based access control.
- The fixed room name means all people using this deployment enter the same room. Deploy separate room logic if you need unique lessons.
- Review Agora pricing, privacy obligations, and the service terms before production use.
- For private paid lessons, add Wix member authentication or a backend session system and enforce teacher/student authorization before issuing tokens.
