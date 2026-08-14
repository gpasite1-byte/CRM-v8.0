import { Usuario } from '../types';
import { initialComerciais } from '../data';

/**
 * Helper to ensure official seed users exist while 100% PRESERVING
 * user-customized photos, passwords, phone numbers, and notification settings.
 * Never overwrites a user's customized photo or password with default seed values.
 */
export function sanitizeAndDeduplicateUsers(list: Usuario[] = []): Usuario[] {
  if (!list || !Array.isArray(list) || list.length === 0) return initialComerciais;

  const result: Usuario[] = [];
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();
  const seenIds = new Set<string>();

  for (const u of list) {
    if (!u || !u.nome) continue;
    const email = (u.email || '').toLowerCase().trim();
    const nome = (u.nome || '').toLowerCase().trim();
    const id = (u.id || '').trim();

    // Remove any duplicate/excess admin accounts that are not official
    if ((nome === 'admin' || nome === 'administrador') && email !== 'admin@gpaangola.co.ao') {
      continue;
    }
    if (nome.startsWith('admin') && !['admin', 'admin1', 'admin2'].includes(nome) && email !== 'david.neto@gpaangola.co.ao') {
      continue;
    }

    if ((id && seenIds.has(id)) || (email && seenEmails.has(email)) || (nome && seenNames.has(nome))) {
      continue;
    }

    if (id) seenIds.add(id);
    if (email) seenEmails.add(email);
    if (nome) seenNames.add(nome);

    // Deep preservation: match with initial seed for missing metadata but NEVER overwrite custom photo/password
    const seedMatch = initialComerciais.find(initU => 
      initU.id === u.id || 
      initU.email.toLowerCase().trim() === email || 
      initU.nome.toLowerCase().trim() === nome
    );

    const preservedUser: Usuario = {
      ...(seedMatch || {}),
      ...u,
      // Guarantee custom photo and password are strictly preserved
      foto: u.foto !== undefined && u.foto !== null ? u.foto : (seedMatch?.foto || ''),
      senha: u.senha ? u.senha : (seedMatch?.senha || 'gpa2026'),
      telefone: u.telefone || seedMatch?.telefone || '922000000',
      whatsappNumero: u.whatsappNumero || seedMatch?.whatsappNumero || u.telefone || '922000000',
      perfil: u.perfil || seedMatch?.perfil || 'comercial',
      funcao: u.funcao || seedMatch?.funcao || 'Comercial',
      status: u.status || seedMatch?.status || 'ativo',
      metaSemanal: u.metaSemanal !== undefined ? u.metaSemanal : (seedMatch?.metaSemanal || 3750000),
      metaMensal: u.metaMensal !== undefined ? u.metaMensal : (seedMatch?.metaMensal || 15000000)
    };

    result.push(preservedUser);
  }

  // Ensure official initial seed accounts exist if never registered
  for (const initU of initialComerciais) {
    const eKey = initU.email.toLowerCase().trim();
    const nKey = initU.nome.toLowerCase().trim();
    const iKey = initU.id.trim();

    if (!seenEmails.has(eKey) && !seenNames.has(nKey) && !seenIds.has(iKey)) {
      seenEmails.add(eKey);
      seenNames.add(nKey);
      if (iKey) seenIds.add(iKey);
      result.push(initU);
    }
  }

  return result;
}

export function mergeWithInitialComerciais(incoming: Usuario[] = []): Usuario[] {
  return sanitizeAndDeduplicateUsers(incoming);
}
