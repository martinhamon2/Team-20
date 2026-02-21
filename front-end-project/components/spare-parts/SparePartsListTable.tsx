"use client";

import { Attraction, SparePart } from "@types";
import React, { useState } from "react";

type Props = {
  spareParts: Array<SparePart>;
  selectedAttraction: Attraction | null;
  onSparePartToggle: (sparePart: SparePart, isChecked: boolean) => void;
};

export const SparePartsListTable: React.FC<Props> = ({
  spareParts,
  selectedAttraction,
  onSparePartToggle,
}: Props) => {
  const [filterValue, setFilterValue] = useState<string>("");

  const handleSearch = (input: React.ChangeEvent<HTMLInputElement>) => {
    setFilterValue(input.target.value);
  };

  const filteredSpareParts = React.useMemo(() => {
    if (!filterValue) return spareParts;

    const searchLower = filterValue.toLowerCase();
    return spareParts.filter(
      (sparePart) =>
        sparePart.name?.toLowerCase().includes(searchLower) ||
        sparePart.type?.toLowerCase().includes(searchLower)
    );
  }, [spareParts, filterValue]);

  const assignedSparePartIds = React.useMemo(() => {
    if (!selectedAttraction || !selectedAttraction.spareParts) {
      return new Set<number>();
    }
    return new Set(selectedAttraction.spareParts.map((sp) => sp.id));
  }, [selectedAttraction]);
  return (
    <div>
      <div>
        <label htmlFor="filter">search: </label>
        <input
          type="text"
          id="filter"
          className="mb-2"
          value={filterValue}
          onChange={handleSearch}
        />
      </div>
      <table>
        <thead>
          <tr>
             {selectedAttraction && <th>Assigned</th>}
            <th>Name</th>
            <th>Type</th>
          </tr>
        </thead>
        <tbody>
          {filteredSpareParts.map((part, index) => {
            const isChecked = assignedSparePartIds.has(part.id);

            return (
              <tr key={part.id ?? `spare-part-${index}`}>
                {selectedAttraction && (
                  <td>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={(e) =>
                        onSparePartToggle(part, e.target.checked)
                      }
                    />
                  </td>
                )}
                <td>{part.name}</td>
                <td>{part.type}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default SparePartsListTable;
