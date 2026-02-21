import { Attraction } from "@types";
import AttractionService from "@services/AttractionService";
import { AttractionManager } from "@components/attractions/AttractionManager";

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

export default async function Attractions() {
  const { data, error } = await getData();

  return (
    <main>
      <div>
        <h1 className="pageTitle">Attractions</h1>
        {error && (
          <div className="text-red-800" role="alert">
            error: {error}
          </div>
        )}
        {!data && <div>No Attractions found</div>}
        {data && <AttractionManager data={data} />}
      </div>
    </main>
  );
}
