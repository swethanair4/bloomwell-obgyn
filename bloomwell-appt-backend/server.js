const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Logging for POST requests
app.use((req, res, next) => {
  if (req.method === 'POST') {
    console.log(`[${req.method}] ${req.url} — Body:`, req.body);
  }
  next();
});

// MongoDB connection

const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);


// Schema
const Appointment = mongoose.model('Appointment', {
  name: String,
  email: String,
  date: String,
  time: String,
  doctor: String
});

// Test route
app.get('/api/test', (req, res) => {
  console.log("✅ /api/test route hit");
  res.json({ success: true, message: "Test route is working!" });
});

// API: Save new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const newAppointment = new Appointment(req.body);
    await newAppointment.save();
    res.status(201).json({
      message: `Appointment booked for ${req.body.name} on ${req.body.date} at ${req.body.time}.`,
      appointment: newAppointment
    });
  } catch (error) {
    console.error("❌ Error saving appointment:", error);
    res.status(500).json({ error: 'Failed to save appointment' });
  }
});

// API: Get booked time slots for a doctor/date
app.get('/api/appointments', async (req, res) => {
  const { doctor, date } = req.query;
  console.log("GET /api/appointments called with:", { doctor, date });

  if (!doctor || !date) {
    return res.status(400).json({ error: 'Doctor and date are required.' });
  }

  try {
    const appointments = await Appointment.find({ doctor, date });
    const bookedTimes = appointments.map(a => a.time);
    res.json({ bookedTimes });
  } catch (error) {
    console.error("❌ Error fetching appointments:", error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

// Fallback for unknown routes
app.use((req, res) => {
  console.log("❗ 404 fallback:", req.method, req.url);
  res.status(404).send("Route not found");
});

// Static file serving (e.g., for AppointmentBooking.html in /public)
app.use(express.static(path.join(__dirname, 'public')));

// Start server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000');
});
