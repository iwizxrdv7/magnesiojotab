// api/_syncpay.js - Módulo de integração centralizada com a SyncPay (100% White-Label)
const SYNCPAY_CLIENT_ID = process.env.SYNCPAY_CLIENT_ID || "4911e9d4-6405-45c1-8dc8-9987e8f39204";
const SYNCPAY_CLIENT_SECRET = process.env.SYNCPAY_CLIENT_SECRET || "c3de8210-5a55-4c2e-bb6a-82c71fd7eee2";
const SYNCPAY_API_BASE_URL = process.env.SYNCPAY_API_BASE_URL || "https://api.syncpayments.com.br";

let cachedToken = null;
let tokenExpiresAt = 0;

/**
 * Obtém ou renova o token Bearer da SyncPay (com cache em memória para reaproveitar)
 */
async function getSyncPayToken() {
  const now = Date.now();
  // Se ainda temos um token válido (com folga de 2 minutos antes de expirar), reutilizamos
  if (cachedToken && now < (tokenExpiresAt - 120000)) {
    return cachedToken;
  }

  const url = `${SYNCPAY_API_BASE_URL}/api/partner/v1/auth-token`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json"
    },
    body: JSON.stringify({
      client_id: SYNCPAY_CLIENT_ID,
      client_secret: SYNCPAY_CLIENT_SECRET
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok || !data.access_token) {
    const errorMsg = data.message || `Erro de autenticação SyncPay (Status ${response.status})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  cachedToken = data.access_token;
  // O token dura 3600 segundos (1 hora)
  const expiresInMs = (data.expires_in || 3600) * 1000;
  tokenExpiresAt = now + expiresInMs;

  return cachedToken;
}

/**
 * Faz requisições autenticadas para a API da SyncPay
 */
async function callSyncPayApi(endpoint, options = {}) {
  const token = await getSyncPayToken();
  const url = `${SYNCPAY_API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  
  const headers = {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.message || `Erro HTTP ${response.status} na SyncPay`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

// Armazenamento em memória para dados de transações
const syncPayStatusStore = new Map();

module.exports = {
  SYNCPAY_CLIENT_ID,
  SYNCPAY_CLIENT_SECRET,
  SYNCPAY_API_BASE_URL,
  getSyncPayToken,
  callSyncPayApi,
  syncPayStatusStore
};
