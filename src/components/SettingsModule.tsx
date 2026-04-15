import React, { useState } from 'react';
import { User, Role, Empresa, TipoReuniao, ValorEmpresa } from '../types';
import { UserPlus, Trash2, Shield, Building2, Bell, Palette, Calendar, Save, Plus, Check, X, CheckCircle } from 'lucide-react';
import UserManagementModule from './UserManagementModule';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

interface SettingsModuleProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  companies: Empresa[];
  setCompanies: React.Dispatch<React.SetStateAction<Empresa[]>>;
  currentUser: User;
  tiposReuniao: TipoReuniao[];
  setTiposReuniao: React.Dispatch<React.SetStateAction<TipoReuniao[]>>;
  valoresEmpresa: ValorEmpresa[];
  setValoresEmpresa: React.Dispatch<React.SetStateAction<ValorEmpresa[]>>;
}

export default function SettingsModule({ users, setUsers, companies, setCompanies, currentUser, tiposReuniao, setTiposReuniao, valoresEmpresa, setValoresEmpresa }: SettingsModuleProps) {
  const [activeTab, setActiveTab] = useState<'users' | 'companies' | 'general' | 'meetingTypes' | 'companyValues'>('users');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newSocioEmail, setNewSocioEmail] = useState('');
  const [newSocioPassword, setNewSocioPassword] = useState('');
  const [newTipoNome, setNewTipoNome] = useState('');
  const [editingTipoId, setEditingTipoId] = useState<string | null>(null);
  const [editingTipoNome, setEditingTipoNome] = useState('');
  const [newValorNome, setNewValorNome] = useState('');
  const [editingValorId, setEditingValorId] = useState<string | null>(null);
  const [editingValorNome, setEditingValorNome] = useState('');
  const [savingCompany, setSavingCompany] = useState(false);
  const [companyError, setCompanyError] = useState('');
  const [createdSocio, setCreatedSocio] = useState<{email: string; password: string} | null>(null);

  const addTipo = () => {
    if (newTipoNome && !tiposReuniao.some(t => t.nome === newTipoNome && t.empresa_id === currentUser.empresa_id)) {
      setTiposReuniao([...tiposReuniao, { id: Date.now().toString(), nome: newTipoNome, empresa_id: currentUser.empresa_id || '', ativo: true }]);
      setNewTipoNome('');
    }
  };

  const updateTipo = (id: string) => {
    setTiposReuniao(tiposReuniao.map(t => t.id === id ? { ...t, nome: editingTipoNome } : t));
    setEditingTipoId(null);
  };

  const toggleTipoAtivo = (id: string) => {
    setTiposReuniao(tiposReuniao.map(t => t.id === id ? { ...t, ativo: !t.ativo } : t));
  };

  const deleteTipo = (id: string) => {
    setTiposReuniao(tiposReuniao.filter(t => t.id !== id));
  };

  const addValor = () => {
    if (newValorNome && !valoresEmpresa.some(v => v.nome === newValorNome && v.empresa_id === currentUser.empresa_id)) {
      setValoresEmpresa([...valoresEmpresa, { id: Date.now().toString(), nome: newValorNome, empresa_id: currentUser.empresa_id || '' }]);
      setNewValorNome('');
    }
  };

  const updateValor = (id: string) => {
    setValoresEmpresa(valoresEmpresa.map(v => v.id === id ? { ...v, nome: editingValorNome } : v));
    setEditingValorId(null);
  };

  const deleteValor = (id: string) => {
    setValoresEmpresa(valoresEmpresa.filter(v => v.id !== id));
  };

  const addCompany = async () => {
    if (!newCompanyName || !newSocioEmail || !newSocioPassword) {
      setCompanyError('Preencha todos os campos.');
      return;
    }
    if (newSocioPassword.length < 6) {
      setCompanyError('Senha deve ter pelo menos 6 caracteres.');
      return;
    }
    setSavingCompany(true);
    setCompanyError('');
    try {
      const signUpRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
        { method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email: newSocioEmail, password: newSocioPassword, returnSecureToken: true }) }
      );
      const signUpData = await signUpRes.json();
      let uid: string;
      let displayPassword = newSocioPassword;
      if (signUpData.error) {
        if (signUpData.error.message === 'EMAIL_EXISTS') {
          const existing = users.find(u => u.email === newSocioEmail);
          uid = existing?.id || 'pending_' + Date.now();
          displayPassword = '(usar senha atual da conta existente)';
        } else {
          setCompanyError('Erro ao criar conta: ' + signUpData.error.message);
          setSavingCompany(false);
          return;
        }
      } else {
        uid = signUpData.localId;
      }
      const newCompanyId = Date.now().toString();
      const newCompany: Empresa = { id: newCompanyId, nome: newCompanyName, segmento: 'Novo', responsavel: newSocioEmail, descricao: '', logo_url: '', status: 'Ativa', dataCadastro: new Date().toISOString().split('T')[0], cnpj: '', qualificacao: '' };
      await setDoc(doc(db, 'companies', newCompanyId), newCompany);
      const socioName = newSocioEmail.split('@')[0].replace(/\./g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const newSocio: User = { id: uid, nome: socioName, email: newSocioEmail, role: 'SOCIO', empresa_id: newCompanyId, primeiro_acesso: true };
      await setDoc(doc(db, 'users', uid), newSocio);
      setCreatedSocio({ email: newSocioEmail, password: displayPassword });
      setNewCompanyName('');
      setNewSocioEmail('');
      setNewSocioPassword('');
    } catch (err: any) {
      setCompanyError('Erro: ' + (err.message || String(err)));
    } finally {
      setSavingCompany(false);
    }
  };

  return (
    <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Configurações</h2>
      
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && <button onClick={() => setActiveTab('companies')} className={`pb-4 ${activeTab === 'companies' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Gestão de Empresas</button>}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') && <button onClick={() => setActiveTab('users')} className={`pb-4 ${activeTab === 'users' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Gerenciar Usuários</button>}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && <button onClick={() => setActiveTab('meetingTypes')} className={`pb-4 ${activeTab === 'meetingTypes' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Tipos de Reunião</button>}
        {(currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && <button onClick={() => setActiveTab('companyValues')} className={`pb-4 ${activeTab === 'companyValues' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Valores da Empresa</button>}
        <button onClick={() => setActiveTab('general')} className={`pb-4 ${activeTab === 'general' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Perfil Pessoal</button>
      </div>

      {activeTab === 'companyValues' && (currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <input value={newValorNome} onChange={e => setNewValorNome(e.target.value)} className="border border-gray-300 p-3 rounded-xl flex-grow" placeholder="Nome do novo valor" />
            <button onClick={addValor} className="bg-red-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"><Plus size={20} /> Adicionar</button>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {valoresEmpresa.filter(v => v.empresa_id === currentUser.empresa_id).map(v => (
              <div key={v.id} className="p-4 border border-gray-100 rounded-xl flex justify-between items-center">
                {editingValorId === v.id ? (
                  <input value={editingValorNome} onChange={e => setEditingValorNome(e.target.value)} className="border border-gray-300 p-2 rounded-lg" />
                ) : <span className="font-semibold">{v.nome}</span>}
                <div className="flex gap-2">
                  {editingValorId === v.id ? (
                    <button onClick={() => updateValor(v.id)} className="text-green-600"><Check size={18}/></button>
                  ) : (
                    <button onClick={() => { setEditingValorId(v.id); setEditingValorNome(v.nome); }} className="text-blue-600">Editar</button>
                  )}
                  <button onClick={() => deleteValor(v.id)} className="text-red-600"><Trash2 size={18} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'meetingTypes' && (currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && (
        <div className="space-y-6">
          <div className="flex gap-2">
            <input value={newTipoNome} onChange={e => setNewTipoNome(e.target.value)} className="border border-gray-300 p-3 rounded-xl flex-grow" placeholder="Nome do novo tipo de reunião" />
            <button onClick={addTipo} className="bg-red-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2"><Plus size={20} /> Adicionar</button>
          </div>
          <table className="w-full">
            <thead className="bg-gray-50 text-left text-xs text-gray-500 uppercase">
              <tr>
                <th className="px-6 py-4">Nome</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tiposReuniao.filter(t => t.empresa_id === currentUser.empresa_id).map(t => (
                <tr key={t.id}>
                  <td className="px-6 py-4">
                    {editingTipoId === t.id ? (
                      <input value={editingTipoNome} onChange={e => setEditingTipoNome(e.target.value)} className="border border-gray-300 p-2 rounded-lg" />
                    ) : t.nome}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleTipoAtivo(t.id)} className={`px-3 py-1 rounded-full text-xs ${t.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {t.ativo ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {editingTipoId === t.id ? (
                      <button onClick={() => updateTipo(t.id)} className="text-green-600"><Check size={18}/></button>
                    ) : (
                      <button onClick={() => { setEditingTipoId(t.id); setEditingTipoNome(t.nome); }} className="text-blue-600">Editar</button>
                    )}
                    <button onClick={() => deleteTipo(t.id)} className="text-red-600"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'users' && (currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') && (
        <UserManagementModule currentUser={currentUser} users={users} setUsers={setUsers} />
      )}
      
      {activeTab === 'companies' && (currentUser.role === 'ADMIN' || currentUser.role === 'SOCIO') && (
        <div className="space-y-6">
          {createdSocio && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
              <CheckCircle className="text-green-600 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-green-800">Empresa e Sócio criados com sucesso!</p>
                <p className="text-sm text-green-700 mt-1">Email: <strong>{createdSocio.email}</strong></p>
                <p className="text-sm text-green-700">Senha: <strong>{createdSocio.password}</strong></p>
                <button onClick={() => setCreatedSocio(null)} className="mt-2 text-xs text-green-600 underline">Fechar</button>
              </div>
            </div>
          )}
          {companies.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-red-900 font-bold text-lg">{c.nome.charAt(0)}</div>
              <div className="flex-grow">
                <p className="font-semibold">{c.nome}</p>
                <p className="text-sm text-gray-500">{c.responsavel || c.segmento}</p>
              </div>
            </div>
          ))}
          {companyError && <p className="text-red-600 text-sm font-semibold">{companyError}</p>}
          <div className="flex gap-2 flex-col">
            <input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Nome da nova empresa" />
            <input value={newSocioEmail} onChange={e => setNewSocioEmail(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Email do Sócio" />
            <input type="password" value={newSocioPassword} onChange={e => setNewSocioPassword(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Senha Inicial (mínimo 6 caracteres)" />
            <button onClick={addCompany} disabled={savingCompany} className="bg-red-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"><Building2 size={20} /> {savingCompany ? 'Criando...' : 'Criar Empresa e Sócio'}</button>
          </div>
        </div>
      )}

      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-4"><Palette className="text-red-900" /> Foto de Perfil</div>
            <button className="text-red-900 font-semibold">Alterar Foto</button>
          </div>
          <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-4"><Shield className="text-red-900" /> Alterar Senha</div>
            <button className="text-red-900 font-semibold">Configurar Senha</button>
          </div>
          <button className="w-full bg-red-900 text-white py-4 rounded-xl font-semibold flex items-center justify-center gap-2"><Save size={20}/> Salvar Alterações</button>
        </div>
      )}
    </section>
  );
}
