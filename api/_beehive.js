// api/_beehive.js - Módulo de integração centralizada com a BeehivePay
const BEEHIVE_SECRET_KEY = process.env.BEEHIVE_SECRET_KEY;
const BEEHIVE_PUBLIC_KEY = process.env.BEEHIVE_PUBLIC_KEY;
const BEEHIVE_API_BASE_URL = process.env.BEEHIVE_API_BASE_URL || "https://api.conta.paybeehive.com.br/v1";

function getAuthHeader() {
  const secretKey = BEEHIVE_SECRET_KEY || process.env.BEEHIVE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("Credenciais da BeehivePay não configuradas. Adicione BEEHIVE_SECRET_KEY nas variáveis de ambiente da Vercel.");
  }
  const token = Buffer.from(`${secretKey}:x`).toString("base64");
  return `Basic ${token}`;
}

/**
 * Faz requisições autenticadas para a API da BeehivePay
 */
async function callBeehiveApi(endpoint, options = {}) {
  const url = `${BEEHIVE_API_BASE_URL}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`;
  const headers = {
    "Authorization": getAuthHeader(),
    "Content-Type": "application/json",
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  const response = await fetch(url, config);
  const data = await response.json().catch(() => ({}));
  
  if (!response.ok) {
    const errorMsg = data.message || data.error || `Erro HTTP ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.details = data;
    throw error;
  }

  return data;
}

// Armazenamento em memória para status recentes de transações
const transactionStatusStore = new Map();

module.exports = {
  BEEHIVE_SECRET_KEY,
  BEEHIVE_PUBLIC_KEY,
  BEEHIVE_API_BASE_URL,
  getAuthHeader,
  callBeehiveApi,
  transactionStatusStore
};
