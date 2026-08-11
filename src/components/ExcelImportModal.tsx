import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  FileSpreadsheet, 
  Upload, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowRight, 
  Database,
  Layers,
  Users,
  Building2,
  Calendar
} from 'lucide-react';
import { Deal, Cliente, Visita, Usuario } from '../types';
import { extractFieldsFromRow } from '../utils/excelParser';

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  comerciais: Usuario[];
  clients: Cliente[];
  onImportDeals: (newDeals: Deal[], rawRows?: any[]) => void;
  onImportClients: (newClients: Cliente[]) => void;
  onImportVisits: (newVisits: Visita[]) => void;
  currentDeals: Deal[];
  currentClients: Cliente[];
  currentVisits: Visita[];
}

export const ExcelImportModal: React.FC<ExcelImportModalProps> = ({
  isOpen,
  onClose,
  comerciais,
  clients,
  onImportDeals,
  onImportClients,
  onImportVisits,
  currentDeals,
  currentClients,
  currentVisits
}) => {
  const [importType, setImportType] = useState<'deals' | 'clients' | 'visits'>('deals');
  const [file, setFile] = useState<File | null>(null);
  const [rawRows, setRawRows] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [parsedItems, setParsedItems] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  // Helper to normalize strings for flexible column matching
  const normalizeHeader = (h: string) => h.toString().toLowerCase().trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const buffer = evt.target?.result;
        const wb = XLSX.read(buffer, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        
        const jsonData = XLSX.utils.sheet_to_json<any>(ws, { header: 1 });
        if (!jsonData || jsonData.length < 2) {
          setErrorMsg('O ficheiro Excel está vazio ou não possui linhas de dados suficientes.');
          setIsProcessing(false);
          return;
        }

        const rawHeaders = (jsonData[0] as any[]).map(h => String(h || '').trim());
        const rowData = XLSX.utils.sheet_to_json<any>(ws);

        setHeaders(rawHeaders);
        setRawRows(rowData);

        // Process initial mapping
        processMapping(rowData, importType, rawHeaders);
        setIsProcessing(false);
      } catch (err: any) {
        console.error('Erro ao ler Excel:', err);
        setErrorMsg('Erro ao ler o ficheiro Excel. Verifique se o formato é .xlsx, .xls ou .csv.');
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(uploadedFile);
  };

  const processMapping = (data: any[], type: 'deals' | 'clients' | 'visits', currentHeaders: string[]) => {
    if (type === 'deals') {
      const deals: Deal[] = data.map((row, idx) => {
        const ext = extractFieldsFromRow(row, idx);
        
        let matchedComm = comerciais.find(c =>
          c.nome.toLowerCase().includes(ext.comercialNome.toLowerCase()) ||
          ext.comercialNome.toLowerCase().includes(c.nome.toLowerCase())
        );
        if (!matchedComm && comerciais.length > 0) {
          matchedComm = comerciais[0];
        }

        return {
          id: `excel_d_${Date.now()}_${idx}`,
          clienteNome: ext.clienteNome,
          empresa: ext.empresa,
          titulo: ext.titulo,
          valor: ext.valor,
          valorAprovado: ext.valorAprovado,
          valorPerdido: ext.valorPerdido,
          etapa: ext.etapa,
          comercialId: matchedComm ? matchedComm.id : 'u9',
          comercialNome: matchedComm ? matchedComm.nome : ext.comercialNome,
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
      setParsedItems(deals);
    } else if (type === 'clients') {
      const clientsList: Cliente[] = data.map((row, idx) => {
        let empresa = '';
        let nome = '';
        let nif = '';
        let telefone = '';
        let provincia = 'Luanda';
        let segmento = 'Geral';
        let endereco = '';

        Object.keys(row).forEach(key => {
          const normKey = normalizeHeader(key);
          const val = row[key];

          if (normKey.includes('empresa') || normKey.includes('razao')) {
            empresa = String(val || '').trim();
          } else if (normKey.includes('nome') || normKey.includes('contacto') || normKey.includes('pessoa')) {
            nome = String(val || '').trim();
          } else if (normKey.includes('nif')) {
            nif = String(val || '').trim();
          } else if (normKey.includes('tel') || normKey.includes('telemovel') || normKey.includes('fone')) {
            telefone = String(val || '').trim();
          } else if (normKey.includes('provinc')) {
            provincia = String(val || '').trim() || 'Luanda';
          } else if (normKey.includes('segment') || normKey.includes('setor') || normKey.includes('area')) {
            segmento = String(val || '').trim() || 'Geral';
          } else if (normKey.includes('ender') || normKey.includes('local')) {
            endereco = String(val || '').trim();
          }
        });

        if (!empresa) empresa = nome || `Empresa Excel #${idx + 1}`;
        if (!nome) nome = `Contacto ${empresa}`;

        return {
          id: `excel_c_${Date.now()}_${idx}`,
          nome,
          empresa,
          nif: nif || `54175${Math.floor(10000 + Math.random() * 90000)}`,
          telefone: telefone || '922000000',
          provincia,
          segmento,
          status: 'ativo',
          responsavel: 'u9',
          ultimaVisita: new Date().toISOString().split('T')[0],
          proximaVisita: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
          endereco
        };
      });
      setParsedItems(clientsList);
    } else if (type === 'visits') {
      const visitsList: Visita[] = data.map((row, idx) => {
        let empresa = '';
        let clienteNome = '';
        let comercialNome = '';
        let dataVisita = new Date().toISOString().split('T')[0];
        let horaVisita = '10:00';
        let localizacao = '';
        let resultado = 'Positivo';
        let produtos = 'Apresentação Comercial';
        let necessidade = '';

        Object.keys(row).forEach(key => {
          const normKey = normalizeHeader(key);
          const val = row[key];

          if (normKey.includes('empresa')) empresa = String(val || '').trim();
          else if (normKey.includes('cliente') || normKey.includes('nome')) clienteNome = String(val || '').trim();
          else if (normKey.includes('comercial') || normKey.includes('vendedor')) comercialNome = String(val || '').trim();
          else if (normKey.includes('data')) dataVisita = String(val || '').trim();
          else if (normKey.includes('hora')) horaVisita = String(val || '').trim();
          else if (normKey.includes('local')) localizacao = String(val || '').trim();
          else if (normKey.includes('result')) resultado = String(val || '').trim();
          else if (normKey.includes('produt')) produtos = String(val || '').trim();
          else if (normKey.includes('neces') || normKey.includes('obs')) necessidade = String(val || '').trim();
        });

        return {
          id: `excel_v_${Date.now()}_${idx}`,
          clienteNome: clienteNome || empresa || 'Cliente',
          empresa: empresa || clienteNome || 'Empresa',
          comercialNome: comercialNome || 'David Neto',
          data: dataVisita,
          hora: horaVisita,
          localizacao: localizacao || 'Escritório do Cliente',
          resultado,
          produtos,
          necessidade
        };
      });
      setParsedItems(visitsList);
    }
  };

  const handleTypeChange = (newType: 'deals' | 'clients' | 'visits') => {
    setImportType(newType);
    if (rawRows.length > 0) {
      processMapping(rawRows, newType, headers);
    }
  };

  const handleConfirmImport = () => {
    if (!parsedItems || parsedItems.length === 0) {
      setErrorMsg('Nenhum dado válido para importar.');
      return;
    }

    if (importType === 'deals') {
      onImportDeals(parsedItems as Deal[], rawRows);
    } else if (importType === 'clients') {
      onImportClients(parsedItems as Cliente[]);
    } else if (importType === 'visits') {
      onImportVisits(parsedItems as Visita[]);
    }

    setSuccessMsg(`Sucesso! ${parsedItems.length} registos importados e sincronizados na nuvem.`);
    setTimeout(() => {
      onClose();
      // Reset state
      setFile(null);
      setParsedItems([]);
      setRawRows([]);
      setSuccessMsg(null);
    }, 1200);
  };

  // Download Sample Excel Template
  const handleDownloadSample = () => {
    let sampleData: any[] = [];
    let filename = 'modelo_importacao_crm.xlsx';

    if (importType === 'deals') {
      filename = 'modelo_importacao_negocios_gpa.xlsx';
      sampleData = [
        {
          "Cliente/Empresa": "MOCASAS Lda",
          "Título da Proposta": "Fornecimento de Fardas e Brindes 2026",
          "Valor (AOA Kz)": 15000000,
          "Etapa": "Proposta",
          "Comercial Responsável": "David Neto",
          "Prioridade": "Alta",
          "Observações": "Apresentação aprovada pela gerência"
        },
        {
          "Cliente/Empresa": "SONANGOL EP",
          "Título da Proposta": "Serviço de Sinalética Corporativa",
          "Valor (AOA Kz)": 28500000,
          "Etapa": "Negociação",
          "Comercial Responsável": "Amélia Cassinda",
          "Prioridade": "Alta",
          "Observações": "Fase final de elaboração contratual"
        }
      ];
    } else if (importType === 'clients') {
      filename = 'modelo_importacao_clientes_gpa.xlsx';
      sampleData = [
        {
          "Empresa": "BFA Banco de Fomento Angola",
          "Nome do Contacto": "João Manuel",
          "NIF": "5417599000",
          "Telefone": "923111000",
          "Província": "Luanda",
          "Segmento": "Serviços Financeiros",
          "Endereço": "Avenida 4 de Fevereiro, Luanda"
        }
      ];
    } else {
      filename = 'modelo_importacao_visitas_gpa.xlsx';
      sampleData = [
        {
          "Empresa": "ENDE",
          "Nome do Cliente": "Eng. Antonio",
          "Comercial Responsável": "David Neto",
          "Data": "2026-07-25",
          "Hora": "10:30",
          "Localização": "Sede ENDE Luanda",
          "Resultado": "Positivo",
          "Produtos": "Brindes e Fardas",
          "Necessidade": "Orçamento para 500 colaboradores"
        }
      ];
    }

    const ws = XLSX.utils.json_to_sheet(sampleData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Dados");
    XLSX.writeFile(wb, filename);
  };

  // Export current CRM Database to Excel file
  const handleExportAllToExcel = () => {
    const wb = XLSX.utils.book_new();

    // Deals sheet
    const dealsData = currentDeals.map(d => ({
      "ID": d.id,
      "Cliente/Empresa": d.clienteNome,
      "Proposta/Título": d.titulo,
      "Valor (Kz)": d.valor,
      "Etapa": d.etapa.toUpperCase(),
      "Comercial": d.comercialNome,
      "Prioridade": d.prioridade,
      "Dias Aberto": d.diasAberto,
      "Observações": d.observacaoFinal || ''
    }));
    const wsDeals = XLSX.utils.json_to_sheet(dealsData);
    XLSX.utils.book_append_sheet(wb, wsDeals, "Negócios (Pipeline)");

    // Clients sheet
    const clientsData = currentClients.map(c => ({
      "ID": c.id,
      "Empresa": c.empresa,
      "Nome Contacto": c.nome,
      "NIF": c.nif,
      "Telefone": c.telefone,
      "Província": c.provincia,
      "Segmento": c.segmento,
      "Status": c.status,
      "Última Visita": c.ultimaVisita,
      "Próxima Visita": c.proximaVisita
    }));
    const wsClients = XLSX.utils.json_to_sheet(clientsData);
    XLSX.utils.book_append_sheet(wb, wsClients, "Clientes");

    // Visits sheet
    const visitsData = currentVisits.map(v => ({
      "ID": v.id,
      "Empresa": v.empresa,
      "Cliente": v.clienteNome,
      "Comercial": v.comercialNome,
      "Data": v.data,
      "Hora": v.hora,
      "Localização": v.localizacao,
      "Resultado": v.resultado,
      "Produtos": v.produtos,
      "Necessidade": v.necessidade
    }));
    const wsVisits = XLSX.utils.json_to_sheet(visitsData);
    XLSX.utils.book_append_sheet(wb, wsVisits, "Visitas");

    XLSX.writeFile(wb, `GPA_Angola_CRM_Export_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const totalValorImport = importType === 'deals' 
    ? (parsedItems as Deal[]).reduce((sum, d) => sum + (d.valor || 0), 0)
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shadow-inner">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                Importação e Extração de Excel (.xlsx)
              </h2>
              <p className="text-xs text-slate-400">
                Extraia dados da sua folha de cálculo e actualize automaticamente o Dashboard do CRM
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">

          {/* Action Header bar: Download Template & Export Current Data */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-950/50 rounded-xl border border-slate-800">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Ferramentas de Integração Excel</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadSample}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                Baixar Modelo Excel
              </button>
              <button
                type="button"
                onClick={handleExportAllToExcel}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5 transition-colors"
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Exportar CRM Completo (.xlsx)
              </button>
            </div>
          </div>

          {/* Type Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              1. Selecione o Tipo de Dados a Importar
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => handleTypeChange('deals')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  importType === 'deals'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                <span>Negócios / Propostas ({currentDeals.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('clients')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  importType === 'clients'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span>Clientes ({currentClients.length})</span>
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange('visits')}
                className={`flex items-center justify-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${
                  importType === 'visits'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-md'
                    : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Visitas ({currentVisits.length})</span>
              </button>
            </div>
          </div>

          {/* File Upload Drop Area */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              2. Carregar Ficheiro Excel (.xlsx, .xls, .csv)
            </label>
            <div className="relative border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-8 text-center bg-slate-950/40 transition-all cursor-pointer group">
              <input
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              />
              <div className="flex flex-col items-center justify-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-slate-800 group-hover:bg-emerald-500/20 text-slate-400 group-hover:text-emerald-400 flex items-center justify-center transition-colors shadow-lg">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-200 group-hover:text-emerald-400 transition-colors">
                    {file ? file.name : 'Arraste ou clique para selecionar o ficheiro Excel'}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Suporta colunas como Cliente, Proposta, Valor (Kz), Etapa, Comercial, Prioridade, etc.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Error / Success Notifications */}
          {errorMsg && (
            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && (
            <div className="space-y-3 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    3. Pré-visualização dos Dados Extraídos
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {parsedItems.length} Registos
                  </span>
                </div>

                {importType === 'deals' && (
                  <div className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                    Valor Total Extraído: {totalValorImport.toLocaleString('pt-AO')} Kz
                  </div>
                )}
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden max-h-60 overflow-y-auto bg-slate-950/60 text-xs">
                <table className="w-full text-left text-slate-300">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 sticky top-0">
                    <tr>
                      <th className="p-3 font-semibold">#</th>
                      {importType === 'deals' && (
                        <>
                          <th className="p-3 font-semibold">Cliente / Empresa</th>
                          <th className="p-3 font-semibold">Título Proposta</th>
                          <th className="p-3 font-semibold">Valor (Kz)</th>
                          <th className="p-3 font-semibold">Etapa</th>
                          <th className="p-3 font-semibold">Comercial</th>
                        </>
                      )}
                      {importType === 'clients' && (
                        <>
                          <th className="p-3 font-semibold">Empresa</th>
                          <th className="p-3 font-semibold">Contacto</th>
                          <th className="p-3 font-semibold">NIF</th>
                          <th className="p-3 font-semibold">Província</th>
                          <th className="p-3 font-semibold">Segmento</th>
                        </>
                      )}
                      {importType === 'visits' && (
                        <>
                          <th className="p-3 font-semibold">Empresa</th>
                          <th className="p-3 font-semibold">Cliente</th>
                          <th className="p-3 font-semibold">Comercial</th>
                          <th className="p-3 font-semibold">Data</th>
                          <th className="p-3 font-semibold">Resultado</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {parsedItems.slice(0, 15).map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 text-slate-500">{idx + 1}</td>
                        {importType === 'deals' && (
                          <>
                            <td className="p-3 font-medium text-slate-200">{item.clienteNome}</td>
                            <td className="p-3 text-slate-300">{item.titulo}</td>
                            <td className="p-3 font-bold text-emerald-400">{item.valor.toLocaleString('pt-AO')} Kz</td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {item.etapa}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300">{item.comercialNome}</td>
                          </>
                        )}
                        {importType === 'clients' && (
                          <>
                            <td className="p-3 font-medium text-slate-200">{item.empresa}</td>
                            <td className="p-3 text-slate-300">{item.nome}</td>
                            <td className="p-3 text-slate-400">{item.nif}</td>
                            <td className="p-3 text-slate-300">{item.provincia}</td>
                            <td className="p-3 text-slate-300">{item.segmento}</td>
                          </>
                        )}
                        {importType === 'visits' && (
                          <>
                            <td className="p-3 font-medium text-slate-200">{item.empresa}</td>
                            <td className="p-3 text-slate-300">{item.clienteNome}</td>
                            <td className="p-3 text-slate-300">{item.comercialNome}</td>
                            <td className="p-3 text-slate-400">{item.data}</td>
                            <td className="p-3 text-emerald-400">{item.resultado}</td>
                          </>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedItems.length > 15 && (
                <p className="text-[11px] text-slate-500 text-right">
                  + {parsedItems.length - 15} registos adicionais serão importados
                </p>
              )}
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={handleConfirmImport}
            disabled={parsedItems.length === 0 || isProcessing}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-lg ${
              parsedItems.length > 0 && !isProcessing
                ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-500 cursor-not-allowed'
            }`}
          >
            <span>Importar e Actualizar Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
