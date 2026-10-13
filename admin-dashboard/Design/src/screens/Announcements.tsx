import { useState } from "react";
import { Plus, Megaphone, Calendar as CalIcon, Pencil, Trash2 } from "lucide-react";
import { Card, Pill, Button, Toggle, IconButton } from "../components/ui";
import { useApp } from "../lib/app-context";
import { BULLETINS, type Bulletin } from "../lib/data";

export default function Announcements() {
  const { tt } = useApp();
  const [items, setItems] = useState<Bulletin[]>(BULLETINS);

  const toggle = (id: string) =>
    setItems((prev) =>
      prev.map((b) =>
        b.id === id
          ? { ...b, status: b.status === "active" ? "draft" : "active" }
          : b,
      ),
    );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            {items.filter((b) => b.status === "active").length}
          </span>{" "}
          {tt("active").toLowerCase()} ·{" "}
          <span className="font-semibold text-foreground">
            {items.filter((b) => b.status === "draft").length}
          </span>{" "}
          {tt("draft").toLowerCase()}
        </p>
        <Button>
          <Plus className="h-4 w-4" />
          {tt("newBulletin")}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {items.map((b) => (
          <Card key={b.id} glow className="flex flex-col p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/12 text-primary">
                <Megaphone className="h-4.5 w-4.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Pill
                    tone={b.status === "active" ? "green" : "neutral"}
                    className="uppercase"
                  >
                    {b.status === "active" ? tt("active") : tt("draft")}
                  </Pill>
                  <span className="flex items-center gap-1 font-mono text-[11px] text-muted-foreground">
                    <CalIcon className="h-3 w-3" />
                    {b.date}
                  </span>
                </div>
                <h3 className="mt-2 font-display text-[15px] font-semibold leading-tight text-foreground">
                  {b.title}
                </h3>
                <p className="mt-1.5 text-[12px] leading-relaxed text-muted-foreground">
                  {b.excerpt}
                </p>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
              <div className="flex items-center gap-2 text-[12px] text-muted-foreground">
                <Toggle checked={b.status === "active"} onChange={() => toggle(b.id)} />
                <span>{b.status === "active" ? tt("active") : tt("draft")}</span>
              </div>
              <div className="flex items-center gap-1">
                <IconButton title="Edit">
                  <Pencil className="h-4 w-4" />
                </IconButton>
                <IconButton title="Delete" className="hover:bg-danger/12 hover:text-danger">
                  <Trash2 className="h-4 w-4" />
                </IconButton>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
