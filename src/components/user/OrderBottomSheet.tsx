import { X } from 'lucide-react';
import { useState } from 'react';
import { OrderAmountForm } from './OrderAmountForm';
import { OrderSideTabs } from './OrderSideTabs';
import { OrderStockCard } from './OrderStockCard';
import { OrderSummaryCard } from './OrderSummaryCard';
import { OrderTypeToggle } from './OrderTypeToggle';
import { orderAccountMock } from '../../mocks/orderMock';
import type { OrderFormState, OrderSide, OrderStockInfo, OrderType } from '../../types/order';
import { cn } from '../../utils/cn';

interface OrderBottomSheetProps {
  initialSide: OrderSide;
  isOpen: boolean;
  onClose: () => void;
  stock: OrderStockInfo;
}

function parseNumber(value: string) {
  return Number(value.replace(/\D/g, '')) || 0;
}

function getOrderError({
  estimatedTotal,
  formState,
  price,
  quantity,
}: {
  estimatedTotal: number;
  formState: OrderFormState;
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

  if (formState.side === 'BUY' && estimatedTotal > orderAccountMock.availableBalance) {
    return '주문 가능 금액을 초과했습니다';
  }

  if (formState.side === 'SELL' && quantity > orderAccountMock.holdingQuantity) {
    return '보유 수량을 초과하여 매도할 수 없습니다';
  }

  return '';
}

export function OrderBottomSheet({
  initialSide,
  isOpen,
  onClose,
  stock,
}: OrderBottomSheetProps) {
  const getInitialFormState = (side: OrderSide = initialSide): OrderFormState => ({
    side,
    orderType: 'LIMIT',
    quantity: '',
    price: String(stock.currentPrice),
  });
  const [formState, setFormState] = useState<OrderFormState>({
    side: initialSide,
    orderType: 'LIMIT',
    quantity: '',
    price: String(stock.currentPrice),
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) {
    return null;
  }

  const quantity = parseNumber(formState.quantity);
  const orderPrice = formState.orderType === 'MARKET' ? stock.currentPrice : parseNumber(formState.price);
  const estimatedAmount = quantity * orderPrice;
  const fee = Math.round(estimatedAmount * orderAccountMock.feeRate);
  const estimatedTotal = estimatedAmount + fee;
  const isBuy = formState.side === 'BUY';

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
      estimatedTotal,
      formState,
      price: orderPrice,
      quantity,
    });

    if (nextErrorMessage) {
      setErrorMessage(nextErrorMessage);
      setSuccessMessage('');
      return;
    }

    console.log('mock order submit', {
      stockCode: stock.stockCode,
      side: formState.side,
      orderType: formState.orderType,
      quantity,
      price: orderPrice,
      estimatedAmount,
      fee,
    });
    setErrorMessage('');
    setSuccessMessage('주문이 접수되었습니다');
    setFormState(getInitialFormState(formState.side));
  };

  const handleCloseSuccessModal = () => {
    setSuccessMessage('');
    setFormState(getInitialFormState(formState.side));
  };

  return (
    <div className="absolute inset-0 z-40 flex items-end bg-slate-950/35" role="presentation">
      <button aria-label="주문창 닫기" className="absolute inset-0 h-full w-full" onClick={onClose} type="button" />
      <section
        aria-modal="true"
        className="relative z-10 max-h-[88%] w-full animate-[orderSheetUp_180ms_ease-out] overflow-y-auto rounded-t-3xl bg-[#F3F7FC] p-4 pb-6 shadow-2xl"
        role="dialog"
      >
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-extrabold text-slate-950">{isBuy ? '매수 주문' : '매도 주문'}</h2>
          <button
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#6C88A4] hover:bg-white"
            onClick={onClose}
            type="button"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>

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
      </section>
      {successMessage ? (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-8">
          <button
            aria-label="주문 접수 안내 닫기"
            className="absolute inset-0 h-full w-full"
            onClick={() => setSuccessMessage('')}
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
