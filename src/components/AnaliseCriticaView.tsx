import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';
import { Usuario, Deal } from '../types';

interface AnaliseCriticaViewProps {
  deals?: Deal[];
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

export default function AnaliseCriticaView({
  deals = [],
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
}: AnaliseCriticaViewProps) {
  const kpiData = [
    { label: 'Propostas', val: '32' },
    { label: 'Valor proposto', val: '263 450 431,50 AOA' },
    { label: 'Valor aprovado', val: '26 762 350,00 AOA' },
    { label: 'Conversão', val: '10,2%' },
    { label: 'Pipeline aberto', val: '224 976 006,50 AOA' },
    { label: 'Forecast ponderado', val: '123 115 722,45 AOA' }
  ];

  const comparativoRows = [
    { indicador: 'N.º de propostas', w1: '31', w2: '32', var: '+3,2%', isNegative: false },
    { indicador: 'Valor proposto', w1: '157 928 266 AOA', w2: '263 450 432 AOA', var: '+66,8%', isNegative: false },
    { indicador: 'Valor aprovado', w1: '19 914 950 AOA', w2: '26 762 350 AOA', var: '+34,4%', isNegative: false },
    { indicador: 'Valor perdido', w1: '11 779 700 AOA', w2: '11 712 075 AOA', var: '(0,6%)', isNegative: true },
    { indicador: 'Forecast ponderado', w1: '76 353 142 AOA', w2: '123 115 722 AOA', var: '+61,2%', isNegative: false },
    { indicador: 'Conversão', w1: '12,6%', w2: '10,2%', var: '(2,4 p.p.)', isNegative: true },
    { indicador: 'Ticket médio', w1: '5 094 460 AOA', w2: '8 232 826 AOA', var: '+61,6%', isNegative: false }
  ];

  const performanceRows = [
    {
      comercial: 'Amélia Cassinda',
      metaSemanal: '6 250 000 AOA',
      propostas: 6,
      valorProposto: '51 919 143 AOA',
      aprovado: '4 363 350 AOA',
      pctMeta: '69,8%',
      pctColor: 'bg-amber-200 text-amber-900',
      pipeline: '47 555 793 AOA',
      forecast: '24 810 510 AOA',
      diagnostico: 'Bom volume; focar ANGOLACA e DUBAI, com proposta de valor e data de decisão.'
    },
    {
      comercial: 'David Guedes',
      metaSemanal: '3 750 000 AOA',
      propostas: 5,
      valorProposto: '8 261 979 AOA',
      aprovado: '-',
      pctMeta: '-',
      pctColor: 'bg-rose-300 text-rose-900',
      pipeline: '8 261 979 AOA',
      forecast: '3 814 018 AOA',
      diagnostico: 'Sem aprovações; escalar DP WORLD e validar decisor, orçamento, urgência e amostra.'
    },
    {
      comercial: 'Fernando Leite',
      metaSemanal: '2 500 000 AOA',
      propostas: 3,
      valorProposto: '14 915 475 AOA',
      aprovado: '444 600 AOA',
      pctMeta: '17,8%',
      pctColor: 'bg-rose-300 text-rose-900',
      pipeline: '6 002 100 AOA',
      forecast: '2 845 440 AOA',
      diagnostico: 'Baixa conversão; recuperar GRUPO CASTEL e documentar causa de perda de 5 LINHAS.'
    },
    {
      comercial: 'Ilídio Pedro',
      metaSemanal: '2 500 000 AOA',
      propostas: 3,
      valorProposto: '11 220 450 AOA',
      aprovado: '7 977 150 AOA',
      pctMeta: '319,1%',
      pctColor: 'bg-emerald-300 text-emerald-950 font-black',
      pipeline: '-',
      forecast: '7 977 150 AOA',
      diagnostico: 'Melhor execução da semana; proteger margem e assegurar entrega/facturação SONANGOL.'
    },
    {
      comercial: 'José Neto',
      metaSemanal: '5 000 000 AOA',
      propostas: 3,
      valorProposto: '4 794 498 AOA',
      aprovado: '-',
      pctMeta: '-',
      pctColor: 'bg-rose-300 text-rose-900',
      pipeline: '4 794 498 AOA',
      forecast: '1 917 799 AOA',
      diagnostico: 'Sem aprovações; requalificar BNI, PRODEL e TOPACK antes de conceder desconto.'
    },
    {
      comercial: 'Luísa Baltazar',
      metaSemanal: '7 500 000 AOA',
      propostas: 7,
      valorProposto: '153 045 150 AOA',
      aprovado: '4 150 700 AOA',
      pctMeta: '55,3%',
      pctColor: 'bg-amber-200 text-amber-900',
      pipeline: '148 894 450 AOA',
      forecast: '68 137 380 AOA',
      diagnostico: 'Maior carteira e forte concentração; fechar ZAP e obter contraproposta formal UNITEL.'
    },
    {
      comercial: 'Marta de Oliveira',
      metaSemanal: '6 250 000 AOA',
      propostas: 5,
      valorProposto: '19 293 737 AOA',
      aprovado: '9 826 550 AOA',
      pctMeta: '157,2%',
      pctColor: 'bg-emerald-200 text-emerald-900 font-bold',
      pipeline: '9 467 187 AOA',
      forecast: '13 613 425 AOA',
      diagnostico: 'Meta superada; converter PROGRAMA ALIMENTAR e ATO, mantendo controlo de produção.'
    }
  ];

  return (
    <div className="w-full space-y-4 font-serif text-gray-900 my-2">
      
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
          currentViewName="Análise Crítica Comercial"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white text-center py-2.5 px-4 rounded-t-sm shadow-sm border border-[#122442]">
        <h1 className="text-lg md:text-xl font-black tracking-wider uppercase">
          ANÁLISE CRÍTICA COMERCIAL — 13 A 17 DE JULHO DE 2026
        </h1>
      </div>

      {/* Sub-Header Banner */}
      <div className="bg-[#E2E8F0] text-gray-800 text-center py-1.5 px-4 text-xs font-bold border-x border-b border-gray-400 flex flex-wrap items-center justify-between gap-2">
        <span>GPA ANGOLA | Relatório executivo integrado | Valores em AOA | Elaborado em 20-07-2026</span>
        <div className="flex items-center gap-1.5 font-sans text-[11px] font-semibold">
          <a href="#indicadores" className="px-2 py-0.5 bg-[#1B365D] text-white rounded-xs hover:bg-[#122442] transition">
            1-3. Indicadores & Leitura
          </a>
          <a href="#performance" className="px-2 py-0.5 bg-[#1B365D] text-white rounded-xs hover:bg-[#122442] transition">
            4. Performance
          </a>
          <a href="#alinhamento-financeiro" className="px-2 py-0.5 bg-[#1B365D] text-white rounded-xs hover:bg-[#122442] transition">
            5. Alinhamento Financeiro
          </a>
          <a href="#analise-tecnica" className="px-2 py-0.5 bg-amber-500 text-gray-950 font-bold rounded-xs hover:bg-amber-600 transition shadow-2xs">
            6. Análise Crítica & Fecho
          </a>
        </div>
      </div>

      {/* Section 1: INDICADORES-CHAVE DA SEMANA */}
      <div id="indicadores" className="border border-gray-400 shadow-xs overflow-hidden">
        <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
          1. INDICADORES-CHAVE DA SEMANA
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-gray-300 bg-white font-sans">
          {kpiData.map((kpi, idx) => (
            <div key={idx} className="p-2.5 text-center">
              <div className="text-[11px] font-bold text-[#1B365D] uppercase mb-1">{kpi.label}</div>
              <div className="text-sm md:text-base font-black text-gray-900 truncate">{kpi.val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Section 2 (Comparativo) & Section 3 (Leitura Executiva) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Section 2: COMPARATIVO SEMANAL (Left) */}
        <div className="lg:col-span-6 bg-white border border-gray-400 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
            2. COMPARATIVO SEMANAL
          </div>
          <div className="overflow-x-auto flex-grow">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#2C4D75] text-white border-b border-[#1B365D]">
                  <th className="px-3 py-1.5 font-bold border-r border-[#3D6391]">Indicador</th>
                  <th className="px-3 py-1.5 font-bold text-center border-r border-[#3D6391]">13–17 Jul</th>
                  <th className="px-3 py-1.5 font-bold text-center border-r border-[#3D6391]">20–25 Jul</th>
                  <th className="px-3 py-1.5 font-bold text-center">Variação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
                {comparativoRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-3 py-1.5 font-semibold text-gray-800 border-r border-gray-300">
                      {row.indicador}
                    </td>
                    <td className="px-3 py-1.5 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                      {row.w1}
                    </td>
                    <td className="px-3 py-1.5 text-right font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      {row.w2}
                    </td>
                    <td className={`px-3 py-1.5 text-right font-bold whitespace-nowrap ${
                      row.isNegative ? 'text-red-600' : 'text-gray-900'
                    }`}>
                      {row.var}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: LEITURA EXECUTIVA (Right) */}
        <div className="lg:col-span-6 bg-white border border-gray-400 shadow-xs overflow-hidden flex flex-col">
          <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
            3. LEITURA EXECUTIVA
          </div>
          <div className="p-4 text-xs font-sans text-gray-800 leading-relaxed space-y-3 bg-white flex-grow">
            <p>
              A actividade comercial aumentou em quantidade e valor, mas a conversão permanece baixa face à dimensão do pipeline. A semana gerou 32 propostas, 263,45 milhões AOA de valor proposto e 26,76 milhões AOA aprovados.
            </p>
            <p>
              O crescimento está fortemente concentrado em UNITEL e na carteira de Luísa Baltazar. Ilídio Pedro e Marta de Oliveira superaram as metas semanais; cinco dos sete comerciais ficaram abaixo de 70%.
            </p>
            <p>
              O forecast ponderado de 123,12 milhões AOA deve ser tratado como potencial condicionado, não como receita assegurada.
            </p>
            <p className="font-semibold text-gray-900 border-t border-gray-200 pt-2">
              <span className="font-bold text-[#1B365D]">Prioridade de gestão:</span> converter as oportunidades de alta probabilidade, formalizar PO/adjudicações e eliminar registos sem próxima acção, decisor e data de fecho.
            </p>
          </div>
        </div>

      </div>

      {/* Section 4: PERFORMANCE POR COMERCIAL */}
      <div id="performance" className="border border-gray-400 shadow-xs overflow-hidden bg-white">
        <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
          4. PERFORMANCE POR COMERCIAL
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 p-2 items-start">
          
          {/* Main Table (Left - 9 Cols) */}
          <div className="xl:col-span-9 overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                  <th className="px-2.5 py-1.5 font-bold border-r border-[#1B7099]">Comercial</th>
                  <th className="px-2.5 py-1.5 font-bold text-right border-r border-[#1B7099]">Meta semanal</th>
                  <th className="px-2 py-1.5 font-bold text-center border-r border-[#1B7099]">Propostas</th>
                  <th className="px-2.5 py-1.5 font-bold text-right border-r border-[#1B7099]">Valor proposto</th>
                  <th className="px-2.5 py-1.5 font-bold text-right border-r border-[#1B7099]">Aprovado</th>
                  <th className="px-2 py-1.5 font-bold text-center border-r border-[#1B7099]">% Meta</th>
                  <th className="px-2.5 py-1.5 font-bold text-right border-r border-[#1B7099]">Pipeline aberto</th>
                  <th className="px-2.5 py-1.5 font-bold text-right border-r border-[#1B7099]">Forecast</th>
                  <th className="px-2.5 py-1.5 font-bold">Diagnóstico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 font-sans text-gray-900">
                {performanceRows.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2.5 py-2 font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      {r.comercial}
                    </td>
                    <td className="px-2.5 py-2 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                      {r.metaSemanal}
                    </td>
                    <td className="px-2 py-2 text-center text-gray-800 border-r border-gray-300">
                      {r.propostas}
                    </td>
                    <td className="px-2.5 py-2 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                      {r.valorProposto}
                    </td>
                    <td className="px-2.5 py-2 text-right font-semibold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      {r.aprovado}
                    </td>
                    <td className={`px-2 py-2 text-center font-bold border-r border-gray-300 whitespace-nowrap ${r.pctColor}`}>
                      {r.pctMeta}
                    </td>
                    <td className="px-2.5 py-2 text-right text-gray-800 border-r border-gray-300 whitespace-nowrap">
                      {r.pipeline}
                    </td>
                    <td className="px-2.5 py-2 text-right font-medium text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      {r.forecast}
                    </td>
                    <td className="px-2.5 py-2 text-gray-800 min-w-[240px] leading-snug">
                      {r.diagnostico}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Right Side Widget: Table + Column Bar Chart (Right - 3 Cols) */}
          <div className="xl:col-span-3 space-y-3 font-sans">
            
            {/* Summary Table */}
            <div className="border border-gray-300 rounded-xs overflow-hidden">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="bg-[#0B5C80] text-white">
                    <th className="px-3 py-1 font-bold">Comercial</th>
                    <th className="px-3 py-1 font-bold text-right">% Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {performanceRows.map((r, idx) => (
                    <tr key={idx}>
                      <td className="px-3 py-1 font-medium text-gray-800">{r.comercial}</td>
                      <td className="px-3 py-1 font-bold text-right text-gray-900">{r.pctMeta}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Column Bar Chart */}
            <div className="border border-gray-300 p-2 rounded-xs bg-white text-center">
              <h4 className="text-[11px] font-bold text-gray-800 mb-1">
                Cumprimento da meta semanal (%)
              </h4>
              <div className="w-full h-[180px] flex items-center justify-center">
                <svg viewBox="0 0 240 180" className="w-full h-full text-[7px] font-sans">
                  {/* Horizontal Grid */}
                  <line x1="35" y1="20" x2="230" y2="20" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="35" y1="45" x2="230" y2="45" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="35" y1="70" x2="230" y2="70" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="35" y1="95" x2="230" y2="95" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="35" y1="120" x2="230" y2="120" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="2,2" />
                  <line x1="35" y1="145" x2="230" y2="145" stroke="#64748B" strokeWidth="1" />

                  {/* Y Axis labels */}
                  <text x="30" y="23" fill="#475569" textAnchor="end">350,0%</text>
                  <text x="30" y="48" fill="#475569" textAnchor="end">250,0%</text>
                  <text x="30" y="73" fill="#475569" textAnchor="end">150,0%</text>
                  <text x="30" y="98" fill="#475569" textAnchor="end">100,0%</text>
                  <text x="30" y="123" fill="#475569" textAnchor="end">50,0%</text>
                  <text x="30" y="148" fill="#475569" textAnchor="end">-</text>

                  {/* Bars */}
                  {/* Amélia 69.8% -> ~28px */}
                  <rect x="42" y="117" width="12" height="28" fill="#1F4E79" />

                  {/* David 0% */}
                  <rect x="68" y="145" width="12" height="0" fill="#1F4E79" />

                  {/* Fernando 17.8% -> ~7px */}
                  <rect x="94" y="138" width="12" height="7" fill="#1F4E79" />

                  {/* Ilídio 319.1% -> ~127px */}
                  <rect x="120" y="18" width="12" height="127" fill="#1F4E79" />

                  {/* José 0% */}
                  <rect x="146" y="145" width="12" height="0" fill="#1F4E79" />

                  {/* Luísa 55.3% -> ~22px */}
                  <rect x="172" y="123" width="12" height="22" fill="#1F4E79" />

                  {/* Marta 157.2% -> ~63px */}
                  <rect x="198" y="82" width="12" height="63" fill="#1F4E79" />

                  {/* Angled Labels */}
                  <text x="48" y="152" fill="#334155" transform="rotate(50 48 152)" textAnchor="start">Amélia Cassinda</text>
                  <text x="74" y="152" fill="#334155" transform="rotate(50 74 152)" textAnchor="start">David Guedes</text>
                  <text x="100" y="152" fill="#334155" transform="rotate(50 100 152)" textAnchor="start">Fernando Leite</text>
                  <text x="126" y="152" fill="#334155" transform="rotate(50 126 152)" textAnchor="start">Ilídio Pedro</text>
                  <text x="152" y="152" fill="#334155" transform="rotate(50 152 152)" textAnchor="start">José Neto</text>
                  <text x="178" y="152" fill="#334155" transform="rotate(50 178 152)" textAnchor="start">Luísa Baltazar</text>
                  <text x="204" y="152" fill="#334155" transform="rotate(50 204 152)" textAnchor="start">Marta de Oliveira</text>
                </svg>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Section 5: ALINHAMENTO FINANCEIRO E QUALIDADE DO PIPELINE */}
      <div id="alinhamento-financeiro" className="border border-gray-400 shadow-md overflow-hidden bg-white mt-6">
        
        {/* Main Header Banner */}
        <div className="bg-[#122442] text-white py-3 px-4 text-center border-b border-[#0d182b]">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase">
            ALINHAMENTO FINANCEIRO E QUALIDADE DO PIPELINE
          </h2>
          <p className="text-xs italic font-sans text-blue-200 mt-0.5">
            Reconciliação entre propostas, aprovações, perdas, pipeline e forecast ponderado
          </p>
        </div>

        <div className="p-3 space-y-4 font-sans">

          {/* 1. PONTE FINANCEIRA — SEMANA DE 13 A 17 DE JULHO */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              1. PONTE FINANCEIRA — SEMANA DE 13 A 17 DE JULHO
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Métrica</th>
                    <th className="px-3 py-2 font-bold text-right border-r border-[#1B7099]">Valor</th>
                    <th className="px-3 py-2 font-bold text-right border-r border-[#1B7099]">% do valor proposto</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Critério</th>
                    <th className="px-3 py-2 font-bold">Leitura de gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Valor proposto</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold border-r border-gray-300 whitespace-nowrap">263 450 432 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono border-r border-gray-300">100,0%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-semibold text-gray-700">Base bruta</td>
                    <td className="px-3 py-1.5 text-gray-800">Volume elevado, mas muito dependente de poucas propostas.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/20">
                    <td className="px-3 py-1.5 font-bold text-emerald-950 border-r border-gray-300">Valor aprovado</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-900 border-r border-gray-300 whitespace-nowrap">26 762 350 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-emerald-900 border-r border-gray-300">10,2%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-semibold text-emerald-800">Receita comercial contratada/ganha</td>
                    <td className="px-3 py-1.5 text-gray-800">Conversão financeira de apenas cerca de 10%; exige foco em fecho.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-rose-50/20">
                    <td className="px-3 py-1.5 font-bold text-rose-950 border-r border-gray-300">Valor perdido</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-rose-900 border-r border-gray-300 whitespace-nowrap">11 712 075 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono text-rose-900 border-r border-gray-300">4,4%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-rose-800">Oportunidades encerradas sem ganho</td>
                    <td className="px-3 py-1.5 text-gray-800">Inclui a correcção de 5 LINHAS, anteriormente omitida em Valor perdido.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Pipeline aberto</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-blue-900 border-r border-gray-300 whitespace-nowrap">224 976 007 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono border-r border-gray-300">85,4%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-medium text-gray-700">Oportunidades ainda abertas</td>
                    <td className="px-3 py-1.5 text-gray-800">É o principal activo comercial, mas ainda sem garantia de receita.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-amber-50/20">
                    <td className="px-3 py-1.5 font-bold text-amber-950 border-r border-gray-300">Forecast ponderado</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-amber-900 border-r border-gray-300 whitespace-nowrap">123 115 722 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-amber-900 border-r border-gray-300">46,7%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-semibold text-amber-800">Valor × probabilidade</td>
                    <td className="px-3 py-1.5 text-gray-800">Não deve ser confundido com facturação nem tesouraria disponível.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Gap para converter pipeline</td>
                    <td className="px-3 py-1.5 text-right font-mono font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">101 860 284 AOA</td>
                    <td className="px-3 py-1.5 text-right font-mono border-r border-gray-300">38,7%</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 text-gray-700">Pipeline não coberto pelo forecast</td>
                    <td className="px-3 py-1.5 text-gray-800">Montante que depende de melhoria de probabilidade, condições e decisão.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-gray-50">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Cobertura do forecast / meta equipa</td>
                    <td className="px-3 py-1.5 text-right font-mono font-black text-blue-900 border-r border-gray-300 whitespace-nowrap">364,8%</td>
                    <td className="px-3 py-1.5 text-right font-mono border-r border-gray-300 text-gray-400">-</td>
                    <td className="px-3 py-1.5 border-r border-gray-300 font-semibold text-gray-700">Forecast vs meta semanal agregada</td>
                    <td className="px-3 py-1.5 text-gray-800">Cobertura potencial confortável, porém com risco de concentração.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. CONCENTRAÇÃO E RISCO COMERCIAL */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              2. CONCENTRAÇÃO E RISCO COMERCIAL
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Indicador de risco</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Cálculo</th>
                    <th className="px-3 py-2 font-bold text-center border-r border-[#1B7099]">Resultado</th>
                    <th className="px-3 py-2 font-bold text-center border-r border-[#1B7099]">Sinal</th>
                    <th className="px-3 py-2 font-bold">Acção recomendada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Peso da UNITEL no valor proposto</td>
                    <td className="px-3 py-1.5 text-gray-700 border-r border-gray-300 font-mono text-[10px]">UNITEL / valor proposto</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-900 border-r border-gray-300">36,5%</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300">
                      <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">Alto</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Preparar negociação por cenários e evitar dependência de uma única adjudicação.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Peso da Luísa no valor proposto</td>
                    <td className="px-3 py-1.5 text-gray-700 border-r border-gray-300 font-mono text-[10px]">Carteira Luísa / valor proposto</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-900 border-r border-gray-300">58,1%</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300">
                      <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">Alto</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Distribuir prospecção e coaching para elevar a contribuição dos restantes comerciais.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-rose-50/10">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Comerciais sem aprovações</td>
                    <td className="px-3 py-1.5 text-gray-700 border-r border-gray-300 font-mono text-[10px]">Contagem de % meta = 0</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-rose-900 border-r border-gray-300">2</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300">
                      <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-rose-100 text-rose-900 border border-rose-300">Crítico</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Plano diário de recuperação, com qualificação e reunião acompanhada.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Propostas abertas de prioridade alta</td>
                    <td className="px-3 py-1.5 text-gray-700 border-r border-gray-300 font-mono text-[10px]">Prioridade Alta + CRM Aberto</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-900 border-r border-gray-300">6</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300">
                      <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-amber-100 text-amber-900 border border-amber-300">Prioritário</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Contacto com decisor em 48h, data formal de decisão e próximo passo no CRM.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Registos perdidos com causa documentada</td>
                    <td className="px-3 py-1.5 text-gray-700 border-r border-gray-300 font-mono text-[10px]">Revisão obrigatória pós-perda</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-900 border-r border-gray-300">2</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300">
                      <span className="px-2 py-0.5 rounded-xs font-bold text-[10px] bg-blue-100 text-blue-900 border border-blue-300">A melhorar</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Registar concorrente, preço, prazo, qualidade, relação e lição aprendida.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. CONTROLOS DE RECONCILIAÇÃO */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              3. CONTROLOS DE RECONCILIAÇÃO
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Controlo</th>
                    <th className="px-3 py-2 font-bold text-center border-r border-[#1B7099]">Resultado</th>
                    <th className="px-3 py-2 font-bold text-center border-r border-[#1B7099]">Estado</th>
                    <th className="px-3 py-2 font-bold">Observação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/10">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Proposto = aprovado + perdido + aberto</td>
                    <td className="px-3 py-1.5 text-center font-mono border-r border-gray-300 text-gray-400">-</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-xs font-extrabold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400">PASSA</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Diferença esperada: 0 AOA.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/10">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Valor perdido preenchido para todas as perdas</td>
                    <td className="px-3 py-1.5 text-center font-mono border-r border-gray-300 text-gray-400">-</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-xs font-extrabold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400">PASSA</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">A perda de 5 LINHAS foi corrigida para 8.468.775 AOA.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/10">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Forecast ≤ valor proposto</td>
                    <td className="px-3 py-1.5 text-center font-mono font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">140 334 709 AOA</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-xs font-extrabold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400">PASSA</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Diferença positiva confirma prudência matemática.</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/10">
                    <td className="px-3 py-1.5 font-bold text-gray-900 border-r border-gray-300">Forecast não tratado como receita</td>
                    <td className="px-3 py-1.5 text-center font-mono border-r border-gray-300 text-gray-400">-</td>
                    <td className="px-3 py-1.5 text-center border-r border-gray-300 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-xs font-extrabold text-[10px] bg-emerald-100 text-emerald-900 border border-emerald-400">PASSA</span>
                    </td>
                    <td className="px-3 py-1.5 text-gray-800">Forecast é indicador probabilístico; facturação exige adjudicação, entrega e documento fiscal.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

      {/* Section 6: ANÁLISE CRÍTICA E RECOMENDAÇÕES TÉCNICAS DE FECHO */}
      <div id="analise-tecnica" className="border border-gray-400 shadow-md overflow-hidden bg-white mt-6">
        
        {/* Main Header Banner */}
        <div className="bg-[#122442] text-white py-3 px-4 text-center border-b border-[#0d182b]">
          <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase">
            ANÁLISE CRÍTICA E RECOMENDAÇÕES TÉCNICAS DE FECHO
          </h2>
          <p className="text-xs italic font-sans text-blue-200 mt-0.5">
            Diagnóstico completo da actividade comercial | Semana de 20–25 de Julho de 2026
          </p>
        </div>

        <div className="p-3 space-y-4 font-sans">

          {/* 1. DIAGNÓSTICO CRÍTICO */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              1. DIAGNÓSTICO CRÍTICO
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[150px]">Dimensão</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[280px]">Constatação crítica</th>
                    <th className="px-3 py-2 font-bold min-w-[280px]">Implicação de gestão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Volume e conversão</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      O valor proposto cresceu, mas apenas cerca de 10% foi aprovado. O aumento de actividade ainda não se traduziu proporcionalmente em fechos.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Gerir por aprovação, margem e facturação, e não apenas por número e valor de propostas.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Concentração</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      UNITEL representa uma parcela material da carteira e Luísa Baltazar concentra a maior parte do valor proposto.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Uma decisão adiada pode deteriorar significativamente o forecast; diversificar carteira e responsabilidade comercial.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Performance desigual</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Ilídio Pedro e Marta de Oliveira superaram a meta; cinco comerciais ficaram abaixo de 70%, incluindo três com desempenho inferior a 20%.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Coaching orientado a negócios reais, acompanhamento de reuniões e plano diário de recuperação.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Qualidade do forecast</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      O forecast inclui propostas enviadas com probabilidade genérica de 40%–50%, sem evidência suficiente de orçamento, decisor ou data.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Rever probabilidades apenas com factos: necessidade, orçamento, autoridade, prazo e concorrência.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Disciplina de CRM</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Muitos registos têm próxima acção genérica e o mesmo próximo contacto, reduzindo a utilidade operacional.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Cada oportunidade deve ter acção concreta, responsável, data/hora, decisor e resultado esperado.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Perdas e dados</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      A perda de 5 LINHAS estava marcada como Perdida, mas o campo Valor perdido encontrava-se em zero.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Corrigir a reconciliação financeira e tornar obrigatória a validação dos campos antes do fecho semanal.
                    </td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 bg-gray-50/50">Fecho e operação</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Existem propostas aprovadas ainda tratadas como prioridade de fecho, quando o foco deveria migrar para PO, produção, entrega e facturação.
                    </td>
                    <td className="px-3 py-2 text-gray-800">
                      Separar pipeline comercial de carteira ganha/em execução para evitar dupla contagem e atrasos operacionais.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 2. TÉCNICAS DE FECHO POR TIPO DE OPORTUNIDADE */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              2. TÉCNICAS DE FECHO POR TIPO DE OPORTUNIDADE
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[140px]">Situação</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[150px]">Técnica</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[260px]">Pergunta/abordagem</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[220px]">Evidência exigida no CRM</th>
                    <th className="px-3 py-2 font-bold text-center min-w-[100px]">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">Negociação de alto valor</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-300">Fecho por plano de decisão</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 italic">
                      “Que validações faltam, quem decide e em que data podemos obter a decisão formal?”
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Decisor, critérios, concorrente, orçamento, data e próximo passo.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">48 horas</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">Cliente pede desconto</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-300">Troca de concessões</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Conceder apenas contra quantidade, pronto pagamento, redução de escopo, prazo maior ou adjudicação imediata.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Margem antes/depois, contrapartida e aprovação interna.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">Antes de rever preço</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">Sem resposta</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-300">Cadência multicanal</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      E-mail curto + chamada + WhatsApp institucional + contacto alternativo, sem repetição da mesma mensagem.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Tentativas, canal, contacto, resposta e data de encerramento.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">3 contactos/5 dias</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">PO/adjudicação pendente</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-300">Fecho administrativo</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Enviar minuta de PO, confirmar dados fiscais, condição de pagamento e responsável de compras.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Número PO, valor, prazo, pagamento e data prevista.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">48 horas</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300">Amostra ou prova técnica</td>
                    <td className="px-3 py-2 font-medium text-gray-800 border-r border-gray-300">Fecho por redução de risco</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Definir critério de aceitação, custo, prazo e compromisso após aprovação da amostra.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Amostra entregue, aprovador, critérios e decisão.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">Data acordada</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-rose-50/10">
                    <td className="px-3 py-2 font-bold text-rose-950 border-r border-gray-300">Proposta perdida</td>
                    <td className="px-3 py-2 font-medium text-rose-900 border-r border-gray-300">Win/loss review</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Confirmar causa real sem pressionar: preço, prazo, especificação, relação ou concorrente.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Motivo padronizado, concorrente e acção de recuperação.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">Até 2 dias</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40 bg-emerald-50/10">
                    <td className="px-3 py-2 font-bold text-emerald-950 border-r border-gray-300">Proposta aprovada</td>
                    <td className="px-3 py-2 font-medium text-emerald-900 border-r border-gray-300">Handover comercial–produção</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Checklist de arte, quantidades, local, prazo, recepção, facturação e cobrança.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">PO, ordem interna, marcos e responsável de entrega.</td>
                    <td className="px-3 py-2 text-center font-semibold text-gray-800 whitespace-nowrap">No próprio dia</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* 3. PLANO PRIORITÁRIO DE EXECUÇÃO — PRÓXIMOS 5 DIAS ÚTEIS */}
          <div className="border border-gray-300 rounded-xs overflow-hidden shadow-2xs">
            <div className="bg-[#1B365D] text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide border-b border-[#122442]">
              3. PLANO PRIORITÁRIO DE EXECUÇÃO — PRÓXIMOS 5 DIAS ÚTEIS
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                    <th className="px-2 py-2 font-bold text-center border-r border-[#1B7099] w-12">Prioridade</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[180px]">Oportunidade</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[130px]">Responsável</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[280px]">Acção de fecho</th>
                    <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[200px]">Resultado mínimo</th>
                    <th className="px-2 py-2 font-bold text-center min-w-[70px]">Prazo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300 text-gray-900 text-[11px]">
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">1</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      UNITEL — <span className="font-mono text-blue-900">96.124.800 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Luísa Baltazar</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Obter contraproposta formal e mapa de decisão; preparar cenários de quantidade/preço/prazo.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Data de decisão e condições aceites/rejeitadas.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">48h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">2</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      FINSTAR/ZAP — <span className="font-mono text-blue-900">21.161.250 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Luísa Baltazar</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Confirmar PO, decisor e data limite; usar prazo de produção como urgência legítima.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">PO ou data formal de adjudicação.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">48h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">3</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      DUBAI INVESTMENTS — <span className="font-mono text-blue-900">29.724.360 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Amélia Cassinda</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Validar orçamento e amostra; desconto apenas com contrapartida económica.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Reunião de decisão e margem protegida.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">72h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">4</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      ANGOLACA — <span className="font-mono text-blue-900">14.248.432,50 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Amélia Cassinda</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Reunião de clarificação técnica e priorização dos itens.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Lista de itens aprováveis e calendário.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">72h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">5</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      DP WORLD — <span className="italic text-gray-600 font-normal">carteira aberta</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">David Guedes</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Consolidar propostas, confirmar decisor e eliminar duplicação de contactos.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Plano único de decisão por oportunidade.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">48h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">6</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      GRUPO CASTEL — <span className="font-mono text-blue-900">6.002.100 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Fernando Leite</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Confirmar recepção, necessidade, orçamento e concorrência.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Qualificar ou encerrar com motivo.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">48h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">7</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      PROGRAMA ALIMENTAR — <span className="font-mono text-blue-900">7.060.875 AOA</span>
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">Marta de Oliveira</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Solicitar ponto formal e próximos requisitos de contratação.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Data e etapa de decisão.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">72h</td>
                  </tr>
                  <tr className="hover:bg-blue-50/40">
                    <td className="px-2 py-2 text-center font-bold font-mono text-gray-900 border-r border-gray-300 bg-gray-50">8</td>
                    <td className="px-3 py-2 font-bold text-gray-900 border-r border-gray-300 whitespace-nowrap">
                      BNI / PRODEL / TOPACK
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300 whitespace-nowrap font-medium">José Neto</td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">
                      Requalificar carteira; não oferecer desconto antes de conhecer a objecção real.
                    </td>
                    <td className="px-3 py-2 text-gray-800 border-r border-gray-300">Uma reunião qualificada e etapa seguinte por cliente.</td>
                    <td className="px-2 py-2 text-center font-mono font-bold text-gray-800">5 dias</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
