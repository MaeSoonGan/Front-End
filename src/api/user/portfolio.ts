import client from '../client';

export const portfolioApi = {
  resetSeedMoney: (data: { holdingsAndCashResetAgreed: boolean; irreversibleAgreed: boolean }) =>
    client.post('/api/portfolio/seed-money/reset', data).then(r => r.data.data),
};
