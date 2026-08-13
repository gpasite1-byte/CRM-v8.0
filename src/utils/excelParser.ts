/**
 * Comprehensive Excel Parser for GPA Angola CRM v8.0 PRO
 * Parses 20+ fields from Excel sheets with Portuguese header variations
 * Works in both browser and server Node.js environments.
 */

import { parseExcelDate, calculateDaysOpen } from './temporalEngine';
import { Deal, Cliente, Visita, Usuario } from '../types';

export function normalizeHeader(h: string): string {
  if (!h) return '';
  return String(h)
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function parseValor(val: any): number {
  if (val === null || val === undefined || val === '') return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const str = String(val).replace(/[^0-9.,\-]/g, '').replace(/,/g, '.');
  const parts = str.split('.');
  if (parts.length > 2) {
    // e.g. "1.385.100" -> "1385100"
    const cleaned = parts.join('');
    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  }
  const num = parseFloat(str);
  return isNaN(num) ? 0 : num;
}

export function parseEtapa(val: any): Deal['etapa'] {
  const str = normalizeHeader(String(val || ''));
  if (str.includes('lead')) return 'lead';
  if (str.includes('contat') || str.includes('contacto')) return 'contato';
  if (str.includes('visita')) return 'visita';
  if (str.includes('propost')) return 'proposta';
  if (str.includes('negoc') || str.includes('negociacao')) return 'negociacao';
  if (str.includes('produc') || str.includes('producao')) return 'producao';
  if (str.includes('fechad') || str.includes('ganho') || str.includes('ganha') || str.includes('adjudicado') || str.includes('aprovado')) return 'fechado';
  if (str.includes('perdid') || str.includes('rejeitado') || str.includes('cancelado')) return 'perdido';
  return 'proposta';
}

export function parsePrioridade(val: any, valor: number): Deal['prioridade'] {
  const str = normalizeHeader(String(val || ''));
  if (str.includes('alt')) return 'Alta';
  if (str.includes('med') || str.includes('méd')) return 'Média';
  if (str.includes('baix')) return 'Baixa';
  
  if (valor >= 15000000) return 'Alta';
  if (valor >= 5000000) return 'Média';
  return 'Normal';
}

export function parseClasseCliente(val: any): string {
  const str = String(val || '').trim().toUpperCase();
  if (str === 'A' || str === 'B' || str === 'C') return str;
  if (str.includes('ALTO') || str.includes('VIP')) return 'A';
  if (str.includes('MEDIO') || str.includes('MÉDIO')) return 'B';
  return 'C';
}

export interface ParsedExcelDealRow {
  clienteNome: string;
  empresa: string;
  titulo: string;
  valor: number;
  valorAprovado: number;
  valorPerdido: number;
  etapa: Deal['etapa'];
  comercialNome: string;
  prioridade: Deal['prioridade'];
  diasAberto: number;
  semana: string;
  probabilidade: string;
  proximaAcao: string;
  proximoContacto: string;
  observacoes: string;
  observacaoFinal: string;
  dataEnvio: string;
  dataAprovacao: string;
  dataPerda: string;
  classeCliente: string;
  crmStatus: string;
  nif: string;
  telefone: string;
  provincia: string;
  segmento: string;
}

/**
 * Extracts all 20+ fields from any row object parsed from Excel
 */
export function extractFieldsFromRow(row: Record<string, any>, idx: number): ParsedExcelDealRow {
  let clienteNome = '';
  let empresa = '';
  let titulo = '';
  let valor = 0;
  let valorAprovado = 0;
  let valorPerdido = 0;
  let etapaRaw = '';
  let comercialNome = '';
  let prioridadeRaw = '';
  let semana = '';
  let probabilidade = '';
  let proximaAcao = '';
  let proximoContacto = '';
  let observacoes = '';
  let dataEnvioRaw: any = null;
  let dataAprovacaoRaw: any = null;
  let dataPerdaRaw: any = null;
  let classeClienteRaw = '';
  let crmStatus = '';
  let nif = '';
  let telefone = '';
  let provincia = '';
  let segmento = '';

  Object.keys(row).forEach(key => {
    const norm = normalizeHeader(key);
    const val = row[key];
    if (val === undefined || val === null || val === '') return;

    if (norm.includes('cliente') || norm.includes('empresa') || norm.includes('entidade') || norm.includes('razao')) {
      if (!clienteNome) clienteNome = String(val).trim();
      if (!empresa) empresa = String(val).trim();
    } else if (norm.includes('titulo') || norm.includes('servico') || norm.includes('proposta') || norm.includes('descricao') || norm.includes('produto') || norm.includes('negocio')) {
      if (!titulo) titulo = String(val).trim();
    } else if (norm.includes('valor aprovad') || norm.includes('total aprovad') || norm.includes('receita aprovad')) {
      valorAprovado = parseValor(val);
    } else if (norm.includes('valor perdid') || norm.includes('total perdid')) {
      valorPerdido = parseValor(val);
    } else if (norm.includes('valor') || norm.includes('montante') || norm.includes('preco') || norm.includes('total') || norm.includes('kz') || norm.includes('aoa')) {
      if (!valor) valor = parseValor(val);
    } else if (norm.includes('etapa') || norm.includes('estado') || norm.includes('status') || norm.includes('fase') || norm.includes('situacao')) {
      etapaRaw = String(val);
    } else if (norm.includes('vendedor') || norm.includes('comercial') || norm.includes('responsavel') || norm.includes('gestor')) {
      comercialNome = String(val).trim();
    } else if (norm.includes('priorid')) {
      prioridadeRaw = String(val);
    } else if (norm.includes('semana') || norm.includes('periodo') || norm.includes('week')) {
      semana = String(val).trim();
    } else if (norm.includes('probabilid') || norm.includes('chance')) {
      probabilidade = String(val).includes('%') ? String(val).trim() : `${parseValor(val)}%`;
    } else if (norm.includes('proxima ac') || norm.includes('proxima acao') || norm.includes('proximo passo')) {
      proximaAcao = String(val).trim();
    } else if (norm.includes('proximo contac') || norm.includes('data contac')) {
      const p = parseExcelDate(val);
      proximoContacto = p.pt || String(val).trim();
    } else if (norm.includes('obs') || norm.includes('not') || norm.includes('comentar') || norm.includes('observaca')) {
      observacoes = String(val).trim();
    } else if (norm.includes('data aprov') || norm.includes('data ganho')) {
      dataAprovacaoRaw = val;
    } else if (norm.includes('data perd') || norm.includes('data rejei')) {
      dataPerdaRaw = val;
    } else if (norm.includes('data de envio') || norm.includes('data envio') || norm.includes('data proposta') || norm.includes('data registo') || norm === 'data') {
      dataEnvioRaw = val;
    } else if (norm.includes('classe') || norm.includes('classificac')) {
      classeClienteRaw = String(val);
    } else if (norm.includes('nif')) {
      nif = String(val).trim();
    } else if (norm.includes('tel') || norm.includes('telemovel') || norm.includes('fone')) {
      telefone = String(val).trim();
    } else if (norm.includes('provinc') || norm.includes('localizac') || norm.includes('cidade')) {
      provincia = String(val).trim();
    } else if (norm.includes('segment') || norm.includes('setor') || norm.includes('area')) {
      segmento = String(val).trim();
    }
  });

  if (!clienteNome) clienteNome = `Cliente Excel #${idx + 1}`;
  if (!empresa) empresa = clienteNome;
  if (!titulo) titulo = `Proposta – ${clienteNome}`;

  const parsedEnvio = parseExcelDate(dataEnvioRaw);
  const parsedAprov = parseExcelDate(dataAprovacaoRaw);
  const parsedPerda = parseExcelDate(dataPerdaRaw);

  const dataEnvio = parsedEnvio.pt || '';
  const dataAprovacao = parsedAprov.pt || '';
  const dataPerda = parsedPerda.pt || '';

  const etapa = parseEtapa(etapaRaw);
  const prioridade = parsePrioridade(prioridadeRaw, valor);
  const classeCliente = parseClasseCliente(classeClienteRaw);

  if (etapa === 'fechado' && valorAprovado === 0) {
    valorAprovado = valor;
  }
  if (etapa === 'perdido' && valorPerdido === 0) {
    valorPerdido = valor;
  }

  if (etapa === 'fechado') crmStatus = 'Fechado ganho';
  else if (etapa === 'perdido') crmStatus = 'Fechado perdido';
  else crmStatus = 'Aberto';

  const diasAberto = calculateDaysOpen(dataEnvio);

  return {
    clienteNome,
    empresa,
    titulo,
    valor,
    valorAprovado,
    valorPerdido,
    etapa,
    comercialNome: comercialNome || 'David Neto',
    prioridade,
    diasAberto,
    semana: semana || 'Esta Semana',
    probabilidade: probabilidade || (etapa === 'fechado' ? '100%' : etapa === 'perdido' ? '0%' : '50%'),
    proximaAcao: proximaAcao || 'Acompanhamento do processo',
    proximoContacto: proximoContacto || dataEnvio,
    observacoes: observacoes || 'Importado via ficheiro Excel',
    observacaoFinal: observacoes || 'Importado via Excel',
    dataEnvio,
    dataAprovacao,
    dataPerda,
    classeCliente,
    crmStatus,
    nif,
    telefone,
    provincia: provincia || 'Luanda',
    segmento: segmento || 'Geral'
  };
}
