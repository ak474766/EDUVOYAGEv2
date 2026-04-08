import mime from "mime";

export const bufferToBase64 = (buf) => Buffer.from(buf).toString("base64");

export const getMimeFromFilename = (filename) => {
  const m = mime.getType(filename) || "application/octet-stream";
  return m;
};

export const extractPdfText = async (buffer) => {
  const src = Buffer.from(buffer);
  try {
    const pdfParse = require("pdf-parse");

    // Support both pdf-parse v1 (function export) and v2 (PDFParse class export).
    if (typeof pdfParse === "function") {
      const data = await pdfParse(src);
      return data?.text || "";
    }

    if (typeof pdfParse?.default === "function") {
      const data = await pdfParse.default(src);
      return data?.text || "";
    }

    const PDFParseClass = pdfParse?.PDFParse || pdfParse?.default?.PDFParse;
    if (typeof PDFParseClass === "function") {
      const parser = new PDFParseClass({ data: src });
      try {
        const data = await parser.getText();
        return data?.text || "";
      } finally {
        if (typeof parser.destroy === "function") {
          try {
            await parser.destroy();
          } catch {
            // ignore destroy failures
          }
        }
      }
    }

    throw new TypeError("Unsupported pdf-parse export shape");
  } catch (err) {
    console.error("PDF Parse error", err);
    return "";
  }
};

export const extractDocxText = async (buffer) => {
  try {
    const mammoth = require("mammoth");
    let extFunc = mammoth.extractRawText;
    if (
      !extFunc &&
      mammoth.default &&
      typeof mammoth.default.extractRawText === "function"
    ) {
      extFunc = mammoth.default.extractRawText;
    }
    const result = await extFunc({
      buffer: Buffer.from(buffer),
    });
    return result?.value || "";
  } catch (err) {
    console.error("Mammoth Parse error", err);
    return "";
  }
};

export const extractPlainText = (buffer) => {
  try {
    return Buffer.from(buffer).toString("utf8");
  } catch (err) {
    console.error("Plain text parse error", err);
    return "";
  }
};
