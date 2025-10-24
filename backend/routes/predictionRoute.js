const express = require('express');
const axios = require('axios');
const multer = require('multer');
const fs = require('fs').promises; // use promises API
const FormData = require('form-data');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.post('/predict-image', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ status: 'error', message: 'No image uploaded' });
  }

  const imagePath = req.file.path;

  try {
    const formData = new FormData();
    formData.append('image', await fs.createReadStream(imagePath));

    const response = await axios.post('http://127.0.0.1:5001/predict', formData, {
      headers: formData.getHeaders(),
    });

    const prediction = response.data.prediction;

    // Emit to frontend via Socket.IO
    const io = req.app.get('io');
    if (io) {
      io.emit('predictionWarning', { prediction });
    }

    console.log('Prediction successful:', prediction);

    res.status(200).json({ status: 'success', prediction });
  } catch (error) {
    console.error('Prediction error:', error.message);
    res.status(500).json({ status: 'error', message: 'Prediction failed' });
  } finally {
    // Delete the uploaded file safely
    try {
      await fs.unlink(imagePath);
    } catch (unlinkErr) {
      console.error('Failed to delete uploaded file:', unlinkErr.message);
    }
  }
});

module.exports = router;
