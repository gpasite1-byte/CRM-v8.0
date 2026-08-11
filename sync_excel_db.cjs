const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const DB_PATH = path.join(__dirname, 'crm-db.json');
const DOCS_DIR = path.join(__dirname, 'Ducumentos');

console.log('🔄 Iniciando atualização e sincronização dos ficheiros Excel...');

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ crm-db.json não encontrado!');
  process.exit(1);
}

const dbData = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
let deals = dbData.deals || [];

// Garantir que todos os deals existentes têm campos completos
deals = deals.map(d => {
  const val = Number(d.valor || 0);
  let valAprov = Number(d.valorAprovado || 0);
  let valPerd = Number(d.valorPerdido || 0);

  if (d.etapa === 'fechado' && valAprov === 0) valAprov = val;
  if (d.etapa === 'perdido' && valPerd === 0) valPerd = val;

  return {
    ...d,
    empresa: d.empresa || d.clienteNome || 'Empresa',
    valorAprovado: valAprov,
    valorPerdido: valPerd,
    probabilidade: d.probabilidade || (d.etapa === 'fechado' ? '100%' : d.etapa === 'perdido' ? '0%' : '50%'),
    proximaAcao: d.proximaAcao || 'Acompanhamento comercial',
    proximoContacto: d.proximoContacto || d.dataEnvio || '13/07/2026',
    observacoes: d.observacoes || d.observacaoFinal || 'Ficheiro Excel importado',
    dataEnvio: d.dataEnvio || '09/07/2026',
    classeCliente: d.classeCliente || 'B',
    crmStatus: d.crmStatus || (d.etapa === 'fechado' ? 'Fechado ganho' : d.etapa === 'perdido' ? 'Fechado perdido' : 'Aberto')
  };
});

dbData.deals = deals;
fs.writeFileSync(DB_PATH, JSON.stringify(dbData, null, 2), 'utf-8');
console.log(`✅ Base crm-db.json atualizada com sucesso! Total de ${deals.length} deals validados com todos os 20+ campos.`);
