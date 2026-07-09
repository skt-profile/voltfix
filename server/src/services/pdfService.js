import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/**
 * Extracts full text (and per-page text) from a PDF file on disk.
 * @param {string} filePath
 * @returns {Promise<{ fullText: string, pageCount: number, pages: string[] }>}
 */
export const extractTextFromPdf = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  const pages = [];
  const options = {
    // pdf-parse calls this per rendered page; used to build a page-indexed array
    pagerender: async (pageData) => {
      const textContent = await pageData.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      pages.push(pageText);
      return pageText;
    },
  };

  const data = await pdfParse(dataBuffer, options);

  return {
    fullText: data.text,
    pageCount: data.numpages,
    pages,
  };
};

export default { extractTextFromPdf };
