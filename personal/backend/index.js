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

// ▶️ Get all entries with PROPER timezone handling
app.get("/api/entries", auth, async (req, res) => {
  try {
    let query = { userId: req.userId };

    if (req.query.date) {
      const dateStr = req.query.date; // e.g. "2025-07-22"
      const timezoneOffset = parseInt(req.query.timezoneOffset) || 0; // minutes
      
      if (isNaN(Date.parse(dateStr))) {
        return res.status(400).json({ error: "Invalid date format" });
      }

      // Create the selected date in the user's timezone
      const selectedDate = new Date(dateStr + 'T00:00:00');
      
      // Convert timezone offset from minutes to milliseconds
      // Note: getTimezoneOffset() returns positive values for timezones west of UTC
      const offsetMs = timezoneOffset * 60 * 1000;
      
      // Calculate start and end of day in user's local timezone, then convert to UTC
      const startOfDayLocal = new Date(selectedDate.getTime());
      const endOfDayLocal = new Date(selectedDate.getTime() + (24 * 60 * 60 * 1000) - 1);
      
      // Convert to UTC by subtracting the timezone offset
      const startOfDayUTC = new Date(startOfDayLocal.getTime() - offsetMs);
      const endOfDayUTC = new Date(endOfDayLocal.getTime() - offsetMs);

      console.log(`🔍 Filtering for date: ${dateStr} (timezone offset: ${timezoneOffset} minutes)`);
      console.log(`📅 Local start: ${startOfDayLocal.toISOString()}`);
      console.log(`📅 Local end: ${endOfDayLocal.toISOString()}`);
      console.log(`📅 UTC start: ${startOfDayUTC.toISOString()}`);
      console.log(`📅 UTC end: ${endOfDayUTC.toISOString()}`);

      query.createdAt = {
        $gte: startOfDayUTC,
        $lte: endOfDayUTC,
      };
    }

    const entries = await Entry.find(query).sort({ createdAt: -1 });
    
    // Debug log to see what we're returning
    if (req.query.date) {
      console.log(`📊 Found ${entries.length} entries for date ${req.query.date}`);
      entries.forEach(entry => {
        const localTime = new Date(entry.createdAt.getTime() + (parseInt(req.query.timezoneOffset || 0) * 60 * 1000));
        console.log(`  📝 Entry "${entry.title}" created at UTC: ${entry.createdAt.toISOString()} | Local: ${localTime.toISOString()}`);
      });
    }
    
    res.json(entries);
  } catch (err) {
    console.error("Error fetching entries:", err);
    res.status(500).json({ error: "Something went wrong on the server." });
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
