import {
  MongoClient,
  ServerApiVersion,
  type MongoClientOptions,
} from "mongodb";

const resolvedUri =
  process.env.MONGODB_URI ?? process.env.NEXT_PUBLIC_MONGODB_URI ?? "";

if (!resolvedUri) {
  throw new Error(
    "Missing MONGODB_URI environment variable. Please set it in your environment configuration."
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
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  retryReads: true,
};

const client = new MongoClient(resolvedUri, clientOptions);

let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export async function getMongoDb() {
  try {
    console.log("🔌 Attempting to connect to MongoDB...");
    const connectedClient = await clientPromise;
    console.log("✅ MongoDB client connected");
    const db = connectedClient.db(mongoDbName);
    console.log("✅ Database instance retrieved:", mongoDbName);
    return db;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw new Error(
      `Failed to connect to MongoDB: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

export default clientPromise;
