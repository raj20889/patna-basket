require('dotenv').config();

module.exports = {
  RAZORPAY: {
    KEY_ID: process.env.RAZORPAY_KEY_ID || 'rzp_test_RiQhSlvG39EQgN',
    KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'HZwDbzTMVnbKziYiug6kSLLf',
  },
};