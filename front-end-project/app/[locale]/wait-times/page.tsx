import { Attraction } from "@types";
import AttractionService from "@services/AttractionService";
import { AttractionManager } from "@components/attractions/AttractionManager";
import AttractionWaitTimesByParkTable from "@components/attractions/AttractionWaitTimesByParkTable";

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

export default async function WaitTimes() {
  const { data, error } = await getData();

  return (
    <main>
      <div>
        <h1 className="pageTitle">Wait Times</h1>
        {error && (
          <div className="text-red-800" role="alert">
            error: {error}
          </div>
        )}
        {!data && <div>No Attractions found</div>}
        {data && <AttractionWaitTimesByParkTable attractions={data} />}
      </div>
    </main>
  );
}