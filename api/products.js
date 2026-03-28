const productsData = require('../data/products.json');

module.exports = (req, res) => {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'GET') {
    const { id, category, search, limit = 10 } = req.query;
    
    let products = [...productsData.products];
    
    // Buscar por ID
    if (id) {
      const product = products.find(p => p.id == id);
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      return res.status(200).json(product);
    }
    
    // Filtrar por categoria
    if (category && category !== 'todos') {
      products = products.filter(p => p.category === category);
    }
    
    // Buscar por nome
    if (search) {
      products = products.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase())
      );
    }
    
    // Limitar resultados
    products = products.slice(0, parseInt(limit));
    
    res.status(200).json({
      success: true,
      total: products.length,
      products: products
    });
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
