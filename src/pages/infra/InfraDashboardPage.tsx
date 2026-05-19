import { MetricCard } from '../../components/infra/MetricCard';

export function InfraDashboardPage() {
  return (
    <>
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-white">인프라 대시보드 화면</h1>
        <p className="mt-2 text-sm text-slate-400">클라우드 관제 지표를 표시할 영역입니다.</p>
      </header>
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard label="서비스 상태" value="준비중" />
        <MetricCard label="API 상태" value="준비중" />
        <MetricCard label="배포 상태" value="준비중" />
      </div>
    </>
  );
}
