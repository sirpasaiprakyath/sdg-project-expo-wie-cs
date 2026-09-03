"use client";

import React, { useRef, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Download, Maximize2, X, Check, ShieldCheck } from "lucide-react";
import { Team } from "@/lib/types";

interface TeamQRModalProps {
  team: Team;
}

export default function TeamQRModal({ team }: TeamQRModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<SVGSVGElement>(null);

  const handleDownload = () => {
    const svgElement = qrRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = 600;
      canvas.height = 700;
      if (ctx) {
        // Draw Light Neumorphic Canvas Background
        ctx.fillStyle = "#FAF8F4";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Header Title
        ctx.fillStyle = "#2D2B2A";
        ctx.font = "bold 26px Outfit, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SDG FOCUSED PROJECT EXPO 2026", 300, 50);

        ctx.fillStyle = "#C5A059";
        ctx.font = "bold 32px Outfit, sans-serif";
        ctx.fillText(`${team.id} — ${team.teamName}`, 300, 95);

        // Draw QR Image
        ctx.drawImage(img, 100, 130, 400, 400);

        // Footer info
        ctx.fillStyle = "#66625C";
        ctx.font = "16px Outfit, sans-serif";
        ctx.fillText("IEEE WIE KARE × IEEE CS KARE", 300, 570);
        ctx.font = "14px Outfit, sans-serif";
        ctx.fillText("Permanent Secure Team Attendance Token", 300, 600);

        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${team.id}_Team_QR.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(svgData)));
  };

  return (
    <>
      {/* Standard Display Card */}
      <div className="neu-raised p-6 rounded-2xl flex flex-col items-center justify-center text-center">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck className="w-5 h-5 text-neu-green" />
          <span className="text-xs font-bold text-neu-muted tracking-widest uppercase">
            PERMANENT SECURE TEAM QR
          </span>
        </div>

        <h3 className="text-xl font-extrabold text-neu-gold mb-1">{team.id}</h3>
        <p className="text-sm font-bold text-neu-text mb-4">{team.teamName}</p>

        {/* QR Box */}
        <div className="neu-inset p-5 rounded-2xl mb-5 bg-[#ECE9E1] flex items-center justify-center">
          <QRCodeSVG
            ref={qrRef}
            value={team.qrToken}
            size={200}
            bgColor="#ECE9E1"
            fgColor="#2D2B2A"
            level="H"
            includeMargin={true}
          />
        </div>

        <p className="text-[11px] text-neu-muted mb-4 max-w-xs">
          Present this QR code to event volunteers to mark session attendance.
        </p>

        {/* Buttons */}
        <div className="flex items-center gap-3 w-full max-w-xs">
          <button
            onClick={() => setIsFullscreen(true)}
            className="flex-1 neu-btn py-2.5 px-3 text-xs font-bold text-neu-text flex items-center justify-center gap-1.5"
          >
            <Maximize2 className="w-4 h-4 text-neu-gold" />
            Fullscreen
          </button>

          <button
            onClick={handleDownload}
            className="flex-1 neu-btn neu-btn-gold py-2.5 px-3 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#F4F2EC]/95 backdrop-blur-lg p-4 select-none">
          <div className="relative w-full max-w-md neu-raised-lg p-8 rounded-3xl flex flex-col items-center text-center">
            
            <button
              onClick={() => setIsFullscreen(false)}
              className="absolute top-4 right-4 neu-btn p-2 text-neu-muted hover:text-neu-text"
              aria-label="Close Modal"
            >
              <X className="w-6 h-6" />
            </button>

            <span className="text-xs font-extrabold text-neu-gold tracking-widest uppercase mb-1">
              SDG FOCUSED PROJECT EXPO 2026
            </span>
            <h2 className="text-3xl font-extrabold text-neu-text mb-1">{team.id}</h2>
            <p className="text-lg font-bold text-neu-green mb-6">{team.teamName}</p>

            {/* Extra Large QR */}
            <div className="neu-inset p-6 rounded-3xl bg-[#ECE9E1] mb-6 flex items-center justify-center">
              <QRCodeSVG
                value={team.qrToken}
                size={280}
                bgColor="#ECE9E1"
                fgColor="#2D2B2A"
                level="H"
                includeMargin={true}
              />
            </div>

            <p className="text-xs font-medium text-neu-muted mb-6">
              Show this QR code clearly to the volunteer attendance scanner.
            </p>

            <button
              onClick={handleDownload}
              className="w-full neu-btn neu-btn-gold py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              <Download className="w-5 h-5" />
              Download QR Image
            </button>
          </div>
        </div>
      )}
    </>
  );
}
