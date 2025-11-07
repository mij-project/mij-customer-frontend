import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: Array<{
    id: number;
    title: string;
    completed: boolean;
    current: boolean;
  }>;
  className?: string;
}

export default function ProgressBar({
  currentStep,
  totalSteps,
  steps,
  className,
}: ProgressBarProps) {
  const progressPercentage = ((currentStep - 1) / (totalSteps - 1)) * 100;

  return (
    <div className={cn('w-full bg-white border-b border-gray-200 py-4', className)}>
      <div className="max-w-4xl mx-auto px-4">
        <div className="relative mb-4">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-2 bg-primary rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${Math.max(0, Math.min(100, progressPercentage))}%` }}
            />
          </div>
        </div>

        <div className="flex justify-between">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium mb-2',
                  step.completed
                    ? 'bg-primary text-white'
                    : step.current
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-600'
                )}
              >
                {step.completed ? '✓' : step.id}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
