import bun from 'bun';

export const assets = {
  '/main.js': new Response(await bun.file('./public/main.js').bytes(), {
    headers: { 'Content-Type': 'text/javascript' },
  }),
  '/bootstrap.css': new Response(
    await bun.file('./node_modules/bootstrap/dist/css/bootstrap.min.css').bytes(),
    { headers: { 'Content-Type': 'text/css' } },
  ),
  '/bootstrap-icons.css': new Response(
    await bun.file('./node_modules/bootstrap-icons/font/bootstrap-icons.min.css').bytes(),
    { headers: { 'Content-Type': 'text/css' } },
  ),
  '/fonts/bootstrap-icons.woff2': new Response(
    await bun.file('./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff2').bytes(),
    { headers: { 'Content-Type': 'font/woff2' } },
  ),
  '/fonts/bootstrap-icons.woff': new Response(
    await bun.file('./node_modules/bootstrap-icons/font/fonts/bootstrap-icons.woff').bytes(),
    { headers: { 'Content-Type': 'font/woff' } },
  ),
};
