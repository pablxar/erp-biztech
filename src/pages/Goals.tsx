import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Lightbulb, ThumbsUp, Trash2, Calendar, ArrowUp, ArrowRight, ArrowDown } from "lucide-react";
import { CreateGoalDialog } from "@/components/goals/CreateGoalDialog";
import { CreateIdeaDialog } from "@/components/goals/CreateIdeaDialog";
import { useGoals, useToggleGoal, useDeleteGoal } from "@/hooks/useGoals";
import { useIdeas, useVoteIdea, useUpdateIdeaStatus, useDeleteIdea } from "@/hooks/useIdeas";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "@/lib/utils";

const priorityConfig = {
  high: { label: "Alta", icon: ArrowUp, class: "text-destructive" },
  medium: { label: "Media", icon: ArrowRight, class: "text-yellow-500" },
  low: { label: "Baja", icon: ArrowDown, class: "text-muted-foreground" },
};

const categoryColors: Record<string, string> = {
  Producto: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  Marketing: "bg-pink-500/15 text-pink-400 border-pink-500/30",
  Operaciones: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  Tecnología: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
  Cultura: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  Otro: "bg-muted text-muted-foreground border-border",
};

const statusLabels: Record<string, string> = {
  nueva: "Nueva",
  en_evaluacion: "En evaluación",
  aprobada: "Aprobada",
  descartada: "Descartada",
};

export default function Goals() {
  const [goalFilter, setGoalFilter] = useState("all");
  const [ideaCategoryFilter, setIdeaCategoryFilter] = useState("all");
  const [ideaStatusFilter, setIdeaStatusFilter] = useState("all");

  const { data: goals = [], isLoading: goalsLoading } = useGoals();
  const toggleGoal = useToggleGoal();
  const deleteGoal = useDeleteGoal();

  const { data: ideas = [], isLoading: ideasLoading } = useIdeas();
  const voteIdea = useVoteIdea();
  const updateIdeaStatus = useUpdateIdeaStatus();
  const deleteIdea = useDeleteIdea();

  const filteredGoals = goals.filter((g) => {
    if (goalFilter === "pending") return !g.completed;
    if (goalFilter === "completed") return g.completed;
    return true;
  });

  const filteredIdeas = ideas.filter((i) => {
    if (ideaCategoryFilter !== "all" && i.category !== ideaCategoryFilter) return false;
    if (ideaStatusFilter !== "all" && i.status !== ideaStatusFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Metas & Ideas</h1>
        <p className="text-muted-foreground mt-1">Objetivos del equipo e ideas para el futuro de Biztech</p>
      </div>

      <Tabs defaultValue="goals" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="goals" className="gap-2">
            <Target className="w-4 h-4" />
            Metas
          </TabsTrigger>
          <TabsTrigger value="ideas" className="gap-2">
            <Lightbulb className="w-4 h-4" />
            Ideas
          </TabsTrigger>
        </TabsList>

        {/* METAS TAB */}
        <TabsContent value="goals" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <Select value={goalFilter} onValueChange={setGoalFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="completed">Completadas</SelectItem>
              </SelectContent>
            </Select>
            <CreateGoalDialog />
          </div>

          {goalsLoading ? (
            <p className="text-muted-foreground text-center py-12">Cargando metas...</p>
          ) : filteredGoals.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay metas aún. ¡Crea la primera!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {filteredGoals.map((goal) => {
                const prio = priorityConfig[goal.priority];
                const PrioIcon = prio.icon;
                return (
                  <Card key={goal.id} className={cn("transition-all duration-300", goal.completed && "opacity-60")}>
                    <CardContent className="flex items-start gap-4 py-4">
                      <Checkbox
                        checked={goal.completed}
                        onCheckedChange={(checked) =>
                          toggleGoal.mutate({ id: goal.id, completed: !!checked })
                        }
                        className="mt-1"
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn("font-medium transition-all duration-300", goal.completed && "line-through text-muted-foreground")}>
                          {goal.title}
                        </p>
                        {goal.description && (
                          <p className="text-sm text-muted-foreground mt-0.5">{goal.description}</p>
                        )}
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className={cn("flex items-center gap-1", prio.class)}>
                            <PrioIcon className="w-3 h-3" />
                            {prio.label}
                          </span>
                          {goal.due_date && (
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {format(new Date(goal.due_date), "d MMM yyyy", { locale: es })}
                            </span>
                          )}
                          {goal.completed_at && (
                            <span className="text-emerald-500">
                              ✓ {format(new Date(goal.completed_at), "d MMM", { locale: es })}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => deleteGoal.mutate(goal.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* IDEAS TAB */}
        <TabsContent value="ideas" className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex gap-2">
              <Select value={ideaCategoryFilter} onValueChange={setIdeaCategoryFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {["Producto", "Marketing", "Operaciones", "Tecnología", "Cultura", "Otro"].map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={ideaStatusFilter} onValueChange={setIdeaStatusFilter}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  {Object.entries(statusLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <CreateIdeaDialog />
          </div>

          {ideasLoading ? (
            <p className="text-muted-foreground text-center py-12">Cargando ideas...</p>
          ) : filteredIdeas.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Lightbulb className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay ideas aún. ¡Propón la primera!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredIdeas.map((idea) => (
                <Card key={idea.id} className="group hover:shadow-md transition-shadow">
                  <CardContent className="py-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold leading-tight">{idea.title}</h3>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive shrink-0 h-7 w-7"
                        onClick={() => deleteIdea.mutate(idea.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    {idea.description && (
                      <p className="text-sm text-muted-foreground line-clamp-3">{idea.description}</p>
                    )}
                    <div className="flex items-center gap-2 flex-wrap">
                      {idea.category && (
                        <Badge variant="outline" className={cn("text-xs", categoryColors[idea.category] || categoryColors.Otro)}>
                          {idea.category}
                        </Badge>
                      )}
                      <Select
                        value={idea.status}
                        onValueChange={(status) => updateIdeaStatus.mutate({ id: idea.id, status })}
                      >
                        <SelectTrigger className="h-6 text-xs w-auto border-dashed px-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(statusLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border">
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(idea.created_at), "d MMM yyyy", { locale: es })}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5 text-xs h-7"
                        onClick={() => voteIdea.mutate({ id: idea.id, votes: idea.votes })}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        {idea.votes}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
