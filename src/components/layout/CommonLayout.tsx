import React from 'react';

interface CommonLayoutProps {
  children: React.ReactNode;
  header?: boolean;
}

export default function CommonLayout({ children, header }: CommonLayoutProps) {
  return (
    <div
      className={`w-full max-w-screen-md mx-auto bg-white space-y-6 ${header ? 'pt-16' : 'pt-5'}`}
    >
      <div className="min-h-screen bg-gray-50 pb-20">{children}</div>
    </div>
  );
}
