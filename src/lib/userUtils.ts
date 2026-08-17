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
    if ((nome === 'admin' || nome === 'administrador') && email !== 'admin@gpaangola.co.ao' && email !== 'admin') {
      continue;
    }

    if ((id && seenIds.has(id)) || (email && seenEmails.has(email))) {
      continue;
    }

    if (id) seenIds.add(id);
    if (email) seenEmails.add(email);
    if (nome) seenNames.add(nome);

    // Deep preservation: match with initial seed by ID or Email (never strictly by old name)
    const seedMatch = initialComerciais.find(initU => 
      (id && initU.id === id) || 
      (email && initU.email.toLowerCase().trim() === email)
    );

    const preservedUser: Usuario = {
      ...(seedMatch || {}),
      ...u,
      // User or admin explicit edits take absolute precedence over seed values
      nome: u.nome || seedMatch?.nome || 'Utilizador',
      senha: u.senha !== undefined && u.senha !== '' ? u.senha : (seedMatch?.senha || 'gpa2026'),
      perfil: u.perfil || seedMatch?.perfil || 'comercial',
      funcao: u.funcao || seedMatch?.funcao || 'Comercial',
      foto: u.foto !== undefined && u.foto !== null ? u.foto : (seedMatch?.foto || ''),
      telefone: u.telefone || seedMatch?.telefone || '922000000',
      whatsappNumero: u.whatsappNumero || seedMatch?.whatsappNumero || u.telefone || '922000000',
      status: u.status || seedMatch?.status || 'ativo',
      metaSemanal: u.metaSemanal !== undefined ? u.metaSemanal : (seedMatch?.metaSemanal || 3750000),
      metaMensal: u.metaMensal !== undefined ? u.metaMensal : (seedMatch?.metaMensal || 15000000)
    };

    result.push(preservedUser);
  }

  // Ensure official initial seed accounts exist if never registered
  for (const initU of initialComerciais) {
    const eKey = initU.email.toLowerCase().trim();
    const iKey = initU.id.trim();

    if (!seenEmails.has(eKey) && !seenIds.has(iKey)) {
      seenEmails.add(eKey);
      if (iKey) seenIds.add(iKey);
      result.push(initU);
    }
  }

  return result;
}

export function mergeWithInitialComerciais(incoming: Usuario[] = []): Usuario[] {
  return sanitizeAndDeduplicateUsers(incoming);
}

