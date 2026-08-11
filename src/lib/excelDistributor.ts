/**
 * Excel Distributor Library - GPA ANGOLA CRM v8.0 PRO
 * Automatically propagates imported Excel data to ALL 13 Views and Data Structures
 * Non-destructive merge logic ensures zero data loss.
 */

import { Deal, Cliente, Visita, Usuario, RelatorioDiario, HistoricoSemanal } from '../types';
import { extractFieldsFromRow } from '../utils/excelParser';

export interface CrossModuleImportResult {
  deals: Deal[];
  clients: Cliente[];
  visits: Visita[];
  relatoriosDiarios: RelatorioDiario[];
  historicoSemanas: HistoricoSemanal[];
  comerciais: Usuario[];
  summary: {
    newDeals: number;
    newClients: number;
    newVisits: number;
    newRelatorios: number;
    newSemanas: number;
    newComerciais: number;
  };
}

export function distributeImportedRows(
  rawRows: any[],
  existingData: {
    deals: Deal[];
    clients: Cliente[];
    visits: Visita[];
    relatoriosDiarios: RelatorioDiario[];
    historicoSemanas: HistoricoSemanal[];
    comerciais: Usuario[];
  }
): CrossModuleImportResult {
  const deals = [...existingData.deals];
  const clients = [...existingData.clients];
  const visits = [...existingData.visits];
  const relatoriosDiarios = [...existingData.relatoriosDiarios];
  const historicoSemanas = [...existingData.historicoSemanas];
  const comerciais = [...existingData.comerciais];

  let newDealsCount = 0;
  let newClientsCount = 0;
  let newVisitsCount = 0;
  let newRelatoriosCount = 0;
  let newSemanasCount = 0;
  let newComerciaisCount = 0;

  const defaultUser = comerciais[0] || {
    id: 'u9',
    nome: 'David Neto',
    email: 'david.neto@gpa.co.ao',
    perfil: 'comercial',
    funcao: 'Comercial',
    metaMensal: 15000000,
    metaSemanal: 3750000,
    comissao: 0.03,
    pesoConversao: 0.4,
    telefone: '922000000',
    foto: '',
    status: 'ativo',
    silencioso: false
  };

  rawRows.forEach((row, idx) => {
    const ext = extractFieldsFromRow(row, idx);

    // 1. MATCH OR CREATE COMERCIAL
    let matchedComm = comerciais.find(c =>
      c.nome.toLowerCase().includes(ext.comercialNome.toLowerCase()) ||
      ext.comercialNome.toLowerCase().includes(c.nome.toLowerCase())
    );

    if (!matchedComm && ext.comercialNome && ext.comercialNome !== 'David Neto') {
      const newComm: Usuario = {
        id: `u_imp_${Date.now()}_${idx}`,
        nome: ext.comercialNome,
        email: `${ext.comercialNome.toLowerCase().replace(/\s+/g, '.')}@gpaangola.co.ao`,
        perfil: 'comercial',
        funcao: 'Comercial',
        metaMensal: 15000000,
        metaSemanal: 3750000,
        comissao: 0.03,
        pesoConversao: 0.4,
        telefone: ext.telefone || '922000000',
        foto: '',
        status: 'ativo',
        silencioso: false,
        provincia: ext.provincia
      };
      comerciais.push(newComm);
      matchedComm = newComm;
      newComerciaisCount++;
    }

    const assignedUser = matchedComm || defaultUser;

    // 2. MATCH OR CREATE CLIENT (Clientes View)
    let existingClient = clients.find(c =>
      c.empresa.toLowerCase().trim() === ext.empresa.toLowerCase().trim() ||
      c.nome.toLowerCase().trim() === ext.clienteNome.toLowerCase().trim()
    );

    if (!existingClient && ext.empresa) {
      existingClient = {
        id: `c_imp_${Date.now()}_${idx}`,
        nome: ext.clienteNome,
        empresa: ext.empresa,
        nif: ext.nif || `541${Math.floor(10000000 + Math.random() * 90000000)}`,
        telefone: ext.telefone || '922000000',
        provincia: ext.provincia,
        segmento: ext.segmento,
        status: 'ativo',
        responsavel: assignedUser.id,
        ultimaVisita: ext.dataEnvio || new Date().toISOString().split('T')[0],
        proximaVisita: 'Em acompanhamento',
        endereco: ext.provincia
      };
      clients.push(existingClient);
      newClientsCount++;
    }

    // 3. CREATE OR UPDATE DEAL (Dashboard, CRM Kanban, Recomendações)
    const existingDeal = deals.find(d =>
      d.clienteNome.toLowerCase().trim() === ext.clienteNome.toLowerCase().trim() &&
      d.titulo.toLowerCase().trim() === ext.titulo.toLowerCase().trim()
    );

    if (!existingDeal && ext.titulo) {
      const newDeal: Deal = {
        id: `d_imp_${Date.now()}_${idx}`,
        clienteNome: ext.clienteNome,
        empresa: ext.empresa,
        titulo: ext.titulo,
        valor: ext.valor,
        valorAprovado: ext.valorAprovado,
        valorPerdido: ext.valorPerdido,
        etapa: ext.etapa,
        comercialId: assignedUser.id,
        comercialNome: assignedUser.nome,
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
      deals.push(newDeal);
      newDealsCount++;
    }

    // 4. CREATE DAILY REPORT RECORD (Histórico do Dia - Admins)
    const hasDailyReport = relatoriosDiarios.some(r =>
      r.comercialNome.toLowerCase() === assignedUser.nome.toLowerCase() &&
      r.data === ext.dataEnvio
    );

    if (!hasDailyReport && ext.dataEnvio) {
      relatoriosDiarios.push({
        id: `rel_imp_${Date.now()}_${idx}`,
        comercialId: assignedUser.id,
        comercialNome: assignedUser.nome,
        data: ext.dataEnvio,
        semana: ext.semana,
        visitasRealizadas: 1,
        propostasEnviadas: 1,
        valorProposto: ext.valor,
        valorFechado: ext.valorAprovado,
        observacoes: `Relatório importado automaticamente via Excel: ${ext.titulo} (${ext.clienteNome})`,
        status: 'enviado'
      });
      newRelatoriosCount++;
    }

    // 5. CREATE VISIT RECORD (Histór. de Visitas)
    const hasVisit = visits.some(v =>
      v.empresa.toLowerCase() === ext.empresa.toLowerCase() &&
      v.data === ext.dataEnvio
    );

    if (!hasVisit && ext.empresa) {
      visits.push({
        id: `v_imp_${Date.now()}_${idx}`,
        clienteNome: ext.clienteNome,
        empresa: ext.empresa,
        comercialNome: assignedUser.nome,
        data: ext.dataEnvio,
        hora: '10:00',
        localizacao: ext.provincia,
        resultado: ext.etapa === 'fechado' ? 'Fechado' : 'Em Negociação',
        produtos: ext.titulo,
        necessidade: ext.observacoes || 'Acompanhamento comercial'
      });
      newVisitsCount++;
    }

    // 6. CREATE WEEKLY SUMMARY RECORD (Comparativo Semanal & Base de Duas Semanas)
    if (ext.semana) {
      const existingSemana = historicoSemanas.find(s => s.rotulo.toLowerCase() === ext.semana.toLowerCase());
      if (!existingSemana) {
        historicoSemanas.push({
          id: `sem_imp_${Date.now()}_${idx}`,
          rotulo: ext.semana,
          mes: 'Agosto 2026',
          propostas: 1,
          valorTotal: ext.valor,
          valorAprovado: ext.valorAprovado,
          forecast: Math.round(ext.valor * 0.5),
          visitas: 1
        });
        newSemanasCount++;
      } else {
        existingSemana.propostas += 1;
        existingSemana.valorTotal += ext.valor;
        existingSemana.valorAprovado += ext.valorAprovado;
      }
    }
  });

  return {
    deals,
    clients,
    visits,
    relatoriosDiarios,
    historicoSemanas,
    comerciais,
    summary: {
      newDeals: newDealsCount,
      newClients: newClientsCount,
      newVisits: newVisitsCount,
      newRelatorios: newRelatoriosCount,
      newSemanas: newSemanasCount,
      newComerciais: newComerciaisCount
    }
  };
}
