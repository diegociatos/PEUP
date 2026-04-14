import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { RockefellerHabit, RockefellerCheckin, User } from '../types';

const HABITOS: RockefellerHabit[] = [
  { id: 1, titulo: 'Reuniões Diárias (Daily Huddles)', acoes: ['Participar da reunião diária pontualmente', 'Compartilhar progresso e obstáculos', 'Atualizar o quadro de tarefas'] },
  { id: 2, titulo: 'Reuniões Semanais (Weekly Meetings)', acoes: ['Revisar indicadores-chave (KPIs)', 'Avaliar progresso das metas', 'Resolver problemas identificados'] },
  { id: 3, titulo: 'Reuniões Mensais (Monthly Meetings)', acoes: ['Analisar resultados do mês', 'Ajustar planos conforme necessário', 'Comunicar aprendizados à equipe'] },
  { id: 4, titulo: 'Reuniões Trimestrais (Quarterly Meetings)', acoes: ['Revisar metas trimestrais', 'Planejar o próximo trimestre', 'Alinhar estratégia com a equipe'] },
  { id: 5, titulo: 'Reuniões Anuais (Annual Planning)', acoes: ['Definir metas anuais', 'Estabelecer visão e estratégia de longo prazo', 'Comunicar objetivos para toda a empresa'] },
  { id: 6, titulo: 'Métricas Claras e Visíveis', acoes: ['Atualizar KPIs diariamente', 'Revisar indicadores antes das reuniões', 'Reportar desvios imediatamente'] },
  { id: 7, titulo: 'Responsabilidade e Checklists', acoes: ['Definir responsabilidades claras para cada membro', 'Utilizar checklists para garantir execução', 'Monitorar cumprimento das tarefas'] },
  { id: 8, titulo: 'Comunicação Transparente', acoes: ['Compartilhar informações abertamente', 'Discutir desafios e sucessos em equipe', 'Promover feedback constante'] },
  { id: 9, titulo: 'Foco em Prioridades', acoes: ['Definir prioridades claras para o período', 'Evitar dispersão em múltiplas tarefas', 'Concentrar esforços no que gera resultado'] },
  { id: 10, titulo: 'Cultura de Melhoria Contínua', acoes: ['Incentivar aprendizagem constante', 'Coletar feedback regularmente', 'Adaptar processos rapidamente'] },
];

interface RockefellerCheckinProps {
  currentUser: User;
}

export default function RockefellerCheckinModule({ currentUser }: RockefellerCheckinProps) {
  const [checkin, setCheckin] = useState<RockefellerCheckin>({
    id: Date.now().toString(),
    semana: 15, // Exemplo
    ano: 2026,
    respostas: HABITOS.map(h => ({ habitId: h.id, checkedActions: [], comentario: '' })),
    autorId: currentUser.id,
    data: new Date().toISOString()
  });
  const [success, setSuccess] = useState(false);

  const toggleAction = (habitId: number, actionIndex: number) => {
    setCheckin(prev => ({
      ...prev,
      respostas: prev.respostas.map(r => r.habitId === habitId ? {
        ...r,
        checkedActions: r.checkedActions.includes(actionIndex) ? r.checkedActions.filter(i => i !== actionIndex) : [...r.checkedActions, actionIndex]
      } : r)
    }));
  };

  const updateComentario = (habitId: number, comentario: string) => {
    setCheckin(prev => ({
      ...prev,
      respostas: prev.respostas.map(r => r.habitId === habitId ? { ...r, comentario } : r)
    }));
  };

  const saveCheckin = () => {
    localStorage.setItem('peup_rockefeller_checkin', JSON.stringify({ ...checkin, data: new Date().toISOString() }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-2xl font-serif font-bold text-[#630d16] mb-2">Questionário Semanal dos 10 Hábitos de Rockefeller</h2>
      <p className="text-gray-600 mb-6">Preencha para acompanhar a execução da equipe e garantir disciplina na gestão.</p>
      {success && <p className="text-green-600 mb-4 flex items-center gap-2"><CheckCircle2 size={18}/> Check-in salvo com sucesso!</p>}
      
      <div className="space-y-8">
        {HABITOS.map(habit => {
          const resposta = checkin.respostas.find(r => r.habitId === habit.id)!;
          return (
            <div key={habit.id} className="border-b border-gray-100 pb-6">
              <h3 className="font-bold text-lg text-gray-800 mb-3">Hábito {habit.id}: {habit.titulo}</h3>
              <div className="space-y-2 mb-4">
                {habit.acoes.map((acao, index) => (
                  <label key={index} className="flex items-center gap-3 text-sm text-gray-700 cursor-pointer">
                    <input type="checkbox" checked={resposta.checkedActions.includes(index)} onChange={() => toggleAction(habit.id, index)} className="rounded text-[#630d16] focus:ring-[#630d16]" />
                    {acao}
                  </label>
                ))}
              </div>
              <textarea placeholder="Comentários (opcional)" value={resposta.comentario} onChange={e => updateComentario(habit.id, e.target.value)} className="w-full p-3 rounded-lg border border-gray-200 text-sm" />
            </div>
          );
        })}
      </div>
      <button onClick={saveCheckin} className="mt-8 w-full bg-[#630d16] text-white py-3 rounded-xl font-semibold hover:bg-[#4a0a11] flex items-center justify-center gap-2">
        <Save size={18}/> Salvar Respostas
      </button>
    </div>
  );
}
