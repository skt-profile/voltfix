/**
 * Splits per-page text into overlapping chunks suitable for embedding.
 * Overlap preserves context across chunk boundaries so answers spanning
 * a sentence split across two chunks aren't lost.
 *
 * @param {string[]} pages - array of page text, index 0 = page 1
 * @param {object} opts
 * @param {number} opts.chunkSize - target characters per chunk
 * @param {number} opts.overlap - characters of overlap between consecutive chunks
 * @returns {{ text: string, page: number, chunkIndex: number }[]}
 */
export const chunkPages = (pages, { chunkSize = 1200, overlap = 200 } = {}) => {
  const chunks = [];
  let globalChunkIndex = 0;

  pages.forEach((pageText, pageIdx) => {
    const cleaned = (pageText || "").replace(/\s+/g, " ").trim();
    if (!cleaned) return;

    let start = 0;
    while (start < cleaned.length) {
      const end = Math.min(start + chunkSize, cleaned.length);
      const text = cleaned.slice(start, end);

      if (text.trim().length > 30) {
        chunks.push({
          text,
          page: pageIdx + 1,
          chunkIndex: globalChunkIndex++,
        });
      }

      if (end === cleaned.length) break;
      start = end - overlap;
    }
  });

  return chunks;
};

export default { chunkPages };
