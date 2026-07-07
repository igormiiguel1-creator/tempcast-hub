"use client";

import { useState } from "react";
import { Filter, Search, Sparkles, Tag, Video, Images, FileText, Music4 } from "lucide-react";
import { SummaryCard } from "@/features/production/components/summary-card";
import { libraryAssets } from "@/features/production/mock-data";

const categories = ["All", "Videos", "Photos", "Documents", "Music", "Brand assets"] as const;

export default function BibliotecaPage() {
  const [activeCategory, setActiveCategory] = useState<(typeof categories)[number]>("All");

  const visibleAssets = activeCategory === "All" ? libraryAssets : libraryAssets.filter((asset) => asset.category === activeCategory || asset.category === "Brand assets" && activeCategory === "Brand assets");

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
      <section className="brand-panel overflow-hidden p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <div className="brand-pill">
              <Sparkles className="h-4 w-4" />
              Media library
            </div>
            <div>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Library</h2>
              <p className="mt-2 text-base text-muted-foreground sm:text-lg">Search, tag and organize videos, photos, documents, music and brand assets in one place.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard title="Assets" value="142" detail="Available in the archive" icon={FileText} accent="bg-primary/10 text-primary" />
        <SummaryCard title="Videos" value="28" detail="Episode clips and reels" icon={Video} accent="bg-emerald-500/10 text-emerald-600" />
        <SummaryCard title="Photos" value="54" detail="Brand and guest moments" icon={Images} accent="bg-sky-500/10 text-sky-600" />
        <SummaryCard title="Music" value="19" detail="Licensed and ready" icon={Music4} accent="bg-amber-500/10 text-amber-600" />
      </section>

      <section className="brand-card p-4 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input placeholder="Search by title, tag or category" className="h-11 w-full rounded-full border border-border/70 bg-background/80 pl-10 pr-4 text-sm outline-none transition-all duration-200 focus:border-primary focus:bg-card focus:ring-2 focus:ring-primary/20" />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-2 text-sm text-muted-foreground">
              <Filter className="h-4 w-4" />
              Category
            </div>
            {categories.map((category) => (
              <button key={category} type="button" onClick={() => setActiveCategory(category)} className={category === activeCategory ? "rounded-full bg-primary px-3 py-2 text-sm text-primary-foreground" : "rounded-full bg-background/80 px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"}>
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {visibleAssets.map((asset) => (
          <article key={asset.id} className="brand-card p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-foreground">{asset.title}</p>
              <div className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{asset.type}</div>
            </div>
            <div className="mt-4 space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center justify-between"><span>Category</span><span className="font-medium text-foreground">{asset.category}</span></div>
              <div className="flex items-center justify-between"><span>Size</span><span className="font-medium text-foreground">{asset.size}</span></div>
              <div className="flex items-center justify-between"><span>Updated</span><span className="font-medium text-foreground">{asset.updatedAt}</span></div>
            </div>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/80 px-3 py-1 text-xs text-muted-foreground">
              <Tag className="h-3.5 w-3.5" />
              {asset.tag}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
