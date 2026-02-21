import { useState } from "react";
import { X, Mail, AlertCircle } from "lucide-react";
import eventService from "@/service/EventService";
import EditableField from "./EditableField";

// --- Types & Interfaces ---
interface Props {
  eventId: string;
  currentSubject?: string;
  currentTemplateName?: string;
  setShowTemplate: (value: boolean) => void;
}

// Extended Mock Data to match the new HTML template fields
const MOCK_DATA = {
  firstName: "Jan",
  lastName: "Jansen",
  email: "jan.jansen@example.com",
  school: "KU Leuven",
  address: "Kasteelplein 1",
  county: "Leuven",
  postcode: "3000",
  phoneNumber: "+32 16 32 40 10",
  sessions: [
    {
      description: "Introductie tot ICTS",
      beginDate: "01/09/2025",
      endDate: "01/09/2025",
      beginTime: "09:00",
      endTime: "12:00",
      location: "Lokaal 01.05",
    },
  ],
};

// --- Helper Component for Inline Editing ---

export default function EventEmailVisualEditor({
  eventId,
  currentSubject = "ICTS Registratiebevestiging",
  currentTemplateName,
  setShowTemplate,
}: Props) {
  // --- STATE: Configuration ---
  const [templateName, setTemplateName] = useState(currentTemplateName || "");
  const [subject, setSubject] = useState(currentSubject);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- STATE: Content ---
  // Matches the specific text nodes in the provided HTML template
  const [content, setContent] = useState({
    headerTitle: "ICTS - KU Leuven",
    mainTitle: "Registratiebevestiging",
    greeting: "Beste", // The word before ${firstName}
    introText:
      "Bedankt voor uw registratie voor onze ICTS-sessie. Hieronder vindt u uw registratiegegevens en de sessies waarvoor u bent ingeschreven.",

    // Details Box 1 Labels
    labelFirstName: "Voornaam:",
    labelLastName: "Achternaam:",
    labelAddress: "Adres:",
    labelCounty: "Gemeente:",
    labelPostcode: "Postcode:",
    labelPhone: "Telefoonnummer:",
    labelEmail: "E-mail:",
    labelSchool: "School:",

    // Sessions Box Labels
    sessionsTitle: "Geregistreerde sessies",
    labelDate: "Datum:",
    labelTime: "Tijd:",
    labelLocation: "Locatie:",

    // Action Section
    cancelInstructions:
      "Indien gewenst kunt u uw registratie annuleren via onderstaande knop.",
    buttonText: "Registratie annuleren",

    // Footer
    footerText:
      "Deze e-mail dient als bevestiging van uw registratie bij ICTS.\n© 2025 ICTS - KU Leuven. Alle rechten voorbehouden.",
  });

  const updateContent = (key: keyof typeof content, value: string) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  /**
   * Generates the Final HTML exactly as provided in the prompt,
   * injecting the state variables where text is located.
   */
  const generateFinalHtml = () => {
    const formatFooter = (text: string) => text.replace(/\n/g, "<br />");

    return `<!DOCTYPE html>
<html lang="nl">
<head>
    <meta charset="UTF-8" />
    <title>${content.mainTitle}</title>
    <style>
        body {
            font-family: "Inter", Arial, sans-serif;
            background-color: #f9fafb;
            color: #111827;
            margin: 0;
            padding: 2rem;
            line-height: 1.6;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }
        h1 {
            font-size: 2rem;
            font-weight: 900;
            text-align: center;
            margin-top: 0.5rem;
        }
        h2 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #1f2937;
        }
        .details {
            padding: 24px;
            background-color: #f9fafb;
            border-radius: 12px;
            margin-bottom: 24px;
        }
        .details ul {
            margin: 0;
            padding-left: 1.2rem;
        }
        .details li {
            margin-bottom: 1rem;
        }
        .details li:last-child {
            margin-bottom: 0;
        }
        .details p {
            margin: 0;
            margin-bottom: 8px;
        }
        .details p:last-child {
            margin-bottom: 0;
        }
        .button-container {
            text-align: center;
        }
        .footer {
            margin-top: 3rem;
            font-size: 0.875rem;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 1rem;
        }
    </style>
</head>
<body>
<div class="container">
    <div style="text-align: center; margin-bottom: 1rem">
        <img
                src="https://www.kuleuven.be/aepz/afbeeldingen/logos/ku-leuven-logo.png/@@images/image.png"
                alt="KU Leuven Logo"
                style="max-width: 180px; height: auto"
        />
    </div>

    <a
            href="https://front-end-team18-wpp-team-18.apps.okd.ucll.cloud/"
            style="text-decoration: none; color: #111827"
    >
        <h1>${content.headerTitle}</h1>
    </a>

    <h2>${content.mainTitle}</h2>

    <p>${content.greeting} <span th:text="\${firstName}"></span>,</p>
    <p>
        ${content.introText}
    </p>

    <div class="details" style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
        <p><strong>${content.labelFirstName}</strong> <span th:text="\${firstName}"></span></p>
        <p><strong>${content.labelLastName}</strong> <span th:text="\${lastName}"></span></p>
        <p><strong>${content.labelAddress}</strong> <span th:text="\${address}"></span></p>
        <p><strong>${content.labelCounty}</strong> <span th:text="\${county}"></span></p>
        <p><strong>${content.labelPostcode}</strong> <span th:text="\${postcode}"></span></p>
        <p>
            <strong>${content.labelPhone}</strong>
            <span th:text="\${phoneNumber}"></span>
        </p>
        <p><strong>${content.labelEmail}</strong> <span th:text="\${email}"></span></p>
        <p style="margin-bottom:0"><strong>${content.labelSchool}</strong> <span th:text="\${school}"></span></p>
    </div>

    <h2>${content.sessionsTitle}</h2>

    <div class="details" style="padding: 24px; background-color: #f9fafb; border-radius: 12px; margin-bottom: 24px;">
        <ul style="margin: 0; padding-left: 1.2rem;">
            <li th:each="session : \${sessions}" style="margin-bottom: 1rem;">
                <strong th:text="\${session.description}"></strong><br />
                ${content.labelDate}
                <span th:text="\${session.beginDate}"></span> –
                <span th:text="\${session.endDate}"></span><br />
                ${content.labelTime}
                <span th:text="\${session.beginTime}"></span> -
                <span th:text="\${session.endTime}"></span><br />
                ${content.labelLocation}
                <span th:text="\${session.location}"></span>
            </li>
        </ul>
    </div>

    <p style="margin-top: 1.5rem">
        ${content.cancelInstructions}
    </p>

    <div class="button-container">
        <a th:href="\${cancellationLink}"
           style="display:inline-block;padding:12px 24px;background-color:#dc2626;color:#ffffff;text-decoration:none;font-weight:600;text-align:center;"
           class="cancel-button">
            ${content.buttonText}
        </a>
    </div>

    <div style="margin-top: 3rem" class="footer">
        ${formatFooter(content.footerText)}
    </div>
</div>
</body>
</html>`;
  };

  const handleSave = async () => {
    if (templateName.trim() === "") {
      setError("Template name is verplicht.");
      return;
    }
    setIsSaving(true);
    try {
      await eventService.createEmailTemplate(
        {
          templateName,
          subject,
          content: generateFinalHtml(),
        },
        eventId,
      );
      alert("Template succesvol opgeslagen!");
      setShowTemplate(false);
    } catch (err) {
      setError("Opslaan mislukt. Probeer opnieuw.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-sans"
      onClick={() => setShowTemplate(false)}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-xl bg-gray-100 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Toolbar */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800">
              <Mail className="text-primary" size={28} /> Visuele Editor
            </h2>
            <p className="text-xs text-gray-500">
              Klik op <strong>tekst</strong> om deze aan te passen.
            </p>
          </div>
          <div className="flex gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase">
                Template Name
              </label>
              <input
                className="rounded border border-gray-300 px-2 py-1 text-sm outline-none focus:border-blue-500"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase">
                Onderwerp
              </label>
              <input
                className="w-64 rounded border border-gray-300 px-2 py-1 text-sm font-bold text-gray-800 outline-none focus:border-blue-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => setShowTemplate(false)}
            className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {/* --- Canvas Area --- */}
        <div className="flex-1 overflow-y-auto bg-gray-200 p-8">
          {/* Main Email Container mimicking standard 600px width */}
          <div className="mx-auto max-w-[600px] rounded-lg bg-white p-8 shadow-xl transition-all">
            {/* 1. Header Logo */}
            <div className="mb-4 text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://www.kuleuven.be/aepz/afbeeldingen/logos/ku-leuven-logo.png/@@images/image.png"
                alt="Logo"
                className="mx-auto h-auto max-w-[180px]"
              />
            </div>

            {/* 2. Main Header (Link in HTML) */}
            <div className="mt-2 text-center">
              <EditableField
                value={content.headerTitle}
                onChange={(val: string) => updateContent("headerTitle", val)}
                className="text-center text-[2rem] leading-tight font-black text-gray-900"
              />
            </div>

            {/* 3. Sub Header */}
            <div className="mb-4">
              <EditableField
                value={content.mainTitle}
                onChange={(val: string) => updateContent("mainTitle", val)}
                className="text-[1.5rem] font-bold text-[#1f2937]"
              />
            </div>

            {/* 4. Intro Text */}
            <div className="mb-4 text-base leading-relaxed text-gray-900">
              <div className="flex items-baseline gap-1">
                <EditableField
                  value={content.greeting}
                  onChange={(val: string) => updateContent("greeting", val)}
                  className="w-auto font-medium"
                />
                <span>{MOCK_DATA.firstName},</span>
              </div>
              <div className="mt-2">
                <EditableField
                  multiline
                  value={content.introText}
                  onChange={(val: string) => updateContent("introText", val)}
                  className="leading-relaxed"
                />
              </div>
            </div>

            {/* 5. Details Box 1 (Gray Box) */}
            <div className="mb-6 rounded-[12px] bg-[#f9fafb] p-6 text-base text-gray-900">
              {[
                { label: "labelFirstName", val: MOCK_DATA.firstName },
                { label: "labelLastName", val: MOCK_DATA.lastName },
                { label: "labelAddress", val: MOCK_DATA.address },
                { label: "labelCounty", val: MOCK_DATA.county },
                { label: "labelPostcode", val: MOCK_DATA.postcode },
                { label: "labelPhone", val: MOCK_DATA.phoneNumber },
                { label: "labelEmail", val: MOCK_DATA.email },
                { label: "labelSchool", val: MOCK_DATA.school },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="mb-2 grid grid-cols-[140px_1fr] gap-1 last:mb-0"
                >
                  <EditableField
                    value={content[item.label as keyof typeof content]}
                    onChange={(v: string) =>
                      updateContent(item.label as keyof typeof content, v)
                    }
                    className="font-bold text-gray-900"
                  />
                  <span className="break-all">{item.val}</span>
                </div>
              ))}
            </div>

            {/* 6. Sessions Header */}
            <div className="mb-4">
              <EditableField
                value={content.sessionsTitle}
                onChange={(v: string) => updateContent("sessionsTitle", v)}
                className="text-[1.5rem] font-bold text-[#1f2937]"
              />
            </div>

            {/* 7. Sessions List (Gray Box) */}
            <div className="mb-6 rounded-[12px] bg-[#f9fafb] p-6 text-base text-gray-900">
              <ul className="m-0 list-disc pl-[1.2rem]">
                {MOCK_DATA.sessions.map((session, i) => (
                  <li key={i} className="mb-4 last:mb-0">
                    <strong className="block">{session.description}</strong>
                    {/* Date */}
                    <div className="flex flex-wrap items-baseline gap-1">
                      <EditableField
                        value={content.labelDate}
                        onChange={(v: string) => updateContent("labelDate", v)}
                        className="w-auto min-w-[50px] text-gray-800"
                      />
                      <span>
                        {session.beginDate} – {session.endDate}
                      </span>
                    </div>
                    {/* Time */}
                    <div className="flex flex-wrap items-baseline gap-1">
                      <EditableField
                        value={content.labelTime}
                        onChange={(v: string) => updateContent("labelTime", v)}
                        className="w-auto min-w-[50px] text-gray-800"
                      />
                      <span>
                        {session.beginTime} - {session.endTime}
                      </span>
                    </div>
                    {/* Location */}
                    <div className="flex flex-wrap items-baseline gap-1">
                      <EditableField
                        value={content.labelLocation}
                        onChange={(v: string) =>
                          updateContent("labelLocation", v)
                        }
                        className="w-auto min-w-[50px] text-gray-800"
                      />
                      <span>{session.location}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* 8. Cancel Text */}
            <div className="mt-6 mb-4">
              <EditableField
                multiline
                value={content.cancelInstructions}
                onChange={(v: string) => updateContent("cancelInstructions", v)}
                className="text-base text-gray-900"
              />
            </div>

            {/* 9. Cancel Button */}
            <div className="text-center">
              <div className="inline-block">
                <EditableField
                  value={content.buttonText}
                  onChange={(v: string) => updateContent("buttonText", v)}
                  // The '!' is crucial here to override the default EditableField transparent styles
                  className="!hover:bg-[#b91c1c] cursor-pointer !rounded-[6px] !border-2 !border-[#b91c1c] !bg-[#dc2626] px-6 py-3 text-center font-semibold !text-white hover:opacity-90"
                />
              </div>
            </div>

            {/* 10. Footer */}
            <div className="mt-12 border-t border-[#e5e7eb] pt-4 text-center">
              <EditableField
                multiline
                value={content.footerText}
                onChange={(v: string) => updateContent("footerText", v)}
                className="text-center text-[0.875rem] text-[#6b7280]"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-gray-200 bg-white p-4">
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <button
            onClick={() => setShowTemplate(false)}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Annuleren
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-secondary hover:bg-primary flex items-center gap-2 rounded-lg px-6 py-2 font-medium text-white shadow-sm transition-colors disabled:opacity-50"
          >
            {isSaving ? "Opslaan..." : "Opslaan"}
          </button>
        </div>
      </div>
    </div>
  );
}
