/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

function cleanUrl(raw: string) {
  if (!raw) return '';
  let u = raw.trim().replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/, '');
  if (u && !u.startsWith('http://') && !u.startsWith('https://')) {
    u = `https://${u}`;
  }
  return u;
}

function safeCreateClient(rawUrl: string, rawKey: string) {
  const url = cleanUrl(rawUrl);
  const key = (rawKey || '').trim();
  if (!url || !key) return null;
  
  try {
    return createClient(url, key);
  } catch (err) {
    console.warn('⚠️ Erro ao criar cliente Supabase:', err);
    return null;
  }
}

function getStoredSupabaseConfig() {
  const DEFAULT_URL = 'https://ivdjioewgcnrepyruryq.supabase.co';
  const DEFAULT_KEY = 'sb_publishable_i6dibGvCrE8aTOdor__QvA_iFyy-f-i';

  try {
    let url = localStorage.getItem('GPA_SUPABASE_URL') || import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL;
    let key = localStorage.getItem('GPA_SUPABASE_KEY') || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;
    
    return { url: cleanUrl(url), key: key.trim() };
  } catch {
    return {
      url: DEFAULT_URL,
      key: DEFAULT_KEY
    };
  }
}

const config = getStoredSupabaseConfig();

export let supabase = safeCreateClient(config.url, config.key);

export const isSupabaseConfigured = !!supabase;

export function configureSupabaseRuntime(url: string, key: string) {
  const trimmedUrl = url.trim();
  const trimmedKey = key.trim();

  if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
    alert('A URL do Supabase deve começar com https:// (exemplo: https://seu-projeto.supabase.co)');
    return false;
  }

  try {
    const client = safeCreateClient(trimmedUrl, trimmedKey);
    if (client) {
      localStorage.setItem('GPA_SUPABASE_URL', trimmedUrl);
      localStorage.setItem('GPA_SUPABASE_KEY', trimmedKey);
      supabase = client;
      return true;
    }
  } catch (e) {
    console.error('Error saving supabase runtime config:', e);
  }
  return false;
}

export function getSupabaseConfigStatus() {
  const { url, key } = getStoredSupabaseConfig();
  return {
    configured: !!(url && key),
    url
  };
}

const DOC_ID = 'gpa_angola_main_db';

export async function loadCrmDataFromFirestore() {
  const currentSupabase = supabase;
  if (!currentSupabase) {
    return null;
  }
  
  try {
    const { data, error } = await currentSupabase
      .from('crm_data')
      .select('payload')
      .eq('id', DOC_ID)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116' || error.code === '42P01') {
        console.info('ℹ️ Tabela crm_data ou registo inicial ainda não criados no Supabase.');
        return null;
      }
      return null;
    }
    
    return data?.payload || null;
  } catch (err: any) {
    return null;
  }
}

