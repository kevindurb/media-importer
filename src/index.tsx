import bun from 'bun'
import * as IndexController from './controllers/IndexController';

bun.serve({
  port: process.env.PORT,
  routes: {
    '/health': new Response('OK'),
    '/': IndexController.index,
  }
})
