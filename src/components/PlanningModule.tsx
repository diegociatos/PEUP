import React, { useState } from 'react';
import PeupModule from './PeupModule';
import AnnualPlanningModule from './AnnualPlanningModule';
import AnnualHistoryModule from './AnnualHistoryModule';
import QuarterlyPlanningModule from './QuarterlyPlanningModule';
import MonthlyPlanningModule from './MonthlyPlanningModule';
import VerificacoesModule from './VerificacoesModule';
import { PEUP, Planejamento, Empresa, User, ColaboradorPrioridade, AuditLog, Reuniao } from '../types';

interface PlanningModuleProps {
  activePeup: PEUP | null;
  activeCompany: Empresa | null;
  activePlanejamento: Planejamento | null;
  peups: Record<string, PEUP>;
  setPeups: React.Dispatch<React.SetStateAction<Record<string, PEUP>>>;
  setPlanejamentos: React.Dispatch<React.SetStateAction<Record<string, Planejamento>>>;
  isEditing: boolean;
  setIsEditing: React.Dispatch<React.SetStateAction<boolean>>;
  users: User[];
  colaboradorPrioridades: ColaboradorPrioridade[];
  setColaboradorPrioridades: React.Dispatch<React.SetStateAction<ColaboradorPrioridade[]>>;
  auditLogs: AuditLog[];
  setAuditLogs: React.Dispatch<React.SetStateAction<AuditLog[]>>;
  reunioes: Reuniao[];
  currentUser: User;
}

export default function PlanningModule({ activePeup, activeCompany, activePlanejamento, peups, setPeups, setPlanejamentos, isEditing, setIsEditing, users, colaboradorPrioridades, setColaboradorPrioridades, auditLogs, setAuditLogs, reunioes, currentUser }: PlanningModuleProps) {
  const [activeTab, setActiveTab] = useState<'Estratégia' | 'Anual' | 'Trimestral' | 'Mensal' | 'Verificações'>('Estratégia');

  return (
    <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Planejamento</h2>
      
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {['Estratégia', 'Anual', 'Trimestral', 'Mensal', 'Verificações'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab as any)} className={`pb-4 ${activeTab === tab ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>{tab}</button>
        ))}
      </div>

      <div className="p-8 bg-gray-50 rounded-2xl border border-gray-100">
        {activeTab === 'Estratégia' && activePeup && activeCompany && (
          <PeupModule activePeup={activePeup} activeCompany={activeCompany} isEditing={isEditing} setIsEditing={setIsEditing} peups={peups} setPeups={setPeups} />
        )}
        {activeTab === 'Anual' && activePlanejamento && activeCompany && (
          <div className="space-y-8">
            <AnnualPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={activeCompany.id} auditLogs={auditLogs} setAuditLogs={setAuditLogs} reunioes={reunioes} currentUser={currentUser} />
            <AnnualHistoryModule activePlanejamento={activePlanejamento} />
          </div>
        )}
        {activeTab === 'Trimestral' && activePlanejamento && activeCompany && (
          <QuarterlyPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={activeCompany.id} currentUser={currentUser} />
        )}
        {activeTab === 'Mensal' && activePlanejamento && activeCompany && (
          <MonthlyPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={activeCompany.id} users={users} colaboradorPrioridades={colaboradorPrioridades} setColaboradorPrioridades={setColaboradorPrioridades} currentUser={currentUser} />
        )}
        {activeTab === 'Verificações' && activePlanejamento && activeCompany && (
          <VerificacoesModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={activeCompany.id} />
        )}
      </div>
    </section>
  );
}
