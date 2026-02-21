import AttendanceComponent from "@/components/attendance/attendanceComponent";
import Container from "@/components/layout/Container";
import eventService from "@/service/EventService";
import useSWR from "swr";

export default function AttendancePage() {
  const fetcher = async () => {
    const response = await eventService.getAllEvents();
    if (!response.ok) return null;
    return await response.json();
  };

  const { data, isLoading, error } = useSWR("events", fetcher);

  if (error) {
    return (
      <div className="mt-3 flex items-center rounded-none border border-red-200 bg-red-50 p-2 text-sm font-medium text-red-600">
        <span className="mr-2">🚫</span>
        <span>
          Could not load any sessions. Please check your connection or create
          events.
        </span>
      </div>
    );
  }

  return (
    <Container>
      {isLoading && <p>Loading...</p>}
      {data && <AttendanceComponent events={data} />}
    </Container>
  );
}
