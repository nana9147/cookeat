import {
  OrdersIcon,
  CancelIcon,
  RecipeIcon,
  PointIcon,
  UserIcon,
  LikeIcon,
  QuestionIcon,
  LogoutIcon,
  SecessionIcon,
  SellerIcon,
} from './CategoryIcons';

export const sections = [
  {
    title: '쇼핑',
    items: [
      { icon: <OrdersIcon />, label: '주문/배송 내역', href: '/mypage' },
      { icon: <CancelIcon />, label: '취소 / 반품', href: '/mypage/cancel' },
    ],
  },
  {
    title: '나의 활동',
    items: [
      { icon: <RecipeIcon />, label: '내 레시피', href: '/mypage/recipes' },
      { icon: <LikeIcon />, label: '찜 목록', href: '/mypage/likes' },
      { icon: <PointIcon />, label: '포인트', href: '/mypage/points' },
    ],
  },
  {
    title: '계정',
    items: [
      { icon: <UserIcon />, label: '개인정보 수정', href: '/mypage/profile' },
      { icon: <QuestionIcon />, label: '고객센터', href: '/mypage/support' },
      { icon: <SellerIcon />, label: '판매자 신청', href: '/mypage/sellerapply' },
    ],
  },
  {
    title: '',
    items: [
      { icon: <LogoutIcon />, label: '로그아웃', href: '/mypage/logout' },
      { icon: <SecessionIcon />, label: '회원탈퇴', href: '/mypage/withdraw' },
    ],
  },
];
