import { useState } from 'react';
import { PhoneLogin } from './PhoneLogin';
import { OwnerAuthFlow } from './OwnerAuthFlow';

type AuthStep = 'phone' | 'owner-auth';

interface AuthFlowProps {
  onAuthComplete: (data: {
    userId: string;
    role: 'user' | 'owner';
    storeId?: string;
    phoneNumber: string;
    autoLogin: boolean;
  }) => void;
  isQrEntry: boolean;
  onQREntry: () => void;
}

export function AuthFlow({ onAuthComplete, isQrEntry, onQREntry }: AuthFlowProps) {
  const [step, setStep] = useState<AuthStep>('phone');

  const handlePhoneAuthComplete = (data: {
    userId: string;
    phoneNumber: string;
    autoLogin: boolean;
    isNewUser: boolean;
    hasOwnerRole: boolean;
    storeId?: string;
  }) => {
    // 이미 owner 역할이 있는 경우
    if (data.hasOwnerRole && data.storeId) {
      onAuthComplete({
        userId: data.userId,
        role: 'owner',
        storeId: data.storeId,
        phoneNumber: data.phoneNumber,
        autoLogin: data.autoLogin,
      });
      return;
    }

    // 일반 사용자로 로그인
    onAuthComplete({
      userId: data.userId,
      role: 'user',
      phoneNumber: data.phoneNumber,
      autoLogin: data.autoLogin,
    });
  };

  const handleOwnerAuthComplete = (data: {
    userId: string;
    role: 'owner';
    storeId: string;
    phoneNumber: string;
    autoLogin: boolean;
  }) => {
    onAuthComplete(data);
  };

  if (step === 'phone') {
    return (
      <PhoneLogin
        onComplete={handlePhoneAuthComplete}
        isQrEntry={isQrEntry}
        onQREntry={onQREntry}
        onOwnerLogin={() => setStep('owner-auth')}
      />
    );
  }

  if (step === 'owner-auth') {
    return (
      <OwnerAuthFlow
        onAuthComplete={handleOwnerAuthComplete}
        onBack={() => setStep('phone')}
      />
    );
  }

  return null;
}