// api/create-pix.js - Criação de transação PIX na SyncPay (100% White-Label)
const { callSyncPayApi, syncPayStatusStore } = require('./_syncpay');

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

    // Valor em centavos para compatibilidade ou float em Reais
    let rawAmount = body.amount || 9290;
    let amountInReais = typeof rawAmount === 'number' && rawAmount > 500 ? (rawAmount / 100) : Number(rawAmount);
    if (!amountInReais || isNaN(amountInReais)) amountInReais = 92.90;
    amountInReais = Number(amountInReais.toFixed(2));

    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const orderId = body.orderId || `JB-${orderNumber}`;
    
    // Tratamento de CPF (exatamente 11 dígitos numéricos)
    let cleanCpfNumber = cleanDigits(customer.documentNumber || customer.cpf);
    if (!cleanCpfNumber || cleanCpfNumber.length !== 11) {
      cleanCpfNumber = "60188241086";
    }

    // Tratamento de Telefone (10 ou 11 dígitos numéricos)
    let cleanPhoneNumber = cleanDigits(customer.phone);
    if (!cleanPhoneNumber || (cleanPhoneNumber.length !== 10 && cleanPhoneNumber.length !== 11)) {
      cleanPhoneNumber = "11999998888";
    }

    const customerName = (customer.name || customer.fullName || "Cliente Jota'B").trim();
    const customerEmail = (customer.email || "contato@jotabsuplementos.com.br").trim().toLowerCase();

    // URL base dinâmica para webhook
    const protocol = req.headers['x-forwarded-proto'] || 'http';
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'localhost:8080';
    const isLocalhost = !host || host.includes('localhost') || host.includes('127.0.0.1');
    const webhookUrl = isLocalhost ? null : `${protocol}://${host}/api/webhook`;

    const payload = {
      amount: amountInReais,
      description: `6 Magnésios + B12 Jota'B - Pedido #${orderId}`,
      client: {
        name: customerName,
        cpf: cleanCpfNumber,
        email: customerEmail,
        phone: cleanPhoneNumber
      }
    };

    if (webhookUrl) {
      payload.webhook_url = webhookUrl;
    }

    // Chamada à API da SyncPay (Cash-In)
    const syncPayResponse = await callSyncPayApi('/api/partner/v1/cash-in', {
      method: 'POST',
      body: JSON.stringify(payload)
    });

    const transactionId = syncPayResponse.identifier;
    const qrCodeText = syncPayResponse.pix_code || '';
    const status = 'waiting_payment';

    // Salva no cache em memória
    if (transactionId) {
      syncPayStatusStore.set(transactionId.toString(), {
        id: transactionId,
        gateway: 'syncpay',
        status: status,
        orderId: orderId,
        amount: Math.round(amountInReais * 100),
        amountReais: amountInReais,
        customerName: customerName,
        pixCode: qrCodeText,
        updatedAt: new Date().toISOString()
      });
    }

    res.status(200).json({
      success: true,
      gateway: 'syncpay',
      transactionId: transactionId,
      orderId: orderId,
      status: status,
      amount: Math.round(amountInReais * 100),
      qrCodeText: qrCodeText,
      raw: syncPayResponse
    });

  } catch (error) {
    console.error('Erro ao criar transação PIX na SyncPay:', error);
    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao processar PIX na SyncPay',
      details: error.details || null
    });
  }
};
