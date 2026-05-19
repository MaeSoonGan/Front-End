import { Card } from '../../components/common/Card';
import { PageHeader } from '../../components/common/PageHeader';
import { TextInput } from '../../components/common/TextInput';

export function ProfileEditPage() {
  return (
    <>
      <PageHeader title="프로필 수정 화면" description="사용자 정보를 수정할 영역입니다." />
      <Card className="space-y-4">
        <TextInput label="닉네임" placeholder="닉네임" />
        <TextInput label="이메일" placeholder="이메일" />
      </Card>
    </>
  );
}
