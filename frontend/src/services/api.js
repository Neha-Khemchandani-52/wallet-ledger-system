import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "X-API-KEY": import.meta.env.VITE_API_KEY || "demo-testing-token-123" // non-senstive dummy token for testing only
  },
  timeout: 10000,
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      (err.code === 'ECONNABORTED'
        ? 'Request timed out. Please try again.'
        : 'Something went wrong. Please try again.');

    return Promise.reject({
      message,
      status: err.response?.status,
    });
  }
);

export const createAccount = (accountId, name, openingBalance = 0) => {
  const bal = parseFloat(openingBalance);
  const payload = {
    account_id:      accountId,
    name,
    opening_balance: (!isNaN(bal) && bal >= 0) ? bal : 0,
  };
  return api.post('/accounts', payload).then((r) => r.data);
};
  
  export const getBalance = (accountId) =>
    api.get(`/accounts/${accountId}/balance`).then((r) => r.data);
  
  export const getTransactions = (accountId, page = 1) =>
    api.get(`/accounts/${accountId}/transactions`, { params: { page } }).then((r) => r.data);
  
  export const getAllAccounts = () =>
    api.get('/accounts').then((r) => r.data);
  
  export const transfer = (payload) =>
    api.post('/transfers', payload).then((r) => r.data);

  export const deposit = (accountId,depositAmt) =>
    api.post(`/accounts/${accountId}/deposit`, {account_id: accountId, amount:  parseFloat(depositAmt)}).then((r) => r.data);

export default api;