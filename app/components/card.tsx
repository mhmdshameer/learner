"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type MemberCardProps = {
  relation?: string;
  name: string;
  imageUrl?: string;
  memberId?: string;
  onEdit: () => void;
  onDelete: () => void;
  className?: string;
};

export default function MemberCard({
  relation,
  name,
  imageUrl,
  onEdit,
  onDelete,
  className,
}: MemberCardProps) {
  const [imgSrc, setImgSrc] = useState(imageUrl?.trim() || '');
  const [isHovered, setIsHovered] = useState(false);
  const fallback = "/default-avatar.png";

  return (
    <div
      className={cn(
        "relative flex flex-col items-center w-52 bg-white rounded-lg shadow-md overflow-hidden",
        "border border-gray-200 transition-all duration-200 hover:shadow-lg hover:border-blue-400",
        className
      )}
      role="group"
      aria-label={`${name} card`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container with aspect ratio */}
      <div className="relative w-full h-48 bg-gray-100">
        <Image
          src={imgSrc || fallback}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-opacity duration-200"
          onError={() => setImgSrc(fallback)}
          priority={false}
        />
        
        {/* Overlay gradient */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 transition-opacity duration-300",
          isHovered ? "opacity-100" : "opacity-0"
        )} />
      </div>
      
      {/* Member Info */}
      <div className="w-full p-3 text-center">
        <h3 className="font-medium text-gray-900 truncate">{name}</h3>
        {relation && (
          <p className="text-xs text-gray-500 capitalize">{relation}</p>
        )}
      </div>

      {/* Action buttons - shown on hover */}
      <div className={cn(
        "absolute inset-0 flex items-center justify-center gap-2 bg-black/30 opacity-0 transition-opacity duration-300",
        isHovered ? "opacity-100" : "opacity-0 pointer-events-none"
      )}>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 hover:bg-white text-gray-800"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-4 w-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        >
          <Trash2 className="h-4 w-4 mr-1" />
          Remove
        </Button>
      </div>
      
      {/* Relation badge */}
      {relation && (
        <span className="absolute top-2 right-2 px-2 py-1 text-xs font-medium text-white bg-black/60 rounded-md backdrop-blur-sm">
          {relation}
        </span>
      )}
    </div>
  );
}
