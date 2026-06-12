import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderAmountForm } from '../../components/user/OrderAmountForm';
import { OrderSideTabs } from '../../components/user/OrderSideTabs';
import { OrderStockCard } from '../../components/user/OrderStockCard';
import { OrderSummaryCard } from '../../components/user/OrderSummaryCard';
import { OrderTypeToggle } from '../../components/user/OrderTypeToggle';
import { useContestMode } from '../../contexts/ContestModeContext';
import { marketApi } from '../../api/user/market';
import { portfolioApi } from '../../api/user/portfolio';
import { orderApi } from '../../api/user/order';
import { parseApiError } from '../../api/parseApiError';
import type { OrderFormState, OrderSide, OrderStockInfo, OrderType } from '../../types/order';
import { cn } from '../../utils/cn';

const FEE_RATE = 0.0015;

interface StockView extends OrderStockInfo {
  stockId: number;
}

function getInitialSide(side: string | null): OrderSide {
  return side === 'SELL' ? 'SELL' : 'BUY';
}

function parseNumber(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}

function getOrderError({
  availableBalance,
  estimatedTotal,
  formState,
  holdingQuantity,
  price,
  quantity,
}: {
  availableBalance: number;
  estimatedTotal: number;
  formState: OrderFormState;
  holdingQuantity: number;
  price: number;
  quantity: number;
}) {
  if (!formState.quantity) {
    return '주문 수량을 입력해주세요';
  }

  if (quantity <= 0) {
    return '주문 수량은 1주 이상 입력해주세요';
  }

  if (formState.orderType === 'LIMIT' && !formState.price) {
    return '주문 가격을 입력해주세요';
  }

  if (formState.orderType === 'LIMIT' && price <= 0) {
    return '주문 가격은 1원 이상 입력해주세요';
  }

  if (formState.side === 'BUY' && estimatedTotal > availableBalance) {
    return '주문 가능 금액을 초과했습니다';
  }

  if (formState.side === 'SELL' && quantity > holdingQuantity) {
    return '보유 수량을 초과하여 매도할 수 없습니다';
  }

  return '';
}

