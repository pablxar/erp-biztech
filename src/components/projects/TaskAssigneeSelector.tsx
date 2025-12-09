import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTeamMembers, TeamMember } from '@/hooks/useTeamMembers';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Users, X, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskAssigneeSelectorProps {
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  compact?: boolean;
}

export function TaskAssigneeSelector({ 
  selectedUserIds, 
  onSelectionChange,
  compact = false 
}: TaskAssigneeSelectorProps) {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { data: teamMembers } = useTeamMembers();

  const selectedMembers = teamMembers?.filter(m => selectedUserIds.includes(m.id)) || [];

  const toggleMember = (memberId: string) => {
    if (selectedUserIds.includes(memberId)) {
      onSelectionChange(selectedUserIds.filter(id => id !== memberId));
    } else {
      onSelectionChange([...selectedUserIds, memberId]);
    }
  };

  const handleAssignMe = () => {
    if (user && !selectedUserIds.includes(user.id)) {
      onSelectionChange([...selectedUserIds, user.id]);
    }
  };

  const removeMember = (memberId: string) => {
    onSelectionChange(selectedUserIds.filter(id => id !== memberId));
  };

  const getInitials = (member: TeamMember) => {
    if (member.full_name) {
      return member.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return member.email[0].toUpperCase();
  };

  if (compact) {
    return (
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-muted-foreground hover:text-foreground">
            {selectedMembers.length > 0 ? (
              <div className="flex -space-x-2">
                {selectedMembers.slice(0, 3).map(member => (
                  <Avatar key={member.id} className="h-6 w-6 border-2 border-background">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                ))}
                {selectedMembers.length > 3 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-[10px]">
                    +{selectedMembers.length - 3}
                  </div>
                )}
              </div>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span className="text-xs">Asignar</span>
              </>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <div className="p-2 border-b border-border">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-primary"
              onClick={handleAssignMe}
              disabled={user ? selectedUserIds.includes(user.id) : true}
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Asignarme a mí
            </Button>
          </div>
          <ScrollArea className="h-[200px]">
            <div className="p-2 space-y-1">
              {teamMembers?.map((member) => (
                <div
                  key={member.id}
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                    selectedUserIds.includes(member.id) && "bg-accent"
                  )}
                  onClick={() => toggleMember(member.id)}
                >
                  <Checkbox
                    checked={selectedUserIds.includes(member.id)}
                    onCheckedChange={() => toggleMember(member.id)}
                  />
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={member.avatar_url || undefined} />
                    <AvatarFallback className="text-xs">
                      {getInitials(member)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.full_name || member.email}
                    </p>
                    {member.full_name && (
                      <p className="text-xs text-muted-foreground truncate">
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">Asignados</span>
          {selectedMembers.length > 0 && (
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">
              {selectedMembers.length}
            </Badge>
          )}
        </div>
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-primary"
          onClick={handleAssignMe}
          disabled={user ? selectedUserIds.includes(user.id) : true}
        >
          Asignarme
        </Button>
      </div>

      {selectedMembers.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedMembers.map(member => (
            <Badge
              key={member.id}
              variant="secondary"
              className="gap-1.5 pl-1 pr-1 py-1"
            >
              <Avatar className="h-5 w-5">
                <AvatarImage src={member.avatar_url || undefined} />
                <AvatarFallback className="text-[10px]">
                  {getInitials(member)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs">{member.full_name || member.email}</span>
              <button
                type="button"
                onClick={() => removeMember(member.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-destructive/20 hover:text-destructive transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="w-full gap-2">
            <UserPlus className="h-4 w-4" />
            Añadir miembro
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <ScrollArea className="h-[250px]">
            <div className="p-2 space-y-1">
              {teamMembers?.map((member) => {
                const isSelected = selectedUserIds.includes(member.id);
                return (
                  <div
                    key={member.id}
                    className={cn(
                      "flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-accent transition-colors",
                      isSelected && "bg-accent"
                    )}
                    onClick={() => toggleMember(member.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar_url || undefined} />
                      <AvatarFallback className="text-xs">
                        {getInitials(member)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {member.full_name || member.email}
                      </p>
                      {member.full_name && (
                        <p className="text-xs text-muted-foreground truncate">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
