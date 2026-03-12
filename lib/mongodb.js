import { MongoClient, ServerApiVersion } from "mongodb";
import { logInfo } from "@/lib/logger";

const dbName = process.env.MONGODB_DB || "techfest_leaderboard";
const collectionName = process.env.LEADERBOARD_COLLECTION || "entries";

let client;
let clientPromise;

function getClientPromise() {
  if (clientPromise) {
    return clientPromise;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true
      },
      maxPoolSize: 10,
      minPoolSize: 1,
      connectTimeoutMS: 8000,
      socketTimeoutMS: 20000,
      retryWrites: true,
      retryReads: true
    });

    global._mongoClientPromise = client.connect();
    logInfo("mongo_connect_init", { dbName, collectionName });
  }

  clientPromise = global._mongoClientPromise;
  return clientPromise;
}

export async function getCollection() {
  const connectedClient = await getClientPromise();
  return connectedClient.db(dbName).collection(collectionName);
}
