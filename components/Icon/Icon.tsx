import type { SVGProps } from "react";

type IconName =
  | "logo"
  | "united-kingdom-logo"
  | "ukraine-logo"
  | "trash-icon"
  | "search"
  | "plus"
  | "eye"
  | "eye-off"
  | "edit-icon"
  | "arrows"
  | "arrow-right"
  | "arrow-down";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export default function Icon({
  name,
  width = 20,
  height = 20,
  ...props
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}
