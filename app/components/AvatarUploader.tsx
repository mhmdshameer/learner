"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";

interface AvatarUploaderProps {
  onUploadSuccess: (url: string) => void;
}

export function AvatarUploader({ onUploadSuccess }: AvatarUploaderProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Run only on client
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent SSR mismatch

  return (
    <CldUploadWidget
      uploadPreset="family_tree_upload"
      onSuccess={(result) => {
        console.log("Upload result:", result);
        if (
          typeof result.info === "object" &&
          result.info &&
          "secure_url" in result.info
        ) {
          const secureUrl = (result.info as { secure_url: string }).secure_url;
          onUploadSuccess(secureUrl);
        }
      }}
      options={{
        folder: "family_members",
        singleUploadAutoClose: true,
      }}
    >
      {({ open }) => (
        <button
          type="button"
          onClick={() => open()}
          className="rounded-md bg-indigo-600 px-2.5 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Upload Avatar
        </button>
      )}
    </CldUploadWidget>
  );
}
