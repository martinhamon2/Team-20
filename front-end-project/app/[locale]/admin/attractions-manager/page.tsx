import { Attraction } from "@types";
import AttractionService from "@services/AttractionService";
import AttractionUpdateTable from "@components/attractions/AttractionUpdateTable";

type DataResult = {
  data: Attraction[] | null;
  error: string | null;
};

const getData = async (): Promise<DataResult> => {
  try {
    const attractions = await AttractionService.getAllAttractions();
    return { data: attractions, error: null };
  } catch (error) {
    return { data: null, error: (error as Error).message };
  }
};

export default async function AdminAttractionsPage() {
  const { data, error } = await getData();

  return (
    <main>
      <div>
        <h1 className="pageTitle">Admin Attractions Manager</h1>

        {error && (
          <div
            className="text-red-800 bg-red-100 p-3 rounded mb-4"
            role="alert"
          >
            Error: {error}
          </div>
        )}

        {!data && <div>No Attractions found</div>}
        {data && <AttractionUpdateTable data={data} />}
      </div>
    </main>
  );
}
