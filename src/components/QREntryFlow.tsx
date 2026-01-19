import { useState } from 'react';
import { QrCode, Home, ArrowLeft } from 'lucide-react';
import { PhoneLogin } from './auth/PhoneLogin';
import { QRUserFlow } from './QRUserFlow';

type Step = 'welcome' | 'decline-info' | 'login' | 'user-flow';

interface QREntryFlowProps {
  onComplete: (data: {
    userId: string;
    role: 'user' | 'owner';
    storeId?: string;
    phoneNumber: string;
    autoLogin: boolean;
  }) => void;
  onExit: () => void;
  storeId: string | null;
}

export function QREntryFlow({ onComplete, onExit, storeId }: QREntryFlowProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [authData, setAuthData] = useState<any>(null);

  const handleAccept = () => {
    setStep('login');
  };

  const handleDecline = () => {
    setStep('decline-info');
  };

  const handleLoginComplete = (data: {
    userId: string;
    phoneNumber: string;
    autoLogin: boolean;
    isNewUser: boolean;
    hasOwnerRole: boolean;
    storeId?: string;
  }) => {
    setAuthData(data);
    setStep('user-flow');
  };

  const handleFlowComplete = () => {
    if (!authData) return;

    onComplete({
      userId: authData.userId,
      role: 'user',
      phoneNumber: authData.phoneNumber,
      autoLogin: authData.autoLogin,
    });
  };

  if (step === 'welcome') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <QrCode className="w-10 h-10 text-neutral-600" />
          </div>

          <div className="text-center space-y-3 mb-12">
            <div className="text-neutral-900">브라운 카페</div>
            <p className="text-neutral-600">
              한가한 시간, 음료 주문으로 열리는 자리
              <br />
              외부 음식 반입이 가능합니다
            </p>
          </div>

          <div className="w-full max-w-sm mb-8">
            <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 text-center">
              <p className="text-neutral-900">
                지금 이 자리에서
                <br />
                외부 음식을 이용하고 싶으신가요?
              </p>
            </div>
          </div>

          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={handleAccept}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              네, 이용할게요
            </button>

            <button
              onClick={handleDecline}
              className="w-full bg-white text-neutral-900 py-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
            >
              아니요
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'decline-info') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={() => setStep('welcome')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
            <Home className="w-8 h-8 text-neutral-600" />
          </div>

          <div className="text-center space-y-3 mb-12">
            <div className="text-neutral-900">필요할 때 언제든 이용할 수 있어요</div>
            <p className="text-neutral-600">
              외부 음식 반입이 가능한 좌석이
              <br />
              열려 있을 때 이용해보세요
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3 mb-8">
            <button
              onClick={onExit}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              확인
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 max-w-sm text-center">
            홈 화면에 추가하면 다음에 더 빠르게 이용할 수 있어요
          </div>
        </div>
      </div>
    );
  }

  if (step === 'login') {
    return (
      <PhoneLogin
        onComplete={handleLoginComplete}
        isQrEntry={true}
        onQREntry={() => {}}
      />
    );
  }

  if (step === 'user-flow' && authData) {
    return <QRUserFlow onComplete={handleFlowComplete} />;
  }

  return null;
}