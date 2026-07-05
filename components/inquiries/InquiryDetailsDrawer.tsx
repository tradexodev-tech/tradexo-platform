"use client";

import { useEffect, useRef } from "react";
import { Send, X } from "lucide-react";

import InquiryStatusBadge from "@/components/inquiries/InquiryStatusBadge";
import { formatSubmittedDate } from "@/components/inquiries/InquiryTable";
import { Button } from "@/components/ui/button";
import type { Inquiry } from "@/types/inquiry";
import { getBuyerInitials, MAX_INQUIRY_REPLY_LENGTH } from "@/types/inquiry";

type InquiryDetailsDrawerProps = {
  open: boolean;
  inquiry: Inquiry | null;
  onClose: () => void;
  triggerRef?: React.RefObject<HTMLElement | null>;
  error?: string | null;
  replyMessage: string;
  onReplyMessageChange: (value: string) => void;
  onSendReply: () => void;
  sendingReply?: boolean;
  replyError?: string | null;
  successMessage?: string | null;
};

const textareaClass =
  "w-full rounded-lg border bg-background p-3 text-sm text-foreground outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500";
const labelClass = "mb-2 block text-sm font-medium text-foreground";
function DetailField({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p
        className={`mt-1 text-sm text-foreground ${multiline ? "whitespace-pre-wrap" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

export default function InquiryDetailsDrawer({
  open,
  inquiry,
  onClose,
  triggerRef,
  error,
  replyMessage,
  onReplyMessageChange,
  onSendReply,
  sendingReply = false,
  replyError,
  successMessage,
}: InquiryDetailsDrawerProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const prevOpenRef = useRef(false);

  function handleClose() {
    if (sendingReply) return;
    onClose();
  }
  useEffect(() => {
    if (open && inquiry) {
      requestAnimationFrame(() => {
        closeButtonRef.current?.focus();
      });
    } else if (prevOpenRef.current) {
      triggerRef?.current?.focus();
    }

    prevOpenRef.current = open;
  }, [open, inquiry, triggerRef]);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !sendingReply) {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, onClose, sendingReply]);

  if (!inquiry) return null;

  const hasSentReply = Boolean(inquiry.reply_message);
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={handleClose}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[480px] flex-col border-l bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="inquiry-details-title"
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700"
              aria-hidden="true"
            >
              {getBuyerInitials(inquiry.buyer_name)}
            </span>
            <div className="min-w-0">
              <h2
                id="inquiry-details-title"
                className="truncate text-lg font-semibold text-foreground"
              >
                Inquiry Details
              </h2>
              <p className="truncate text-sm text-muted-foreground">
                {inquiry.buyer_name || "Buyer inquiry"}
              </p>
            </div>
          </div>
          <Button
            ref={closeButtonRef}
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleClose}
            aria-label="Close inquiry details"
            disabled={sendingReply}
          >
            <X className="size-5" />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {error ? (
            <div
              className="mb-4 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
              role="alert"
            >
              {error}
            </div>
          ) : null}

          <div className="mb-6 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">
              Submitted {formatSubmittedDate(inquiry.created_at)}
            </p>
            <InquiryStatusBadge status={inquiry.status} />
          </div>

          <div className="space-y-5">
            <DetailField label="Buyer Name" value={inquiry.buyer_name} />
            <DetailField label="Company" value={inquiry.buyer_company ?? ""} />
            <DetailField label="Email" value={inquiry.buyer_email} />
            <DetailField label="Country" value={inquiry.buyer_country ?? ""} />
            <DetailField label="Phone" value={inquiry.buyer_phone ?? ""} />
            <DetailField label="Product Name" value={inquiry.product_name} />
            <DetailField label="Message" value={inquiry.message} multiline />
          </div>

          <div className="mt-8 border-t pt-6">
            <h3 className="text-sm font-semibold text-foreground">
              Reply to Buyer
            </h3>

            {hasSentReply ? (
              <div className="mt-4 space-y-2">
                {successMessage ? (
                  <div
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                    role="status"
                  >
                    {successMessage}
                  </div>
                ) : null}
                <DetailField
                  label="Your Reply"
                  value={inquiry.reply_message ?? ""}
                  multiline
                />
                {inquiry.replied_at ? (
                  <p className="text-xs text-muted-foreground">
                    Sent {formatSubmittedDate(inquiry.replied_at)}
                  </p>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {successMessage ? (
                  <div
                    className="rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
                    role="status"
                  >
                    {successMessage}
                  </div>
                ) : null}

                {replyError ? (
                  <div
                    className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {replyError}
                  </div>
                ) : null}

                <div>
                  <label htmlFor="inquiry-reply-message" className={labelClass}>
                    Your Reply
                  </label>
                  <textarea
                    id="inquiry-reply-message"
                    rows={5}
                    value={replyMessage}
                    onChange={(event) =>
                      onReplyMessageChange(event.target.value)
                    }
                    maxLength={MAX_INQUIRY_REPLY_LENGTH}
                    disabled={sendingReply}
                    placeholder="Write your reply to the buyer..."
                    className={textareaClass}
                    aria-invalid={Boolean(replyError)}
                    aria-describedby="inquiry-reply-hint"
                  />
                  <p
                    id="inquiry-reply-hint"
                    className="mt-1 text-xs text-muted-foreground"
                  >
                    {replyMessage.length}/{MAX_INQUIRY_REPLY_LENGTH} characters
                  </p>
                </div>

                <Button
                  type="button"
                  onClick={onSendReply}
                  disabled={sendingReply}
                  className="w-full sm:w-auto"
                >
                  <Send className="size-4" />
                  {sendingReply ? "Sending..." : "Send Reply"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
