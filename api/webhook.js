// api/webhook.js - Webhook receptor de notificações da BeehivePay
const { transactionStatusStore } = require('./_beehive');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Método não permitido.' });
    return;
  }

  try {
    const payload = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
    console.log('📬 Webhook recebido:', JSON.stringify(payload, null, 2));

    const transactionId = payload.id || payload.transaction?.id;
    const status = payload.status || payload.transaction?.status;
    const orderId = payload.metadata?.order_id || payload.transaction?.metadata?.order_id;

    if (transactionId && status) {
      const existing = transactionStatusStore.get(transactionId.toString()) || {};
      transactionStatusStore.set(transactionId.toString(), {
        ...existing,
        id: transactionId,
        status: status,
        orderId: orderId || existing.orderId,
        paidAt: payload.paidAt || payload.transaction?.paidAt || (status === 'paid' ? new Date().toISOString() : null),
        updatedAt: new Date().toISOString(),
        webhookReceived: true
      });
      console.log(`✅ Status da transação #${transactionId} atualizado para "${status}"`);
    }

    res.status(200).json({ success: true, message: 'Webhook processado com sucesso.' });

  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
