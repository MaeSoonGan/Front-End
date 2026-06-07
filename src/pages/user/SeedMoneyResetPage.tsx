import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { portfolioApi } from '../../api/user/portfolio';
import { parseApiError } from '../../api/parseApiError';

export function SeedMoneyResetPage() {
  const navigate = useNavigate();
  const [isStockLossChecked, setIsStockLossChecked] = useState(false);
  const [isIrreversibleChecked, setIsIrreversibleChecked] = useState(false);
  const [modalStep, setModalStep] = useState<'confirm' | 'complete' | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const canResetSeedMoney = isStockLossChecked && isIrreversibleChecked;

  const handleReset = async () => {
    if (!canResetSeedMoney) {
      return;
    }

    setIsResetting(true);
    setError('');
    try {
      await portfolioApi.resetSeedMoney({
        holdingsAndCashResetAgreed: isStockLossChecked,
        irreversibleAgreed: isIrreversibleChecked,
      });
      setModalStep('complete');
    } catch (e) {
      setError(parseApiError(e));
      setModalStep(null);
    } finally {
      setIsResetting(false);
    }
  };

  const handleCompleteReset = () => {
    setModalStep(null);
    navigate('/home', { replace: true });
  };

  return (
    <PageContainer className="min-h-full bg-[#F3F7FC] pt-4">
      <section className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
        <h2 className="text-base font-extrabold text-slate-950">초기화하면 어떻게 되나요?</h2>
        <div className="mt-4 space-y-4">
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-sm">
              💰
            </span>
            <div>
              <p className="text-sm font-extrabold text-slate-950">
                시드머니 1,000만원으로 재시작
              </p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                현재 보유한 현금과 주식이 모두 초기화돼요
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-sm">
              📊
            </span>
            <div>
              <p className="text-sm font-extrabold text-red-500">
                체결 이력은 삭제되지 않아요
              </p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                기존 거래 기록은 이력에 남아 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-sm">
              ⏱️
            </span>
            <div>
              <p className="text-sm font-extrabold text-red-500">하루에 1번만 가능해요</p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                오늘 사용 가능 횟수: 1회
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-sm">
              🏆
            </span>
            <div>
              <p className="text-sm font-extrabold text-orange-500">
                대회 자산은 영향받지 않아요
              </p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                참여 중인 대회의 자산은 별도 관리돼요
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm">
        <p className="text-sm font-extrabold text-red-500">초기화 전 확인해주세요</p>
        <label className="mt-4 flex items-start gap-2 text-xs font-bold leading-5 text-slate-700">
          <input
            checked={isStockLossChecked}
            className="mt-1 h-4 w-4 shrink-0 accent-[#1565C0]"
            onChange={(event) => setIsStockLossChecked(event.target.checked)}
            type="checkbox"
          />
          현재 보유한 주식과 현금이 모두 사라지는 것을 이해했어요
        </label>
        <label className="mt-3 flex items-start gap-2 text-xs font-bold leading-5 text-slate-700">
          <input
            checked={isIrreversibleChecked}
            className="mt-1 h-4 w-4 shrink-0 accent-[#1565C0]"
            onChange={(event) => setIsIrreversibleChecked(event.target.checked)}
            type="checkbox"
          />
          이 작업은 되돌릴 수 없다는 것을 이해했어요
        </label>
      </section>

      <Button
        className="mt-3 h-12 w-full rounded-2xl bg-rose-600 text-sm font-extrabold text-white hover:bg-rose-700 disabled:bg-rose-300"
        disabled={!canResetSeedMoney}
        onClick={() => setModalStep('confirm')}
        variant="danger"
      >
        시드머니 초기화하기
      </Button>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-extrabold text-red-500">
          {error}
        </p>
      ) : null}

      <Modal
        cancelText={modalStep === 'confirm' ? '취소' : undefined}
        confirmText={
          modalStep === 'confirm' ? (isResetting ? '처리 중...' : '확인') : '홈으로 이동'
        }
        confirmDisabled={isResetting}
        confirmVariant={modalStep === 'confirm' ? 'danger' : 'brand'}
        description={
          modalStep === 'confirm'
            ? '시드머니를 초기화하면 현재 보유한 주식과 현금이 초기화됩니다. 계속 진행할까요?'
            : '초기화되었습니다. 홈 화면으로 이동합니다.'
        }
        isOpen={modalStep !== null}
        onClose={() => {
          if (!isResetting) {
            setModalStep(null);
          }
        }}
        onConfirm={modalStep === 'confirm' ? handleReset : handleCompleteReset}
        title={modalStep === 'confirm' ? '시드머니 초기화' : '초기화 완료'}
      />
    </PageContainer>
  );
}
