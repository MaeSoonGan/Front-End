import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';

export function BalancePage() {
  return (
    <>
      <PageHeader title="잔고 화면" description="보유 자산과 잔고를 표시할 영역입니다." />
      <Card>잔고 placeholder</Card>
    </>
  );
}
