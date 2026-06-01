"use client";

import React, { useState, useRef } from "react";
import { ensureHttpsUrl } from "@/lib/url";

interface ImageUploadProps {
  name?: string;
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  onUploadSuccess?: (url: string) => void;
  onChange?: (url: string) => void;
}

export default function ImageUpload({ 
  name, 
  value,
  defaultValue, 
  placeholder, 
  onUploadSuccess,
  onChange 
}: ImageUploadProps) {
  const [internalUrl, setInternalUrl] = useState<string>(ensureHttpsUrl(defaultValue || ""));
  
  // Use controlled value if provided, otherwise use internal state
  const url = value !== undefined ? value : internalUrl;
  const setUrl = (newUrl: string) => {
    setInternalUrl(newUrl);
    if (onUploadSuccess) onUploadSuccess(newUrl);
    if (onChange) onChange(newUrl);
  };

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const form = new FormData();
    form.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) throw new Error("Upload failed");

      const data = await res.json();
      const normalizedUrl = ensureHttpsUrl(data.url);
      setUrl(normalizedUrl);
    } catch (error) {
      console.error("Upload Error:", error);
      alert("Gagal mengunggah gambar");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="space-y-3">
      {url && (
        <div className="relative w-full max-w-[200px] aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={ensureHttpsUrl(url)} alt="Uploaded preview" className="object-cover w-full h-full" />
        </div>
      )}
      
      <div className="flex gap-2 items-center">
        {name && (
          <input 
            type="hidden" 
            name={name} 
            value={url} 
          />
        )}
        
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleUpload}
          disabled={isUploading}
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-100 border border-slate-300 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2 shadow-sm"
        >
          {isUploading ? (
             <svg className="animate-spin w-4 h-4 text-slate-700" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path></svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
          )}
          {isUploading ? "Mengunggah..." : "Pilih File"}
        </button>

        {url && (
           <button
             type="button"
             onClick={() => setUrl("")}
             className="px-3 py-2 text-sm font-semibold text-rose-600 bg-rose-50 rounded-xl hover:bg-rose-100 transition-colors"
           >
             Hapus
           </button>
        )}
      </div>
      {!url && <p className="text-xs text-slate-500 italic">Atau tempelkan URL langsung:</p>}
      {!url && (
        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(ensureHttpsUrl(e.target.value))}
          placeholder={placeholder || "https://..."} 
          className="w-full h-11 border border-slate-300 rounded-xl px-4 focus:ring-2 focus:ring-indigo-500 outline-none text-sm shadow-sm"
        />
      )}
    </div>
  );
}
