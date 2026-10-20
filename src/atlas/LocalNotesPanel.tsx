import { useState } from 'react';
import { TextInput, View } from 'react-native';
import type { LocalNote, NoteKind } from '../annotations/model';
import { isLocalNote } from '../annotations/model';
import type { useNotes } from '../annotations/useNotes';
import { parseYearInput } from '../timeline/interaction';
import { yearLabel } from './yearLabel';
import { t } from '../i18n';
import { AppText } from '../ui/AppText';
import { Action } from './Action';
import { atlasStyles as s } from './styles';
export function LocalNotesPanel({
  notes,
  point,
  year,
  selectedId,
  onFocus,
}: {
  notes: ReturnType<typeof useNotes>;
  point: { lng: number; lat: number };
  year: number;
  selectedId: string | null;
  onFocus: (n: LocalNote) => void;
}) {
  const existing = notes.records.find((n) => n.id === selectedId);
  const [draft, setDraft] = useState({
    title: existing?.title ?? '',
    description: existing?.description ?? '',
    source: existing?.source ?? '',
    kind: existing?.kind ?? ('person' as NoteKind),
    start: yearLabel(existing?.start ?? year),
    end: yearLabel(existing?.end ?? year),
    lng: String(existing?.lng ?? point.lng.toFixed(5)),
    lat: String(existing?.lat ?? point.lat.toFixed(5)),
  });
  const [error, setError] = useState(false),
    [saving, setSaving] = useState(false),
    [confirm, setConfirm] = useState(false);
  const save = async () => {
    const n: LocalNote = {
      id:
        existing?.id ??
        `local:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      kind: draft.kind,
      title: draft.title.trim(),
      description: draft.description.trim(),
      source: draft.source.trim(),
      start: parseYearInput(draft.start, new Date().getFullYear()) ?? 0,
      end: parseYearInput(draft.end, new Date().getFullYear()) ?? 0,
      lng: draft.lng.trim() ? Number(draft.lng.replace(',', '.')) : NaN,
      lat: draft.lat.trim() ? Number(draft.lat.replace(',', '.')) : NaN,
      reviewStatus: 'unverified',
    };
    if (!isLocalNote(n)) {
      setError(true);
      return;
    }
    setError(false);
    setSaving(true);
    if (await notes.save(n)) onFocus(n);
    setSaving(false);
  };
  return (
    <View style={s.stack} testID="local-notes-panel">
      <AppText>{t('notes.notice')}</AppText>
      {notes.status !== 'ready' ? (
        <AppText accessibilityRole="alert">
          {t(notes.status === 'error' ? 'notes.readError' : 'state.loading.title')}
        </AppText>
      ) : (
        <>
          <View style={s.row}>
            {(['person', 'war', 'event'] as const).map((kind) => (
              <Action
                key={kind}
                label={t(`notes.${kind}`)}
                selected={kind === draft.kind}
                onPress={() => setDraft({ ...draft, kind })}
              />
            ))}
          </View>
          {(['title', 'description', 'start', 'end', 'lng', 'lat', 'source'] as const).map(
            (key) => (
              <View key={key} style={s.stack}>
                <AppText variant="small">{t(`notes.${key}`)}</AppText>
                <TextInput
                  accessibilityLabel={t(`notes.${key}`)}
                  value={draft[key]}
                  onChangeText={(value) => setDraft({ ...draft, [key]: value })}
                  maxLength={
                    key === 'description'
                      ? 500
                      : key === 'source'
                        ? 300
                        : key === 'title'
                          ? 100
                          : 24
                  }
                  multiline={key === 'description'}
                  style={s.input}
                />
              </View>
            ),
          )}
          {(error || notes.writeError) && (
            <AppText accessibilityRole="alert">
              {t(error ? 'notes.invalid' : 'notes.writeError')}
            </AppText>
          )}
          <Action label={t('notes.save')} disabled={saving} onPress={() => void save()} />
          {existing && (
            <Action
              label={t(confirm ? 'notes.confirmDelete' : 'notes.delete')}
              disabled={saving}
              onPress={() => {
                if (!confirm) {
                  setConfirm(true);
                  return;
                }
                setSaving(true);
                void notes.remove(existing.id).then(() => setSaving(false));
              }}
            />
          )}
        </>
      )}
      <AppText variant="small">{t('notes.limit')}</AppText>
      {notes.records.map((n) => (
        <Action
          key={n.id}
          label={`${n.title} · ${yearLabel(n.start)}–${yearLabel(n.end)}`}
          onPress={() => onFocus(n)}
        />
      ))}
    </View>
  );
}
