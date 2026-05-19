import { useParams } from 'react-router-dom';
import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';

export function ContestRankingPage() {
  const { contestId } = useParams();

  return (
    <>
      <PageHeader title="대회 랭킹 화면" description={`대회 ID: ${contestId ?? '-'}`} />
      <Card>대회 랭킹 placeholder</Card>
    </>
  );
}
