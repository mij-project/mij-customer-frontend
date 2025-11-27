import React, { createContext, useContext, useEffect, useState } from 'react';
import { isAgeVerified, setAgeVerified, updateLastAccess } from '@/utils/ageVerification';

interface AgeVerificationContextType {
  isVerified: boolean;
  verifyAge: () => void;
  showVerification: boolean;
}

const AgeVerificationContext = createContext<AgeVerificationContextType | undefined>(undefined);

export const useAgeVerification = () => {
  const context = useContext(AgeVerificationContext);
  if (context === undefined) {
    throw new Error('useAgeVerification must be used within an AgeVerificationProvider');
  }
  return context;
};

interface AgeVerificationProviderProps {
  children: React.ReactNode;
}

export const AgeVerificationProvider: React.FC<AgeVerificationProviderProps> = ({ children }) => {
  const [isVerified, setIsVerified] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 初期化時に年齢確認状態をチェック
    const checkAgeVerification = () => {
      const verified = isAgeVerified();
      setIsVerified(verified);
      setShowVerification(!verified);
      setIsInitialized(true);

      if (verified) {
        // 確認済みの場合、最終アクセス時刻を更新
        updateLastAccess();
      }
    };

    checkAgeVerification();
  }, []);

  // ページアクセス時に最終アクセス時刻を更新
  useEffect(() => {
    if (isVerified) {
      updateLastAccess();
    }
  }, [isVerified]);

  const verifyAge = () => {
    setAgeVerified();
    setIsVerified(true);
    setShowVerification(false);
  };

  const value: AgeVerificationContextType = {
    isVerified,
    verifyAge,
    showVerification,
  };

  // 初期化が完了するまでは何も表示しない
  if (!isInitialized) {
    return null;
  }

  return (
    <AgeVerificationContext.Provider value={value}>{children}</AgeVerificationContext.Provider>
  );
};
