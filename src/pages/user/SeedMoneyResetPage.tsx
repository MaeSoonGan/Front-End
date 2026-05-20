import { Button } from '../../components/common/Button';
import { PageContainer } from '../../components/common/PageContainer';

export function SeedMoneyResetPage() {
  const handleReset = () => {
    // TODO: API 연동 후 시드머니 초기화 요청과 보유 종목/주문 상태 검증을 처리합니다.
    console.log('mock seed money reset');
  };

  return (
    <PageContainer>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-[#1565C0]">시드머니 초기화</p>
        <h1 className="mt-2 text-xl font-extrabold text-slate-950">
          모의투자 금액을 처음 상태로 되돌릴 수 있어요
        </h1>
        <p className="mt-3 text-sm leading-6 text-[#6C88A4]">
          이 화면은 임시 더미 화면입니다. 실제 초기화 전에는 보유 종목, 미체결
          주문, 참여 중인 대회 정책을 확인한 뒤 안내 모달을 표시할 예정입니다.
        </p>

        <div className="mt-5 rounded-xl border border-orange-200 bg-orange-50 p-4 text-xs leading-5 text-orange-500">
          <p>초기화 후 시드머니는 기본 금액으로 복구돼요.</p>
          <p>실제 투자 기록 초기화는 API 연동 후 처리됩니다.</p>
        </div>

        <Button
          className="mt-6 h-12 w-full rounded-xl text-base font-bold"
          onClick={handleReset}
          variant="brand"
        >
          시드머니 초기화
        </Button>
      </section>
    </PageContainer>
  );
}
