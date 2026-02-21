"use client"; 

import { Attraction, Park } from "@types";
import React from "react";
import { useState, useEffect } from "react";

type Props = {
    attractions: Array<Attraction>;
};

const AttractionWaitTimesByParkTable: React.FC<Props> = ({ attractions }: Props) => {

    const timeStringToSeconds = (timeStr: string | null | undefined): number => {
        if (timeStr === null || timeStr === undefined || timeStr === "") {
            return Infinity;
        }

        const parts = timeStr.split(":");
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        const seconds = parseInt(parts[2], 10);

        return hours * 3600 + minutes * 60 + seconds;
    };

    const sortedAttractions = [...attractions].sort((a, b) => {
        const wait1 = timeStringToSeconds(a.waitTime) ?? Infinity;
        const wait2 = timeStringToSeconds(b.waitTime) ?? Infinity;
        return wait1 - wait2;
    });

    const parksWithDuplicates = attractions.map(attraction => attraction.park.name)
    const parks = [...new Set(parksWithDuplicates)];
    
    const [processedAttractions, setProcessedAttraction] = useState<Attraction[]>(sortedAttractions);
    const [isHidden, setIsHidden] = useState<boolean>(false);
    const [selectedParkName, setSelectedParkName] = useState<string>("all parks");
    const [anythingToHide, setanythingToHide] = useState<boolean>(true);
    
    const hideOrShowNoInfo = () => {
        setIsHidden(!isHidden);
    };

    const timeStringToReadable = (timeStr: string | null | undefined): string => {
        if (typeof timeStr == "string") {
            const parts = timeStr.split(":");
            const hours = parseInt(parts[0], 10);
            const minutes = parseInt(parts[1], 10);

            if (hours == 0) {
                return `${minutes} min`;
            } else {
                return `${hours} h ${minutes}`;
            }
            
        } else {
            return "no info";
        }
    };
  
    useEffect(() => {
        let processedAttractionList: Attraction[] = [];
        
        if (selectedParkName === "all parks") {
            processedAttractionList = sortedAttractions;
        } 
        else {
            processedAttractionList = sortedAttractions.filter((attraction) => 
                attraction.park.name == selectedParkName
            );
        }

        const noInfoAttractionList = processedAttractionList.filter((attraction) => attraction.waitTime === null)
            if (noInfoAttractionList.length > 0) {
                setanythingToHide(true)
            } else {
                setanythingToHide(false)
            }

        if (isHidden) {
            processedAttractionList = processedAttractionList.filter(attraction => 
                attraction.waitTime != null
            );
        }
        
        setProcessedAttraction(processedAttractionList);
    }, [selectedParkName, isHidden]);

    return (
        <>
            <div className="mb-1 flex gap-1">
                <select className="bg-gray-300 border border-black rounded px-3 py-1 flex-1 max-w-[160px] pageSelect" onChange={(selected) => setSelectedParkName(selected.target.value)}>
                    <option value="all parks">all parks</option>
                    {parks.map(park =>
                        <option value={park} key={park}>{park}</option>
                    )}
                </select>
                <button className="bg-red-300 text-red-950 px-3 py-1 border border-red-950 rounded flex-1 max-w-[120px] hideNoInfoButton" onClick={hideOrShowNoInfo}>
                   {anythingToHide ? (isHidden ? 'show no info' : 'hide no info') : "---"}
                </button>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Wait</th>
                    </tr>
                </thead>
                <tbody>
                    {processedAttractions.map((attraction, index) => (
                        <tr key={index}>
                            <td>{attraction.name ?? ""}</td>
                            {timeStringToReadable(attraction.waitTime)=="no info" ? (<td className={"noInfoText"}>{timeStringToReadable(attraction.waitTime) ?? ""}</td>): (<td className={"infoText"}>{timeStringToReadable(attraction.waitTime) ?? ""}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </>
    );
};

export default AttractionWaitTimesByParkTable;
