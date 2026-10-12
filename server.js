const express = require('express');
const path = require('path');
const crypto = require('crypto');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();
app.disable('x-powered-by');
app.use(express.json({ limit: '10kb' }));
app.use(express.static(path.join(__dirname, 'public')));

const APP_ID = process.env.AGORA_APP_ID;
const APP_CERTIFICATE = process.env.AGORA_APP_CERTIFICATE;
const ROOM_PASSCODE = process.env.ROOM_PASSCODE;
const ROOM_NAME = 'rasmusicals-music-room';
const TOKEN_TTL_SECONDS = 60 * 60;

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/token', (req, res) => {
  try {
    if (!APP_ID || !APP_CERTIFICATE || !ROOM_PASSCODE) {
      return res.status(503).json({ error: 'The video room has not been configured by the site owner yet.' });
    }

    const supplied = String(req.body?.passcode || '');
    const expected = Buffer.from(ROOM_PASSCODE);
    const actual = Buffer.from(supplied);
    if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
      return res.status(401).json({ error: 'Incorrect room access code.' });
    }

    // Allocate a numeric UID on the server; never accept the channel or UID from the browser.
    const uid = crypto.randomInt(100000, 2000000000);
    const token = RtcTokenBuilder.buildTokenWithUid(
      APP_ID,
      APP_CERTIFICATE,
      ROOM_NAME,
      uid,
      RtcRole.PUBLISHER,
      TOKEN_TTL_SECONDS,
      TOKEN_TTL_SECONDS
    );

    res.set('Cache-Control', 'no-store');
    return res.json({ appId: APP_ID, channel: ROOM_NAME, uid, token, expiresIn: TOKEN_TTL_SECONDS });
  } catch (err) {
    console.error('Token generation failed:', err.message);
    return res.status(500).json({ error: 'Could not create a secure video-room token. Check the server configuration.' });
  }
});

const port = Number(process.env.PORT || 3000);
app.listen(port, '0.0.0.0', () => console.log(`Agora room server listening on ${port}`));
