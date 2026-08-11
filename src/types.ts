export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: 'admin' | 'supervisor' | 'comercial';
  funcao: string;
  metaMensal: number;
  metaSemanal: number;
  comissao: number;
  pesoConversao: number;
  telefone: string;
  foto: string;
  status: 'ativo' | 'bloqueado';
  silencioso: boolean;
  provincia?: string;
  preferenciaNotificacao?: 'whatsapp' | 'email' | 'telegram' | 'todos' | 'nenhum';
  whatsappNumero?: string;
  telegramChatId?: string;
  emailNotificacao?: string;
}

export function isUserCommercial(u: Usuario | null): boolean {
  if (!u) return false;
  return u.perfil === 'comercial';
}

export function isUserAdmin(u: Usuario | null): boolean {
  if (!u) return false;
  return u.perfil === 'admin';
}

export function isUserManager(u: Usuario | null): boolean {
  if (!u) return false;
  return u.perfil === 'admin' || u.perfil === 'supervisor';
}

export interface Cliente {
  id: string;
  nome: string;
  empresa: string;
  nif: string;
  telefone: string;
  provincia: string;
  segmento: string;
  status: 'ativo' | 'inativo';
  responsavel: string;
  ultimaVisita: string;
  proximaVisita: string;
  endereco?: string;
  historicoVendas?: number;
}

export interface Visita {
  id: string;
  clienteNome: string;
  empresa: string;
  comercialNome: string;
  data: string;
  hora: string;
  localizacao: string;
  resultado: string;
  produtos: string;
  necessidade: string;
}

export interface Deal {
  id: string;
  clienteNome: string;
  titulo: string;
  valor: number;
  etapa: 'lead' | 'contato' | 'visita' | 'proposta' | 'negociacao' | 'fechado' | 'producao' | 'perdido';
  comercialId: string;
  comercialNome: string;
  prioridade: 'Normal' | 'Média' | 'Alta' | 'Baixa';
  diasAberto: number;
  observacaoFinal?: string;
  semana?: string;
  valorAprovado?: number;
  valorPerdido?: number;
  probabilidade?: string;
  proximaAcao?: string;
  proximoContacto?: string;
  observacoes?: string;
  dataEnvio?: string;
  funilId?: string;
  scorePreditivo?: ScorePreditivo;
  classeCliente?: string;
  empresa?: string;
  dataAprovacao?: string;
  dataPerda?: string;
  crmStatus?: string;
}

export interface ScorePreditivo {
  score: number; // 0 to 100 (%)
  nivel: 'alta' | 'media' | 'baixa';
  recomendacaoIA: string;
  fatoresPrincipais: string[];
}

export interface EtapaPipeline {
  id: string;
  nome: string;
  cor: string;
  ordem: number;
}

export interface FunilPipeline {
  id: string;
  nome: string;
  descricao: string;
  icone?: string;
  etapas: EtapaPipeline[];
  padrao?: boolean;
}

export interface FollowUpRule {
  id: string;
  nome: string;
  etapaGatilho: string;
  diasInatividade: number;
  canalNotificacao: 'whatsapp' | 'email' | 'telegram' | 'todos';
  mensagemModelo: string;
  ativo: boolean;
}

export interface Guideline {
  id: number;
  acao: string;
  criterio: string;
  proximoPasso: string;
  chipClass?: string;
}

export interface NotificationItem {
  id: number;
  type: 'warn' | 'info' | 'success';
  title: string;
  text: string;
  forGestoresOnly?: boolean;
  forComerciaisOnly?: boolean;
  targetRoles?: ('admin' | 'supervisor' | 'comercial')[];
  autorNome?: string;
  autorPerfil?: 'admin' | 'supervisor' | 'comercial';
  dataHora?: string;
  canaisEnviados?: string[];
}

export interface ActivityFeed {
  type: 'deal' | 'visit' | 'client';
  text: string;
  time: string;
}

export interface Arquivo {
  id: string;
  nome: string;
  tipo: string;
  tamanho: number;
  url: string;
  criadoEm: string;
  enviadoPor: string;
  clienteAssociado?: string;
  negocioAssociado?: string;
  categoria?: 'documento' | 'comprovativo' | 'fatura' | 'contrato' | 'relatorio' | 'outro';
  observacoes?: string;
  syncedFirebase?: boolean;
  syncedSupabase?: boolean;
  syncedGoogleDrive?: boolean;
  supabaseUrl?: string;
  googleDriveUrl?: string;
  googleDriveFileId?: string;
}

