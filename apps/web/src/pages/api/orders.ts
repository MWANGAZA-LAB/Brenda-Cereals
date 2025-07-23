import type { NextApiRequest, NextApiResponse } from 'next';

let orders = [
  {
    id: 'order1',
    items: [
      { productId: 'maize', name: 'Maize (White)', weight: '5kg', price: 550, qty: 2 },
    ],
    total: 1100,
    deliveryLocation: 'Nairobi',
    deliveryFee: 300,
    paymentMethod: 'mpesa',
    status: 'pending',
    createdAt: new Date().toISOString(),
  },
];

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    return res.status(200).json(orders);
  }
  if (req.method === 'POST') {
    const { items, total, deliveryLocation, deliveryFee, paymentMethod } = req.body;
    const newOrder = {
      id: `order${orders.length + 1}`,
      items,
      total,
      deliveryLocation,
      deliveryFee,
      paymentMethod,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    orders.push(newOrder);
    return res.status(201).json(newOrder);
  }
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
} 