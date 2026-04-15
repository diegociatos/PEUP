import React, { useState } from 'react';
import { User, Role, Empresa, TipoReuniao, ValorEmpresa } from '../types';
import { UserPlus, Trash2, Shield, Building2, Bell, Palette, Calendar, Save, Plus, Check, X } from 'lucide-react';
import UserManagementModule from './UserManagementModule';

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

  const addCompany = () => {
    if (newCompanyName && newSocioEmail && newSocioPassword) {
      const newCompanyId = Date.now().toString();
      setCompanies([...companies, { id: newCompanyId, nome: newCompanyName, segmento: 'Novo', responsavel: 'N/A', descricao: '', logo_url: 'https://picsum.photos/seed/new/50/50' }]);
      setUsers([...users, { id: Date.now().toString() + '1', nome: 'Sócio Inicial', email: newSocioEmail, role: 'SOCIO', empresa_id: newCompanyId }]);
      setNewCompanyName('');
      setNewSocioEmail('');
      setNewSocioPassword('');
    }
  };

  return (
    <section className="bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-3xl font-serif font-bold text-gray-900 mb-8">Configurações</h2>
      
      <div className="flex gap-4 mb-8 border-b border-gray-200">
        {currentUser.role === 'SOCIO' && <button onClick={() => setActiveTab('companies')} className={`pb-4 ${activeTab === 'companies' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Gestão de Empresas</button>}
        {(currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') && <button onClick={() => setActiveTab('users')} className={`pb-4 ${activeTab === 'users' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Gerenciar Usuários</button>}
        {currentUser.role === 'SOCIO' && <button onClick={() => setActiveTab('meetingTypes')} className={`pb-4 ${activeTab === 'meetingTypes' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Tipos de Reunião</button>}
        {currentUser.role === 'SOCIO' && <button onClick={() => setActiveTab('companyValues')} className={`pb-4 ${activeTab === 'companyValues' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Valores da Empresa</button>}
        <button onClick={() => setActiveTab('general')} className={`pb-4 ${activeTab === 'general' ? 'border-b-2 border-red-900 font-semibold text-red-900' : 'text-gray-500'}`}>Perfil Pessoal</button>
      </div>

      {activeTab === 'companyValues' && currentUser.role === 'SOCIO' && (
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

      {activeTab === 'meetingTypes' && currentUser.role === 'SOCIO' && (
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

      {activeTab === 'users' && (currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') && (
        <UserManagementModule currentUser={currentUser} users={users} setUsers={setUsers} />
      )}
      
      {activeTab === 'companies' && currentUser.role === 'ADMIN' && (
        <div className="space-y-6">
          {companies.map(c => (
            <div key={c.id} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl">
              <img src={c.logo_url} alt={c.nome} className="w-12 h-12 rounded-full" />
              <div className="flex-grow">
                <p className="font-semibold">{c.nome}</p>
                <p className="text-sm text-gray-500">{c.segmento}</p>
              </div>
            </div>
          ))}
          <div className="flex gap-2 flex-col">
            <input value={newCompanyName} onChange={e => setNewCompanyName(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Nome da nova empresa" />
            <input value={newSocioEmail} onChange={e => setNewSocioEmail(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Email do Sócio" />
            <input type="password" value={newSocioPassword} onChange={e => setNewSocioPassword(e.target.value)} className="border border-gray-300 p-3 rounded-xl" placeholder="Senha Inicial" />
            <button onClick={addCompany} className="bg-red-900 text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2"><Building2 size={20} /> Criar Empresa e Sócio</button>
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
