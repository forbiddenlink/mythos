"use client";

import {
  serializeLearningBackup,
  LEARNING_BACKUP_MAX_BYTES,
  parseLearningBackup,
  restoreLearningBackup,
  type BackupPreview,
  type LearningBackup,
} from "@/lib/learning-backup";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Check, Download, RotateCcw, Upload } from "lucide-react";
import { useRef, useState } from "react";

function downloadBackup() {
  const backup = serializeLearningBackup(localStorage);
  const blob = new Blob([backup], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `mythos-atlas-learning-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  URL.revokeObjectURL(url);
}

function Preview({ preview }: Readonly<{ preview: BackupPreview }>) {
  return (
    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-border/60 py-4 text-sm sm:grid-cols-3">
      <div><dt className="text-safe-muted">Saved</dt><dd className="mt-0.5 font-medium">{preview.savedCategories} categories</dd></div>
      <div><dt className="text-safe-muted">Bookmarks</dt><dd className="mt-0.5 font-medium">{preview.bookmarks}</dd></div>
      <div><dt className="text-safe-muted">Reading</dt><dd className="mt-0.5 font-medium">{preview.readingProgress} stories</dd></div>
      <div><dt className="text-safe-muted">Deities</dt><dd className="mt-0.5 font-medium">{preview.viewedDeities} viewed</dd></div>
      <div><dt className="text-safe-muted">Stories</dt><dd className="mt-0.5 font-medium">{preview.storiesRead} read</dd></div>
      <div><dt className="text-safe-muted">Review cards</dt><dd className="mt-0.5 font-medium">{preview.reviewCards}</dd></div>
    </dl>
  );
}

export function LearningBackup() {
  const inputRef = useRef<HTMLInputElement>(null);
  const selectionId = useRef(0);
  const [isReading, setIsReading] = useState(false);
  const [candidate, setCandidate] = useState<LearningBackup | null>(null);
  const [preview, setPreview] = useState<BackupPreview | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function chooseFile(event: React.ChangeEvent<HTMLInputElement>) {
    const currentSelection = ++selectionId.current;
    setIsReading(false);
    const file = event.target.files?.[0];
    event.target.value = "";
    setCandidate(null);
    setPreview(null);
    setMessage(null);
    setError(null);
    if (!file) return;

    if (file.size > LEARNING_BACKUP_MAX_BYTES) {
      setError("This backup is too large to import.");
      return;
    }

    let raw: string;
    setIsReading(true);
    try {
      raw = await file.text();
    } catch {
      if (currentSelection !== selectionId.current) return;
      setIsReading(false);
      setError("This backup file could not be read.");
      return;
    }
    if (currentSelection !== selectionId.current) return;
    setIsReading(false);

    const result = parseLearningBackup(raw);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setCandidate(result.backup);
    setPreview(result.preview);
  }

  function restore() {
    if (!candidate) return;
    const result = restoreLearningBackup(localStorage, candidate);
    if (!result.success) {
      setError(result.error);
      return;
    }
    setMessage("Learning data restored. Reloading the atlas…");
    window.setTimeout(() => window.location.reload(), 250);
  }

  function download() {
    setMessage(null);
    setError(null);
    try {
      downloadBackup();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "A learning backup could not be created in this browser.");
    }
  }

  return (
    <Card className="border-gold/20 bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="font-serif text-xl">Keep your learning record</CardTitle>
        <CardDescription>
          Download or restore bookmarks, reading progress, discovery progress, and review scheduling from this browser only.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-3">
          <Button type="button" variant="gold" onClick={download} className="gap-2">
            <Download /> Download learning backup
          </Button>
          <Button type="button" variant="outline" onClick={() => inputRef.current?.click()} className="gap-2">
            <Upload /> Choose backup to review
          </Button>
          <label htmlFor="learning-backup-file" className="sr-only">
            Choose a Mythos Atlas learning backup JSON file
          </label>
          <input id="learning-backup-file" ref={inputRef} type="file" accept="application/json,.json" className="sr-only" onChange={chooseFile} />
        </div>

        <p className="text-xs text-safe-muted">
          Backups exclude your theme, language, search history, consent choices, and any account or analytics data.
        </p>
        {isReading && <p role="status" className="text-sm text-muted-foreground">Checking backup…</p>}

        {error && <p role="alert" className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-foreground"><AlertCircle className="mt-0.5 size-4 shrink-0 text-destructive" />{error}</p>}
        {message && <p role="status" className="flex items-center gap-2 rounded-lg border border-gold/30 bg-gold/10 p-3 text-sm text-foreground"><Check className="size-4 text-gold" />{message}</p>}

        {candidate && preview && (
          <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
            <p className="font-medium text-foreground">Ready to restore</p>
            <p className="mt-1 text-sm text-safe-muted">
              Exported {new Date(preview.exportedAt).toLocaleString()}. Restoring replaces the current learning record on this browser.
            </p>
            <Preview preview={preview} />
            <Button type="button" variant="destructive" onClick={restore} className="mt-4 gap-2">
              <RotateCcw /> Restore this backup
            </Button>
            <Button type="button" variant="ghost" className="mt-4" onClick={() => {
              selectionId.current += 1;
              setCandidate(null);
              setPreview(null);
              setError(null);
            }}>Cancel restore</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
