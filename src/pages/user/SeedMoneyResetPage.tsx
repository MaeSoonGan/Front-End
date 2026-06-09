import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { PageContainer } from '../../components/common/PageContainer';
import { portfolioApi } from '../../api/user/portfolio';
import { contestsApi } from '../../api/user/contests';
import { parseApiError } from '../../api/parseApiError';
import { cn } from '../../utils/cn';

interface ResetAccount {
  contestId: number; // 0 = 일반 계좌
  label: string;
  totalAsset: number; // RDS 현재 총자산
}

const GENERAL_ACCOUNT: ResetAccount = { contestId: 0, label: '일반 계좌', totalAsset: 0 };

function formatWon(value: number) {
  return `${value.toLocaleString('ko-KR')}원`;
}

export function SeedMoneyResetPage() {
  const navigate = useNavigate();
  const [isStockLossChecked, setIsStockLossChecked] = useState(false);
  const [isIrreversibleChecked, setIsIrreversibleChecked] = useState(false);
  const [modalStep, setModalStep] = useState<'select' | 'complete' | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [error, setError] = useState('');
  const [accounts, setAccounts] = useState<ResetAccount[]>([GENERAL_ACCOUNT]);
  const [selectedContestId, setSelectedContestId] = useState(0);
  const canResetSeedMoney = isStockLossChecked && isIrreversibleChecked;

  // 초기화 가능한 계좌 + 각 계좌의 현재 총자산.
  // 시드 초기화는 portfolio_snapshot만 갱신하므로, 그 값을 읽는 API로 조회해야 초기화가 즉시 반영됨:
  //   일반=getSummary().totalAsset, 대회=getContestAccount().currentAsset
  //   (getMyContests.currentAsset은 ranking 테이블 기준이라 초기화가 바로 안 반영됨)
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [summary, contests] = await Promise.all([
        portfolioApi.getSummary().catch(() => null),
        contestsApi.getMyContests({ status: 'ACTIVE', page: 0, size: 50 }).catch(() => null),
      ]);
      if (cancelled) return;

      const general: ResetAccount = {
        contestId: 0,
        label: '일반 계좌',
        totalAsset: Number(summary?.totalAsset ?? 0),
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const list: any[] = contests?.content ?? [];
      const contestAccounts: ResetAccount[] = await Promise.all(
        list.map(async (c) => {
          const acc = await portfolioApi.getContestAccount(Number(c.contestId)).catch(() => null);
          return {
            contestId: Number(c.contestId),
            label: c.title ?? '대회',
            totalAsset: Number(acc?.currentAsset ?? c.currentAsset ?? 0),
          };
        }),
      );
      if (cancelled) return;
      setAccounts([general, ...contestAccounts]);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleReset = async () => {
    if (!canResetSeedMoney) {
      return;
    }

    setIsResetting(true);
    setError('');
    try {
      await portfolioApi.resetSeedMoney({
        contestId: selectedContestId,
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
              <p className="text-sm font-extrabold text-slate-950">시드머니로 재시작</p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                선택한 계좌의 현금과 주식이 모두 초기 시드머니로 초기화돼요
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
                계좌별로 하루 1회 초기화할 수 있어요
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F0F6FF] text-sm">
              🏆
            </span>
            <div>
              <p className="text-sm font-extrabold text-orange-500">
                초기화할 계좌를 선택할 수 있어요
              </p>
              <p className="mt-1 text-xs font-bold text-[#6C88A4]">
                일반 계좌 또는 참여 중인 대회 중 골라서 초기화돼요
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
        onClick={() => {
          setSelectedContestId(0);
          setModalStep('select');
        }}
        variant="danger"
      >
        시드머니 초기화하기
      </Button>

      {error ? (
        <p className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-extrabold text-red-500">
          {error}
        </p>
      ) : null}

      {/* 계좌 선택 모달 */}
      <Modal
        cancelText="취소"
        confirmText={isResetting ? '처리 중...' : '초기화'}
        confirmDisabled={isResetting}
        confirmVariant="danger"
        description="초기화할 계좌를 선택하세요. 선택한 계좌의 보유 주식·현금이 사라지고 시드머니로 돌아갑니다."
        isOpen={modalStep === 'select'}
        onClose={() => {
          if (!isResetting) {
            setModalStep(null);
          }
        }}
        onConfirm={handleReset}
        title="초기화할 계좌 선택"
      >
        <div className="max-h-72 space-y-2 overflow-y-auto">
          {accounts.map((account) => {
            const selected = selectedContestId === account.contestId;
            return (
              <button
                className={cn(
                  'flex w-full cursor-pointer items-center justify-between rounded-xl border px-4 py-3 text-left transition',
                  selected ? 'border-[#1565C0] bg-[#F0F6FF]' : 'border-blue-100 bg-white hover:bg-[#F8FBFF]',
                )}
                key={account.contestId}
                onClick={() => setSelectedContestId(account.contestId)}
                type="button"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-slate-950">{account.label}</p>
                  <p className="mt-0.5 text-xs font-bold text-[#6C88A4]">현재 자산 {formatWon(account.totalAsset)}</p>
                </div>
                <span
                  className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                    selected ? 'border-[#1565C0]' : 'border-slate-300',
                  )}
                >
                  {selected ? <span className="h-2.5 w-2.5 rounded-full bg-[#1565C0]" /> : null}
                </span>
              </button>
            );
          })}
        </div>
      </Modal>

      {/* 완료 모달 */}
      <Modal
        confirmText="홈으로 이동"
        description="초기화되었습니다. 홈 화면으로 이동합니다."
        isOpen={modalStep === 'complete'}
        onClose={handleCompleteReset}
        onConfirm={handleCompleteReset}
        title="초기화 완료"
      />
    </PageContainer>
  );
}
