import CancelComponent from "@/components/registration/CancelComponent";
import RegistrationService from "@/service/RegistrationService";
import { Session } from "@/types";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "next/router";
import useSWR from "swr";

export default function Cancel() {
  const router = useRouter();
  const { token } = router.query;

  const decodeToken = () => {
    if (!token || typeof token !== "string") return null;
    try {
      return jwtDecode<{ sub: string }>(token);
    } catch (err) {
      console.error("Invalid token", err);
      return null;
    }
  };

  const decoded = decodeToken();
  const email = decoded?.sub;

  const fetcher = async () => {
    if (!email) throw new Error("Missing email");
    const response = await RegistrationService.getRegistrationsByEmail(email);
    return response.json();
  };

  const { data, error, isLoading } = useSWR<Session[]>(
    email ? `registration-${email}` : null,
    fetcher,
  );

  if (!email) return <p>Loading...</p>;
  if (error) return <p>Error loading registrations</p>;
  if (isLoading) return <p>Loading registrations...</p>;

  return (
    <>
      {data && token && (
        <CancelComponent sessions={data} token={token as string} />
      )}
    </>
  );
}
