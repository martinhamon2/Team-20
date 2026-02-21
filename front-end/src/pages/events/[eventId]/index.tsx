import EventDetailComponent from "@/components/events/EventDetailComponent";
import Container from "@/components/layout/Container";
import eventService from "@/service/EventService";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function EventDetailPage() {
  const router = useRouter();
  const { eventId } = router.query;

  const fetcher = async (): Promise<Event> => {
    if (!eventId) throw new Error("Missing ID");
    const response = await eventService.getEventById(eventId as string);
    return await response.json();
  };

  const { data, isLoading, error } = useSWR<Event>(
    eventId ? `eventById-${eventId}` : null,
    fetcher,
  );

  if (error) {
    return (
      <Container>
        <div className="flex h-52 items-center justify-center rounded-lg border-2 border-[#1e3a8a] bg-gray-50 p-6 shadow-sm">
          <div className="mx-auto max-w-[400px] p-4 text-center">
            <h2 className="mb-2 text-xl font-bold text-gray-800">
              Dit evenement is niet gevonden
            </h2>
            <p className="mt-2 text-base leading-relaxed text-gray-600">
              We konden het gezochte evenement niet vinden of is momenteel niet
              beschikbaar.
            </p>
          </div>
        </div>
      </Container>
    );
  }

  if (isLoading) {
    return (
      <Container>
        <div className="flex h-52 items-center justify-center">
          <Loader2 size={32} className="animate-spin" />
          <span className="ml-4">Loading event...</span>
        </div>
      </Container>
    );
  }

  return <Container>{data && <EventDetailComponent event={data} />}</Container>;
}
