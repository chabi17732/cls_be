const express = require("express");
const db = require("../db");
const router = express.Router();

// Get MAC address by userid (UUID from Supabase)
router.get("/:userid", async (req, res) => {
  const { userid } = req.params;

  if (!userid) {
    return res.status(400).json({ error: "userid is required" });
  }

  try {
    const result = await db.query(
      "SELECT macaddress FROM users WHERE userid = $1",
      [userid]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({ macaddress: result.rows[0].macaddress });
  } catch (error) {
    console.error("Error fetching MAC address:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// routes/users.js
router.post("/assign", async (req, res) => {
  const { userid, macaddress } = req.body;

  if (!userid || !macaddress) {
    return res.status(400).json({ error: "userid and macaddress are required" });
  }

  try {
    // Ensure MAC address is not already assigned to another user
    const existingMac = await db.query(
      "SELECT * FROM users WHERE macaddress = $1 AND userid != $2",
      [macaddress, userid]
    );

    if (existingMac.rows.length > 0) {
      return res.status(400).json({ error: "MAC address already assigned to another user" });
    }

    // Insert new row or update existing user's device
    await db.query(
      `INSERT INTO users (userid, macaddress)
       VALUES ($1, $2)
       ON CONFLICT (userid) DO UPDATE SET macaddress = EXCLUDED.macaddress`,
      [userid, macaddress]
    );

    res.status(200).json({ message: "Device assigned successfully" });
  } catch (error) {
    console.error("Error assigning device:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }

module.exports = router;
