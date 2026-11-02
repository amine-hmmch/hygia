import React from 'react';
import { ArrowLeft } from 'lucide-react';

export const SubScreen: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({
  title,
  onBack,
  children,
}) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3 no-print">
      <button onClick={onBack} className="w-10 h-10 -ms-2 flex items-center justify-center text-sub" aria-label="Retour">
        <ArrowLeft className="w-5 h-5" />
      </button>
      <h2 className="text-lg font-semibold text-main leading-tight">{title}</h2>
    </div>
    {children}
  </div>
);
