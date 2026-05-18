import Image from "next/image";

export const LOGO = {
  dark: "/assets/omnia-logo.png",
  light: "/assets/omnia-logo-white.png",
} as const;

const WIDTH = 520;
const HEIGHT = 141;

export type LogoVariant = keyof typeof LOGO;

type LogoProps = {
  variant?: LogoVariant;
  className?: string;
  priority?: boolean;
};

export function Logo({ variant = "dark", className, priority }: LogoProps) {
  return (
    <Image
      src={LOGO[variant]}
      alt="OMNIA"
      width={WIDTH}
      height={HEIGHT}
      priority={priority}
      className={className}
    />
  );
}
