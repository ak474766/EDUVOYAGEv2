"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { GraduationCap } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import axios from "axios";
import { Button } from "../../../../components/ui/button";
import { Caveat } from "next/font/google";

const caveat = Caveat({ subsets: ["latin"], weight: ["400", "700"] });

export default function CertificatePrintPage() {
  const { certificate_id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const ref = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    // Force browser to load the custom font by using it, then set loaded state
    document.fonts.ready.then(() => {
      setFontsLoaded(true);
    });
  }, []);

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
    if (!data || !fontsLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = 2200; // px
    const height = Math.round((width * 9) / 16); // 16:9 ratio
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");

    // Clean Background
    ctx.fillStyle = "#F7FAF4"; // Very light almost white-mint
    ctx.fillRect(0, 0, width, height);

    // ==========================================
    // TOP LEFT CORNER GEOMETRY
    // ==========================================
    ctx.save();
    // 1. Muted lime background large shape (the big light green triangle)
    ctx.fillStyle = "#d2f399";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.28, 0);
    ctx.lineTo(0, height * 0.45);
    ctx.fill();

    // 2. Lime ribbon intersecting
    ctx.fillStyle = "#BCF540"; // bright base lime
    ctx.beginPath();
    ctx.moveTo(0, height * 0.12);
    ctx.lineTo(width * 0.16, 0);
    ctx.lineTo(width * 0.22, height * 0.08);
    ctx.lineTo(0, height * 0.32);
    ctx.fill();

    // 3. Forest green triangle overlapping
    ctx.fillStyle = "#1e5230"; // dark forest
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.15, 0);
    ctx.lineTo(0, height * 0.24);
    ctx.fill();
    
    // 4. Darker corner slice
    ctx.fillStyle = "#0c2b18"; // very dark
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.08, 0);
    ctx.lineTo(0, height * 0.12);
    ctx.fill();

    // 5. Lime floating block
    ctx.fillStyle = "#9ed426";
    ctx.beginPath();
    ctx.moveTo(0, height * 0.26);
    ctx.lineTo(width * 0.07, height * 0.18);
    ctx.lineTo(width * 0.14, height * 0.36);
    ctx.lineTo(0, height * 0.50);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // BOTTOM RIGHT CORNER GEOMETRY
    // ==========================================
    ctx.save();
    // 1. Muted lime background
    ctx.fillStyle = "#d2f399";
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.72, height);
    ctx.lineTo(width, height * 0.55);
    ctx.fill();
    
    // 2. Lime ribbon crossing
    ctx.fillStyle = "#BCF540";
    ctx.beginPath();
    ctx.moveTo(width, height * 0.65);
    ctx.lineTo(width * 0.84, height);
    ctx.lineTo(width * 0.78, height * 0.85);
    ctx.lineTo(width, height * 0.48);
    ctx.fill();

    // 3. Dark forest green block
    ctx.fillStyle = "#1e5230";
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.85, height);
    ctx.lineTo(width, height * 0.76);
    ctx.fill();

    // 4. Very dark corner overlay
    ctx.fillStyle = "#0c2b18";
    ctx.beginPath();
    ctx.moveTo(width, height);
    ctx.lineTo(width * 0.92, height);
    ctx.lineTo(width, height * 0.88);
    ctx.fill();
    
    // 5. Bright lime floating block
    ctx.fillStyle = "#9ed426";
    ctx.beginPath();
    ctx.moveTo(width * 0.86, height);
    ctx.lineTo(width * 0.94, height * 0.78);
    ctx.lineTo(width, height * 0.88);
    ctx.lineTo(width, height);
    ctx.fill();
    ctx.restore();

    // ==========================================
    // WIREFRAME ABSTRACT PATTERNS
    // ==========================================
    const drawWireframes = () => {
      ctx.save();
      ctx.strokeStyle = "rgba(188, 245, 64, 0.3)"; // Faint lime green
      ctx.lineWidth = 2.5;
      
      const createMesh = (offsetX, offsetY, scaleX, scaleY) => {
        const pts = [
          [0, 0.4], [1.2, 0.1], [2, 0.5], [0.6, 1.2], 
          [1.5, 1], [2.6, 1.4], [0.1, 2], [1.3, 2.2], [2.2, 2.1]
        ];
        const scaled = pts.map(p => [offsetX + p[0] * width * scaleX, offsetY + p[1] * height * scaleY]);
        
        ctx.beginPath();
        const connect = (i, j) => { ctx.moveTo(scaled[i][0], scaled[i][1]); ctx.lineTo(scaled[j][0], scaled[j][1]); };
        connect(0,1); connect(1,2); connect(0,3); connect(1,4); connect(2,5);
        connect(3,4); connect(4,5); connect(3,6); connect(4,7); connect(5,8);
        connect(6,7); connect(7,8); connect(1,3); connect(4,2); connect(4,6);
        connect(0,6); connect(2,8);
        ctx.stroke();
      };
      
      createMesh(0.04, 0.65, 0.08, 0.12);
      createMesh(0.72, 0.62, 0.08, 0.12);
      ctx.restore();
    };
    drawWireframes();

    // ==========================================
    // TEXT CONTENT
    // ==========================================
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // "CERTIFICATE OF ACHIEVEMENT"
    ctx.fillStyle = "#103c20"; // Dark rich green
    ctx.font = `600 ${Math.round(width * 0.045)}px serif`; 
    // Manual letter spacing approximation:
    const certTitle = "CERTIFICATE OF ACHIEVEMENT";
    const titleY = height * 0.16;
    ctx.fillText(certTitle, width / 2, titleY);

    // "THIS CERTIFICATE IS PROUDLY PRESENTED TO"
    ctx.fillStyle = "#333333";
    ctx.font = `500 ${Math.round(width * 0.015)}px sans-serif`;
    ctx.fillText("THIS CERTIFICATE IS PROUDLY PRESENTED TO", width / 2, height * 0.25);

    // NAME (Huge italic serif)
    const userName = String(data?.userName || "USER NAME");
    ctx.fillStyle = "#0c2b18";
    ctx.font = `italic 700 ${Math.round(width * 0.07)}px serif`;
    ctx.fillText(userName.toUpperCase(), width / 2, height * 0.35);

    // "for successfully completing the course"
    ctx.fillStyle = "#333333";
    ctx.font = `500 ${Math.round(width * 0.016)}px sans-serif`;
    ctx.fillText("for successfully completing the course", width / 2, height * 0.46);

    // COURSE TITLE (Bold upper sans)
    const courseName = String(data?.courseName || "COURSE NAME").toUpperCase();
    ctx.fillStyle = "#103c20";
    ctx.font = `bold ${Math.round(width * 0.024)}px sans-serif`;
    
    // Dynamic word wrapping for course titles 
    const wrapTextCentered = (context, text, x, centerY, maxWidth, lineHeight) => {
      const words = text.split(' ');
      let line = '';
      const lines = [];
      
      for(let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        
        if (testWidth > maxWidth && n > 0) {
          lines.push(line.trim());
          line = words[n] + ' ';
        } else {
          line = testLine;
        }
      }
      lines.push(line.trim());
      
      let startY = centerY - ((lines.length - 1) * lineHeight) / 2;
      for (let i = 0; i < lines.length; i++) {
        context.fillText(lines[i], x, startY + (i * lineHeight));
      }
    };
    
    wrapTextCentered(ctx, courseName, width / 2, height * 0.54, width * 0.7, height * 0.05);

    // "ISSUED ON"
    const issuedDate = new Date(data.issuedAt || new Date());
    const dateText = issuedDate.toLocaleDateString('en-US', {
      year: "numeric",
      month: "long",
      day: "2-digit",
    }).toUpperCase();
    ctx.fillStyle = "#333333";
    ctx.font = `500 ${Math.round(width * 0.016)}px sans-serif`;
    ctx.fillText(`ISSUED ON: ${dateText}`, width / 2, height * 0.65);

    // ==========================================
    // BOTTOM SECTION
    // ==========================================
    const sigYOffset = height * 0.81;
    const sigLabelY = sigYOffset + height * 0.035;

    // LEFT SIGNATURE
    const leftCreatorName = String(data?.courseCreatorName || "Course Founder");
    ctx.strokeStyle = "#333333";
    ctx.lineWidth = 3;
    ctx.beginPath(); 
    ctx.moveTo(width * 0.15, sigYOffset); 
    ctx.lineTo(width * 0.35, sigYOffset); 
    ctx.stroke();
    
    // Label
    ctx.fillStyle = "#333333";
    ctx.font = `500 ${Math.round(width * 0.014)}px sans-serif`;
    ctx.fillText("Course Founder", width * 0.25, sigLabelY);
    
    // Fake script signature using Caveat Google Font explicitly loaded
    ctx.fillStyle = "#103c20"; // dark green ink
    ctx.font = `700 ${Math.round(width * 0.035)}px ${caveat.style.fontFamily}, "Brush Script MT", cursive`;
    ctx.fillText(leftCreatorName, width * 0.25, sigYOffset - height * 0.02);

    // RIGHT SIGNATURE
    ctx.strokeStyle = "#333333";
    ctx.beginPath(); 
    ctx.moveTo(width * 0.65, sigYOffset); 
    ctx.lineTo(width * 0.85, sigYOffset); 
    ctx.stroke();
    
    // Label
    ctx.fillStyle = "#333333";
    ctx.font = `500 ${Math.round(width * 0.014)}px sans-serif`;
    ctx.fillText("Armaan Kachhawa", width * 0.75, sigLabelY);
    ctx.font = `400 ${Math.round(width * 0.012)}px sans-serif`;
    ctx.fillText("Website Founder", width * 0.75, sigLabelY + height * 0.03);
    
    // Fake script signature using Caveat Google Font explicitly loaded
    ctx.fillStyle = "#103c20"; // dark green ink
    ctx.font = `700 ${Math.round(width * 0.035)}px ${caveat.style.fontFamily}, "Brush Script MT", cursive`;
    ctx.fillText("Armaan Kachhawa", width * 0.75, sigYOffset - height * 0.02);

    // ==========================================
    // CENTER LOGO (EduVoyage)
    // ==========================================
    const logoYOffset = height * 0.78;
    
    // Draw Cap
    ctx.save();
    const drawCap = (cx, cy, s) => {
      ctx.fillStyle = "#0c2b18"; // Dark logo
      const topW = s * 1.6;
      const topH = s * 0.4;
      ctx.beginPath();
      ctx.moveTo(cx - topW/2, cy);
      ctx.lineTo(cx, cy - topH);
      ctx.lineTo(cx + topW/2, cy);
      ctx.lineTo(cx, cy + topH);
      ctx.closePath();
      ctx.fill();
      const bandW = s * 0.8;
      const bandH = s * 0.6;
      ctx.fillRect(cx - bandW/2, cy + topH * 0.4, bandW, bandH);
      ctx.strokeStyle = "#0c2b18";
      ctx.lineWidth = s * 0.15;
      ctx.beginPath();
      ctx.moveTo(cx + topW*0.35, cy);
      ctx.lineTo(cx + topW*0.35, cy + topH*1.8);
      ctx.stroke();
    };
    drawCap(width * 0.42, logoYOffset, width * 0.025);
    
    // "EduVoyage" text
    ctx.fillStyle = "#0c2b18";
    ctx.textAlign = "left";
    ctx.font = `800 ${Math.round(width * 0.024)}px sans-serif`;
    ctx.fillText("EduVoyage", width * 0.46, logoYOffset + height * 0.005);
    
    // "Learning platform" subtitle
    ctx.fillStyle = "#666666";
    ctx.font = `500 ${Math.round(width * 0.012)}px sans-serif`;
    ctx.fillText("Learning platform", width * 0.465, logoYOffset + height * 0.035);

    // Socials (simple circles with in, tw, fb text)
    const smYOffset = logoYOffset + height * 0.09;
    const drawIcon = (cx, cy, char) => {
      ctx.fillStyle = "#0f2b18";
      ctx.beginPath(); ctx.arc(cx, cy, width*0.012, 0, Math.PI*2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.textAlign="center";
      ctx.font = `bold ${Math.round(width*0.014)}px sans-serif`;
      ctx.fillText(char, cx, cy + height*0.005);
    };
    drawIcon(width * 0.47, smYOffset, "in");
    drawIcon(width * 0.51, smYOffset, "tw");
    drawIcon(width * 0.55, smYOffset, "f");

    // ==========================================
    // BOTTOM VERIFY CERTIFICATE LINK
    // ==========================================
    const linkY = height * 0.94;
    ctx.fillStyle = "#333333";
    ctx.textAlign = "center";
    ctx.font = `500 ${Math.round(width * 0.012)}px sans-serif`;
    const certId = String(data?.certificateId || "01482647-138c-4a58-8d91-a6a539e5090f");
    ctx.fillText(`→ Verify Certificate: edu.voyage/verify/${certId}`, width / 2, linkY);
    ctx.restore();
  }, [data, fontsLoaded]);

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
    <div className={`min-h-screen bg-ev-surface py-8 ${caveat.className}`}>
      {/* Hidden element to force browser to load caveat font immediately */}
      <span style={{ fontFamily: caveat.style.fontFamily, visibility: 'hidden', position: 'absolute' }}>Load Font</span>
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 gap-3">
          <button
            onClick={() => router.push("/workspace")}
            className="group flex items-center gap-4 rounded-[2rem] p-3 transition-transform hover:scale-105 active:scale-95 bg-ev-surface-container-low hover:bg-ev-surface-container-high border-0 shadow-sm"
            title="Back to workspace"
          >
            <div className="h-12 w-12 rounded-[1.2rem] grid place-items-center bg-ev-primary text-ev-surface">
              <GraduationCap className="h-6 w-6" aria-hidden="true" />
              <span className="sr-only">EduVoyage logo</span>
            </div>
            <div className="flex flex-col text-left pr-4">
              <span className="text-xl font-bold tracking-tight text-ev-primary">
                EduVoyage
              </span>
              <span className="text-sm font-medium tracking-wide uppercase text-ev-on-surface-variant">
                Workspace
              </span>
            </div>
          </button>
          <Button 
            onClick={downloadPdf}
            className="h-12 px-8 rounded-full bg-ev-primary text-ev-on-primary font-bold shadow-sm hover:shadow-md hover:scale-105 active:scale-95 transition-all duration-300 border-0"
          >
            Download PDF
          </Button>
        </div>
        {/* Canvas certificate (crisp export) */}
        <div className="bg-ev-surface-container-low rounded-[3rem] p-4 md:p-8 shadow-sm border-0 flex items-center justify-center">
          <div className="w-full flex justify-center border-0 rounded-[2rem] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
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
