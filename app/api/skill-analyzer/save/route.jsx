import { NextResponse } from "next/server";
import { db } from "../../../../config/db";
import { skillAnalysesTable } from "../../../../config/schema";
import { auth, currentUser } from "@clerk/nextjs/server";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export async function POST(req) {
  try {
    const body = await req.json();
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Auth required" }, { status: 401 });
    }

    // Save to database
    let dbSaved = false;
    try {
      await db.insert(skillAnalysesTable).values({
        user_id: user.id,
        input_meta: body?.inputMeta || {},
        result_json: body?.result || {},
      });
      dbSaved = true;
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue with PDF generation even if DB save fails
    }

    // Generate PDF
    try {
      const pdf = await generateSkillAnalysisPDF(body?.result);

      return NextResponse.json({
        ok: true,
        message: dbSaved
          ? "Analysis saved and PDF generated successfully"
          : "PDF generated successfully (database save failed)",
        pdfData: pdf,
      });
    } catch (pdfError) {
      console.error("PDF generation error:", pdfError);
      return NextResponse.json({
        ok: dbSaved,
        message: dbSaved
          ? "Analysis saved successfully (PDF generation failed)"
          : "Save failed",
        note: "PDF generation is temporarily unavailable",
      });
    }
  } catch (e) {
    console.error("Save route error:", e);
    return NextResponse.json(
      { error: e?.message || "Failed to save analysis" },
      { status: 500 }
    );
  }
}

async function generateSkillAnalysisPDF(data) {
  if (!data) {
    throw new Error("No data provided for PDF generation");
  }

  const pdf = new jsPDF("p", "mm", "a4");
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  let yPosition = margin;
  const lineHeight = 7;
  const sectionGap = 15;

  // Title
  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(59, 130, 246); // Blue color
  pdf.text("Skill Analysis Report", pageWidth / 2, yPosition, {
    align: "center",
  });
  yPosition += lineHeight + 10;

  // Date
  pdf.setFontSize(12);
  pdf.setFont("helvetica", "normal");
  pdf.setTextColor(107, 114, 128); // Gray color
  pdf.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    margin,
    yPosition
  );
  yPosition += lineHeight + sectionGap;

  // Summary
  if (data.summary) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39); // Dark gray
    pdf.text("Summary", margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81); // Medium gray

    const summaryLines = pdf.splitTextToSize(data.summary, contentWidth);
    summaryLines.forEach((line) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(line, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += sectionGap;
  }

  // Overall Score
  const prof = data?.proficiency || {};
  const overall = Math.round(
    Object.values(prof).reduce((a, v) => a + (v?.score || 0), 0) /
      Math.max(1, Object.keys(prof).length)
  );

  pdf.setFontSize(16);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(17, 24, 39);
  pdf.text("Overall Skill Score", margin, yPosition);
  yPosition += lineHeight;

  pdf.setFontSize(24);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(59, 130, 246);
  pdf.text(`${overall}%`, margin, yPosition);
  yPosition += lineHeight + sectionGap;

  // Role Fit
  if (data?.roleFit && Object.keys(data.roleFit).length > 0) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text("Role Fit Analysis", margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81);

    Object.entries(data.roleFit).forEach(([role, info]) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }
      pdf.text(`${role}: ${info.match}`, margin, yPosition);
      yPosition += lineHeight;
    });
    yPosition += sectionGap;
  }

  // Skill Gaps
  if (data?.skillGaps && data.skillGaps.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text("Skill Gaps & Recommendations", margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81);

    data.skillGaps.forEach((gap, index) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${gap.skill}`, margin, yPosition);
      yPosition += lineHeight;

      pdf.setFont("helvetica", "normal");
      const gapText = `${gap.why} - ${gap.how}`;
      const gapLines = pdf.splitTextToSize(gapText, contentWidth);
      gapLines.forEach((line) => {
        if (yPosition > pageHeight - margin) {
          pdf.addPage();
          yPosition = margin;
        }
        pdf.text(line, margin + 5, yPosition);
        yPosition += lineHeight;
      });
      yPosition += 5;
    });
    yPosition += sectionGap;
  }

  // Learning Path
  if (data?.learningPath && data.learningPath.length > 0) {
    pdf.setFontSize(16);
    pdf.setFont("helvetica", "bold");
    pdf.setTextColor(17, 24, 39);
    pdf.text("Learning Path", margin, yPosition);
    yPosition += lineHeight;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    pdf.setTextColor(55, 65, 81);

    data.learningPath.forEach((path, index) => {
      if (yPosition > pageHeight - margin) {
        pdf.addPage();
        yPosition = margin;
      }

      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${path.skill}`, margin, yPosition);
      yPosition += lineHeight;

      if (path.chapters && path.chapters.length > 0) {
        pdf.setFont("helvetica", "normal");
        path.chapters.forEach((chapter) => {
          if (yPosition > pageHeight - margin) {
            pdf.addPage();
            yPosition = margin;
          }
          pdf.text(
            `  • ${chapter.title} (${chapter.hours}h)`,
            margin + 5,
            yPosition
          );
          yPosition += lineHeight;
        });
      }
      yPosition += 5;
    });
  }

  // Convert to base64 for download
  const pdfBase64 = pdf.output("datauristring");

  return {
    base64: pdfBase64,
    filename: `skill-analysis-${new Date().toISOString().split("T")[0]}.pdf`,
  };
}
