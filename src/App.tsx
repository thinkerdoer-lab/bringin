import { useState, useEffect } from 'react';
import { AuthFlow } from './components/auth/AuthFlow';
import { QREntryFlow } from './components/QREntryFlow';
import { UserFlowA } from './components/UserFlowA';
import { OwnerDashboard } from './components/OwnerDashboard';
import { RoleSwitcher } from './components/RoleSwitcher';
import { MyPage } from './components/MyPage';
import { OwnerConfirmModal } from './components/OwnerConfirmModal';
import { CurrentUsageModal } from './components/CurrentUsageModal';
import { CopyableAddress } from './components/CopyableAddress';
import { User, ChevronRight } from 'lucide-react';

type UserRole = 'user' | 'owner';

interface AuthState {
  isLoggedIn: boolean;
  phoneNumber: string;
  role: UserRole | null;
}

export interface SeatTypeSetting {
  id: string;
  capacity: number; // 인석 (1, 2, 3...)
  count: number; // 좌석 개수
}

export interface AllowedFood {
  id: string;
  name: string;
  isCustom: boolean; // 직접 입력한 음식인지 여부
}

// 등록된 개별 좌석 정보
export interface RegisteredSeat {
  id: string;
  capacity: number; // 1인석, 2인석 등
  isOpen: boolean; // 오픈 여부 (false=검은색, true=초록색)
  inUse: boolean; // 이용 중 여부 (true=회색)
  usageInfo?: {
    userName: string;
    startTime: Date;
    people: number;
    orderType: 'payment' | 'verify';
  };
}

export interface UsageHistory {
  id: string;
  cafeName: string;
  cafeAddress: string;
  visitDate: Date;
  drinkOrdered: string;
  duration: number; // 분 단위
  status: 'waiting' | 'current' | 'completed'; // waiting: 결제 완료 대기 중, current: 이용 중, completed: 완료
  seatType?: string; // 선택한 좌석 유형
  startTime?: Date; // 실제 이용 시작 시각 (사장님 확인 후)
  paymentTime?: Date; // 결제 완료 시각
}

