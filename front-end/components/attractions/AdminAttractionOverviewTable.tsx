import React, { useState, useEffect } from "react";
import { Attraction, Park } from "@types";
import AttractionService from "@services/AttractionService";
import ParkService from "@services/ParkService";
import { useDropdownSearch } from "../../hooks/useDropdownSearch";

type Props = {
  attraction: Attraction;
  onStatusClick: (id: number) => void;
  onUpdate?: (updatedAttraction: Attraction) => void;
};

const AdminAttractionOverviewTable: React.FC<Props> = ({
  attraction,
  onStatusClick,
  onUpdate,
}) => {
  const [parks, setParks] = useState<Park[]>([]);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editWaitTime, setEditWaitTime] = useState({ hours: 0, minutes: 0 });
  const [editType, setEditType] = useState(attraction.type);
  const [editParkId, setEditParkId] = useState(attraction.park?.id);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const parkSearch = useDropdownSearch(parks, ["name", "id"]);

  useEffect(() => {
    ParkService.getAllParks().then(setParks).catch(console.error);
  }, []);

  useEffect(() => {
    setSaveError(null);
    setTimeError(null);
  }, [editingField]);

  useEffect(() => {
    setEditType(attraction.type);
    setEditParkId(attraction.park?.id);
    setTimeError(null);
    setSaveError(null);

    parkSearch.setSearchTerm(attraction.park?.name || "");

    if (attraction.waitTime) {
      const [h, m] = attraction.waitTime.split(":").map(Number);
      setEditWaitTime({ hours: h || 0, minutes: m || 0 });
    } else {
      setEditWaitTime({ hours: 0, minutes: 0 });
    }
  }, [attraction]);

  const handleParkSelect = (park: Park) => {
    setEditParkId(park.id);
    parkSearch.selectItem(park, "name");
  };

  useEffect(() => {
    if (editWaitTime.hours > 23) {
      setTimeError("Hours cannot exceed 23");
    } else if (editWaitTime.minutes > 59) {
      setTimeError("Minutes cannot exceed 59");
    } else if (editWaitTime.hours < 0 || editWaitTime.minutes < 0) {
      setTimeError("Time cannot be negative");
    } else {
      setTimeError(null);
    }
  }, [editWaitTime]);

  const handleSave = async (field: string) => {
    setSaveError(null);
    if (!attraction.id) return;
    if (timeError) return;

    const formattedTime = `${String(editWaitTime.hours).padStart(
      2,
      "0"
    )}:${String(editWaitTime.minutes).padStart(2, "0")}:00`;

    const payload = {
      name: attraction.name,
      type: field === "type" ? editType : attraction.type,
      parkId: field === "park" ? editParkId : attraction.park?.id,
      waitTime: field === "waitTime" ? formattedTime : attraction.waitTime,
      accessibility: attraction.accessibility,
      minAge: attraction.minAge,
      minHeight: attraction.minHeight,
      sparePartIds: [],
    };

    try {
      const updated = await AttractionService.updateAttraction(
        attraction.id,
        payload as any
      );
      if (onUpdate) onUpdate(updated);
      setEditingField(null);
      parkSearch.close();
    } catch (e) {
      console.warn("Update prevented by backend:", e);
      setSaveError("Access denied, you cannot change this value");
    }
  };

  const getDisplayText = (): string => {
    if (attraction.status !== "UP") return "no info";
    if (!attraction.waitTime) return "0 min";
    const parts = attraction.waitTime.split(":");
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    if (hours === 0) return `${minutes} min`;
    return `${hours} h ${minutes} min`;
  };

  const displayText = getDisplayText();
  const isNoInfo = displayText === "no info";
  const isUp = attraction.status === "UP";

  // REMOVED hover:bg-gray-200 from here (it's now on the <tr>)
  const editableCellClass = "p-2 border cursor-pointer relative";

  const clickToChangeHint = (
    <span className="text-xs text-gray-400 ml-2 font-normal">
      (click to change)
    </span>
  );

  return (
    <>
      {/* BACKGROUND CLICK HANDLER => CUSTOM HOOK */}
      {parkSearch.isOpen && (
        <div className="fixed inset-0 z-10" onClick={parkSearch.close} />
      )}

      <table className="w-full border-collapse border border-gray-300 mt-2 bg-white shadow-sm">
        <thead>
          <tr>
            <th colSpan={2} className="text-center p-2 bg-gray-300 border-b">
              {attraction.name}
            </th>
          </tr>
        </thead>
        <tbody>
          {/* STATUS ROW - Hover added to TR */}
          <tr className="hover:bg-gray-200 transition-colors duration-150">
            <td className="p-2 border font-medium">Status</td>
            <td
              onClick={() => attraction.id && onStatusClick(attraction.id)}
              className="p-2 border cursor-pointer select-none"
              title="Click to cycle status"
            >
              {attraction.status} {clickToChangeHint}
            </td>
          </tr>

          {/* WAIT TIME ROW - Conditional Hover on TR */}
          <tr
            className={
              isUp ? "hover:bg-gray-200 transition-colors duration-150" : ""
            }
          >
            <td className="p-2 border font-medium">Wait Time</td>
            <td
              className={
                isUp
                  ? editableCellClass
                  : "p-2 border bg-gray-50 text-gray-400 cursor-not-allowed"
              }
            >
              {editingField === "waitTime" && isUp ? (
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 text-black">
                    <input
                      type="number"
                      min="0"
                      className={`w-16 border rounded p-1 text-black ${
                        timeError && editWaitTime.hours > 23
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                      value={editWaitTime.hours}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setEditWaitTime({
                          ...editWaitTime,
                          hours: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Hr"
                    />
                    <span>h</span>
                    <input
                      type="number"
                      min="0"
                      className={`w-16 border rounded p-1 text-black ${
                        timeError && editWaitTime.minutes > 59
                          ? "border-red-500 bg-red-50"
                          : ""
                      }`}
                      value={editWaitTime.minutes}
                      onFocus={(e) => e.target.select()}
                      onChange={(e) =>
                        setEditWaitTime({
                          ...editWaitTime,
                          minutes: parseInt(e.target.value) || 0,
                        })
                      }
                      placeholder="Min"
                    />
                    <button
                      onClick={() => handleSave("waitTime")}
                      disabled={!!timeError}
                      className={`text-sm font-bold ${
                        timeError ? "text-gray-300" : "text-green-600"
                      }`}
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => {
                        setEditingField(null);
                        setTimeError(null);
                        setSaveError(null);
                      }}
                      className="text-red-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {/* Validation Error */}
                  {timeError && (
                    <span className="text-red-500 text-xs mt-1">
                      {timeError}
                    </span>
                  )}
                  {/* Backend Error */}
                  {saveError && (
                    <span className="text-red-500 text-xs mt-1 font-medium">
                      {saveError}
                    </span>
                  )}
                </div>
              ) : (
                <div
                  onClick={() => isUp && setEditingField("waitTime")}
                  className={isNoInfo ? "text-red-500 font-medium" : ""}
                >
                  {displayText}
                  {isUp && clickToChangeHint}
                </div>
              )}
            </td>
          </tr>

          {/* TYPE ROW - Hover added to TR */}
          <tr className="hover:bg-gray-200 transition-colors duration-150">
            <td className="p-2 border font-medium">Type</td>
            <td className={editableCellClass}>
              {editingField === "type" ? (
                <div className="flex flex-col">
                  <div className="flex gap-2 text-black">
                    <input
                      className="border rounded p-1 w-full"
                      value={editType}
                      onChange={(e) => setEditType(e.target.value)}
                    />
                    <button
                      onClick={() => handleSave("type")}
                      className="text-green-600 text-sm font-bold"
                    >
                      ✓
                    </button>
                    <button
                      onClick={() => setEditingField(null)}
                      className="text-red-600 text-sm font-bold"
                    >
                      ✕
                    </button>
                  </div>
                  {saveError && (
                    <span className="text-red-500 text-xs mt-1 font-medium">
                      {saveError}
                    </span>
                  )}
                </div>
              ) : (
                <div onClick={() => setEditingField("type")}>
                  {attraction.type} {clickToChangeHint}
                </div>
              )}
            </td>
          </tr>

          {/* PARK ROW - Hover added to TR */}
          <tr className="hover:bg-gray-200 transition-colors duration-150">
            <td className="p-2 border font-medium">Park</td>
            <td className={editableCellClass}>
              {editingField === "park" ? (
                <div className="flex flex-col text-black">
                  <div className="relative">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        className="border rounded p-1 w-full"
                        value={parkSearch.searchTerm}
                        onChange={(e) => {
                          parkSearch.setSearchTerm(e.target.value);
                          parkSearch.open();
                        }}
                        onFocus={parkSearch.open}
                        placeholder="Search park..."
                        autoFocus
                      />
                      <button
                        onClick={() => handleSave("park")}
                        className="text-green-600 text-sm font-bold"
                      >
                        ✓
                      </button>
                      <button
                        onClick={() => {
                          setEditingField(null);
                          parkSearch.close();
                        }}
                        className="text-red-600 text-sm font-bold"
                      >
                        ✕
                      </button>
                    </div>

                    {parkSearch.isOpen && (
                      <div
                        className={`
                          ${"absolute top-full left-0 right-0 bg-white border  rounded-b shadow-lg z-20 max-h-48 overflow-y-auto mt-1"}
                          parkOverviewDropDown
                        `}
                      >
                        {parkSearch.filteredItems.length === 0 ? (
                          <div className="p-2 text-gray-400 cursor-default">
                            No parks found
                          </div>
                        ) : (
                          parkSearch.filteredItems.map((p) => (
                            <div
                              key={p.id}
                              className={`${"p-2 border-b border-gray-100 hover:bg-gray-200 cursor-pointer flex justify-between items-center"} parkOverviewDropDownHover `}
                              onMouseDown={() => handleParkSelect(p)}
                            >
                              <span className="font-medium">{p.name}</span>
                              <span className="text-xs text-gray-400">
                                (ID: {p.id})
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                  {saveError && (
                    <span className="text-red-500 text-xs mt-1 font-medium">
                      {saveError}
                    </span>
                  )}
                </div>
              ) : (
                <div onClick={() => setEditingField("park")}>
                  {attraction.park?.name} {clickToChangeHint}
                </div>
              )}
            </td>
          </tr>
        </tbody>
      </table>
    </>
  );
};

export default AdminAttractionOverviewTable;
