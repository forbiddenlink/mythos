import { http, HttpResponse } from 'msw'

// Example handlers - customize per project
export const handlers = [
  // Health check
  http.get('/api/health', () => {
    return HttpResponse.json({ status: 'ok' })
  }),

  // Example CRUD patterns
  http.get('/api/items', () => {
    return HttpResponse.json([
      { id: '1', name: 'Item 1' },
      { id: '2', name: 'Item 2' },
    ])
  }),

  http.get('/api/items/:id', ({ params }) => {
    return HttpResponse.json({ id: params.id, name: `Item ${params.id}` })
  }),

  http.post('/api/items', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: crypto.randomUUID(), ...body }, { status: 201 })
  }),

  http.patch('/api/items/:id', async ({ params, request }) => {
    const body = await request.json()
    return HttpResponse.json({ id: params.id, ...body })
  }),

  http.delete('/api/items/:id', () => {
    return new HttpResponse(null, { status: 204 })
  }),

  // Auth patterns
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json()
    if (email && password) {
      return HttpResponse.json({
        user: { id: '1', email },
        token: 'mock-jwt-token',
      })
    }
    return HttpResponse.json({ error: 'Invalid credentials' }, { status: 401 })
  }),

  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ success: true })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('Authorization')
    if (authHeader?.startsWith('Bearer ')) {
      return HttpResponse.json({
        id: '1',
        email: 'test@example.com',
        name: 'Test User',
      })
    }
    return HttpResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }),
]
