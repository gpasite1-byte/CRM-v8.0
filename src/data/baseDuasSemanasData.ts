export interface BasePropostaRow {
  semana: string;
  semanaDisplay?: string;
  id: number;
  dataEnvio: string;
  cliente: string;
  servico: string;
  estadoProposta: string;
  valorProposta: string;
  valorAprovado: string;
  valorPerdido: string;
  probabilidade: string;
  gestorComercial: string;
  proximaAccao: string;
  proximoContacto: string;
  observacoes: string;
  diasEmAberto: number;
  valorPonderado: string;
  classeCliente: string;
  prioridade: string;
  estadoCRM: string;
  metaSemanal: string;
  pctMeta: string;
}

export const baseDuasSemanasData: BasePropostaRow[] = [
  // --- SEMANA ANTERIOR ---
  {
    semana: 'Semana Anterior', id: 1, dataEnvio: '09/07/2026', cliente: 'IMOCASAIS',
    servico: 'Fornecimento de Blocos de nota, canetas Flyers', estadoProposta: 'Proposta em negociação',
    valorProposta: '1 385 100,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Entregar em contacto com o cliente para saber o orçamento deles',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 14,
    valorPonderado: '554 040,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 2, dataEnvio: '07/07/2026', cliente: 'SUEZ',
    servico: 'Fornecimento de Flyers monofolha e trípticos', estadoProposta: 'Proposta em negociação',
    valorProposta: '6 260 880,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '80%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'negociar a modabilidade de pagamento',
    proximoContacto: '13/07/2026', observacoes: 'Falta o envio da PO, para credibilizar a adjudicação do processo', diasEmAberto: 16,
    valorPonderado: '5 008 704,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 3, dataEnvio: '06/07/2026', cliente: 'TEIXERA DUARTE',
    servico: 'Fornecimento de Diversos', estadoProposta: 'Proposta aprovada',
    valorProposta: '758 100,00 AOA', valorAprovado: '758 100,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Aumentar o fluxo de trabalhos com este cliente',
    proximoContacto: '13/07/2026', observacoes: 'As artes já foram aprovadas', diasEmAberto: 17,
    valorPonderado: '758 100,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '10%'
  },
  {
    semana: 'Semana Anterior', id: 4, dataEnvio: '07/07/2026', cliente: 'SIAC',
    servico: 'Fornecimento de brindes e merchandising', estadoProposta: 'Proposta enviada',
    valorProposta: '19 418 760,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Agendar uma reunião com o cliente',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para validação', diasEmAberto: 16,
    valorPonderado: '7 767 504,00 AOA', classeCliente: 'A', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 5, dataEnvio: '08/07/2026', cliente: 'ALIANÇA SEGUROS',
    servico: 'Fornecimento de Flyers dípticos', estadoProposta: 'Proposta enviada',
    valorProposta: '3 328 800,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Considerar a possibilidade de apresentar um desconto',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para validação', diasEmAberto: 15,
    valorPonderado: '1 331 520,00 AOA', classeCliente: 'A', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 6, dataEnvio: '09/07/2026', cliente: 'COSCAL',
    servico: 'Fornecimento de flyers Trípticos', estadoProposta: 'Produção / Entrega',
    valorProposta: '259 350,00 AOA', valorAprovado: '259 350,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Conseguir o contacto do cliente final',
    proximoContacto: '13/07/2026', observacoes: 'Material produzido e entregue', diasEmAberto: 14,
    valorPonderado: '259 350,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '3%'
  },
  {
    semana: 'Semana Anterior', id: 7, dataEnvio: '16/06/2026', cliente: 'ENDIAMA',
    servico: 'Fornecimento de materiais para outubro rosa', estadoProposta: 'Proposta em negociação',
    valorProposta: '6 958 560,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '80%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'negociar a modabilidade de pagamento',
    proximoContacto: '13/07/2026', observacoes: 'Falta o envio da PO, para credibilizar a adjudicação do processo', diasEmAberto: 37,
    valorPonderado: '5 566 848,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 8, dataEnvio: '25/06/2026', cliente: 'PAY4ALL',
    servico: 'Fornecimento de Brindes para a filda', estadoProposta: 'Proposta aprovada',
    valorProposta: '2 106 150,00 AOA', valorAprovado: '2 106 150,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Acompanharo processo de produção externa e interna, para cumprir com o prazo',
    proximoContacto: '13/07/2026', observacoes: 'Avaliação e criação de artes finais para produção', diasEmAberto: 28,
    valorPonderado: '2 106 150,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '34%'
  },
  {
    semana: 'Semana Anterior', id: 9, dataEnvio: '06/07/2026', cliente: 'XPRINT',
    servico: 'Fornecimento de Brindes e Têxtil', estadoProposta: 'Proposta enviada',
    valorProposta: '2 350 680,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Considerar a possibilidade de apresentar um desconto',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 17,
    valorPonderado: '940 272,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 10, dataEnvio: '10/07/2026', cliente: 'DUBAI INVESTIMETS',
    servico: 'Forneciemnto de Brindes', estadoProposta: 'Proposta enviada',
    valorProposta: '6 156 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Apresentar amostras Físicas e acompanhar o processo',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 13,
    valorPonderado: '3 078 000,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 11, dataEnvio: '08/07/2026', cliente: 'DUBAI INVESTIMETS',
    servico: 'Fornecimento de Flyrs', estadoProposta: 'Proposta enviada',
    valorProposta: '3 249 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Apresentar amostras Físicas e acompanhar o processo',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 15,
    valorPonderado: '1 299 600,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 12, dataEnvio: '06/07/2026', cliente: 'BCGA',
    servico: 'Fornecimento de Lenços e gravatas', estadoProposta: 'Perdida',
    valorProposta: '9 095 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '9 095 000,00 AOA', probabilidade: '0%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Apresentação de disponibilidade para futurod projectos',
    proximoContacto: '13/07/2026', observacoes: 'Proposta rejeitada, por causa do tempo de produção pelo fornecedor não ter o mesmo tecido', diasEmAberto: 17,
    valorPonderado: '0,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Fechado perdido',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 13, dataEnvio: '03/07/2026', cliente: 'BCGA',
    servico: 'Fornecimento de Fita Tulyy', estadoProposta: 'Perdida',
    valorProposta: '2 684 700,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '2 684 700,00 AOA', probabilidade: '0%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Apresentação de disponibilidade para futurod projectos',
    proximoContacto: '13/07/2026', observacoes: 'Proposta reajustada por falta de amostras físicas', diasEmAberto: 20,
    valorPonderado: '0,00 AOA', classeCliente: 'A', prioridade: 'Normal', estadoCRM: 'Fechado perdido',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 14, dataEnvio: '07/07/2026', cliente: 'NOSSA SEGUROS',
    servico: 'Fornecimento de Material para filda', estadoProposta: 'Proposta aprovada',
    valorProposta: '2 809 820,00 AOA', valorAprovado: '2 809 820,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Dar início ao processo de produção',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 16,
    valorPonderado: '2 809 820,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '45%'
  },
  {
    semana: 'Semana Anterior', id: 15, dataEnvio: '06/07/2026', cliente: 'ATO',
    servico: 'Fornecimento de brindes para Filda', estadoProposta: 'Proposta aprovada',
    valorProposta: '7 695 000,00 AOA', valorAprovado: '7 695 000,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Dar início ao processo de produção',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 17,
    valorPonderado: '7 695 000,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '123%'
  },
  {
    semana: 'Semana Anterior', id: 16, dataEnvio: '09/07/2026', cliente: 'AFRICANA',
    servico: 'Fornecimento de material de letras monobloco', estadoProposta: 'Proposta em negociação',
    valorProposta: '12 398 174,88 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Acompanhamento do Processo até o fecho',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 14,
    valorPonderado: '6 199 087,44 AOA', classeCliente: 'B', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 17, dataEnvio: '07/07/2026', cliente: 'DISBRA',
    servico: 'Fornecimento de sacolas e folhetos', estadoProposta: 'Proposta aprovada',
    valorProposta: '222 300,00 AOA', valorAprovado: '222 300,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Pressionar o envio das artes',
    proximoContacto: '13/07/2026', observacoes: 'No aguardo das artes para produção', diasEmAberto: 16,
    valorPonderado: '222 300,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '4%'
  },
  {
    semana: 'Semana Anterior', id: 18, dataEnvio: '07/07/2026', cliente: 'PRODEL',
    servico: 'Fornecimento de Tapetes', estadoProposta: 'Proposta enviada',
    valorProposta: '28 581 282,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'José Neto', proximaAccao: 'Negociar com o cliente, considerar a possibilidade de desconto, marcar uma reunião',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 16,
    valorPonderado: '14 290 641,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 19, dataEnvio: '08/07/2026', cliente: 'JUMUCUZA',
    servico: 'Fornecimento de protedores auditivos', estadoProposta: 'Proposta enviada',
    valorProposta: '953 610,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'José Neto', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação, juntos com as ficha técnica', diasEmAberto: 15,
    valorPonderado: '381 444,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 20, dataEnvio: '10/07/2026', cliente: 'CERTAVE',
    servico: 'Fornecimento de sinaletica', estadoProposta: 'Proposta enviada',
    valorProposta: '1 997 394,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'José Neto', proximaAccao: 'Monitorizar o proc. De adjudicação e manter disponibilidade para envetuais ajustes',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação, juntos com as ficha técnica', diasEmAberto: 13,
    valorPonderado: '798 957,60 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 21, dataEnvio: '08/07/2026', cliente: 'DP-WORLD',
    servico: 'Fornecimento de Brindes', estadoProposta: 'Proposta aprovada',
    valorProposta: '3 024 990,00 AOA', valorAprovado: '3 024 990,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'David Guedes', proximaAccao: 'Aguardar pelo envio das artes',
    proximoContacto: '13/07/2026', observacoes: 'Entrega prevista para o dia 13 do mês corrente', diasEmAberto: 15,
    valorPonderado: '3 024 990,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '81%'
  },
  {
    semana: 'Semana Anterior', id: 22, dataEnvio: '10/07/2026', cliente: 'RHUANITO',
    servico: 'Fornecimento de Flyres e têxtil', estadoProposta: 'Proposta em negociação',
    valorProposta: '687 420,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '80%',
    gestorComercial: 'David Guedes', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 13,
    valorPonderado: '549 936,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 23, dataEnvio: '10/07/2026', cliente: 'KERO',
    servico: 'Fornecimento de Brindes', estadoProposta: 'Proposta enviada',
    valorProposta: '221 160,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'David Guedes', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 13,
    valorPonderado: '88 464,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 24, dataEnvio: '07/07/2026', cliente: 'ACQUA GLOBAL',
    servico: 'Fornecimento de pins', estadoProposta: 'Proposta aprovada',
    valorProposta: '2 109 000,00 AOA', valorAprovado: '2 109 000,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Ilídio Pedro', proximaAccao: 'Dar inicio ao processo de produção',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 16,
    valorPonderado: '2 109 000,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '84%'
  },
  {
    semana: 'Semana Anterior', id: 25, dataEnvio: '06/07/2026', cliente: 'OMATAPALO',
    servico: 'Fornecimento De Placas sinaleticas', estadoProposta: 'Proposta enviada',
    valorProposta: '21 909 090,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '20%',
    gestorComercial: 'Ilídio Pedro', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'O cliente não respondeu ao nosso e-mail, mas tem pouca chances de ser aprovada a nossa proposta', diasEmAberto: 17,
    valorPonderado: '4 381 818,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 26, dataEnvio: '08/07/2026', cliente: 'PURIGLASS',
    servico: 'Fornecimento de T-sirts, autocolantes cartão de visita', estadoProposta: 'Proposta aprovada',
    valorProposta: '706 800,00 AOA', valorAprovado: '706 800,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Entregar o material ao cliente',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 15,
    valorPonderado: '706 800,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '28%'
  },
  {
    semana: 'Semana Anterior', id: 27, dataEnvio: '10/07/2026', cliente: '5 LINHAS',
    servico: 'Fornecimento de diversos', estadoProposta: 'Proposta enviada',
    valorProposta: '8 468 775,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 13,
    valorPonderado: '3 387 510,00 AOA', classeCliente: 'B', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 28, dataEnvio: '10/07/2026', cliente: 'SAAS SISTEMAS TECNOLOGIAS',
    servico: 'Fornecimento de passes', estadoProposta: 'Proposta aprovada',
    valorProposta: '29 640,00 AOA', valorAprovado: '29 640,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Entregar o material ao cliente',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 13,
    valorPonderado: '29 640,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '1%'
  },
  {
    semana: 'Semana Anterior', id: 29, dataEnvio: '05/07/2026', cliente: 'GRUPO CAJUEIRO',
    servico: 'Fornecimento de cartões de visitas', estadoProposta: 'Proposta aprovada',
    valorProposta: '193 800,00 AOA', valorAprovado: '193 800,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Entregar o material ao cliente',
    proximoContacto: '13/07/2026', observacoes: 'Acompanhar o processo até ao fecho para assegurar a entrega na data prevista', diasEmAberto: 18,
    valorPonderado: '193 800,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '8%'
  },
  {
    semana: 'Semana Anterior', id: 30, dataEnvio: '07/07/2026', cliente: 'PEDRA PRECIOSA',
    servico: 'Fornecimento de toalhas bordadas', estadoProposta: 'Proposta em negociação',
    valorProposta: '251 370,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '60%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'A guardando a confirmação do cliente sobra a aprovação', diasEmAberto: 16,
    valorPonderado: '150 822,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Anterior', id: 31, dataEnvio: '10/07/2026', cliente: 'BAXTTER',
    servico: 'Fornecimento de brindes e flyres', estadoProposta: 'Proposta enviada',
    valorProposta: '1 657 560,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '13/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 13,
    valorPonderado: '663 024,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },

  // --- SEMANA FINDA ---
  {
    semana: 'Semana Finda', id: 1, dataEnvio: '13/07/2026', cliente: 'UNITEL',
    servico: 'Canecas de Porcelana e Garrafas Térmica', estadoProposta: 'Proposta enviada',
    valorProposta: '96 124 800,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Incentivar o cliente para o envio da contraproposta.',
    proximoContacto: '20/07/2026', observacoes: 'O processo de análise das propostas está em curso', diasEmAberto: 10,
    valorPonderado: '38 449 920,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 2, dataEnvio: '15/07/2026', cliente: 'FINSTAR/ZAP',
    servico: 'Sacos TNT Personalizados', estadoProposta: 'Proposta aprovada',
    valorProposta: '1 687 200,00 AOA', valorAprovado: '1 687 200,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Pressionar a adjudicação da proposta das T-Shirts',
    proximoContacto: '20/07/2026', observacoes: 'Já entregamos 300 unidades. A entrega será concluída no dia 20 de Julho', diasEmAberto: 8,
    valorPonderado: '1 687 200,00 AOA', classeCliente: 'A', prioridade: 'Média', estadoCRM: 'Fechado ganho',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '22%'
  },
  {
    semana: 'Semana Finda', id: 3, dataEnvio: '14/07/2026', cliente: 'FINSTAR/ZAP',
    servico: 'T-Shirts para Lojistas', estadoProposta: 'Proposta em negociação',
    valorProposta: '21 161 250,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '60%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Solicitar o ponto de situação da PO',
    proximoContacto: '20/07/2026', observacoes: 'Aguardamos a formalização da adjudicação', diasEmAberto: 9,
    valorPonderado: '12 696 750,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 4, dataEnvio: '15/07/2026', cliente: 'CARPINANGOLA/CASAIS',
    servico: 'Bloco de Notas e Canetas', estadoProposta: 'Proposta aprovada',
    valorProposta: '2 017 800,00 AOA', valorAprovado: '2 017 800,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Alinhamento com o cliente para obter mais trabalhos',
    proximoContacto: '20/07/2026', observacoes: 'O processo de produção está em curso, faremos a entrega no dia 20 de Julho', diasEmAberto: 8,
    valorPonderado: '2 017 800,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '27%'
  },
  {
    semana: 'Semana Finda', id: 5, dataEnvio: '17/07/2026', cliente: 'CEGID/PRIMAVERA',
    servico: 'Impressão de Flyers', estadoProposta: 'Proposta aprovada',
    valorProposta: '445 700,00 AOA', valorAprovado: '445 700,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Cumprimento do prazo de entrega',
    proximoContacto: '20/07/2026', observacoes: 'O processo de produção está em curso, faremos a entrega no dia 20 de Julho', diasEmAberto: 6,
    valorPonderado: '445 700,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '6%'
  },
  {
    semana: 'Semana Finda', id: 6, dataEnvio: '17/07/2026', cliente: 'FINSTAR/ZAP',
    servico: 'T-Shirts para Filda', estadoProposta: 'Proposta enviada',
    valorProposta: '1 966 500,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Persuadir a aprovação usando o prazo de entrega do estratégia',
    proximoContacto: '20/07/2026', observacoes: 'As propostas ainda estão a ser analisadas', diasEmAberto: 6,
    valorPonderado: '983 250,00 AOA', classeCliente: 'A', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 7, dataEnvio: '16/07/2026', cliente: 'SIAC',
    servico: 'Totens em Betão', estadoProposta: 'Proposta enviada',
    valorProposta: '29 641 900,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Solicitar uma reunião com este cliente',
    proximoContacto: '20/07/2026', observacoes: 'A nossa proposta foi submetida para avaliação', diasEmAberto: 7,
    valorPonderado: '11 856 760,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 8, dataEnvio: '09/06/2026', cliente: 'SBM OFFSHORE',
    servico: 'Impressão de Autocolante', estadoProposta: 'Proposta aprovada',
    valorProposta: '339 150,00 AOA', valorAprovado: '339 150,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Entrega do material ao cliente',
    proximoContacto: '20/07/2026', observacoes: 'O material está pronto para ser entregue', diasEmAberto: 44,
    valorPonderado: '339 150,00 AOA', classeCliente: 'A', prioridade: 'Normal', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '5%'
  },
  {
    semana: 'Semana Finda', id: 9, dataEnvio: '13/07/2026', cliente: 'BCGA',
    servico: 'Fornecimento de Sacolas', estadoProposta: 'Proposta aprovada',
    valorProposta: '3 135 000,00 AOA', valorAprovado: '3 135 000,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Levantar o material do cliente no fornecedor',
    proximoContacto: '20/07/2026', observacoes: 'Material em produção no fornecedor', diasEmAberto: 10,
    valorPonderado: '3 135 000,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '50%'
  },
  {
    semana: 'Semana Finda', id: 10, dataEnvio: '13/07/2026', cliente: 'TREVOTECH',
    servico: 'Fornecimento de Polos', estadoProposta: 'Proposta aprovada',
    valorProposta: '889 200,00 AOA', valorAprovado: '889 200,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Solicitar feedback do material entregue',
    proximoContacto: '20/07/2026', observacoes: 'Material produzido e entregue', diasEmAberto: 10,
    valorPonderado: '889 200,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '14%'
  },
  {
    semana: 'Semana Finda', id: 11, dataEnvio: '17/07/2026', cliente: 'ANGOLACA',
    servico: 'Fornecimento de Materiais Diversos', estadoProposta: 'Proposta enviada',
    valorProposta: '14 248 432,50 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Contactar a cliente para agendar uma reunião',
    proximoContacto: '20/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 6,
    valorPonderado: '7 124 216,25 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 12, dataEnvio: '14/07/2026', cliente: 'DUBAI INVESTIMETS',
    servico: 'Fornecimento de Garrafas Térmicas', estadoProposta: 'Proposta enviada',
    valorProposta: '29 724 360,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Avaliar a possibilidade de dar um desconto',
    proximoContacto: '20/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 9,
    valorPonderado: '11 889 744,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 13, dataEnvio: '17/07/2026', cliente: 'FADA',
    servico: 'Fornecimento de Brindes', estadoProposta: 'Proposta enviada',
    valorProposta: '3 583 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Solicitar o ponto de situação da proposta',
    proximoContacto: '20/07/2026', observacoes: 'Proposta remetida para avaliação', diasEmAberto: 6,
    valorPonderado: '1 433 200,00 AOA', classeCliente: 'B', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 14, dataEnvio: '16/07/2026', cliente: 'NOSSA SEGUROS',
    servico: 'Fornecimento de Material para Filda', estadoProposta: 'Proposta aprovada',
    valorProposta: '2 530 550,00 AOA', valorAprovado: '2 530 550,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Dar início ao processo de produção',
    proximoContacto: '20/07/2026', observacoes: 'Acompanhamento até finalizar o processo de produção', diasEmAberto: 7,
    valorPonderado: '2 530 550,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '40%'
  },
  {
    semana: 'Semana Finda', id: 15, dataEnvio: '17/07/2026', cliente: 'PROGRAMA ALIMENTAR',
    servico: 'Fornecimento de Materiais Diversos', estadoProposta: 'Proposta em negociação',
    valorProposta: '7 060 875,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Solicitar um feedback do orçamento',
    proximoContacto: '20/07/2026', observacoes: 'A nossa proposta está em análise', diasEmAberto: 6,
    valorPonderado: '2 824 350,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 16, dataEnvio: '14/07/2026', cliente: 'DIVERSIFICA MAIS',
    servico: 'Fornecimento de Passes PVC e Fitas', estadoProposta: 'Proposta enviada',
    valorProposta: '422 712,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Solicitar um feedback do orçamento',
    proximoContacto: '20/07/2026', observacoes: 'Apresentamos a proposta e aguardamos feedback do cliente', diasEmAberto: 9,
    valorPonderado: '169 084,80 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 17, dataEnvio: '16/07/2026', cliente: 'ATO',
    servico: 'Fornecimento e Montagem de Sinaléticas', estadoProposta: 'Proposta enviada',
    valorProposta: '1 983 600,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Contactar o cliente para impulsionar a adjudicação',
    proximoContacto: '20/07/2026', observacoes: 'A nossa proposta está em análise', diasEmAberto: 7,
    valorPonderado: '793 440,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 18, dataEnvio: '17/07/2026', cliente: 'VIAÇÃO E TRÂNSITO',
    servico: 'Flyers e Roll Ups', estadoProposta: 'Proposta aprovada',
    valorProposta: '7 296 000,00 AOA', valorAprovado: '7 296 000,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Solicitar o envio das artes para a produção',
    proximoContacto: '20/07/2026', observacoes: 'As artes serão partilhadas na segunda-feira', diasEmAberto: 6,
    valorPonderado: '7 296 000,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '117%'
  },
  {
    semana: 'Semana Finda', id: 19, dataEnvio: '13/07/2026', cliente: 'BANCO BNI',
    servico: 'Impressão de Flyers', estadoProposta: 'Proposta enviada',
    valorProposta: '881 448,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'José Neto', proximaAccao: 'Solicitar a contraproposta do cliente',
    proximoContacto: '20/07/2026', observacoes: 'Não tivemos feedback da nossa proposta', diasEmAberto: 10,
    valorPonderado: '352 579,20 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 20, dataEnvio: '14/07/2026', cliente: 'PRODEL',
    servico: 'Plotagem de Viatura', estadoProposta: 'Proposta enviada',
    valorProposta: '1 539 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'José Neto', proximaAccao: 'Considerar a possibilidade de apresentar um desconto',
    proximoContacto: '20/07/2026', observacoes: 'A nossa proposta está a ser analisada pelo cliente', diasEmAberto: 9,
    valorPonderado: '615 600,00 AOA', classeCliente: 'B', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 21, dataEnvio: '14/07/2026', cliente: 'INDÚSTRIAS TOPACK',
    servico: 'Coletes Multibolso e Cartões de Visita', estadoProposta: 'Proposta enviada',
    valorProposta: '2 374 050,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'José Neto', proximaAccao: 'Contactar o cliente para negociar a proposta',
    proximoContacto: '20/07/2026', observacoes: 'Apresentamos a proposta e aguardamos feedback do cliente', diasEmAberto: 9,
    valorPonderado: '949 620,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '5 000 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 22, dataEnvio: '16/07/2026', cliente: 'ACADEMIA BAI',
    servico: 'Brindes e Materiais de Merchandising', estadoProposta: 'Proposta enviada',
    valorProposta: '3 169 713,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'David Guedes', proximaAccao: 'Contactar o cliente para saber se recebeu a proposta',
    proximoContacto: '20/07/2026', observacoes: 'Enviamos a proposta mas o cliente não deu feedback', diasEmAberto: 7,
    valorPonderado: '1 267 885,20 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 23, dataEnvio: '17/07/2026', cliente: 'DP WORLD',
    servico: 'Placas em PVC com Vinil', estadoProposta: 'Proposta em negociação',
    valorProposta: '1 962 624,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'David Guedes', proximaAccao: 'Persuadir a aprovação',
    proximoContacto: '20/07/2026', observacoes: 'Já oferecemos um desconto na proposta', diasEmAberto: 6,
    valorPonderado: '981 312,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 24, dataEnvio: '16/07/2026', cliente: 'DP WORLD',
    servico: 'Quadros em Acrílico para Documentos', estadoProposta: 'Proposta enviada',
    valorProposta: '1 590 300,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'David Guedes', proximaAccao: 'Considerar a possibilidade de apresentar um desconto',
    proximoContacto: '20/07/2026', observacoes: 'A nossa proposta está a ser analisada pelo cliente', diasEmAberto: 7,
    valorPonderado: '795 150,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 25, dataEnvio: '15/07/2026', cliente: 'DP WORLD',
    servico: 'Fornecimento de Materiais Diversos', estadoProposta: 'Proposta enviada',
    valorProposta: '1 133 502,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'David Guedes', proximaAccao: 'Entrar em contacto com o cliente e persuadir o fecho',
    proximoContacto: '20/07/2026', observacoes: 'Enviamos a proposta e aguardamos feedback do cliente', diasEmAberto: 8,
    valorPonderado: '566 751,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 26, dataEnvio: '14/07/2026', cliente: 'AUTOMATRIZ',
    servico: 'Fornecimento e Aplicação de Lona', estadoProposta: 'Proposta em negociação',
    valorProposta: '405 840,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'David Guedes', proximaAccao: 'Produção da amostra solicitada',
    proximoContacto: '20/07/2026', observacoes: 'A princípio rejeitamos a produção da amostra, mas vamos analisar melhor', diasEmAberto: 9,
    valorPonderado: '202 920,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 27, dataEnvio: '17/07/2026', cliente: 'POLITEJO',
    servico: 'Impressão de Vinil Autocolante', estadoProposta: 'Proposta aprovada',
    valorProposta: '49 590,00 AOA', valorAprovado: '49 590,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Ilídio Pedro', proximaAccao: 'Manter o contacto com o cliente para gerar novos negócios',
    proximoContacto: '20/07/2026', observacoes: 'O material já foi produzido', diasEmAberto: 6,
    valorPonderado: '49 590,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '2%'
  },
  {
    semana: 'Semana Finda', id: 28, dataEnvio: '14/07/2026', cliente: 'RÁDIO NACIONAL DE ANGOLA',
    servico: 'Brindes para Filda', estadoProposta: 'Perdida',
    valorProposta: '3 243 300,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '3 243 300,00 AOA', probabilidade: '0%',
    gestorComercial: 'Ilídio Pedro', proximaAccao: 'Negociar a parceria com este cliente',
    proximoContacto: '20/07/2026', observacoes: 'A parceria proposta pelo cliente era apenas benéfica para eles', diasEmAberto: 9,
    valorPonderado: '0,00 AOA', classeCliente: 'C', prioridade: 'Baixa', estadoCRM: 'Fechado perdido',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 29, dataEnvio: '14/07/2026', cliente: 'SONANGOL PESQUISA E PRODUÇÃO',
    servico: 'Brindes para Filda', estadoProposta: 'Proposta aprovada',
    valorProposta: '7 927 560,00 AOA', valorAprovado: '7 927 560,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Ilídio Pedro', proximaAccao: 'Cumprimento do prazo de entrega',
    proximoContacto: '20/07/2026', observacoes: 'O material está em produção', diasEmAberto: 9,
    valorPonderado: '7 927 560,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '317%'
  },
  {
    semana: 'Semana Finda', id: 30, dataEnvio: '08/07/20265', cliente: '5 LINHAS TELECOMUNICAÇÕES',
    servico: 'Brindes, Têxteis e Papelaria', estadoProposta: 'Perdida',
    valorProposta: '8 468 775,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '8 468 775,00 AOA', probabilidade: '0%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Apresentar outras soluções ao cliente',
    proximoContacto: '20/07/2026', observacoes: 'O cliente optou por avançar com outro fornecedor', diasEmAberto: 15,
    valorPonderado: '0,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Fechado perdido',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 31, dataEnvio: '13/07/2026', cliente: 'GRUPO CASTEL',
    servico: 'Impressão de Código de Conduta', estadoProposta: 'Proposta enviada',
    valorProposta: '6 002 100,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Contactar o cliente para confirmar se recebeu a proposta',
    proximoContacto: '20/07/2026', observacoes: 'Enviamos a proposta mas o cliente não deu feedback', diasEmAberto: 10,
    valorPonderado: '2 400 840,00 AOA', classeCliente: 'C', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana Finda', id: 32, dataEnvio: '15/07/2026', cliente: 'BAXTTER',
    servico: 'Impressão de Flyers', estadoProposta: 'Proposta aprovada',
    valorProposta: '444 600,00 AOA', valorAprovado: '444 600,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '100%',
    gestorComercial: 'Fernando Leite', proximaAccao: 'Levantamento do material no fornecedor entrega ao cliente',
    proximoContacto: '20/07/2026', observacoes: 'O material está pronto para ser entregue', diasEmAberto: 8,
    valorPonderado: '444 600,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Fechado ganho',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '18%'
  },
  // --- SEMANA 20–25 JULHO 2026 (RELATÓRIO REAL DIA 22/07/2026) ---
  {
    semana: 'Semana 20–25 Jul', id: 33, dataEnvio: '22/07/2026', cliente: 'AGT',
    servico: 'Fornecimento de Livros', estadoProposta: 'Proposta enviada',
    valorProposta: '50 074 500,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Acompanhamento do processo de análise do orçamento',
    proximoContacto: '24/07/2026', observacoes: 'Orçamento entregue para aprovação', diasEmAberto: 1,
    valorPonderado: '20 029 800,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 34, dataEnvio: '22/07/2026', cliente: 'SONILS',
    servico: 'Quadros em Acrílico e Leds', estadoProposta: 'Proposta enviada',
    valorProposta: '62 061 600,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Confirmação do feedback sobre iluminação e estruturas acrílicas',
    proximoContacto: '24/07/2026', observacoes: 'Proposta emitida no dia 22 de Julho', diasEmAberto: 1,
    valorPonderado: '24 824 640,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 35, dataEnvio: '22/07/2026', cliente: 'AUTOMATRIZ',
    servico: 'Flybanners, Vinis e Letreiro Luminoso', estadoProposta: 'Proposta enviada',
    valorProposta: '28 706 340,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'David Guedes', proximaAccao: 'Solicitação de feedback das propostas em aberto',
    proximoContacto: '24/07/2026', observacoes: 'Actualização e envio de proposta', diasEmAberto: 1,
    valorPonderado: '11 482 536,00 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 36, dataEnvio: '22/07/2026', cliente: 'DP WORLD',
    servico: 'Quadros em Acrílico', estadoProposta: 'Proposta em negociação',
    valorProposta: '14 774 400,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'David Guedes', proximaAccao: 'Ajuste de orçamento competitivo em negociação',
    proximoContacto: '24/07/2026', observacoes: 'Cliente apresentou valor de outra proposta concorrente mais atrativa', diasEmAberto: 1,
    valorPonderado: '7 387 200,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 37, dataEnvio: '22/07/2026', cliente: 'ACCESS BANK',
    servico: 'Blocos de Nota, Fitas Porta Passe e Canetas', estadoProposta: 'Proposta enviada',
    valorProposta: '5 176 740,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'David Guedes', proximaAccao: 'Acompanhamento do feedback com o Departamento de Compras',
    proximoContacto: '24/07/2026', observacoes: 'Proposta remetida para validação', diasEmAberto: 1,
    valorPonderado: '2 070 696,00 AOA', classeCliente: 'B', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 38, dataEnvio: '22/07/2026', cliente: 'CLÍNICA SAGRADA ESPERANÇA',
    servico: 'Aplicação de Vinil Fosco', estadoProposta: 'Proposta em negociação',
    valorProposta: '3 485 030,16 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '60%',
    gestorComercial: 'Amélia Cassinda', proximaAccao: 'Trabalho já a decorrer em campo, orçamento actualizado',
    proximoContacto: '23/07/2026', observacoes: 'Orçamento actualizado e trabalho em execução', diasEmAberto: 1,
    valorPonderado: '2 091 018,10 AOA', classeCliente: 'B', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 39, dataEnvio: '22/07/2026', cliente: 'UNITEL',
    servico: 'Produção de Capas de Documentos e Amostras', estadoProposta: 'Proposta enviada',
    valorProposta: '1 500 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Envio de amostras físicas de materiais',
    proximoContacto: '24/07/2026', observacoes: 'Concluiu-se também o lote de 5.000.000 folhas timbradas', diasEmAberto: 1,
    valorPonderado: '750 000,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 40, dataEnvio: '22/07/2026', cliente: 'ENDIAMA',
    servico: 'Design Gráfico, Paginação e Impressão de Revista Interna', estadoProposta: 'Proposta enviada',
    valorProposta: '850 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Luísa Baltazar', proximaAccao: 'Envio estratégico da proposta e acompanhamento da entrega das lanternas',
    proximoContacto: '23/07/2026', observacoes: 'Lanternas entregues com sucesso', diasEmAberto: 1,
    valorPonderado: '425 000,00 AOA', classeCliente: 'A', prioridade: 'Alta', estadoCRM: 'Aberto',
    metaSemanal: '7 500 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 41, dataEnvio: '22/07/2026', cliente: 'PEIXE FRESCO',
    servico: 'Elaboração de Proposta de Material Promocional', estadoProposta: 'Proposta enviada',
    valorProposta: '420 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'David Guedes', proximaAccao: 'Acompanhar recepção da proposta pelo cliente',
    proximoContacto: '24/07/2026', observacoes: 'Proposta enviada em 22/07', diasEmAberto: 1,
    valorPonderado: '168 000,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '3 750 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 42, dataEnvio: '22/07/2026', cliente: 'ATO',
    servico: 'Apresentação de Amostras de Uniformes', estadoProposta: 'Proposta em negociação',
    valorProposta: '220 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '50%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Apresentação presencial da amostra de uniformes',
    proximoContacto: '24/07/2026', observacoes: 'Cliente solicitou amostra dos uniformes', diasEmAberto: 1,
    valorPonderado: '110 000,00 AOA', classeCliente: 'C', prioridade: 'Média', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 43, dataEnvio: '22/07/2026', cliente: 'ANGOALISSAR',
    servico: 'Impressão de Material Promocional Filda', estadoProposta: 'Proposta enviada',
    valorProposta: '185 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '30%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Contactar após o encerramento da Filda',
    proximoContacto: '25/07/2026', observacoes: 'Cliente focado na Filda no momento', diasEmAberto: 1,
    valorPonderado: '55 500,00 AOA', classeCliente: 'B', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 44, dataEnvio: '22/07/2026', cliente: 'AFRICANA',
    servico: 'Impressão e Materiais Gráficos', estadoProposta: 'Proposta enviada',
    valorProposta: '120 000,00 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '30%',
    gestorComercial: 'Marta de Oliveira', proximaAccao: 'Acompanhamento do feedback pós-Filda',
    proximoContacto: '25/07/2026', observacoes: 'Aguardando encerramento da participação na Filda', diasEmAberto: 1,
    valorPonderado: '36 000,00 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '6 250 000,00 AOA', pctMeta: '0%'
  },
  {
    semana: 'Semana 20–25 Jul', id: 45, dataEnvio: '22/07/2026', cliente: 'SOLUÇÕES GRÁFICA',
    servico: 'Orçamento de Impressão e Serviços Gráficos', estadoProposta: 'Proposta enviada',
    valorProposta: '36 522,32 AOA', valorAprovado: '0,00 AOA', valorPerdido: '0,00 AOA', probabilidade: '40%',
    gestorComercial: 'Carlos Francisco', proximaAccao: 'Contactar para obter decisão final da análise',
    proximoContacto: '23/07/2026', observacoes: 'Orçamento em análise pelo cliente', diasEmAberto: 1,
    valorPonderado: '14 608,93 AOA', classeCliente: 'C', prioridade: 'Normal', estadoCRM: 'Aberto',
    metaSemanal: '2 500 000,00 AOA', pctMeta: '0%'
  }
];
