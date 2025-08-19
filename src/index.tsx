import bun from 'bun'
import * as indexController from './controllers/index-controller';

bun.serve({
  port: process.env.PORT,
  routes: {
    '/health': new Response('OK'),
    '/': indexController.index,
    '/bootstrap.css': new Response(await bun.file('./node_modules/bootstrap/dist/css/bootstrap.min.css').bytes(), {
      headers: {
        'Content-Type': 'text/css'
      }
    })
  }
})
