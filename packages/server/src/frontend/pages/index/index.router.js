import fp from 'fastify-plugin'

export default fp(async (app) => {
  app.get('/frontend', async (request, reply) => {
    return reply.view('frontend/pages/index/index.page.html', {}, { layout: 'frontend/layout.html' })
  })
})
