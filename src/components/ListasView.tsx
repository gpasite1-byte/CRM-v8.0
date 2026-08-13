import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';
import { Usuario } from '../types';

interface ListasViewProps {
  comerciais?: Usuario[];
  refDate?: Date;
  onRefDateChange?: (d: Date) => void;
  selectedPeriod?: PeriodType;
  onPeriodTypeChange?: (p: PeriodType) => void;
  selectedComercial?: string;
  onComercialChange?: (c: string) => void;
  selectedEmpresa?: string;
  onEmpresaChange?: (e: string) => void;
  selectedProvincia?: string;
  onProvinciaChange?: (p: string) => void;
}

export default function ListasView({
  comerciais = [],
  refDate,
  onRefDateChange,
  selectedPeriod,
  onPeriodTypeChange,
  selectedComercial,
  onComercialChange,
  selectedEmpresa,
  onEmpresaChange,
  selectedProvincia,
  onProvinciaChange
}: ListasViewProps) {
  const comerciaisList = [
    'Amélia Cassinda',
    'David Guedes',
    'Fernando Leite',
    'José Neto',
    'Marta de Oliveira',
    'Ilídio Pedro',
    'Luísa Baltazar'
  ];

  const estadosList = [
    'Proposta enviada',
    'Proposta em negociação',
    'Proposta aprovada',
    'Produção / Entrega',
    'Perdida'
  ];

  const probabilidadeList = [
    { val: '0', tag: 'Alta' },
    { val: '0,2', tag: 'Média' },
    { val: '0,3', tag: 'Normal' },
    { val: '0,4', tag: 'Baixa' },
    { val: '0,5', tag: '' },
    { val: '0,6', tag: '' },
    { val: '0,7', tag: '' },
    { val: '0,8', tag: '' },
    { val: '0,9', tag: '' },
    { val: '1', tag: '' }
  ];

  const prioridadeList = [
    'Alta',
    'Média',
    'Normal',
    'Baixa'
  ];

  const estadoCrmList = [
    'Aberto',
    'Fechado ganho',
    'Fechado perdido'
  ];

  const gestoresMetas = [
    {
      gestor: 'Amélia Cassinda',
      funcao: 'Sénior',
      metaMensal: '25 000 000',
      metaSemanal: '6 250 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '6 250 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'David Guedes',
      funcao: 'Comercial',
      metaMensal: '15 000 000',
      metaSemanal: '3 750 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '3 750 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'Fernando Leite',
      funcao: 'Comercial',
      metaMensal: '10 000 000',
      metaSemanal: '2 500 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '2 500 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'José Neto',
      funcao: 'Sénior',
      metaMensal: '20 000 000',
      metaSemanal: '5 000 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '5 000 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'Marta de Oliveira',
      funcao: 'Sénior',
      metaMensal: '25 000 000',
      metaSemanal: '6 250 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '6 250 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'Ilídio Pedro',
      funcao: 'Comercial',
      metaMensal: '10 000 000',
      metaSemanal: '2 500 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '2 500 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    },
    {
      gestor: 'Luísa Baltazar',
      funcao: 'Sénior EDGER',
      metaMensal: '30 000 000',
      metaSemanal: '7 500 000',
      comissao: '0,03',
      pesoConversao: '0,4',
      metaSemActualizada: '7 500 000',
      obs: 'Meta actualizada a conjugar com comparativo semanal'
    }
  ];

  return (
    <div className="w-full space-y-6 font-serif my-2 text-gray-900">
      
      {/* GLOBAL PERIOD BAR SYNCHRONIZED ACROSS ALL 13 VIEWS */}
      {refDate && onRefDateChange && selectedPeriod && onPeriodTypeChange && (
        <GlobalPeriodBar
          refDate={refDate}
          onRefDateChange={onRefDateChange}
          periodType={selectedPeriod}
          onPeriodTypeChange={onPeriodTypeChange}
          comerciais={comerciais}
          selectedComercial={selectedComercial || 'todos'}
          onComercialChange={onComercialChange || (() => {})}
          selectedEmpresa={selectedEmpresa || 'todas'}
          onEmpresaChange={onEmpresaChange || (() => {})}
          selectedProvincia={selectedProvincia || 'todas'}
          onProvinciaChange={onProvinciaChange || (() => {})}
          currentViewName="Listas & Parâmetros"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white text-center py-3 px-4 rounded-t-sm shadow-sm border border-[#122442]">
        <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase">
          PARÂMETROS E LISTAS DE APOIO DO CRM
        </h2>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Table 1: Listas Base (Left Side - 5 Cols) */}
        <div className="xl:col-span-5 bg-white border border-gray-400 shadow-xs overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B365D] text-white border-b border-[#122442]">
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75]">Comerciais</th>
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75]">Estados</th>
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75] text-center">Probabilidade</th>
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75] text-center">Prioridade</th>
                <th className="px-3 py-2 font-bold text-center">Estado CRM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
              {Array.from({ length: 10 }).map((_, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {comerciaisList[idx] || ''}
                  </td>
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {estadosList[idx] || ''}
                  </td>
                  <td className="px-3 py-2 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap font-mono">
                    {probabilidadeList[idx]?.val || ''}
                  </td>
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {prioridadeList[idx] || probabilidadeList[idx]?.tag || ''}
                  </td>
                  <td className="px-3 py-2 text-gray-800 whitespace-nowrap">
                    {estadoCrmList[idx] || ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table 2: Gestor Comercial & Metas (Right Side - 7 Cols) */}
        <div className="xl:col-span-7 bg-white border border-gray-400 shadow-xs overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse">
            <thead>
              <tr className="bg-[#1B365D] text-white border-b border-[#122442]">
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75]">Gestor Comercial</th>
                <th className="px-3 py-2 font-bold border-r border-[#2C4D75]">Função</th>
                <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75]">Meta Mensal</th>
                <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75]">Meta Semanal</th>
                <th className="px-3 py-2 font-bold text-center border-r border-[#2C4D75]">Comissão %</th>
                <th className="px-3 py-2 font-bold text-center border-r border-[#2C4D75]">Peso Conv.</th>
                <th className="px-3 py-2 font-bold text-right border-r border-[#2C4D75]">Meta Sem. Act.</th>
                <th className="px-3 py-2 font-bold">Observações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
              {gestoresMetas.map((g, idx) => (
                <tr key={idx} className="hover:bg-gray-50">
                  <td className="px-3 py-2 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {g.gestor}
                  </td>
                  <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {g.funcao}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {g.metaMensal}
                  </td>
                  <td className="px-3 py-2 text-right font-medium text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {g.metaSemanal}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {g.comissao}
                  </td>
                  <td className="px-3 py-2 text-center text-gray-800 border-r border-gray-300 whitespace-nowrap">
                    {g.pesoConversao}
                  </td>
                  <td className="px-3 py-2 text-right font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                    {g.metaSemActualizada}
                  </td>
                  <td className="px-3 py-2 text-gray-700 min-w-[220px]">
                    {g.obs}
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
