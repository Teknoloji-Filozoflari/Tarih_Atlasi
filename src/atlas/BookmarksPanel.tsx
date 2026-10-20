import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { pilotSearch } from '../data/application';
import type { Bookmark, createBookmarkRepository } from '../discovery/bookmarks';
import type { SavedView } from '../discovery/view';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { yearLabel } from './yearLabel';
import { atlasStyles as s } from './styles';
type Repository = ReturnType<typeof createBookmarkRepository>;
let counter = 0;
export function BookmarksPanel({
  repository,
  view,
  onOpen,
}: {
  repository: Repository;
  view: SavedView;
  onOpen: (view: SavedView) => void;
}) {
  const [recovery, setRecovery] = useState<{ raw: string | null } | null>(null);
  const [items, setItems] = useState<Bookmark[] | null>(null);
  const [failed, setFailed] = useState(false),
    [busy, setBusy] = useState(false),
    [attempt, setAttempt] = useState(0),
    [page, setPage] = useState(0);
  useEffect(() => {
    let active = true;
    void repository
      .list()
      .then((value) => {
        if (active) {
          setItems(value);
          setFailed(false);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [repository, attempt]);
  const commit = (work: Promise<Bookmark[]>) => {
    setBusy(true);
    setFailed(false);
    void work
      .then(setItems)
      .catch(() => setFailed(true))
      .finally(() => setBusy(false));
  };
  const save = (kind: Bookmark['kind']) => {
    const saved: SavedView = {
      year: view.year,
      ...(view.projection ? { projection: view.projection } : {}),
      entityId: kind === 'entity' ? view.entityId : null,
      camera: kind === 'camera' ? view.camera : null,
    };
    commit(
      repository.save({
        id: `bookmark-${Date.now().toString(36)}-${++counter}`,
        kind,
        view: saved,
      }),
    );
  };
  return (
    <View style={s.stack} testID="bookmarks-panel">
      <AppText>{t('bookmarks.notice')}</AppText>
      <Action
        label={`${t('bookmarks.saveYear')} (${yearLabel(view.year)})`}
        disabled={busy || items === null || items.length >= 50}
        onPress={() => save('year')}
      />
      <Action
        label={`${t('bookmarks.saveEntity')}${view.entityId ? ` — ${pilotSearch?.get(view.entityId)?.name ?? view.entityId}` : ''}`}
        disabled={busy || items === null || !view.entityId || items.length >= 50}
        onPress={() => save('entity')}
      />
      <Action
        label={t('bookmarks.saveCamera')}
        disabled={busy || items === null || !view.camera || items.length >= 50}
        onPress={() => save('camera')}
      />
      {!view.camera && <AppText>{t('bookmarks.noCamera')}</AppText>}
      {failed && (
        <>
          <AppText accessibilityRole="alert">{t('bookmarks.failed')}</AppText>
          <Action label={t('state.error.retry')} onPress={() => setAttempt((v) => v + 1)} />
          <Action
            label={t('bookmarks.recovery')}
            onPress={() => {
              void repository
                .recoveryText()
                .then((raw) => setRecovery({ raw }))
                .catch(() => setFailed(true));
            }}
          />
          {recovery && (
            <View style={s.stack}>
              <AppText>{t('bookmarks.recoveryNotice')}</AppText>
              <AppText selectable>{recovery.raw ?? t('bookmarks.empty')}</AppText>
              <Action
                label={t('bookmarks.confirmReset')}
                onPress={() => {
                  commit(repository.resetAfterReview(recovery.raw));
                  setRecovery(null);
                }}
              />
              <Action label={t('bookmarks.cancelRecovery')} onPress={() => setRecovery(null)} />
            </View>
          )}
        </>
      )}
      {items === null && !failed && <AppText>{t('state.loading.title')}</AppText>}
      {items?.length === 0 && <AppText>{t('bookmarks.empty')}</AppText>}
      {items?.length === 50 && <AppText>{t('bookmarks.limit')}</AppText>}
      {items?.slice(page * 8, page * 8 + 8).map((item, index) => (
        <View key={item.id} style={s.stack}>
          <AppText>
            {t(`bookmarks.kind.${item.kind}`)} · {yearLabel(item.view.year)}
          </AppText>
          {item.view.entityId && (
            <AppText>{pilotSearch?.get(item.view.entityId)?.name ?? t('search.missing')}</AppText>
          )}
          <Action
            label={`${t('bookmarks.open')} — ${t(`bookmarks.kind.${item.kind}`)} · ${yearLabel(item.view.year)} (${page * 8 + index + 1})`}
            disabled={busy}
            onPress={() => onOpen(item.view)}
          />
          <Action
            label={`${t('bookmarks.remove')} — ${t(`bookmarks.kind.${item.kind}`)} · ${yearLabel(item.view.year)} (${page * 8 + index + 1})`}
            disabled={busy}
            onPress={() => {
              setPage(0);
              commit(repository.remove(item.id));
            }}
          />
        </View>
      ))}
      {!!items && items.length > 8 && (
        <View style={s.row}>
          <Action
            label={t('selection.previous')}
            disabled={!page}
            onPress={() => setPage(page - 1)}
          />
          <Action
            label={t('selection.next')}
            disabled={(page + 1) * 8 >= items.length}
            onPress={() => setPage(page + 1)}
          />
        </View>
      )}
    </View>
  );
}
