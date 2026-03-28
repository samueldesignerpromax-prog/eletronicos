const { v4: uuidv4 } = require('uuid');

// Simular banco de dados (em produção use um banco real)
let orders = [];

module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Criar novo pedido
  if (req.method === 'POST') {
    try {
      const { customer, items, total, paymentMethod } = req.body;
      
      if (!customer || !items || !total) {
        return res.status(400).json({ error: 'Dados incompletos' });
      }
      
      const order = {
        id: uuidv4(),
        orderNumber: `ORD-${Date.now()}`,
        customer: {
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          address: customer.address
        },
        items: items,
        total: parseFloat(total),
        paymentMethod: paymentMethod || 'pix',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      orders.push(order);
      
      // Simular envio de email
      console.log(`Pedido criado: ${order.orderNumber}`);
      console.log(`Email enviado para: ${customer.email}`);
      
      res.status(201).json({
        success: true,
        order: order
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }
  
  // Listar pedidos
  else if (req.method === 'GET') {
    const { email } = req.query;
    
    let userOrders = orders;
    if (email) {
      userOrders = orders.filter(o => o.customer.email === email);
    }
    
    res.status(200).json({
      success: true,
      total: userOrders.length,
      orders: userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    });
  }
  
  // Cancelar pedido
  else if (req.method === 'DELETE') {
    const { id } = req.query;
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }
    
    const deletedOrder = orders[index];
    orders.splice(index, 1);
    
    res.status(200).json({
      success: true,
      message: 'Pedido cancelado com sucesso',
      order: deletedOrder
    });
  }
  
  else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
