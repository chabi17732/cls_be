const db = require("../db");
const express = require("express");
const router = express.Router();

// Fetch latest data by macaddress
router.get("/data/:macaddress", async (req, res) => {
  const { macaddress } = req.params;

  if (!macaddress) {
    return res.status(400).json({ error: "macaddress is required" });
  }

  try {
    const device = await db.query(
      "SELECT * FROM users WHERE macaddress = $1",
      [macaddress]
    );

    if (device.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }

    const result = await db.query(
      `SELECT * FROM userdata 
       WHERE macaddress = $1 
       ORDER BY time DESC 
       LIMIT 1`,
      [macaddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No data found for this device" });
    }

    res.status(200).json({
      message: "Latest data fetched successfully",
      data: result.rows[0]
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Fetch history data by macaddress
router.get("/history/:macaddress", async (req, res) => {
  const { macaddress } = req.params;

  if (!macaddress) {
    return res.status(400).json({ error: "macaddress is required" });
  }

  try {
    const device = await db.query(
      "SELECT * FROM users WHERE macaddress = $1",
      [macaddress]
    );

    if (device.rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }

    const result = await db.query(
      `SELECT * FROM userdata 
       WHERE macaddress = $1 
       ORDER BY time DESC 
       LIMIT 50`,   // fetch last 50 entries
      [macaddress]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No history data found for this device" });
    }

    res.status(200).json({
      message: "History data fetched successfully",
      data: result.rows
    });
  } catch (error) {
    console.error("Error fetching history:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
