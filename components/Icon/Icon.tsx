type IconProps = {
  name:
    | "united-kingdom-logo"
    | "ukraine-logo"
    | "trash-icon"
    | "search"
    | "plus"
    | "logo"
    | "eye-off"
    | "eye"
    | "edit-icon"
    | "arrows"
    | "arrow-right"
    | "arrow-down";
  width?: number;
  height?: number;
  className?: string;
};

export default function Icon({
  name,
  width = 20,
  height = 20,
  className,
}: IconProps) {
  return (
    <svg
      width={width}
      height={height}
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <use href={`/icons/sprite.svg#${name}`} />
    </svg>
  );
}
