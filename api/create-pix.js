// api/create-pix.js - Criação de transação PIX na BeehivePay (100% White-Label)
const { callBeehiveApi, transactionStatusStore } = require('./_beehive');

function cleanDigits(str) {
  return (str || '').toString().replace(/\D/g, '');
}

module.exports = async function handler(req, res) {
  // Configuração de cabeçalhos CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido. Use POST.' });
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    const customer = body.customer || {};
    const items = body.items && body.items.length > 0 ? body.items : [
      {
        title: "6 Magnésios + B12 Jota'B",
        unitPrice: parseInt(body.amount, 10) || 9290,
        quantity: 1,
        tangible: true
      }
    ];

    const amount = parseInt(body.amount, 10) || 9290;
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = body.orderId || `JB-${orderNumber}`;
    const cleanCpfNumber = cleanDigits(customer.documentNumber || customer.cpf) || "60188241086";
    const cleanPhoneNumber = cleanDigits(customer.phone) || "11999998888";

    // URL base dinâmica para o Webhook
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:8080';
    const isLocalhost = !host || host.includes('localhost') || host.includes('127.0.0.1');
    const domainUrl = isLocalhost ? 'https://jotabsuplementos.com.br' : `${protocol}://${host}`;
    const webhookUrl = isLocalhost ? null : `${protocol}://${host}/api/webhook`;

    const payload = {
      amount: amount,
      paymentMethod: "pix",
      customer: {
        name: (customer.name || customer.fullName || "Cliente Jota'B").trim(),
        email: (customer.email || "contato@jotabsuplementos.com.br").trim(),
        phone: cleanPhoneNumber,
        document: {
          type: "cpf",
          number: cleanCpfNumber
        }
      },
      items: items.map(item => ({
        title: item.title || "6 Magnésios + B12 Jota'B",
        unitPrice: parseInt(item.unitPrice, 10) || amount,
        quantity: parseInt(item.quantity, 10) || 1,
        tangible: item.tangible !== false
      })),
      metadata: {
        provider: "jotab-suplementos",
        user_email: customer.email || "contato@jotabsuplementos.com.br",
        order_id: orderId,
        checkout_url: `${domainUrl}/checkout.html`,
        shop_url: domainUrl
      },
      pix: {
        expiresInSeconds: 3600
      }
    };

    if (webhookUrl) {
      payload.postbackUrl = webhookUrl;
    }

    const beehiveResponse = await callBeehiveApi('/transactions', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const transactionId = beehiveResponse.id;
    const qrCodeText = beehiveResponse.pix?.qrcode || '';
    const status = beehiveResponse.status || 'waiting_payment';

    // Salva status inicial no cache de memória
    if (transactionId) {
      transactionStatusStore.set(transactionId.toString(), {
        id: transactionId,
        status: status,
        orderId: orderId,
        amount: amount,
        customerName: customer.name || customer.fullName || "Cliente",
        updatedAt: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      transactionId: transactionId,
      orderId: orderId,
      status: status,
      amount: amount,
      qrCodeText: qrCodeText,
      expiresAt: beehiveResponse.pix?.expirationDate || null,
      raw: beehiveResponse
    });

  } catch (error) {
    console.error('Erro ao criar transação PIX:', error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao processar PIX',
      details: error.details || null
    });
  }
};
