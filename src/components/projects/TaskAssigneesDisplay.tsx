import { useTaskAssignments } from '@/hooks/useTaskAssignments';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface TaskAssigneesDisplayProps {
  taskId: string;
  size?: 'sm' | 'md';
  max?: number;
}

export function TaskAssigneesDisplay({ taskId, size = 'sm', max = 3 }: TaskAssigneesDisplayProps) {
  const { data: assignments } = useTaskAssignments(taskId);

  if (!assignments || assignments.length === 0) {
    return (
      <div className={cn(
        "rounded-full bg-muted flex items-center justify-center text-muted-foreground",
        size === 'sm' ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
      )}>
        ?
      </div>
    );
  }

  const getInitials = (user: { full_name?: string | null; email?: string }) => {
    if (user.full_name) {
      return user.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || '?';
  };

  const visibleAssignees = assignments.slice(0, max);
  const remainingCount = assignments.length - max;

  return (
    <TooltipProvider>
      <div className="flex -space-x-1.5">
        {visibleAssignees.map((assignment) => (
          <Tooltip key={assignment.id}>
            <TooltipTrigger asChild>
              <Avatar className={cn(
                "border-2 border-background cursor-default",
                size === 'sm' ? "w-6 h-6" : "w-8 h-8"
              )}>
                <AvatarImage src={assignment.user?.avatar_url || undefined} />
                <AvatarFallback className={cn(
                  "bg-primary/20 text-primary font-medium",
                  size === 'sm' ? "text-[10px]" : "text-xs"
                )}>
                  {getInitials(assignment.user || { email: '' })}
                </AvatarFallback>
              </Avatar>
            </TooltipTrigger>
            <TooltipContent>
              <p>{assignment.user?.full_name || assignment.user?.email}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        {remainingCount > 0 && (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn(
                "rounded-full bg-muted flex items-center justify-center font-medium border-2 border-background cursor-default",
                size === 'sm' ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
              )}>
                +{remainingCount}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-1">
                {assignments.slice(max).map((a) => (
                  <p key={a.id}>{a.user?.full_name || a.user?.email}</p>
                ))}
              </div>
            </TooltipContent>
          </Tooltip>
        )}
      </div>
    </TooltipProvider>
  );
}
