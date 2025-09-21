const express = require('express');
const { createClient } = require('@supabase/supabase-js');

// ----------------- Supabase Config -----------------
const supabaseUrl = "https://rsmxdaycgyvniurkaqiz.supabase.co"; // 🔹 Replace with your Supabase URL
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJzbXhkYXljZ3l2bml1cmthcWl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIxNTAyMzcsImV4cCI6MjA2NzcyNjIzN30.kxM4exayLfVtwr3v1DuxiotkDDQDqMNQAStH-KOS_sE"; // 🔹 Replace with your Supabase service_role key
const supabase = createClient(supabaseUrl, supabaseKey);

// ----------------- Express Server -----------------
const app = express();
const port = 5005;

// Middleware to parse JSON bodies
app.use(express.json());

// ----------------- API Endpoint -----------------
app.post('/esp32', async (req, res) => {
    try {
        const { macaddress, moisture, temperature } = req.body;

        // Ensure all required data is present
        if (!macaddress || moisture === undefined || temperature === undefined) {
            return res.status(400).json({ error: "Missing required sensor data" });
        }

        console.log(`Received data from ESP32: MAC: ${macaddress}, Moisture: ${moisture}%, Temp: ${temperature}°C`);

        // Insert data into the 'sensor_data' table
        const { data, error } = await supabase
            .from('sensor_data')
            .insert([
                { macaddress, moisture, temperature }
            ]);

        if (error) {
            console.error("Supabase insertion error:", error);
            return res.status(500).json({ error: "Failed to save data to Supabase" });
        }

        console.log("✅ Data inserted successfully!");
        res.status(200).json({ message: "Data received and saved successfully" });

    } catch (err) {
        console.error("An error occurred:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Start the server
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server listening on http://0.0.0.0:${port}`);
    console.log("Waiting for data from ESP32...");
});