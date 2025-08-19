import { type Component } from "@kitajs/html"

export const Layout: Component = ({ children }) => (
  <html>
    <body>{children}</body>
  </html>
)
