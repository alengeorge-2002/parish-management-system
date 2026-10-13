import React, { useEffect } from "react";
import { X, Phone, Users, Plus, Trash2, Mail, ShieldCheck, UserCheck } from "lucide-react";
import { Pill, Button, IconButton } from "./ui";
import getMemberAvatar from "../utils/getMemberAvatar";

export interface RosterItem {
  id?: string;
  name: string;
  role?: string;
  designation?: string;
  role_title?: string;
  phone?: string;
  phone_number?: string;
  email?: string;
  photo?: string;
  avatar?: string;
  gender?: string;
}

export interface RosterDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  category?: string;
  leaderLabel?: string;
  leaderName?: string;
  phone?: string;
  totalCount?: number;
  typeText?: string; // e.g. "Residents" or "Members"
  roster: RosterItem[];
  onAddMember?: () => void;
  onRemoveMember?: (item: RosterItem) => void;
}

export function RosterDrawer({
  open,
  onClose,
  title,
  subtitle,
  category = "Organization",
  leaderLabel = "Superior / Coordinator",
  leaderName = "N/A",
  phone,
  totalCount,
  typeText = "Members",
  roster = [],
  onAddMember,
  onRemoveMember,
}: RosterDrawerProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const countDisplay = totalCount !== undefined ? totalCount : roster.length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark backdrop */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Slide-over Drawer panel */}
      <div className="modal-in relative flex h-full w-full max-w-md flex-col overflow-hidden border-l border-border-strong bg-card shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-border bg-popover/80 px-5 py-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Pill tone="gold" className="uppercase tracking-wider">
                {category}
              </Pill>
              {subtitle && (
                <span className="truncate text-[11px] text-muted-foreground">{subtitle}</span>
              )}
            </div>
            <h2 className="mt-1.5 font-display text-[18px] font-bold text-foreground truncate">
              {title}
            </h2>
          </div>
          <IconButton onClick={onClose} aria-label="Close drawer">
            <X className="h-4 w-4" />
          </IconButton>
        </div>

        {/* Metadata Banner */}
        <div className="border-b border-border bg-secondary/30 px-5 py-3.5">
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] font-medium text-muted-foreground">{leaderLabel}</div>
              <div className="font-semibold text-foreground text-[13px]">{leaderName}</div>
            </div>
            {phone && (
              <a
                href={`tel:${phone}`}
                className="inline-flex items-center gap-1.5 rounded-[8px] border border-info/30 bg-info/10 px-2.5 py-1 text-[12px] font-mono font-medium text-info transition-colors hover:bg-info/20"
              >
                <Phone className="h-3.5 w-3.5" />
                {phone}
              </a>
            )}
          </div>
        </div>

        {/* Action Header & Roster Count */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-muted/20">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-primary" />
            <span className="text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
              Roster ({countDisplay} {typeText})
            </span>
          </div>
          {onAddMember && (
            <Button variant="secondary" className="h-7 text-[11px] px-2.5" onClick={onAddMember}>
              <Plus className="h-3.5 w-3.5" />
              Add {typeText.slice(0, -1) || "Member"}
            </Button>
          )}
        </div>

        {/* Roster List Body */}
        <div className="flex-1 overflow-y-auto divide-y divide-border px-3 py-2">
          {roster.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <UserCheck className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-[13px]">No members assigned to this roster yet.</p>
            </div>
          ) : (
            roster.map((item, idx) => {
              const designation = item.designation || item.role_title || item.role || "Member";
              const avatarSrc = getMemberAvatar({ photo: item.photo || item.avatar, gender: item.gender });

              return (
                <div key={item.id || idx} className="flex items-center gap-3 p-3 transition-colors hover:bg-secondary/40 rounded-[8px]">
                  <img
                    src={avatarSrc}
                    alt={item.name}
                    className="h-10 w-10 shrink-0 rounded-full object-cover border border-border"
                    onError={(e) => {
                      e.currentTarget.src = getMemberAvatar({ gender: item.gender });
                    }}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-semibold text-[13px] text-foreground">
                      {item.name}
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <Pill tone="neutral" className="px-1.5 py-0 text-[10px] uppercase font-mono">
                        {designation}
                      </Pill>
                    </div>
                    {(item.phone || item.phone_number || item.email) && (
                      <div className="mt-1 flex items-center gap-3 text-[11px] text-muted-foreground/80 font-mono">
                        {(item.phone || item.phone_number) && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3 text-info" />
                            {item.phone || item.phone_number}
                          </span>
                        )}
                        {item.email && (
                          <span className="flex items-center gap-1 truncate max-w-[140px]">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {item.email}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  {onRemoveMember && (
                    <IconButton
                      title="Remove"
                      className="hover:bg-danger/12 hover:text-danger shrink-0"
                      onClick={() => onRemoveMember(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </IconButton>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border bg-popover/80 px-5 py-3 text-right">
          <Button variant="ghost" onClick={onClose} className="py-1.5 text-[12px]">
            Close Roster
          </Button>
        </div>
      </div>
    </div>
  );
}

export default RosterDrawer;
