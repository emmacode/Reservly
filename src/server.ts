import dotenv from "dotenv";
import app from "./app";
import mongoose from "mongoose";

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception! Shutting down...");
  if (err instanceof Error) {
    console.log(err.name, err.message);
  }
  process.exit(1);
});

dotenv.config();

if (!process.env.DATABASE) {
  throw new Error("Database connection string is not defined in env variables");
}

if (!process.env.DATABASE_PASSWORD) {
  throw new Error("Database password not defined in env variables");
}

const DB = process.env.DATABASE.replace(
  "<PASSWORD>",
  process.env.DATABASE_PASSWORD
);

// connect to DB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(DB);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("Error connecting to database:", error);
    process.exit(1);
  }
};

connectDB();

const port = process.env.PORT || 5000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log("Unhandled rejection! Shutting down...");
  if (err instanceof Error) {
    console.log(err.name, err.message);
  }
  server.close(() => {
    process.exit(1);
  });
});
