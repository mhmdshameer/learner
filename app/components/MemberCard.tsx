"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, UserPlus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MemberCardProps = {
  relation?: string;
  name: string;
  imageUrl?: string;
  memberId?: string;
  onEdit: () => void;
  onDelete: () => void;
  onAddMember?: () => void;
  className?: string;
};

export default function MemberCard({
  relation,
  name,
  imageUrl,
  onEdit,
  onDelete,
  onAddMember,
  className,
}: MemberCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl?.trim() || "");
  const fallback = "/default-avatar.png";

  return (
    <div
      className={cn(
        "relative w-[150px] h-[200px] rounded-lg overflow-hidden group",
        "shadow-md hover:shadow-lg transition-shadow duration-200",
        className
      )}
      aria-label={`${name} card`}
    >
      {/* Background Image */}
      <Image
        src={imgSrc || fallback}
        alt={name}
        fill
        sizes="150px"
        className="object-cover w-full h-full"
        onError={() => setImgSrc(fallback)}
      />

      {/* Gradient overlay bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-2/5 bg-gradient-to-t from-black/70 to-transparent" />

      {/* Top-right corner (relation or Me) */}
      <div className="absolute top-2 right-2 z-20">
        <span className="px-2 py-0.5 text-xs font-medium text-white bg-black/60 rounded-full">
          {relation ? relation : "Me"}
        </span>
      </div>

      {/* Bottom center name */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20">
        <h3 className="text-sm font-medium text-white truncate max-w-[130px] text-center">
          {name}
        </h3>
      </div>

      {/* Bottom-right vertical action buttons */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-2 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/50 hover:bg-black text-white hover:text-white shadow"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          title="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full bg-black/50 hover:bg-black text-white hover:text-white shadow"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          title="Delete"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {onAddMember && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full bg-black/50 hover:bg-black text-white hover:text-white shadow"
            onClick={(e) => {
              e.stopPropagation();
              onAddMember();
            }}
            title="Add Member"
          >
            <UserPlus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