export interface CloudSyncConfig {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseBucket?: string;
  googleDriveFolderId?: string;
  googleDriveApiKey?: string;
  whatsappWebhookUrl?: string;
  whatsappApiKey?: string;
  emailWebhookUrl?: string;
  telegramBotToken?: string;
  telegramDefaultChatId?: string;
}

export interface RelatorioDiarioItem {
  comercialNome: string;
  resumo: string;
}

export interface RelatorioDiario {
  id: string;
  data: string; // e.g. "2026-07-22"
  semana: string; // e.g. "21 a 25 de Julho de 2026"
  comercialNome: string;
  actividadeEquipa: RelatorioDiarioItem[];
  pipelineTotal: number;
  pipelineDestaques: { cliente: string; valor: number; descricao: string }[];
  visitasRealizadas: { cliente: string; descricao: string }[];
  propostasEmitidasCount: number;
  propostasEmitidasValorTotal: number;
  propostasEmitidasDestaques: { cliente: string; valor: number; descricao: string }[];
  adjudicacoesCount: number;
  cobrancasEfectuadas: string;
  observacoes?: string;
  criadoEm: string;
}

export interface HistoricoSemanal {
  id: string;
  rotuloSemana: string; // e.g. "21–25 Jul 2026", "13–17 Jul 2026", "06–10 Jul 2026"
  mes: string; // e.g. "Julho 2026"
  propostas: number;
  valorTotal: number;
  valorAprovado: number;
  valorPerdido: number;
  forecast: number;
  conversao: string;
  ticketMedio: number;
  visitasTotal?: number;
  dataCompilacao?: string;
  autoCompiladoSexta?: boolean;
  detalheComerciais?: {
    comercialNome: string;
    metaSemanal: number;
    propostas: number;
    valorProposto: number;
    aprovado: number;
    pctMeta: string;
    pipeline: number;
    forecast: number;
    diagnostico: string;
  }[];
}

export interface HistoricoMensal {
  id: string;
  mes: string; // e.g. "Junho 2026", "Julho 2026", "Agosto 2026"
  totalPropostas: number;
  valorPropostoTotal: number;
  valorAprovadoTotal: number;
  valorPerdidoTotal: number;
  pipelineAberto: number;
  forecast: number;
  conversaoMedia: string;
  semanasIncluidas: string[];
  geradoPorAdmin: string;
  dataGeracao: string;
}

export interface RecycleItem {
  id: string;
  originalId: string | number;
  tipo: 'deal' | 'cliente' | 'visita' | 'utilizador' | 'arquivo' | 'relatorio' | 'recomendacao' | 'outro';
  titulo: string;
  detalhes: string;
  deletedAt: string;
  deletedBy?: string;
  data: any;
}

export interface PropostaItem {
  id: string;
  descricao: string;
  quantidade: number;
  precoUnitario: number;
  impostoPct: number; // e.g. 14 for IVA 14% or 0
  total: number;
}

export interface PropostaComercial {
  id: string;
  numero: string; // e.g. "GPA-2026-0842"
  dealId?: string;
  clienteNome: string;
  clienteNif: string;
  clienteEmpresa: string;
  clienteEmail?: string;
  clienteTelefone?: string;
  clienteEndereco?: string;
  comercialNome: string;
  comercialEmail?: string;
  dataEmissao: string;
  dataValidade: string;
  itens: PropostaItem[];
  subtotal: number;
  impostoTotal: number;
  totalGeral: number;
  condicoesPagamento: string;
  prazoExecucao: string;
  ibanPagamento?: string;
  estado: 'rascunho' | 'enviada' | 'aprovada' | 'revisao' | 'rejeitada';
  linkPublico: string;
  observacoes?: string;
  historicoAcoes?: { data: string; acao: string; autor: string }[];
}

export interface MetaComercialDef {
  id: string;
  comercialId: string;
  comercialNome: string;
  metaMensalKz: number;
  comissaoPct: number; // e.g. 5 for 5%
  mesAno: string; // e.g. "2026-07"
  metaQtdFechamentos?: number;
}

export interface OperacaoLog {
  id: string;
  dataHora: string; // ISO date or formatted "2026-07-28 15:35:00"
  usuarioNome: string;
  usuarioPerfil?: string;
  tipoAcao: 'criacao' | 'edicao' | 'exclusao' | 'status' | 'configuracao' | 'reversao' | 'importacao';
  entidade: 'deal' | 'cliente' | 'visita' | 'utilizador' | 'arquivo' | 'relatorio' | 'meta' | 'configuracao';
  entidadeId: string;
  descricao: string;
  dadosAnteriores?: any;
  dadosNovos?: any;
  podeReverter?: boolean;
  revertidoEm?: string;
  revertidoPor?: string;
}
