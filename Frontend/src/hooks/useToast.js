import { useState, useCallback } from "react";

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast(null), []);

  return { toast, showToast, clearToast };
}