"use client";

import { useMemo, useState } from "react";
import courses from "../data/courses.json";

type Interest =
  | "Science"
  | "Arts"
  | "Philosophy"
  | "Tech"
  | "History"
  | "Business"
  | "Law"
  | "Social Science"
  | "Environment"
  | "Anything!";

type Course = {
  id: string;
  title: string;
  code: string;
  department: string;
  instructor: string;
  building: string;
  room: string;
  lat: number;
  lng: number;
  walkingMinutes: number;
  startTime: string; // "HH:MM" 24h, campus local time
  endTime: string; // "HH:MM"
  interests: Interest[];
  description: string;
};

const INTEREST_OPTIONS: Interest[] = [
  "Science",
  "Arts",
  "Philosophy",
  "Tech",
  "History",
  "Business",
  "Social Science",
  "Environment",
  "Anything!"
];

function parseTimeToday(time: string): Date {
  const [hours, minutes] = time.split(":").map(Number);
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  return d;
}

function formatTimeRange(start: string, end: string) {
  const to12h = (t: string) => {
    const [hStr, m] = t.split(":");
    let h = Number(hStr);
    const suffix = h >= 12 ? "PM" : "AM";
    if (h === 0) h = 12;
    else if (h > 12) h -= 12;
    return `${h}:${m} ${suffix}`;
  };
  return `${to12h(start)} – ${to12h(end)}`;
}

function formatTimeRange24(start: string, end: string) {
  const normalize = (t: string) => t.slice(0, 5); // "HH:MM"
  return `${normalize(start)}–${normalize(end)}`;
}

