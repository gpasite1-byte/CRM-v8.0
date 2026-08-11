import { FunilPipeline } from '../types';

export const defaultPipelines: FunilPipeline[] = [
  {
    id: 'funil_vendas_corp',
    nome: 'Vendas Corporativas & Contratos',
    descricao: 'Pipeline principal de propostas e vendas corporativas GPA Angola',
    icone: 'Briefcase',
    padrao: true,
    etapas: [
      { id: 'lead', nome: '1. Oportunidade / Lead', cor: '#64748b', ordem: 1 },
      { id: 'contato', nome: '2. Qualificação & Contacto', cor: '#0284c7', ordem: 2 },
      { id: 'visita', nome: '3. Reunião / Visita Técnica', cor: '#7c3aed', ordem: 3 },
      { id: 'proposta', nome: '4. Proposta Enviada', cor: '#d97706', ordem: 4 },
      { id: 'negociacao', nome: '5. Negociação Final', cor: '#ea580c', ordem: 5 },
      { id: 'fechado', nome: '6. Fechado (Ganha)', cor: '#16a34a', ordem: 6 },
      { id: 'producao', nome: '7. Em Produção / Serviço', cor: '#059669', ordem: 7 },
      { id: 'perdido', nome: 'Perdido / Cancelado', cor: '#dc2626', ordem: 8 }
    ]
  },
  {
    id: 'funil_auditoria',
    nome: 'Auditoria, Consultoria & QSMS',
    descricao: 'Funil especializado para auditorias de segurança, higiene e normas ISO',
    icone: 'ShieldCheck',
    padrao: false,
    etapas: [
      { id: 'lead', nome: 'Levantamento Inicial', cor: '#475569', ordem: 1 },
      { id: 'visita', nome: 'Auditoria de Diagnóstico', cor: '#2563eb', ordem: 2 },
      { id: 'proposta', nome: 'Emissão de Relatório / Proposta', cor: '#d97706', ordem: 3 },
      { id: 'negociacao', nome: 'Validação Técnica com Cliente', cor: '#ca8a04', ordem: 4 },
      { id: 'fechado', nome: 'Contrato Adjudicado', cor: '#16a34a', ordem: 5 },
      { id: 'perdido', nome: 'Não Adjudicado', cor: '#dc2626', ordem: 6 }
    ]
  },
  {
    id: 'funil_manutencao',
    nome: 'Manutenção & Equipamentos',
    descricao: 'Fornecimento de equipamentos, sinalização e contratos de manutenção mensal',
    icone: 'Wrench',
    padrao: false,
    etapas: [
      { id: 'lead', nome: 'Pedido de Cotação', cor: '#64748b', ordem: 1 },
      { id: 'proposta', nome: 'Cotação Enviada', cor: '#0284c7', ordem: 2 },
      { id: 'negociacao', nome: 'Aprovação de Orçamento', cor: '#d97706', ordem: 3 },
      { id: 'fechado', nome: 'Fornecimento / Fechado', cor: '#16a34a', ordem: 4 },
      { id: 'perdido', nome: 'Cotação Declinada', cor: '#dc2626', ordem: 5 }
    ]
  }
];

export function loadPipelines(): FunilPipeline[] {
  try {
    const saved = localStorage.getItem('gpa_funis_pipeline');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Error loading pipelines:', e);
  }
  return defaultPipelines;
}

export function savePipelines(pipelines: FunilPipeline[]): void {
  try {
    localStorage.setItem('gpa_funis_pipeline', JSON.stringify(pipelines));
  } catch (e) {
    console.error('Error saving pipelines:', e);
  }
}