export function OrderPage() {
  const [searchParams] = useSearchParams();
  const { contestId, isContestMode } = useContestMode();
  const contestIdNum = isContestMode && contestId ? Number(contestId) : undefined;
  const stockCode = searchParams.get('stockCode');

  const [stock, setStock] = useState<StockView | null>(null);
  const [availableBalance, setAvailableBalance] = useState(0);
  const [holdingQuantity, setHoldingQuantity] = useState(0);
  const [loading, setLoading] = useState(true);

  const [formState, setFormState] = useState<OrderFormState>({
    side: getInitialSide(searchParams.get('side')),
    orderType: 'LIMIT',
    quantity: '',
    price: '',
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // 종목 시세 (stockId 포함)
  useEffect(() => {
    if (!stockCode) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    marketApi
      .getStockPrice(stockCode)
      .then((d) => {
        if (!active || !d) return;
        const currentPrice = Number(d.price ?? 0);
        setStock({
          stockId: Number(d.stockId ?? 0),
          stockName: d.name ?? '',
          stockCode: d.code ?? stockCode,
          market: '',
          currentPrice,
          changeRate: Number(d.changeRate ?? 0),
        });
        // 지정가 기본 가격 = 현재가 (아직 입력 전일 때만)
        setFormState((cur) => (cur.price ? cur : { ...cur, price: String(currentPrice) }));
      })
      .catch(() => {
        if (active) setStock(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [stockCode]);

  // 주문가능금액(대회/일반) + 보유(매도가능)수량
  useEffect(() => {
    if (!stockCode) return;
    let active = true;

    (contestIdNum != null
      ? portfolioApi.getContestAccount(contestIdNum)
      : portfolioApi.getAvailableCash()
    )
      .then((d) => {
        if (active && d) setAvailableBalance(Number(d.availableBalance ?? 0));
      })
      .catch(() => {});

    portfolioApi
      .getHolding(stockCode, contestIdNum)
      .then((d) => {
        if (active && d) setHoldingQuantity(Number(d.availableQuantity ?? d.quantity ?? 0));
      })
      .catch(() => {
        if (active) setHoldingQuantity(0);
      });

    return () => {
      active = false;
    };
  }, [stockCode, contestIdNum]);

  const quantity = parseNumber(formState.quantity);
  const currentPrice = stock?.currentPrice ?? 0;
  const orderPrice = formState.orderType === 'MARKET' ? currentPrice : parseNumber(formState.price);
  const estimatedAmount = quantity * orderPrice;
  const fee = Math.round(estimatedAmount * FEE_RATE);
  const estimatedTotal = estimatedAmount + fee;
  const isBuy = formState.side === 'BUY';

  const resetForm = (side: OrderSide) => {
    setFormState({
      side,
      orderType: 'LIMIT',
      quantity: '',
      price: stock ? String(stock.currentPrice) : '',
    });
  };

  const handleChangeSide = (side: OrderSide) => {
    setErrorMessage('');
    setSuccessMessage('');
    resetForm(side);
  };

  const handleChangeOrderType = (orderType: OrderType) => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormState((current) => ({
      ...current,
      orderType,
      price: orderType === 'MARKET' ? String(currentPrice) : current.price,
    }));
  };

  const handleSubmitOrder = async () => {
    if (!stock) {
      return;
    }

    const nextErrorMessage = getOrderError({
      availableBalance,
      estimatedTotal,
      formState,
      holdingQuantity,
      price: orderPrice,
      quantity,
    });

    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      setSuccessMessage('');
      return;
    }

    setSubmitting(true);
    try {
      await orderApi.createOrder({
        contestId: contestIdNum,
        stockId: stock.stockId,
        stockCode: stock.stockCode,
        side: formState.side,
        orderType: formState.orderType,
        price: formState.orderType === 'LIMIT' ? orderPrice : undefined,
        quantity,
      });
      setErrorMessage('');
      setSuccessMessage('주문이 접수되었습니다');
      resetForm(formState.side);
    } catch (e) {
      setErrorMessage(parseApiError(e));
      setSuccessMessage('');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setSuccessMessage('');
    resetForm(formState.side);
  };

  if (loading) {
    return (
      <div className="px-4 pb-24 pt-4">
        <p className="py-12 text-center text-xs font-bold text-[#6C88A4]">불러오는 중...</p>
      </div>
    );
  }

  if (!stock) {
    return (
      <div className="px-4 pb-24 pt-4">
        <p className="py-12 text-center text-xs font-bold text-[#A3B4C6]">
          종목 정보를 불러올 수 없습니다.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 pt-4">
      <h1 className="mb-3 text-lg font-extrabold text-slate-950">주문</h1>

      <div className="space-y-3">
        <OrderSideTabs activeSide={formState.side} onChangeSide={handleChangeSide} />
        <OrderStockCard stock={stock} />
        <OrderTypeToggle orderType={formState.orderType} onChangeOrderType={handleChangeOrderType} />
        <OrderAmountForm
          errorMessage={errorMessage}
          formState={formState}
          onChangePrice={(price) => {
            setErrorMessage('');
            setSuccessMessage('');
            setFormState((current) => ({ ...current, price }));
          }}
          onChangeQuantity={(quantityValue) => {
            setErrorMessage('');
            setSuccessMessage('');
            setFormState((current) => ({ ...current, quantity: quantityValue }));
          }}
        />
        <OrderSummaryCard
          availableBalance={availableBalance}
          estimatedAmount={estimatedAmount}
          fee={fee}
          holdingQuantity={holdingQuantity}
        />

        <button
          className={cn(
            'h-12 w-full rounded-xl text-sm font-extrabold text-white shadow-sm transition disabled:opacity-60',
            isBuy ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1565C0] hover:bg-blue-700',
          )}
          disabled={submitting}
          onClick={handleSubmitOrder}
          type="button"
        >
          {submitting ? '처리 중...' : isBuy ? '매수 주문' : '매도 주문'}
        </button>
      </div>
      {successMessage ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-8">
          <button
            aria-label="주문 접수 안내 닫기"
            className="absolute inset-0 h-full w-full"
            onClick={handleCloseSuccessModal}
            type="button"
          />
          <section className="relative z-10 w-full max-w-xs rounded-2xl bg-white px-6 py-6 text-center shadow-xl">
            <p className="text-base font-extrabold text-slate-950">주문이 접수되었습니다</p>
            <button
              className="mt-6 h-11 w-full rounded-xl bg-[#1565C0] text-sm font-extrabold text-white transition hover:bg-blue-700"
              onClick={handleCloseSuccessModal}
              type="button"
            >
              확인
            </button>
          </section>
        </div>
      ) : null}
    </div>
  );
}