export async function saveCrmDataToFirestore(crmData: any) {
  const currentSupabase = supabase;
  if (!currentSupabase) {
    return;
  }
  
  try {
    const dataToSave = { ...crmData };

    if (Array.isArray(crmData.comerciais)) {
      dataToSave.comerciais = crmData.comerciais.map((u: any) => {
        if (!u) return u;
        return { ...u, foto: u.foto || '' };
      });
    }

    if (Array.isArray(crmData.arquivos)) {
      dataToSave.arquivos = crmData.arquivos.map((file: any) => {
        if (!file) return file;
        return {
          id: file.id,
          nome: file.nome,
          tipo: file.tipo,
          tamanho: file.tamanho,
          url: file.url || '',
          hasStoredContent: true,
          criadoEm: file.criadoEm,
          enviadoPor: file.enviadoPor,
          clienteAssociado: file.clienteAssociado,
          negocioAssociado: file.negocioAssociado,
          categoria: file.categoria || 'documento',
          observacoes: file.observacoes || ''
        };
      });
    }

    const { error } = await currentSupabase
      .from('crm_data')
      .upsert({ 
        id: DOC_ID, 
        payload: dataToSave,
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' });

    if (error) {
      console.info('ℹ️ Supabase client direct upsert unavailable, triggering backend sync:', error.message || error);
      fetch('/api/supabase/migrate', { method: 'POST' }).catch(() => {});
    }
  } catch (err: any) {
    console.info('ℹ️ Client Supabase sync info:', err?.message || err);
    fetch('/api/supabase/migrate', { method: 'POST' }).catch(() => {});
  }
}

export function subscribeCrmDataFromFirestore(onUpdate: (data: any) => void) {
  const currentSupabase = supabase;
  if (!currentSupabase) {
    return () => {};
  }
  
  const channel = currentSupabase
    .channel('crm_data_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'crm_data',
        filter: `id=eq.${DOC_ID}`
      },
      (payload) => {
        if (payload.new && (payload.new as any).payload) {
          onUpdate((payload.new as any).payload);
        }
      }
    )
    .subscribe();

  return () => {
    currentSupabase.removeChannel(channel);
  };
}

export async function saveFileToFirestore(fileData: any) {
  const currentSupabase = supabase;
  if (!currentSupabase) {
    return fileData;
  }
  
  try {
    let finalUrl = fileData.url;
    
    if (finalUrl && finalUrl.startsWith('data:')) {
      const base64Parts = finalUrl.split(';base64,');
      let contentType = fileData.tipo;
      let rawBase64 = finalUrl;
      
      if (base64Parts.length === 2) {
        contentType = base64Parts[0].split(':')[1] || contentType;
        rawBase64 = base64Parts[1];
      }
      
      let blob: Blob | null = null;
      try {
        const byteCharacters = atob(rawBase64.replace(/\s/g, ''));
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 512) {
          const slice = byteCharacters.slice(offset, offset + 512);
          const byteNumbers = new Array(slice.length);
          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          byteArrays.push(byteArray);
        }
        blob = new Blob(byteArrays, { type: contentType });
      } catch (e) {
        console.warn('Invalid base64 string provided to saveFileToFirestore:', e);
      }
      
      if (blob) {
        const ext = fileData.nome.split('.').pop() || 'bin';
        const filePath = `${fileData.id}.${ext}`;
        
        const { error } = await currentSupabase.storage
          .from('crm_files')
          .upload(filePath, blob, {
            contentType,
            upsert: true
          });
          
        if (!error) {
          const { data: urlData } = currentSupabase.storage
            .from('crm_files')
            .getPublicUrl(filePath);
            
          finalUrl = urlData.publicUrl;
        }
      }

      const { data: crmData } = await currentSupabase
        .from('crm_data')
        .select('payload')
        .eq('id', DOC_ID)
        .single();

      if (crmData && crmData.payload && Array.isArray(crmData.payload.arquivos)) {
        const updatedArquivos = crmData.payload.arquivos.map((a: any) => 
          a.id === fileData.id ? { ...a, url: finalUrl } : a
        );
        await currentSupabase
          .from('crm_data')
          .update({ payload: { ...crmData.payload, arquivos: updatedArquivos }, updated_at: new Date().toISOString() })
          .eq('id', DOC_ID);
      }
    }
    
    return { ...fileData, url: finalUrl };
  } catch (err) {
    console.error('Error saving file to Supabase:', err);
    return fileData;
  }
}

export async function deleteFileFromFirestore(fileId: string) {
  const currentSupabase = supabase;
  if (!currentSupabase) return;
  
  try {
    const { data: files } = await currentSupabase.storage.from('crm_files').list();
    if (files) {
      const fileToDelete = files.find(f => f.name.startsWith(fileId));
      if (fileToDelete) {
        await currentSupabase.storage
          .from('crm_files')
          .remove([fileToDelete.name]);
      }
    }
  } catch (err) {
    console.error('Error deleting file from Supabase Storage:', err);
  }
}
