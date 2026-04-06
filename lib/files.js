import mime from "mime";

export const bufferToBase64 = (buf) => Buffer.from(buf).toString("base64");

export const getMimeFromFilename = (filename) => {
  const m = mime.getType(filename) || "application/octet-stream";
  return m;
};

export const extractPdfText = async (buffer) => {
  try {
    const mod = await (0, eval)("import('pdf-parse')");
    const pdfParse = mod.default;
    const data = await pdfParse(Buffer.from(buffer));
    return data?.text || "";
  } catch {
    return "";
  }
};

export const extractDocxText = async (buffer) => {
  try {
    const mod = await (0, eval)("import('mammoth')");
    const mammoth = mod;
    const result = await mammoth.extractRawText({
      buffer: Buffer.from(buffer),
    });
    return result?.value || "";
  } catch {
    return "";
  }
};



