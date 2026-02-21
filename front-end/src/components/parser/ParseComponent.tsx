import ParserService from "@/service/ParserService";
import { Event } from "@/types";
import React, { useState } from "react";

export default function EventOverview() {
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);

  async function uploadToBackend(file: File) {
    setUploading(true);
    setUploadStatus("");
    setEvent(null);

    try {
      const parsedEvent = await ParserService.uploadXml(file);
      setEvent(parsedEvent);
      setUploadStatus(`Successfully uploaded "${file.name}"`);
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    } finally {
      setUploading(false);
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      uploadToBackend(file);
    }
  }

  return (
    <div className="flex min-h-screen flex-col font-sans">
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mb-6">
          <label
            htmlFor="xml-upload"
            className={`inline-block rounded-md px-5 py-2.5 font-medium text-white ${
              uploading
                ? "cursor-not-allowed bg-gray-500"
                : "cursor-pointer bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uploading ? "Uploading..." : "Select XML File"}
          </label>
          <input
            id="xml-upload"
            type="file"
            accept=".xml"
            onChange={handleFileChange}
            disabled={uploading}
            className="hidden"
          />

          {fileName && (
            <span className="ml-4 text-gray-600">Selected: {fileName}</span>
          )}

          {uploadStatus && (
            <div
              className={`mt-3 rounded border px-3 py-2 ${
                uploadStatus.toLowerCase().includes("success")
                  ? "border-green-300 bg-green-100 text-green-800"
                  : "border-red-300 bg-red-100 text-red-800"
              }`}
            >
              {uploadStatus}
            </div>
          )}
        </div>

        {event ? (
          <div className="rounded-lg border border-gray-300 bg-gray-50 p-5">
            <h3 className="mb-4 text-2xl font-semibold text-gray-800">
              {event.description}
            </h3>
            <div className="mb-6 text-gray-700">
              <p>
                <strong>Event ID:</strong> {event.id}
              </p>
              <p>
                <strong>Language:</strong> {event.language}
              </p>
              <p>
                <strong>Type:</strong> {event.type}
              </p>
              <p>
                <strong>From:</strong> {event.beginDate?.toString()} →{" "}
                {event.endDate?.toString()}
              </p>
            </div>

            <h4 className="mb-3 text-xl font-semibold text-gray-800">
              Sessions ({event.sessions?.length ?? 0})
            </h4>
            <div className="grid gap-3">
              {event.sessions &&
                event.sessions.map((s, i) => (
                  <div
                    key={i}
                    className="rounded-md border border-gray-300 bg-white p-3 hover:border-blue-500"
                  >
                    <div className="flex justify-between">
                      <strong>{s.description}</strong>
                      <span className="text-sm text-gray-500">{s.id}</span>
                    </div>
                    <div className="mt-1 text-sm text-gray-600">
                      {s.category} • {s.location}
                    </div>
                    <div className="text-sm text-gray-600">
                      {s.beginDate?.toString()} {s.beginTime} →{" "}
                      {s.endDate?.toString()} {s.endTime}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          !uploading && (
            <div className="py-10 text-center text-gray-500">
              No event loaded. Upload an XML file to see details.
            </div>
          )
        )}
      </div>
    </div>
  );
}
