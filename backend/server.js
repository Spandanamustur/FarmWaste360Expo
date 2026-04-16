import express from "express";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb+srv://<your-username>:<your-password>@cluster.mongodb.net/farmwaste", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.log("❌ MongoDB Error:", err));

// Schema
const WasteSchema = new mongoose.Schema({
  wasteItem: String,
  quantity: String,
  image: String,
  location: Object,
  timestamp: String,
});

const Waste = mongoose.model("Waste", WasteSchema);

// Routes
app.post("/addWaste", async (req, res) => {
  try {
    const waste = new Waste(req.body);
    await waste.save();
    res.status(200).json({ message: "Waste added successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error adding waste", error: err });
  }
});

app.get("/getWaste", async (req, res) => {
  try {
    const data = await Waste.find().sort({ _id: -1 });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: "Error fetching waste data" });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
