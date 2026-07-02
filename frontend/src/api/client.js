const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  })

  if (response.status === 204) {
    return null
  }

  const data = await response.json().catch(() => null)

  if (!response.ok) {
    const detail = data?.detail
    const message = Array.isArray(detail)
      ? detail.map((item) => item.msg).join(', ')
      : detail || 'Request failed'
    throw new Error(message)
  }

  return data
}

export const api = {
  products: {
    list: () => request('/products'),
    get: (id) => request(`/products/${id}`),
    create: (body) => request('/products', { method: 'POST', body: JSON.stringify(body) }),
    update: (id, body) =>
      request(`/products/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  },
  customers: {
    list: () => request('/customers'),
    get: (id) => request(`/customers/${id}`),
    create: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/customers/${id}`, { method: 'DELETE' }),
  },
  orders: {
    list: () => request('/orders'),
    get: (id) => request(`/orders/${id}`),
    create: (body) => request('/orders', { method: 'POST', body: JSON.stringify(body) }),
    delete: (id) => request(`/orders/${id}`, { method: 'DELETE' }),
  },
}
