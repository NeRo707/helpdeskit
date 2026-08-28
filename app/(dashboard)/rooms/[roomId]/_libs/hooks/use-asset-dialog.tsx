"use client";

import { useState, useCallback } from "react";

export function useAssetDialog<T extends { id: string }>() {
  const [open, setOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((entity: T) => {
    setEditTarget(entity);
    setOpen(true);
  }, []);

  const close = useCallback((onAfterClose?: () => void) => {
    setOpen(false);
    setTimeout(() => {
      setEditTarget(null);
      onAfterClose?.();
    }, 200); // match dialog duration-200
  }, []);

  // setOpen intentionally NOT exposed — all closing must go through close()
  return { open, editTarget, openCreate, openEdit, close };
}
