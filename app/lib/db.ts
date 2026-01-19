import { DataAPIClient, type Db as AstraDatabase } from "@datastax/astra-db-ts";

const astraToken =
  process.env.ASTRA_DB_APPLICATION_TOKEN ??
  process.env.ASTRA_DB_TOKEN ??
  process.env.NEXT_PUBLIC_ASTRA_DB_TOKEN ??
  "";

const astraEndpoint =
  process.env.ASTRA_DB_API_ENDPOINT ??
  process.env.ASTRA_DB_ENDPOINT ??
  process.env.NEXT_PUBLIC_ASTRA_DB_ENDPOINT ??
  "";

const astraKeyspace = process.env.ASTRA_DB_KEYSPACE ?? "freelinkd_kuesioner";
const astraDatabaseName =
  process.env.ASTRA_DB_DATABASE ?? "freelinkd_kuesioner";

if (!astraToken || !astraEndpoint) {
  console.warn(
    "WARNING: Astra DB credentials are not fully set. Questionnaire submissions will fail at runtime."
  );
}

type AstraState = {
  db: AstraDatabase | null;
  promise: Promise<AstraDatabase> | null;
};

const globalWithAstra = global as typeof globalThis & {
  _freelinkdAstra?: AstraState;
};

if (!globalWithAstra._freelinkdAstra) {
  globalWithAstra._freelinkdAstra = { db: null, promise: null };
}

const astraState = globalWithAstra._freelinkdAstra;

async function createAstraDb(): Promise<AstraDatabase> {
  if (!astraToken || !astraEndpoint) {
    throw new Error(
      "Missing Astra DB token or endpoint. Please set ASTRA_DB_TOKEN and ASTRA_DB_API_ENDPOINT."
    );
  }

  console.log("Creating DataStax Astra DB client...", {
    endpoint: astraEndpoint,
    keyspace: astraKeyspace,
    database: astraDatabaseName,
  });

  const client = new DataAPIClient(astraToken);
  const db = client.db(astraEndpoint, { keyspace: astraKeyspace });

  try {
    await db.listCollections();
    console.log("Astra DB connection established", {
      database: astraDatabaseName,
      keyspace: astraKeyspace,
    });
    return db;
  } catch (error) {
    console.error("Failed to establish Astra DB connection:", error);
    throw error instanceof Error
      ? error
      : new Error("Unknown error while connecting to Astra DB");
  }
}

async function resolveAstraDb(): Promise<AstraDatabase> {
  if (astraState?.db) {
    return astraState.db;
  }

  if (!astraState?.promise) {
    astraState!.promise = createAstraDb()
      .then((db) => {
        astraState!.db = db;
        return db;
      })
      .catch((error) => {
        astraState!.db = null;
        astraState!.promise = null;
        throw error;
      });
  }

  return astraState!.promise!;
}

export async function getAstraDb(): Promise<AstraDatabase> {
  return resolveAstraDb();
}

export default getAstraDb;
