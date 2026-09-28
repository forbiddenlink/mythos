"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import {
  retryLearningSaves,
  subscribeToLearningSaves,
  unsavedLearningCount,
} from "@/lib/learning-persistence";

export function LearningSaveNotice() {
  const unsaved = useSyncExternalStore(
    subscribeToLearningSaves,
    unsavedLearningCount,
    () => 0,
  );
  if (!unsaved) return null;
  return (
    <Container className="sticky top-16 z-40 py-4">
      <div
        role="alert"
        className="rounded-lg border border-destructive/40 bg-card p-4 text-foreground"
      >
        <p className="font-semibold">
          Your latest learning changes could not be saved.
        </p>
        <p className="mt-1 text-sm">
          Keep this tab open. Allow browser storage or free up space, then try
          again. You can also download a backup before leaving.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <Button variant="outline" onClick={retryLearningSaves}>
            Try saving again
          </Button>
          <Link
            href="/progress#learning-backup"
            className="text-sm underline underline-offset-4"
          >
            Download unsaved learning backup
          </Link>
        </div>
      </div>
    </Container>
  );
}
