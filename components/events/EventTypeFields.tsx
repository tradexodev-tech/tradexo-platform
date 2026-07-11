"use client";

import type { EventFormData, EventType } from "@/types/event";
import {
  EVENT_TYPE_OPTIONS,
  showsPhysicalFields,
  showsVirtualFields,
} from "@/types/event";
import { COMPANY_INDUSTRIES, PRODUCT_COUNTRIES } from "@/lib/catalog";
import { cn } from "@/lib/utils";

const inputClass =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const labelClass = "mb-1 block text-sm font-medium text-foreground";

type EventTypeFieldsProps = {
  form: EventFormData;
  updateField: <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => void;
  showTypeSelector?: boolean;
};

export default function EventTypeFields({
  form,
  updateField,
  showTypeSelector = true,
}: EventTypeFieldsProps) {
  const showPhysical = showsPhysicalFields(form.event_type);
  const showVirtual = showsVirtualFields(form.event_type);

  return (
    <div className="space-y-6">
      {showTypeSelector ? (
        <div>
          <label className={labelClass}>Event Type *</label>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {EVENT_TYPE_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => updateField("event_type", option.value as EventType)}
                className={cn(
                  "rounded-xl border p-4 text-left transition-all",
                  form.event_type === option.value
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-600/20"
                    : "hover:border-muted-foreground/40"
                )}
              >
                <p className="font-medium text-foreground">{option.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {showPhysical ? (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold text-foreground">Physical Venue</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Country *</label>
              <select
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
                className={inputClass}
              >
                <option value="">Select country</option>
                {PRODUCT_COUNTRIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>State / Region</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => updateField("state", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>City *</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => updateField("city", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Venue / Hall *</label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => updateField("venue", e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Address</label>
            <textarea
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              className={inputClass + " min-h-[80px] resize-y"}
              rows={2}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>GPS Latitude</label>
              <input
                type="number"
                step="any"
                value={form.gps_latitude}
                onChange={(e) => updateField("gps_latitude", e.target.value)}
                className={inputClass}
                placeholder="25.2048"
              />
            </div>
            <div>
              <label className={labelClass}>GPS Longitude</label>
              <input
                type="number"
                step="any"
                value={form.gps_longitude}
                onChange={(e) => updateField("gps_longitude", e.target.value)}
                className={inputClass}
                placeholder="55.2708"
              />
            </div>
          </div>
          <div>
            <label className={labelClass}>Industry</label>
            <select
              value={form.industry}
              onChange={(e) => updateField("industry", e.target.value)}
              className={inputClass}
            >
              <option value="">Select industry</option>
              {COMPANY_INDUSTRIES.map((i) => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>
        </div>
      ) : null}

      {showVirtual ? (
        <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
          <h4 className="text-sm font-semibold text-foreground">Virtual Platform</h4>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Virtual Platform</label>
              <input
                type="text"
                value={form.virtual_platform}
                onChange={(e) => updateField("virtual_platform", e.target.value)}
                className={inputClass}
                placeholder="Zoom, Hopin, Tradexo Virtual…"
              />
            </div>
            <div>
              <label className={labelClass}>Event URL *</label>
              <input
                type="url"
                value={form.virtual_url}
                onChange={(e) => updateField("virtual_url", e.target.value)}
                className={inputClass}
                placeholder="https://"
              />
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Virtual Lobby URL</label>
              <input
                type="url"
                value={form.virtual_lobby_url}
                onChange={(e) => updateField("virtual_lobby_url", e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Streaming Provider</label>
              <input
                type="text"
                value={form.stream_provider}
                onChange={(e) => updateField("stream_provider", e.target.value)}
                className={inputClass}
                placeholder="YouTube Live, Vimeo…"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.chat_enabled}
                onChange={(e) => updateField("chat_enabled", e.target.checked)}
                className="rounded border-input"
              />
              Chat Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.networking_enabled}
                onChange={(e) => updateField("networking_enabled", e.target.checked)}
                className="rounded border-input"
              />
              Networking Enabled
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.ai_matchmaking_enabled}
                onChange={(e) => updateField("ai_matchmaking_enabled", e.target.checked)}
                className="rounded border-input"
              />
              AI Matchmaking Enabled
            </label>
          </div>
        </div>
      ) : null}
    </div>
  );
}
