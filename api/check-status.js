// api/check-status.js - Verificação de status de transação em tempo real
const { callBeehiveApi, transactionStatusStore } = require('./_beehive');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const transactionId = req.query?.id || (req.url ? new URL(req.url, 'http://localhost').searchParams.get('id') : null);

  if (!transactionId) {
    res.status(400).json({ success: false, error: 'ID da transação é obrigatório.' });
    return;
  }

  try {
    const beehiveResponse = await callBeehiveApi(`/transactions/${transactionId}`, {
      method: 'GET'
    });

    const status = beehiveResponse.status;
    const paidAt = beehiveResponse.paidAt;

    // Atualiza status no store em memória
    const cached = transactionStatusStore.get(transactionId.toString()) || {};
    transactionStatusStore.set(transactionId.toString(), {
      ...cached,
      id: transactionId,
      status: status,
      paidAt: paidAt,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      transactionId: beehiveResponse.id,
      status: status,
      paidAt: paidAt,
      paid: status === 'paid' || status === 'approved',
      refused: status === 'refused',
      orderId: cached.orderId || `JB-${transactionId}`,
      customerName: cached.customerName || 'Cliente',
      amount: cached.amount || 0,
      raw: beehiveResponse
    });

  } catch (error) {
    console.error(`Erro ao consultar status da transação ${transactionId}:`, error);

    // Fallback para status em memória se a API falhar temporariamente
    const cached = transactionStatusStore.get(transactionId.toString());
    if (cached) {
      res.status(200).json({
        success: true,
        transactionId: cached.id,
        status: cached.status,
        paid: cached.status === 'paid' || cached.status === 'approved',
        orderId: cached.orderId || `JB-${transactionId}`,
        customerName: cached.customerName || 'Cliente',
        amount: cached.amount || 0,
        fromCache: true
      });
      return;
    }

    res.status(error.status || 500).json({
      success: false,
      error: error.message || 'Erro ao consultar status da transação'
    });
  }
};
