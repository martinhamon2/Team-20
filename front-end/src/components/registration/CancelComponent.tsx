"use client";

import type { Event, Session } from "@/types";
import { CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import RegistrationService from "@/service/RegistrationService";
import eventService from "@/service/EventService";
import SessionItem from "../sessions/SessionItem";

interface Props {
  sessions: Session[];
  token: string;
}

export default function CancelComponent({ sessions, token }: Props) {
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(
    null,
  );

  const getEventBySessionId = async (sessionId: string): Promise<Event> => {
    try {
      const response = await eventService.getEventBySessionId(sessionId);

      if (response && response.ok) {
        return response.json();
      } else {
        throw new Error("Error fetching event by sessionId");
      }
    } catch (err: unknown) {
      const errorMessage =
        err && typeof err === "object" && "message" in err
          ? (err as { message: string }).message
          : String(err);
      throw new Error("Error fetching event by sessionId: " + errorMessage);
    }
  };

  const safeSessions = useMemo(() => sessions || [], [sessions]);

  const sessionsByDay = useMemo(() => {
    const grouped = new Map<string, Session[]>();

    safeSessions.forEach((session) => {
      if (!session.beginDate) return;

      const dateKey = new Date(session.beginDate).toLocaleDateString("nl-NL", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(session);
    });

    grouped.forEach((daySessions) => {
      daySessions.sort((a, b) => {
        if (!a.beginTime || !b.beginTime) return 0;
        return a.beginTime.localeCompare(b.beginTime);
      });
    });

    return Array.from(grouped.entries()).sort((a, b) => {
      const dateA = safeSessions.find(
        (s) =>
          new Date(s.beginDate || "").toLocaleDateString("nl-NL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) === a[0],
      )?.beginDate;
      const dateB = safeSessions.find(
        (s) =>
          new Date(s.beginDate || "").toLocaleDateString("nl-NL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          }) === b[0],
      )?.beginDate;

      if (!dateA || !dateB) return 0;
      return new Date(dateA).getTime() - new Date(dateB).getTime();
    });
  }, [safeSessions]);

  const handleCancelSession = async (sessionId: string) => {
    setCancellingSessionId(sessionId);

    try {
      console.log("Cancelling session:", sessionId);

      await RegistrationService.cancelRegistration(token, sessionId);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Successvol uitgeschreven");
    } catch (error) {
      console.error("Error cancelling registration:", error);
      alert("Er is een fout opgetreden bij het annuleren.");
    } finally {
      setCancellingSessionId(null);
    }
  };

  if (safeSessions.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-12 text-center">
          <p className="text-lg text-gray-600">
            Je bent momenteel niet geregistreerd voor sessies.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-blue-900">Mijn Registraties</h1>
        <p className="text-sm text-gray-600">
          Je bent geregistreerd voor {safeSessions.length} sessie
          {safeSessions.length !== 1 ? "s" : ""}
        </p>
      </div>

      {sessionsByDay.map(([day, daySessions]) => (
        <section key={day} className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-[#007bb1]" />
            <h2 className="text-xl font-semibold text-blue-900 capitalize">
              {day}
            </h2>
            <span className="rounded-full bg-[#00b0e0] px-2.5 py-0.5 text-xs font-semibold text-white">
              {daySessions.length} sessie{daySessions.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-3">
            {daySessions.map((session) => (
              <SessionItem
                key={session.id}
                session={session}
                cancellingSessionId={cancellingSessionId}
                onCancel={handleCancelSession}
                getEvent={getEventBySessionId}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
