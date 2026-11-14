require("dotenv").config();

const express = require("express");
const cors = require("cors");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const serviceAccount = require("./serviceAccountKey.json");

const app = express();
initializeApp({
  credential: cert(serviceAccount),
});
const db = getFirestore();
const PORT = 5000;
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.get("/", (req, res) => {
  res.json({
    message: "MeetNova backend is running",
  });
});

app.get("/api/firestore-test", async (req, res) => {
  try {
    await db.collection("system").doc("test").set({
      message: "MeetNova Firestore connected",
      createdAt: new Date(),
    });

    res.json({
      success: true,
      message: "Firestore connection successful",
    });
  } catch (error) {
    console.error("Firestore test failed:", error.message);

    res.status(500).json({
      success: false,
      message: "Firestore connection failed",
    });
  }
});

app.get("/api/test", (req, res) => {
  res.json({
    message: "Frontend can connect to MeetNova backend",
  });
});

app.listen(PORT, () => {
  console.log(`MeetNova server running on http://localhost:${PORT}`);
});