import { useState, useEffect, useMemo } from 'react';
import { Empresa, PEUP, Planejamento, KPI, Reuniao, User, ColaboradorPrioridade, Acao, TipoReuniao, ValorEmpresa, AuditLog } from './types';
import { getPeupData, savePeupData } from './lib/data';
import { canAccess, isReadOnly } from './lib/permissions';
import HistoricoConquistasModule from './components/HistoricoConquistasModule';
import MetaIndividualModule from './components/MetaIndividualModule';
import { LayoutDashboard, Target, CalendarDays, Calendar, BarChart3, Users, Settings, LogOut, CheckCircle2, Award, Bell, Building } from 'lucide-react';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, onSnapshot, query, where, doc, setDoc, getDocs } from 'firebase/firestore';
import DashboardAdmin from './components/DashboardAdmin';
import DashboardIndividual from './components/DashboardIndividual';
import DashboardGestor from './components/DashboardGestor';
import DashboardSocio from './components/DashboardSocio';
import PeupModule from './components/PeupModule';
import AnnualPlanningModule from './components/AnnualPlanningModule';
import QuarterlyPlanningModule from './components/QuarterlyPlanningModule';
import SwotAnalysisModule from './components/SwotAnalysisModule';
import RockefellerCheckinModule from './components/RockefellerCheckinModule';
import MonthlyPlanningModule from './components/MonthlyPlanningModule';
import KpiModule from './components/KpiModule';
import VerificacoesModule from './components/VerificacoesModule';
import ReuniaoModule from './components/ReuniaoModule';
import SettingsModule from './components/SettingsModule';
import Login from './components/Login';
import ChangePassword from './components/ChangePassword';
import HistoryGrowthModule from './components/HistoryGrowthModule';
import GestaoProdutividade from './components/GestaoProdutividade';
import StepperBar from './components/StepperBar';

const initialCompanies: Empresa[] = [];

const initialPeups: Record<string, PEUP> = {};

const initialPlanejamentos: Record<string, Planejamento> = {};

const initialAcoes: Acao[] = [];

const initialMetas: any[] = [];

const initialUsers: User[] = [];

