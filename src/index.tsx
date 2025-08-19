import bun from 'bun'
import * as indexController from './controllers/index-controller';

bun.serve({
  port: process.env.PORT,
  routes: {
    '/health': new Response('OK'),
    '/': indexController.index,
  }
})
