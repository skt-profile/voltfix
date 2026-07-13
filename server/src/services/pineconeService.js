import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.PINECONE_API_KEY;
const indexName = process.env.PINECONE_INDEX;
const indexHost = process.env.PINECONE_HOST;

console.log("====================================");
console.log("PINECONE DEBUG");
console.log("API KEY LOADED:", !!apiKey);
console.log("INDEX NAME:", indexName);
console.log("INDEX HOST:", indexHost);
console.log("====================================");

if (!apiKey) {
  throw new Error("PINECONE_API_KEY is missing");
}

if (!indexName) {
  throw new Error("PINECONE_INDEX is missing");
}

if (!indexHost) {
  throw new Error("PINECONE_HOST is missing");
}

const pineconeClient = new Pinecone({
  apiKey,
});

const indexHandle = pineconeClient.index(
  indexName,
  indexHost
);

export const upsertVectors = async (namespace, vectors) => {
  const BATCH_SIZE = 100;

  for (let i = 0; i < vectors.length; i += BATCH_SIZE) {
    const batch = vectors.slice(i, i + BATCH_SIZE);

    console.log(
      `[Pinecone] Upserting ${batch.length} vectors`
    );

    await indexHandle
      .namespace(namespace)
      .upsert(batch);
  }

  console.log("[Pinecone] Upsert completed");
};

export const queryNamespace = async (
  namespace,
  queryVector,
  topK = 5
) => {
  console.log(
    `[Pinecone] Query namespace: ${namespace}`
  );

  console.log(
    "[Pinecone] Vector dimension:",
    queryVector.length
  );

  const result = await indexHandle
    .namespace(namespace)
    .query({
      vector: queryVector,
      topK,
      includeMetadata: true,
      includeValues: false,
    });

  console.log(
    "[Pinecone] Matches:",
    result.matches?.length || 0
  );

  return result.matches || [];
};

export const queryMultipleNamespaces = async (
  namespaces,
  queryVector,
  topKPerNamespace = 5,
  finalTopK = 8
) => {
  const allMatches = await Promise.all(
    namespaces.map((namespace) =>
      queryNamespace(
        namespace,
        queryVector,
        topKPerNamespace
      )
    )
  );

  return allMatches
    .flat()
    .sort(
      (a, b) =>
        (b.score || 0) - (a.score || 0)
    )
    .slice(0, finalTopK);
};

export const deleteNamespace = async (namespace) => {
  await indexHandle
    .namespace(namespace)
    .deleteAll();

  console.log(
    `[Pinecone] Deleted namespace: ${namespace}`
  );
};

export default {
  upsertVectors,
  queryNamespace,
  queryMultipleNamespaces,
  deleteNamespace,
};