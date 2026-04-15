import React, { useState, useMemo } from 'react';
import { User, Role } from '../types';
import { Plus, Edit, Trash2, AlertTriangle, Save, X, CheckCircle } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { sendPasswordResetEmail, getAuth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

interface UserManagementModuleProps {
  currentUser: User;
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

export default function UserManagementModule({ currentUser, users, setUsers }: UserManagementModuleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [error, setError] = useState('');

  const [createdUser, setCreatedUser] = useState<{email: string; password: string} | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredUsers = useMemo(() => {
    if (currentUser.role === 'ADMIN') return users;
    return users.filter(u => u.empresa_id === currentUser.empresa_id);
  }, [users, currentUser]);

  const canManage = (userToManage?: User) => {
    if (currentUser.role === 'ADMIN') return true;
    if (currentUser.role === 'SOCIO') {
      return userToManage?.empresa_id === currentUser.empresa_id && userToManage?.role !== 'ADMIN';
    }
    if (currentUser.role === 'GESTOR') {
      if (!userToManage) return false;
      return userToManage.role === 'COLABORADOR' && userToManage.responsavelDiretoId === currentUser.id;
    }
    return false;
  };

  const handleSave = async () => {
    if (!editingUser.nome || !editingUser.email || !editingUser.role) {
      setError('Preencha todos os campos obrigatórios.');
      return;
    }

    // Permission checks for creation/editing
    if (currentUser.role === 'GESTOR') {
      if (editingUser.role !== 'COLABORADOR') {
        setError('Gestores só podem gerenciar Colaboradores.');
        return;
      }
      if (editingUser.responsavelDiretoId !== currentUser.id) {
        setError('Você só pode gerenciar seus liderados diretos.');
        return;
      }
    }

    setSaving(true);
    setError('');

    try {
      if (editingUser.id && users.some(u => u.id === editingUser.id)) {
        // Editing existing user — update Firestore
        const updatedUser: User = { ...editingUser as User };
        await setDoc(doc(db, 'users', updatedUser.id), updatedUser, { merge: true });
        setIsEditing(false);
        setEditingUser({});
        alert('Usuário atualizado com sucesso!');
      } else {
        // Creating new user — create Firebase Auth account first
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
        const randomPart = Array.from({length: 4}, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        const tempPassword = 'PEUP@' + randomPart;

        const signUpRes = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
          { method: 'POST', headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({ email: editingUser.email, password: tempPassword, returnSecureToken: true }) }
        );
        const signUpData = await signUpRes.json();

        let uid: string;
        if (signUpData.error?.message === 'EMAIL_EXISTS') {
          // Email already has Auth account — send reset email
          const auth = getAuth();
          await sendPasswordResetEmail(auth, editingUser.email);
          setError('Este email já possui conta. Um email de redefinição de senha foi enviado.');
          setSaving(false);
          return;
        } else if (signUpData.error) {
          setError('Erro ao criar conta: ' + signUpData.error.message);
          setSaving(false);
          return;
        } else {
          uid = signUpData.localId;
        }

        // Save user doc to Firestore with Auth UID
        const newUser: User = {
          id: uid,
          nome: editingUser.nome,
          email: editingUser.email,
          role: editingUser.role,
          empresa_id: editingUser.empresa_id || currentUser.empresa_id,
          responsavelDiretoId: editingUser.responsavelDiretoId,
          primeiro_acesso: true,
        };

        // Strip undefined fields
        const cleanUser = Object.fromEntries(Object.entries(newUser).filter(([_, v]) => v !== undefined));
        await setDoc(doc(db, 'users', uid), cleanUser);

        setCreatedUser({ email: editingUser.email, password: tempPassword });
        setIsEditing(false);
        setEditingUser({});
      }
    } catch (err: any) {
      setError('Erro: ' + (err.message || String(err)));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: User) => {
    if (!canManage(user)) {
      alert('Você não tem permissão para excluir este usuário.');
      return;
    }
    if (confirm('Tem certeza que deseja excluir este usuário?')) {
      await deleteDoc(doc(db, 'users', user.id));
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-serif font-bold text-[#630d16] mb-8">Gestão de Usuários</h1>
        
        {currentUser.role !== 'COLABORADOR' && (
          <button onClick={() => { setIsEditing(true); setEditingUser({ role: 'COLABORADOR', responsavelDiretoId: currentUser.id }); }} className="mb-6 flex items-center gap-2 bg-[#630d16] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#4a0a11]">
            <Plus size={20} /> Novo Usuário
          </button>
        )}

        {isEditing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">{editingUser.id ? 'Editar Usuário' : 'Novo Usuário'}</h2>
              {error && <p className="text-red-500 text-sm mb-4 flex items-center gap-1"><AlertTriangle size={16}/> {error}</p>}
              
              <input className="w-full mb-4 p-2 border rounded" placeholder="Nome" value={editingUser.nome || ''} onChange={e => setEditingUser({...editingUser, nome: e.target.value})} />
              <input className="w-full mb-4 p-2 border rounded" placeholder="Email" value={editingUser.email || ''} onChange={e => setEditingUser({...editingUser, email: e.target.value})} />
              
              <select className="w-full mb-4 p-2 border rounded" value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}>
                <option value="COLABORADOR">Colaborador</option>
                <option value="GESTOR">Gestor</option>
                <option value="SOCIO">Sócio</option>
                {currentUser.role === 'ADMIN' && <option value="ADMIN">Administrador</option>}
              </select>

              {editingUser.role === 'COLABORADOR' && (
                <select className="w-full mb-4 p-2 border rounded" value={editingUser.responsavelDiretoId || ''} onChange={e => setEditingUser({...editingUser, responsavelDiretoId: e.target.value})}>
                  <option value="">Selecione Gestor</option>
                  {users.filter(u => u.role === 'GESTOR' || u.role === 'SOCIO').map(u => <option key={u.id} value={u.id}>{u.nome}</option>)}
                </select>
              )}

              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="flex-1 bg-green-600 text-white py-2 rounded font-semibold disabled:opacity-50"><Save size={18} className="inline mr-1"/> {saving ? 'Salvando...' : 'Salvar'}</button>
                <button onClick={() => setIsEditing(false)} className="flex-1 bg-gray-200 py-2 rounded font-semibold"><X size={18} className="inline mr-1"/> Cancelar</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 text-left">Nome</th>
                <th className="p-4 text-left">Email</th>
                <th className="p-4 text-left">Perfil</th>
                <th className="p-4 text-left">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="p-4">{user.nome}</td>
                  <td className="p-4">{user.email}</td>
                  <td className="p-4">{user.role}</td>
                  <td className="p-4 flex gap-2">
                    {canManage(user) && (
                      <>
                        <button onClick={() => { setEditingUser(user); setIsEditing(true); }} className="text-blue-600"><Edit size={18}/></button>
                        <button onClick={() => handleDelete(user)} className="text-red-600"><Trash2 size={18}/></button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {createdUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl w-full max-w-md text-center">
              <CheckCircle size={48} className="text-green-600 mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">Usuário Criado!</h2>
              <p className="mb-2">Envie os dados de acesso:</p>
              <div className="bg-gray-100 p-4 rounded-lg text-left mb-4">
                <p><strong>Email:</strong> {createdUser.email}</p>
                <p><strong>Senha provisória:</strong> {createdUser.password}</p>
              </div>
              <p className="text-sm text-gray-500 mb-4">O usuário deverá trocar a senha no primeiro acesso.</p>
              <button onClick={() => setCreatedUser(null)} className="bg-[#630d16] text-white px-6 py-2 rounded-lg font-semibold hover:bg-[#4a0a11]">Fechar</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
