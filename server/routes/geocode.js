const express = require('express');
const router = express.Router();
const axios = require('axios');

// Geocode route
router.get('/', async (req, res) => {
    console.log('Received request for /geocode'); // Log route access
    const { address } = req.query;
    console.log('Query parameter - address:', address); // Log query parameter

    if (!address) {
        console.warn('Address parameter is missing'); // Log missing parameter
        return res.status(400).json({ error: 'Address is required' });
    }

    try {
        console.log('Sending request to OpenCage API with address:', address); // Log API request
        const response = await axios.get('https://api.opencagedata.com/geocode/v1/json', {
            params: {
                q: address,
                key: '0626c5daf4054daea57d6768d5a22b08', // Replace with your OpenCage API key
            },
        });
        console.log('Received response from OpenCage API:', response.data); // Log API response
        res.json(response.data);
    } catch (error) {
        console.error('Error occurred while fetching data from OpenCage API:', error.message); // Log error
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;