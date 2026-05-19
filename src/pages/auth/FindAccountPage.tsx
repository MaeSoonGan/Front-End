import { AuthCard } from '../../components/auth/AuthCard';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';

export function FindAccountPage() {
  return (
    <AuthCard title="계정 찾기 화면">
      <div className="space-y-4">
        <TextInput label="이메일" placeholder="가입한 이메일" />
        <Button className="w-full">계정 찾기</Button>
      </div>
    </AuthCard>
  );
}
