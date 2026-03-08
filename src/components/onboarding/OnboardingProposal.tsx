import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, FileText, FolderPlus } from "lucide-react";
import { OnboardingRecord } from "@/hooks/useOnboarding";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";

interface OnboardingProposalProps {
  onboarding: OnboardingRecord;
  onCreateProject?: () => void;
}

export function OnboardingProposal({ onboarding, onCreateProject }: OnboardingProposalProps) {
  return (
    <div className="space-y-6">
      {/* AI Summary */}
      {onboarding.ai_summary && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="p-1.5 rounded-lg bg-primary/10">
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Resumen Ejecutivo</h3>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs">Generado por IA</Badge>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{onboarding.ai_summary}</p>
        </div>
      )}

      {/* AI Proposal */}
      {onboarding.ai_proposal && (
        <div className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-accent/50">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-semibold">Propuesta Comercial</h3>
          </div>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <MarkdownRenderer content={onboarding.ai_proposal} />
          </div>
        </div>
      )}

      {/* Create Project CTA */}
      {onCreateProject && (
        <div className="glass rounded-xl p-5 bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">¿Listo para comenzar?</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Crea un proyecto directamente desde este onboarding
              </p>
            </div>
            <Button onClick={onCreateProject} className="gap-2">
              <FolderPlus className="w-4 h-4" />
              Crear Proyecto
            </Button>
          </div>
        </div>
      )}

      {!onboarding.ai_summary && !onboarding.ai_proposal && (
        <div className="text-center py-12">
          <Sparkles className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">
            No hay propuesta generada aún. Sube un archivo para que la IA genere una propuesta.
          </p>
        </div>
      )}
    </div>
  );
}
