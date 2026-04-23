require('dotenv').config();
const axios = require('axios');

const API_URL = process.env.API_URL || 'http://localhost:5000';

async function debugHealth() {
  try {
    const response = await axios.get(`${API_URL}/api/health`);
    console.log('Response structure:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    if (error.response) {
      console.log('Response data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

debugHealth();
