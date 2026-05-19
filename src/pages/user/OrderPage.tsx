import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';

export function OrderPage() {
  return (
    <>
      <PageHeader title="주문 화면" description="매수와 매도 주문을 입력할 영역입니다." />
      <Card>주문 입력 placeholder</Card>
    </>
  );
}