type MainView = 'home' | 'user-a' | 'qr-entry' | 'owner' | 'role-switcher' | 'mypage';
type EntryMode = 'normal' | 'qr';

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isLoggedIn: false,
    phoneNumber: '',
    role: null,
  });
  const [entryMode, setEntryMode] = useState<EntryMode>('normal');
  const [mainView, setMainView] = useState<MainView>('home');
  const [seatTypeSettings, setSeatTypeSettings] = useState<SeatTypeSetting[]>([
    { id: '1', capacity: 1, count: 2 },
    { id: '2', capacity: 2, count: 3 },
  ]);
  const [allowedFoods, setAllowedFoods] = useState<AllowedFood[]>([
    { id: '1', name: '빵/디저트', isCustom: false },
  ]);

  // 팝업 상태 관리
  const [showOwnerConfirmModal, setShowOwnerConfirmModal] = useState(false);
  const [selectedCafeName, setSelectedCafeName] = useState('');
  const [selectedUsageId, setSelectedUsageId] = useState<string | null>(null);
  const [showCurrentUsageModal, setShowCurrentUsageModal] = useState(false);

  // 등록된 좌석 목록 (네모 박스 방식)
  const [registeredSeats, setRegisteredSeats] = useState<RegisteredSeat[]>([
    // 초기 샘플 데이터
    { id: '1', capacity: 2, isOpen: true, inUse: true, usageInfo: { userName: '김OO', startTime: new Date(Date.now() - 45 * 60 * 1000), people: 2, orderType: 'payment' } },
    { id: '2', capacity: 1, isOpen: true, inUse: true, usageInfo: { userName: '이OO', startTime: new Date(Date.now() - 20 * 60 * 1000), people: 1, orderType: 'verify' } },
    { id: '3', capacity: 2, isOpen: true, inUse: false },
    { id: '4', capacity: 1, isOpen: false, inUse: false },
  ]);

  // 이용 내역
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([
    {
      id: '2',
      cafeName: '그린 카페',
      cafeAddress: '서울시 서초구 서초대로 456',
      visitDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      drinkOrdered: '카페라떼',
      duration: 90,
      status: 'completed',
    },
    {
      id: '3',
      cafeName: '블루 커피',
      cafeAddress: '서울시 송파구 올림픽로 789',
      visitDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      drinkOrdered: '바닐라라떼',
      duration: 60,
      status: 'completed',
    },
  ]);

  // URL 기반 진입 경로 판단
  useEffect(() => {
    const url = new URL(window.location.href);
    const pathSegments = url.pathname.split('/').filter(Boolean);
    const storeIdFromPath = pathSegments[0] === 'qr' ? pathSegments[1] : null;
    const storeIdFromQuery = url.searchParams.get('store_id') || url.searchParams.get('qr_id');
    
    const detectedStoreId = storeIdFromPath || storeIdFromQuery;

    if (detectedStoreId) {
      // QR 진입
      setEntryMode('qr');
      setMainView('qr-entry');
    } else {
      // 일반 진입
      setEntryMode('normal');
      setMainView('home');
    }
  }, []);

  const handleAuthComplete = (data: {
    phoneNumber: string;
    role: UserRole;
    autoLogin: boolean;
  }) => {
    setAuthState({
      isLoggedIn: true,
      phoneNumber: data.phoneNumber,
      role: data.role,
    });

    // 역할에 따라 초기 화면 설정
    if (data.role === 'owner') {
      setMainView('owner');
    } else {
      setMainView('home');
    }
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setAuthState((prev) => ({
      ...prev,
      role: newRole,
    }));

    if (newRole === 'owner') {
      setMainView('owner');
    } else {
      setMainView('home');
    }
  };

  const handleLogout = () => {
    setAuthState({
      isLoggedIn: false,
      phoneNumber: '',
      role: null,
    });
    setMainView('home');
  };

  const handleQREntryExit = () => {
    // QR 진입 페이지에서 "아니요" 선택 시
    // 서비스 홈으로 이동, QR 진입 모드 해제
    setEntryMode('normal');
    setMainView('home');
  };

  const handleOwnerConfirm = () => {
    if (!selectedUsageId) {
      setShowOwnerConfirmModal(false);
      return;
    }
    setUsageHistory((prev) =>
      prev.map((usage) =>
        usage.id === selectedUsageId
          ? { ...usage, status: 'current', startTime: new Date() }
          : usage
      )
    );
    setShowOwnerConfirmModal(false);
    setSelectedUsageId(null);
  };

  const selectedUsage = selectedUsageId
    ? usageHistory.find((usage) => usage.id === selectedUsageId) || null
    : null;

  // QR 진입 플로우 (QR 스캔으로 들어온 경우에만)
  if (mainView === 'qr-entry' && entryMode === 'qr') {
    return (
      <QREntryFlow
        onComplete={handleAuthComplete}
        onExit={handleQREntryExit}
      />
    );
  }

  // 인증되지 않은 경우 로그인 화면
  if (!authState.isLoggedIn) {
    return (
      <AuthFlow
        onAuthComplete={handleAuthComplete}
        isQrEntry={entryMode === 'qr'}
        onQREntry={() => setMainView('qr-entry')}
      />
    );
  }

  // 역할 전환 화면
  if (mainView === 'role-switcher') {
    return (
      <RoleSwitcher
        currentRole={authState.role!}
        onRoleSwitch={handleRoleSwitch}
        onBack={() => setMainView(authState.role === 'owner' ? 'owner' : 'home')}
      />
    );
  }

  // 마이페이지 화면
  if (mainView === 'mypage') {
    return (
      <MyPage
        phoneNumber={authState.phoneNumber}
        usageHistory={usageHistory}
        onBack={() => setMainView('home')}
      />
    );
  }

  // 사장님 화면
  if (authState.role === 'owner') {
    return (
      <OwnerDashboard
        onBack={() => setMainView('home')}
        onLogout={handleLogout}
        onRoleSwitch={() => setMainView('role-switcher')}
        seatTypeSettings={seatTypeSettings}
        onSeatTypeSettingsChange={setSeatTypeSettings}
        registeredSeats={registeredSeats}
        onRegisteredSeatsChange={setRegisteredSeats}
        allowedFoods={allowedFoods}
        onAllowedFoodsChange={setAllowedFoods}
        usageHistory={usageHistory}
        onUsageStart={(usageId) => {
          // 이용 대기 중인 항목을 '이용 중'으로 변경
          setUsageHistory((prev) =>
            prev.map((usage) =>
              usage.id === usageId
                ? { ...usage, status: 'current', startTime: new Date() }
                : usage
            )
          );
        }}
      />
    );
  }

  // 이용자 플로우 A
  if (mainView === 'user-a') {
    return (
      <UserFlowA
        onBack={() => setMainView('home')}
        onLogout={handleLogout}
        onRoleSwitch={() => setMainView('role-switcher')}
        seatTypeSettings={seatTypeSettings}
        allowedFoods={allowedFoods}
        onPaymentComplete={(usageData) => {
          // 결제 완료 후 'waiting' 상태로 이용 내역 추가
          const newUsage: UsageHistory = {
            id: `usage-${Date.now()}`,
            cafeName: usageData.cafeName,
            cafeAddress: usageData.cafeAddress,
            visitDate: usageData.visitDate, // 결제 완료 시각
            drinkOrdered: usageData.drinkOrdered,
            seatType: usageData.seatType,
            duration: 0,
            status: 'waiting', // 이용 대기 중
            paymentTime: usageData.visitDate,
          };
          setUsageHistory((prev) => [newUsage, ...prev]);
        }}
        usageHistory={usageHistory}
      />
    );
  }

  // 이용자 홈 화면
  // 전화번호 마스킹 함수
  const maskPhoneNumber = (phone: string) => {
    // 010-1234-5678 형태라고 가정
    const parts = phone.split('-');
    if (parts.length === 3) {
      return `${parts[0]}-****-${parts[2]}`;
    }
    // 하이픈 없이 01012345678 형태인 경우
    if (phone.length === 11) {
      return `${phone.slice(0, 3)}-****-${phone.slice(7)}`;
    }
    return phone;
  };

  // 날짜 포맷 함수
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
  };

  // 완료된 이용 내역만 필터링 (최대 2개)
  const recentCompletedUsage = usageHistory
    .filter((h) => h.status === 'completed')
    .slice(0, 2);

  // 현재 이용 중이거나 대기 중인 카페 필터링
  const currentUsage = usageHistory.filter((h) => h.status === 'current' || h.status === 'waiting');

  return (
    <div className="h-screen bg-neutral-50 flex flex-col overflow-y-auto">
      {/* 상단 헤더 */}
      <header className="px-5 py-4 bg-white border-b border-neutral-100 flex items-center justify-between sticky top-0 z-10">
        <div className="text-neutral-900 font-medium">브링인</div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-neutral-500">
            {maskPhoneNumber(authState.phoneNumber)}
          </div>
          <button
            onClick={() => setMainView('mypage')}
            className="p-2 -mr-2 hover:bg-neutral-50 rounded-full transition-colors"
            aria-label="마이페이지"
          >
            <User className="w-5 h-5 text-neutral-600" />
          </button>
        </div>
      </header>

      {/* 메인 영역 */}
			<div className="flex-1 px-5 py-6 space-y-4">
				<p className="text-neutral-900 text-center mb-6">
					좌석 이용 시간은 2시간이며<br/>
					카페마다 이용 규칙은 다를 수 있습니다.
				</p>
        {/* 주요 CTA */}
        <button
          onClick={() => setMainView('user-a')}
          className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors">
          지금 이용 가능한 카페 보기
        </button>

        {/* 현재 이용 중 */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100">
          <div className="text-sm text-neutral-900 mb-3">현재 이용 중</div>
          {currentUsage.length === 0 ? (
            <div className="text-center py-6">
              <p className="text-sm text-neutral-400">현재 이용 중인 카페가 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {currentUsage.map((usage) => {
                const isWaiting = usage.status === 'waiting';
                const borderColor = isWaiting ? 'border-amber-200' : 'border-green-600';
                const bgColor = isWaiting ? 'bg-amber-50' : 'bg-green-50';
                const badgeColor = isWaiting ? 'text-amber-700 bg-white border-amber-600' : 'text-green-600 bg-white border-green-600';
                const statusText = isWaiting ? '이용 대기 중' : '이용 중';
                const dividerColor = isWaiting ? 'border-amber-200' : 'border-green-200';

                return (
                  <div
                    key={usage.id}
                    onClick={() => {
                      if (isWaiting) {
                        setSelectedCafeName(usage.cafeName);
                        setSelectedUsageId(usage.id);
                        setShowOwnerConfirmModal(true);
                      } else {
                        setSelectedUsageId(usage.id);
                        setShowCurrentUsageModal(true);
                      }
                    }}
                    className={`p-4 border ${borderColor} rounded-xl ${bgColor} ${isWaiting ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-neutral-900">{usage.cafeName}</h3>
                        <p className="text-sm text-neutral-500 mt-1">{usage.cafeAddress}</p>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full border ${badgeColor}`}>
                        {statusText}
                      </span>
                    </div>
                    <div className={`mt-3 pt-3 border-t ${dividerColor} text-sm space-y-1`}>
                      {isWaiting ? (
                        <>
                          <div className="flex justify-between text-neutral-600">
                            <span>선택 좌석</span>
                            <span>{usage.seatType}</span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>주문 음료</span>
                            <span>{usage.drinkOrdered}</span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>결제 시각</span>
                            <span>{usage.paymentTime ? formatDate(usage.paymentTime) : '-'}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between text-neutral-600">
                            <span>이용 시작</span>
                            <span>{usage.startTime ? formatDate(usage.startTime) : formatDate(usage.visitDate)}</span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>주문 음료</span>
                            <span>{usage.drinkOrdered}</span>
                          </div>
                          <div className="flex justify-between text-neutral-600">
                            <span>이용 시간</span>
                            <span>{usage.duration}분</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 이용 내역 요약 */}
        <div className="bg-white rounded-2xl p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm text-neutral-900">이용 내역</div>
            <button
              onClick={() => setMainView('mypage')}
              className="text-xs text-neutral-500 flex items-center gap-1 hover:text-neutral-900 transition-colors"
            >
              전체보기
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-4">
            {recentCompletedUsage.map((usage) => (
              <div
                key={usage.id}
                className="p-4 border border-neutral-200 rounded-xl bg-white"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="text-neutral-900">{usage.cafeName}</h3>
                    <p className="text-sm text-neutral-500 mt-1">
                      <CopyableAddress
                        address={usage.cafeAddress}
                        className="text-sm text-neutral-500 mt-1"
                      />
                    </p>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-neutral-100 text-sm space-y-1">
                  <div className="flex justify-between text-neutral-600">
                    <span>방문 일시</span>
                    <span>{formatDate(usage.visitDate)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>주문 음료</span>
                    <span>{usage.drinkOrdered}</span>
                  </div>
                </div>
              </div>
            ))}
            {recentCompletedUsage.length === 0 && (
              <div className="text-center py-6">
                <p className="text-sm text-neutral-400">이용 내역이 아직 없어요</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 사장님 확인 팝업 */}
      <OwnerConfirmModal
        isOpen={showOwnerConfirmModal}
        onClose={() => setShowOwnerConfirmModal(false)}
        onConfirm={handleOwnerConfirm}
        cafeName={selectedCafeName}
      />
      <CurrentUsageModal
        isOpen={showCurrentUsageModal}
        onClose={() => setShowCurrentUsageModal(false)}
        usage={selectedUsage}
        allowedFoods={allowedFoods}
      />
    </div>
  );
}