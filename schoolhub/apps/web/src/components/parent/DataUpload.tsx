import { useState, useRef, useCallback } from 'react';
import type { UploadFileType, Upload, UploadError } from '@schoolhub/types';
import { api } from '../../services/api';
import { supabase } from '../../services/supabase';

// ─── Types ─────────────────────────────────────────────────────────────────

interface Props {
  childId?: string;
  allowedTypes?: UploadFileType[];
  onComplete?: (upload: Upload) => void;
}

type UploadPhase = 'idle' | 'uploading' | 'parsing' | 'done' | 'error' | 'correction';

interface LocalUpload {
  id: string;
  filename: string;
  fileType: UploadFileType;
  phase: UploadPhase;
  error: UploadError | null;
  result: Upload | null;
}

const ALLOWED_EXTENSIONS: Record<UploadFileType, string[]> = {
  spelling_list: ['.csv', '.txt', '.xlsx'],
  assessment_dates: ['.pdf', '.ics'],
  school_calendar: ['.ics', '.pdf'],
  moe_syllabus: ['.pdf'],
};

const FILE_TYPE_LABELS: Record<UploadFileType, string> = {
  spelling_list: 'Spelling list',
  assessment_dates: 'Assessment dates',
  school_calendar: 'School calendar',
  moe_syllabus: 'MOE syllabus',
};

const ALL_TYPES: UploadFileType[] = [
  'spelling_list',
  'assessment_dates',
  'school_calendar',
  'moe_syllabus',
];

const POLL_INTERVAL_MS = 2000;
const POLL_TIMEOUT_MS = 120_000;

// ─── Helper: detect file type from extension ──────────────────────────────

function detectFileType(filename: string, allowedTypes: UploadFileType[]): UploadFileType | null {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase();
  for (const type of allowedTypes) {
    if (ALLOWED_EXTENSIONS[type].includes(ext)) return type;
  }
  return null;
}

// ─── Poll helper ───────────────────────────────────────────────────────────

async function pollUpload(uploadId: string): Promise<Upload> {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  while (Date.now() < deadline) {
    const u = await api.get<Upload>(`/uploads/${uploadId}`);
    if (u.status === 'parsed' || u.status === 'failed') return u;
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS));
  }
  throw new Error('Upload timed out');
}

// ─── Inline correction form ────────────────────────────────────────────────

