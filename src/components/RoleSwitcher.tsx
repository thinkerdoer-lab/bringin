import { useState } from 'react';
import { ArrowLeft, User, Store, ChevronRight, QrCode } from 'lucide-react';
import { OwnerQRAuth } from './auth/OwnerQRAuth';

type View = 'menu' | 'qr-auth';

interface RoleSwitcherProps {
  currentRole: 'user' | 'owner';
  currentStoreId: string | null;
  onRoleSwitch: (role: 'user' | 'owner', storeId?: string) => void;
  onBack: () => void;
}

export function RoleSwitcher({
  currentRole,
  currentStoreId,
  onRoleSwitch,
  onBack,
}: RoleSwitcherProps) {
  const [view, setView] = useState<View>('menu');

  const handleOwnerSwitch = () => {
    if (currentStoreId) {
      // 이미 owner 권한이 있는 경우
      onRoleSwitch('owner', currentStoreId);
    } else {
      // QR 인증 필요
      setView('qr-auth');
    }
  };

  const handleQRAuthComplete = (storeId: string) => {
    onRoleSwitch('owner', storeId);
  };

  if (view === 'qr-auth') {
    return <OwnerQRAuth onComplete={handleQRAuthComplete} onBack={() => setView('menu')} />;
  }

  return (
    <div className="h-screen bg-neutral-50 flex flex-col">
      <header className="px-5 py-4 flex items-center bg-white border-b border-neutral-100">
        <button onClick={onBack} className="p-2 -ml-2">
          <ArrowLeft className="w-5 h-5 text-neutral-700" />
        </button>
        <span className="ml-3 text-neutral-900">설정</span>
      </header>

      <div className="px-5 py-6">
        <div className="text-sm text-neutral-500 mb-3">현재 화면</div>
        <div className="bg-white rounded-xl border border-neutral-200 p-5">
          <div className="flex items-center gap-3">
            {currentRole === 'user' ? (
              <User className="w-5 h-5 text-neutral-600" />
            ) : (
              <Store className="w-5 h-5 text-neutral-600" />
            )}
            <span className="text-neutral-900">
              {currentRole === 'user' ? '이용자 화면' : '사장님 화면'}
            </span>
          </div>
        </div>
      </div>

      <div className="px-5 pb-6">
        <div className="text-sm text-neutral-500 mb-3">화면 전환</div>
        <div className="bg-white rounded-xl border border-neutral-200 divide-y divide-neutral-100">
          <button
            onClick={() => onRoleSwitch('user')}
            disabled={currentRole === 'user'}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-neutral-600" />
              <div className="text-left">
                <div className="text-neutral-900">이용자로 전환</div>
                <div className="text-sm text-neutral-500">좌석 이용 화면</div>
              </div>
            </div>
            {currentRole !== 'user' && <ChevronRight className="w-5 h-5 text-neutral-400" />}
          </button>

          <button
            onClick={handleOwnerSwitch}
            disabled={currentRole === 'owner'}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <Store className="w-5 h-5 text-neutral-600" />
              <div className="text-left">
                <div className="text-neutral-900">사장님으로 전환</div>
                <div className="text-sm text-neutral-500">
                  {currentStoreId ? '좌석 관리 화면' : 'QR 인증 필요'}
                </div>
              </div>
            </div>
            {currentRole !== 'owner' && (
              <div className="flex items-center gap-2">
                {!currentStoreId && <QrCode className="w-4 h-4 text-neutral-400" />}
                <ChevronRight className="w-5 h-5 text-neutral-400" />
              </div>
            )}
          </button>
        </div>

        {!currentStoreId && (
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 mt-4">
            사장님 화면 이용을 위해서는 매장 QR 인증이 필요합니다
          </div>
        )}
      </div>
    </div>
  );
}