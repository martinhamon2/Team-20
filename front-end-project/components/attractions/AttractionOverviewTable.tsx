import React from "react";
import { Attraction } from "@types";

type Props = {
  attraction: Attraction;
};

const AttractionOverviewTable: React.FC<Props> = ({ attraction }) => {
  return (
    <table className="max-w-[800px] mt-2">
      <thead>
        <tr>
          <th colSpan={2} className="text-center">
            {attraction.name}
          </th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Park</td>
          <td>{attraction.park?.name}</td>
        </tr>
        <tr>
          <td>Type</td>
          <td>{attraction.type}</td>
        </tr>
        <tr>
          <td>Status</td>
          <td>{attraction.status}</td>
        </tr>
        <tr>
          <td>Wait Time</td>
          <td>{attraction.waitTime ? attraction.waitTime : "no info"}</td>
        </tr>
        <tr>
          <td>Accessibility</td>
          <td>{attraction.accessibility ? "Yes" : "No"}</td>
        </tr>
        <tr>
          <td>Minimum Height</td>
          <td>{`${attraction.minHeight} cm`}</td>
        </tr>
        <tr>
          <td>Minimum Age</td>
          <td>{attraction.minAge}</td>
        </tr>
      </tbody>
    </table>
  );
};

export default AttractionOverviewTable;
