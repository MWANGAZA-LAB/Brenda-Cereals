import type { NextApiRequest, NextApiResponse } from 'next';

let products = [
  {
    id: 'maize',
    name: 'Maize (White)',
    image: '/maize-product.jpg',
    prices: { '1kg': 120, '5kg': 550, '50kg': 5000 },
    inStock: true,
  },
  {
    id: 'beans',
    name: 'Beans (Rosecoco)',
    image: '/beans-product.jpg',
    prices: { '1kg': 180, '5kg': 850, '50kg': 8000 },
    inStock: true,
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Product not found' });

  if (req.method === 'GET') {
    return res.status(200).json(products[idx]);
  }
  if (req.method === 'PUT') {
    const { name, image, prices, inStock } = req.body;
    products[idx] = { ...products[idx], name, image, prices, inStock };
    return res.status(200).json(products[idx]);
  }
  if (req.method === 'DELETE') {
    const deleted = products.splice(idx, 1);
    return res.status(200).json(deleted[0]);
  }
  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 