export default function App() {
  useEffect(() => {
    if (!localStorage.getItem('peup_meta_anual')) {
      localStorage.setItem('peup_meta_anual', JSON.stringify([
        { pilar: 'Financeiro', indicador: 'Faturamento', ouro: 1000000 },
        { pilar: 'Clientes', indicador: 'Clientes', ouro: 200 },
        { pilar: 'Pessoas', indicador: 'Faturamento', ouro: 5 },
        { pilar: 'Eficiência', indicador: 'Margem', ouro: 20 }
      ]));

      localStorage.setItem('peup_meta_trimestral', JSON.stringify([
        { pilar: 'Financeiro', ouro: 250000, recompensas: { bronze: '500', prata: '1000', ouro: '2000' } },
        { pilar: 'Clientes', ouro: 50, recompensas: { bronze: '500', prata: '1000', ouro: '2000' } },
        { pilar: 'Pessoas', ouro: 2, recompensas: { bronze: '500', prata: '1000', ouro: '2000' } },
        { pilar: 'Eficiência', ouro: 5, recompensas: { bronze: '500', prata: '1000', ouro: '2000' } }
      ]));

      localStorage.setItem('peup_metas_individuais', JSON.stringify([
        { colaboradorId: 'João Colaborador', pilar: 'Financeiro', indicador: 'Faturamento', ouro: 50000, realizado: 10000 }
      ]));

      localStorage.setItem('peup_acoes', JSON.stringify([
        { titulo: 'Ligar para 10 clientes', responsavelId: 'João Colaborador', prazo: new Date().toISOString(), status: 'pendente' },
        { titulo: 'Atualizar CRM', responsavelId: 'João Colaborador', prazo: new Date(Date.now() + 86400000).toISOString(), status: 'pendente' }
      ]));
    }
  }, []);

  const [companies, setCompanies] = useState<Empresa[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userToChange, setUserToChange] = useState<User | null>(null);
  const [metas, setMetas] = useState<any[]>(initialMetas);
  const [isEditing, setIsEditing] = useState(false);
  const [acoes, setAcoes] = useState<Acao[]>(initialAcoes);
  const [colaboradorPrioridades, setColaboradorPrioridades] = useState<ColaboradorPrioridade[]>([]);
  const [reunioes, setReunioes] = useState<Reuniao[]>([]);
  const [tiposReuniao, setTiposReuniao] = useState<TipoReuniao[]>([]);
  const [valoresEmpresa, setValoresEmpresa] = useState<ValorEmpresa[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [aiResponse, setAiResponse] = useState('');
  const [activeCompany, setActiveCompany] = useState<Empresa | null>(null);
  const [peups, setPeups] = useState<Record<string, PEUP>>({});
  const [planejamentos, setPlanejamentos] = useState<Record<string, Planejamento>>({});
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [activeView, setActiveView] = useState<'Dashboard' | 'Estratégia' | 'Anual' | 'Trimestral' | 'Mensal' | 'KPIs' | 'HistoricoConquistas' | 'Reuniões' | 'Desempenho' | 'Gestão de Produtividade' | 'Configurações'>('Dashboard');

  const ADMIN_EMAILS = ['diegociatos@gmail.com', 'diego.garcia@grupociatos.com.br'];

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      console.log("AUTH_STATE_CHANGED", user ? `User: ${user.uid}` : "Logged out");
      if (user) {
        console.log("Attempting to fetch user document for UID:", user.uid);
        const userDocRef = collection(db, 'users');
        const q = query(userDocRef, where('id', '==', user.uid));
        const unsubUser = onSnapshot(q, async (snapshot) => {
          console.log("USER_SNAPSHOT_SIZE", snapshot.size);
          if (!snapshot.empty) {
            const userData = snapshot.docs[0].data() as User;
            console.log("USER_DATA_FOUND", userData);
            setCurrentUser(userData);
            if (userData.primeiro_acesso) {
              setUserToChange(userData);
              setIsLoggedIn(false);
            } else {
              setIsLoggedIn(true);
            }
          } else {
            console.warn("USER_SNAPSHOT_EMPTY for uid:", user.uid);
            // Auto-create admin doc for known admin emails
            if (user.email && ADMIN_EMAILS.includes(user.email)) {
              const adminUser: User = {
                id: user.uid,
                nome: user.email.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
                email: user.email,
                role: 'ADMIN',
                empresa_id: '',
                primeiro_acesso: false,
              };
              await setDoc(doc(db, 'users', user.uid), adminUser);
              console.log("AUTO_CREATED_ADMIN", adminUser);
            }
          }
        }, (error) => {
          console.error("USER_SNAPSHOT_ERROR", error.code, error.message);
        });
        // We need to store this unsubscribe function somewhere
        (window as any).unsubUser = unsubUser;
      } else {
        setIsLoggedIn(false);
        setCurrentUser(null);
        if ((window as any).unsubUser) {
          (window as any).unsubUser();
          (window as any).unsubUser = null;
        }
      }
    });
    return () => {
      unsubscribeAuth();
      if ((window as any).unsubUser) {
        (window as any).unsubUser();
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;

    const unsubCompanies = onSnapshot(collection(db, 'companies'), (snapshot) => {
      const companiesData = snapshot.docs.map(doc => doc.data() as Empresa);
      setCompanies(companiesData);
      localStorage.setItem('peup_companies', JSON.stringify(companiesData));
      console.log("FIRESTORE_SYNC_COMPANIES", companiesData.length);
    });

    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => doc.data() as User);
      setUsers(usersData);
      localStorage.setItem('peup_users', JSON.stringify(usersData));
      console.log("FIRESTORE_SYNC_USERS", usersData.length);
    });

    return () => {
      unsubCompanies();
      unsubUsers();
    };
  }, [isLoggedIn]);

  const filteredUsers = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return users;
    // Corrigido: Sócio agora vê apenas usuários da sua empresa
    return users.filter(u => u.empresa_id === currentUser.empresa_id);
  }, [users, currentUser]);

  const filteredAcoes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return acoes;
    if (currentUser.role === 'SOCIO') return acoes.filter(a => filteredUsers.some(u => u.id === a.responsavelId));
    if (currentUser.role === 'GESTOR') {
      const myTeam = filteredUsers.filter(u => u.id === currentUser.id || u.responsavelDiretoId === currentUser.id);
      return acoes.filter(a => myTeam.some(u => u.id === a.responsavelId));
    }
    return acoes.filter(a => a.responsavelId === currentUser.id);
  }, [acoes, currentUser, filteredUsers]);

  const filteredPrioridades = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN') return colaboradorPrioridades;
    if (currentUser.role === 'SOCIO') return colaboradorPrioridades.filter(p => filteredUsers.some(u => u.id === p.colaboradorId));
    if (currentUser.role === 'GESTOR') {
      const myTeam = filteredUsers.filter(u => u.responsavelDiretoId === currentUser.id);
      return colaboradorPrioridades.filter(p => myTeam.some(u => u.id === p.colaboradorId));
    }
    return colaboradorPrioridades.filter(p => p.colaboradorId === currentUser.id);
  }, [colaboradorPrioridades, currentUser, filteredUsers]);

  const filteredReunioes = useMemo(() => {
    if (!currentUser) return [];
    if (currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') return reunioes;
    return reunioes.filter(r => r.participantes.includes(currentUser.nome));
  }, [reunioes, currentUser]);

  useEffect(() => {
    const metasSalvas = localStorage.getItem('peup_metas_individuais');
    if (metasSalvas) {
        try {
            setMetas(JSON.parse(metasSalvas));
        } catch (e) {
            console.error("Failed to parse metas", e);
        }
    }
  }, []);

  const handleAiAction = async (action: string) => {
    setAiResponse(`Análise de ${action} em progresso... (Simulação)`);
  };
  
  const activePeup = activeCompany ? peups[activeCompany.id] : null;
  const activePlanejamento = activeCompany ? planejamentos[activeCompany.id] : null;
  
  useEffect(() => {
    console.log("activeCompany:", activeCompany);
    console.log("planejamentos:", planejamentos);
    console.log("activePlanejamento:", activePlanejamento);
  }, [activeCompany, planejamentos, activePlanejamento]);

  const menuItems = [
    { name: 'Dashboard', view: 'Dashboard', icon: LayoutDashboard },
    { name: 'Estratégia', view: 'Estratégia', icon: Target },
    { name: 'Meta Anual', view: 'Anual', icon: CalendarDays },
    { name: 'Meta Trimestral', view: 'Trimestral', icon: CalendarDays },
    { name: 'Análise SWOT', view: 'SWOT', icon: BarChart3 },
    { name: 'Check-in Semanal', view: 'Checkin', icon: CheckCircle2 },
    { name: 'Planejamento Mensal', view: 'Mensal', icon: Calendar },
    { name: 'Meta Individual', view: 'Desempenho', icon: Award },
    { name: 'Gestão de Produtividade', view: 'Gestão de Produtividade', icon: BarChart3 },
    { name: 'Reuniões', view: 'Reuniões', icon: Users },
    { name: 'Configurações', view: 'Configurações', icon: Settings },
  ] as const;

  const handleNavigate = (view: string) => {
    if (currentUser.role === 'COLABORADOR' && view === 'Configurações') {
      setActiveView('Dashboard');
      return;
    }
    if (view === 'Trimestral' && (!activePlanejamento || activePlanejamento.historico_anual.length === 0)) {
      alert("Defina primeiro suas metas anuais");
      return;
    }
    setActiveView(view as any);
  };

  return (
    <div className="h-screen bg-[--color-bg] text-[--color-text-main] flex font-sans">
      {!isLoggedIn ? (
        userToChange ? (
          <ChangePassword user={userToChange} onPasswordChanged={(user) => {
            setCurrentUser(user);
            setIsLoggedIn(true);
            setUserToChange(null);
          }} />
        ) : (
          <Login onLogin={async () => {
            // Fallback: se onAuthStateChanged não disparar (ex: mesmo user já logado),
            // buscar o doc diretamente
            const user = auth.currentUser;
            if (user) {
              const q2 = query(collection(db, 'users'), where('id', '==', user.uid));
              const snap = await getDocs(q2);
              if (!snap.empty) {
                const userData = snap.docs[0].data() as User;
                setCurrentUser(userData);
                if (userData.primeiro_acesso) {
                  setUserToChange(userData);
                } else {
                  setIsLoggedIn(true);
                }
              }
            }
          }} />
        )
      ) : (
        <>
          <aside className="fixed left-0 top-0 w-[280px] bg-[#630d16] h-screen flex flex-col z-50">
            <div className="p-10 text-white">
              <span className="block text-3xl font-bold">PEUP Gestão</span>
            </div>
            <nav className="flex-grow p-4 space-y-2">
              {menuItems.filter(item => {
                if (item.view === 'Checkin') return currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR';
                return canAccess(currentUser.role, item.view);
              }).map(item => {
                const isActive = activeView === item.view;
                return (
                  <button 
                    key={item.view} 
                    onClick={() => handleNavigate(item.view)} 
                    style={isActive ? { backgroundColor: '#4a0a10', color: '#FFFFFF' } : {}}
                    className={`w-full flex items-center gap-4 px-5 py-3 rounded-lg transition-all duration-200 ${!isActive ? 'text-white hover:bg-[#4a0a10]' : ''}`}
                  >
                    <item.icon size={20} />
                    <span className="text-[14px] font-medium">{item.name}</span>
                  </button>
                );
              })}
            </nav>
            <div className="p-6 border-t border-white/10">
              <button onClick={() => { signOut(auth); setIsLoggedIn(false); setCurrentUser(null); }} className="w-full flex items-center gap-4 px-5 py-3 text-white hover:bg-[#4a0a10] rounded-lg transition-colors">
                <LogOut size={20} />
                <span className="text-[14px]">Sair</span>
              </button>
            </div>
          </aside>
          <div className="ml-[280px] flex-grow overflow-y-auto">
            <header className="bg-white p-6 flex justify-between items-center sticky top-0 z-10 border-b border-[--color-border]">
              <div className="flex items-center gap-4">
                <h1 className="font-semibold">{activeCompany?.nome || 'Selecione uma empresa'}</h1>
                {companies.length > 0 && (
                  <select 
                    className="text-sm border rounded p-1"
                    value={activeCompany?.id || ''}
                    onChange={(e) => {
                      const company = companies.find(c => c.id === e.target.value);
                      if (company) {
                        setActiveCompany(company);
                        localStorage.setItem('peup_active_company_id', company.id);
                      }
                    }}
                  >
                    {!activeCompany && <option value="">Selecione uma empresa</option>}
                    {currentUser.role === 'ADMIN' 
                      ? companies.map(c => <option key={`admin-${c.id}`} value={c.id}>{c.nome}</option>)
                      : companies
                          .filter(c => users.some(u => u.id === currentUser.id && (u.empresa_id === c.id || u.empresaId === c.id)))
                          .map(c => <option key={`user-${c.id}`} value={c.id}>{c.nome}</option>)
                    }
                  </select>
                )}
              </div>
              <div className="flex items-center gap-4">
                <button className="text-gray-500 hover:text-[#630d16] transition-colors">
                    <Bell size={20} />
                </button>
                <div className="flex items-center gap-2">
                    <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser.nome)}&background=random`} alt={currentUser.nome} className="w-10 h-10 rounded-full border border-gray-200" />
                    <span className="text-sm font-medium text-gray-700">{currentUser.nome.split(' ')[0]}</span>
                </div>
              </div>
            </header>

            <main className="p-8">
              <StepperBar activeView={activeView} />
              
              {activeView === 'Dashboard' && (
                currentUser.role === 'ADMIN' ? (
                  <DashboardAdmin currentUser={currentUser} users={users} setUsers={setUsers} companies={companies} setCompanies={setCompanies} />
                ) : currentUser.role === 'SOCIO' ? (
                  <DashboardSocio currentUser={currentUser} />
                ) : currentUser.role === 'GESTOR' ? (
                  <DashboardGestor currentUser={currentUser} users={filteredUsers} />
                ) : (
                  <DashboardIndividual user={currentUser} />
                )
              )}

              {activeView === 'Estratégia' && activePeup && activeCompany && (
                <PeupModule activePeup={activePeup} activeCompany={activeCompany} isEditing={isEditing} setIsEditing={setIsEditing} peups={peups} setPeups={setPeups} readOnly={isReadOnly(currentUser.role, 'Estratégia')} />
              )}

              {activeView === 'Anual' && activePlanejamento && activeCompany && (
                <AnnualPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={currentUser.empresa_id || ''} auditLogs={auditLogs} setAuditLogs={setAuditLogs} reunioes={reunioes} currentUser={currentUser} />
              )}

              {activeView === 'Trimestral' && activePlanejamento && activeCompany && (
                <QuarterlyPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={currentUser.empresa_id || ''} currentUser={currentUser} />
              )}

              {activeView === 'Historico' && activePlanejamento && (
                <HistoryGrowthModule activePlanejamento={activePlanejamento} />
              )}

              {activeView === 'SWOT' && activePlanejamento && activeCompany && (
                <SwotAnalysisModule 
                  swot={activePlanejamento.historico_trimestral.find(h => h.trimestre === 'Q1')?.swot || { strengths: [], weaknesses: [], opportunities: [], threats: [] }} 
                  onSave={(swot) => {
                    setPlanejamentos((prev: any) => ({
                      ...prev,
                      [activeCompany.id]: {
                        ...prev[activeCompany.id],
                        historico_trimestral: prev[activeCompany.id].historico_trimestral.map((h: any) => h.trimestre === 'Q1' ? { ...h, swot } : h)
                      }
                    }));
                  }}
                  currentUser={currentUser}
                />
              )}

              {activeView === 'Checkin' && (
                <RockefellerCheckinModule currentUser={currentUser} />
              )}

              {(() => {
                console.log("Renderizando Mensal (Depuração - FORÇADO):", { 
                    activeView, 
                    hasPlanejamento: !!activePlanejamento, 
                    activePlanejamento: activePlanejamento,
                    hasCompany: !!activeCompany,
                    activeCompany: activeCompany
                });
                // Forçando renderização se activeView for 'Mensal'
                if (activeView === 'Mensal') {
                    return (
                      <MonthlyPlanningModule activePlanejamento={activePlanejamento} setPlanejamentos={setPlanejamentos} empresaId={currentUser.empresa_id || ''} users={filteredUsers} colaboradorPrioridades={filteredPrioridades} setColaboradorPrioridades={setColaboradorPrioridades} currentUser={currentUser} />
                    );
                }
                return null;
              })()}

              {activeView === 'KPIs' && activePlanejamento && (
                <KpiModule activePlanejamento={activePlanejamento} />
              )}

              {activeView === 'HistoricoConquistas' && activePlanejamento && (
                <HistoricoConquistasModule activePlanejamento={activePlanejamento} users={filteredUsers} />
              )}

              {activeView === 'Reuniões' && (
                <ReuniaoModule 
                  reunioes={filteredReunioes} 
                  setReunioes={setReunioes} 
                  currentUser={currentUser} 
                  users={users} 
                  empresas={companies.map(c => ({ id: c.id, nome: c.nome }))}
                  setPlanejamentos={setPlanejamentos}
                  metas={metas}
                  setMetas={setMetas}
                  tiposReuniao={tiposReuniao}
                />
              )}

              {activeView === 'Desempenho' && (
                <MetaIndividualModule 
                  activePlanejamento={activePlanejamento!}
                  users={users} 
                  currentUser={currentUser}
                  acoes={acoes}
                />
              )}

              {activeView === 'Gestão de Produtividade' && activePlanejamento && (
                <GestaoProdutividade 
                  activePlanejamento={activePlanejamento}
                  users={filteredUsers}
                  acoes={acoes}
                  currentUser={currentUser}
                />
              )}

              {activeView === 'Configurações' && (
                <SettingsModule users={users} setUsers={setUsers} companies={companies} setCompanies={setCompanies} currentUser={currentUser} tiposReuniao={tiposReuniao} setTiposReuniao={setTiposReuniao} valoresEmpresa={valoresEmpresa} setValoresEmpresa={setValoresEmpresa} />
              )}
            </main>
          </div>
        </>
      )}
    </div>
  );
}
