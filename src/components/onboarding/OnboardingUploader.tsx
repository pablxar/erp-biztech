import { useState, useCallback } from "react";
import { Upload, FileText, Mic, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingUploaderProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function OnboardingUploader({ onFileSelect, isProcessing }: OnboardingUploaderProps) {
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  }, []);

  const isValidFile = (file: File) => {
    const validTypes = ["application/pdf", "audio/mpeg", "audio/wav", "audio/mp4", "audio/m4a", "text/plain"];
    return validTypes.includes(file.type) || file.name.endsWith(".txt") || file.name.endsWith(".pdf");
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && isValidFile(file)) {
      setSelectedFile(file);
    }
  };

  const handleProcess = () => {
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <div className="relative">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>
          <Loader2 className="w-8 h-8 text-primary animate-spin absolute -bottom-1 -right-1" />
        </div>
        <div className="text-center">
          <h3 className="text-lg font-semibold">Procesando con IA...</h3>
          <p className="text-sm text-muted-foreground mt-1">
            Analizando el contenido y extrayendo información del onboarding
          </p>
          <p className="text-xs text-muted-foreground mt-2">Esto puede tomar unos segundos</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer",
          dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-border/50 hover:border-primary/50 hover:bg-secondary/30",
          selectedFile && "border-success bg-success/5"
        )}
        onClick={() => document.getElementById("onboarding-file-input")?.click()}
      >
        <input
          id="onboarding-file-input"
          type="file"
          className="hidden"
          accept=".pdf,.txt,.mp3,.wav,.m4a"
          onChange={handleFileInput}
        />
        
        {selectedFile ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center">
              {selectedFile.type.includes("audio") ? (
                <Mic className="w-8 h-8 text-success" />
              ) : (
                <FileText className="w-8 h-8 text-success" />
              )}
            </div>
            <div>
              <p className="font-semibold text-success">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Haz clic para cambiar el archivo</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Upload className="w-8 h-8 text-primary" />
            </div>
            <div>
              <p className="font-semibold">Arrastra tu archivo aquí</p>
              <p className="text-sm text-muted-foreground mt-1">o haz clic para seleccionar</p>
            </div>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <FileText className="w-3.5 h-3.5" />
                PDF / TXT
              </div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Mic className="w-3.5 h-3.5" />
                MP3 / WAV / M4A
              </div>
            </div>
          </div>
        )}
      </div>

      {selectedFile && (
        <Button onClick={handleProcess} className="w-full gap-2" size="lg">
          <Sparkles className="w-4 h-4" />
          Procesar con IA
        </Button>
      )}
    </div>
  );
}
