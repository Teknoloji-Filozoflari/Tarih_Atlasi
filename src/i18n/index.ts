import { tr } from './tr.ts';

export type MessageKey = keyof typeof tr;
export type MessageCatalog = Readonly<Record<MessageKey, string>>;
export const locale = 'tr' as const;

// Yeni dil, aynı anahtarları sağlayan bir MessageCatalog ile eklenebilir.
// Dil seçimi ve henüz çevrilmemiş İngilizce metinler bu fazın kapsamı dışındadır.
export function t(key: MessageKey): string {
  return tr[key];
}
