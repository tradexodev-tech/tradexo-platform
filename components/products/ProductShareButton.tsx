"use client";

import { useCallback, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { ExternalLink, Link2, Mail, MessageCircle, Share2 } from "lucide-react";

import {
  buildEmailShareUrl,
  buildLinkedInShareUrl,
  buildProductShareUrl,
  buildWhatsAppShareUrl,
  copyProductShareUrl,
  isWebShareSupported,
  openShareDestination,
  shareProductNatively,
} from "@/lib/share-product";
import { cn } from "@/lib/utils";

export type ProductShareMenuItem = {
  id: "copy" | "whatsapp" | "linkedin" | "email";
  label: string;
  icon: ReactNode;
};

type ProductShareButtonProps = {
  productName: string;
  isMenuOpen: boolean;
  isSharing?: boolean;
  onShareClick: () => void;
  onMenuClose: () => void;
  onCopyLink: () => void;
  onWhatsAppShare: () => void;
  onLinkedInShare: () => void;
  onEmailShare: () => void;
  className?: string;
};

const shareMenuItems: ProductShareMenuItem[] = [
  {
    id: "copy",
    label: "Copy Link",
    icon: <Link2 className="size-4" aria-hidden="true" />,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    icon: <MessageCircle className="size-4" aria-hidden="true" />,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: <ExternalLink className="size-4" aria-hidden="true" />,
  },
  {
    id: "email",
    label: "Email",
    icon: <Mail className="size-4" aria-hidden="true" />,
  },
];

export function ProductShareButton({
  productName,
  isMenuOpen,
  isSharing = false,
  onShareClick,
  onMenuClose,
  onCopyLink,
  onWhatsAppShare,
  onLinkedInShare,
  onEmailShare,
  className = "",
}: ProductShareButtonProps) {
  const menuId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const shareButtonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    function handlePointerDown(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        onMenuClose();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        onMenuClose();
        shareButtonRef.current?.focus();
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMenuOpen, onMenuClose]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const firstMenuItem = menuRef.current?.querySelector<HTMLButtonElement>(
      '[role="menuitem"]'
    );
    firstMenuItem?.focus();
  }, [isMenuOpen]);

  const handleMenuItemClick = (itemId: ProductShareMenuItem["id"]) => {
    switch (itemId) {
      case "copy":
        onCopyLink();
        break;
      case "whatsapp":
        onWhatsAppShare();
        break;
      case "linkedin":
        onLinkedInShare();
        break;
      case "email":
        onEmailShare();
        break;
    }

    onMenuClose();
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        ref={shareButtonRef}
        type="button"
        onClick={onShareClick}
        disabled={isSharing}
        aria-label={`Share ${productName}`}
        aria-haspopup="menu"
        aria-expanded={isMenuOpen}
        aria-controls={isMenuOpen ? menuId : undefined}
        className="inline-flex size-9 items-center justify-center rounded-full border bg-background/95 text-foreground shadow-sm transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <Share2 className="size-4 text-muted-foreground" aria-hidden="true" />
      </button>

      {isMenuOpen ? (
        <div
          ref={menuRef}
          id={menuId}
          role="menu"
          aria-label={`Share ${productName}`}
          className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border bg-card py-1 text-sm shadow-lg"
        >
          {shareMenuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => handleMenuItemClick(item.id)}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-foreground transition-colors hover:bg-muted focus-visible:bg-muted focus-visible:outline-none"
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

type ProductShareToggleProps = {
  productSlug: string;
  productName: string;
  className?: string;
};

export default function ProductShareToggle({
  productSlug,
  productName,
  className,
}: ProductShareToggleProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const productUrl = buildProductShareUrl(productSlug);

  useEffect(() => {
    if (!toastMessage) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setToastMessage(null);
    }, 5000);

    return () => window.clearTimeout(timeout);
  }, [toastMessage]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const handleShareClick = useCallback(async () => {
    if (isWebShareSupported()) {
      setIsSharing(true);

      const result = await shareProductNatively({
        title: productName,
        url: productUrl,
        text: productName,
      });

      setIsSharing(false);

      if (result === "shared" || result === "aborted") {
        return;
      }
    }

    setIsMenuOpen((previous) => !previous);
  }, [productName, productUrl]);

  const handleCopyLink = useCallback(async () => {
    const result = await copyProductShareUrl(productUrl);

    if (result.ok) {
      setToastMessage("Product link copied.");
      return;
    }

    setToastMessage(result.error ?? "Unable to copy link.");
  }, [productUrl]);

  const handleWhatsAppShare = useCallback(() => {
    openShareDestination(buildWhatsAppShareUrl(productUrl));
  }, [productUrl]);

  const handleLinkedInShare = useCallback(() => {
    openShareDestination(buildLinkedInShareUrl(productUrl));
  }, [productUrl]);

  const handleEmailShare = useCallback(() => {
    window.location.href = buildEmailShareUrl(productUrl);
  }, [productUrl]);

  return (
    <>
      <ProductShareButton
        productName={productName}
        isMenuOpen={isMenuOpen}
        isSharing={isSharing}
        onShareClick={() => {
          void handleShareClick();
        }}
        onMenuClose={closeMenu}
        onCopyLink={() => {
          void handleCopyLink();
        }}
        onWhatsAppShare={handleWhatsAppShare}
        onLinkedInShare={handleLinkedInShare}
        onEmailShare={handleEmailShare}
        className={className}
      />

      {toastMessage ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed right-4 bottom-4 z-[60] max-w-sm rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 shadow-lg"
        >
          {toastMessage}
        </div>
      ) : null}
    </>
  );
}
