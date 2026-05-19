import { AuthCard } from '../../components/auth/AuthCard';
import { Button } from '../../components/common/Button';
import { PasswordInput } from '../../components/common/PasswordInput';
import { TextInput } from '../../components/common/TextInput';

export function LoginPage() {
  return (
    <AuthCard title="로그인 화면">
      <div className="space-y-4">
        <TextInput label="아이디" placeholder="아이디" />
        <PasswordInput label="비밀번호" placeholder="비밀번호" />
        <Button className="w-full">로그인</Button>
      </div>
    </AuthCard>
  );
}
