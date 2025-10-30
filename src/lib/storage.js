// src/lib/storage.js
/**
 * Capa simple de persistencia en localStorage con prefijo "pos_".
 * Nos sirve para guardar: productos, clientes, ventas, sesiones de caja, etc.
 */

const PREFIX = 'pos_';

export const saveData = (key, data) => {
  try {
    localStorage.setItem(`${PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.error('[storage.saveData] Error guardando', key, err);
  }
};

export const loadData = (key, defaultValue = []) => {
  try {
    const raw = localStorage.getItem(`${PREFIX}${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch (err) {
    console.error('[storage.loadData] Error leyendo', key, err);
    return defaultValue;
  }
};

export const removeData = (key) => {
  try {
    localStorage.removeItem(`${PREFIX}${key}`);
  } catch (err) {
    console.error('[storage.removeData] Error eliminando', key, err);
  }
};

/**
 * Helpers comunes para listas (ej. productos, clientes):
 */
export const pushItem = (key, item) => {
  const list = loadData(key, []);
  list.push(item);
  saveData(key, list);
  return list;
};

export const upsertItem = (key, item, idField = 'id') => {
  const list = loadData(key, []);
  const idx = list.findIndex((x) => x[idField] === item[idField]);
  if (idx >= 0) list[idx] = item;
  else list.push(item);
  saveData(key, list);
  return list;
};

export const deleteItem = (key, id, idField = 'id') => {
  const list = loadData(key, []);
  const filtered = list.filter((x) => x[idField] !== id);
  saveData(key, filtered);
  return filtered;
};
