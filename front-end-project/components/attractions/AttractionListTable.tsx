import { Attraction } from "@types";
import React from "react";
import { useState } from "react";

type Props = {
  attractions: Array<Attraction>;
  selectAttraction: (attraction: Attraction) => void;
};

const AttractionListTable: React.FC<Props> = ({
  attractions,
  selectAttraction,
}: Props) => {
  const [filterValue, setFilterValue] = useState<string>("");
  const [selectedParkName, setSelectedParkName] = useState<string>("");
  const parksWithDuplicates = attractions.map(
    (attraction) => attraction.park.name
  );
  const parks = [...new Set(parksWithDuplicates)];
  const handleSearch = (input: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(input.target.value);
  };

  const filteredAttractions = React.useMemo(() => {
    let result = attractions;

    if (selectedParkName && selectedParkName !== "all parks") {
      result = result.filter((a) => a.park?.name === selectedParkName);
    }
    if (!filterValue) return result;

    const searchLower = filterValue.toLowerCase();
    return result.filter(
      (attraction) =>
        attraction.name?.toLowerCase().includes(searchLower) ||
        attraction.park?.name?.toLowerCase().includes(searchLower) ||
        attraction.type?.toLowerCase().includes(searchLower)
    );
  }, [attractions, filterValue, selectedParkName]);

  return (
    <>
      <div className="flex items-center gap-1 mb-1">
        <div className="flex items-center gap-2">
          <label htmlFor="filter">search: </label>
          <input
            type="text"
            id="filter"
            className="border border-gray-400 rounded px-1"
            value={filterValue}
            onChange={handleSearch}
          />
        </div>

        <select
          className="bg-gray-300 border border-black rounded px-3 py-1 max-w-[160px] pageSelect"
          onChange={(selected) => setSelectedParkName(selected.target.value)}
          value={selectedParkName || "all parks"}
        >
          <option value="all parks">all parks</option>
          {parks.map((park) => (
            <option value={park} key={park}>
              {park}
            </option>
          ))}
        </select>
      </div>

      <table className="w-full text-left">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Park</th>
          </tr>
        </thead>
        <tbody>
          {filteredAttractions.map((attraction, index) => (
            <tr
              key={index}
              onClick={() => selectAttraction(attraction)}
              role="button"
              className="hover:bg-gray-200 cursor-pointer"
            >
              <td>{attraction.name ?? ""}</td>
              <td>{attraction.type ?? ""}</td>
              <td>{attraction.park?.name ?? ""}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default AttractionListTable;
