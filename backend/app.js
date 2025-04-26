const express = require("express");
const connectDB = require("./config/mongo");
const authRoutes = require("./routes/auth");
const stockRoutes = require("./routes/stocks");
const mlRoutes = require("./routes/machinelarning");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api", stockRoutes);
app.use("/api", authRoutes);
app.use("/api", mlRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
