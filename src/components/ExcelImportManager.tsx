import React, { useState } from 'react';
import { Usuario, Deal, Cliente, Visita } from '../types';
import { FileSpreadsheet, Upload, Clipboard, CheckCircle2, AlertCircle, ArrowRight, RefreshCw, Layers, ShieldCheck, Database, UserCheck, Sliders, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import { BasePropostaRow } from '../data/baseDuasSemanasData';
import { extractFieldsFromRow } from '../utils/excelParser';

interface ExcelImportManagerProps {
  comerciais: Usuario[];
  loggedUser: Usuario;
  onImportPropostas?: (propostas: Partial<BasePropostaRow>[]) => void;
  onImportClientes?: (clientes: Partial<Cliente>[]) => void;
  onImportVisitas?: (visitas: Partial<Visita>[]) => void;
  onImportDeals?: (deals: Partial<Deal>[]) => void;
  onLogOperation?: (
    tipoAcao: 'criacao' | 'edicao' | 'exclusao' | 'status' | 'configuracao' | 'reversao' | 'importacao',
    entidade: 'deal' | 'cliente' | 'visita' | 'utilizador' | 'arquivo' | 'relatorio' | 'meta' | 'configuracao',
    entidadeId: string,
    descricao: string,
    dadosAnteriores?: any,
    dadosNovos?: any
  ) => void;
}

type ImportCategory = 'propostas' | 'clientes' | 'visitas' | 'deals';
type UserAssignmentMode = 'auto' | 'forced';

export default function ExcelImportManager({
  comerciais,
  loggedUser,
  onImportPropostas,
  onImportClientes,
  onImportVisitas,
  onImportDeals,
  onLogOperation
}: ExcelImportManagerProps) {
  const [activeCategory, setActiveCategory] = useState<ImportCategory>('propostas');
  const [inputMethod, setInputMethod] = useState<'paste' | 'file' | 'pdf'>('file');
  const [pastedText, setPastedText] = useState('');
  const [parsedRows, setParsedRows] = useState<any[]>([]);
  const [detectedHeaders, setDetectedHeaders] = useState<string[]>([]);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  
  // User assignment mode: auto detect vs force single user
  const [userAssignMode, setUserAssignMode] = useState<UserAssignmentMode>('auto');
  const [targetUserId, setTargetUserId] = useState<string>(comerciais[0]?.id || 'u9');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [importSuccessMsg, setImportSuccessMsg] = useState<string | null>(null);
  const [isServerImporting, setIsServerImporting] = useState(false);
  const [serverImportResult, setServerImportResult] = useState<any>(null);

  const handleImportFromServer = async () => {
    setIsServerImporting(true);
    setServerImportResult(null);
    try {
      const res = await fetch('/api/import-excel', { method: 'POST' });
      const data = await res.json();
      setServerImportResult(data);
      if (data.success) {
        // Reload the page so App.tsx fetches fresh data from server
        setTimeout(() => window.location.reload(), 2000);
      }
    } catch (err: any) {
      setServerImportResult({ success: false, error: err.message });
    } finally {
      setIsServerImporting(false);
    }
  };

  // Helper to safely format cell values for display and text parsing
  const formatCellValue = (val: any): string => {
    if (val === null || val === undefined) return '-';
    if (typeof val === 'object') {
      if (val instanceof Date) return val.toLocaleDateString('pt-PT');
      if (val.v !== undefined) return String(val.v);
      if (val.w !== undefined) return String(val.w);
      try { return JSON.stringify(val); } catch { return '-'; }
    }
    return String(val);
  };

  // Match commercial by name or email safely (never returns undefined)
  const findComercialMatch = (searchStr?: any): Usuario => {
    const defaultUser: Usuario = (comerciais && comerciais.length > 0)
      ? comerciais[0]
      : (loggedUser || {
          id: 'u_default',
          nome: 'Utilizador',
          email: 'user@gpa.co.ao',
          perfil: 'comercial',
          funcao: 'Comercial',
          metaMensal: 0,
          metaSemanal: 0,
          comissao: 0,
          pesoConversao: 1,
          telefone: '922000000',
          foto: '',
          status: 'ativo',
          silencioso: false
        });
    
    if (userAssignMode === 'forced') {
      return (comerciais && comerciais.find(c => c.id === targetUserId)) || defaultUser;
    }
    if (!searchStr) {
      return (comerciais && comerciais.find(c => c.id === targetUserId)) || defaultUser;
    }
    
    const strVal = formatCellValue(searchStr).toLowerCase().trim();
    if (!strVal || strVal === '-') return defaultUser;

    const match = (comerciais || []).find(c =>
      (c.email && c.email.toLowerCase().includes(strVal)) ||
      (c.nome && c.nome.toLowerCase().includes(strVal)) ||
      (c.nome && strVal.includes(c.nome.toLowerCase().split(' ')[0]))
    );
    return match || defaultUser;
  };

  // Auto-map headers to standard CRM fields
  const autoMapHeaders = (headers: string[]) => {
    const mapping: Record<string, string> = {};

    headers.forEach(h => {
      const lower = h.toLowerCase().trim();
      if (lower.includes('semana') || lower.includes('período') || lower.includes('periodo')) mapping['semana'] = h;
      else if (lower.includes('cliente') || lower.includes('empresa') || lower.includes('organização')) mapping['cliente'] = h;
      else if (lower.includes('serviço') || lower.includes('servico') || lower.includes('descrição') || lower.includes('produto')) mapping['servico'] = h;
      else if (lower.includes('valor') || lower.includes('montante') || lower.includes('preço') || lower.includes('orcamento')) mapping['valor'] = h;
      else if (lower.includes('estado') || lower.includes('status') || lower.includes('fase')) mapping['estado'] = h;
      else if (lower.includes('comercial') || lower.includes('gestor') || lower.includes('vendedor') || lower.includes('responsável')) mapping['comercial'] = h;
      else if (lower.includes('data') || lower.includes('envio') || lower.includes('dataenvio')) mapping['data'] = h;
      else if (lower.includes('contacto') || lower.includes('nome')) mapping['contacto'] = h;
      else if (lower.includes('nif')) mapping['nif'] = h;
      else if (lower.includes('telefone') || lower.includes('telemóvel') || lower.includes('celular')) mapping['telefone'] = h;
      else if (lower.includes('cidade') || lower.includes('província') || lower.includes('local')) mapping['local'] = h;
      else if (lower.includes('obs') || lower.includes('observações')) mapping['observacoes'] = h;
    });

    setColumnMapping(mapping);
  };

  // Parse TSV (Copied from Excel) or CSV
  const handleParsePastedText = () => {
    if (!pastedText.trim()) return;
    setIsProcessing(true);

    try {
      const lines = pastedText.trim().split('\n');
      if (lines.length === 0) return;

      const firstLine = lines[0];
      let delimiter = '\t';
      if (firstLine.includes('\t')) delimiter = '\t';
      else if (firstLine.includes(';')) delimiter = ';';
      else if (firstLine.includes(',')) delimiter = ',';

      const headers = lines[0].split(delimiter).map(h => h.trim().replace(/^"|"$/g, ''));
      const rows: any[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^"|"$/g, ''));
        const rowObj: any = {};

        headers.forEach((h, idx) => {
          rowObj[h || `col_${idx}`] = cols[idx] || '';
        });

        rowObj._cols = cols;
        rows.push(rowObj);
      }

      setDetectedHeaders(headers);
      autoMapHeaders(headers);
      setParsedRows(rows);
    } catch (err) {
      alert('Erro ao processar os dados copiados do Excel. Certifique-se que copiou as linhas com o cabeçalho.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle File Upload (.xlsx, .xls, .csv)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();

    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const workbook = XLSX.read(buffer, { type: 'array' });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          alert('O ficheiro Excel não contém folhas de cálculo válidas.');
          return;
        }

        const allRows: any[] = [];
        const combinedHeadersSet = new Set<string>();

        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const jsonRows: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
          jsonRows.forEach(r => {
            r._sheetName = sheetName;
            Object.keys(r).filter(k => k && !k.startsWith('__EMPTY') && k !== '_sheetName').forEach(k => combinedHeadersSet.add(k));
            allRows.push(r);
          });
        });

        if (allRows.length > 0) {
          const headers = Array.from(combinedHeadersSet);
          setDetectedHeaders(headers);
          autoMapHeaders(headers);
          setParsedRows(allRows);
        } else {
          alert('O ficheiro Excel parece estar vazio ou sem registos.');
        }
      } catch (err) {
        console.error('Erro na leitura do Excel:', err);
        alert('Erro ao ler o ficheiro Excel. Certifique-se que é um formato válido (.xlsx, .xls, .csv).');
      } finally {
        setIsProcessing(false);
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsProcessing(true);
    setImportSuccessMsg(null);
    try {
      const formData = new FormData();
      formData.append('pdf', file);
      
      const res = await fetch('/api/import-pdf', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      
      if (data.success) {
        setImportSuccessMsg(`PDF processado com sucesso pela IA! Foram importadas propostas.`);
        setTimeout(() => window.location.reload(), 2000);
      } else {
        alert('Erro ao processar PDF: ' + data.error);
      }
    } catch (err: any) {
      alert('Erro de rede: ' + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Execute Import into CRM State (Merge missing data only)
  const handleConfirmImport = () => {
    if (parsedRows.length === 0) return;

    setIsProcessing(true);
    let count = 0;

    const getVal = (row: any, mapKey: string, fallbacks: string[]) => {
      if (columnMapping[mapKey] && row[columnMapping[mapKey]]) {
        return row[columnMapping[mapKey]];
      }
      for (const fb of fallbacks) {
        if (row[fb]) return row[fb];
      }
      return '';
    };

    if (activeCategory === 'propostas') {
      const propostasToImport: Partial<BasePropostaRow>[] = parsedRows.map((row, idx) => {
        const rawComercial = getVal(row, 'comercial', ['Gestor', 'Comercial', 'Responsável', 'Vendedor']);
        const matchedUser = findComercialMatch(rawComercial);

        const valRaw = getVal(row, 'valor', ['Valor', 'Valor Proposta', 'Montante']) || row._cols?.[3] || '0';
        const valNum = parseFloat(String(valRaw).replace(/[^\d,-]/g, '').replace(',', '.')) || 0;
        const valFormatted = `${valNum.toLocaleString('pt-PT', { minimumFractionDigits: 2 })} AOA`;

        const estadoStr = getVal(row, 'estado', ['Estado', 'Status']) || 'Proposta enviada';

        const rawSemana = getVal(row, 'semana', ['Semana', 'Período', 'Periodo', 'Folha', 'Mês', 'Mes', 'Ref']);
        const finalSemana = rawSemana || (row._sheetName && row._sheetName !== 'Sheet1' ? row._sheetName : 'Semana Em Curso');

        return {
          id: Date.now() + idx,
          semana: finalSemana,
          cliente: getVal(row, 'cliente', ['Cliente', 'Empresa']) || 'Cliente Importado',
          servico: getVal(row, 'servico', ['Serviço', 'Descrição', 'Produto']) || 'Serviços Diversos',
          valorProposta: valFormatted,
          valorAprovado: estadoStr.toLowerCase().includes('aprov') ? valFormatted : '0,00 AOA',
          valorPerdido: estadoStr.toLowerCase().includes('perdid') ? valFormatted : '0,00 AOA',
          estadoProposta: estadoStr,
          gestorComercial: matchedUser.nome,
          dataEnvio: getVal(row, 'data', ['Data', 'Data Envio']) || new Date().toLocaleDateString('pt-PT'),
          observacoes: getVal(row, 'observacoes', ['Observações', 'Obs']) || `Importado via Excel para ${matchedUser.nome}`
        };
      });

      if (onImportPropostas) onImportPropostas(propostasToImport);
      count = propostasToImport.length;
    } else if (activeCategory === 'clientes') {
      const clientesToImport: Partial<Cliente>[] = parsedRows.map((row, idx) => {
        const rawComercial = getVal(row, 'comercial', ['Responsável', 'Comercial', 'Vendedor']);
        const matchedUser = findComercialMatch(rawComercial);

        return {
          id: `c_imp_${Date.now()}_${idx}`,
          nome: getVal(row, 'contacto', ['Contacto', 'Nome', 'Cliente']) || 'Contacto Importado',
          empresa: getVal(row, 'cliente', ['Empresa', 'Cliente']) || 'Empresa Importada',
          nif: String(getVal(row, 'nif', ['NIF', 'Nif']) || '541' + Math.floor(10000000 + Math.random() * 90000000)),
          telefone: String(getVal(row, 'telefone', ['Telefone', 'Telemóvel', 'Contacto']) || '922000000'),
          provincia: getVal(row, 'local', ['Província', 'Cidade', 'Local']) || 'Luanda',
          segmento: 'Geral',
          status: 'ativo',
          responsavel: matchedUser.id,
          ultimaVisita: new Date().toISOString().split('T')[0]
        };
      });

      if (onImportClientes) onImportClientes(clientesToImport);
      count = clientesToImport.length;
    } else if (activeCategory === 'visitas') {
      const visitasToImport: Partial<Visita>[] = parsedRows.map((row, idx) => {
        const rawComercial = getVal(row, 'comercial', ['Comercial', 'Responsável', 'Vendedor']);
        const matchedUser = findComercialMatch(rawComercial);

        return {
          id: `v_imp_${Date.now()}_${idx}`,
          clienteNome: getVal(row, 'cliente', ['Cliente', 'Empresa']) || 'Cliente',
          empresa: getVal(row, 'cliente', ['Empresa', 'Cliente']) || 'Empresa',
          comercialNome: matchedUser.nome,
          data: getVal(row, 'data', ['Data']) || new Date().toISOString().split('T')[0],
          hora: '10:00',
          localizacao: getVal(row, 'local', ['Local', 'Endereço']) || 'Luanda',
          resultado: getVal(row, 'estado', ['Resultado', 'Status']) || 'Positivo',
          produtos: getVal(row, 'servico', ['Produtos', 'Serviços']) || 'Apresentação Comercial',
          necessidade: 'Reunião semanal'
        };
      });

      if (onImportVisitas) onImportVisitas(visitasToImport);
      count = visitasToImport.length;
    } else if (activeCategory === 'deals') {
      const dealsToImport: Partial<Deal>[] = parsedRows.map((row, idx) => {
        const ext = extractFieldsFromRow(row, idx);
        const rawComercial = getVal(row, 'comercial', ['Comercial', 'Vendedor', 'Responsável']) || ext.comercialNome;
        const matchedUser = findComercialMatch(rawComercial);

        return {
          id: `d_imp_${Date.now()}_${idx}`,
          clienteNome: ext.clienteNome,
          empresa: ext.empresa,
          titulo: ext.titulo,
          valor: ext.valor,
          valorAprovado: ext.valorAprovado,
          valorPerdido: ext.valorPerdido,
          etapa: ext.etapa,
          comercialId: matchedUser.id,
          comercialNome: matchedUser.nome,
          prioridade: ext.prioridade,
          diasAberto: ext.diasAberto,
          semana: ext.semana,
          probabilidade: ext.probabilidade,
          proximaAcao: ext.proximaAcao,
          proximoContacto: ext.proximoContacto,
          observacoes: ext.observacoes,
          observacaoFinal: ext.observacaoFinal,
          dataEnvio: ext.dataEnvio,
          dataAprovacao: ext.dataAprovacao,
          dataPerda: ext.dataPerda,
          classeCliente: ext.classeCliente,
          crmStatus: ext.crmStatus
        };
      });

      if (onImportDeals) onImportDeals(dealsToImport);
      count = dealsToImport.length;
    }

    if (onLogOperation) {
      onLogOperation(
        'importacao',
        'configuracao',
        'excel_import',
        `Importação não-destrutiva de ${count} registos de ${activeCategory.toUpperCase()} efetuada por ${loggedUser.nome}`
      );
    }

    setIsProcessing(false);
    setImportSuccessMsg(`✅ Fusão Concluída! ${count} registos foram extraídos e guardados no CRM para cada utilizador correspondente. Nenhum dado antigo foi apagado!`);
    setParsedRows([]);
    setPastedText('');

    setTimeout(() => {
      setImportSuccessMsg(null);
    }, 7000);
  };

  return (
    <div className="bg-white rounded-xl border border-blue-100 p-6 shadow-sm space-y-6 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <h4 className="text-sm font-black text-[#003366] uppercase tracking-wide flex items-center gap-2">
            <FileSpreadsheet size={18} className="text-emerald-600" />
            Extração & Cópia de Dados Excel sem Apagar Dados Antigos
          </h4>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Preencha semanas, dias, clientes e agenda extraindo dados diretamente do Excel. O sistema deteta campos em falta e adiciona aos respetivos utilizadores sem eliminar ou alterar nada guardado.
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 px-3 py-1 rounded-full text-xs font-extrabold">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Extração Apenas de Faltas</span>
        </div>
      </div>

      {importSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-3 animate-fade-in">
          <CheckCircle2 size={20} className="text-emerald-600 shrink-0" />
          <p>{importSuccessMsg}</p>
        </div>
      )}

      {/* IMPORTAR DA PASTA DUCUMENTOS (Server-Side) */}
      <div className="p-4 rounded-xl border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h5 className="text-xs font-black text-blue-900 uppercase tracking-wide flex items-center gap-2">
              <Database size={15} className="text-blue-600" />
              📂 Importação Automática – Pasta Ducumentos (Servidor)
            </h5>
            <p className="text-[11px] text-blue-700 font-medium mt-0.5">
              Importa todos os ficheiros Excel (.xlsx) da pasta <strong>Ducumentos</strong> no servidor. Clientes, propostas, pipeline e histórico semanal são adicionados automaticamente sem apagar dados existentes.
            </p>
          </div>
          <button
            onClick={handleImportFromServer}
            disabled={isServerImporting}
            className={`shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer ${
              isServerImporting
                ? 'bg-blue-300 text-blue-800 cursor-not-allowed'
                : 'bg-blue-700 hover:bg-blue-800 text-white shadow-md hover:shadow-blue-500/30'
            }`}
          >
            {isServerImporting ? (
              <><RefreshCw size={14} className="animate-spin" /> A importar...</>
            ) : (
              <><Upload size={14} /> Importar Excel do Servidor</>
            )}
          </button>
        </div>

        {serverImportResult && (
          <div className={`p-3 rounded-lg text-xs font-bold ${serverImportResult.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' : 'bg-red-50 border border-red-200 text-red-900'}`}>
            {serverImportResult.success ? (
              <>
                ✅ Importação concluída! <strong>{serverImportResult.filesProcessed}</strong> ficheiro(s) processado(s).<br />
                📊 Adicionado: <strong>{serverImportResult.imported?.deals}</strong> propostas, <strong>{serverImportResult.imported?.clients}</strong> clientes, <strong>{serverImportResult.imported?.comerciais}</strong> comerciais.<br />
                <span className="text-emerald-700">A recarregar o CRM em 2 segundos...</span>
              </>
            ) : (
              <>❌ Erro: {serverImportResult.error}</>
            )}
          </div>
        )}
      </div>

      {/* 1. Category Selection */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
          1. Selecionar Destino dos Dados:
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'propostas', label: 'Propostas & Metas Semanais', icon: FileSpreadsheet },
            { id: 'clientes', label: 'Clientes & Contactos', icon: Database },
            { id: 'visitas', label: 'Agenda & Visitas', icon: Layers },
            { id: 'deals', label: 'Pipeline de Negócios', icon: CheckCircle2 }
          ].map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id as ImportCategory);
                  setParsedRows([]);
                }}
                className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition cursor-pointer ${
                  isActive
                    ? 'bg-[#003366] text-white border-[#003366] shadow-xs'
                    : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <Icon size={16} />
                <span className="text-center">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. User Assignment Config */}
      <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
        <label className="text-xs font-bold text-blue-900 uppercase tracking-wide flex items-center gap-1.5">
          <UserCheck size={15} className="text-blue-600" />
          2. Atribuição de Utilizador (Vendedor):
        </label>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="userAssign"
              checked={userAssignMode === 'auto'}
              onChange={() => setUserAssignMode('auto')}
              className="accent-blue-600"
            />
            <span>Auto-detetar pela coluna do Excel (Vendedor / Gestor)</span>
          </label>

          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer">
            <input
              type="radio"
              name="userAssign"
              checked={userAssignMode === 'forced'}
              onChange={() => setUserAssignMode('forced')}
              className="accent-blue-600"
            />
            <span>Atribuir TODOS os registos a um Utilizador específico:</span>
          </label>

          {userAssignMode === 'forced' && (
            <select
              value={targetUserId}
              onChange={e => setTargetUserId(e.target.value)}
              className="bg-white border border-blue-300 text-blue-900 font-bold px-3 py-1.5 rounded-lg text-xs focus:outline-none cursor-pointer"
            >
              {comerciais.map(c => (
                <option key={c.id} value={c.id}>
                  {c.nome} ({c.email}) - {c.perfil === 'admin' ? '👑 Admin' : '👤 Comercial'}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* 3. File Upload or Paste */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">
            3. Selecionar Método de Leitura:
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setInputMethod('file')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                inputMethod === 'file'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload size={13} /> Carregar Ficheiro .XLSX / .CSV
            </button>
            <button
              onClick={() => setInputMethod('paste')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                inputMethod === 'paste'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Clipboard size={13} /> Copiar & Colar Direto
            </button>
            <button
              onClick={() => setInputMethod('pdf')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                inputMethod === 'pdf'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Upload size={13} /> Importar PDF (IA)
            </button>
          </div>
        </div>

        {inputMethod === 'file' && (
          <div className="border-2 border-dashed border-blue-200 hover:border-blue-400 transition rounded-xl p-6 text-center bg-gray-50/50">
            <Upload size={32} className="mx-auto text-blue-600 mb-2" />
            <p className="text-xs font-bold text-gray-800">Clique para selecionar o ficheiro Excel (.xlsx, .xls) ou CSV</p>
            <p className="text-[11px] text-gray-500 mt-1">O sistema lê todas as linhas e faz o mapeamento inteligente de campos.</p>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileUpload}
              className="mt-3 block mx-auto text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer"
            />
          </div>
        )}

        {inputMethod === 'pdf' && (
          <div className="border-2 border-dashed border-purple-300 hover:border-purple-500 transition rounded-xl p-6 text-center bg-purple-50/50">
            <Upload size={32} className="mx-auto text-purple-600 mb-2" />
            <p className="text-xs font-bold text-gray-800">Selecione o ficheiro PDF com as propostas</p>
            <p className="text-[11px] text-gray-500 mt-1">A Inteligência Artificial (Gemini) vai ler o documento e extrair as propostas.</p>
            <input
              type="file"
              accept=".pdf"
              onChange={handlePdfUpload}
              className="mt-3 block mx-auto text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-purple-600 file:text-white hover:file:bg-purple-700 cursor-pointer"
            />
          </div>
        )}

        {inputMethod === 'paste' && (
          <div className="space-y-2">
            <textarea
              value={pastedText}
              onChange={e => setPastedText(e.target.value)}
              placeholder={`Cole as linhas copiadas do Excel (Ctrl+V ou Cmd+V)... \n\nExemplo:\nSemana\tCliente\tServiço\tValor\tVendedor\n03–07 Ago\tUNITEL\tConsultoria IT\t15 000 000\tSuzete Francisco`}
              rows={5}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:outline-none focus:border-blue-500 focus:bg-white"
            />
            <div className="flex justify-end">
              <button
                onClick={handleParsePastedText}
                disabled={!pastedText.trim() || isProcessing}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-lg text-xs transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                <RefreshCw size={13} className={isProcessing ? 'animate-spin' : ''} />
                Ler Linhas Copiadas
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 4. Column Mapper and Row Preview */}
      {parsedRows.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-800 uppercase tracking-wide flex items-center gap-1.5">
              <CheckCircle2 size={16} className="text-emerald-600" />
              {parsedRows.length} Linhas Identificadas no Ficheiro
            </span>
            <button
              onClick={() => setParsedRows([])}
              className="text-xs text-red-600 hover:underline font-bold"
            >
              Cancelar & Limpar
            </button>
          </div>

          {/* Column Mapper Selector */}
          {detectedHeaders.length > 0 && (
            <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide flex items-center gap-1.5">
                <Sliders size={14} className="text-blue-600" />
                Mapeamento de Colunas (Selecione a coluna correspondente de cada campo):
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                {[
                  { key: 'semana', label: 'Semana / Período' },
                  { key: 'cliente', label: 'Cliente / Empresa' },
                  { key: 'servico', label: 'Serviço / Descrição' },
                  { key: 'valor', label: 'Valor / Montante' },
                  { key: 'estado', label: 'Estado / Status' },
                  { key: 'comercial', label: 'Vendedor / Responsável' },
                  { key: 'data', label: 'Data Envio / Registo' }
                ].map(col => (
                  <div key={col.key} className="flex flex-col gap-1">
                    <label className="text-[10px] font-bold text-gray-500 uppercase">{col.label}:</label>
                    <select
                      value={columnMapping[col.key] || ''}
                      onChange={e => setColumnMapping({ ...columnMapping, [col.key]: e.target.value })}
                      className="bg-white border border-gray-200 text-gray-800 rounded p-1.5 text-xs font-medium focus:outline-none"
                    >
                      <option value="">-- Não mapear --</option>
                      {detectedHeaders.map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-100 text-gray-700 font-extrabold sticky top-0 border-b border-gray-200">
                <tr>
                  <th className="p-2 border-r">#</th>
                  {detectedHeaders.slice(0, 6).map(h => (
                    <th key={h} className="p-2 border-r truncate">{h}</th>
                  ))}
                  <th className="p-2">Utilizador Final Atribuído</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedRows.map((row, idx) => {
                  const rawCom = columnMapping['comercial'] ? row[columnMapping['comercial']] : (row['Comercial'] || row['Gestor'] || row['Responsável'] || '');
                  const matched = findComercialMatch(rawCom);

                  return (
                    <tr key={idx} className="hover:bg-blue-50/40 font-medium">
                      <td className="p-2 border-r text-gray-400">{idx + 1}</td>
                      {(detectedHeaders || []).slice(0, 6).map(h => (
                        <td key={h} className="p-2 border-r truncate max-w-[150px]">
                          {formatCellValue(row[h])}
                        </td>
                      ))}
                      <td className="p-2 text-blue-900 font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {matched?.nome || 'Utilizador'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex items-center justify-between">
            <p className="text-[11px] text-gray-500 font-semibold">
              🔒 Garantia de Integridade: Todos os dados anteriores continuam 100% seguros e guardados.
            </p>
            <button
              onClick={handleConfirmImport}
              disabled={isProcessing}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Database size={15} />
              <span>🚀 Adicionar Dados ao CRM ({parsedRows.length} Registos)</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
