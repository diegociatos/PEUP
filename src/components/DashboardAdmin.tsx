import React, { useState } from 'react';
import { Building2, Users, CheckCircle, Plus, List } from 'lucide-react';
import { User, Empresa } from '../types';
import PasswordDisplayModal from './PasswordDisplayModal';
import { db, auth } from '../lib/firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';

interface DashboardAdminProps {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  companies: Empresa[];
  setCompanies: React.Dispatch<React.SetStateAction<Empresa[]>>;
}

export default function DashboardAdmin({ currentUser, users, setUsers, companies, setCompanies }: DashboardAdminProps) {
  const [showList, setShowList] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const [senhaProvisoria, setSenhaProvisoria] = useState<{ nome: string, senha: string } | null>(null);
  const [formData, setFormData] = useState({ 
    nomeEmpresa: '', cnpj: '', qualificacao: '', 
    nomeSocio: '', emailSocio: '', empresaId: ''
  });

  const totalEmpresas = companies.length;
  const empresasAtivas = companies.filter(e => e.status === 'Ativa').length;
  
  const ultimosSocios = users
    .filter(u => u.role === 'SOCIO')
    .slice(-3)
    .map(s => ({ nome: s.nome, empresa: companies.find(e => e.id === s.empresa_id)?.nome || 'N/A' }));

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeEmpresa || !formData.cnpj || !formData.qualificacao) {
      alert("Por favor, preencha todos os campos da empresa.");
      return;
    }

    try {
      const companyRef = await addDoc(collection(db, 'companies'), {
        nome: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        qualificacao: formData.qualificacao,
        status: 'Ativa',
        dataCadastro: new Date().toISOString().split('T')[0]
      });
      
      setShowForm(false);
      setFormData({ ...formData, nomeEmpresa: '', cnpj: '', qualificacao: '' });
      alert("Empresa criada com sucesso!");
    } catch (error: any) {
      console.error("Erro ao salvar empresa:", error);
      alert("Erro ao salvar empresa: " + error.message);
    }
  };

  const handleSaveUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.nomeSocio || !formData.emailSocio) {
      alert("Por favor, preencha o nome e o e-mail do usuário.");
      return;
    }

    try {
      const provisionalPassword = Math.random().toString(36).slice(-12);
      
      // Cria usuário no Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.emailSocio, provisionalPassword);
      const userId = userCredential.user.uid;

      // Salva dados no Firestore
      await setDoc(doc(db, 'users', userId), {
        id: userId,
        nome: formData.nomeSocio,
        email: formData.emailSocio,
        role: 'SOCIO',
        empresa_id: formData.empresaId || null,
        senha: provisionalPassword,
        primeiro_acesso: true
      });
      
      setSenhaProvisoria({ nome: formData.nomeSocio, senha: provisionalPassword });
      setShowUserForm(false);
      setFormData({ ...formData, nomeSocio: '', emailSocio: '', empresaId: '' });
    } catch (error: any) {
      console.error("Erro ao salvar usuário:", error);
      alert("Erro ao salvar usuário: " + error.message);
    }
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Painel Administrativo</h1>
      
      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><Building2 size={16}/>Total de Empresas Clientes</h3>
          <p className="text-2xl font-bold font-sans">{totalEmpresas}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><CheckCircle size={16}/>Empresas Ativas</h3>
          <p className="text-2xl font-bold font-sans">{empresasAtivas}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-slate-500 text-sm font-medium flex items-center gap-2"><Users size={16}/>Últimos Sócios Cadastrados</h3>
          <ul className="mt-2 text-sm">
            {ultimosSocios.map((s, i) => <li key={i}>{s.nome} ({s.empresa})</li>)}
          </ul>
        </div>
      </div>

      {/* Ações Admin */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm mb-8">
        <h2 className="text-xl font-serif font-bold text-[#630d16] mb-4">Gestão de Empresas</h2>
        <div className="flex gap-4">
            <button onClick={() => setShowForm(true)} className="bg-[#630d16] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4a0a11] flex items-center gap-2"><Plus size={18}/> Criar Nova Empresa</button>
            <button onClick={() => setShowUserForm(true)} className="bg-[#630d16] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4a0a11] flex items-center gap-2"><Plus size={18}/> Vincular Usuário</button>
            <button onClick={() => setShowList(!showList)} className="bg-white text-[#630d16] px-4 py-2 rounded-lg font-semibold border border-[#630d16] hover:bg-slate-100 flex items-center gap-2"><List size={18}/> Listar Empresas Ativas</button>
        </div>
      </div>

      {/* Formulário de Criação de Empresa */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSaveEmpresa} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-serif font-bold text-[#630d16] mb-4">Nova Empresa</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome da Empresa" className="w-full p-2 border rounded" value={formData.nomeEmpresa} onChange={e => setFormData({...formData, nomeEmpresa: e.target.value})} />
              <input type="text" placeholder="CNPJ (00.000.000/0000-00)" className="w-full p-2 border rounded" value={formData.cnpj} onChange={e => setFormData({...formData, cnpj: e.target.value})} />
              <select className="w-full p-2 border rounded" value={formData.qualificacao} onChange={e => setFormData({...formData, qualificacao: e.target.value})}>
                <option value="">Selecione a Qualificação</option>
                <option value="MEI">MEI</option>
                <option value="ME">ME</option>
                <option value="EPP">EPP</option>
                <option value="LTDA">LTDA</option>
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-[#630d16] text-white">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {/* Formulário de Vinculação de Usuário */}
      {showUserForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={handleSaveUsuario} className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-xl font-serif font-bold text-[#630d16] mb-4">Vincular Usuário</h2>
            <div className="space-y-4">
              <input type="text" placeholder="Nome do Usuário" className="w-full p-2 border rounded" value={formData.nomeSocio} onChange={e => setFormData({...formData, nomeSocio: e.target.value})} />
              <input type="email" placeholder="E-mail do Usuário" className="w-full p-2 border rounded" value={formData.emailSocio} onChange={e => setFormData({...formData, emailSocio: e.target.value})} />
              <select className="w-full p-2 border rounded" value={formData.empresaId} onChange={e => setFormData({...formData, empresaId: e.target.value})}>
                <option key="none" value="">Selecione a Empresa (Opcional)</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowUserForm(false)} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded bg-[#630d16] text-white">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {senhaProvisoria && (
        <PasswordDisplayModal 
          socioNome={senhaProvisoria.nome} 
          senha={senhaProvisoria.senha} 
          onClose={() => setSenhaProvisoria(null)} 
        />
      )}

      {/* Tabela de Empresas */}
      {showList && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-serif font-bold text-[#630d16] mb-4">Empresas Ativas</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Nome</th>
                <th className="text-left py-2">Sócio Responsável</th>
                <th className="text-left py-2">Data de Cadastro</th>
                <th className="text-left py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map(e => (
                <tr key={e.id} className="border-b">
                  <td className="py-2">{e.nome}</td>
                  <td className="py-2">{e.responsavel}</td>
                  <td className="py-2">{e.dataCadastro || 'N/A'}</td>
                  <td className="py-2">{e.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
