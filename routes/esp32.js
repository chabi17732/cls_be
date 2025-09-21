const db = require("../db");
const express = require("express");
const router = express.Router();


router.post("/data", async (req, res) => {
    const {macaddress, moisture, temperature} = req.body;

    if (macaddress === undefined || moisture === undefined || temperature === undefined) {
        return res.status(400).json({ error: "All fields are required" });
    }
    try{
        const deviceavibility = await db.query(
            "SELECT * FROM users WHERE macaddress = $1",
            [macaddress]
        );

        if (deviceavibility.rows.length === 0) {
            return res.status(404).json({ error: "Device not found" });
        }

        const result = await db.query(
            "INSERT INTO userdata (macaddress, moisture, temperature) VALUES ($1, $2, $3) RETURNING *",
            [macaddress, moisture, temperature]
        );

        res.status(201).json({
            message: "Data inserted successfully",
            data: result.rows[0]
        })
    }catch(error){
        console.error("Error inserting data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});
        
module.exports = router;

