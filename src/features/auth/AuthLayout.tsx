import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 bg-white">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg p-8">{children}</div>
      </div>
    </div>
  );
}
