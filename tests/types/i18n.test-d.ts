import { t } from '../../src/i18n/index.ts';
import type { MessageCatalog } from '../../src/i18n/index.ts';
import { tr } from '../../src/i18n/tr.ts';

t('app.name');
// @ts-expect-error Yazım hatalı çeviri anahtarı kabul edilmemeli.
t('app.nam');

const futureCatalog: MessageCatalog = { ...tr };
void futureCatalog;
// @ts-expect-error Yeni dil eksik anahtarlarla tamamlanmış sayılmamalı.
const incompleteCatalog: MessageCatalog = { 'app.name': 'Atlas' };
void incompleteCatalog;
