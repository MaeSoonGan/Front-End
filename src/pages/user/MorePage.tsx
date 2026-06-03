import { useNavigate } from 'react-router-dom';
import { PageContainer } from '../../components/common/PageContainer';
import { MenuCard } from '../../components/user/MenuCard';
import { useContestMode } from '../../contexts/ContestModeContext';
import { userMoreMock } from '../../mocks/userHomeMock';
import { clearTokens } from '../../utils/tokenStorage';

export function MorePage() {
  const navigate = useNavigate();
  const { getContestPath, isContestMode } = useContestMode();
  const menus = isContestMode
    ? userMoreMock.menus.filter((menu) => menu.to !== '/my-contests')
    : userMoreMock.menus;
  const accountMenus = userMoreMock.accountMenus;

  const handleLogout = () => {
    clearTokens();
    navigate('/login', { replace: true });
  };

  return (
    <PageContainer>
      <section className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#E5F4FF] text-lg font-extrabold text-[#1565C0]">
              {userMoreMock.userName.slice(0, 1)}
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-extrabold text-slate-950">
                {userMoreMock.userName} 님
              </p>
              <p className="mt-1 truncate text-xs text-[#6C88A4]">{userMoreMock.email}</p>
            </div>
          </div>
          <button
            className="h-8 shrink-0 rounded-full border border-[#1565C0] bg-white px-3 text-xs font-extrabold text-[#1565C0] transition hover:bg-[#E5F4FF]"
            onClick={() => navigate(isContestMode ? getContestPath('/profile/edit') : '/profile/edit')}
            type="button"
          >
            정보 수정
          </button>
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
        <div className="space-y-3">
          {accountMenus.map((menu) => (
            <MenuCard
              description={menu.description}
              icon={menu.icon}
              key={menu.title}
              title={menu.title}
              to={isContestMode ? getContestPath(menu.to) : menu.to}
            />
          ))}
        </div>
        <MenuCard
          className="mt-3"
          description="현재 기기에서 로그아웃해요"
          icon="🚪"
          onClick={handleLogout}
          title="로그아웃"
        />
      </section>
    </PageContainer>
  );
}
