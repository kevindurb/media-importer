import bun from 'bun'

bun.serve({
  port: process.env.PORT,
  routes: {
    '/health': new Response('OK')
  }
})
