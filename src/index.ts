import 'dotenv/config';
import { loadEnv } from './config/env';
import { createApp } from './app';

const env = loadEnv();
createApp(env).listen(env.PORT, () => {
  console.log(`Listening on ${env.PORT}`);
});
