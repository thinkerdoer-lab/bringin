import { useState } from 'react';
import { ArrowLeft, QrCode, Camera, Check } from 'lucide-react';

type Step = 'intro' | 'scanning' | 'success';

interface OwnerQRAuthProps {
  onComplete: (storeId: string) => void;
  onBack: () => void;
}

export function OwnerQRAuth({ onComplete, onBack }: OwnerQRAuthProps) {
  const [step, setStep] = useState<Step>('intro');
  const [storeName, setStoreName] = useState('');

  const handleScan = () => {
    setStep('scanning');
    
    // QR 스캔 시뮬레이션 (2초 후 성공)
    setTimeout(() => {
      const mockStoreId = 'store_' + Date.now();
      const mockStoreName = '브라운 카페';
      setStoreName(mockStoreName);
      setStep('success');
      
      // 1초 후 인증 완료
      setTimeout(() => {
        onComplete(mockStoreId);
      }, 1500);
    }, 2000);
  };

  if (step === 'intro') {
    return (
      <div className="h-screen bg-white flex flex-col">
        <header className="px-5 py-4 flex items-center border-b border-neutral-100">
          <button onClick={onBack} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-neutral-700" />
          </button>
          <span className="ml-3 text-neutral-900">사장님 인증</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
          <div className="w-20 h-20 bg-neutral-100 rounded-2xl flex items-center justify-center mb-6">
            <QrCode className="w-10 h-10 text-neutral-600" />
          </div>

          <div className="text-center space-y-3 mb-12">
            <div className="text-red-600">사장님 전용 QR을 스캔해주세요</div>
            <p className="text-neutral-600">
              사장님 전용 QR 코드를
              <br />
              스캔하면 관리자 권한이 부여됩니다
            </p>
          </div>

          <div className="w-full max-w-sm space-y-3 mb-8">
            <button
              onClick={handleScan}
              className="w-full bg-neutral-900 text-white py-4 rounded-xl hover:bg-neutral-800 transition-colors"
            >
              QR 스캔 시작하기
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-900 max-w-sm">
            <p className="mb-2">💡 사장님 인증 안내</p>
            <ul className="space-y-1 text-xs text-blue-800">
              <li>• 최초 1회만 인증하면 됩니다</li>
              <li>• QR은 매장 운영자 권한을 부여하는 수단입니다</li>
              <li>• 재인증은 로그아웃 시에만 필요합니다</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'scanning') {
    return (
      <div className="h-screen bg-neutral-900 flex flex-col">
        <header className="px-5 py-4 flex items-center">
          <button onClick={() => setStep('intro')} className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <span className="ml-3 text-white">QR 스캔 중</span>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center px-6">
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 border-2 border-white rounded-2xl" />
            <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-2xl" />
            
            <div className="absolute inset-0 flex items-center justify-center">
              <Camera className="w-12 h-12 text-white opacity-50" />
            </div>

            <div className="absolute top-1/3 left-0 right-0 h-0.5 bg-white opacity-50 animate-pulse" />
          </div>

          <p className="text-white text-center">
            QR 코드를 화면 안에 맞춰주세요
          </p>
        </div>
      </div>
    );
  }

  if (step === 'success') {
    return (
      <div className="h-screen bg-white flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
          <Check className="w-10 h-10 text-green-600" />
        </div>

        <div className="text-center space-y-2 mb-8">
          <div className="text-neutral-900">사장님 인증 완료</div>
          <p className="text-neutral-600">{storeName}</p>
          <p className="text-sm text-neutral-500">
            관리자 권한이 부여되었습니다
          </p>
        </div>

        <div className="w-16 h-1 bg-neutral-200 rounded-full overflow-hidden">
          <div className="h-full bg-neutral-900 animate-pulse" style={{ width: '100%' }} />
        </div>
      </div>
    );
  }

  return null;
}