import type { ReactNode } from "react";
import Image from "next/image";
 

export default function FamilyTreeLayout({ children }: { children: ReactNode }) {
  const bgUrl =
    "https://res.cloudinary.com/dkxmfqafi/image/upload/v1756540331/family_members/byozkx6kivyjh3svpjnw.jpg";

  return (
    <div className="relative min-h-screen">
      {bgUrl && (
        <Image
          src={bgUrl}
          alt=""
          fill
          sizes="100vw"
          priority={false}
          aria-hidden
          className="object-cover opacity-50 pointer-events-none select-none"
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
