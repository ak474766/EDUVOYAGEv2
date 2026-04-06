export const safeJsonParse = (text) => {
  try {
    return JSON.parse(text);
  } catch (e) {
    const cleaned = text
      .replace(/^```json\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    return JSON.parse(cleaned);
  }
};
