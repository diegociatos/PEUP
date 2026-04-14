import React, { useState } from 'react';
import { Reuniao } from '../types';

interface AuditTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (motivo: string, reuniaoId: string | null) => void;
  reunioes: Reuniao[];
}

export default function AuditTrailModal({ isOpen, onClose, onSave, reunioes }: AuditTrailModalProps) {
  const [motivo, setMotivo] = useState('');
  const [reuniaoId, setReuniaoId] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-96">
        <h3 className="text-lg font-bold mb-4">Você está alterando uma meta. Esta alteração deve ser documentada.</h3>
        <textarea
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          className="w-full p-2 border rounded-lg mb-4"
          placeholder="Motivo da alteração"
          rows={3}
          required
        />
        <select
          value={reuniaoId || ''}
          onChange={(e) => setReuniaoId(e.target.value || null)}
          className="w-full p-2 border rounded-lg mb-4"
        >
          <option value="">Vincular a uma reunião (opcional)</option>
          {reunioes.map(r => (
            <option key={r.id} value={r.id}>{new Date(r.data).toLocaleDateString()} - {r.tipo}</option>
          ))}
        </select>
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancelar</button>
          <button onClick={() => { if(motivo) onSave(motivo, reuniaoId); }} className="px-4 py-2 bg-red-900 text-white rounded-lg" disabled={!motivo}>Salvar alteração</button>
        </div>
      </div>
    </div>
  );
}
