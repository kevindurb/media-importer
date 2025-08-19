import { type Component } from "@kitajs/html"

export const Layout: Component = ({ children }) => (
  <>
    {'<!doctype html>'}
    <html>
      <head>
        <title>Media Importer</title>
        <link rel='stylesheet' href="/bootstrap.css" />
      </head>
      <body>{children}</body>
    </html>
  </>
)
