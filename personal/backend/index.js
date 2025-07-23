// ✅ Required Packages
const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cors = require("cors");
require("dotenv").config();

// ✅ App Setup
const app = express();
app.use(express.json());

// ✅ Allowed Origins
const allowedOrigins = [
  "http://localhost:5173", // Local dev
  "https://your-frontend.onrender.com", // ✅ Replace with your actual frontend Render URL
];

// ✅ CORS Options
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman) or from allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));


// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// ✅ Schemas
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  username: { type: String },
});
const User = mongoose.model("User", userSchema);

const entrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [String],
  },
  { timestamps: true }
);
const Entry = mongoose.model("Entry", entrySchema);

// ✅ JWT Middleware
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (err) {
    res.status(403).json({ message: "Invalid token" });
  }
};

// ✅ Routes

// ▶️ Signup
app.post("/api/signup", async (req, res) => {
  const { email, password, username } = req.body; // ✅ get username too

  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "User already exists" });

    const hash = await bcrypt.hash(password, 10);

    // ✅ save username along with email and password
    const user = await User.create({ email, password: hash, username });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Signup error", error: err });
  }
});


// ▶️ Login
app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: "Login error", error: err });
  }
});


// ▶️ Get Current User Info
app.get("/api/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("email username");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Error getting user info", error: err });
  }
});




// ▶️ Create Entry
app.post("/api/entries", auth, async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const entry = await Entry.create({
      userId: req.userId,
      title,
      content,
      tags: tags?.slice(0, 3) || [],
    });
    res.json(entry);
  } catch (err) {
    res.status(500).json({ message: "Entry creation failed", error: err });
  }
});

// ▶️ Get All Entries
app.get("/api/entries", auth, async (req, res) => {
  const { search, date } = req.query;
  const query = { userId: req.userId };

  if (search) {
    const regex = new RegExp(search, "i");
    query.$or = [
      { title: { $regex: regex } },
      { content: { $regex: regex } },
      { tags: { $elemMatch: { $regex: regex } } }// ✅ allow searching inside tags
    ];
  }

 if (date) {
  const selectedDate = new Date(date);

  const start = new Date(selectedDate);
  start.setHours(0, 0, 0, 0); // IST/local time

  const end = new Date(selectedDate);
  end.setHours(23, 59, 59, 999); // IST/local time

  query.createdAt = { $gte: start, $lte: end };
}


  try {
    const entries = await Entry.find(query).sort({ createdAt: -1 });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch entries", error: err });
  }
});

// ▶️ Update Entry
app.put("/api/entries/:id", auth, async (req, res) => {
  const { title, content, tags } = req.body;
  try {
    const updated = await Entry.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { title, content, tags: tags?.slice(0, 3) || [] },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Entry not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed", error: err });
  }
});

// ▶️ Delete Entry
app.delete("/api/entries/:id", auth, async (req, res) => {
  try {
    const deleted = await Entry.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: "Entry not found" });
    res.json({ message: "Entry deleted" });
  } catch (err) {
    res.status(500).json({ message: "Delete failed", error: err });
  }
});

// ✅ Server Listen
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
