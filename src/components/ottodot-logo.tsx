import Image from "next/image";
import Link from "next/link";

type OttodotLogoProps = {
  href?: string;
  priority?: boolean;
};

export function OttodotLogo({ href = "/", priority }: OttodotLogoProps) {
  const logo = (
    <Image
      src="/ottodot-logo.png"
      alt="Ottodot"
      width={2873}
      height={365}
      className="h-8 w-auto sm:h-9"
      priority={priority}
    />
  );

  if (!href) {
    return logo;
  }

  return (
    <Link href={href} className="inline-flex shrink-0">
      {logo}
    </Link>
  );
}
