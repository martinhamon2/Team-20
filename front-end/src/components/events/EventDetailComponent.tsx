"use client";

import type { Event, Session } from "@/types";
import {
  CalendarIcon,
  Clock,
  Users,
  MapPin,
  Filter,
  X,
  MessageSquare,
  LayoutGrid,
  ListIcon,
  AlertCircle,
  Globe,
  Tag,
} from "lucide-react";
import { useEffect, useState, useMemo } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import ChatRegistrationPanel from "../registration/ChatRegistrationPanel";
import { useTranslation } from "react-i18next";
import React from "react"; // Ensure React is imported

interface Props {
  event: Event;
}

interface SessionFilters {
  description: string;
  type: string;
  location: string;
  beginDate: string;
}

export default function EventDetailComponent({ event }: Props) {
  const { t } = useTranslation();
  const sessions = useMemo(
    () => [...(event.sessions?.filter((s) => s.sessionSetting?.active) ?? [])],
    [event.sessions],
  );
  const [checkedSessions, setCheckedSessions] = useState<Session[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showChatPanel, setShowChatPanel] = useState(false);

  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");
  const [filters, setFilters] = useState<SessionFilters>({
    description: "",
    type: "",
    location: "",
    beginDate: "",
  });

  useEffect(() => {
    // Als de timer niet loopt (null), doe niets
    if (timeLeft === null) return;

    if (timeLeft === 0) {
      setShowChatPanel(false); // Sluit het paneel
      setCheckedSessions([]); // Wis de geselecteerde sessies (registratie stopt)
      setTimeLeft(null); // Reset timer
      return;
    }

    // Timer aftellen
    const intervalId = setInterval(() => {
      setTimeLeft((prevTime) => (prevTime !== null ? prevTime - 1 : null));
    }, 1000);

    // Cleanup bij unmount of re-render
    return () => clearInterval(intervalId);
  }, [timeLeft, t]);

  // Functie om registratie te starten (opent paneel + start timer)
  const handleStartRegistration = () => {
    setTimeLeft(600); // Start timer op 60 seconden
    setShowChatPanel(true);
  };

  const handleCloseRegistrationPanel = () => {
    setShowChatPanel(false);
    setTimeLeft(null);
  };

  const handleFilterChange = (field: keyof SessionFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const sortedSessions = useMemo(() => {
    const sessionsToSort = [...sessions];
    const settings = event.eventSetting;
    if (!settings) return sessionsToSort;

    // Sorting logic
    if (settings?.sortField) {
      sessionsToSort.sort((a, b) => {
        let valueA: string | number = "";
        let valueB: string | number = "";
        const sortField = settings.sortField?.toUpperCase();

        switch (sortField) {
          case "TYPE":
            valueA = a.type || "";
            valueB = b.type || "";
            break;
          case "CATEGORY":
            valueA = a.category || "";
            valueB = b.category || "";
            break;
          case "BEGINDATE":
            valueA = a.beginDate ? new Date(a.beginDate).getTime() : 0;
            valueB = b.beginDate ? new Date(b.beginDate).getTime() : 0;
            break;
          case "BEGINTIME":
            valueA = a.beginTime || "00:00";
            valueB = b.beginTime || "00:00";
            break;
          case "LOCATION":
            valueA = a.location || "";
            valueB = b.location || "";
            break;
          case "MAX_CAPACITY":
            valueA = a.maxCapacity ?? 0;
            valueB = b.maxCapacity ?? 0;
            break;
        }

        const order = settings.sortOrder?.toUpperCase() === "DESC" ? -1 : 1;
        if (typeof valueA === "string" && typeof valueB === "string") {
          return valueA.localeCompare(valueB) * order;
        }
        if (typeof valueA === "number" && typeof valueB === "number") {
          return (valueA - valueB) * order;
        }
        return 0;
      });
    }

    const now = new Date().getTime();
    sessionsToSort.sort((a, b) => {
      let aScore = 0;
      let bScore = 0;
      if (settings.moveFullToBack) {
        const aFull =
          a.maxCapacity &&
          a.maxCapacity > 0 &&
          (a.registrations?.length ?? 0) >= a.maxCapacity;
        const bFull =
          b.maxCapacity &&
          b.maxCapacity > 0 &&
          (b.registrations?.length ?? 0) >= b.maxCapacity;
        if (aFull) aScore++;
        if (bFull) bScore++;
      }
      if (settings.movePastToBack) {
        const aPast = a.endDate && new Date(a.endDate).getTime() < now;
        const bPast = b.endDate && new Date(b.endDate).getTime() < now;
        if (aPast) aScore += 2;
        if (bPast) bScore += 2;
      }
      return aScore - bScore;
    });

    return sessionsToSort;
  }, [event.eventSetting, sessions]);

  const filteredSessions = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(
      ([, value]) => value.trim() !== "",
    );
    if (activeFilters.length === 0) return sortedSessions;

    return sortedSessions.filter((session) => {
      return activeFilters.every(([key, value]) => {
        const filterValue = value.toLowerCase().trim();

        switch (key as keyof SessionFilters) {
          case "type":
            return session.type?.toLowerCase().includes(filterValue) ?? false;

          case "location":
            return (
              session.location?.toLowerCase().includes(filterValue) ?? false
            );

          case "beginDate": {
            if (!session.beginDate || !session.endDate) return false;

            const selected = new Date(value);
            const start = new Date(session.beginDate);
            const end = new Date(session.endDate);

            const startOfSelected = new Date(selected.setHours(0, 0, 0, 0));
            const endOfSelected = new Date(selected.setHours(23, 59, 59, 999));

            return start <= endOfSelected && end >= startOfSelected;
          }

          default:
            return true;
        }
      });
    });
  }, [sortedSessions, filters]);

  const toDateTime = (session: Session) => {
    if (!session.beginDate) return { start: null, end: null };
    const start = new Date(session.beginDate);
    if (session.beginTime) {
      const [h, m] = session.beginTime.split(":").map(Number);
      start.setHours(h ?? 0, m ?? 0, 0, 0);
    }
    const end = new Date(session.endDate ?? session.beginDate);
    if (session.endTime) {
      const [h2, m2] = session.endTime.split(":").map(Number);
      end.setHours(h2 ?? 0, m2 ?? 0, 0, 0);
    } else if (session.beginTime) {
      end.setTime(start.getTime() + 60 * 60 * 1000);
    }
    return { start, end };
  };

  // Helper to check overlap status during render
  const isOverlapping = (session: Session) => {
    // If validation is off, never return true
    if (!event.eventSetting?.validateOverlapping) return false;

    // If it's already selected, it's not "overlapping" (it IS the selection)
    if (checkedSessions.some((s) => s.id === session.id)) return false;

    const timeSession = toDateTime(session);
    if (!timeSession.start || !timeSession.end) return false;

    return checkedSessions.some((otherSession) => {
      const otherTime = toDateTime(otherSession);
      if (!otherTime.start || !otherTime.end) return false;
      return (
        timeSession.start! < otherTime.end! &&
        otherTime.start! < timeSession.end!
      );
    });
  };

  const changeChecked = (session: Session) => {
    // Determine overlapping status again to be safe
    const overlapping = isOverlapping(session);
    if (overlapping && event.eventSetting?.validateOverlapping) {
      // Logic handled in UI, but safety check here
      return;
    }

    const alreadyChecked = checkedSessions.some((s) => s.id === session.id);
    if (alreadyChecked) {
      setCheckedSessions(checkedSessions.filter((s) => s.id !== session.id));
      return;
    }

    const max = session.maxCapacity ?? 0;
    const regs = session.registrations?.length ?? 0;
    if (max > 0 && regs >= max) {
      alert(t("session.alert.full"));
      return;
    }

    setCheckedSessions([...checkedSessions, session]);
  };

  const handleClearCheckedSessions = () => {
    setCheckedSessions([]);
  };

  useEffect(() => {
    sessionStorage.setItem("selectedSessions", JSON.stringify(checkedSessions));
  }, [checkedSessions]);

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-12 px-4 py-8">
        {/* New "Ticket-Style" Header */}
        <div className="overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* 🎯 FIX 1: Left Column: Secondary Color (Uses inline style) */}
            <div
              style={{
                backgroundColor:
                  event.eventSetting?.secondaryColor || undefined,
              }}
              className={`${
                event.eventSetting?.secondaryColor ? "" : "bg-secondary"
              } flex flex-col justify-center p-8 lg:col-span-2 lg:p-12`}
            >
              <div className="mb-6 flex flex-wrap gap-3">
                {event.type && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-[#007bb1]">
                    <Tag className="h-3.5 w-3.5" />
                    {event.type}
                  </span>
                )}
                {event.language && (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-700">
                    <Globe className="h-3.5 w-3.5" />
                    {event.language === "N"
                      ? t("event.language.dutch")
                      : event.language === "E"
                        ? t("event.language.english")
                        : event.language}
                  </span>
                )}
              </div>

              <h1 className="text-4xl font-extrabold text-white! sm:text-5xl">
                {event.description}
              </h1>
            </div>

            {/* 🎯 FIX 2: Right Column: Primary Color (Uses inline style) */}
            <div
              style={{
                backgroundColor: event.eventSetting?.primaryColor || undefined,
              }}
              className={`${
                event.eventSetting?.primaryColor ? "" : "bg-primary"
              } flex flex-col justify-center gap-8 p-8 text-white lg:p-12`}
            >
              {event.beginDate && event.endDate && (
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                    <CalendarIcon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium tracking-wide text-blue-100 uppercase">
                      {t("event.details.when")}
                    </p>
                    <p className="text-lg font-bold">
                      {new Date(event.beginDate).toLocaleDateString(
                        t("general.locale"),
                      )}
                      {event.beginDate !== event.endDate && (
                        <>
                          <span className="mx-2 opacity-70">-</span>
                          {new Date(event.endDate).toLocaleDateString(
                            t("general.locale"),
                          )}
                        </>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {sortedSessions.length > 0 && (
                <div className="flex items-start gap-4">
                  <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
                    <Users className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-medium tracking-wide text-blue-100 uppercase">
                      {t("event.details.sessionAmount")}
                    </p>
                    <p className="text-lg font-bold">
                      {sortedSessions.length}{" "}
                      {t("event.details.sessionCount", {
                        count: sortedSessions.length,
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sessions */}
        <section className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-3xl font-bold text-blue-900">
              {t("event.sessions.title")}
            </h2>

            <div className="flex items-center gap-2">
              <div className="flex overflow-hidden rounded-lg border border-gray-300 bg-white text-sm">
                <button
                  type="button"
                  onClick={() => setViewMode("cards")}
                  className={`flex items-center gap-1 px-3 py-1.5 transition-colors ${
                    viewMode === "cards"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-pressed={viewMode === "cards"}
                  aria-label={t("event.sessions.viewMode.cards")}
                >
                  <LayoutGrid size={16} />
                  {t("event.sessions.viewMode.cardsLabel")}
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className={`flex items-center gap-1 border-l px-3 py-1.5 transition-colors ${
                    viewMode === "list"
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                  aria-pressed={viewMode === "list"}
                  aria-label={t("event.sessions.viewMode.list")}
                >
                  <ListIcon size={16} />
                  {t("event.sessions.viewMode.listLabel")}
                </button>
              </div>

              <button
                onClick={() => setShowFilterModal(true)}
                className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                aria-label={t("event.sessions.filterButton")}
              >
                <Filter size={16} />
                {t("event.sessions.filterLabel")}
              </button>
            </div>
          </div>

          {filteredSessions.length > 0 ? (
            viewMode === "cards" ? (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredSessions.map((session) => {
                  const isFull =
                    session.maxCapacity &&
                    session.maxCapacity > 0 &&
                    (session.registrations?.length ?? 0) >= session.maxCapacity;

                  const isChecked = checkedSessions.some(
                    (s) => s.id === session.id,
                  );
                  const overlap = isOverlapping(session);

                  // Determine card state
                  let cardStateClass = "cursor-pointer bg-white";
                  if (isFull) cardStateClass = "cursor-not-allowed bg-gray-50";
                  else if (overlap)
                    cardStateClass =
                      "cursor-not-allowed bg-gray-50 opacity-60 grayscale-[0.8]";
                  else if (isChecked)
                    cardStateClass =
                      "border-blue-500 ring-1 ring-blue-500 bg-blue-50";

                  return (
                    <div
                      key={session.id}
                      className={`flex h-full flex-col justify-between rounded-2xl border border-gray-200 p-6 shadow-lg transition hover:shadow-xl ${cardStateClass}`}
                      onClick={() =>
                        !overlap && !isFull && changeChecked(session)
                      }
                    >
                      <div className="flex flex-1 flex-col space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <h3 className="text-xl font-bold wrap-break-word">
                            {session.type}
                          </h3>
                          <div className="shrink-0">
                            {isFull ? (
                              <span className="rounded-full bg-red-500 px-4 py-1 text-xs font-semibold whitespace-nowrap text-white shadow">
                                {t("session.status.full")}
                              </span>
                            ) : overlap ? (
                              <span className="flex items-center gap-1 rounded-full bg-orange-500 px-3 py-1 text-xs font-semibold whitespace-nowrap text-white shadow">
                                <AlertCircle size={12} />
                                {t("session.status.overlap")}
                              </span>
                            ) : (
                              <span className="rounded-full bg-[#00b0e0] px-4 py-0.5 text-xs font-semibold whitespace-nowrap text-white shadow">
                                {t("session.status.open")}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 border-t border-gray-100 pt-4 text-sm text-gray-600">
                        {session.beginDate && session.endDate && (
                          <p className="flex items-center space-x-2">
                            <CalendarIcon className="h-4 w-4 shrink-0 text-[#00b0e0]" />
                            <span>
                              {new Date(session.beginDate).toLocaleDateString(
                                t("general.locale"),
                              )}{" "}
                              –{" "}
                              {new Date(session.endDate).toLocaleDateString(
                                t("general.locale"),
                              )}
                            </span>
                          </p>
                        )}
                        {session.beginTime && session.endTime && (
                          <p className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 shrink-0 text-[#00b0e0]" />
                            <span>
                              {session.beginTime} - {session.endTime}
                            </span>
                          </p>
                        )}
                        {session.location && (
                          <p className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 shrink-0 text-[#00b0e0]" />
                            <span>{session.location}</span>
                          </p>
                        )}
                        {session.maxCapacity !== undefined && (
                          <p className="flex items-center space-x-2">
                            <Users className="h-4 w-4 shrink-0 text-[#00b0e0]" />
                            <span>
                              {t("session.cardDetails.maxCapacity", {
                                count: session.maxCapacity,
                              })}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-white shadow">
                <div className="hidden grid-cols-[1fr_auto_auto_auto_auto] gap-4 border-b bg-gray-50 px-4 py-3 text-xs font-semibold text-gray-600 md:grid">
                  <div>{t("event.sessions.listHeader.title")}</div>
                  <div>{t("event.sessions.listHeader.date")}</div>
                  <div>{t("event.sessions.listHeader.time")}</div>
                  <div>{t("event.sessions.listHeader.location")}</div>
                  <div>{t("event.sessions.listHeader.status")}</div>
                </div>
                <ul className="divide-y">
                  {filteredSessions.map((session) => {
                    const isFull =
                      !!session.maxCapacity &&
                      session.maxCapacity > 0 &&
                      (session.registrations?.length ?? 0) >=
                        session.maxCapacity;
                    const isChecked = checkedSessions.some(
                      (s) => s.id === session.id,
                    );
                    const overlap = isOverlapping(session);

                    let itemClass = "bg-white hover:bg-blue-200 cursor-pointer";
                    if (isChecked) itemClass = "bg-blue-200";
                    else if (isFull)
                      itemClass = "bg-gray-50 cursor-not-allowed opacity-75";
                    else if (overlap)
                      itemClass = "bg-gray-50 cursor-not-allowed opacity-60";

                    return (
                      <li
                        key={session.id}
                        onClick={() =>
                          !overlap && !isFull && changeChecked(session)
                        }
                        className={`grid grid-cols-1 gap-2 px-4 py-3 transition md:grid-cols-[1fr_auto_auto_auto_auto] ${itemClass}`}
                      >
                        <div className="font-medium">{session.type}</div>
                        <div className="text-sm text-gray-600 md:text-right">
                          {session.beginDate && session.endDate
                            ? `${new Date(session.beginDate).toLocaleDateString(t("general.locale"))} - ${new Date(session.endDate).toLocaleDateString(t("general.locale"))}`
                            : "-"}
                        </div>
                        <div className="text-sm text-gray-600 md:text-right">
                          {session.beginTime && session.endTime
                            ? `${session.beginTime} - ${session.endTime}`
                            : "-"}
                        </div>
                        <div className="text-sm text-gray-600 md:text-right">
                          {session.location ?? "-"}
                        </div>
                        <div className="md:text-right">
                          {isFull ? (
                            <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-semibold text-white">
                              {t("session.status.full")}
                            </span>
                          ) : overlap ? (
                            <span className="rounded-full bg-orange-500 px-3 py-0.5 text-xs font-semibold text-white">
                              {t("session.status.overlap")}
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#00b0e0] px-3 py-0.5 text-xs font-semibold text-white">
                              {t("session.status.open")}
                            </span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )
          ) : (
            <div className="rounded-lg border bg-gray-50 py-6 text-center text-sm text-gray-500 italic">
              {t("event.sessions.noSessionsFound")}
            </div>
          )}
        </section>

        {/* Filter Modal */}
        {showFilterModal && (
          <div
            className="fixed inset-0 z-50 m-0! flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowFilterModal(false)}
          >
            <div
              className="relative w-full max-w-lg rounded-xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter size={24} className="text-[#007bb1]" />
                  <h2 className="text-xl font-semibold text-gray-800">
                    {t("event.filterModal.title")}
                  </h2>
                </div>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
                  aria-label={t("general.close")}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="filter-description"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("event.filterModal.label.title")}
                  </label>
                  <input
                    id="filter-description"
                    type="text"
                    value={filters.type}
                    onChange={(e) => handleFilterChange("type", e.target.value)}
                    placeholder={t("event.filterModal.placeholder.title")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="filter-location"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("event.filterModal.label.location")}
                  </label>
                  <input
                    id="filter-location"
                    type="text"
                    value={filters.location}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    placeholder={t("event.filterModal.placeholder.location")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label
                    htmlFor="filter-beginDate"
                    className="mb-1 block text-sm font-medium text-gray-700"
                  >
                    {t("event.filterModal.label.date")}
                  </label>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start bg-transparent text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                        {filters.beginDate
                          ? format(new Date(filters.beginDate), "dd/MM/yyyy")
                          : t("event.filterModal.placeholder.selectDate")}
                      </Button>
                    </PopoverTrigger>

                    <PopoverContent align="start" className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={
                          filters.beginDate
                            ? new Date(filters.beginDate)
                            : undefined
                        }
                        onSelect={(date) =>
                          handleFilterChange(
                            "beginDate",
                            date ? date.toISOString() : "",
                          )
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setFilters({
                      description: "",
                      type: "",
                      location: "",
                      beginDate: "",
                    });
                  }}
                  className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
                >
                  {t("event.filterModal.button.reset")}
                </button>
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="cursor-pointer rounded-lg bg-[#007bb1] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#007bb1]/90"
                >
                  {t("event.filterModal.button.apply")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {checkedSessions.length > 0 && (
        <button
          onClick={handleStartRegistration}
          className="group hover:shadow-3xl animate-in fade-in slide-in-from-bottom-5 bg-secondary fixed right-6 bottom-6 flex cursor-pointer items-center gap-3 rounded-full px-6 py-4 text-white shadow-2xl transition-all hover:scale-105 sm:right-10 sm:bottom-10"
          aria-label={t("event.registrationFloatingButton.ariaLabel")}
        >
          <div className="relative">
            <MessageSquare className="h-7 w-7" />
            <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white shadow-lg ring-2 ring-white">
              {checkedSessions.length}
            </span>
          </div>
          <div className="flex flex-col items-start">
            <span className="text-sm font-semibold">
              {checkedSessions.length}{" "}
              {t("event.registrationFloatingButton.sessionCount", {
                count: checkedSessions.length,
              })}
            </span>
            <span className="text-xs font-medium opacity-90">
              {t("event.registrationFloatingButton.clickToRegister")}
            </span>
            {/* OPTIONEEL: Toon de timer in de knop als deze actief is */}
            {timeLeft !== null && (
              <span className="text-xs font-bold text-yellow-300">
                {timeLeft}s
              </span>
            )}
          </div>
        </button>
      )}

      <ChatRegistrationPanel
        event={event}
        isOpen={showChatPanel}
        onClose={handleCloseRegistrationPanel}
        selectedSessions={checkedSessions}
        onClearSessions={handleClearCheckedSessions}
        timeLeft={timeLeft}
      />
    </>
  );
}
