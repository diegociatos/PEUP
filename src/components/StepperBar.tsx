import React from 'react';

interface StepperBarProps {
  activeView: string;
}

export default function StepperBar({ activeView }: StepperBarProps) {
  const steps = [
    { name: 'Estratégia', views: ['Estratégia'] },
    { name: 'Meta Anual', views: ['Anual'] },
    { name: 'Trimestre Atual', views: ['Trimestral'] },
    { name: 'Ações do Mês', views: ['Mensal', 'Ações'] },
  ];

  return (
    <div className="flex items-center gap-4 mb-8">
      {steps.map((step, index) => {
        const isActive = step.views.includes(activeView);
        return (
          <React.Fragment key={step.name}>
            <div className={`px-4 py-2 rounded-full text-sm font-medium ${isActive ? 'bg-white text-[#4A0E0E] shadow-sm' : 'text-gray-500'}`}>
              {step.name}
            </div>
            {index < steps.length - 1 && <span className="text-gray-400">→</span>}
          </React.Fragment>
        );
      })}
    </div>
  );
}
