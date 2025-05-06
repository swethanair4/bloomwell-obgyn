// models/hospital.js
const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  name: String,
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number]  // [longitude, latitude]
  },
  emergencyServices: [String],
  contact: String
});

hospitalSchema.index({ location: '2dsphere' }); // Enables geospatial queries

module.exports = mongoose.model('Hospital', hospitalSchema);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Hospital = require('./models/hospital');

const app = express();
app.use(cors());
app.use(express.json());


const mongoURI = process.env.MONGODB_URI;
mongoose.connect(mongoURI);


// GET: Nearby hospitals based on user's coordinates
app.get('/api/hospitals', async (req, res) => {
  const { lat, lng } = req.query;

  try {
    const hospitals = await Hospital.find({
      location: {
        $nearSphere: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: 20000 // 20 km
        }
      }
    });
    res.json(hospitals);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});