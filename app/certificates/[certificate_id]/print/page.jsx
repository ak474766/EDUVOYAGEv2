"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { Button } from "../../../../components/ui/button";

export default function CertificatePrintPage() {
  const { certificate_id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const ref = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const run = async () => {
      try {
        if (!certificate_id) return;
        const { data } = await axios.get(
          `/api/certificates/${encodeURIComponent(certificate_id)}`
        );
        setData(data);
      } catch (e) {
        // If unauthorized or not found, go back
        router.push("/workspace");
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [certificate_id, router]);

  // Draw certificate on canvas
  useEffect(() => {
    if (!data) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    // A4 landscape at 220 PPI approx → 2480 x 1754 works, but smaller for perf
    const width = 2200; // px
    const height = Math.round((width * 8.5) / 11); // keep landscape ratio 11x8.5
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Background (subtle gradient)
    const bgGrad = ctx.createLinearGradient(0, 0, width, height);
    bgGrad.addColorStop(0, "#eef2ff"); // indigo-50
    bgGrad.addColorStop(1, "#e2e8f0"); // slate-200
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, width, height);

    // Outer frame
    const margin = Math.round(width * 0.04);
    const frameW = width - margin * 2;
    const frameH = height - margin * 2;
    ctx.fillStyle = "#0f172a"; // slate-900-ish for border bg
    ctx.fillRect(margin, margin, frameW, frameH);

    // Panel container shadow
    ctx.fillStyle = "rgba(0,0,0,0.06)";
    ctx.fillRect(margin + 12, margin + 18, frameW, frameH);

    // Inner white panel
    const innerPad = Math.round(width * 0.025);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(
      margin + innerPad,
      margin + innerPad,
      frameW - innerPad * 2,
      frameH - innerPad * 2
    );

    // Elegant inset borders
    ctx.strokeStyle = "#e5e7eb"; // gray-200
    ctx.lineWidth = 8;
    ctx.strokeRect(
      margin + innerPad + 10,
      margin + innerPad + 10,
      frameW - innerPad * 2 - 20,
      frameH - innerPad * 2 - 20
    );
    ctx.strokeStyle = "#cbd5e1"; // slate-300
    ctx.lineWidth = 2;
    ctx.strokeRect(
      margin + innerPad + 24,
      margin + innerPad + 24,
      frameW - innerPad * 2 - 48,
      frameH - innerPad * 2 - 48
    );

    // Accent stripes (inspired by provided image)
    const stripeLeftX = margin + innerPad * 0.6;
    const stripeTopY = margin + innerPad * 0.6;
    const panelW = frameW - innerPad * 2;
    const panelH = frameH - innerPad * 2;

    // Diagonal blue stripe
    ctx.save();
    ctx.translate(stripeLeftX, stripeTopY);
    ctx.fillStyle = "#0ea5e9"; // sky-500
    ctx.beginPath();
    ctx.moveTo(0, panelH * 0.08);
    ctx.lineTo(panelW * 0.18, 0);
    ctx.lineTo(panelW * 0.24, 0);
    ctx.lineTo(0, panelH * 0.16);
    ctx.closePath();
    ctx.fill();

    // Yellow accent stripe
    ctx.fillStyle = "#f59e0b"; // amber-500
    ctx.beginPath();
    ctx.moveTo(panelW * 0.6, panelH);
    ctx.lineTo(panelW * 0.95, panelH);
    ctx.lineTo(panelW, panelH * 0.85);
    ctx.lineTo(panelW * 0.65, panelH * 0.85);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Compute central circle Y used by multiple layers
    const badgeY = margin + innerPad + panelH * 0.53;

    // Central gradient rounded-square watermark (inspired by the provided div)
    // Draw BEFORE text so it stays behind
    const wmSize = Math.round(width * 0.18);
    const wmX = Math.round(width / 2 - wmSize / 2);
    const wmY = Math.round(badgeY - wmSize / 2);
    const wmGrad = ctx.createLinearGradient(
      wmX,
      wmY,
      wmX + wmSize,
      wmY + wmSize
    );
    wmGrad.addColorStop(0, "#4f46e5"); // indigo-600
    wmGrad.addColorStop(1, "#3b82f6"); // blue-500
    const drawRoundedRect = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };
    ctx.save();
    ctx.globalAlpha = 0.08; // subtle watermark
    ctx.fillStyle = wmGrad;
    drawRoundedRect(wmX, wmY, wmSize, wmSize, Math.round(wmSize * 0.18));
    ctx.fill();
    // soft inner highlight
    ctx.globalAlpha = 0.06;
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(
      wmX + 10,
      wmY + 10,
      wmSize - 20,
      wmSize - 20,
      Math.round(wmSize * 0.16)
    );
    ctx.fill();
    ctx.restore();

    // Prepare text values
    const courseName = String(data?.courseName || "Course");
    const userName = String(data?.userName || "User");
    const issuedDate = new Date(data.issuedAt);
    const dateText = issuedDate.toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "2-digit",
    });
    const certId = String(data?.certificateId || "");

    // Soft, larger decorative circle behind center text (drawn BEFORE text)
    const badgeR = Math.round(width * 0.12); // larger radius
    const grad = ctx.createRadialGradient(
      width / 2,
      badgeY,
      Math.max(1, badgeR * 0.15),
      width / 2,
      badgeY,
      badgeR
    );
    grad.addColorStop(0, "rgba(37, 99, 235, 0.10)"); // blue-600 at center with low alpha
    grad.addColorStop(1, "rgba(37, 99, 235, 0.00)"); // fade out
    ctx.save();
    ctx.globalAlpha = 0.5; // extra softness
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(width / 2, badgeY, badgeR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Headings & text
    ctx.fillStyle = "#111827"; // gray-900
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Top-right small Certificate ID label
    if (certId) {
      ctx.save();
      ctx.textAlign = "right";
      ctx.fillStyle = "#6b7280"; // gray-500
      ctx.font = `600 ${Math.round(width * 0.014)}px monospace`;
      const rightX = margin + innerPad + panelW - 24;
      const topY = margin + innerPad + Math.round(panelH * 0.06);
      ctx.fillText(`ID: ${certId}`, rightX, topY);
      ctx.restore();
    }

    // Title
    ctx.font = `700 ${Math.round(width * 0.065)}px serif`;
    ctx.fillText("CERTIFICATE", width / 2, margin + innerPad + panelH * 0.14);

    // Subtitle
    ctx.font = `600 ${Math.round(width * 0.028)}px serif`;
    ctx.fillText("OF ACHIEVEMENT", width / 2, margin + innerPad + panelH * 0.2);

    // Decorative diamonds under subtitle
    const centerY = margin + innerPad + panelH * 0.235;
    const centerX = width / 2;
    const rh = Math.round(width * 0.008);
    const rw = Math.round(width * 0.012);
    const drawDiamond = (x, y, color) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(x, y - rh);
      ctx.lineTo(x + rw, y);
      ctx.lineTo(x, y + rh);
      ctx.lineTo(x - rw, y);
      ctx.closePath();
      ctx.fill();
    };
    drawDiamond(centerX, centerY, "#f59e0b");
    drawDiamond(centerX - rw * 2.2, centerY, "#0ea5e9");
    drawDiamond(centerX + rw * 2.2, centerY, "#0ea5e9");

    // Presented text
    ctx.font = `500 ${Math.round(width * 0.018)}px sans-serif`;
    ctx.fillStyle = "#374151";
    ctx.fillText(
      "This certificate is proudly presented to",
      width / 2,
      margin + innerPad + panelH * 0.28
    );

    // Name
    ctx.font = `700 ${Math.round(width * 0.06)}px serif`;
    ctx.fillStyle = "#111827";
    ctx.fillText(userName, width / 2, margin + innerPad + panelH * 0.36);

    // Body text
    ctx.font = `400 ${Math.round(width * 0.018)}px sans-serif`;
    ctx.fillStyle = "#374151";
    ctx.fillText(
      "has successfully completed all chapters and quiz requirements for the course",
      width / 2,
      margin + innerPad + panelH * 0.44
    );

    // Course name
    ctx.font = `700 ${Math.round(width * 0.03)}px sans-serif`;
    ctx.fillStyle = "#1f2937";
    ctx.fillText(courseName, width / 2, margin + innerPad + panelH * 0.5);

    // (Removed the previous solid badge; replaced with soft gradient circle behind text)

    // Issued on and Certificate ID line
    ctx.font = `500 ${Math.round(width * 0.018)}px monospace`;
    ctx.fillStyle = "#374151";
    ctx.fillText(
      `Issued on: ${dateText}`,
      width / 2,
      margin + innerPad + panelH * 0.6
    );
    // No longer repeat the ID here since it's at top-right; keep spacing consistent

    // Centered branding block below the issue date: gradient square + brand text
    const tileSize = Math.round(width * 0.05);
    const tileX = Math.round(width / 2 - tileSize - width * 0.02);
    const tileY = Math.round(margin + innerPad + panelH * 0.665);
    const tileGrad = ctx.createLinearGradient(
      tileX,
      tileY,
      tileX + tileSize,
      tileY + tileSize
    );
    tileGrad.addColorStop(0, "#4f46e5"); // indigo-600
    tileGrad.addColorStop(1, "#3b82f6"); // blue-500
    ctx.save();
    // outer
    ctx.fillStyle = tileGrad;
    drawRoundedRect(
      tileX,
      tileY,
      tileSize,
      tileSize,
      Math.round(tileSize * 0.22)
    );
    ctx.fill();
    // subtle ring
    ctx.strokeStyle = "rgba(0,0,0,0.10)";
    ctx.lineWidth = 2;
    ctx.stroke();
    // Draw a simple mortarboard (graduation cap) icon directly on canvas (no SVG)
    const pad = Math.round(tileSize * 0.22);
    const cx = tileX + tileSize / 2;
    const cy = tileY + tileSize / 2 + Math.round(tileSize * 0.02);
    const topW = tileSize - pad * 1.4;
    const topH = Math.round(topW * 0.22);
    const topY = cy - Math.round(topH * 1.6);
    // Cap top (parallelogram)
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.moveTo(cx - topW / 2, topY + topH);
    ctx.lineTo(cx, topY);
    ctx.lineTo(cx + topW / 2, topY + topH);
    ctx.lineTo(cx, topY + topH * 2);
    ctx.closePath();
    ctx.fill();
    // Cap base (band)
    const bandW = Math.round(topW * 0.46);
    const bandH = Math.round(topH * 0.55);
    const bandX = cx - bandW / 2;
    const bandY = topY + topH * 1.6;
    ctx.fillRect(bandX, bandY, bandW, bandH);
    // Tassel
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = Math.max(2, Math.round(tileSize * 0.03));
    const tasselX = cx + topW * 0.34;
    const tasselY = topY + topH * 1.05;
    ctx.beginPath();
    ctx.moveTo(tasselX, tasselY);
    ctx.lineTo(tasselX, tasselY + Math.round(tileSize * 0.22));
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(
      tasselX,
      tasselY + Math.round(tileSize * 0.26),
      Math.round(tileSize * 0.035),
      0,
      Math.PI * 2
    );
    ctx.fill();
    // Brand text to the right of the tile
    const textLeft = tileX + tileSize + Math.round(width * 0.02);
    const nameY = tileY + Math.round(tileSize * 0.48);
    const subY = nameY + Math.round(tileSize * 0.36);
    // Gradient text for brand name similar to landing page
    const nameGrad = ctx.createLinearGradient(
      textLeft,
      nameY - tileSize * 0.2,
      textLeft + tileSize * 2.5,
      nameY + tileSize * 0.2
    );
    nameGrad.addColorStop(0, "#4f46e5"); // indigo-600
    nameGrad.addColorStop(1, "#ec4899"); // pink-500
    ctx.fillStyle = nameGrad;
    ctx.font = `700 ${Math.round(width * 0.02)}px sans-serif`;
    ctx.textAlign = "left";
    ctx.fillText("EduVoyage", textLeft, nameY);
    // Subtitle
    ctx.fillStyle = "#6b7280"; // gray-500
    ctx.font = `500 ${Math.round(width * 0.012)}px sans-serif`;
    ctx.fillText("Learning platform", textLeft, subY);
    ctx.restore();

    // Signature lines
    ctx.strokeStyle = "#2563eb"; // blue-600
    ctx.lineWidth = 4;
    const sigY = margin + innerPad + panelH * 0.8;
    const sigW = width * 0.22;
    ctx.beginPath();
    ctx.moveTo(width * 0.18, sigY);
    ctx.lineTo(width * 0.18 + sigW, sigY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(width * 0.6, sigY);
    ctx.lineTo(width * 0.6 + sigW, sigY);
    ctx.stroke();

    ctx.font = `500 ${Math.round(width * 0.018)}px sans-serif`;
    ctx.fillStyle = "#374151";
    ctx.fillText("Signature", width * 0.29, sigY + Math.round(width * 0.03));
    ctx.fillText("Signature", width * 0.71, sigY + Math.round(width * 0.03));

    // Handwritten-style signature strokes above the lines
    const drawSignature = (startX, baseY, scale = 1) => {
      ctx.save();
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = Math.max(2, Math.round(width * 0.002)) * scale;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(startX, baseY);
      ctx.bezierCurveTo(
        startX + 20 * scale,
        baseY - 18 * scale,
        startX + 48 * scale,
        baseY + 22 * scale,
        startX + 76 * scale,
        baseY - 6 * scale
      );
      ctx.bezierCurveTo(
        startX + 96 * scale,
        baseY - 18 * scale,
        startX + 130 * scale,
        baseY + 12 * scale,
        startX + 170 * scale,
        baseY - 8 * scale
      );
      ctx.stroke();
      ctx.restore();
    };
    drawSignature(width * 0.21, sigY - Math.round(width * 0.012), 1.1); // left
    drawSignature(width * 0.63, sigY - Math.round(width * 0.012), 1.1); // right
  }, [data]);

  const downloadPdf = async () => {
    // Prefer the drawn canvas if available for crisp PDF
    const drawn = canvasRef.current;
    let imgData;
    if (drawn) {
      imgData = drawn.toDataURL("image/png");
    } else if (ref.current) {
      const canv = await html2canvas(ref.current, { scale: 2 });
      imgData = canv.toDataURL("image/png");
    } else {
      return;
    }
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "pt",
      format: "a4",
    });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const img = new Image();
    img.src = imgData;
    await new Promise((res) => (img.onload = res));
    const imgHeight = (img.height * pageWidth) / img.width;
    const y = (pageHeight - imgHeight) / 2;
    pdf.addImage(imgData, "PNG", 0, y, imgWidth, imgHeight);
    const filename = `${(data?.courseName || "Course").replace(
      /\s+/g,
      " "
    )} - ${(data?.userName || "User").replace(/\s+/g, " ")} - certificate.pdf`;
    pdf.save(filename);
  };

  if (loading) return <div className="p-8">Loading…</div>;
  if (!data) return <div className="p-8">Certificate not available.</div>;

  const issuedDate = new Date(data.issuedAt);
  const formattedDate = issuedDate.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4 gap-3">
          <button
            onClick={() => router.push("/workspace")}
            className="group flex items-center gap-3 rounded-xl p-2.5 pr-3 transition-transform hover:translate-x-[1px]"
            title="Back to workspace"
          >
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-indigo-600 to-blue-500 text-white ring-1 ring-black/10 shadow-md shadow-black/10">
              <GraduationCap className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">EduVoyage logo</span>
            </div>
            <div className="flex flex-col">
              <span className="text-base font-semibold leading-5 text-gray-900 dark:text-white">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-600">
                  EduVoyage
                </span>
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Workspace
              </span>
            </div>
          </button>
          <Button onClick={downloadPdf}>Download PDF</Button>
        </div>
        {/* Canvas certificate (crisp export) */}
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="w-full flex justify-center p-4">
            <canvas
              ref={canvasRef}
              style={{ width: "100%", height: "auto", maxWidth: 1200 }}
            />
          </div>
        </div>

        {/* Hidden fallback DOM (in case canvas not supported) */}
        <div ref={ref} className="sr-only">
          <div className="p-10">
            <div className="text-2xl font-bold">{data.courseName}</div>
            <div className="text-lg">{data.userName}</div>
            <div className="text-sm">Issued on {formattedDate}</div>
            <div className="text-sm">Certificate ID: {data.certificateId}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
