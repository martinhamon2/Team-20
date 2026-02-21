"use client";

import { SparePart, Attraction } from "@types";
import React, { useState } from "react";
import SparePartManagerAttractionListTable from "@components/attractions/AttractionListTable";
import SparePartsListTable from "@components/spare-parts/SparePartsListTable";
import AttractionService from "@services/AttractionService";

type Props = {
  spareParts: SparePart[];
  attractions: Attraction[];
};

export const SparePartsManager: React.FC<Props> = ({
  spareParts,
  attractions: initialAttractions,
}) => {
  const [attractions, setAttractions] =
    useState<Attraction[]>(initialAttractions);
  const [selectedAttraction, setSelectedAttraction] =
    useState<Attraction | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSparePartToggle = async (
    sparePart: SparePart,
    isAssigned: boolean
  ) => {
    if (!selectedAttraction) return;

    setIsLoading(true);
    setError(null);

    let updatedSpareParts: SparePart[];

    if (isAssigned) {
      updatedSpareParts = [
        ...(selectedAttraction.spareParts || []).filter(
          (sp) => sp.id !== sparePart.id
        ),
        sparePart,
      ];
    } else {
      updatedSpareParts = (selectedAttraction.spareParts || []).filter(
        (sp) => sp.id !== sparePart.id
      );
    }

    const updatedAttraction = {
      ...selectedAttraction,
      spareParts: updatedSpareParts,
    };

    try {
      if (isAssigned) {
        await AttractionService.addSparePartToAttraction(
          selectedAttraction.id,
          sparePart.id
        );
      } else {
        await AttractionService.removeSparePartFromAttraction(
          selectedAttraction.id,
          sparePart.id
        );
      }

      setSelectedAttraction(updatedAttraction);

      setAttractions(
        attractions.map((attr) =>
          attr.id === updatedAttraction.id ? updatedAttraction : attr
        )
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-[1.5rem] mb-2">
        {isLoading && (
          <div className="text-blue-600 font-semibold">Updating...</div>
        )}
        {error && (
          <div className="text-red-800 font-semibold" role="alert">
            {error}
          </div>
        )}
      </div>

      <div className="flex flex-row gap-8 mt-4">
        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Attractions</h2>
          <SparePartManagerAttractionListTable
            attractions={attractions}
            selectAttraction={setSelectedAttraction}
          />
        </div>

        <div className="w-1/2">
          <h2 className="text-xl font-semibold mb-2">Spare Parts</h2>
          <SparePartsListTable
            spareParts={spareParts}
            selectedAttraction={selectedAttraction}
            onSparePartToggle={handleSparePartToggle}
          />
        </div>
      </div>
    </>
  );
};

export default SparePartsManager;
