"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { AvatarUploader } from "../AvatarUploader";

type AddMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentName: string;
  onSubmit: (data: { name: string; relation: string }) => void;
};

export function AddMemberModal({
  open,
  onOpenChange,
  parentName,
  onSubmit,
}: AddMemberDialogProps) {
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = () => {
    if (!name || !relation || !imageUrl) return;
    onSubmit({ name, relation });
    setName("");
    setRelation("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="icon" aria-label={`Add member related to ${parentName}`}>
          <UserPlus className="h-4 w-4" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Add a new member related to <strong>{parentName}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
         {/* Member photo */}
         <AvatarUploader
            onUploadSuccess={(url) => setImageUrl(url)}
          />
          {/* Name input */}
          <input
            type="text"
            placeholder="Enter member name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* Relation dropdown */}
          <select
            value={relation}
            onChange={(e) => setRelation(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="">Select Relation</option>
            <option value="father">Father</option>
            <option value="mother">Mother</option>
            <option value="brother">Brother</option>
            <option value="sister">Sister</option>
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
            <option value="wife">Wife</option>
          </select>

          {/* Submit button */}
          <Button onClick={handleSubmit} disabled={!name || !relation || !imageUrl}>
            Add Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
