// src/server.ts
// Application entrypoint — imports config/env first (fails fast on bad config),
// then starts the HTTP server.

import './config/env'; // validate env vars before anything else
import { app } from './app';
import { env } from './config/env';

const { PORT } = env;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard: http://localhost:${PORT}`);
  console.log(`🔍 API health: http://localhost:${PORT}/api/health`);
});
