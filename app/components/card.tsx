"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import React from "react";
import { AddMemberModal } from "./modals/AddMember";

type MemberCardProps = {
  relation?: string;
  name: string;
  imageUrl?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAdd: () => void;
  className?: string;
};

export default function MemberCard({
  relation,
  name,
  imageUrl,
  onEdit,
  onDelete,
  onAdd,
  className,
}: MemberCardProps) {
  const fallback = "/next.svg";

  const [open, setOpen] = React.useState(false);
  return (
    <div
      className={`group relative w-[140px] h-[180px] overflow-hidden rounded-2xl shadow-md ring-1 ring-black/5 ${className ?? ""}`}
      role="group"
      aria-label={`${name} card`}
    >
      {/* Full-bleed image */}
      <Image
        src={imageUrl ?? fallback}
        alt={name}
        fill
        sizes="140px"
        className="object-cover"
        priority={false}
      />

      {/* Relation badge (top-right) */}
        <span className="absolute top-2 right-2 z-20 rounded-md bg-black/30 px-2 py-1 text-xs font-semibold text-white">
          {relation ?? "Me"}
        </span>

      {/* Bottom gradient appears on hover */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2 bg-gradient-to-t from-black/70 to-transparent opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

      {/* Bottom content: name and actions */}
      <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-3">
        {/* Name bottom-left */}
        <div className="max-w-[65%] truncate text-white drop-shadow-md">
          <span className="text-sm font-semibold">{name}</span>
        </div>
        {/* Actions bottom-right (visible on hover) */}
        <div className="flex flex-col items-end gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent text-white hover:text-white shadow-none hover:shadow-none size-7"
            aria-label={`Edit ${name}`}
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent text-white hover:text-white shadow-none hover:shadow-none size-7"
            aria-label={`Delete ${name}`}
            onClick={onDelete}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="bg-transparent hover:bg-transparent text-white hover:text-white shadow-none hover:shadow-none size-7"
            aria-label={`Add member related to ${name}`}
            onClick={() => setOpen(true)}
          >
            <UserPlus className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <AddMemberModal open={open} onOpenChange={setOpen} parentName={name} onSubmit={onAdd} />
    </div>
  );
}
