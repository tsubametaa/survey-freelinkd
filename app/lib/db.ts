import {
  MongoClient,
  ServerApiVersion,
  type MongoClientOptions,
} from "mongodb";

const resolvedUri =
  process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI ?? "";

if (!resolvedUri) {
  console.warn(
    "WARNING: MONGODB_URI environment variable is not set. Questionnaire submissions will fail at runtime."
  );
}

export const mongoDbName =
  process.env.MONGODB_DB_NAME ??
  process.env.NEXT_PUBLIC_MONGODB_DB_NAME ??
  "freelinkd-db";

const shouldUseTls =
  resolvedUri.startsWith("mongodb+srv://") ||
  resolvedUri.includes("mongodb.net");

const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  retryWrites: true,
  retryReads: true,
  maxPoolSize: 8,
  minPoolSize: 0,
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 8000,
  connectTimeoutMS: 8000,
  socketTimeoutMS: 20000,
};

if (shouldUseTls) {
  clientOptions.tls = true;
  clientOptions.tlsAllowInvalidCertificates = false;
  clientOptions.tlsAllowInvalidHostnames = false;
}

type MongoState = {
  client: MongoClient | null;
  promise: Promise<MongoClient> | null;
};

const globalWithMongo = global as typeof globalThis & {
  _freelinkdMongo?: MongoState;
};

if (!globalWithMongo._freelinkdMongo) {
  globalWithMongo._freelinkdMongo = { client: null, promise: null };
}

const mongoState = globalWithMongo._freelinkdMongo;

async function createClient(): Promise<MongoClient> {
  if (!resolvedUri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please set it in your deployment settings."
    );
  }

  console.log("Creating MongoDB client...", {
    mongoDbName,
    usingTls: shouldUseTls,
    serverSelectionTimeoutMS: clientOptions.serverSelectionTimeoutMS,
    socketTimeoutMS: clientOptions.socketTimeoutMS,
  });
  const client = new MongoClient(resolvedUri, clientOptions);

  try {
    await client.connect();
    console.log("MongoDB connection established");
    return client;
  } catch (error) {
    console.error("Failed to establish MongoDB connection:", error);
    await client.close().catch(() => {});
    throw error;
  }
}

async function resolveClient(): Promise<MongoClient> {
  if (mongoState?.client) {
    return mongoState.client;
  }

  if (!mongoState?.promise) {
    mongoState!.promise = (async () => {
      let lastError: Error | null = null;
      const maxAttempts = process.env.NODE_ENV === "production" ? 2 : 3;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          console.log(
            `MongoDB connection attempt ${attempt}/${maxAttempts} (${process.env.NODE_ENV})`
          );
          const client = await createClient();
          mongoState!.client = client;
          return client;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          mongoState!.client = null;

          if (attempt < maxAttempts) {
            const waitTime = attempt * 500;
            console.warn(
              `MongoDB connection attempt ${attempt} failed: ${lastError.message}. Retrying in ${waitTime}ms`
            );
            await new Promise((resolve) => setTimeout(resolve, waitTime));
          }
        }
      }

      mongoState!.promise = null;
      throw lastError ?? new Error("Failed to connect to MongoDB");
    })().catch((error) => {
      mongoState!.promise = null;
      throw error;
    });
  }

  return mongoState!.promise!;
}

export async function getMongoDb() {
  const client = await resolveClient();

  try {
    const db = client.db(mongoDbName);
    await db.command({ ping: 1 });
    console.log("MongoDB ping successful", { database: mongoDbName });
    return db;
  } catch (error) {
    mongoState!.client = null;
    mongoState!.promise = null;
    throw error instanceof Error
      ? error
      : new Error("Unknown error while retrieving MongoDB database");
  }
}

export default resolveClient;
