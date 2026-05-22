import { Navigate, useParams } from 'react-router-dom';

export function ContestDetailPage() {
  const { contestId } = useParams();

  return <Navigate replace to={`/contests/${contestId ?? ''}/home`} />;
}
