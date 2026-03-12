import { MongoClient, ServerApiVersion } from "mongodb";
import { logInfo } from "@/lib/logger";

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB || "techfest_leaderboard";
const collectionName = process.env.LEADERBOARD_COLLECTION || "entries";

if (!uri) {
  throw new Error("MONGODB_URI is not configured");
}

let client;
let clientPromise;

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

export async function getCollection() {
  const connectedClient = await clientPromise;
  return connectedClient.db(dbName).collection(collectionName);
}
