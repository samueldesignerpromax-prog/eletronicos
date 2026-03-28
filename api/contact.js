module.exports = (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method === 'POST') {
    try {
      const { name, email, subject, message } = req.body;
      
      if (!name || !email || !subject || !message) {
        return res.status(400).json({ error: 'Todos os campos são obrigatórios' });
      }
      
      // Simular envio de email
      console.log('=== Nova mensagem de contato ===');
      console.log(`Nome: ${name}`);
      console.log(`Email: ${email}`);
      console.log(`Assunto: ${subject}`);
      console.log(`Mensagem: ${message}`);
      console.log('================================');
      
      res.status(200).json({
        success: true,
        message: 'Mensagem enviada com sucesso! Entraremos em contato em breve.'
      });
    } catch (error) {
      res.status(500).json({ error: 'Erro ao enviar mensagem' });
    }
  } else {
    res.status(405).json({ error: 'Método não permitido' });
  }
};
