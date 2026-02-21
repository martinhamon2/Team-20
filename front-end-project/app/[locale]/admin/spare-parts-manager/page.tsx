import { SparePart, Attraction } from "@types";
import SparePartService from "@services/SparePartService";
import AttractionService from "@services/AttractionService";
import SparePartsManager from "@components/spare-parts/SparePartsManager";

type DataResult = {
  data: {
    spareParts: SparePart[];
    attractions: Attraction[];
  } | null;
  error: string | null;
};

const getData = async (): Promise<DataResult> => {
  try {
    const [spareParts, attractions] = await Promise.all([
      SparePartService.getAllSpareParts(),
      AttractionService.getAllAttractions(),
    ]);

    return {
      data: { spareParts, attractions },
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: (error as Error).message,
    };
  }
};

export default async function SpareParts() {
  const { data, error } = await getData();

  return (
    <main>
      <div>
        <h1 className="pageTitle">Spare Parts Manager</h1>
        {error && (
          <div className="text-red-800" role="alert">
            {error}
          </div>
        )}
        {!data && <div>No data found.</div>}

        {data && (
          <SparePartsManager
            spareParts={data.spareParts}
            attractions={data.attractions}
          />
        )}
      </div>
    </main>
  );
}
