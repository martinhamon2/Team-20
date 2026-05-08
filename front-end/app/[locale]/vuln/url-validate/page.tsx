"use client";

import React, { useState } from "react";
import VulnerableService from "@services/VulnerableService";

export default function UrlValidatePage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<string | null>(null);

  const handleCheck = async () => {
    if (url.trim() === "") return;
    const res = await VulnerableService.validateUrl(url.trim());
    setResult(res);
  };

  return (
    <main>
      <h1 className="pageTitle">URL Validate</h1>

      <div className="flex items-center gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter a URL"
          className="border rounded px-1"
        />
        <button
          onClick={handleCheck}
          className="bg-gray-300 border border-black rounded px-3 max-w-[160px]"
        >
          Validate
        </button>
      </div>

      {result && <p>{result}</p>}
    </main>
  );
}
