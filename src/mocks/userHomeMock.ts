export const userHomeMock = {
  userName: '홍길동',
  asset: {
    total: '11,245,320원',
    change: '+1,245,320원',
    rate: '+12.45%',
    cash: '3,245,200원',
    evaluation: '8,014,000원',
  },
  marketStatus: [
    { title: 'KOSPI', value: '2,847', changeRate: '+0.54%', icon: '📊' },
    { title: 'KOSDAQ', value: '893', changeRate: '-0.12%', icon: '📉' },
    { title: '장 상태', value: '운영중', changeRate: '~15:30', icon: '⏱️' },
  ],
  watchlist: [
    { name: '삼성전자', code: '005930', price: '75,400', changeRate: '+1.62%' },
    { name: 'SK하이닉스', code: '000660', price: '182,500', changeRate: '+2.8%' },
    { name: 'NAVER', code: '035420', price: '198,000', changeRate: '-0.5%' },
    { name: '현대차', code: '005380', price: '215,500', changeRate: '+0.9%' },
    { name: '카카오', code: '035720', price: '44,350', changeRate: '-1.1%' },
  ],
  activeContest: {
    id: 'spring-league-2026',
    type: '실전투자 리그',
    title: '5월 모의투자 챌린지',
    myAsset: '11,245,320원',
    rank: '12위',
    participants: '853명',
    endDate: 'D-8',
  },
};

export const userMoreMock = {
  userName: '홍길동',
  email: 'hong****',
  menus: [
    { title: '체결 이력', description: '주문과 체결 내역을 확인해요', icon: '📄', to: '/executions' },
    {
      title: '참여 중인 대회',
      description: '내가 참여한 대회 현황을 확인해요',
      icon: '🏆',
      to: '/my-contests',
    },
    { title: '알림', description: '가격과 대회 알림을 확인해요', icon: '🔔', to: '/notifications' },
    { title: '정보 수정', description: '프로필과 계정 정보를 관리해요', icon: '⚙️', to: '/profile/edit' },
    {
      title: '시드머니 초기화',
      description: '모의투자 시작 금액을 초기 상태로 되돌려요',
      icon: '💰',
      to: '/seed-money/reset',
    },
  ],
};
