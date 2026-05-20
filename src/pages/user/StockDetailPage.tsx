import { useParams } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { userHomeMock } from '../../mocks/userHomeMock';

export function StockDetailPage() {
  const { stockCode } = useParams();
  const stock = userHomeMock.watchlist.find((item) => item.code === stockCode);

  return (
    <PageContainer>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <p className="text-xs font-bold text-[#1565C0]">종목 상세</p>
        <h1 className="mt-2 text-2xl font-extrabold text-slate-950">
          {stock?.name ?? '알 수 없는 종목'}
        </h1>
        <p className="mt-1 text-sm text-[#6C88A4]">{stockCode}</p>

        <div className="mt-6 rounded-xl bg-[#F0F6FF] p-4">
          <p className="text-xs text-[#6C88A4]">현재가</p>
          <p className="mt-1 text-xl font-extrabold text-slate-950">
            {stock?.price ?? '-'}원
          </p>
          <p className="mt-1 text-sm font-bold text-[#1565C0]">
            등락률 {stock?.changeRate ?? '-'}
          </p>
        </div>

        <div className="mt-5 space-y-3 text-sm leading-6 text-slate-700">
          <p>
            이 화면은 종목 상세 기능 구현 전 사용하는 더미 화면입니다. 이후 차트,
            호가, 체결, 기업 정보 영역을 연결할 예정입니다.
          </p>
          <p>
            현재는 홈 화면의 실시간 순위 목록에서 선택한 종목 코드와 기본 가격
            정보만 표시합니다.
          </p>
        </div>
      </section>
    </PageContainer>
  );
}
