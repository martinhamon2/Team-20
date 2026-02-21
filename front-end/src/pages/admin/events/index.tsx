import EventOverview from "@/components/events/EventsOverview";
import Container from "@/components/layout/Container";
import { useAuth } from "@/contexts/AuthContext";
import eventService from "@/service/EventService";
import { Event, Role } from "@/types";
import useSWR from "swr";

export default function AdminPanel() {
  const { user } = useAuth();

  const fetcher = async (): Promise<Event[]> => {
    const response = await eventService.getAllEvents();
    return await response.json();
  };

  const { data, isLoading, error } = useSWR<Event[]>("events", fetcher);

  if (!user || user.role !== Role.ADMIN) {
    return (
      <Container className="flex h-[50vh] items-center justify-center">
        <p>You are not authorized</p>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <div>Error loading events: {error.message}</div>
      </Container>
    );
  }

  return (
    <Container>{!isLoading && <EventOverview events={data || []} />}</Container>
  );
}
