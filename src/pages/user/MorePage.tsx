import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { MenuCard } from '../../components/user/MenuCard';
import { useContestMode } from '../../contexts/ContestModeContext';
import { userMoreMock } from '../../mocks/userHomeMock';

export function MorePage() {
  const navigate = useNavigate();
  const { getContestPath, isContestMode } = useContestMode();
  const menus = isContestMode
    ? userMoreMock.menus.filter((menu) => menu.to !== '/my-contests')
    : userMoreMock.menus;

  const handleLogout = () => {
    // TODO: authStore/API 연동 후 실제 로그아웃과 토큰 정리를 처리합니다.
    console.log('mock logout');
    window.sessionStorage.removeItem('mockAuthStatus');
    navigate('/login', { replace: true });
  };

  return (
    <PageContainer>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#E5F4FF] text-lg font-extrabold text-[#1565C0]">
            {userMoreMock.userName.slice(0, 1)}
          </div>
          <div>
            <p className="text-base font-extrabold text-slate-950">
              {userMoreMock.userName} 님
            </p>
            <p className="mt-1 text-xs text-[#6C88A4]">{userMoreMock.email}</p>
          </div>
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-950">내 메뉴</h2>
        <div className="space-y-3">
          {menus.map((menu) => (
            <MenuCard
              description={menu.description}
              icon={menu.icon}
              key={menu.title}
              title={menu.title}
              to={isContestMode ? getContestPath(menu.to) : menu.to}
            />
          ))}
        </div>
      </section>

      <section className="mt-5">
        <h2 className="mb-3 text-base font-extrabold text-slate-950">계정</h2>
        <MenuCard
          description="현재 기기에서 로그아웃해요"
          icon="🚪"
          onClick={handleLogout}
          title="로그아웃"
        />
      </section>
    </PageContainer>
  );
}
