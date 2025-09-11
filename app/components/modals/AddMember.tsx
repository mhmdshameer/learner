"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import axios from "axios";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { useState } from "react";
import { AvatarUploader } from "../AvatarUploader";

type AddMemberDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentName: string;
  parentId?: string;
};

export function AddMemberModal({
  open,
  onOpenChange,
  parentName,
  parentId,
}: AddMemberDialogProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [displayRelation, setDisplayRelation] = useState<string>("");

  const handleSubmit = async () => {
    if (!name || !relation || !imageUrl) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      if (!token) {
        // Not logged in; send user to login
        router.replace('/login');
        return;
      }
      await axios.post(
        "/api/member",
        { name, relation, imageUrl, linkedTo: parentId, displayRelation: displayRelation?.trim() || undefined },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setName("");
      setRelation("");
      setImageUrl("");
      setDisplayRelation("");
      router.refresh();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('member:changed'))
      }
      onOpenChange(false);
    } catch (e) {
      // You could add toast here
      console.error(e);
      if (axios.isAxiosError(e) && e.response?.status === 401) {
        router.replace('/login');
      }
    }
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
          {imageUrl?.trim() && (
            <div className="flex justify-center">
              <Image
                src={imageUrl.trim()}
                alt="Preview"
                width={128}
                height={128}
                className="w-32 h-32 object-cover rounded-full border-2 border-gray-300"
              />
            </div>
          )}
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
            <option value="son">Son</option>
            <option value="daughter">Daughter</option>
            <option value="wife">Wife</option>
          </select>

          {/* Optional: how to show on the card relative to you */}
          <input
            type="text"
            placeholder="Show on card (e.g., Brother, Cousin, Aunt) — optional"
            value={displayRelation}
            onChange={(e) => setDisplayRelation(e.target.value)}
            className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-500"
          />

          {/* Submit button */}
          <Button onClick={handleSubmit} disabled={!name || !relation || !imageUrl}>
            Add Member
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
