"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = handler;
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
function handler(req, res) {
    const { id } = req.query;
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1)
        return res.status(404).json({ error: 'Order not found' });
    if (req.method === 'GET') {
        return res.status(200).json(orders[idx]);
    }
    if (req.method === 'PUT' || req.method === 'DELETE') {
        if (req.headers['authorization'] !== process.env.ADMIN_API_KEY) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (req.method === 'PUT') {
            const { status } = req.body;
            orders[idx] = Object.assign(Object.assign({}, orders[idx]), { status });
            return res.status(200).json(orders[idx]);
        }
        if (req.method === 'DELETE') {
            const deleted = orders.splice(idx, 1);
            return res.status(200).json(deleted[0]);
        }
    }
    res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
}
