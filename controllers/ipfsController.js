const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.getIpfs = async (req, res) => {
  const { cid } = req.params;
  try {
    const response = await fetch(`https://gateway.pinata.cloud/ipfs/${cid}`);
    if (!response.ok) {
      return res.status(502).send("Failed to fetch image from Pinata");
    }
    const contentType = response.headers.get("content-type") || "image/jpeg";
    res.set("Content-Type", contentType);

    const buffer = await response.arrayBuffer();
    res.send(Buffer.from(buffer));
  } catch (err) {
    console.error("IPFS fetch error:", err);
    res.status(500).send("Server error fetching IPFS image");
  }
};