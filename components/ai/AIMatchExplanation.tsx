"use client";

import { useId, useMemo, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

import {
  buildAIMatchExplanation,
  getAIMatchConfidenceClassName,
  getAIMatchQualityClassName,
  type AIMatchExplanationInput,
} from "@/lib/ai-match-explainer";
import { cn } from "@/lib/utils";

type AIMatchExplanationProps = {
  input: AIMatchExplanationInput;
  triggerLabel?: string;
  className?: string;
};

export default function AIMatchExplanation({
  input,
  triggerLabel = "Why this match?",
  className,
}: AIMatchExplanationProps) {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const explanation = useMemo(() => buildAIMatchExplanation(input), [input]);

  return (
    <div className={cn("border-t", className)}>
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm font-medium text-blue-600 transition-colors hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={() => setExpanded((previous) => !previous)}
      >
        <span>{triggerLabel}</span>
        <ChevronDown
          className={cn(
            "size-4 shrink-0 transition-transform duration-300",
            expanded && "rotate-180"
          )}
          aria-hidden="true"
        />
      </button>

      <div
        id={panelId}
        className={cn(
          "grid transition-[grid-template-rows] duration-300 ease-in-out",
          expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
        aria-hidden={!expanded}
      >
        <div className="overflow-hidden">
          <section
            className="space-y-5 border-t bg-muted/10 px-4 py-4"
            aria-label="AI Match Explanation"
          >
            <div>
              <h4 className="text-sm font-semibold text-foreground">
                AI Match Explanation
              </h4>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-1 text-sm font-semibold text-white">
                {explanation.score}%
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
                    getAIMatchQualityClassName(explanation.quality.tier)
                  )}
                >
                  {explanation.quality.label}
                </span>
              </span>
              <span
                className={cn(
                  "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                  getAIMatchConfidenceClassName(explanation.confidence)
                )}
              >
                Confidence: {explanation.confidence}
              </span>
            </div>

            {explanation.reasons.length > 0 ? (
              <div>
                <h5 className="text-sm font-medium text-foreground">Reasons</h5>
                <ul className="mt-2 space-y-2" aria-label="Match reasons">
                  {explanation.reasons.map((reason) => (
                    <li
                      key={reason}
                      className="flex items-start gap-2 text-sm text-foreground"
                    >
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-emerald-600"
                        aria-hidden="true"
                      />
                      <span>{reason.replace(/^✓\s*/, "")}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {explanation.suggestions.length > 0 ? (
              <div>
                <h5 className="text-sm font-medium text-foreground">
                  Improvement Suggestions
                </h5>
                <ul className="mt-2 space-y-2" aria-label="Improvement suggestions">
                  {explanation.suggestions.map((suggestion) => (
                    <li
                      key={suggestion}
                      className="text-sm text-muted-foreground"
                    >
                      • {suggestion}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </section>
        </div>
      </div>
    </div>
  );
}
