// Product API
export async function getProducts() {
  const res = await fetch('/api/products');
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`/api/products/${id}`);
  return res.json();
}

export async function addProduct(product: any) {
  const res = await fetch('/api/products', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function updateProduct(id: string, product: any) {
  const res = await fetch(`/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  });
  return res.json();
}

export async function deleteProduct(id: string) {
  const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
  return res.json();
}

// Order API
export async function getOrders() {
  const res = await fetch('/api/orders');
  return res.json();
}

export async function getOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`);
  return res.json();
}

export async function addOrder(order: any) {
  const res = await fetch('/api/orders', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return res.json();
}

export async function updateOrder(id: string, order: any) {
  const res = await fetch(`/api/orders/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  });
  return res.json();
}

export async function deleteOrder(id: string) {
  const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
  return res.json();
} 