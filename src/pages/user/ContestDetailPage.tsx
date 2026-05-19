import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';

export function ContestDetailPage() {
  const { contestId } = useParams();

  return (
    <>
      <PageHeader title="대회 상세 화면" description={`대회 ID: ${contestId ?? '-'}`} />
      <Card>대회 상세 placeholder</Card>
    </>
  );
}
