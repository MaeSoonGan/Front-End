import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { OrderAmountForm } from '../../components/user/OrderAmountForm';
import { OrderSideTabs } from '../../components/user/OrderSideTabs';
import { OrderStockCard } from '../../components/user/OrderStockCard';
import { OrderSummaryCard } from '../../components/user/OrderSummaryCard';
import { OrderTypeToggle } from '../../components/user/OrderTypeToggle';
import { orderAccountMock } from '../../mocks/orderMock';
import { stockMock, stockMocks } from '../../mocks/stockMock';
import type { OrderFormState, OrderSide, OrderStockInfo, OrderType } from '../../types/order';
import { cn } from '../../utils/cn';

function getInitialSide(side: string | null): OrderSide {
  return side === 'SELL' ? 'SELL' : 'BUY';
}

function getStockInfo(stockCode: string | null): OrderStockInfo {
  const stock = stockMocks.find((item) => item.summary.stockCode === stockCode) ?? stockMock;

  return {
    stockName: stock.summary.stockName,
    stockCode: stock.summary.stockCode,
    market: 'KOSPI',
    currentPrice: stock.summary.currentPrice,
    changeRate: stock.summary.changeRate,
  };
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
  const stock = useMemo(() => getStockInfo(searchParams.get('stockCode')), [searchParams]);
  const getInitialFormState = (side: OrderSide = getInitialSide(searchParams.get('side'))): OrderFormState => ({
    side,
    orderType: 'LIMIT',
    quantity: '',
    price: String(stock.currentPrice),
  });
  const [formState, setFormState] = useState<OrderFormState>({
    side: getInitialSide(searchParams.get('side')),
    orderType: 'LIMIT',
    quantity: '',
    price: String(stock.currentPrice),
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const quantity = parseNumber(formState.quantity);
  const orderPrice = formState.orderType === 'MARKET' ? stock.currentPrice : parseNumber(formState.price);
  const estimatedAmount = quantity * orderPrice;
  const fee = Math.round(estimatedAmount * orderAccountMock.feeRate);
  const estimatedTotal = estimatedAmount + fee;

  const handleChangeSide = (side: OrderSide) => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormState(getInitialFormState(side));
  };

  const handleChangeOrderType = (orderType: OrderType) => {
    setErrorMessage('');
    setSuccessMessage('');
    setFormState((current) => ({
      ...current,
      orderType,
      price: orderType === 'MARKET' ? String(stock.currentPrice) : current.price,
    }));
  };

  const handleSubmitOrder = () => {
    const nextErrorMessage = getOrderError({
      availableBalance: orderAccountMock.availableBalance,
      estimatedTotal,
      formState,
      holdingQuantity: orderAccountMock.holdingQuantity,
      price: orderPrice,
      quantity,
    });

    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      setSuccessMessage('');
      return;
    }

    const orderPayload = {
      stockCode: stock.stockCode,
      side: formState.side,
      orderType: formState.orderType,
      quantity,
      price: orderPrice,
      estimatedAmount,
      fee,
    };

    console.log('mock order submit', orderPayload);
    setErrorMessage('');
    setSuccessMessage('주문이 접수되었습니다');
    setFormState(getInitialFormState(formState.side));
  };

  const handleCloseSuccessModal = () => {
    setSuccessMessage('');
    setFormState(getInitialFormState(formState.side));
  };

  const isBuy = formState.side === 'BUY';

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
          availableBalance={orderAccountMock.availableBalance}
          estimatedAmount={estimatedAmount}
          fee={fee}
          holdingQuantity={orderAccountMock.holdingQuantity}
        />

        <button
          className={cn(
            'h-12 w-full rounded-xl text-sm font-extrabold text-white shadow-sm transition',
            isBuy ? 'bg-red-500 hover:bg-red-600' : 'bg-[#1565C0] hover:bg-blue-700',
          )}
          onClick={handleSubmitOrder}
          type="button"
        >
          {isBuy ? '매수 주문' : '매도 주문'}
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
