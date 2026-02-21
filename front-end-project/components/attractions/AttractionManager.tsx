"use client";

import { useState } from "react";
import { Attraction } from "@types";
import AttractionListTable from "@components/attractions/AttractionListTable";
import AttractionOverviewTable from "@components/attractions/AttractionOverviewTable";

type Props = {
  data: Attraction[];
};

export const AttractionManager = ({ data }: Props) => {
  const [attractions] = useState<Attraction[]>(data);
  const [selectedAttraction, setSelectedAttraction] = useState<Attraction | null>(null);

  return (
    <div>
      <section>
        <AttractionListTable
          attractions={attractions}
          selectAttraction={setSelectedAttraction}
        />
      </section>
      {selectedAttraction && (
        <section>
          {<AttractionOverviewTable attraction={selectedAttraction} />}
        </section>
      )}
    </div>
  );
};
