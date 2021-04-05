import fs from 'fs';
import { from, prepend } from 'list';

// async function db<T extends { id: string }>() {
//   function init() {
//     const dataStr = await readFile('data.db', 'utf-8');
//     let data = from<T>(JSON.parse(dataStr) as T[]);
//   }
//   function addItem<T>(item: Omit<T, 'id'>) {
//     data = prepend({ ...(item as any), id: nanoid() }, data);
//   }
//   function getItem(id: string): T | undefined {
//     return find((d: T) => d.id === id, data);
//   }
//   return { addItem, getItem };
// }

let l = from([1, 2, 3]);
l = prepend(0, l);
