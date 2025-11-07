import React from 'react';
import AuthLayout from './AuthLayout';
import ProgressBar from '@/components/ui/progress-bar';

interface VerificationLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    current: boolean;
  }>;
}

export default function VerificationLayout({
  children,
  currentStep,
  totalSteps,
  steps,
}: VerificationLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <ProgressBar currentStep={currentStep} totalSteps={totalSteps} steps={steps} />
      <AuthLayout>{children}</AuthLayout>
    </div>
  );
}
