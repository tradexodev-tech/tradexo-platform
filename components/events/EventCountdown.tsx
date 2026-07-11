"use client";

import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type EventCountdownProps = {
  targetDate: string | null;
  label?: string;
  className?: string;
};

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
};

function calculateTimeLeft(targetDate: string): TimeLeft {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (Number.isNaN(difference) || difference <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((difference / (1000 * 60)) % 60),
    seconds: Math.floor((difference / 1000) % 60),
    expired: false,
  };
}

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export default function EventCountdown({
  targetDate,
  label = "Starts in",
  className,
}: EventCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }

    setTimeLeft(calculateTimeLeft(targetDate));

    const interval = window.setInterval(() => {
      setTimeLeft(calculateTimeLeft(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  if (!targetDate || !timeLeft) return null;

  if (timeLeft.expired) {
    return (
      <div className={cn("text-sm font-medium text-muted-foreground", className)}>
        Event has started
      </div>
    );
  }

  const units = [
    { value: timeLeft.days, label: "Days" },
    { value: timeLeft.hours, label: "Hrs" },
    { value: timeLeft.minutes, label: "Min" },
    { value: timeLeft.seconds, label: "Sec" },
  ];

  return (
    <div className={className}>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <div className="flex gap-2">
        {units.map((unit) => (
          <div
            key={unit.label}
            className="flex min-w-[3rem] flex-col items-center rounded-lg bg-blue-600 px-2 py-1.5 text-white"
          >
            <span className="text-lg font-bold leading-none">{pad(unit.value)}</span>
            <span className="text-[10px] uppercase opacity-80">{unit.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
