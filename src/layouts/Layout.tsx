import type { Component } from '@kitajs/html';

export const Layout: Component = ({ children }) => (
  <>
    {'<!doctype html>'}
    <html data-bs-theme='dark' lang='en'>
      <head>
        <title>Media Importer</title>
        <link rel='stylesheet' href='/bootstrap.css' />
      </head>
      <body>
        <div class='container'>{children}</div>
      </body>
    </html>
  </>
);
