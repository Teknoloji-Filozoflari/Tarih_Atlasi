import { useEffect, useMemo, useState } from 'react';
import { createNoteRepository, type LocalNote } from './model';
import { noteStorage } from './storage';
export function useNotes() {
  const repository = useMemo(() => createNoteRepository(noteStorage), []);
  const [records, setRecords] = useState<LocalNote[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [writeError, setWriteError] = useState(false);
  useEffect(() => {
    let alive = true;
    void repository
      .load()
      .then((rows) => {
        if (alive) {
          setRecords(rows);
          setStatus('ready');
        }
      })
      .catch(() => {
        if (alive) setStatus('error');
      });
    return () => {
      alive = false;
    };
  }, [repository]);
  const persist = async (work: () => Promise<LocalNote[]>) => {
    setWriteError(false);
    try {
      setRecords(await work());
      return true;
    } catch {
      setWriteError(true);
      return false;
    }
  };
  return {
    records,
    status,
    writeError,
    save: (n: LocalNote) => persist(() => repository.save(n)),
    remove: (id: string) => persist(() => repository.remove(id)),
  };
}
