import { renderToStream } from '@kitajs/html/suspense'
import { Layout } from '../layouts/Layout'

export const index = async (): Promise<Response> => {
  return new Response(renderToStream(<Layout>hello world</Layout>))
}
