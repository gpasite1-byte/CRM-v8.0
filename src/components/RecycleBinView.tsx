import React, { useState, useMemo } from 'react';
import { RecycleItem } from '../types';
import { Trash2, RotateCcw, AlertTriangle, Search, ShieldAlert, CheckCircle2, FileText, Users, Building2, Calendar, File, RefreshCw, Briefcase } from 'lucide-react';

interface RecycleBinViewProps {
  recycleItems: RecycleItem[];
  onRestoreItem: (item: RecycleItem) => void;
  onPermanentDelete: (id: string) => void;
  onClearRecycleBin: () => void;
}

export default function RecycleBinView({
  recycleItems,
  onRestoreItem,
  onPermanentDelete,
  onClearRecycleBin
}: RecycleBinViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('todos');
  const [showConfirmClear, setShowConfirmClear] = useState(false);

  const filteredItems = useMemo(() => {
    return recycleItems.filter(item => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        item.titulo.toLowerCase().includes(q) ||
        item.detalhes.toLowerCase().includes(q) ||
        (item.deletedBy && item.deletedBy.toLowerCase().includes(q));
      const matchesType = selectedType === 'todos' || item.tipo === selectedType;
      return matchesSearch && matchesType;
    });
  }, [recycleItems, searchQuery, selectedType]);

  const getTypeLabelAndIcon = (tipo: RecycleItem['tipo']) => {
    switch (tipo) {
      case 'deal':
        return { label: 'Proposta / Negócio', icon: Briefcase, color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'cliente':
        return { label: 'Cliente / Conta', icon: Building2, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'visita':
        return { label: 'Relatório de Visita', icon: Calendar, color: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'utilizador':
        return { label: 'Utilizador / Comercial', icon: Users, color: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'arquivo':
        return { label: 'Documento / Anexo', icon: File, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'relatorio':
        return { label: 'Relatório Diário', icon: FileText, color: 'bg-teal-100 text-teal-800 border-teal-200' };
      default:
        return { label: 'Outro Registo', icon: RefreshCw, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const totalCount = recycleItems.length;

  return (
    <div className="bg-white rounded-sm border border-gray-300 shadow-xs font-sans text-gray-900 overflow-hidden">
      
      {/* Header Banner */}
      <div className="bg-[#1B365D] text-white p-4 border-b border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/20 p-2 rounded border border-amber-400/30 text-amber-400">
            <Trash2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold font-serif uppercase tracking-wider">
                Lixeira & Campo de Reciclagem (Dados Eliminados)
              </h3>
              <span className="bg-amber-400 text-gray-950 text-[10px] font-black px-2 py-0.5 rounded uppercase font-mono">
                {totalCount} {totalCount === 1 ? 'item' : 'itens'}
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Recupere dados apagados acidentalmente ("Restaurar") ou elimine permanentemente do sistema.
            </p>
          </div>
        </div>

        {totalCount > 0 && (
          <button
            onClick={() => setShowConfirmClear(true)}
            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3.5 py-2 rounded shadow-xs flex items-center gap-1.5 transition cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Esvaziar Lixeira
          </button>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmClear && (
        <div className="bg-red-50 border-b border-red-200 p-3.5 flex items-center justify-between text-xs text-red-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            <span>
              <strong>Atenção:</strong> Tem a certeza que deseja esvaziar a lixeira? <strong>{totalCount} itens</strong> serão excluídos permanentemente sem possibilidade de recuperação.
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                onClearRecycleBin();
                setShowConfirmClear(false);
              }}
              className="bg-red-700 hover:bg-red-800 text-white font-bold px-3 py-1 rounded cursor-pointer"
            >
              Sim, Excluir Tudo
            </button>
            <button
              onClick={() => setShowConfirmClear(false)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-3 py-1 rounded cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Filters & Search Row */}
      <div className="p-3 bg-gray-50 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Search */}
        <div className="relative min-w-[240px] flex-1">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            placeholder="Pesquisar registos eliminados..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 outline-none"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'deal', label: 'Propostas' },
            { id: 'cliente', label: 'Clientes' },
            { id: 'visita', label: 'Visitas' },
            { id: 'utilizador', label: 'Utilizadores' },
            { id: 'arquivo', label: 'Documentos' },
            { id: 'relatorio', label: 'Relatórios' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setSelectedType(t.id)}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                selectedType === t.id
                  ? 'bg-[#1B365D] text-white shadow-2xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Items List */}
      <div className="p-4">
        {filteredItems.length === 0 ? (
          <div className="py-12 text-center text-gray-500 space-y-2">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400">
              <Trash2 className="w-6 h-6" />
            </div>
            <p className="font-bold text-sm text-gray-700">Lixeira Vazia</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Nenhum elemento apagado encontrado{selectedType !== 'todos' ? ` para a categoria "${selectedType}"` : ''}.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredItems.map((item) => {
              const meta = getTypeLabelAndIcon(item.tipo);
              const IconComp = meta.icon;

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-white border border-gray-200 rounded hover:border-gray-300 transition flex flex-col md:flex-row items-start md:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded border shrink-0 ${meta.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${meta.color}`}>
                          {meta.label}
                        </span>
                        <h4 className="text-xs font-bold text-gray-900 truncate font-serif">
                          {item.titulo}
                        </h4>
                      </div>

                      <p className="text-xs text-gray-600 line-clamp-2">
                        {item.detalhes}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[10px] text-gray-400 font-mono">
                        <span>Eliminado em: {new Date(item.deletedAt).toLocaleString('pt-AO')}</span>
                        {item.deletedBy && <span>Por: {item.deletedBy}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Restaurar & Eliminar Permanentemente */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => onRestoreItem(item)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
                      title="Restaurar este registo para o sistema"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Restaurar
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Tem a certeza que deseja eliminar permanentemente "${item.titulo}" da lixeira? Esta acção é irreversível.`)) {
                          onPermanentDelete(item.id);
                        }
                      }}
                      className="bg-white border border-red-300 hover:bg-red-50 text-red-700 text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1.5 transition cursor-pointer"
                      title="Excluir permanentemente da lixeira"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Excluir
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-3 border-t border-gray-200 text-[11px] text-gray-600 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-blue-900 font-semibold">
          <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
          <span>Todos os registos restaurados voltam imediatamente às suas respectivas tabelas e aos dashboards do CRM.</span>
        </div>
        <span className="font-mono text-gray-400">Gestão de Lixeira GPA</span>
      </div>
    </div>
  );
}
