import {
  MongoClient,
  ServerApiVersion,
  type MongoClientOptions,
} from "mongodb";

const resolvedUri =
  process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI ?? "";

if (!resolvedUri) {
  // Warning during build time, will error at runtime if still missing
  console.warn(
    "⚠️ WARNING: MONGODB_URI environment variable is not set. Connection will fail at runtime."
  );
}

export const mongoDbName =
  process.env.MONGODB_DB_NAME ??
  process.env.NEXT_PUBLIC_MONGODB_DB_NAME ??
  "freelinkd-db";

const clientOptions: MongoClientOptions = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: false,
    deprecationErrors: true,
  },
  maxPoolSize: 10,
  minPoolSize: 1,
  maxIdleTimeMS: 30000,
  serverSelectionTimeoutMS: 15000,
  socketTimeoutMS: 60000,
  connectTimeoutMS: 15000,
  retryWrites: true,
  retryReads: true,
};

let clientPromise: Promise<MongoClient> | null = null;

if (resolvedUri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
    };

    if (!globalWithMongo._mongoClientPromise) {
      const client = new MongoClient(resolvedUri, clientOptions);
      globalWithMongo._mongoClientPromise = client.connect();
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // Production: Create new client for each serverless function invocation
    const client = new MongoClient(resolvedUri, clientOptions);
    clientPromise = client.connect();
  }
}

export async function getMongoDb() {
  if (!resolvedUri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please set it in your Vercel project settings."
    );
  }

  if (!clientPromise) {
    const client = new MongoClient(resolvedUri, clientOptions);
    clientPromise = client.connect();
  }
  try {
    console.log("Attempting to connect to MongoDB...");
    console.log("Environment:", process.env.NODE_ENV);
    console.log("MongoDB URI exists:", !!resolvedUri);
    console.log("Database name:", mongoDbName);

    const connectedClient = await clientPromise;
    console.log("MongoDB client connected");

    const db = connectedClient.db(mongoDbName);
    console.log("Database instance retrieved:", mongoDbName);

    // Test the connection with a ping
    await db.admin().ping();
    console.log("Database ping successful");

    return db;
  } catch (error) {
    console.error("MongoDB connection error:", error);
    console.error(
      "Error type:",
      error instanceof Error ? error.constructor.name : typeof error
    );
    console.error(
      "Error message:",
      error instanceof Error ? error.message : String(error)
    );

    throw new Error(
      `Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export default clientPromise;
