import { Pinecone } from "@pinecone-database/pinecone";

let pineconeClient = null;
let indexHandle = null;

/**
 * Lazily initializes and caches the Pinecone client + index handle.
 */
const getIndex = () => {
  if (!indexHandle) {
    pineconeClient = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
    indexHandle = pineconeClient.index(process.env.PINECONE_INDEX);
  }
  return indexHandle;
};

/**
 * Upserts a batch of chunk vectors into a manual-specific namespace.
 * @param {string} namespace - unique namespace per manual (isolates search)
 * @param {{id: string, values: number[], metadata: object}[]} vectors
 */
export const upsertVectors = async (namespace, vectors) => {
  const index = getIndex();
  const BATCH_SIZE = 100;
  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);
    await index.namespace(namespace).upsert(batch);
  }
};

/**
 * Queries the nearest chunks to an embedded question inside one namespace.
 * @param {string} namespace
 * @param {number[]} queryVector
 * @param {number} topK
 */
export const queryNamespace = async (namespace, queryVector, topK = 5) => {
  const index = getIndex();
  const result = await index.namespace(namespace).query({
    vector: queryVector,
    topK,
    includeMetadata: true,
  });
  return result.matches || [];
};

/**
 * Queries across multiple manual namespaces (e.g. "search all my manuals")
 * and merges + re-sorts results by score.
 * @param {string[]} namespaces
 * @param {number[]} queryVector
 * @param {number} topKPerNamespace
 * @param {number} finalTopK
 */
export const queryMultipleNamespaces = async (
  namespaces,
  queryVector,
  topKPerNamespace = 5,
  finalTopK = 8
) => {
  const allMatches = await Promise.all(
    namespaces.map((ns) => queryNamespace(ns, queryVector, topKPerNamespace))
  );
  return allMatches
    .flat()
    .sort((a, b) => b.score - a.score)
    .slice(0, finalTopK);
};

/**
 * Deletes an entire namespace — used when a manual is removed.
 * @param {string} namespace
 */
export const deleteNamespace = async (namespace) => {
  const index = getIndex();
  await index.namespace(namespace).deleteAll();
};

export default { upsertVectors, queryNamespace, queryMultipleNamespaces, deleteNamespace };
