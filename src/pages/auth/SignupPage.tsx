import { AuthCard } from '../../components/auth/AuthCard';
import { Button } from '../../components/common/Button';
import { TextInput } from '../../components/common/TextInput';

export function SignupPage() {
  return (
    <AuthCard title="회원가입 화면">
      <div className="space-y-4">
        <TextInput label="이름" placeholder="이름" />
        <TextInput label="이메일" placeholder="이메일" />
        <Button className="w-full">회원가입</Button>
      </div>
    </AuthCard>
  );
}
