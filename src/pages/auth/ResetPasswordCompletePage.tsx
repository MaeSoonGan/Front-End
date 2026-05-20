import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { InfoBox } from '../../components/common/InfoBox';

const MOCK_MASKED_USER_ID = 'hong****';

function formatChangedAt(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}.${month}.${day} ${hours}:${minutes} 변경`;
}

export function ResetPasswordCompletePage() {
  const navigate = useNavigate();
  const changedAt = useMemo(() => formatChangedAt(new Date()), []);

  return (
    <Card className="flex min-h-screen w-full flex-col rounded-none border-0 shadow-none sm:min-h-[640px] sm:max-w-md sm:rounded-lg sm:border sm:shadow-sm">
      <div className="flex flex-1 flex-col items-center justify-center py-10">
        <div className="w-full">
          <div className="text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#E5F4FF] text-2xl">
              🎉
            </div>
            <h2 className="mt-6 text-xl font-bold text-slate-950">
              비밀번호가 변경됐어요
            </h2>
            <p className="mt-3 text-sm text-[#6C88A4]">
              새 비밀번호로 로그인할 수 있어요
            </p>
            <p className="mt-1 text-sm text-[#6C88A4]">
              보안을 위해 모든 기기에서 로그아웃 처리됐어요
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-blue-100 bg-[#E5F4FF] px-4 py-4 text-center text-xs text-[#6C88A4]">
            <p>변경 완료 계정</p>
            <p className="mt-1 text-base font-bold text-[#1565C0]">
              {MOCK_MASKED_USER_ID}
            </p>
            <p className="mt-1">{changedAt}</p>
          </div>

          <InfoBox className="mt-4 text-center" variant="warning">
            💡 비밀번호는 주기적으로 변경하면 계정을 더 안전하게 지킬 수 있어요
          </InfoBox>

          <div className="mt-8">
            <Button
              className="h-12 w-full rounded-xl text-base font-bold"
              onClick={() => navigate('/login')}
              variant="brand"
            >
              로그인하기
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
