import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Lightbulb } from "lucide-react";
import { useCreateIdea } from "@/hooks/useIdeas";

const categories = ["Producto", "Marketing", "Operaciones", "Tecnología", "Cultura", "Otro"];

export function CreateIdeaDialog() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const createIdea = useCreateIdea();

  const handleSubmit = () => {
    if (!title.trim()) return;
    createIdea.mutate(
      { title, description: description || undefined, category: category || undefined },
      {
        onSuccess: () => {
          setOpen(false);
          setTitle("");
          setDescription("");
          setCategory("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Lightbulb className="w-4 h-4" />
          Nueva Idea
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Proponer nueva idea</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Integrar pagos con Stripe" />
          </div>
          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe tu idea..." />
          </div>
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue placeholder="Seleccionar categoría" /></SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSubmit} disabled={!title.trim() || createIdea.isPending} className="w-full">
            {createIdea.isPending ? "Creando..." : "Proponer Idea"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
