import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Target, ArrowRight } from "lucide-react";
import { useGoals, useToggleGoal } from "@/hooks/useGoals";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function GoalsSummary() {
  const { data: goals = [], isLoading } = useGoals();
  const toggleGoal = useToggleGoal();
  const navigate = useNavigate();

  const pending = goals.filter((g) => !g.completed);
  const completedCount = goals.filter((g) => g.completed).length;
  const recentGoals = pending.slice(0, 5);

  if (isLoading) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary/10">
            <Target className="w-4 h-4 text-primary" />
          </div>
          <CardTitle className="text-base">Metas</CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {completedCount}/{goals.length} completadas
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="text-xs gap-1 h-7"
            onClick={() => navigate("/goals")}
          >
            Ver todas
            <ArrowRight className="w-3 h-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-1.5">
        {goals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay metas creadas aún
          </p>
        ) : recentGoals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            🎉 ¡Todas las metas completadas!
          </p>
        ) : (
          recentGoals.map((goal) => (
            <div
              key={goal.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Checkbox
                checked={goal.completed}
                onCheckedChange={(checked) =>
                  toggleGoal.mutate({ id: goal.id, completed: !!checked })
                }
              />
              <div className="flex-1 min-w-0">
                <p
                  className={cn(
                    "text-sm font-medium truncate",
                    goal.completed && "line-through text-muted-foreground"
                  )}
                >
                  {goal.title}
                </p>
                {goal.due_date && (
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(goal.due_date), "d MMM", { locale: es })}
                  </p>
                )}
              </div>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] shrink-0",
                  goal.priority === "high" && "border-destructive/50 text-destructive",
                  goal.priority === "low" && "border-muted text-muted-foreground"
                )}
              >
                {goal.priority === "high" ? "Alta" : goal.priority === "medium" ? "Media" : "Baja"}
              </Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
