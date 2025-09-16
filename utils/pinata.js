const axios = require('axios');
const FormData = require('form-data');
require('dotenv').config();


async function uploadToPinata(buffer, fileName) {
  if (!buffer || buffer.length === 0) {
    throw new Error("Buffer is empty");
  }

  const formData = new FormData();
  formData.append('file', buffer, fileName);

  try {
    const res = await axios.post('https://api.pinata.cloud/pinning/pinFileToIPFS', formData, {
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_API_SECRET,
        ...formData.getHeaders()
      }
    });

    // console.log(`Uploaded ${fileName} to Pinata with CID: ${res.data.IpfsHash}`);
    return res.data.IpfsHash;

  } catch (err) {
    console.error("Pinata upload failed:", err.response?.data || err.message);
    throw err;
  }
}

module.exports = { uploadToPinata };
