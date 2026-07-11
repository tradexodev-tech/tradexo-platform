"use client";

import type { EventModuleDefinition } from "@/types/event-modules";
import { EVENT_FUTURE_MODULES } from "@/types/event-modules";
import { Sparkles } from "lucide-react";

type FutureModulePlaceholderProps = {
  module: EventModuleDefinition;
};

export default function FutureModulePlaceholder({ module }: FutureModulePlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-16 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
        <Sparkles className="size-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-foreground">{module.label}</h3>
      <p className="mt-2 max-w-md text-sm text-muted-foreground">{module.description}</p>
      <span className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-600/20">
        {module.status === "planned" ? "Coming Soon" : module.status}
      </span>
      {module.dependsOn.length > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Depends on: {module.dependsOn.join(", ")}
        </p>
      ) : null}
    </div>
  );
}

export function getFutureModule(id: string) {
  return EVENT_FUTURE_MODULES.find((m) => m.id === id || m.routeSegment === id);
}
