import { Heart } from "lucide-react";

type ProductFavoriteButtonProps = {
  productName: string;
  isFavorited: boolean;
  isLoading?: boolean;
  disabled?: boolean;
  onToggle: () => void;
  className?: string;
};

export default function ProductFavoriteButton({
  productName,
  isFavorited,
  isLoading = false,
  disabled = false,
  onToggle,
  className = "",
}: ProductFavoriteButtonProps) {
  const label = isFavorited
    ? `Remove ${productName} from favorites`
    : `Save ${productName} to favorites`;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onToggle();
      }}
      disabled={disabled || isLoading}
      aria-label={label}
      aria-pressed={isFavorited}
      className={`inline-flex size-9 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <Heart
        className={`size-4 transition-colors ${
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground"
        }`}
        aria-hidden="true"
      />
    </button>
  );
}
