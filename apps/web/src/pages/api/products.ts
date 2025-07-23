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
  if (req.method === 'GET') {
    return res.status(200).json(products);
  }
  if (req.method === 'POST') {
    const { name, image, prices, inStock } = req.body;
    const newProduct = {
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      image,
      prices,
      inStock,
    };
    products.push(newProduct);
    return res.status(201).json(newProduct);
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 