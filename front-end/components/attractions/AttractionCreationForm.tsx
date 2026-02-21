"use client";

import { useState, FormEvent, useEffect, useMemo } from "react";
import styles from "@styles/attractionCreation.module.css";
import AttractionService from "@services/AttractionService";
import SparePartService from "@services/SparePartService";
import ParkService from "@services/ParkService";
import { AttractionInput, Park, SparePart } from "@types";
import { useDropdownSearch } from "../../hooks/useDropdownSearch";

type FieldErrors = {
  name?: string;
  type?: string;
  parkId?: string;
  waitTime?: string;
  minAge?: string;
  minHeight?: string;
  spareParts?: string;
  general?: string;
};

export default function AttractionCreationForm() {
  const [formData, setFormData] = useState<AttractionInput>({
    name: "",
    type: "",
    waitTime: "00:00",
    accessibility: false,
    minAge: 0,
    minHeight: 0,
    parkId: 0,
    sparePartIds: [],
  });

  const [waitHours, setWaitHours] = useState(0);
  const [waitMinutes, setWaitMinutes] = useState(0);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [availableParks, setAvailableParks] = useState<Park[]>([]);
  const [availableSpareParts, setAvailableSpareParts] = useState<SparePart[]>(
    []
  );

  const parkDropdown = useDropdownSearch(availableParks, ["name", "id"]);

  const selectableSpareParts = useMemo(() => {
    return availableSpareParts.filter(
      (part) => !formData.sparePartIds?.includes(part.id)
    );
  }, [availableSpareParts, formData.sparePartIds]);

  const partDropdown = useDropdownSearch(selectableSpareParts, ["name", "id"]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [parksData, partsData] = await Promise.all([
          ParkService.getAllParks(),
          SparePartService.getAllSpareParts(),
        ]);
        setAvailableParks(parksData);
        setAvailableSpareParts(partsData);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          general: "Failed to load lists for dropdowns.",
        }));
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const formattedHours = waitHours.toString().padStart(2, "0");
    const formattedMinutes = waitMinutes.toString().padStart(2, "0");
    setFormData((prev) => ({
      ...prev,
      waitTime: `${formattedHours}:${formattedMinutes}`,
    }));
  }, [waitHours, waitMinutes]);

  const selectPark = (park: Park) => {
    setFormData({ ...formData, parkId: park.id });
    parkDropdown.selectItem(park, "name");
    if (errors.parkId) setErrors({ ...errors, parkId: undefined });
  };

  const addSparePart = (part: SparePart) => {
    setFormData({
      ...formData,
      sparePartIds: [...(formData.sparePartIds || []), part.id],
    });
    partDropdown.clear();
    if (errors.spareParts) setErrors({ ...errors, spareParts: undefined });
  };

  const removeSparePartId = (idToRemove: number) => {
    setFormData({
      ...formData,
      sparePartIds: formData.sparePartIds?.filter((id) => id !== idToRemove),
    });
  };

  const validate = (): boolean => {
    const newErrors: FieldErrors = {};
    let isValid = true;

    if (!formData.name.trim()) {
      newErrors.name = "Please fill out this field.";
      isValid = false;
    }
    if (!formData.type.trim()) {
      newErrors.type = "Please fill out this field.";
      isValid = false;
    }
    if (!formData.parkId || formData.parkId <= 0) {
      newErrors.parkId = "Please select a valid park from the list.";
      isValid = false;
    }
    if (waitHours < 0 || waitMinutes < 0) {
      newErrors.waitTime = "Wait time cannot be negative.";
      isValid = false;
    }
    if (isNaN(formData.minAge) || formData.minAge < 0 || formData.minAge > 18) {
      newErrors.minAge = "Invalid age (0-18).";
      isValid = false;
    }
    if (
      isNaN(formData.minHeight) ||
      formData.minHeight < 0 ||
      formData.minHeight > 165
    ) {
      newErrors.minHeight = "Invalid height.";
      isValid = false;
    }
    if (!formData.sparePartIds || formData.sparePartIds.length === 0) {
      newErrors.spareParts = "At least one Spare Part is required.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrors({});

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await AttractionService.createAttraction(formData);

      setSuccessMessage(`Attraction "${formData.name}" created successfully!`);
      setFormData({
        name: "",
        type: "",
        waitTime: "00:00",
        accessibility: false,
        minAge: 0,
        minHeight: 0,
        parkId: 0,
        sparePartIds: [],
      });

      parkDropdown.clear();
      partDropdown.clear();
      setWaitHours(0);
      setWaitMinutes(0);
    } catch (err: any) {
      const errorMessage = err.message || "Something went wrong.";
      setErrors({ general: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDropdowns = () => {
    parkDropdown.close();
    partDropdown.close();
  };

  return (
    <div className={styles.formContainer}>
      {/* GLOBAL DROPDOWN */}
      {(parkDropdown.isOpen || partDropdown.isOpen) && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1,
          }}
          onClick={closeDropdowns}
        />
      )}

      <form onSubmit={handleSubmit} className={styles.form} noValidate>
        {/* NAME */}
        <div className={styles.inputGroup}>
          <label htmlFor="name">
            Attraction Name <span className={styles.required}>*</span>
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="e.g. Vortex"
          />
          {errors.name && (
            <span className={styles.inlineError}>{errors.name}</span>
          )}
        </div>

        {/* TYPE */}
        <div className={styles.inputGroup}>
          <label htmlFor="type">
            Type <span className={styles.required}>*</span>
          </label>
          <input
            id="type"
            type="text"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            placeholder="e.g. Rollercoaster"
          />
          {errors.type && (
            <span className={styles.inlineError}>{errors.type}</span>
          )}
        </div>

        {/* WAIT TIME */}
        <div className={styles.inputGroup}>
          <label>Wait Time</label>
          <div className={styles.timeInputContainer}>
            <div className={styles.timeField}>
              <input
                type="number"
                min="0"
                placeholder="0"
                value={waitHours === 0 ? "" : waitHours}
                onChange={(e) =>
                  setWaitHours(
                    e.target.value === "" ? 0 : parseInt(e.target.value)
                  )
                }
              />
              <span>h</span>
            </div>
            <div className={styles.timeField}>
              <input
                type="number"
                min="0"
                max="59"
                placeholder="0"
                value={waitMinutes === 0 ? "" : waitMinutes}
                onChange={(e) =>
                  setWaitMinutes(
                    e.target.value === "" ? 0 : parseInt(e.target.value)
                  )
                }
              />
              <span>min</span>
            </div>
          </div>
          {errors.waitTime && (
            <span className={styles.inlineError}>{errors.waitTime}</span>
          )}
        </div>

        {/* AGE & HEIGHT */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label htmlFor="minAge">Min Age</label>
            <input
              id="minAge"
              type="number"
              value={formData.minAge === 0 ? "" : formData.minAge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minAge: e.target.value === "" ? 0 : parseInt(e.target.value),
                })
              }
              min="0"
              max="18"
              placeholder="0"
            />
            {errors.minAge && (
              <span className={styles.inlineError}>{errors.minAge}</span>
            )}
          </div>

          <div className={styles.inputGroup} style={{ flex: 1 }}>
            <label htmlFor="minHeight">Min Height (cm)</label>
            <input
              id="minHeight"
              type="number"
              value={formData.minHeight === 0 ? "" : formData.minHeight}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  minHeight:
                    e.target.value === "" ? 0 : parseInt(e.target.value),
                })
              }
              min="0"
              max="165"
              placeholder="0"
            />
            {errors.minHeight && (
              <span className={styles.inlineError}>{errors.minHeight}</span>
            )}
          </div>
        </div>

        {/* ACCESSIBILITY */}
        <div className={styles.checkboxGroup}>
          <input
            id="accessibility"
            type="checkbox"
            checked={formData.accessibility}
            onChange={(e) =>
              setFormData({ ...formData, accessibility: e.target.checked })
            }
          />
          <label htmlFor="accessibility">Wheelchair Accessible</label>
        </div>

        {/* PARK => CUSTOM HOOK */}
        <div
          className={styles.inputGroup}
          style={{ position: "relative", zIndex: 10 }}
        >
          <label htmlFor="parkSearch">
            Park <span className={styles.required}>*</span>
          </label>
          <input
            id="parkSearch"
            type="text"
            value={parkDropdown.searchTerm}
            placeholder="Search Park Name or ID..."
            onFocus={parkDropdown.open}
            onChange={(e) => {
              parkDropdown.setSearchTerm(e.target.value);
              setFormData({ ...formData, parkId: 0 });
              parkDropdown.open();
            }}
            autoComplete="off"
          />

          {parkDropdown.isOpen && (
            <div className={styles.dropdownList}>
              {parkDropdown.filteredItems.length === 0 ? (
                <div
                  className={styles.dropdownItem}
                  style={{ cursor: "default", color: "#999" }}
                >
                  No parks found
                </div>
              ) : (
                parkDropdown.filteredItems.map((park) => (
                  <div
                    key={park.id}
                    className={styles.dropdownItem}
                    onMouseDown={() => selectPark(park)}
                  >
                    <strong>{park.name}</strong>
                    <span
                      style={{
                        fontSize: "0.8em",
                        color: "#666",
                        marginLeft: "8px",
                      }}
                    >
                      (ID: {park.id})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
          {errors.parkId && (
            <span className={styles.inlineError}>{errors.parkId}</span>
          )}
        </div>

        {/* SPARE PARTS => CUSTOM HOOK */}
        <div className={styles.sparePartsSection}>
          <label className={styles.sectionLabel}>
            Spare Parts <span className={styles.required}>*</span>
          </label>

          <div
            className={styles.inputGroup}
            style={{ position: "relative", zIndex: 9, marginTop: "0.5rem" }}
          >
            <input
              type="text"
              placeholder="Search Spare Part Name or ID..."
              value={partDropdown.searchTerm}
              onFocus={partDropdown.open}
              onChange={(e) => {
                partDropdown.setSearchTerm(e.target.value);
                partDropdown.open();
              }}
              autoComplete="off"
            />

            {partDropdown.isOpen && (
              <div className={styles.dropdownList}>
                {partDropdown.filteredItems.length === 0 ? (
                  <div
                    className={styles.dropdownItem}
                    style={{ cursor: "default", color: "#999" }}
                  >
                    No matching parts
                  </div>
                ) : (
                  partDropdown.filteredItems.map((part) => (
                    <div
                      key={part.id}
                      className={styles.dropdownItem}
                      onMouseDown={() => addSparePart(part)}
                    >
                      <strong>{part.name}</strong>
                      <span
                        style={{
                          fontSize: "0.8em",
                          color: "#666",
                          marginLeft: "8px",
                        }}
                      >
                        (ID: {part.id})
                      </span>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {errors.spareParts && (
            <span className={styles.inlineError}>{errors.spareParts}</span>
          )}

          {/* Selected Spare Parts List */}
          {formData.sparePartIds && formData.sparePartIds.length > 0 && (
            <div className={styles.partsList}>
              <span>Selected Parts:</span>
              <ul>
                {formData.sparePartIds.map((id) => {
                  const partDetails = availableSpareParts.find(
                    (p) => p.id === id
                  );
                  return (
                    <li key={id}>
                      <span>
                        <strong>
                          {partDetails ? partDetails.name : "Unknown"}
                        </strong>{" "}
                        <small>(ID: {id})</small>
                      </span>
                      <button
                        type="button"
                        onClick={() => removeSparePartId(id)}
                        className={styles.removeButton}
                      >
                        Remove
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating..." : "Create Attraction"}
        </button>

        {errors.general && (
          <div className={`${styles.statusMessage} ${styles.error}`}>
            {errors.general}
          </div>
        )}
        {successMessage && (
          <div className={`${styles.statusMessage} ${styles.success}`}>
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
}
