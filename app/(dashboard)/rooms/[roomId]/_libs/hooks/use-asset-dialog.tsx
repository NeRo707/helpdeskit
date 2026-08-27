"use client";

import { useState, useCallback } from "react";

export function useAssetDialog<T extends { id: string }>() {
  const [open, setOpen]           = useState(false);
  const [editTarget, setEditTarget] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditTarget(null);
    setOpen(true);
  }, []);

  const openEdit = useCallback((entity: T) => {
    setEditTarget(entity);
    setOpen(true);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setTimeout(() => setEditTarget(null), 150);
  }, []);

  return { open, setOpen, editTarget, openCreate, openEdit, close };
}
