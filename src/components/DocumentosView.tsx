import React, { useState, useRef } from 'react';
import { 
  File, 
  FileText, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  Upload, 
  Trash2, 
  Search, 
  Paperclip, 
  FolderClosed, 
  User, 
  Briefcase,
  Download,
  AlertTriangle,
  Clock,
  HardDrive,
  Edit3,
  Eye,
  X,
  Check,
  Tag,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { Cliente, Deal, Arquivo, Usuario, isUserManager } from '../types';
import GlobalPeriodBar from './GlobalPeriodBar';
import { PeriodType } from '../utils/periodEngine';

interface DocumentosViewProps {
  arquivos: Arquivo[];
  clients: Cliente[];
  deals: Deal[];
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
  loggedUser: Usuario | null;
  onUploadFile: (
    name: string, 
    type: string, 
    size: number, 
    base64Data: string, 
    clientAssoc?: string, 
    dealAssoc?: string,
    categoria?: 'documento' | 'comprovativo' | 'fatura' | 'contrato' | 'relatorio' | 'outro',
    observacoes?: string,
    customDate?: string
  ) => Promise<void>;
  onUpdateFile?: (id: string, updatedFields: Partial<Arquivo>) => Promise<void>;
  onDeleteFile: (id: string, url: string) => Promise<void>;
  onOpenPdfExtractor?: () => void;
}

export default function DocumentosView({
  arquivos,
  clients,
  deals,
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
  onProvinciaChange,
  loggedUser,
  onUploadFile,
  onUpdateFile,
  onDeleteFile,
  onOpenPdfExtractor
}: DocumentosViewProps) {
  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'todos' | 'comprovativo' | 'fatura' | 'contrato' | 'pdf' | 'imagem' | 'video' | 'excel_word'>('todos');
  const [adminViewMode, setAdminViewMode] = useState<'todos' | 'meus'>('todos');
  
  // Upload State
  const [selectedClient, setSelectedClient] = useState('');
  const [selectedDeal, setSelectedDeal] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'documento' | 'comprovativo' | 'fatura' | 'contrato' | 'relatorio' | 'outro'>('documento');
  const [fileNotes, setFileNotes] = useState('');
  const [customData, setCustomData] = useState<string>('');
  
  // Drag & Upload Feedback UI
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // Editing & Preview Modal state
  const [editingFile, setEditingFile] = useState<Arquivo | null>(null);
  const [editNome, setEditNome] = useState('');
  const [editCategoria, setEditCategoria] = useState<'documento' | 'comprovativo' | 'fatura' | 'contrato' | 'relatorio' | 'outro'>('documento');
  const [editCliente, setEditCliente] = useState('');
  const [editNegocio, setEditNegocio] = useState('');
  const [editObservacoes, setEditObservacoes] = useState('');
  const [editData, setEditData] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // File Preview Modal state
  const [previewFile, setPreviewFile] = useState<Arquivo | null>(null);

  // Custom Delete Modal state
  const [fileToDelete, setFileToDelete] = useState<Arquivo | null>(null);
  const [isDeletingFile, setIsDeletingFile] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to format date & time according to Angola Timezone (WAT - West Africa Time, UTC+1)
  const formatAngolaDateTime = (isoString?: string) => {
    if (!isoString) return { date: '-', time: '-' };
    try {
      const d = new Date(isoString);
      if (isNaN(d.getTime())) return { date: '-', time: '-' };
      const dateStr = d.toLocaleDateString('pt-AO', {
        timeZone: 'Africa/Luanda',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      const timeStr = d.toLocaleTimeString('pt-AO', {
        timeZone: 'Africa/Luanda',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      return { date: dateStr, time: timeStr };
    } catch (e) {
      return { date: '-', time: '-' };
    }
  };

  // Permission helper: Admin/Gestor/Supervisor and file authors can delete files
  const canDeleteFile = (file: Arquivo) => {
    if (isUserManager(loggedUser)) return true;
    // Check if the logged-in user is the author of the file
    return file.enviadoPor === loggedUser.nome;
  };

  // Helper to format file size
  const formatSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Determine icon based on file type / name
  const getFileIcon = (fileName: string, mimeType: string) => {
    const name = fileName.toLowerCase();
    const type = (mimeType || '').toLowerCase();
    
    if (type.includes('pdf') || name.endsWith('.pdf')) {
      return <FileText size={22} className="text-red-500 shrink-0" />;
    }
    if (type.includes('spreadsheet') || type.includes('excel') || type.includes('csv') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.csv')) {
      return <FileSpreadsheet size={22} className="text-emerald-600 shrink-0" />;
    }
    if (type.includes('word') || type.includes('document') || name.endsWith('.doc') || name.endsWith('.docx')) {
      return <FileText size={22} className="text-blue-500 shrink-0" />;
    }
    if (type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.gif') || name.endsWith('.webp')) {
      return <ImageIcon size={22} className="text-purple-500 shrink-0" />;
    }
    if (type.includes('video') || name.endsWith('.mp4') || name.endsWith('.mkv') || name.endsWith('.avi') || name.endsWith('.mov')) {
      return <VideoIcon size={22} className="text-amber-500 shrink-0" />;
    }
    return <File size={22} className="text-gray-400 shrink-0" />;
  };

  // Helper for Category badges
  const renderCategoryBadge = (categoria?: string, fileName?: string) => {
    const name = (fileName || '').toLowerCase();
    const cat = categoria || (
      name.includes('comprov') || name.includes('recibo') || name.includes('paga')
        ? 'comprovativo'
        : name.includes('fatura') || name.includes('proposta')
        ? 'fatura'
        : name.includes('contrato')
        ? 'contrato'
        : 'documento'
    );

    switch (cat) {
      case 'comprovativo':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-100 uppercase tracking-wider"><Check size={10} /> Comprovativo</span>;
      case 'fatura':
        return <span className="inline-flex items-center gap-1 bg-red-50 text-red-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-red-100 uppercase tracking-wider"><FileText size={10} /> Fatura / Proposta</span>;
      case 'contrato':
        return <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-purple-100 uppercase tracking-wider"><ShieldCheck size={10} /> Contrato</span>;
      case 'relatorio':
        return <span className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-indigo-100 uppercase tracking-wider"><FileSpreadsheet size={10} /> Relatório</span>;
      case 'outro':
        return <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-gray-200 uppercase tracking-wider"><Tag size={10} /> Outro</span>;
      case 'documento':
      default:
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md border border-blue-100 uppercase tracking-wider"><File size={10} /> Documento</span>;
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    setUploadError('');
    setSuccessMsg('');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      await processFile(files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError('');
    setSuccessMsg('');
    const files = e.target.files;
    if (files && files.length > 0) {
      await processFile(files[0]);
    }
  };

  // Process File Upload
  const processFile = async (file: File) => {
    const maxSize = 50 * 1024 * 1024; // 50MB limit
    if (file.size > maxSize) {
      setUploadError('O arquivo é demasiado grande. O limite máximo por ficheiro é de 50MB.');
      return;
    }

    setIsUploading(true);
    setUploadError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          if (!base64Data) {
            throw new Error('Falha ao converter dados do ficheiro.');
          }

          await onUploadFile(
            file.name,
            file.type || 'application/octet-stream',
            file.size,
            base64Data,
            selectedClient || undefined,
            selectedDeal || undefined,
            selectedCategory,
            fileNotes || undefined,
            customData || undefined
          );

          setSuccessMsg(`Ficheiro "${file.name}" carregado e sincronizado com sucesso!`);
          setSelectedClient('');
          setSelectedDeal('');
          setFileNotes('');
          if (fileInputRef.current) {
            fileInputRef.current.value = '';
          }
        } catch (err: any) {
          setUploadError(err.message || 'Falha ao processar o upload do arquivo.');
        } finally {
          setIsUploading(false);
        }
      };

      reader.onerror = () => {
        setUploadError('Erro ao ler o ficheiro físico.');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (err: any) {
      setUploadError(err.message || 'Falha ao iniciar leitura do arquivo.');
      setIsUploading(false);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open edit modal
  const openEditModal = (file: Arquivo) => {
    setEditingFile(file);
    setEditNome(file.nome);
    setEditCategoria(file.categoria || 'documento');
    setEditCliente(file.clienteAssociado || '');
    setEditNegocio(file.negocioAssociado || '');
    setEditObservacoes(file.observacoes || '');
    setEditData(file.criadoEm ? new Date(file.criadoEm).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  };

  // Save edit modal
  const handleSaveEdit = async () => {
    if (!editingFile || !onUpdateFile) return;
    setIsSavingEdit(true);
    try {
      const updatedDateIso = editData ? new Date(editData + 'T12:00:00').toISOString() : editingFile.criadoEm;
      await onUpdateFile(editingFile.id, {
        nome: editNome.trim() || editingFile.nome,
        categoria: editCategoria,
        clienteAssociado: editCliente,
        negocioAssociado: editNegocio,
        observacoes: editObservacoes,
        criadoEm: updatedDateIso
      });
      setEditingFile(null);
    } catch (err) {
      console.error('Error updating file metadata:', err);
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Perform file deletion via custom modal (bypasses iframe native window.confirm block)
  const handleConfirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeletingFile(true);
    try {
      await onDeleteFile(fileToDelete.id, fileToDelete.url);
      setFileToDelete(null);
    } catch (err) {
      console.error('Error deleting file:', err);
    } finally {
      setIsDeletingFile(false);
    }
  };

  // Helper to identify if a file is a payment proof / receipt
  const isComprovativoFile = (file: Arquivo) => {
    const name = (file.nome || '').toLowerCase();
    const cat = file.categoria || '';
    return cat === 'comprovativo' || name.includes('comprov') || name.includes('recibo') || name.includes('paga');
  };

  // Helper to check if loggedUser uploaded this file
  const isMyFile = (file: Arquivo) => {
    if (!loggedUser?.nome) return false;
    const sender = (file.enviadoPor || '').toLowerCase().trim();
    const userNome = loggedUser.nome.toLowerCase().trim();
    const userEmail = (loggedUser.email || '').toLowerCase().trim();
    return sender === userNome || (!!userEmail && sender === userEmail);
  };

  // Admin and permissions filtering logic
  const isAdminOrSupervisor = isUserManager(loggedUser);

  // Permission filter:
  // Administradores/Supervisores vêm TODOS os ficheiros e documentos do CRM.
  // Utilizadores normais (comerciais) vêm APENAS os ficheiros/documentos que eles próprios carregaram.
  const permittedArquivos = arquivos.filter(file => {
    if (adminViewMode === 'meus' && loggedUser?.nome) {
      return isMyFile(file);
    }

    if (isAdminOrSupervisor) {
      return true;
    }

    return isMyFile(file);
  });

  // Filter files by active tab and search term
  const filteredFiles = permittedArquivos.filter(file => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch = 
      file.nome.toLowerCase().includes(q) || 
      (file.clienteAssociado && file.clienteAssociado.toLowerCase().includes(q)) ||
      (file.negocioAssociado && file.negocioAssociado.toLowerCase().includes(q)) ||
      (file.enviadoPor && file.enviadoPor.toLowerCase().includes(q)) ||
      (file.observacoes && file.observacoes.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    const name = file.nome.toLowerCase();
    const type = (file.tipo || '').toLowerCase();
    const cat = file.categoria || (
      name.includes('comprov') || name.includes('recibo') || name.includes('paga') ? 'comprovativo' : 'documento'
    );

    switch (activeFilter) {
      case 'comprovativo':
        return cat === 'comprovativo' || name.includes('comprov') || name.includes('recibo') || name.includes('paga');
      case 'fatura':
        return cat === 'fatura' || name.includes('fatura') || name.includes('proposta');
      case 'contrato':
        return cat === 'contrato' || name.includes('contrato');
      case 'pdf':
        return type.includes('pdf') || name.endsWith('.pdf');
      case 'imagem':
        return type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp');
      case 'video':
        return type.includes('video') || name.endsWith('.mp4') || name.endsWith('.mkv') || name.endsWith('.mov');
      case 'excel_word':
        return type.includes('spreadsheet') || type.includes('excel') || type.includes('word') || type.includes('document') || name.endsWith('.xls') || name.endsWith('.xlsx') || name.endsWith('.doc') || name.endsWith('.docx') || name.endsWith('.csv');
      case 'todos':
      default:
        return true;
    }
  });

  // Category counters
  const totalFiles = permittedArquivos.length;
  const totalBytes = permittedArquivos.reduce((acc, curr) => acc + (curr.tamanho || 0), 0);
  
  const countByType = (filterType: string) => {
    return permittedArquivos.filter(file => {
      const name = file.nome.toLowerCase();
      const type = (file.tipo || '').toLowerCase();
      const cat = file.categoria || '';

      if (filterType === 'comprovativo') return cat === 'comprovativo' || name.includes('comprov') || name.includes('recibo') || name.includes('paga');
      if (filterType === 'fatura') return cat === 'fatura' || name.includes('fatura') || name.includes('proposta');
      if (filterType === 'contrato') return cat === 'contrato' || name.includes('contrato');
      if (filterType === 'pdf') return type.includes('pdf') || name.endsWith('.pdf');
      if (filterType === 'imagem') return type.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp');
      if (filterType === 'video') return type.includes('video') || name.endsWith('.mp4') || name.endsWith('.mkv');
      if (filterType === 'excel_word') return type.includes('excel') || type.includes('spreadsheet') || type.includes('word') || name.endsWith('.xlsx') || name.endsWith('.xls') || name.endsWith('.docx') || name.endsWith('.csv');
      return true;
    }).length;
  };

  return (
    <div id="documents-manager-root" className="w-full space-y-4 font-serif text-gray-900 my-2">
      
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
          currentViewName="Documentos & Comprovativos"
        />
      )}

      {/* Title Banner */}
      <div className="bg-[#1B365D] text-white py-3 px-4 rounded-t-sm shadow-sm border border-[#122442] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <HardDrive className="w-6 h-6 text-amber-400" />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl md:text-2xl font-black tracking-wider uppercase font-serif">
                GESTAO INTEGRADA DE DOCUMENTOS & COMPROVATIVOS
              </h2>
              {isAdminOrSupervisor && (
                <span className="bg-amber-400 text-gray-950 font-sans text-[10px] font-black px-2 py-0.5 rounded-xs flex items-center gap-1 uppercase tracking-wider">
                  <ShieldCheck size={12} className="text-gray-950" /> Admin
                </span>
              )}
            </div>
            <p className="text-xs font-sans text-blue-200">
              Arquivo Digital de Comprovativos, Faturas, Propostas e Contratos da GPA Angola
            </p>
          </div>
        </div>

        {/* Database & Storage Status Indicators */}
        <div className="flex gap-2 shrink-0 flex-wrap items-center font-sans">
          {onOpenPdfExtractor && (
            <button
              onClick={onOpenPdfExtractor}
              className="bg-amber-500 hover:bg-amber-600 text-gray-950 font-bold px-3 py-1.5 rounded-xs text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles size={14} className="text-gray-950" />
              <span>Extrator PDF (IA)</span>
            </button>
          )}

          <div className="bg-[#122442] border border-[#234273] px-3 py-1.5 rounded-xs flex items-center gap-2">
            <HardDrive size={16} className="text-blue-300" />
            <div>
              <span className="text-[9px] text-blue-300 font-bold block uppercase">Armazenamento</span>
              <h4 className="text-xs font-extrabold text-white font-mono">{formatSize(totalBytes)}</h4>
            </div>
          </div>

          <div className="bg-[#122442] border border-[#234273] px-3 py-1.5 rounded-xs flex items-center gap-2">
            <FolderClosed size={16} className="text-amber-400" />
            <div>
              <span className="text-[9px] text-blue-300 font-bold block uppercase">Total Ficheiros</span>
              <h4 className="text-xs font-extrabold text-white font-mono">{totalFiles} doc(s)</h4>
            </div>
          </div>
        </div>
      </div>

      {/* Admin Visibility Mode Notice */}
      {isAdminOrSupervisor ? (
        <div className="bg-[#122442] border border-[#1B365D] text-white p-3 rounded-xs shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={18} className="text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-amber-300">MODO ADMINISTRADOR ATIVO</h4>
              <p className="text-[11px] text-blue-100">Visibilidade global de todos os documentos e comprovativos dos gestores comerciais.</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 bg-[#0b162a] p-1 rounded-xs border border-[#1B365D]">
            <button
              onClick={() => setAdminViewMode('todos')}
              className={`text-xs font-bold px-2.5 py-1 rounded-xs transition ${
                adminViewMode === 'todos' ? 'bg-amber-500 text-gray-950' : 'text-blue-200 hover:text-white'
              }`}
            >
              Ver Todos ({arquivos.length})
            </button>
            <button
              onClick={() => setAdminViewMode('meus')}
              className={`text-xs font-bold px-2.5 py-1 rounded-xs transition ${
                adminViewMode === 'meus' ? 'bg-amber-500 text-gray-950' : 'text-blue-200 hover:text-white'
              }`}
            >
              Apenas Meus ({arquivos.filter(f => isMyFile(f)).length})
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-[#122442] border border-[#1B365D] text-white p-3 rounded-xs shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3 font-sans">
          <div className="flex items-center gap-2.5">
            <Info size={18} className="text-amber-400 shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wide text-amber-300">
                MODO UTILIZADOR COMERCIAL ({loggedUser?.nome || 'Utilizador'})
              </h4>
              <p className="text-[11px] text-blue-100">
                Visualização restrita de arquivos e documentos no CRM. Por políticas de privacidade e segurança, <strong>apenas visualiza os documentos e ficheiros carregados por si</strong>. Apenas os Administradores têm permissão para ver os arquivos enviados por outros utilizadores.
              </p>
            </div>
          </div>
          <div className="bg-[#0b162a] px-3 py-1.5 rounded-xs border border-[#1B365D] text-xs text-amber-300 font-bold shrink-0 font-mono">
            Meus Ficheiros: {permittedArquivos.length}
          </div>
        </div>
      )}



      {/* Upload Box & Associations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 font-sans">
        
        {/* Upload Container (2/3 width) */}
        <div className="lg:col-span-2 bg-white rounded-xs border border-gray-300 p-4 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="bg-[#122442] text-white px-3 py-1 -mx-4 -mt-4 mb-3 text-xs font-bold uppercase tracking-wide flex justify-between items-center border-b border-[#0b162a]">
              <span>CARREGAR NOVO DOCUMENTO / COMPROVATIVO</span>
              <span className="text-[10px] text-amber-300 font-mono">SERVIDORES GPA ANGOLA</span>
            </div>
            
            {/* Drag Area */}
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={triggerFileSelect}
              className={`border-2 border-dashed rounded-xs p-5 flex flex-col items-center justify-center cursor-pointer transition ${
                isDragging 
                  ? 'border-blue-700 bg-blue-50/60 text-blue-900' 
                  : 'border-gray-300 hover:border-blue-600 hover:bg-gray-50/50 text-gray-500'
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,image/*,video/*,.xls,.xlsx,.doc,.docx,.csv"
              />
              
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#1B365D] flex items-center justify-center mb-2">
                <Upload size={20} className={isUploading ? 'animate-bounce' : ''} />
              </div>
              
              <h4 className="text-xs font-bold text-gray-900">Arraste o ficheiro ou clique para selecionar</h4>
              <p className="text-[10px] text-gray-500 mt-1 font-sans text-center">
                PDFs, Comprovativos Bancários, Imagens, Vídeos, Word e Excel (máx 50MB)
              </p>
            </div>

            {/* Error and Success feedback */}
            {uploadError && (
              <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-xs text-xs flex items-center gap-2 font-sans">
                <AlertTriangle size={14} className="shrink-0 text-rose-600" />
                <span className="font-bold">{uploadError}</span>
              </div>
            )}

            {successMsg && (
              <div className="mt-2.5 p-2 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xs text-xs flex items-center gap-2 font-sans">
                <Clock size={14} className="shrink-0 text-emerald-700 animate-pulse" />
                <span className="font-bold">{successMsg}</span>
              </div>
            )}

            {isUploading && (
              <div className="mt-2.5 flex items-center justify-center gap-2 text-xs text-blue-900 font-bold font-sans">
                <span className="w-3.5 h-3.5 border-2 border-blue-900 border-t-transparent rounded-full animate-spin"></span>
                Sincronizando arquivo na nuvem comercial GPA...
              </div>
            )}
          </div>

          <div className="mt-3 pt-2 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
            <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded-xs border border-blue-200 uppercase tracking-wider">
              Cópia Segura
            </span>
            <span className="font-semibold">Backup automático na BD Firestore</span>
          </div>
        </div>

        {/* Association & Metadata Settings (1/3 width) */}
        <div className="bg-white rounded-xs border border-gray-300 p-4 shadow-2xs flex flex-col justify-between font-sans">
          <div className="space-y-3">
            <div className="bg-[#122442] text-white px-3 py-1 -mx-4 -mt-4 mb-2 text-xs font-bold uppercase tracking-wide border-b border-[#0b162a]">
              CLASSIFICAÇÃO E VÍNCULO
            </div>

            {/* Category selector */}
            <div>
              <label className="text-[10px] text-gray-700 font-bold uppercase block mb-0.5">Tipo / Categoria</label>
              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as any)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xs text-xs font-bold text-gray-900 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="documento">📄 Documento Geral</option>
                <option value="comprovativo">💳 Comprovativo de Pagamento / Recibo</option>
                <option value="fatura">📑 Fatura / Proposta Comercial</option>
                <option value="contrato">🛡️ Contrato Assinado</option>
                <option value="relatorio">📊 Relatório / Planilha</option>
                <option value="outro">🏷️ Outro</option>
              </select>
            </div>

            {/* Associate with Client */}
            <div>
              <label className="text-[10px] text-gray-700 font-bold uppercase block mb-0.5">Cliente Associado</label>
              <select 
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xs text-xs font-medium text-gray-900 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">Nenhum cliente (Geral)</option>
                {clients.map(c => (
                  <option key={c.id} value={c.empresa}>{c.empresa} ({c.nome})</option>
                ))}
              </select>
            </div>

            {/* Associate with Deal */}
            <div>
              <label className="text-[10px] text-gray-700 font-bold uppercase block mb-0.5">Proposta / Negócio Associado</label>
              <select 
                value={selectedDeal}
                onChange={(e) => setSelectedDeal(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xs text-xs font-medium text-gray-900 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
              >
                <option value="">Nenhuma proposta (Geral)</option>
                {deals.map(d => (
                  <option key={d.id} value={d.titulo}>{d.titulo} - {d.clienteNome}</option>
                ))}
              </select>
            </div>

            {/* Notes / Observações */}
            <div>
              <label className="text-[10px] text-gray-700 font-bold uppercase block mb-0.5">Observações / Notas</label>
              <input
                type="text"
                placeholder="Ex: Ref. Transferência BFA..."
                value={fileNotes}
                onChange={(e) => setFileNotes(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 rounded-xs text-xs font-medium text-gray-900 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
            </div>

            {/* Retroactive / Custom Registration Date */}
            <div>
              <label className="text-[10px] text-amber-800 font-bold uppercase block mb-0.5 flex items-center gap-1">
                <Clock size={11} className="text-amber-600" /> Data de Registo (Retroativa)
              </label>
              <input
                type="date"
                value={customData}
                onChange={(e) => setCustomData(e.target.value)}
                className="w-full bg-amber-50/60 border border-amber-300 rounded-xs text-xs font-bold text-gray-900 px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <span className="text-[9px] text-gray-400 block mt-0.5">Permite registar documentos de dias anteriores.</span>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-300 rounded-xs p-2 mt-3 text-[10px] text-amber-950 font-medium flex items-start gap-1.5">
            <Info size={13} className="shrink-0 text-amber-800 mt-0.5" />
            <span>Documentos anexados permanecem vinculados ao cliente permanentemente.</span>
          </div>
        </div>
      </div>

      {/* Main Files Table Container */}
      <div className="bg-white border border-gray-400 shadow-xs overflow-hidden font-sans">
        
        {/* Filters Header */}
        <div className="px-4 py-2.5 border-b border-gray-300 flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-[#1B365D] text-white">
          
          {/* Tabs */}
          <div className="flex flex-wrap gap-1">
            <button
              onClick={() => setActiveFilter('todos')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'todos' 
                  ? 'bg-amber-500 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Todos ({totalFiles})
            </button>

            <button
              onClick={() => setActiveFilter('comprovativo')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'comprovativo' 
                  ? 'bg-emerald-500 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Comprovativos ({countByType('comprovativo')})
            </button>

            <button
              onClick={() => setActiveFilter('fatura')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'fatura' 
                  ? 'bg-rose-500 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Faturas/Propostas ({countByType('fatura')})
            </button>

            <button
              onClick={() => setActiveFilter('contrato')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'contrato' 
                  ? 'bg-purple-400 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Contratos ({countByType('contrato')})
            </button>

            <button
              onClick={() => setActiveFilter('pdf')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'pdf' 
                  ? 'bg-amber-400 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              PDFs ({countByType('pdf')})
            </button>

            <button
              onClick={() => setActiveFilter('imagem')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'imagem' 
                  ? 'bg-amber-400 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Imagens ({countByType('imagem')})
            </button>

            <button
              onClick={() => setActiveFilter('excel_word')}
              className={`px-2.5 py-1 rounded-xs text-xs font-bold transition ${
                activeFilter === 'excel_word' 
                  ? 'bg-amber-400 text-gray-950' 
                  : 'bg-[#122442] border border-[#234273] text-blue-100 hover:bg-[#1a335c]'
              }`}
            >
              Office ({countByType('excel_word')})
            </button>
          </div>

          {/* Search bar */}
          <div className="relative w-full lg:w-64 shrink-0">
            <input 
              type="text"
              placeholder="Pesquisar arquivo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#122442] border border-[#234273] text-white placeholder-blue-300 text-xs font-medium pl-8 pr-3 py-1 rounded-xs focus:outline-none focus:ring-1 focus:ring-amber-400"
            />
            <div className="absolute inset-y-0 left-2.5 flex items-center text-blue-300 pointer-events-none">
              <Search size={13} />
            </div>
          </div>
        </div>

        {/* Files Table / Empty State */}
        {filteredFiles.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-2 border border-gray-300">
              <Paperclip size={20} />
            </div>
            <h4 className="text-xs font-bold text-gray-800">Nenhum ficheiro encontrado</h4>
            <p className="text-[11px] text-gray-500 mt-0.5 max-w-sm">
              {searchTerm 
                ? 'Nenhum resultado corresponde à sua pesquisa.' 
                : 'Não existem documentos com este filtro selecionado.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] text-left border-collapse">
              <thead>
                <tr className="bg-[#0B5C80] text-white border-b border-[#084560]">
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Ficheiro & Categoria</th>
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[90px]">Tamanho</th>
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Associações</th>
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Observações</th>
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099] min-w-[110px]">Data Upload</th>
                  <th className="px-3 py-2 font-bold border-r border-[#1B7099]">Enviado Por</th>
                  <th className="px-3 py-2 font-bold text-center min-w-[110px]">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-300 text-gray-900">
                {filteredFiles.map((file) => (
                  <tr key={file.id} className="hover:bg-blue-50/50 transition-colors">
                    
                    {/* File info & Category */}
                    <td className="px-3 py-1.5 border-r border-gray-300">
                      <div className="flex items-center gap-2">
                        <div className="p-1 bg-gray-100 rounded-xs border border-gray-300 shrink-0">
                          {getFileIcon(file.nome, file.tipo)}
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-gray-900 block truncate max-w-xs text-xs" title={file.nome}>
                            {file.nome}
                          </span>
                          <div className="mt-0.5 flex items-center gap-1.5">
                            {renderCategoryBadge(file.categoria, file.nome)}
                            <span className="text-[9px] text-gray-500 font-mono uppercase">{file.tipo.split('/')[1] || file.tipo}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Size */}
                    <td className="px-3 py-1.5 border-r border-gray-300 font-mono text-gray-700">
                      {formatSize(file.tamanho)}
                    </td>

                    {/* Associations */}
                    <td className="px-3 py-1.5 border-r border-gray-300">
                      <div className="flex flex-col gap-1 items-start">
                        {file.clienteAssociado && (
                          <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-900 text-[10px] font-bold px-1.5 py-0.5 rounded-xs border border-blue-300">
                            <User size={10} />
                            {file.clienteAssociado}
                          </span>
                        )}
                        {file.negocioAssociado && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-xs border border-amber-300">
                            <Briefcase size={10} />
                            {file.negocioAssociado}
                          </span>
                        )}
                        {!file.clienteAssociado && !file.negocioAssociado && (
                          <span className="text-gray-400 italic text-[10px]">Geral</span>
                        )}
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="px-3 py-1.5 border-r border-gray-300 text-gray-700 font-medium max-w-xs truncate" title={file.observacoes || ''}>
                      {file.observacoes ? (
                        <span className="text-[11px] text-gray-900 font-normal">{file.observacoes}</span>
                      ) : (
                        <span className="text-gray-400 italic text-[10px]">-</span>
                      )}
                    </td>

                    {/* Upload date (Angola WAT Timezone) */}
                    <td className="px-3 py-1.5 border-r border-gray-300 text-gray-700 font-mono text-[10px]">
                      <div className="font-bold text-gray-900">{formatAngolaDateTime(file.criadoEm).date}</div>
                      <div className="text-[9px] text-gray-600 font-semibold flex items-center gap-1">
                        <Clock size={10} className="text-amber-600 shrink-0" />
                        <span>{formatAngolaDateTime(file.criadoEm).time}</span>
                      </div>
                    </td>

                    {/* Uploaded By */}
                    <td className="px-3 py-1.5 border-r border-gray-300 font-bold text-[#1B365D]">
                      {file.enviadoPor || 'Admin'}
                    </td>

                    {/* Action buttons */}
                    <td className="px-3 py-1.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        
                        {/* Preview button */}
                        <button
                          onClick={() => setPreviewFile(file)}
                          className="p-1 bg-gray-100 text-blue-900 hover:bg-blue-800 hover:text-white rounded-xs transition border border-gray-300 flex items-center justify-center cursor-pointer"
                          title="Visualizar"
                        >
                          <Eye size={13} />
                        </button>

                        {/* Download button */}
                        <a 
                          href={file.url}
                          download={file.nome}
                          target="_blank" 
                          referrerPolicy="no-referrer"
                          rel="noreferrer"
                          className="p-1 bg-gray-100 text-[#1B365D] hover:bg-[#1B365D] hover:text-white rounded-xs transition border border-gray-300 flex items-center justify-center cursor-pointer"
                          title="Descarregar"
                        >
                          <Download size={13} />
                        </a>

                        {/* Edit metadata button */}
                        <button
                          onClick={() => openEditModal(file)}
                          className="p-1 bg-gray-100 text-amber-800 hover:bg-amber-600 hover:text-white rounded-xs transition border border-gray-300 flex items-center justify-center cursor-pointer"
                          title="Editar"
                        >
                          <Edit3 size={13} />
                        </button>

                        {/* Delete button */}
                        <button
                          onClick={() => {
                            if (!canDeleteFile(file)) {
                              alert(`⚠️ Permissão negada: Este ficheiro foi carregado por "${file.enviadoPor || 'outro utilizador'}". Apenas o autor ou Administradores/Gestores podem eliminá-lo.`);
                              return;
                            }
                            setFileToDelete(file);
                          }}
                          className={`p-1 rounded-xs transition border flex items-center justify-center ${
                            canDeleteFile(file)
                              ? 'bg-rose-50 text-rose-700 hover:bg-rose-700 hover:text-white border-rose-300 cursor-pointer'
                              : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                          }`}
                          title={canDeleteFile(file) ? "Eliminar ficheiro" : "Apenas o autor ou Administrador pode eliminar"}
                        >
                          <Trash2 size={13} />
                        </button>

                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Metadata Modal */}
      {editingFile && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-50 text-amber-700 rounded-lg">
                  <Edit3 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#003366]">Editar Metadados do Ficheiro</h3>
                  <p className="text-[10px] text-gray-400">Altere o título, classificação e associações</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingFile(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 space-y-4">
              
              {/* File Title */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Nome do Ficheiro</label>
                <input 
                  type="text"
                  value={editNome}
                  onChange={(e) => setEditNome(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Category */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Categoria / Classificação</label>
                <select 
                  value={editCategoria}
                  onChange={(e) => setEditCategoria(e.target.value as any)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="documento">📄 Documento Geral</option>
                  <option value="comprovativo">💳 Comprovativo de Pagamento / Recibo</option>
                  <option value="fatura">📑 Fatura / Proposta Comercial</option>
                  <option value="contrato">🛡️ Contrato Assinado</option>
                  <option value="relatorio">📊 Relatório / Planilha</option>
                  <option value="outro">🏷️ Outro</option>
                </select>
              </div>

              {/* Client Assoc */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Cliente Associado</label>
                <select 
                  value={editCliente}
                  onChange={(e) => setEditCliente(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Nenhum cliente (Geral)</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.empresa}>{c.empresa} ({c.nome})</option>
                  ))}
                </select>
              </div>

              {/* Deal Assoc */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Proposta Associada</label>
                <select 
                  value={editNegocio}
                  onChange={(e) => setEditNegocio(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="">Nenhuma proposta (Geral)</option>
                  {deals.map(d => (
                    <option key={d.id} value={d.titulo}>{d.titulo} - {d.clienteNome}</option>
                  ))}
                </select>
              </div>

              {/* Observações */}
              <div>
                <label className="text-[10px] text-gray-500 font-bold uppercase block mb-1">Observações / Notas do Documento</label>
                <textarea 
                  rows={3}
                  value={editObservacoes}
                  onChange={(e) => setEditObservacoes(e.target.value)}
                  placeholder="Anotações internas sobre o comprovativo ou documento..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium text-gray-800 p-3 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Edit Date */}
              <div>
                <label className="text-[10px] text-amber-800 font-bold uppercase block mb-1 flex items-center gap-1">
                  <Clock size={12} className="text-amber-600" /> Data do Registo (Retroativa)
                </label>
                <input 
                  type="date"
                  value={editData}
                  onChange={(e) => setEditData(e.target.value)}
                  className="w-full bg-amber-50/60 border border-amber-300 rounded-lg text-xs font-bold text-gray-800 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <button 
                onClick={() => setEditingFile(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
              >
                Cancelar
              </button>

              <button 
                disabled={isSavingEdit}
                onClick={handleSaveEdit}
                className="px-5 py-2 bg-[#003366] hover:bg-[#002244] text-white text-xs font-bold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isSavingEdit ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    A guardar...
                  </>
                ) : (
                  <>
                    <Check size={14} /> Guardar Alterações
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-200">
            
            {/* Header */}
            <div className="p-4 bg-gray-900 text-white flex items-center justify-between border-b border-gray-800">
              <div className="flex items-center gap-3">
                {getFileIcon(previewFile.nome, previewFile.tipo)}
                <div>
                  <h3 className="text-xs font-extrabold text-white truncate max-w-md">{previewFile.nome}</h3>
                  <p className="text-[10px] text-gray-400 font-semibold">{formatSize(previewFile.tamanho)} • Enviado por {previewFile.enviadoPor}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a 
                  href={previewFile.url}
                  download={previewFile.nome}
                  target="_blank"
                  referrerPolicy="no-referrer"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition"
                >
                  <Download size={14} /> Descarregar
                </a>
                <button 
                  onClick={() => setPreviewFile(null)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-800 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-6 overflow-auto flex-1 bg-gray-100 flex items-center justify-center min-h-[300px]">
              {previewFile.tipo.includes('image') || previewFile.nome.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.nome} 
                  referrerPolicy="no-referrer"
                  className="max-h-[70vh] object-contain rounded-lg shadow-lg border border-gray-200 bg-white"
                />
              ) : previewFile.tipo.includes('pdf') || previewFile.nome.endsWith('.pdf') ? (
                <iframe 
                  src={previewFile.url} 
                  title={previewFile.nome} 
                  className="w-full h-[65vh] rounded-lg shadow border border-gray-300"
                />
              ) : previewFile.tipo.includes('video') || previewFile.nome.match(/\.(mp4|mkv|mov)$/i) ? (
                <video 
                  src={previewFile.url} 
                  controls 
                  className="max-h-[65vh] rounded-lg shadow"
                />
              ) : (
                <div className="text-center p-8 bg-white rounded-xl shadow border border-gray-200 max-w-md">
                  <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <FileText size={32} />
                  </div>
                  <h4 className="text-sm font-bold text-gray-800 mb-1">{previewFile.nome}</h4>
                  <p className="text-xs text-gray-500 mb-4">Este tipo de ficheiro ({previewFile.tipo || 'documento'}) pode ser descarregado para visualização local.</p>
                  <a 
                    href={previewFile.url} 
                    download={previewFile.nome} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-[#003366] text-white px-4 py-2 rounded-xl text-xs font-bold shadow hover:bg-[#002244] transition"
                  >
                    <Download size={14} /> Descarregar Ficheiro
                  </a>
                </div>
              )}
            </div>

            {/* Footer details */}
            <div className="p-4 bg-white border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
              <div className="flex items-center gap-2">
                {renderCategoryBadge(previewFile.categoria, previewFile.nome)}
                {previewFile.clienteAssociado && <span className="font-bold text-blue-700">Cliente: {previewFile.clienteAssociado}</span>}
                {previewFile.negocioAssociado && <span className="font-bold text-amber-700">• Proposta: {previewFile.negocioAssociado}</span>}
              </div>
              <span className="text-[10px] text-gray-400 font-semibold">GPA Angola CRM Cloud</span>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {fileToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
              <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                <Trash2 size={22} />
              </div>
              <div>
                <h3 className="text-sm font-extrabold text-gray-900">Eliminar Ficheiro Permanentemente?</h3>
                <p className="text-[10px] text-gray-400 font-semibold">Esta ação não pode ser desfeita.</p>
              </div>
            </div>

            <div className="py-4 space-y-2">
              <p className="text-xs text-gray-600 font-medium leading-relaxed">
                Tem a certeza que deseja eliminar o documento <strong className="text-gray-900 font-extrabold">{fileToDelete.nome}</strong>?
              </p>
              <p className="text-[11px] text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100 font-semibold">
                ⚠️ O ficheiro e comprovativo serão removidos da base de dados e do servidor na nuvem da GPA Angola.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
              <button 
                disabled={isDeletingFile}
                onClick={() => setFileToDelete(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>

              <button 
                disabled={isDeletingFile}
                onClick={handleConfirmDelete}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl transition shadow-md flex items-center gap-2 cursor-pointer"
              >
                {isDeletingFile ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    A eliminar...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} /> Sim, Eliminar Ficheiro
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
