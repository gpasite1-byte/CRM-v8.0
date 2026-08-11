import { Deal, Usuario, Cliente, ScorePreditivo } from '../types';

/**
 * Helena IA - Predictive Win Probability Scoring Engine
 * Computes predictive win probability score for deals in AOA (Kz)
 */
export function calculateDealScore(
  deal: Deal,
  comercial?: Usuario,
  client?: Cliente
): ScorePreditivo {
  let score = 50;
  const fatores: string[] = [];

  // 1. Stage Weight
  switch (deal.etapa) {
    case 'fechado':
    case 'producao':
      score = 100;
      fatores.push('Negócio já ganho / em produção (+100%)');
      break;
    case 'negociacao':
      score += 25;
      fatores.push('Etapa de Negociação avançada (+25%)');
      break;
    case 'proposta':
      score += 15;
      fatores.push('Proposta emitida e enviada (+15%)');
      break;
    case 'visita':
      score += 5;
      fatores.push('Visita efetuada (+5%)');
      break;
    case 'contato':
    case 'lead':
      score -= 10;
      fatores.push('Etapa inicial de qualificação (-10%)');
      break;
    case 'perdido':
      score = 0;
      fatores.push('Negócio assinalado como perdido (0%)');
      break;
  }

  if (deal.etapa === 'perdido') {
    return {
      score: 0,
      nivel: 'baixa',
      recomendacaoIA: 'Helena IA: O negócio foi encerrado sem sucesso. Analisar motivo e agendar contacto em 60 dias.',
      fatoresPrincipais: fatores
    };
  }

  if (deal.etapa === 'fechado' || deal.etapa === 'producao') {
    return {
      score: 100,
      nivel: 'alta',
      recomendacaoIA: 'Helena IA: Proposta ganha! Foco na entrega excelente do serviço para retenção.',
      fatoresPrincipais: fatores
    };
  }

  // 2. Priority Modifier
  if (deal.prioridade === 'Alta') {
    score += 10;
    fatores.push('Prioridade Alta definida pelo comercial (+10%)');
  } else if (deal.prioridade === 'Baixa') {
    score -= 10;
    fatores.push('Prioridade Baixa (-10%)');
  }

  // 3. Days Open Penalty (Stale deal warning)
  const days = deal.diasAberto || 1;
  if (days > 20) {
    score -= 20;
    fatores.push(`Sem fechamento há mais de 20 dias (${days} dias aberto -20%)`);
  } else if (days > 10) {
    score -= 10;
    fatores.push(`Aberto há ${days} dias (-10%)`);
  } else if (days <= 5) {
    score += 5;
    fatores.push('Oportunidade recente (< 5 dias +5%)');
  }

  // 4. Commercial Conversion & Performance Modifier
  if (comercial) {
    if (comercial.pesoConversao && comercial.pesoConversao >= 1.2) {
      score += 8;
      fatores.push(`Comercial com alta taxa de conversão (${comercial.nome} +8%)`);
    }
  }

  // 5. Client Status & Value Check
  if (client) {
    if (client.status === 'ativo') {
      score += 5;
      fatores.push('Cliente ativo na carteira GPA (+5%)');
    }
  }

  // Clamp score between 5% and 98% for active pipeline deals
  score = Math.min(98, Math.max(5, Math.round(score)));

  let nivel: 'alta' | 'media' | 'baixa' = 'media';
  let recomendacaoIA = '';

  if (score >= 70) {
    nivel = 'alta';
    recomendacaoIA = `Helena IA: Probabilidade ALTA (${score}%). Enviar reforço comercial e agendar reunião de fecho imediata.`;
  } else if (score >= 40) {
    nivel = 'media';
    recomendacaoIA = `Helena IA: Probabilidade MÉDIA (${score}%). Apresentar comparativo de valor ou oferta complementar em Kz.`;
  } else {
    nivel = 'baixa';
    recomendacaoIA = `Helena IA: Probabilidade BAIXA (${score}%). Contactar cliente por telefone ou WhatsApp para reavaliar requisitos.`;
  }

  return {
    score,
    nivel,
    recomendacaoIA,
    fatoresPrincipais: fatores
  };
}
