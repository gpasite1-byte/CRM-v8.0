import { Usuario } from '../types';
import { initialComerciais } from '../data';

// Helper to ensure initial seed users (like Suzete Francisco) are never omitted and remove duplicate/excess admin accounts
export function sanitizeAndDeduplicateUsers(list: Usuario[] = []): Usuario[] {
  if (!list || !Array.isArray(list)) return initialComerciais;

  const result: Usuario[] = [];
  const seenEmails = new Set<string>();
  const seenNames = new Set<string>();

  for (const u of list) {
    if (!u || !u.nome) continue;
    const email = (u.email || '').toLowerCase().trim();
    const nome = (u.nome || '').toLowerCase().trim();

    // Remove any duplicate/excess admin users named "admin" or "administrador"
    // that are NOT the official admin@gpaangola.co.ao
    if ((nome === 'admin' || nome === 'administrador') && email !== 'admin@gpaangola.co.ao') {
      continue;
    }

    // Remove any extra admin accounts like admin3, admin_copia, etc.
    if (nome.startsWith('admin') && !['admin', 'admin1', 'admin2'].includes(nome) && email !== 'david.neto@gpaangola.co.ao') {
      continue;
    }

    if ((email && seenEmails.has(email)) || (nome && seenNames.has(nome))) {
      continue;
    }

    if (email) seenEmails.add(email);
    if (nome) seenNames.add(nome);
    result.push(u);
  }

  // Ensure official initial seed accounts exist
  for (const initU of initialComerciais) {
    const eKey = initU.email.toLowerCase().trim();
    const nKey = initU.nome.toLowerCase().trim();
    if (!seenEmails.has(eKey) && !seenNames.has(nKey)) {
      seenEmails.add(eKey);
      seenNames.add(nKey);
      result.push(initU);
    }
  }

  return result;
}

export function mergeWithInitialComerciais(incoming: Usuario[] = []): Usuario[] {
  return sanitizeAndDeduplicateUsers(incoming);
}
