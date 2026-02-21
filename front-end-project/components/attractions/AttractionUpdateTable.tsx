"use client";

import { useState } from "react";
import { Attraction } from "@types";
import AttractionListTable from "@components/attractions/AttractionListTable";
import AdminAttractionOverviewTable from "@components/attractions/AdminAttractionOverviewTable";
import AttractionService from "@services/AttractionService";

type Props = {
  data: Attraction[];
};

const AttractionUpdateTable = ({ data }: Props) => {
  const [attractions, setAttractions] = useState<Attraction[]>(data);
  const [selectedAttraction, setSelectedAttraction] =
    useState<Attraction | null>(null);

  const handleStatusChange = async (id: number) => {
    try {
      const updatedAttraction = await AttractionService.changeAttractionStatus(
        id
      );

      setAttractions((prev) =>
        prev.map((attr) => (attr.id === id ? updatedAttraction : attr))
      );

      if (selectedAttraction && selectedAttraction.id === id) {
        setSelectedAttraction(updatedAttraction);
      }
    } catch (error) {
      console.error(error);
      alert("Failed to change status");
    }
  };

  const handleAttractionUpdate = (updatedAttraction: Attraction) => {
    setAttractions((prev) =>
      prev.map((attr) =>
        attr.id === updatedAttraction.id ? updatedAttraction : attr
      )
    );
    setSelectedAttraction(updatedAttraction);
  };

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section>
          <div className="max-h-[600px]">
            <AttractionListTable
              attractions={attractions}
              selectAttraction={setSelectedAttraction}
            />
          </div>
        </section>

        <section>
          <div className="max-h-[600px]">
            <h3 className="font-semibold mb-2">Update Details</h3>
            {selectedAttraction ? (
              <AdminAttractionOverviewTable
                attraction={selectedAttraction}
                onStatusClick={handleStatusChange}
                onUpdate={handleAttractionUpdate}
              />
            ) : (
              <div className="p-4 text-gray-400 text-center mt-2">
                Select an attraction from the list to view details and change
                status.
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AttractionUpdateTable;
