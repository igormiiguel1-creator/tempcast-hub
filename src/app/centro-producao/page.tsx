"use client";

import { useMemo, useState } from "react";
import {
  Clapperboard,
  Sparkles,
  ArrowRight,
  Plus,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Clock3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-state";
import { updateEpisode, createEpisode } from "@/lib/actions/episodes";
import type { Episode } from "@/features/production/types";

// Definição das 10 etapas oficiais em Português (Portugal)
const STAGES = [
  { id: "ideia", label: "Ideia", status: "Idea" },
  { id: "guião", label: "Guião", status: "Outline" },
  { id: "convidado", label: "Convidado", status: "Confirmed" },
  { id: "agendamento", label: "Agendamento", status: "Scheduled" },
  { id: "gravação", label: "Gravação", status: "Recorded" },
  { id: "edição", label: "Edição", status: "Editing" },
  { id: "thumbnail", label: "Thumbnail", status: "Editing" }, // diferenciado na UI
  { id: "seo", label: "SEO", status: "Editing" },             // diferenciado na UI
  { id: "publicação", label: "Publicação", status: "Published" },
  { id: "analytics", label: "Analytics", status: "Published" }, // pós-lançamento
] as const;

type StageId = (typeof STAGES)[number]["id"];

export default function CentroProducaoPage() {
  const { episodes, setEpisodes, isLoading } = useAppData();
  const [selectedEpisode, setSelectedEpisode] = useState<Episode | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Mapear dinamicamente os episódios para as suas respectivas 10 etapas
  const groupedEpisodes = useMemo(() => {
    const groups: Record<StageId, Episode[]> = {
      ideia: [],
      guião: [],
      convidado: [],
      agendamento: [],
      gravação: [],
      edição: [],
      thumbnail: [],
      seo: [],
      publicação: [],
      analytics: [],
    };

    episodes.forEach((episode) => {
      const status = episode.status;

      if (status === "Idea") {
        groups.ideia.push(episode);
      } else if (status === "Outline") {
        groups.guião.push(episode);
      } else if (status === "Contacted" || status === "Confirmed") {
        groups.convidado.push(episode);
      } else if (status === "Scheduled") {
        groups.agendamento.push(episode);
      } else if (status === "Recorded") {
        groups.gravação.push(episode);
      } else if (status === "Editing" || status === "Shorts") {
        // Diferenciação inteligente baseada na checklist do episódio
        const hasThumbnail = episode.checklist?.some(
          (c) => c.label.toLowerCase().includes("thumb") && c.checked
        );
        const hasSeo = episode.checklist?.some(
          (c) => c.label.toLowerCase().includes("seo") && c.checked
        );

        if (!hasThumbnail) {
          groups.thumbnail.push(episode);
        } else if (!hasSeo) {
          groups.seo.push(episode);
        } else {
          groups.edição.push(episode);
        }
      } else if (status === "Published") {
        const hasStats = !!episode.duration || episode.platformStatus === "Published";
        if (hasStats) {
          groups.analytics.push(episode);
        } else {
          groups.publicação.push(episode);
        }
      } else {
        groups.ideia.push(episode);
      }
    });

    return groups;
  }, [episodes]);

  // Obter próxima etapa e o status do Supabase correspondente
  const getNextStageInfo = (episode: Episode): { nextLabel: string; nextStatus: string; action: () => void } | null => {
    const status = episode.status;

    if (status === "Idea") {
      return {
        nextLabel: "Avançar para Guião",
        nextStatus: "Outline",
        action: () => handleMove(episode.id, { status: "Outline" }),
      };
    }
    if (status === "Outline") {
      return {
        nextLabel: "Confirmar Convidado",
        nextStatus: "Confirmed",
        action: () => handleMove(episode.id, { status: "Confirmed" }),
      };
    }
    if (status === "Contacted" || status === "Confirmed") {
      return {
        nextLabel: "Agendar Gravação",
        nextStatus: "Scheduled",
        action: () => handleMove(episode.id, { status: "Scheduled" }),
      };
    }
    if (status === "Scheduled") {
      return {
        nextLabel: "Marcar como Gravado",
        nextStatus: "Recorded",
        action: () => handleMove(episode.id, { status: "Recorded" }),
      };
    }
    if (status === "Recorded") {
      return {
        nextLabel: "Avançar para Edição",
        nextStatus: "Editing",
        action: () => handleMove(episode.id, { status: "Editing" }),
      };
    }
    if (status === "Editing" || status === "Shorts") {
      const hasThumbnail = episode.checklist?.some((c) => c.label.toLowerCase().includes("thumb") && c.checked);
      if (!hasThumbnail) {
        return {
          nextLabel: "Aprovar Thumbnail",
          nextStatus: "Editing (Thumbnail)",
          action: () => {
            const updatedChecklist = (episode.checklist ?? []).map((c) =>
              c.label.toLowerCase().includes("thumb") ? { ...c, checked: true } : c
            );
            handleMove(episode.id, { checklist: updatedChecklist });
          },
        };
      }
      const hasSeo = episode.checklist?.some((c) => c.label.toLowerCase().includes("seo") && c.checked);
      if (!hasSeo) {
        return {
          nextLabel: "Aprovar SEO",
          nextStatus: "Editing (SEO)",
          action: () => {
            const updatedChecklist = (episode.checklist ?? []).map((c) =>
              c.label.toLowerCase().includes("seo") ? { ...c, checked: true } : c
            );
            handleMove(episode.id, { checklist: updatedChecklist });
          },
        };
      }
      return {
        nextLabel: "Publicar Episódio",
        nextStatus: "Published",
        action: () => handleMove(episode.id, { status: "Published" }),
      };
    }
    if (status === "Published") {
      return {
        nextLabel: "Avançar para Analytics",
        nextStatus: "Published (Analytics)",
        action: () => handleMove(episode.id, { duration: "45:00", platformStatus: "Published" }),
      };
    }

    return null;
  };

  const handleMove = async (episodeId: number, updates: Partial<Episode>) => {
    // Atualização otimista
    setEpisodes((prev) =>
      prev.map((e) => (e.id === episodeId ? { ...e, ...updates } : e))
    );

    try {
      await updateEpisode(episodeId, updates);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const placeholder: Episode = {
      id: Date.now(),
      title: newTitle,
      guest: "",
      editor: "Igor",
      sponsor: "",
      status: "Idea",
      recordingDate: "",
      editingDate: "",
      publicationDate: "",
      assignedGuest: "",
      assignedEditor: "Igor",
      priority: "Medium",
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
        { label: "SEO e tags optimizados", checked: false },
      ],
      files: [],
      timeline: [],
      recentActivity: [],
      attachments: [],
    };

    setEpisodes((prev) => [placeholder, ...prev]);
    setNewTitle("");
    setShowCreateModal(false);

    try {
      await createEpisode(placeholder);
    } catch (err) {
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 space-y-4">
        <div className="h-20 skeleton rounded-[28px]" />
        <div className="grid gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-96 skeleton rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      {/* Header */}
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Clapperboard className="h-4 w-4" />
              Workflow Operacional
            </div>
            <div>
              <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Centro de Produção</h1>
              <p className="mt-2 text-base text-muted-foreground">
                O coração operacional do TempCast. Acompanha os episódios pelas 10 etapas da ideia ao analytics.
              </p>
            </div>
          </div>
          <Button onClick={() => setShowCreateModal(true)} className="btn-brand">
            <Plus className="h-4 w-4" />
            Nova Ideia
          </Button>
        </div>
      </section>

      {/* Grid Kanban Horizontal de 10 etapas (Scrollable) */}
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
        {STAGES.map((stage) => {
          const list = groupedEpisodes[stage.id] || [];
          return (
            <div key={stage.id} className="w-72 shrink-0 flex flex-col gap-3 rounded-2xl border border-border/60 bg-sidebar/40 p-4">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-sm font-bold capitalize">{stage.label}</span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary font-bold">
                  {list.length}
                </span>
              </div>

              {list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 border border-dashed border-border/40 rounded-xl text-center text-xs text-muted-foreground">
                  Sem episódios nesta fase
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[500px]">
                  {list.map((ep) => {
                    const next = getNextStageInfo(ep);
                    return (
                      <article
                        key={ep.id}
                        onClick={() => setSelectedEpisode(ep)}
                        className="brand-card p-4 hover:border-primary/40 cursor-pointer transition-all duration-150 flex flex-col justify-between gap-3"
                      >
                        <div>
                          <p className="text-xs text-primary font-bold">#{ep.id.toString().slice(-3)}</p>
                          <h4 className="text-sm font-semibold mt-1 text-foreground line-clamp-2">{ep.title}</h4>
                          {ep.guest && (
                            <p className="text-[11px] text-muted-foreground mt-1">Convidado: {ep.guest}</p>
                          )}
                        </div>

                        {next && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              next.action();
                            }}
                            className="w-full inline-flex h-8 items-center justify-center gap-1.5 rounded-full bg-primary/10 hover:bg-primary/20 text-xs font-bold text-primary transition-all"
                          >
                            <span>{next.nextLabel}</span>
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal de Detalhes do Episódio com Timeline Visual */}
      {selectedEpisode && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="brand-panel w-full max-w-4xl p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-border/50 pb-4">
              <div>
                <span className="text-xs text-primary font-bold uppercase tracking-wider">
                  Etapa Atual · {selectedEpisode.status}
                </span>
                <h3 className="text-xl font-bold">{selectedEpisode.title}</h3>
              </div>
              <Button variant="ghost" onClick={() => setSelectedEpisode(null)}>
                Fechar
              </Button>
            </div>

            {/* Linha de Produção Visual (10 Etapas) */}
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-muted-foreground">Linha de Produção Visual</h4>
              <div className="relative flex items-center justify-between w-full">
                {/* Linha horizontal conectora */}
                <div className="absolute left-0 right-0 h-0.5 bg-border/40 -z-10" />

                {STAGES.map((stage, idx) => {
                  // Lógica visual simplificada de status do estágio
                  const isCurrent =
                    (selectedEpisode.status === "Idea" && stage.id === "ideia") ||
                    (selectedEpisode.status === "Outline" && stage.id === "guião") ||
                    ((selectedEpisode.status === "Contacted" || selectedEpisode.status === "Confirmed") && stage.id === "convidado") ||
                    (selectedEpisode.status === "Scheduled" && stage.id === "agendamento") ||
                    (selectedEpisode.status === "Recorded" && stage.id === "gravação") ||
                    (selectedEpisode.status === "Editing" && stage.id === "edição") ||
                    (selectedEpisode.status === "Published" && stage.id === "publicação");

                  // Verificar se as checklist/steps foram feitas antes
                  const isCompleted = idx < STAGES.findIndex(s => s.status === selectedEpisode.status) || selectedEpisode.status === "Published";

                  return (
                    <div key={stage.id} className="flex flex-col items-center gap-2">
                      <div
                        className={`h-6 w-6 rounded-full border flex items-center justify-center text-[10px] font-bold transition-all ${
                          isCurrent
                            ? "bg-primary text-primary-foreground border-primary animate-pulse"
                            : isCompleted
                            ? "bg-primary/20 text-primary border-primary/40"
                            : "bg-background text-muted-foreground border-border/80"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <span className="text-[10px] text-muted-foreground font-semibold hidden md:block capitalize">
                        {stage.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4">
              <div>
                <h4 className="text-sm font-bold mb-2">Detalhes</h4>
                <div className="space-y-2 text-sm">
                  <p><span className="text-muted-foreground">Convidado:</span> {selectedEpisode.guest || "Nenhum"}</p>
                  <p><span className="text-muted-foreground">Editor Responsável:</span> {selectedEpisode.editor}</p>
                  <p><span className="text-muted-foreground">Data de Publicação:</span> {selectedEpisode.publicationDate || "TBD"}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold mb-2">Checklist Operacional</h4>
                <div className="space-y-2">
                  {selectedEpisode.checklist?.map((item, idx) => (
                    <label key={idx} className="flex items-center gap-2.5 text-sm cursor-pointer">
                      <input
                        type="checkbox"
                        checked={item.checked}
                        onChange={() => {
                          const updated = [...(selectedEpisode.checklist ?? [])];
                          updated[idx] = { ...updated[idx], checked: !item.checked };
                          handleMove(selectedEpisode.id, { checklist: updated });
                          setSelectedEpisode((prev) => prev ? { ...prev, checklist: updated } : null);
                        }}
                        className="rounded border-input text-primary focus:ring-primary/20"
                      />
                      <span className={item.checked ? "line-through text-muted-foreground" : ""}>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para criar ideia */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateEpisode} className="brand-panel w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold">Nova Ideia de Episódio</h3>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1">Título do Episódio</label>
              <input
                type="text"
                autoFocus
                required
                placeholder="Ex: TempCast #13 com..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="ghost" onClick={() => setShowCreateModal(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="btn-brand">
                Criar Ideia
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
