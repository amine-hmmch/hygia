/** Écriture dans localStorage qui prévient l'utilisateur si elle échoue (mémoire pleine, mode privé…). */
export const STORAGE_ERROR_EVENT = 'hygia:storage-error';

export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    console.error('Stockage impossible', e);
    if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT));
    return false;
  }
}
