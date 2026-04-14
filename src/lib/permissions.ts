import { User } from '../types';

export const canView = (currentUser: User, targetUserId: string) => {
  if (currentUser.role === 'SOCIO') return true;
  if (currentUser.role === 'GESTOR') return true; // Gestor can view all reports, filtering is handled at component level
  return currentUser.id === targetUserId;
};

export const canEdit = (currentUser: User) => {
  return currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR';
};

export const canAccess = (role: string, view: string) => {
  if (role === 'ADMIN') return view === 'Dashboard' || view === 'Configurações';
  if (role === 'SOCIO') return true;
  if (role === 'GESTOR') return view !== 'Configurações';
  return view === 'Dashboard' || view === 'Estratégia' || view === 'Anual' || view === 'Trimestral' || view === 'Mensal' || view === 'Desempenho' || view === 'Reuniões';
};

export const isReadOnly = (role: string, view: string) => {
  return role === 'COLABORADOR';
};

export const getAccessibleData = <T>(
  currentUser: User,
  data: T[]
): T[] => {
  if (currentUser.role === 'SOCIO' || currentUser.role === 'GESTOR') return data;
  return data.filter(item => 
    (item as any).colaboradorId === currentUser.id || 
    (item as any).responsavelId === currentUser.id || 
    (item as any).userId === currentUser.id
  );
};
