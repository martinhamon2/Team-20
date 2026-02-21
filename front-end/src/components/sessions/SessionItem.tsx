import { Session, Event } from "@/types";
import { CalendarIcon, Clock, MapPin, Users, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { useTranslation } from "react-i18next";

interface Props {
  session: Session;
  cancellingSessionId: string | null;
  onCancel: (sessionId: string) => void;
  getEvent: (sessionId: string) => Promise<Event>;
}

export default function SessionItem({
  session,
  cancellingSessionId,
  onCancel,
  getEvent,
}: Props) {
  const { t } = useTranslation();
  const [event, setEvent] = useState<Event | null>(null);

  useEffect(() => {
    let isMounted = true;
    if (session.id) {
      getEvent(session.id)
        .then((evt) => {
          if (isMounted) setEvent(evt);
        })
        .catch(() => {
          if (isMounted) setEvent(null);
        });
    }
    return () => {
      isMounted = false;
    };
  }, [session.id, getEvent]);

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-bold text-blue-900">
            {session.description}
          </h3>
          {session.maxCapacity === undefined ||
          session.maxCapacity === 0 ||
          (session.registrations?.length ?? 0) < session.maxCapacity ? (
            <span className="rounded-full bg-[#00b0e0] px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
              {t("session.status.open")}
            </span>
          ) : (
            <span className="rounded-full bg-red-500 px-3 py-0.5 text-xs font-semibold text-white shadow-sm">
              {t("session.status.full")}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-600 capitalize">{session.type}</p>
        {session.category && (
          <p className="text-xs text-gray-500">{session.category}</p>
        )}

        <div className="space-y-1.5 text-sm text-gray-600">
          {session.beginDate && session.endDate && (
            <p className="flex items-center gap-2">
              <CalendarIcon className="h-3.5 w-3.5" />
              <span className="text-xs">
                {new Date(session.beginDate).toLocaleDateString(
                  t("general.locale"),
                )}{" "}
                -{" "}
                {new Date(session.endDate).toLocaleDateString(
                  t("general.locale"),
                )}
              </span>
            </p>
          )}
          {session.beginTime && session.endTime && (
            <p className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" />
              <span className="text-xs">
                {session.beginTime} - {session.endTime}
              </span>
            </p>
          )}
          {session.location && (
            <p className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{session.location}</span>
            </p>
          )}
          {session.maxCapacity !== undefined && (
            <p className="flex items-center gap-2">
              <Users className="h-3.5 w-3.5" />
              <span className="text-xs">
                {t("session.participants", {
                  registered: session.registrations?.length ?? 0,
                  max: session.maxCapacity,
                })}
              </span>
            </p>
          )}
        </div>
      </div>

      <div className="mt-3 border-t border-gray-100 pt-3">
        {event === null ? (
          <p className="text-sm text-gray-500">
            {t("session.eventDetailsLoading")}
          </p>
        ) : event?.eventSetting?.canUnsubscribe ? (
          <Button
            onClick={() => onCancel(session.id as string)}
            disabled={cancellingSessionId === session.id}
            variant="destructive"
            size="sm"
            className="w-full"
          >
            {cancellingSessionId === session.id ? (
              <>
                <span className="mr-2 animate-spin">⏳</span>
                {t("session.cancelButton.cancelling")}
              </>
            ) : (
              <>
                <X className="mr-2 h-3.5 w-3.5" />
                {t("session.cancelButton.cancelRegistration")}
              </>
            )}
          </Button>
        ) : (
          <p className="text-sm text-gray-500">
            {t("session.cancelButton.notPossible")}
          </p>
        )}
      </div>
    </div>
  );
}
