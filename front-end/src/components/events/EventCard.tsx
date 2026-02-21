import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Globe2,
  Calendar,
  Users,
  LinkIcon,
  Mail,
  User,
  MapPin,
  School,
  Phone,
  Settings,
  X,
  Book,
  Trash2,
  AlertTriangle,
  Globe,
  Hourglass,
  Clock,
  Check,
} from "lucide-react";
import { Event, EventSetting, Session, Registration } from "@/types";
import Link from "next/link";
import { mutate } from "swr";
import eventService from "@/service/EventService";
import { Download } from "lucide-react";
import EventSettingComponent from "./EventSettingComponent";
import EventEmailTemplateComponent from "./EventEmailTemplateComponent";
import RegistrationService from "@/service/RegistrationService";
import {
  firstNameSchema,
  lastNameSchema,
  emailSchema,
  phoneSchemaInternational,
  phoneSchemaNational,
  addressSchema,
  countySchema,
  postcodeSchema,
  schoolSchema,
} from "@/lib/validation-schemas";

type Props = {
  event: Event;
  onToggleEventActive?: (id: string) => void;
  onToggleSessionActive: (id: string) => void;
};

const EventCard: React.FC<Props> = ({
  event,
  onToggleSessionActive,
  onToggleEventActive,
}) => {
  const [open, setOpen] = useState(false);
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    new Set(),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [showTemplate, setShowTemplate] = useState(false);

  const [selectedRegistration, setSelectedRegistration] =
    useState<Registration | null>(null);

  const [formData, setFormData] = useState<Registration | null>(null);

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState<string | null>(null);

  const [optimisticSettings, setOptimisticSettings] = useState<
    EventSetting | undefined
  >(event.eventSetting);

  const isUpdating = useRef(false);

  const isOpenlesdagen = (event.description || "")
    .toLowerCase()
    .includes("openlesdagen");

  useEffect(() => {
    if (!isUpdating.current) {
      setOptimisticSettings(event.eventSetting);
    }
  }, [event.eventSetting]);

  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
    null,
  );

  const confirmDelete = async () => {
    if (!selectedRegistration?.id || !selectedSessionId) return;

    try {
      const response = await RegistrationService.removeRegistrationFromSession(
        selectedRegistration.id,
        selectedSessionId,
      );

      if (response.ok) {
        setDeleteSuccessMsg("Gebruiker verwijderd");
        await mutate("events");

        setTimeout(() => {
          setShowDeleteConfirm(false);
          setSelectedRegistration(null);
          setFormData(null);
          setDeleteSuccessMsg(null);
        }, 1000);
      } else {
        console.error("Failed to delete");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const isActive = optimisticSettings?.active;

  const toggleRegistrations = (sessionId: string) => {
    setExpandedSessions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      if (!prev) return null;
      return { ...prev, [name]: value };
    });

    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validation Logic
  const validateField = (field: string, value: string): string | null => {
    try {
      switch (field) {
        case "firstName":
          firstNameSchema.parse(value);
          return null;
        case "lastName":
          lastNameSchema.parse(value);
          return null;
        case "email":
          emailSchema.parse(value);
          return null;
        case "phoneNumber":
          const phoneFormat = event.eventSetting?.phoneFormat;
          if (phoneFormat === "INTERNATIONAL") {
            phoneSchemaInternational.parse(value);
          } else {
            phoneSchemaNational.parse(value);
          }
          return null;
        case "address":
          addressSchema.parse(value);
          return null;
        case "county":
          countySchema.parse(value);
          return null;
        case "postcode":
          postcodeSchema.parse(value);
          return null;
        case "school":
          schoolSchema.parse(value);
          return null;
        case "dateOfBirth":
          if (value && !/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
            return "Ongeldig formaat (DD/MM/YYYY)";
          }
          return null;
        case "startYear":
          if (!value) return null;
          if (!/^\d{4}$/.test(value)) {
            return "Ongeldig jaar";
          }
          return null;
        case "correspondenceLanguage":
          if (!value.trim()) return "Ongeldige invoer";
          return null;
        default:
          return null;
      }
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "errors" in error) {
        const errObj = error as { errors: { message: string }[] };
        if (errObj.errors && errObj.errors[0]) {
          return errObj.errors[0].message;
        }
      }
      return "Ongeldige invoer";
    }
  };

  // --- Auto-save on Blur ---
  const handleBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    const fieldName = name as keyof Registration;

    if (
      selectedRegistration &&
      String(selectedRegistration[fieldName] || "") === value
    ) {
      return;
    }

    const validationError = validateField(name, value);
    if (validationError) {
      setErrors((prev) => ({ ...prev, [name]: validationError }));
      return;
    }

    if (!selectedRegistration?.id) return;

    setIsSaving(true);

    try {
      const response = await RegistrationService.updateRegistrationField(
        selectedRegistration.id,
        name,
        value || "",
      );

      if (response.ok) {
        await mutate("events");
        setSelectedRegistration((prev) =>
          prev ? { ...prev, [name]: value } : null,
        );
      } else {
        console.error("Backend error suppressed:", await response.text());
        setErrors((prev) => ({ ...prev, [name]: "Ongeldige invoer" }));
      }
    } catch (error) {
      console.error("Error updating field:", error);
      setErrors((prev) => ({
        ...prev,
        [name]: "Ongeldige invoer",
      }));
    } finally {
      setIsSaving(false);
    }
  };

  const getEventStatus = (beginDate?: string, endDate?: string) => {
    if (!beginDate || !endDate) return null;
    const today = new Date();
    const todayLocal = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
    const start = new Date(beginDate);
    const startLocal = new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate(),
    );
    const end = new Date(endDate);
    const endLocal = new Date(end.getFullYear(), end.getMonth(), end.getDate());

    if (endLocal < todayLocal) return "verlopen";
    if (startLocal <= todayLocal && todayLocal <= endLocal) return "bezig";
    return null;
  };

  const getSessionStatus = (session: Session) => {
    const now = new Date();
    const endDate = session.endDate ? new Date(session.endDate) : null;
    const isFull =
      !!session.maxCapacity &&
      session.maxCapacity > 0 &&
      (session.registrations?.length ?? 0) >= session.maxCapacity;

    const isPast = !!endDate && endDate < now;

    return { isFull, isPast };
  };

  const updateSettings = async (partialUpdate: Partial<EventSetting>) => {
    if (!event.id || !optimisticSettings) return;

    isUpdating.current = true;
    const previousSettings = { ...optimisticSettings };
    const newSettings = { ...optimisticSettings, ...partialUpdate };

    setOptimisticSettings(newSettings);
    try {
      await eventService.updateSettings(event.id, newSettings);
      await mutate("events");
    } catch (error) {
      console.error("Fout bij updaten van instellingen:", error);
      setOptimisticSettings(previousSettings);
    } finally {
      setTimeout(() => {
        isUpdating.current = false;
      }, 500);
    }
  };

  const downloadXML = async () => {
    try {
      const response = await eventService.downloadXML(event.id as string);

      if (response && response.ok) {
        const contentDisposition = response.headers.get("Content-Disposition");
        let filename = `registrations_${event.id ?? "unknown"}.xml`;
        if (contentDisposition) {
          const matches = contentDisposition.match(
            /filename=["']?([^"']+)["']?/i,
          );
          if (matches && matches[1]) {
            filename = matches[1];
          }
        }

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        return "Download initiated successfully.";
      } else {
        console.error("Download failed:", response?.statusText);
      }
    } catch (err: unknown) {
      console.error("Download error:", err);
    }
  };

  const status = getEventStatus(
    event.beginDate?.toString(),
    event.endDate?.toString(),
  );

  return (
    <>
      <div
        className={`rounded-2xl border border-gray-400 bg-white shadow-md transition-all hover:shadow-lg ${
          isActive ? "border-green-400 shadow-lg" : ""
        }`}
      >
        {/* Header */}
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <div className="mb-1 flex items-center gap-2">
              <h2
                className="line-clamp-2 max-w-sm text-lg font-semibold text-gray-800"
                title={event.description}
              >
                {event.description}
              </h2>

              <span
                className={`rounded-full px-2 py-0.5 text-xs ${
                  isActive
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {isActive ? "Actief" : "Verborgen"}
              </span>
              {status === "bezig" && (
                <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">
                  Bezig
                </span>
              )}

              {status === "verlopen" && (
                <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                  Verlopen
                </span>
              )}
            </div>
            <p className="line-clamp-2 text-sm text-gray-600">
              {event.description}
            </p>
            <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Globe2 size={14} />{" "}
                {event.language == "N" ? "Nederlands" : "Engels"}
              </span>
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {event.beginDate
                  ? new Date(event.beginDate!).toLocaleDateString() +
                    " tot " +
                    new Date(event.endDate!).toLocaleDateString()
                  : "Geen datum"}
              </span>
              <Link href={`/events/${event.id}`}>
                <span className="flex items-center gap-1 rounded-full bg-[#007bb1] px-2 py-1 text-white hover:bg-[#007bb1]/80">
                  <LinkIcon size={14} />
                  Visit
                </span>
              </Link>
            </div>
          </div>

          <div
            className="flex items-center gap-3"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => onToggleEventActive?.(event.id!)}
              className={`w-24 rounded-lg px-4 py-2 text-sm font-medium text-white shadow-sm transition-all ${
                isActive
                  ? "bg-orange-500 hover:bg-orange-600"
                  : "bg-green-500 hover:bg-green-600"
              }`}
            >
              {isActive ? "Verbergen" : "Tonen"}
            </button>

            <button
              className="text-gray-500 hover:text-gray-700"
              aria-label={open ? "Inklappen" : "Uitklappen"}
              onClick={() => setOpen(!open)}
            >
              {open ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
            </button>
          </div>
        </div>

        {/* Sessions */}
        {open && (
          <div className="rounded-b-2xl border-t border-gray-100 bg-gray-50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-md font-semibold text-gray-700">Sessies</h3>
              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={() => setShowSettings(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  aria-label="Sessie instellingen"
                >
                  <Settings size={16} />
                  Instellingen
                </button>
                <button
                  onClick={() => setShowTemplate(true)}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  aria-label="E-mail templates"
                >
                  <Book size={16} />
                  Templates
                </button>
                <button
                  onClick={downloadXML}
                  className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                  aria-label="Download XML"
                >
                  <Download size={16} />
                  Download XML
                </button>
              </div>
            </div>

            {event.sessions?.length ? (
              <ul className="space-y-3">
                {event.sessions?.map((session) => {
                  const { isFull, isPast } = getSessionStatus(session);

                  return (
                    <li
                      key={session.id}
                      className="rounded-lg border border-gray-400 bg-white transition hover:shadow-sm"
                    >
                      <div className="flex flex-col p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="text-md flex items-center gap-2 font-bold text-gray-800">
                            {session.type ?? "Geen titel"}
                            <span
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleRegistrations(session.id!);
                              }}
                              className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-300"
                            >
                              <span>
                                {(session.registrations?.length ?? 0) +
                                  " / " +
                                  ((session.maxCapacity ?? 0) !== 0
                                    ? session.maxCapacity
                                    : "∞")}
                              </span>
                              <Users size={12} />
                            </span>
                            <span
                              className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                                session.sessionSetting?.active
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-500"
                              }`}
                            >
                              {session.sessionSetting?.active
                                ? "Actief"
                                : "Verborgen"}
                            </span>
                            {isFull && (
                              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                                Volzet
                              </span>
                            )}
                            {isPast && (
                              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                                Voorbij
                              </span>
                            )}
                          </div>

                          <div className="text-sm text-gray-600">
                            {session.description}
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar size={14} />
                              {session.beginDate
                                ? new Date(
                                    session.beginDate,
                                  ).toLocaleDateString()
                                : "?"}
                              {" – "}
                              {session.endDate
                                ? new Date(session.endDate).toLocaleDateString()
                                : "?"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              {session.beginTime && session.endTime
                                ? `${session.beginTime.substring(0, 5)} – ${session.endTime.substring(0, 5)}`
                                : "?"}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={() => onToggleSessionActive(session.id!)}
                          className={`mt-3 w-24 rounded-md px-3 py-1 text-sm font-medium text-white transition-colors sm:mt-0 ${
                            session.sessionSetting?.active
                              ? "bg-orange-500 hover:bg-orange-600"
                              : "bg-green-500 hover:bg-green-600"
                          }`}
                        >
                          {session.sessionSetting?.active
                            ? "Verbergen"
                            : "Tonen"}
                        </button>
                      </div>

                      {/* Registrations List */}
                      {expandedSessions.has(session.id!) && (
                        <div className="rounded-b-lg border-t border-gray-200 bg-gray-50 p-4">
                          <h4 className="mb-3 text-sm font-semibold text-gray-700">
                            Inschrijvingen ({session.registrations?.length || 0}
                            )
                          </h4>
                          {session.registrations?.length ? (
                            <ul className="space-y-2">
                              {session.registrations.map(
                                (registration, idx) => (
                                  <li
                                    key={registration.id || idx}
                                    onClick={() => {
                                      setSelectedRegistration(registration);
                                      setFormData({ ...registration });
                                      setSelectedSessionId(session.id!);
                                      setErrors({});
                                    }}
                                    className="cursor-pointer rounded-md border border-transparent bg-white p-3 text-sm shadow-sm transition-all hover:border-blue-300 hover:bg-blue-50/50 hover:shadow-md"
                                  >
                                    <div className="flex items-start gap-3">
                                      {registration.isPresent ? (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600">
                                          <Check size={16} />
                                        </div>
                                      ) : (
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                                          <User size={16} />
                                        </div>
                                      )}
                                      <div className="flex-1 space-y-1">
                                        <div className="font-medium text-gray-800">
                                          {registration.firstName}{" "}
                                          {registration.lastName}
                                        </div>
                                        <div className="space-y-0.5 text-xs text-gray-600">
                                          {registration.email && (
                                            <div className="flex items-center gap-1">
                                              <Mail size={14} />
                                              {registration.email}
                                            </div>
                                          )}
                                          {registration.phoneNumber && (
                                            <div className="flex items-center gap-1">
                                              <Phone size={14} />
                                              {registration.phoneNumber}
                                            </div>
                                          )}
                                          {registration.school && (
                                            <div className="flex items-center gap-1">
                                              <School size={14} />
                                              {registration.school}
                                            </div>
                                          )}
                                          {(registration.address ||
                                            registration.postcode ||
                                            registration.county) && (
                                            <div className="flex items-start gap-1">
                                              <MapPin
                                                size={14}
                                                className="mt-0.5 shrink-0"
                                              />
                                              <span>
                                                {registration.address}
                                                {registration.postcode &&
                                                  `, ${registration.postcode}`}
                                                {registration.county &&
                                                  ` ${registration.county}`}
                                              </span>
                                            </div>
                                          )}
                                          {/* Added Language Icon */}
                                          {registration.correspondenceLanguage && (
                                            <div className="flex items-center gap-1">
                                              <Globe size={14} />
                                              {registration.correspondenceLanguage.toUpperCase()}
                                            </div>
                                          )}
                                          {/* Added Start Year Icon */}
                                          {registration.startYear && (
                                            <div className="flex items-center gap-1">
                                              <Hourglass size={14} />
                                              {registration.startYear}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </li>
                                ),
                              )}
                            </ul>
                          ) : (
                            <p className="text-sm text-gray-500 italic">
                              Geen inschrijvingen beschikbaar.
                            </p>
                          )}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="text-sm text-gray-500 italic">
                Geen sessies beschikbaar.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Pop-up for Registration Edit */}
      {selectedRegistration && formData && (
        <div
          className="fixed inset-0 z-60 flex h-screen w-screen items-center justify-center bg-black/50 p-4"
          onClick={() => {
            setSelectedRegistration(null);
            setFormData(null);
            setErrors({});
          }}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-4">
              <div className="flex items-center justify-between gap-4">
                <Settings size={32} className="text-primary" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-800">
                    Inschrijving Bewerken
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Pas de gegevens van de deelnemer aan ({event.type})
                    </p>
                    {isSaving && (
                      <span className="animate-pulse text-xs font-medium text-orange-500">
                        Opslaan...
                      </span>
                    )}
                    {!isSaving && !Object.keys(errors).length && (
                      <span className="text-xs font-medium text-green-600">
                        ✓ Opgeslagen
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedRegistration(null);
                  setFormData(null);
                  setErrors({});
                }}
                className="rounded-full p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Voornaam
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.firstName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.firstName && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.firstName}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Achternaam
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.lastName
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.lastName && (
                  <p className="mt-1 text-xs text-red-500">{errors.lastName}</p>
                )}
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  E-mailadres
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.email
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Telefoonnummer
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.phoneNumber
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.phoneNumber && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.phoneNumber}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Geboortedatum (DD/MM/YYYY)
                </label>
                <input
                  type="text"
                  name="dateOfBirth"
                  value={formData.dateOfBirth || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="DD/MM/YYYY"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.dateOfBirth
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.dateOfBirth && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.dateOfBirth}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Correspondentietaal
                </label>
                <input
                  type="text"
                  name="correspondenceLanguage"
                  value={formData.correspondenceLanguage || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  placeholder="NL / EN"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.correspondenceLanguage
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.correspondenceLanguage && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.correspondenceLanguage}
                  </p>
                )}
              </div>

              {isOpenlesdagen && (
                <>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      School
                    </label>
                    <input
                      type="text"
                      name="school"
                      value={formData.school || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.school
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {errors.school && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.school}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">
                      Startjaar (YYYY)
                    </label>
                    <input
                      type="text"
                      name="startYear"
                      value={formData.startYear || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                        errors.startYear
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      }`}
                    />
                    {errors.startYear && (
                      <p className="mt-1 text-xs text-red-500">
                        {errors.startYear}
                      </p>
                    )}
                  </div>
                </>
              )}

              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Adres
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.address
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.address && (
                  <p className="mt-1 text-xs text-red-500">{errors.address}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Postcode
                </label>
                <input
                  type="text"
                  name="postcode"
                  value={formData.postcode || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.postcode
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.postcode && (
                  <p className="mt-1 text-xs text-red-500">{errors.postcode}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Gemeente/Provincie
                </label>
                <input
                  type="text"
                  name="county"
                  value={formData.county || ""}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:ring-1 focus:outline-none ${
                    errors.county
                      ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  }`}
                />
                {errors.county && (
                  <p className="mt-1 text-xs text-red-500">{errors.county}</p>
                )}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="mt-6 flex items-center justify-between">
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:border-red-300 hover:bg-red-100"
              >
                <Trash2 size={16} />
                Verwijder deelnemer
              </button>

              <button
                onClick={() => {
                  setSelectedRegistration(null);
                  setFormData(null);
                  setErrors({});
                }}
                className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-70 flex h-screen w-screen items-center justify-center bg-black/30 p-4">
          <div className="animate-in fade-in zoom-in w-full max-w-md overflow-hidden rounded-xl bg-white shadow-2xl duration-200">
            <div className="p-6">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>

              <h3 className="mb-2 text-center text-lg font-bold text-gray-900">
                Ben je zeker?
              </h3>

              <p className="mb-6 text-center text-sm text-gray-600">
                Bent u zeker dat u deze gebruiker wilt verwijderen van dit
                event? Deze actie kan niet ongedaan worden gemaakt.
              </p>

              {deleteSuccessMsg ? (
                <div className="mb-4 rounded-lg bg-green-100 p-3 text-center text-sm font-medium text-green-700">
                  {deleteSuccessMsg}
                </div>
              ) : (
                <button
                  onClick={confirmDelete}
                  className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-red-700 hover:shadow-md"
                >
                  Ja, verwijderen
                </button>
              )}

              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteSuccessMsg(null);
                }}
                disabled={!!deleteSuccessMsg}
                className="mt-3 w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Annuleren
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <EventSettingComponent
          setShowSettings={setShowSettings}
          setShowTemplate={setShowTemplate}
          updateSettings={updateSettings}
          optimisticSettings={optimisticSettings}
        />
      )}

      {/* Show Template */}
      {showTemplate && (
        <EventEmailTemplateComponent
          setShowTemplate={setShowTemplate}
          eventId={event.id as string}
        />
      )}
    </>
  );
};

export default EventCard;
