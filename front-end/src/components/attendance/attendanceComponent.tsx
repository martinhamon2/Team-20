import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Event, Registration, Session } from "@/types";
import eventService from "@/service/EventService";

interface LogEntry {
  id: number;
  message: string;
  type: "success" | "error";
  timestamp: string;
}

interface Props {
  events: Event[];
}

export default function AttendanceComponent({ events }: Props) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isScannerReady, setIsScannerReady] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedSessionRef = useRef<string>("");
  const lastScannedTokenRef = useRef<string>("");
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  const addLog = useCallback((message: string, type: "success" | "error") => {
    const newLog: LogEntry = {
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString(),
    };
    setLogs((prev) => [newLog, ...prev]);
  }, []);

  useEffect(() => {
    const allSessions = events.flatMap((event) => event.sessions || []);
    setSessions(allSessions);
  }, [events]);

  useEffect(() => {
    setIsScannerReady(true);
  }, []);

  useEffect(() => {
    selectedSessionRef.current = selectedSessionId;
  }, [selectedSessionId]);

  const filteredSessions = useMemo(() => {
    if (!searchTerm) return sessions;
    const lowerTerm = searchTerm.toLowerCase();
    return sessions.filter(
      (s) =>
        (s.description && s.description.toLowerCase().includes(lowerTerm)) ||
        (s.type && s.type.toLowerCase().includes(lowerTerm)),
    );
  }, [sessions, searchTerm]);

  // handle click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSession = (session: Session) => {
    if (session.id) {
      setSelectedSessionId(session.id);
    }
    const begin = session.beginTime?.slice(0, 5).replace(":", "h") || "";
    const end = session.endTime?.slice(0, 5).replace(":", "h") || "";
    const timeStr = `${begin} - ${end}`;

    setSearchTerm(`${session.type || session.description} (${timeStr})`);
    setIsDropdownOpen(false);
  };

  const playBeep = useCallback(() => {
    const audio = new Audio(
      "https://actions.google.com/sounds/v1/alarms/beep_short.ogg",
    );
    audio.play().catch((e) => console.log("Audio play failed", e));
  }, []);

  const onScanSuccess = useCallback(
    async (decodedText: string) => {
      const currentSessionId = selectedSessionRef.current;

      if (!currentSessionId) {
        addLog("Please select a session before scanning.", "error");
        return;
      }

      if (decodedText === lastScannedTokenRef.current) return;

      lastScannedTokenRef.current = decodedText;

      try {
        const response = await eventService.markAttendance(
          decodedText,
          currentSessionId,
        );

        if (response.ok) {
          const data: Registration = await response.json();
          addLog(`Checked in: ${data.firstName} ${data.lastName}`, "success");

          playBeep();
        } else {
          const errorMsg = `Error ${response.status}: ${response.statusText}`;
          addLog(errorMsg, "error");
        }
      } catch (error) {
        const msg =
          error instanceof Error ? error.message : "An unknown error occurred";
        addLog(`Network Error: ${msg}`, "error");
      }

      setTimeout(() => {
        lastScannedTokenRef.current = "";
      }, 2500);
    },
    [addLog, playBeep],
  );

  useEffect(() => {
    if (!isScannerReady) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );
    scannerRef.current = scanner;

    const onScanFailure = (error: unknown) => {
      console.warn("Scan failed:", error);
    };

    scanner.render(onScanSuccess, onScanFailure);

    return () => {
      scanner.clear().catch((error) => {
        console.error("Failed to clear html5-qrcode scanner. ", error);
      });
    };
  }, [isScannerReady, onScanSuccess]);

  return (
    <div className="mx-auto max-w-xl p-6 font-sans text-gray-900">
      <h1 className="mb-8 text-center text-3xl font-bold text-gray-800">
        Attendance Scanner
      </h1>

      {/* session selector container */}
      <div
        className="relative mb-6 rounded-none border border-[#c8c8c8] bg-gray-50 p-5"
        ref={dropdownRef}
      >
        <label className="mb-2 block font-semibold text-gray-700">
          Select Session:
        </label>

        <div className="relative">
          <input
            type="text"
            disabled={sessions.length === 0}
            className={`w-full rounded-none border p-3 text-base transition-all outline-none focus:ring-2 ${
              sessions.length === 0
                ? "cursor-not-allowed border-red-300 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-white focus:border-blue-500 focus:ring-blue-500"
            }`}
            placeholder={
              sessions.length === 0
                ? "No sessions available"
                : "Type to search session..."
            }
            value={searchTerm}
            onClick={() => {
              if (sessions.length > 0) setIsDropdownOpen(true);
            }}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsDropdownOpen(true);
              if (e.target.value === "") setSelectedSessionId("");
            }}
          />

          {/* dropdown list */}
          {isDropdownOpen && sessions.length > 0 && (
            <div className="absolute z-10 max-h-60 w-full overflow-y-auto border border-t-0 border-[#c8c8c8] bg-white shadow-lg">
              {filteredSessions.length === 0 ? (
                <div className="p-3 text-gray-500 italic">
                  No matching sessions found
                </div>
              ) : (
                filteredSessions.map((s) => (
                  <div
                    key={s.id}
                    className="cursor-pointer border-b border-gray-100 p-3 last:border-0 hover:bg-blue-50"
                    onClick={() => handleSelectSession(s)}
                  >
                    <span className="font-medium text-gray-800">
                      {s.type || s.description}
                    </span>
                    <span className="ml-2 text-sm text-gray-500">
                      ({s.beginTime?.slice(0, 5).replace(":", "h")} -{" "}
                      {s.endTime?.slice(0, 5).replace(":", "h")})
                    </span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {sessions.length > 0 && logs.length > 0 && (
          <div
            className={`mt-4 flex items-center justify-between rounded-none border p-3 ${
              logs[0].type === "success"
                ? "border-green-200 bg-green-100 text-green-800"
                : "border-red-200 bg-red-100 text-red-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xl">
                {logs[0].type === "success" ? "✅" : "❌"}
              </span>
              <div>
                <span className="block font-bold">
                  {logs[0].type === "success" ? "Success" : "Error"}
                </span>
                <span className="text-sm">{logs[0].message}</span>
              </div>
            </div>
            <span className="text-xs opacity-70">{logs[0].timestamp}</span>
          </div>
        )}

        {!selectedSessionId && sessions.length > 0 && logs.length === 0 && (
          <div className="mt-3 flex items-center rounded-none border border-amber-200 bg-amber-50 p-2 text-sm font-medium text-amber-600">
            <span className="mr-2">⚠️</span> Please select a session to start
            scanning.
          </div>
        )}
      </div>

      {/* camera area */}
      <div className="relative w-full overflow-hidden rounded-none">
        <div id="reader" className="w-full"></div>
      </div>

      <div className="mt-8">
        <h3 className="mb-3 text-xl font-semibold text-gray-700">
          Scanned Log History
        </h3>

        <div className="max-h-[300px] overflow-y-auto rounded-none border border-[#c8c8c8] bg-white">
          {logs.length === 0 ? (
            <div className="p-6 text-center text-gray-400 italic">
              Waiting for scans...
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`flex items-center justify-between border-b border-gray-300 p-3 last:border-0 ${
                  log.type === "success"
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <span className="font-medium">{log.message}</span>
                <span className="ml-4 text-xs opacity-70">{log.timestamp}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
