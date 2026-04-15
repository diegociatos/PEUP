import React, { useState, useEffect, useMemo } from 'react';
import { User, Role } from '../types';
import { Plus, Edit, Trash2, AlertTriangle, Save, X } from 'lucide-react';
import { db } from '../lib/firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
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
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');

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
    const isNew = !editingUser.id;
    if (isNew && (!newPassword || newPassword.length < 6)) {
      setError('Defina uma senha com pelo menos 6 caracteres.');
      return;
    }

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
      let uid = editingUser.id;
      if (isNew) {
        const res = await fetch(
          `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${firebaseConfig.apiKey}`,
          { method: 'POST', headers: {'Content-Type':'application/json'},
            body: JSON.stringify({ email: editingUser.email, password: newPassword, returnSecureToken: true }) }
        );
        const data = await res.json();
        if (data.error) {
          if (data.error.message === 'EMAIL_EXISTS') {
            const existing = users.find(u => u.email === editingUser.email);
            uid = existing?.id || 'pending_' + Date.now();
          } else {
            setError('Erro ao criar conta: ' + data.error.message);
            setSaving(false);
            return;
          }
        } else {
          uid = data.localId;
        }
      }

      const newUser: User = {
        ...editingUser as User,
        id: uid!,
        empresa_id: editingUser.empresa_id || currentUser.empresa_id,
      };
      await setDoc(doc(db, 'users', uid!), newUser);

      const newUsers = isNew
        ? [...users, newUser]
        : users.map(u => u.id === editingUser.id ? newUser : u);

      setUsers(newUsers);
      setIsEditing(false);
      setEditingUser({});
      setNewPassword('');
      alert('Usuário salvo com sucesso!');
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
      try {
        await deleteDoc(doc(db, 'users', user.id));
      } catch (e) { /* ignore if doc doesn't exist */ }
      const newUsers = users.filter(u => u.id !== user.id);
      setUsers(newUsers);
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
              {!editingUser.id && <input type="password" className="w-full mb-4 p-2 border rounded" placeholder="Senha Inicial (mínimo 6 caracteres)" value={newPassword} onChange={e => setNewPassword(e.target.value)} />}
              
              <select className="w-full mb-4 p-2 border rounded" value={editingUser.role || ''} onChange={e => setEditingUser({...editingUser, role: e.target.value as Role})}>
                <option value="COLABORADOR">Colaborador</option>
                {currentUser.role === 'SOCIO' && <option value="GESTOR">Gestor</option>}
                {currentUser.role === 'SOCIO' && <option value="SOCIO">Sócio</option>}
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
      </div>
    </div>
  );
}
