const express = require("express");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.static(path.join(__dirname, "views")));

app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "views", "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Frontend Dashboard berjalan di http://localhost:${PORT}`);
});