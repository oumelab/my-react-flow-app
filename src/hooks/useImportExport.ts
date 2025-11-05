import { useAtom } from "jotai";
import { useRef, useState } from "react";
import {
  exportAtom,
  importFromJSONAtom,
  importFromMarkdownAtom,
} from "@/store/export-import-store";

export function useImportExport() {
  const [, exportData] = useAtom(exportAtom);
  const [, importJSON] = useAtom(importFromJSONAtom);
  const [, importMarkdown] = useAtom(importFromMarkdownAtom);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importFormat, setImportFormat] = useState<"json" | "markdown">("json");
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pendingImportFile, setPendingImportFile] = useState<File | null>(null);

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPendingImportFile(file);
    setIsImportDialogOpen(true);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const confirmImport = () => {
    if (!pendingImportFile) return;

    if (importFormat === "json") {
      importJSON(pendingImportFile);
    } else {
      importMarkdown(pendingImportFile);
    }

    setIsImportDialogOpen(false);
    setPendingImportFile(null);
  };

  return {
    exportData,
    fileInputRef,
    importFormat,
    setImportFormat,
    isImportDialogOpen,
    setIsImportDialogOpen,
    handleImport,
    confirmImport,
  };
}