import { Heart, HeartOff } from "lucide-react";

import { Button, type ButtonProps } from "./Button";

export interface FavoriteToggleProps
  extends Omit<ButtonProps, "children" | "onClick" | "aria-pressed"> {
  isFavorited: boolean;
  onToggle: () => void;
}

export function FavoriteToggle({
  isFavorited,
  onToggle,
  ...buttonProps
}: FavoriteToggleProps) {
  const label = isFavorited ? "Remove from Favorites" : "Favorite";
  const Icon = isFavorited ? HeartOff : Heart;

  return (
    <Button
      variant={isFavorited ? "danger" : "primary"}
      aria-pressed={isFavorited}
      aria-label={label}
      onClick={onToggle}
      {...buttonProps}
    >
      <Icon size={20} aria-hidden="true" />
      {label}
    </Button>
  );
}
