import mongoose from "mongoose";

const mongoUri = process.env.MONGODB_URI;

// Global connection cache to prevent multiple connections
interface CachedConnection {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend global interface
declare global {
  // eslint-disable-next-line no-var
  var mongoose: CachedConnection | undefined;
}

let cached: CachedConnection = global.mongoose || { conn: null, promise: null };

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectToMongoDB() {
  try {
    if (cached.conn) {
      return cached.conn;
    }

    if (!cached.promise) {
      const opts = {
        bufferCommands: false,
        maxPoolSize: 10, // Maintain up to 10 socket connections
        serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      };

      cached.promise = mongoose.connect(mongoUri as string, opts);
    }

    cached.conn = await cached.promise;
    return cached.conn;
  } catch (error) {
    console.log("MongoDB error", error);
    throw error;
  }
}
