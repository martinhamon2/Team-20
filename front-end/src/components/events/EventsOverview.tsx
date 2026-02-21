import eventService from "@/service/EventService";
import { Event } from "@/types";
import { mutate } from "swr";
import { useState } from "react";
import EventCard from "./EventCard";
import sessionService from "@/service/SessionService";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type Props = {
  events: Event[];
};

const EventsOverview: React.FC<Props> = ({ events }) => {
  const [filter, setFilter] = useState<string>("");
  const [filterField, setFilterField] = useState<
    "description" | "type" | "language"
  >("description");
  const searchParams = useSearchParams();
  const typeFilter = searchParams.get("type");
  const getEventType = (event: Event) =>
    event.description ? event.description.split(" ")[0] : "Overige events";

  const handleToggleEventActive = async (eventId: string) => {
    try {
      const response = await eventService.updateEvent(eventId);
      if (response.ok) {
        mutate("events");
      }
    } catch (error) {
      console.error("Error updating event:", error);
    }
  };

  const handleToggleSessionActive = async (sessionId: string) => {
    try {
      const response = await sessionService.updateSession(sessionId);
      if (response.ok) {
        mutate("events");
      }
    } catch (error) {
      console.error("Error updating session:", error);
    }
  };

  const typeFilteredEvents = typeFilter
    ? events.filter((event) => getEventType(event) === typeFilter)
    : events;

  const filteredEvents = filter.trim()
    ? typeFilteredEvents.filter((event) => {
        const value = event[filterField]?.toLowerCase() ?? "";
        const filterTerms = filter
          .toLowerCase()
          .split(" ")
          .filter((term) => term.trim());
        return filterTerms.every((term) => value.includes(term));
      })
    : typeFilteredEvents;

  const eventsByType = filteredEvents.reduce(
    (groups, event) => {
      const type = getEventType(event);

      if (!groups[type]) groups[type] = [];
      groups[type].push(event);

      return groups;
    },
    {} as Record<string, Event[]>,
  );

  const pageTitle = typeFilter ? `${typeFilter}` : "Evenementenbeheer";

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center gap-4">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>

        <Link
          href="/admin/parser"
          className="rounded-lg bg-[#007bb1] px-2 py-1 text-white"
        >
          New XML
        </Link>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-[200px_1fr]">
        <div>
          <label
            htmlFor="filter-field"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Filterveld
          </label>
          <select
            id="filter-field"
            value={filterField}
            onChange={(e) =>
              setFilterField(
                e.target.value as "description" | "type" | "language",
              )
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          >
            <option value="description">Beschrijving</option>
            <option value="type">Type</option>
            <option value="language">Taal</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="filter-input"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Zoekterm
          </label>
          <input
            id="filter-input"
            type="text"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Bijv. 'Workshop' of 'Frans'"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500 focus:outline-none"
          />
        </div>
      </div>

      <div className="space-y-6">
        {Object.keys(eventsByType).map((description) => (
          <div key={description}>
            <div className="space-y-5">
              {eventsByType[description].map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onToggleEventActive={handleToggleEventActive}
                  onToggleSessionActive={handleToggleSessionActive}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredEvents.length === 0 && (
          <div className="rounded-lg border bg-gray-50 py-6 text-center text-sm text-gray-500 italic">
            Geen evenementen gevonden.
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsOverview;
