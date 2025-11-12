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
  maxIdleTimeMS: 10000,
  serverSelectionTimeoutMS: 8000, // Increased slightly for stability
  socketTimeoutMS: 15000, // Increased for better reliability
  connectTimeoutMS: 8000, // Increased for better reliability
  retryWrites: true,
  retryReads: true,
  // SSL/TLS settings for MongoDB Atlas
  tls: true,
  tlsAllowInvalidCertificates: false,
  tlsAllowInvalidHostnames: false,
};

let clientPromise: Promise<MongoClient> | null = null;
let globalClient: MongoClient | null = null;

// Helper function to create a fresh connection
async function createConnection(): Promise<MongoClient> {
  console.log("Creating new MongoDB connection...");
  const client = new MongoClient(resolvedUri, clientOptions);

  try {
    await client.connect();
    console.log("MongoDB connection established successfully");
    return client;
  } catch (error) {
    console.error("Failed to establish MongoDB connection:", error);
    await client.close().catch(() => {}); // Clean up failed connection
    throw error;
  }
}

if (resolvedUri) {
  if (process.env.NODE_ENV === "development") {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>;
      _mongoClient?: MongoClient;
    };

    if (!globalWithMongo._mongoClientPromise) {
      globalWithMongo._mongoClientPromise = createConnection();
      globalWithMongo._mongoClientPromise
        .then((client) => {
          globalWithMongo._mongoClient = client;
        })
        .catch(() => {
          // Reset on error
          globalWithMongo._mongoClientPromise = undefined;
          globalWithMongo._mongoClient = undefined;
        });
    }
    clientPromise = globalWithMongo._mongoClientPromise;
  } else {
    // Production: Try to reuse existing client if available
    if (globalClient) {
      clientPromise = Promise.resolve(globalClient);
    } else {
      clientPromise = createConnection().then((client) => {
        globalClient = client;
        return client;
      });
    }
  }
}

export async function getMongoDb() {
  if (!resolvedUri) {
    throw new Error(
      "Missing MONGODB_URI environment variable. Please set it in your Vercel project settings."
    );
  }

  let lastError: Error | null = null;
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`MongoDB connection attempt ${attempt}/${maxRetries}...`);
      console.log("Environment:", process.env.NODE_ENV);
      console.log("MongoDB URI exists:", !!resolvedUri);
      console.log("Database name:", mongoDbName);

      // If clientPromise is null or failed, create a new one
      if (!clientPromise) {
        console.log("No existing client promise, creating new connection...");
        clientPromise = createConnection();
      }

      const connectedClient = await clientPromise;
      console.log("MongoDB client connected successfully");

      const db = connectedClient.db(mongoDbName);

      // Test the connection with a ping
      await db.admin().ping();
      console.log("Database ping successful:", mongoDbName);

      return db;
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      console.error(`MongoDB connection attempt ${attempt} failed:`, {
        name: lastError.name,
        message: lastError.message,
        attempt,
        maxRetries,
      });

      // Reset client promise to force new connection on next attempt
      clientPromise = null;
      globalClient = null;

      // Wait before retrying (exponential backoff)
      if (attempt < maxRetries) {
        const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Waiting ${waitTime}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  // If we've exhausted all retries, throw a detailed error
  const errorMessage = lastError
    ? `Failed to connect to MongoDB after ${maxRetries} attempts: ${lastError.message}`
    : `Failed to connect to MongoDB after ${maxRetries} attempts`;

  console.error("All MongoDB connection attempts failed");
  throw new Error(errorMessage);
}

export default clientPromise;
