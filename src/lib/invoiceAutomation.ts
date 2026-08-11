import { Cliente, Deal, Usuario } from '../types';

export interface InvoiceProcessResult {
  updatedClients: Cliente[];
  updatedDeals: Deal[];
  autoClientRegistered: boolean;
  clientNameExtracted: string;
  detectedStage: 'negociacao' | 'fechado' | null;
  message: string;
}

export function processInvoiceAutomation({
  docName,
  docType,
  clienteNomeInput,
  valorInput,
  clients,
  deals,
  loggedUser
}: {
  docName: string;
  docType?: string;
  clienteNomeInput?: string;
  valorInput?: number;
  clients: Cliente[];
  deals: Deal[];
  loggedUser: Usuario | null;
}): InvoiceProcessResult {
  let updatedClients = [...clients];
  let updatedDeals = [...deals];
  let autoClientRegistered = false;
  let clientNameExtracted = (clienteNomeInput || '').trim();

  // 1. Infer client name from document title if missing
  if (!clientNameExtracted) {
    const knownClients = [
      'UNITEL', 'AGT', 'SONILS', 'AUTOMATRIZ', 'DP WORLD', 'ACCESS BANK',
      'SONANGOL', 'ENDIAMA', 'BCGA', 'SBM OFFSHORE', 'NESTLE', 'IMBONO',
      'SAGRADA ESPERANÇA', 'BAO', 'BNI', 'PRODEL', 'TOPACK', 'YURI',
      'GRÁFICA EXPRESS', 'GRUPOCASTEL'
    ];
    for (const name of knownClients) {
      if (docName.toUpperCase().includes(name)) {
        clientNameExtracted = name;
        break;
      }
    }
  }

  // 2. Client Validation & Auto-Registration
  if (clientNameExtracted) {
    const clientExists = updatedClients.some(
      c => c.nome.toLowerCase() === clientNameExtracted.toLowerCase() ||
           c.empresa.toLowerCase() === clientNameExtracted.toLowerCase()
    );

    if (!clientExists) {
      const autoClient: Cliente = {
        id: `CLI-AUTO-${Date.now()}`,
        nome: clientNameExtracted,
        empresa: clientNameExtracted,
        nif: 'Consumidor Final (Auto-cadastrado via Fatura)',
        telefone: '+244 923 000 000',
        provincia: 'Luanda',
        segmento: 'Empresa / Comercial',
        status: 'ativo',
        responsavel: loggedUser?.nome || 'Sistema Automático',
        ultimaVisita: new Date().toISOString().split('T')[0],
        proximaVisita: new Date().toISOString().split('T')[0]
      };
      updatedClients = [autoClient, ...updatedClients];
      autoClientRegistered = true;
    }
  }

  // 3. Stage Detection Logic
  const nameLower = (docName + ' ' + (docType || '')).toLowerCase();
  const isProforma = nameLower.includes('proforma') || nameLower.includes('orçamento') || nameLower.includes('orcamento') || nameLower.includes('proposta') || nameLower.includes('cotacao') || nameLower.includes('cotação');
  const isFinalInvoice = nameLower.includes('fatura final') || nameLower.includes('fatura recibo') || nameLower.includes('recibo') || nameLower.includes('adjudicacao') || nameLower.includes('adjudicação') || nameLower.includes('contrato');

  let detectedStage: 'negociacao' | 'fechado' | null = null;
  let message = 'Documento registado.';

  if (clientNameExtracted && (isProforma || isFinalInvoice)) {
    detectedStage = isProforma ? 'negociacao' : 'fechado';

    const existingDealIdx = updatedDeals.findIndex(
      d => d.clienteNome.toLowerCase() === clientNameExtracted.toLowerCase()
    );

    if (existingDealIdx >= 0) {
      const deal = updatedDeals[existingDealIdx];
      if (isProforma) {
        updatedDeals[existingDealIdx] = {
          ...deal,
          etapa: 'negociacao',
          valor: valorInput || deal.valor,
          observacoes: (deal.observacoes || '') + ` | Fatura Proforma detectada em ${new Date().toLocaleDateString('pt-AO')}`
        };
        message = `Cliente ${clientNameExtracted} validado. Fatura Proforma detectada -> Etapa atualizada para "Em Negociação".`;
      } else {
        updatedDeals[existingDealIdx] = {
          ...deal,
          etapa: 'fechado',
          valorAprovado: valorInput || deal.valor,
          observacoes: (deal.observacoes || '') + ` | Fatura Final detectada (Negócio Fechado) em ${new Date().toLocaleDateString('pt-AO')}`
        };
        message = `Cliente ${clientNameExtracted} validado. Fatura Final/Adjudicação detectada -> Negócio Fechado e aprovado!`;
      }
    } else {
      // Auto Create Deal
      const newDeal: Deal = {
        id: `DEAL-AUTO-${Date.now()}`,
        clienteNome: clientNameExtracted,
        titulo: `${isProforma ? 'Proforma' : 'Fatura Final'} - ${clientNameExtracted}`,
        valor: valorInput || 10000000,
        etapa: detectedStage,
        valorAprovado: isFinalInvoice ? (valorInput || 10000000) : 0,
        comercialId: loggedUser?.id || 'u9',
        comercialNome: loggedUser?.nome || 'David Neto',
        prioridade: 'Alta',
        diasAberto: 1,
        observacoes: `Criado automaticamente por upload de ${docName}`
      };
      updatedDeals = [newDeal, ...updatedDeals];
      message = `Cliente ${autoClientRegistered ? 'cadastrado automaticamente e ' : ''}negócio criado -> Etapa "${isProforma ? 'Em Negociação' : 'Negócio Fechado'}"`;
    }
  }

  return {
    updatedClients,
    updatedDeals,
    autoClientRegistered,
    clientNameExtracted,
    detectedStage,
    message
  };
}
