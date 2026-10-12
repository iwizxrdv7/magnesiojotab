// api/check-status.js - Verificação de status em tempo real (Suporta SyncPay para PIX e BeehivePay para Cartão)
const { callBeehiveApi, transactionStatusStore } = require('./_beehive');
const { callSyncPayApi, syncPayStatusStore } = require('./_syncpay');

function isUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test((str || '').trim());
}

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

  const txIdStr = transactionId.toString().trim();
  const isSyncPayTx = isUUID(txIdStr) || syncPayStatusStore.has(txIdStr);

  // 1. SE FOR TRANSAÇÃO DA SYNCPAY (PIX)
  if (isSyncPayTx) {
    try {
      const syncResponse = await callSyncPayApi(`/api/partner/v1/transaction/${txIdStr}`, {
        method: 'GET'
      });

      const txData = syncResponse.data || {};
      const status = txData.status || 'pending';
      const isPaid = status === 'completed';
      const isFailed = status === 'failed';

      const cached = syncPayStatusStore.get(txIdStr) || {};
      syncPayStatusStore.set(txIdStr, {
        ...cached,
        id: txIdStr,
        status: status,
        paid: isPaid,
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({
        success: true,
        gateway: 'syncpay',
        transactionId: txIdStr,
        status: status,
        paid: isPaid,
        refused: isFailed,
        orderId: cached.orderId || `JB-${txIdStr.substring(0, 8)}`,
        customerName: cached.customerName || 'Cliente',
        amount: cached.amount || Math.round((txData.amount || 92.90) * 100),
        raw: syncResponse
      });
      return;

    } catch (error) {
      console.error(`Erro ao consultar status na SyncPay (${txIdStr}):`, error);

      const cached = syncPayStatusStore.get(txIdStr);
      if (cached) {
        res.status(200).json({
          success: true,
          gateway: 'syncpay',
          transactionId: cached.id,
          status: cached.status,
          paid: cached.status === 'completed' || cached.paid === true,
          orderId: cached.orderId || `JB-${txIdStr.substring(0, 8)}`,
          customerName: cached.customerName || 'Cliente',
          amount: cached.amount || 9290,
          fromCache: true
        });
        return;
      }

      res.status(error.status || 500).json({
        success: false,
        error: error.message || 'Erro ao consultar status na SyncPay'
      });
      return;
    }
  }

  // 2. SE FOR TRANSAÇÃO DA BEEHIVEPAY (CARTÃO DE CRÉDITO)
  try {
    const beehiveResponse = await callBeehiveApi(`/transactions/${txIdStr}`, {
      method: 'GET'
    });

    const status = beehiveResponse.status;
    const paidAt = beehiveResponse.paidAt;

    const cached = transactionStatusStore.get(txIdStr) || {};
    transactionStatusStore.set(txIdStr, {
      ...cached,
      id: txIdStr,
      status: status,
      paidAt: paidAt,
      updatedAt: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      gateway: 'beehive',
      transactionId: beehiveResponse.id,
      status: status,
      paidAt: paidAt,
      paid: status === 'paid' || status === 'approved',
      refused: status === 'refused',
      orderId: cached.orderId || `JB-${txIdStr}`,
      customerName: cached.customerName || 'Cliente',
      amount: cached.amount || 0,
      raw: beehiveResponse
    });

  } catch (error) {
    console.error(`Erro ao consultar status na BeehivePay (${txIdStr}):`, error);

    const cached = transactionStatusStore.get(txIdStr);
    if (cached) {
      res.status(200).json({
        success: true,
        gateway: 'beehive',
        transactionId: cached.id,
        status: cached.status,
        paid: cached.status === 'paid' || cached.status === 'approved',
        orderId: cached.orderId || `JB-${txIdStr}`,
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
