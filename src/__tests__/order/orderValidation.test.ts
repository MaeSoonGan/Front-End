import { describe, it, expect } from 'vitest';

// 주문 검증/계산 로직 (OrderBottomSheet 기준)
const FEE_RATE = 0.0015;
const parseNumber = (v: string) => Number(v.replace(/\D/g, '')) || 0;

interface FormState { side: 'BUY' | 'SELL'; orderType: 'LIMIT' | 'MARKET'; quantity: string; price: string }

function getOrderError(p: {
  availableBalance: number; estimatedTotal: number; formState: FormState;
  holdingQuantity: number; price: number; quantity: number;
}) {
  const { formState: f, quantity, price, estimatedTotal, availableBalance, holdingQuantity } = p;
  if (!f.quantity) return '주문 수량을 입력해주세요';
  if (quantity <= 0) return '주문 수량은 1주 이상 입력해주세요';
  if (f.orderType === 'LIMIT' && !f.price) return '주문 가격을 입력해주세요';
  if (f.orderType === 'LIMIT' && price <= 0) return '주문 가격은 1원 이상 입력해주세요';
  if (f.side === 'BUY' && estimatedTotal > availableBalance) return '주문 가능 금액을 초과했습니다';
  if (f.side === 'SELL' && quantity > holdingQuantity) return '보유 수량을 초과하여 매도할 수 없습니다';
  return '';
}

const calcFee = (estimatedAmount: number) => Math.round(estimatedAmount * FEE_RATE);

describe('주문 검증 getOrderError', () => {
  const base: FormState = { side: 'BUY', orderType: 'LIMIT', quantity: '10', price: '1000' };

  it('정상 매수면 에러 없음', () => {
    expect(getOrderError({ formState: base, quantity: 10, price: 1000, estimatedTotal: 10015, availableBalance: 100000, holdingQuantity: 0 })).toBe('');
  });
  it('매수 주문가능금액 초과', () => {
    expect(getOrderError({ formState: base, quantity: 10, price: 1000, estimatedTotal: 200000, availableBalance: 100000, holdingQuantity: 0 }))
      .toBe('주문 가능 금액을 초과했습니다');
  });
  it('매도 보유수량 초과', () => {
    const sell: FormState = { ...base, side: 'SELL' };
    expect(getOrderError({ formState: sell, quantity: 10, price: 1000, estimatedTotal: 10000, availableBalance: 0, holdingQuantity: 5 }))
      .toBe('보유 수량을 초과하여 매도할 수 없습니다');
  });
  it('수량 미입력', () => {
    expect(getOrderError({ formState: { ...base, quantity: '' }, quantity: 0, price: 1000, estimatedTotal: 0, availableBalance: 100000, holdingQuantity: 0 }))
      .toBe('주문 수량을 입력해주세요');
  });
});

describe('주문 금액/수수료 계산', () => {
  it('수수료 0.15% 반올림, 총액 = 주문금액 + 수수료', () => {
    const amount = 10 * 70000; // 700,000
    const fee = calcFee(amount); // 1,050
    expect(fee).toBe(1050);
    expect(amount + fee).toBe(701050);
  });
});

describe('주문 입력 숫자 정제', () => {
  it('문자 제거 후 숫자만 추출', () => {
    expect(parseNumber('1,2a3')).toBe(123);
    expect(parseNumber('')).toBe(0);
  });
});
