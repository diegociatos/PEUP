import React, { useState } from 'react';
import { Building2, Users, CheckCircle, Plus, List } from 'lucide-react';
import { User, Empresa } from '../types';
import PasswordDisplayModal from './PasswordDisplayModal';
import { db } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

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
  const [senhaProvisoria, setSenhaProvisoria] = useState<{ nome: string, senha: string } | null>(null);
  const [formData, setFormData] = useState({ 
    nomeEmpresa: '', cnpj: '', qualificacao: '', 
    nomeSocio: '', emailSocio: '' 
  });

  const totalEmpresas = companies.length;
  const empresasAtivas = companies.filter(e => e.status === 'Ativa').length;
  
  const ultimosSocios = users
    .filter(u => u.role === 'SOCIO')
    .slice(-3)
    .map(s => ({ nome: s.nome, empresa: companies.find(e => e.id === s.empresa_id)?.nome || 'N/A' }));

  const [saving, setSaving] = useState(false);

  const handleSaveEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("CREATE_COMPANY_SUBMIT", formData);
    
    if (!formData.nomeEmpresa || !formData.cnpj || !formData.qualificacao || !formData.nomeSocio || !formData.emailSocio) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setSaving(true);
    try {
      // Generate provisional password
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
      const randomPart = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
      const tempPassword = 'PEUP@' + randomPart;

      // Create Firebase Auth account via REST API
      const signUpRes = await fetch(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
        { method: 'POST', headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ email: formData.emailSocio, password: tempPassword, returnSecureToken: true }) }
      );
      const signUpData = await signUpRes.json();

      // Save company to Firestore first
      const newCompanyId = Date.now().toString();
      const newCompany: Empresa = {
        id: newCompanyId,
        nome: formData.nomeEmpresa,
        cnpj: formData.cnpj,
        qualificacao: formData.qualificacao,
        segmento: formData.qualificacao,
        responsavel: formData.nomeSocio,
        descricao: '',
        logo_url: '',
        status: 'Ativa',
        dataCadastro: new Date().toISOString().split('T')[0],
      };
      await setDoc(doc(db, 'companies', newCompanyId), newCompany);

      let displayPassword = tempPassword;

      if (signUpData.error) {
        if (signUpData.error.message === 'EMAIL_EXISTS') {
          // Email already has Auth account — link existing user to new company
          const existingUser = users.find(u => u.email === formData.emailSocio);
          if (existingUser) {
            await setDoc(doc(db, 'users', existingUser.id), {
              ...existingUser,
              role: 'SOCIO',
              empresa_id: newCompanyId,
            }, { merge: true });
            displayPassword = '(usar senha atual da conta existente)';
          } else {
            // Auth account exists but no Firestore doc — create placeholder
            const placeholderId = 'pending_' + Date.now();
            const newSocio: User = {
              id: placeholderId,
              nome: formData.nomeSocio,
              email: formData.emailSocio,
              role: 'SOCIO',
              empresa_id: newCompanyId,
              primeiro_acesso: true,
            };
            await setDoc(doc(db, 'users', placeholderId), newSocio);
            displayPassword = '(usar senha atual — conta já existente)';
          }
        } else {
          alert('Erro ao criar conta: ' + signUpData.error.message);
          setSaving(false);
          return;
        }
      } else {
        // New Auth account created — save sócio user doc
        const uid = signUpData.localId;
        const newSocio: User = {
          id: uid,
          nome: formData.nomeSocio,
          email: formData.emailSocio,
          role: 'SOCIO',
          empresa_id: newCompanyId,
          primeiro_acesso: true,
        };
        await setDoc(doc(db, 'users', uid), newSocio);
      }

      setSenhaProvisoria({ nome: formData.nomeSocio, senha: displayPassword });
      setShowForm(false);
      setFormData({ nomeEmpresa: '', cnpj: '', qualificacao: '', nomeSocio: '', emailSocio: '' });
    } catch (error: any) {
      console.error("Erro ao salvar empresa:", error);
      alert('Erro: ' + (error.message || String(error)));
    } finally {
      setSaving(false);
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
            <button onClick={() => setShowList(!showList)} className="bg-white text-[#630d16] px-4 py-2 rounded-lg font-semibold border border-[#630d16] hover:bg-slate-100 flex items-center gap-2"><List size={18}/> Listar Empresas Ativas</button>
        </div>
      </div>

      {/* Formulário de Criação */}
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
              <input type="text" placeholder="Nome do Sócio" className="w-full p-2 border rounded" value={formData.nomeSocio} onChange={e => setFormData({...formData, nomeSocio: e.target.value})} />
              <input type="email" placeholder="E-mail do Sócio" className="w-full p-2 border rounded" value={formData.emailSocio} onChange={e => setFormData({...formData, emailSocio: e.target.value})} />
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded bg-slate-200">Cancelar</button>
              <button type="submit" disabled={saving} className="px-4 py-2 rounded bg-[#630d16] text-white disabled:opacity-50">{saving ? 'Criando...' : 'Salvar'}</button>
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