function CorrectionForm({
  uploadError,
  onFixed,
}: {
  uploadError: UploadError;
  onFixed: () => void;
}) {
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-ink">Fix the following issues to continue:</p>
      <div className="space-y-2">
        {uploadError.errors.map((e, i) => (
          <div key={i} className="rounded-lg bg-game-orange-tint border border-game-orange/20 px-4 py-3">
            <p className="text-xs font-medium text-ink">{e.field}</p>
            <p className="text-xs text-muted mt-0.5">{e.reason}</p>
            {e.raw_value && (
              <p className="text-xs text-muted mt-1">
                Raw value: <code className="font-mono bg-line/50 px-1 rounded">{e.raw_value}</code>
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-xs text-muted">
        Correct your file and re-upload, or{' '}
        <button type="button" onClick={onFixed} className="text-primary underline">
          dismiss and continue
        </button>
        .
      </p>
    </div>
  );
}

// ─── Upload row ────────────────────────────────────────────────────────────

function UploadRow({
  item,
  onDismissError,
}: {
  item: LocalUpload;
  onDismissError: (id: string) => void;
}) {
  const phaseLabel: Record<UploadPhase, string> = {
    idle: 'Queued',
    uploading: 'Uploading…',
    parsing: 'Parsing…',
    done: 'Done',
    error: 'Failed',
    correction: 'Needs correction',
  };

  const phaseColour: Record<UploadPhase, string> = {
    idle: 'text-muted',
    uploading: 'text-primary',
    parsing: 'text-primary',
    done: 'text-game-green',
    error: 'text-game-orange',
    correction: 'text-game-yellow',
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4 rounded-card border border-line px-4 py-3 bg-surface">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink truncate">{item.filename}</p>
          <p className="text-xs text-muted">{FILE_TYPE_LABELS[item.fileType]}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {(item.phase === 'uploading' || item.phase === 'parsing') && (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          )}
          <span className={`text-xs font-medium ${phaseColour[item.phase]}`}>
            {phaseLabel[item.phase]}
          </span>
        </div>
      </div>

      {item.phase === 'correction' && item.error && (
        <div className="ml-4">
          <CorrectionForm uploadError={item.error} onFixed={() => onDismissError(item.id)} />
        </div>
      )}
    </div>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export function DataUpload({ childId, allowedTypes = ALL_TYPES, onComplete }: Props) {
  const [uploads, setUploads] = useState<LocalUpload[]>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function updateUpload(id: string, patch: Partial<LocalUpload>) {
    setUploads(prev => prev.map(u => (u.id === id ? { ...u, ...patch } : u)));
  }

  const processFile = useCallback(
    async (file: File) => {
      const fileType = detectFileType(file.name, allowedTypes);
      if (!fileType) return;

      const localId = crypto.randomUUID();
      const localItem: LocalUpload = {
        id: localId,
        filename: file.name,
        fileType,
        phase: 'uploading',
        error: null,
        result: null,
      };
      setUploads(prev => [...prev, localItem]);

      try {
        // Upload to Supabase Storage
        const storagePath = `uploads/${Date.now()}-${file.name}`;
        const { error: storageError } = await supabase.storage
          .from('schoolhub-uploads')
          .upload(storagePath, file);
        if (storageError) throw new Error(storageError.message);

        // Create upload record via API
        const created = await api.post<Upload>('/uploads', {
          child_id: childId ?? null,
          file_type: fileType,
          original_filename: file.name,
          storage_path: storagePath,
        });

        updateUpload(localId, { id: created.id, phase: 'parsing' });

        // Poll until parsed or failed
        const finished = await pollUpload(created.id);

        if (finished.status === 'parsed') {
          updateUpload(created.id, { phase: 'done', result: finished });
          onComplete?.(finished);
        } else {
          const err = finished.error_json;
          updateUpload(created.id, {
            phase: err ? 'correction' : 'error',
            error: err,
          });
        }
      } catch (err) {
        updateUpload(localId, {
          phase: 'error',
          error: { errors: [{ field: 'file', reason: String(err) }] },
        });
      }
    },
    [allowedTypes, childId, onComplete],
  );

  function handleFiles(files: FileList | File[]) {
    Array.from(files).forEach(f => void processFile(f));
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  const acceptAttr = allowedTypes
    .flatMap(t => ALLOWED_EXTENSIONS[t])
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(',');

  const descriptionTypes = allowedTypes
    .flatMap(t => ALLOWED_EXTENSIONS[t])
    .filter((v, i, a) => a.indexOf(v) === i)
    .join(', ');

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={[
          'rounded-card border-2 border-dashed p-8 text-center transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-line hover:border-primary/40',
        ].join(' ')}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={e => e.key === 'Enter' && inputRef.current?.click()}
        aria-label="Upload file"
      >
        <div className="text-3xl mb-2" aria-hidden="true">📎</div>
        <p className="text-sm font-medium text-ink">Drop files here or tap to browse</p>
        <p className="text-xs text-muted mt-1">{descriptionTypes}</p>
        <input
          ref={inputRef}
          type="file"
          accept={acceptAttr}
          multiple
          className="hidden"
          onChange={e => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Upload list */}
      {uploads.length > 0 && (
        <div className="space-y-2">
          {uploads.map(u => (
            <UploadRow
              key={u.id}
              item={u}
              onDismissError={id =>
                setUploads(prev =>
                  prev.map(x => (x.id === id ? { ...x, phase: 'done', error: null } : x)),
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}
