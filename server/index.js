require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const moment = require('moment'); 
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const ParticipantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone_number: { type: String, required: true },
  age: { type: Number, required: true, min: 18, max: 65 },
  current_month_enrolled: { type: Boolean, default: false },
  batches: [{
    month: { type: String, default: moment().format('YYYY-MM') },
    batch: { type: String, required: true },
  }],
});

const Participant = mongoose.model('Participant', ParticipantSchema);
app.get('/', async (req, res) => {
  res.json({"msg":"welcome to flexmoney"})
})
app.post('/api/enroll', async (req, res) => {
  const { name, email, phone_number, age, preferredBatch } = req.body;

  // Validate user data
  if (!name || !email || !phone_number || !preferredBatch) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  function simulatePayment(userDetails) {
    // Simulate payment processing with a 2-second delay
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // Replace this with your actual payment logic (e.g., calling a payment gateway API)
        const paymentSuccessful = true
  
        if (paymentSuccessful) {
          resolve(true);
        } else {
          reject(new Error('Payment failed'));
        }
      }, 2000); // 2 seconds delay
    });
  }
  
  simulatePayment(req.body)
    .then(() => {
      console.log('Payment successful!');
      // Proceed with enrollment or other post-payment actions
    })
    .catch((error) => {
      console.error('Payment failed:', error);
      // Handle payment failure and display error message
    });

  // Save participant data
  const participant = new Participant({
    name,
    email,
    phone_number,
    age,
    current_month_enrolled: true,
    batches: [{ month: new Date().toISOString().slice(0, 7), batch: preferredBatch }],
  });

  try {
    await participant.save();
    res.json({ success:true, message: 'Successfully enrolled!', currentMonthEnrolled: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success:false, message: 'Internal server error. Please try again later.' });
  }
});

app.listen(process.env.PORT, () => {
    console.log(`Server listening on port ${process.env.PORT}`)
  })