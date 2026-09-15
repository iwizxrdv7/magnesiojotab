// api/create-card.js - Criação de transação com Cartão de Crédito na BeehivePay (100% White-Label)
const { callBeehiveApi, transactionStatusStore } = require('./_beehive');

function cleanDigits(str) {
  return (str || '').toString().replace(/\D/g, '');
}

module.exports = async function handler(req, res) {
  // Cabeçalhos CORS
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
    const installments = Math.min(Math.max(parseInt(body.installments, 10) || 1, 1), 12); // Suporte até 12x
    const customer = body.customer || {};
    const amount = parseInt(body.amount, 10) || 9290;
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = body.orderId || `JB-${orderNumber}`;
    const cleanCpfNumber = cleanDigits(customer.documentNumber || customer.cpf) || "60188241086";
    const cleanPhoneNumber = cleanDigits(customer.phone) || "11999998888";

    // Suporta tanto o objeto de cartão quanto campos individuais
    let cardData = body.card;
    if (!cardData && (body.cardNumber || body.number)) {
      let expMonth = parseInt(body.expirationMonth || body.expMonth, 10);
      let expYear = parseInt(body.expirationYear || body.expYear, 10);

      // Se a validade veio como MM/AA
      if (!expMonth && body.expiry) {
        const parts = body.expiry.split('/');
        if (parts.length === 2) {
          expMonth = parseInt(parts[0].trim(), 10);
          expYear = parseInt(parts[1].trim(), 10);
        }
      }

      if (expYear && expYear < 100) expYear += 2000;

      cardData = {
        number: cleanDigits(body.cardNumber || body.number),
        holderName: (body.cardHolderName || body.holderName || body.holder || customer.name || customer.fullName || '').trim(),
        expirationMonth: expMonth || 12,
        expirationYear: expYear || 2028,
        cvv: (body.cardCvv || body.cvv || '').toString().trim()
      };
    }

    if (!cardData || !cardData.number) {
      res.status(400).json({
        success: false,
        error: 'Dados do cartão incompletos ou inválidos.'
      });
      return;
    }

    const items = body.items && body.items.length > 0 ? body.items : [
      {
        title: "6 Magnésios + B12 Jota'B",
        unitPrice: amount,
        quantity: 1,
        tangible: true
      }
    ];

    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:8080';
    const isLocalhost = !host || host.includes('localhost') || host.includes('127.0.0.1');
    const domainUrl = isLocalhost ? 'https://jotabsuplementos.com.br' : `${protocol}://${host}`;
    const webhookUrl = isLocalhost ? null : `${protocol}://${host}/api/webhook`;

    const payload = {
      amount: amount,
      paymentMethod: "credit_card",
      card: {
        number: cleanDigits(cardData.number),
        holderName: cardData.holderName.trim().toUpperCase(),
        expirationMonth: parseInt(cardData.expirationMonth, 10),
        expirationYear: parseInt(cardData.expirationYear, 10) < 100 ? parseInt(cardData.expirationYear, 10) + 2000 : parseInt(cardData.expirationYear, 10),
        cvv: cardData.cvv.toString().trim()
      },
      installments: installments,
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
    const status = beehiveResponse.status || 'processing';
    const isPaid = status === 'paid' || status === 'approved';
    const isRefused = status === 'refused';
    const refusedReason = beehiveResponse.refusedReason?.description || null;

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
      paid: isPaid,
      refused: isRefused,
      refusedReason: refusedReason,
      installments: installments,
      amount: amount,
      threeDSRedirectUrl: beehiveResponse.threeDSRedirectUrl || null,
      raw: beehiveResponse
    });

  } catch (error) {
    console.error('Erro ao processar transação de cartão:', error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao processar cartão de crédito',
      details: error.details || null
    });
  }
};