function buildMapsUrl(building: string) {
  const query = `${building}, UC Berkeley`;
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    query
  )}`;
}

function downloadIcs(course: Course) {
  const today = new Date();
  const [sh, sm] = course.startTime.split(":").map(Number);
  const [eh, em] = course.endTime.split(":").map(Number);

  const start = new Date(today);
  start.setHours(sh, sm, 0, 0);
  const end = new Date(today);
  end.setHours(eh, em, 0, 0);

  const toIcsDate = (d: Date) => {
    const pad = (n: number) => String(n).padStart(2, "0");
    return (
      d.getFullYear().toString() +
      pad(d.getMonth() + 1) +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      pad(d.getMinutes()) +
      pad(d.getSeconds())
    );
  };

  const dtStamp = toIcsDate(new Date());
  const dtStart = toIcsDate(start);
  const dtEnd = toIcsDate(end);

  const location = `${course.building} ${course.room}`;
  const summary = `${course.title} (${course.code})`;

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ClassHop//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    `UID:${course.id}@classhop.berkeley`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${course.description.replace(/\r?\n/g, " ")}`,
    `LOCATION:${location}`,
    "END:VEVENT",
    "END:VCALENDAR"
  ].join("\r\n");

  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${course.code.replace(/\s+/g, "_")}_ClassHop.ics`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const allCourses: Course[] = (courses as unknown as Course[]).map((c) => ({
  ...c,
  id: String((c as any).id)
}));

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTE_OPTIONS = [0, 30];

type DefaultTime = {
  hour: number;
  minute: number;
  meridiem: "AM" | "PM";
};

function findNextCourseStart(now: Date): DefaultTime {
  let next: Date | null = null;

  for (const course of allCourses) {
    const start = parseTimeToday(course.startTime);
    if (start <= now) continue;
    if (!next || start < next) {
      next = start;
    }
  }

  if (!next) {
    for (const course of allCourses) {
      const start = parseTimeToday(course.startTime);
      if (!next || start < next) {
        next = start;
      }
    }
  }

  if (!next) {
    next = now;
  }

  const hour24 = next.getHours();
  const minute = next.getMinutes();
  let hour12 = hour24 % 12;
  if (hour12 === 0) hour12 = 12;
  const meridiem: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";

  return { hour: hour12, minute, meridiem };
}

export default function HomePage() {
  const nextDefault = useMemo(() => findNextCourseStart(new Date()), []);
  const [selectedHour, setSelectedHour] = useState<number>(nextDefault.hour);
  const [selectedMinute, setSelectedMinute] = useState<number>(nextDefault.minute);
  const [meridiem, setMeridiem] = useState<"AM" | "PM">(nextDefault.meridiem);
  const [timeMode, setTimeMode] = useState<"manual" | "now">("manual");
  const [selectedInterests, setSelectedInterests] = useState<Interest[]>([]);
  const [currentCourse, setCurrentCourse] = useState<Course | null>(null);
  const [lastPool, setLastPool] = useState<Course[]>([]);
  const [isFinding, setIsFinding] = useState(false);

  const activeTimeSlot = useMemo(() => {
    let hours24 = selectedHour % 12;
    if (meridiem === "PM") {
      hours24 += 12;
    }
    const minute = selectedMinute;
    const hourStr = String(hours24).padStart(2, "0");
    const minuteStr = String(minute).padStart(2, "0");
    return `${hourStr}:${minuteStr}`;
  }, [selectedHour, selectedMinute, meridiem]);

  const filteredCourses = useMemo(() => {
    if (!activeTimeSlot) {
      return allCourses.filter((course) => {
        const effectiveInterests = selectedInterests.includes("Anything!")
          ? []
          : (selectedInterests.filter(
              (i) => i !== "Anything!"
            ) as Exclude<Interest, "Anything!">[]);
        if (effectiveInterests.length === 0) return true;
        return course.interests.some((i) =>
          (effectiveInterests as Interest[]).includes(i)
        );
      });
    }

    const selectedMoment = parseTimeToday(activeTimeSlot);

    return allCourses.filter((course) => {
      const effectiveInterests = selectedInterests.includes("Anything!")
        ? []
        : selectedInterests.filter((i) => i !== "Anything!");

      if (effectiveInterests.length > 0) {
        const intersects = course.interests.some((i) =>
          (effectiveInterests as Interest[]).includes(i)
        );
        if (!intersects) return false;
      }

      const cStart = parseTimeToday(course.startTime);
      const cEnd = parseTimeToday(course.endTime);

      const startMatches =
        cStart.getHours() === selectedMoment.getHours() &&
        cStart.getMinutes() === selectedMoment.getMinutes();

      const inSession =
        selectedMoment.getTime() >= cStart.getTime() &&
        selectedMoment.getTime() < cEnd.getTime();

      const remainingMs = cEnd.getTime() - selectedMoment.getTime();
      const hasThirtyMinutesLeft = inSession && remainingMs >= 30 * 60 * 1000;

      return startMatches || hasThirtyMinutesLeft;
    });
  }, [activeTimeSlot, selectedInterests]);

  function toggleInterest(interest: Interest) {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  }

  function handleFindClass() {
    if (filteredCourses.length === 0) {
      setLastPool([]);
      setCurrentCourse(null);
      return;
    }

    setIsFinding(true);
    setLastPool(filteredCourses);

    window.setTimeout(() => {
      const idx = Math.floor(Math.random() * filteredCourses.length);
      setCurrentCourse(filteredCourses[idx]);
      setIsFinding(false);
    }, 350);
  }

  function handleFindAnother() {
    if (!lastPool.length) return;
    if (lastPool.length === 1) {
      setCurrentCourse(lastPool[0]);
      return;
    }
    let next: Course | null = null;
    let attempts = 0;
    while (!next && attempts < 10) {
      const idx = Math.floor(Math.random() * lastPool.length);
      const candidate = lastPool[idx];
      if (!currentCourse || candidate.id !== currentCourse.id) {
        next = candidate;
      }
      attempts += 1;
    }
    if (next) {
      setCurrentCourse(next);
    }
  }

  const hasFilters =
    selectedHour !== nextDefault.hour ||
    selectedMinute !== nextDefault.minute ||
    meridiem !== nextDefault.meridiem ||
    (selectedInterests && selectedInterests.length > 0);

  return (
    <div className="flex flex-col gap-16">
      {/* Hero */}
      <section className="pt-4 pb-6 sm:pt-6 sm:pb-10">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#C4622D]">
          Serendipitous Learning
        </p>
        <div className="mt-4 space-y-2">
          <h2 className="font-serif text-4xl font-semibold tracking-[-0.02em] text-[#003262] sm:text-6xl lg:text-7xl">
            Got a free hour?
          </h2>
          <p className="font-serif text-3xl italic text-[#C4622D] sm:text-4xl lg:text-6xl">
            Wander into a class.
          </p>
        </div>
        <p className="mt-6 max-w-xl text-sm font-mono leading-[1.8] text-[#5a5248]">
          Tell us when you&apos;re free and what sparks your curiosity. We&apos;ll find
          a real Berkeley class happening right now that you can quietly sit in on.
        </p>
      </section>

      {/* Time picker */}
      <section className="space-y-4">
        <p className="text-[0.65rem] font-mono uppercase tracking-[0.2em] text-slate-500">
          01 — When are you free?
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              let hours24 = now.getHours();
              const minutes = now.getMinutes();

              // Round down to :00 if < 20 min past, up to :30 if 20–49, up to next hour if >= 50.
              let roundedMinutes: number;
              if (minutes < 20) {
                roundedMinutes = 0;
              } else if (minutes < 50) {
                roundedMinutes = 30;
              } else {
                roundedMinutes = 0;
                hours24 = (hours24 + 1) % 24;
              }

              let hour12 = hours24 % 12;
              if (hour12 === 0) hour12 = 12;
              setSelectedHour(hour12);
              setSelectedMinute(roundedMinutes);
              setMeridiem(hours24 >= 12 ? "PM" : "AM");
              setTimeMode("now");
            }}
            className={`group relative inline-flex items-center gap-2.5 rounded-full px-6 py-3 text-[0.85rem] font-mono font-semibold transition-all duration-200 ${
              timeMode === "now"
                ? "bg-[#003262] text-[#FDB515] shadow-[0_0_0_3px_rgba(253,181,21,0.25),0_4px_16px_rgba(0,50,98,0.35)]"
                : "bg-white text-[#003262] ring-1 ring-[#D0D0D0] shadow-sm hover:ring-[#003262] hover:shadow-[0_2px_8px_rgba(0,50,98,0.12)]"
            }`}
          >
            <span className="relative flex h-2 w-2 shrink-0">
              <span
                className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  timeMode === "now"
                    ? "animate-ping bg-[#FDB515]"
                    : "bg-[#003262]/30"
                }`}
              />
              <span
                className={`relative inline-flex h-2 w-2 rounded-full ${
                  timeMode === "now" ? "bg-[#FDB515]" : "bg-[#003262]/40"
                }`}
              />
            </span>
            <span>Now</span>
            {timeMode === "now" && (
              <span className="text-[0.72rem] font-normal opacity-75">
                {selectedHour}:{String(selectedMinute).padStart(2, "0")} {meridiem}
              </span>
            )}
          </button>

          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedHour}
              onChange={(e) => {
                setSelectedHour(Number(e.target.value));
                setTimeMode("manual");
              }}
              className="w-20 appearance-none rounded-[6px] border border-[#D0D0D0] bg-white px-4 py-3 text-[0.9rem] font-mono text-[#5a5248] shadow-sm outline-none ring-0 transition-all duration-200 focus:border-[#003262] focus:ring-1 focus:ring-[#003262]"
            >
              {HOUR_OPTIONS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
            <span className="text-xs font-mono text-slate-400">:</span>
            <select
              value={selectedMinute}
              onChange={(e) => {
                setSelectedMinute(Number(e.target.value));
                setTimeMode("manual");
              }}
              className="w-20 appearance-none rounded-[6px] border border-[#D0D0D0] bg-white px-4 py-3 text-[0.9rem] font-mono text-[#5a5248] shadow-sm outline-none ring-0 transition-all duration-200 focus:border-[#003262] focus:ring-1 focus:ring-[#003262]"
            >
              {MINUTE_OPTIONS.map((m) => (
                <option key={m} value={m}>
                  {String(m).padStart(2, "0")}
                </option>
              ))}
            </select>
            <div className="inline-flex rounded-full border border-[#D0D0D0] bg-[#F5F5F5] p-0.5 text-xs transition-all duration-200">
              <button
                type="button"
                onClick={() => {
                  setMeridiem("AM");
                  setTimeMode("manual");
                }}
                className={`px-3 py-1.5 font-mono text-[0.75rem] font-semibold transition-all duration-200 ${
                  meridiem === "AM"
                    ? "rounded-full bg-[#003262] text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                AM
              </button>
              <button
                type="button"
                onClick={() => {
                  setMeridiem("PM");
                  setTimeMode("manual");
                }}
                className={`px-3 py-1.5 font-mono text-[0.75rem] font-semibold transition-all duration-200 ${
                  meridiem === "PM"
                    ? "rounded-full bg-[#003262] text-white"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                PM
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Interests */}
      <section className="space-y-5">
        <p className="text-[11px] font-mono uppercase tracking-[0.2em] text-[#999999]">
          02 — What are you into? (optional)
        </p>
        <div className="flex flex-wrap gap-3">
          {INTEREST_OPTIONS.map((interest) => {
            const active = selectedInterests.includes(interest);
            return (
              <button
                key={interest}
                type="button"
                onClick={() => toggleInterest(interest)}
                className={`min-h-[44px] rounded-[6px] px-6 py-[14px] text-[0.85rem] font-mono uppercase tracking-[0.05em] transition-all duration-200 ${
                  active
                    ? "bg-[#003262] text-white border border-[#003262]"
                    : "bg-white text-[#333333] border border-[#D0D0D0] hover:border-[#999999]"
                }`}
              >
                {interest}
              </button>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mt-10 sm:mt-12">
        <button
          type="button"
          onClick={handleFindClass}
          className="mx-auto flex w-full max-w-sm items-center justify-center gap-3 rounded-[6px] bg-[#003262] px-10 py-4 text-[0.85rem] font-mono font-semibold uppercase tracking-[0.2em] text-[#FDB515] shadow-md transition-transform duration-200 hover:-translate-y-[2px] hover:bg-[#002549] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB515]"
        >
          <span>⚄</span>
          <span>Find me a class</span>
        </button>
      </section>

      {/* Results */}
      <section className="space-y-4">
        {!currentCourse && filteredCourses.length === 0 && (
          <p className="text-xs font-mono text-slate-500">
            No classes match that exact combo yet. Try a different time or fewer
            interests.
          </p>
        )}

        {currentCourse && (
          <div className="relative">
            <div className="group mt-2 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-[#E0E0E0] transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md">
              <div className="border-b border-[#E0E0E0] bg-[#F5F5F5] px-6 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs font-mono uppercase tracking-wide text-slate-500">
                      {currentCourse.department}
                    </p>
                    <h2 className="truncate font-serif text-lg font-semibold text-[#003262] sm:text-xl">
                      {currentCourse.title}
                    </h2>
                  </div>
                  <div className="text-right text-xs font-mono text-slate-500">
                    <p className="text-[11px] text-slate-700">
                      {currentCourse.code}
                    </p>
                    <p className="mt-0.5 text-[11px]">
                      {formatTimeRange(currentCourse.startTime, currentCourse.endTime)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-x-8 gap-y-4 px-6 py-5 text-xs text-slate-700 sm:grid-cols-2">
                <div className="space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wide text-slate-400">
                    Instructor
                  </p>
                  <p className="text-sm text-slate-900">{currentCourse.instructor}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-mono uppercase tracking-wide text-slate-400">
                    Location
                  </p>
                  <p className="text-sm text-slate-900">
                    {currentCourse.building}, room {currentCourse.room}
                  </p>
                  <p className="text-[11px] font-mono text-slate-500">
                    ~{currentCourse.walkingMinutes} min walk from Sather Gate
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-[11px] font-mono uppercase tracking-wide text-slate-400">
                    Description
                  </p>
                  <p className="text-sm leading-relaxed text-slate-800">
                    {currentCourse.description}
                  </p>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <p className="text-[11px] font-mono uppercase tracking-wide text-slate-400">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {currentCourse.interests.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full bg-[#F5F5F5] px-2.5 py-0.5 text-[10px] font-mono uppercase tracking-wide text-slate-700 ring-1 ring-[#E0E0E0]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#E0E0E0] bg-[#F5F5F5] px-6 py-3">
                <button
                  type="button"
                  onClick={() => downloadIcs(currentCourse)}
                  className="inline-flex items-center gap-1 rounded-full bg-[#003262] px-3 py-1.5 text-[11px] font-mono font-semibold text-[#FDB515] shadow-sm transition-colors hover:bg-[#002549] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB515]"
                >
                  Add to Calendar
                </button>
                <button
                  type="button"
                  onClick={handleFindAnother}
                  className="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1.5 text-[11px] font-mono font-semibold text-slate-700 shadow-sm ring-1 ring-[#E0E0E0] transition-colors hover:bg-[#F5F5F5] hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FDB515]"
                >
                  Find Another
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

