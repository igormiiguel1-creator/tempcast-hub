"use client";

import { useState, useEffect } from "react";
import { X, Send, UserPlus, ListChecks, Handshake, Network, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";
import { createEpisode } from "@/lib/actions/episodes";
import { createGuest } from "@/lib/actions/guests";
import { createTask } from "@/lib/actions/tasks";
import { createPartner } from "@/lib/actions/partners";
import { createSocialPost } from "@/lib/actions/social";

type ModalType = "episode" | "guest" | "task" | "partner" | "social" | "note" | null;

export function QuickActionsModals() {
  const { setEpisodes, setGuests, setTasks, setPartners, setSocialPosts } = useAppData();
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [loading, setLoading] = useState(false);

  // Escutar eventos globais para abrir modais
  useEffect(() => {
    const handleOpenModal = (e: Event) => {
      const customEvent = e as CustomEvent<ModalType>;
      setActiveModal(customEvent.detail);
    };
    window.addEventListener("open-quick-modal", handleOpenModal);
    return () => window.removeEventListener("open-quick-modal", handleOpenModal);
  }, []);

  const handleClose = () => {
    setActiveModal(null);
  };

  // States para Formulários
  const [epTitle, setEpTitle] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestProfession, setGuestProfession] = useState("");
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDueDate, setTaskDueDate] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerType, setPartnerType] = useState("Sponsor");
  const [socialPlatform, setSocialPlatform] = useState("Instagram");
  const [socialContent, setSocialContent] = useState("");
  const [noteContent, setNoteContent] = useState("");

  if (!activeModal) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeModal === "episode") {
        const item = {
          title: epTitle,
          guest: "",
          editor: "Igor",
          sponsor: "",
          status: "Idea" as const,
          recordingDate: "",
          editingDate: "",
          publicationDate: "",
          assignedGuest: "",
          assignedEditor: "Igor",
          priority: "Medium" as const,
          duration: "",
          platformStatus: "",
          overview: "",
          notes: "",
          sponsors: [],
          checklist: [
            { label: "Guião completo", checked: false },
            { label: "Gravação áudio", checked: false },
            { label: "Edição de vídeo", checked: false },
            { label: "Thumbnail gerada", checked: false },
          ],
          files: [],
          timeline: [],
          recentActivity: [],
          attachments: [],
        };
        setEpisodes((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createEpisode(item);
        setEpTitle("");
      } else if (activeModal === "guest") {
        const item = {
          name: guestName,
          profession: guestProfession,
          company: "",
          status: "Idea" as const,
          priority: "Medium" as const,
          favorite: false,
          recordingDate: "TBD",
          publicationDate: "TBD",
          biography: "",
          notes: "",
          email: "",
          phone: "",
          instagram: "",
          linkedin: "",
          website: "",
          contactDate: "",
          confirmationDate: "",
          editingDate: "",
          recentActivity: [],
          expenses: { cachet: "€0", hotel: "€0", transport: "€0", meals: "€0", other: "€0" },
          checklist: [],
          attachments: [],
          timeline: [],
          initials: guestName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
        };
        setGuests((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createGuest(item);
        setGuestName("");
        setGuestProfession("");
      } else if (activeModal === "task") {
        const item = {
          title: taskTitle,
          description: "",
          priority: "Medium" as const,
          assignee: "Igor",
          dueDate: taskDueDate,
          section: "Today" as const,
          episode: "",
          guest: "",
          checklist: [],
          comments: [],
          attachments: [],
          activity: [],
          completed: false,
        };
        setTasks((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createTask(item);
        setTaskTitle("");
        setTaskDueDate("");
      } else if (activeModal === "partner") {
        const item = {
          name: partnerName,
          type: partnerType,
          status: "Active" as const,
          contractValue: "€0",
          nextMeeting: "",
          notes: "",
          contact: "",
          renewalDate: "",
        };
        setPartners((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createPartner(item);
        setPartnerName("");
      } else if (activeModal === "social") {
        const item = {
          platform: socialPlatform,
          status: "Draft",
          content: socialContent,
          scheduledFor: new Date().toISOString().split("T")[0] + " 18:00",
          audience: "Geral",
          performance: "TBD",
          tags: [],
        };
        setSocialPosts((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createSocialPost(item);
        setSocialContent("");
      } else if (activeModal === "note") {
        const item = {
          title: `Nota: ${noteContent.slice(0, 30)}...`,
          description: noteContent,
          priority: "Low" as const,
          assignee: "Igor",
          dueDate: new Date().toISOString().split("T")[0],
          section: "Today" as const,
          episode: "",
          guest: "",
          checklist: [],
          comments: [],
          attachments: [],
          activity: [],
          completed: false,
        };
        setTasks((prev) => [{ ...item, id: Date.now() }, ...prev]);
        await createTask(item);
        setNoteContent("");
      }

      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true">
      <form onSubmit={handleSubmit} className="brand-panel w-full max-w-md p-6 space-y-4 animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-border/40 pb-3">
          <h3 className="text-lg font-bold flex items-center gap-2">
            {activeModal === "episode" && <Sparkles className="h-5 w-5 text-primary" />}
            {activeModal === "guest" && <UserPlus className="h-5 w-5 text-primary" />}
            {activeModal === "task" && <ListChecks className="h-5 w-5 text-primary" />}
            {activeModal === "partner" && <Handshake className="h-5 w-5 text-primary" />}
            {activeModal === "social" && <Network className="h-5 w-5 text-primary" />}
            {activeModal === "note" && <FileText className="h-5 w-5 text-primary" />}
            Criar {activeModal === "episode" ? "Episódio" : activeModal === "guest" ? "Convidado" : activeModal === "task" ? "Tarefa" : activeModal === "partner" ? "Parceiro" : activeModal === "social" ? "Post" : "Nota Rápida"}
          </h3>
          <button type="button" onClick={handleClose} className="p-1 rounded-full hover:bg-muted text-muted-foreground">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Formulário Episódio */}
        {activeModal === "episode" && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Título do Episódio</label>
            <input
              type="text"
              required
              autoFocus
              placeholder="Ex: TempCast #13 com..."
              value={epTitle}
              onChange={(e) => setEpTitle(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        {/* Formulário Convidado */}
        {activeModal === "guest" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome do Convidado</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Sofia Vale"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Profissão/Cargo</label>
              <input
                type="text"
                placeholder="Ex: Gestora de Produto"
                value={guestProfession}
                onChange={(e) => setGuestProfession(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Formulário Tarefa */}
        {activeModal === "task" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Título da Tarefa</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Preparar guião..."
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Data de Conclusão</label>
              <input
                type="date"
                required
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
        )}

        {/* Formulário Parceiro */}
        {activeModal === "partner" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Nome da Marca/Parceiro</label>
              <input
                type="text"
                required
                autoFocus
                placeholder="Ex: Delta Cafés"
                value={partnerName}
                onChange={(e) => setPartnerName(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Tipo de Parceria</label>
              <select
                value={partnerType}
                onChange={(e) => setPartnerType(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
              >
                <option value="Sponsor">Sponsor</option>
                <option value="Partner">Parceiro</option>
                <option value="Media">Media Partner</option>
              </select>
            </div>
          </div>
        )}

        {/* Formulário Post Social */}
        {activeModal === "social" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Plataforma</label>
              <select
                value={socialPlatform}
                onChange={(e) => setSocialPlatform(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
              >
                <option value="Instagram">Instagram</option>
                <option value="YouTube">YouTube</option>
                <option value="TikTok">TikTok</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Spotify">Spotify</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Conteúdo do Post</label>
              <textarea
                required
                rows={3}
                placeholder="Escreve a legenda ou conteúdo..."
                value={socialContent}
                onChange={(e) => setSocialContent(e.target.value)}
                className="w-full rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {/* Formulário Nota Rápida */}
        {activeModal === "note" && (
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Nota Rápida (guarda nas tarefas de hoje)</label>
            <textarea
              required
              rows={4}
              autoFocus
              placeholder="Escreve uma nota operacional..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              className="w-full rounded-2xl border border-input bg-background/80 px-3 py-2 text-sm"
            />
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
          <Button type="button" variant="ghost" onClick={handleClose} disabled={loading}>
            Cancelar
          </Button>
          <Button type="submit" className="btn-brand" disabled={loading}>
            {loading ? "A criar..." : "Confirmar e Criar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
