import eventService from "@/service/EventService";
import { EmailTemplate, EventSetting } from "@/types";
import { Settings, X } from "lucide-react";
import useSWR from "swr";
import ColorPickerComponent from "./ColorPickerComponent"; // Assuming path is correct

interface Props {
  setShowSettings: (value: boolean) => void;
  setShowTemplate: (value: boolean) => void;
  updateSettings: (partialUpdate: Partial<EventSetting>) => void;
  optimisticSettings: EventSetting | undefined;
}

export default function EventSettingComponent({
  setShowSettings,
  updateSettings,
  optimisticSettings,
}: Props) {
  const fetcher = async (): Promise<EmailTemplate[]> => {
    const response = await eventService.getAllEventTemplates();
    if (!response.ok) return [];
    return await response.json();
  };

  const { data, isLoading, error } = useSWR<EmailTemplate[]>(
    "templates",
    fetcher,
  );

  return (
    <div
      className="fixed inset-0 z-50 m-0! flex items-center justify-center bg-black/50 p-0"
      onClick={() => setShowSettings(false)}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings size={32} className="text-primary" />
            <h2 className="text-xl font-semibold text-gray-800">
              Sessie Instellingen
            </h2>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="cursor-pointer rounded-lg p-1 text-gray-500 transition-colors hover:bg-gray-100"
            aria-label="Sluiten"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content with Fixed Height and Scrollability */}
        <div className="max-h-[60vh] space-y-6 overflow-y-auto pr-2">
          {/* Sort Order */}
          <div className="flex gap-2">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Sorteerveld
              </label>
              <select
                value={optimisticSettings?.sortField || "TYPE"}
                onChange={(e) => updateSettings({ sortField: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="TYPE">Type</option>
                <option value="CATEGORY">Categorie</option>
                <option value="BEGINDATE">Begin datum</option>
                <option value="BEGINTIME">Begin tijd</option>
                <option value="LOCATION">Locatie</option>
                <option value="MAX_CAPACITY">Max capaciteit</option>
              </select>
            </div>

            <div className="w-1/2">
              <label className="mt-2 block text-sm font-medium text-gray-700">
                Sorteervolgorde
              </label>
              <select
                value={optimisticSettings?.sortOrder || "ASC"}
                onChange={(e) => updateSettings({ sortOrder: e.target.value })}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                <option value="ASC">Oplopend (A-Z, 1-9)</option>
                <option value="DESC">Aflopend (Z-A, 9-1)</option>
              </select>
            </div>
          </div>

          {/* Session Handling */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Sessie weergave
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={optimisticSettings?.moveFullToBack || false}
                  onChange={(e) =>
                    updateSettings({ moveFullToBack: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-sm text-gray-700">
                  Volzette sessies naar achteren verplaatsen
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={optimisticSettings?.movePastToBack || false}
                  onChange={(e) =>
                    updateSettings({ movePastToBack: e.target.checked })
                  }
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
                />
                <span className="text-sm text-gray-700">
                  Voorbije sessies naar achteren verplaatsen
                </span>
              </label>
            </div>
          </div>

          {/* Validation */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Validatie
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimisticSettings?.validateOverlapping || false}
                onChange={(e) => {
                  updateSettings({ validateOverlapping: e.target.checked });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-700">
                Waarschuwing bij overlappende sessies
              </span>
            </label>
          </div>

          {/* Sessies kunnen uitschrijven */}
          <div>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Sessies uitschrijven
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={optimisticSettings?.canUnsubscribe || false}
                onChange={(e) => {
                  updateSettings({ canUnsubscribe: e.target.checked });
                }}
                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/20"
              />
              <span className="text-sm text-gray-700">
                Gebruikers kunnen zich uitschrijven
              </span>
            </label>
          </div>

          {/* Phone Format */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Telefoonnummer formaat
            </label>
            <select
              value={optimisticSettings?.phoneFormat || "INTERNATIONAL"}
              onChange={(e) => updateSettings({ phoneFormat: e.target.value })}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
            >
              <option value="INTERNATIONAL">
                Internationaal (+32 123 45 67 89)
              </option>
              <option value="NATIONAAL">Nationaal (0123 45 67 89)</option>
            </select>
          </div>

          {/* Email Templates */}
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Email Template
            </label>

            {isLoading ? (
              <div className="text-sm text-gray-500">Templates laden...</div>
            ) : (
              <select
                value={
                  optimisticSettings?.templateName ||
                  "registration-confirmation"
                }
                onChange={(e) =>
                  updateSettings({ templateName: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none"
              >
                {/* Default static option */}
                <option value="registration-confirmation">Default</option>

                {/* Dynamic options from DB */}
                {data &&
                  data.map((template) => (
                    <option key={template.id} value={template.templateName}>
                      {template.templateName}
                    </option>
                  ))}
              </select>
            )}
            {error && (
              <p className="mt-1 text-xs text-red-500">
                Kon templates niet laden
              </p>
            )}
          </div>

          {/* Colors Templates */}
          <div>
            <p className="mb-2 block text-sm font-medium text-gray-700">
              Colors
            </p>
            <div className="space-y-4">
              <ColorPickerComponent
                label="Primaire kleur"
                settingKey="primaryColor"
                initialColor={optimisticSettings?.primaryColor || "#3B82F6"}
                updateSettings={updateSettings}
              />

              <ColorPickerComponent
                label="Secondaire kleur"
                settingKey="secondaryColor"
                initialColor={optimisticSettings?.secondaryColor || "#10B981"}
                updateSettings={updateSettings}
              />
            </div>
          </div>
        </div>

        {/* Footer / Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setShowSettings(false)}
            className="cursor-pointer rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
          >
            Sluiten
          </button>
        </div>
      </div>
    </div>
  );
}
