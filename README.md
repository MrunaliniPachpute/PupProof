# 🐾 PupProof – Blockchain-Powered Smart Dog Feeder  

## 🚀 Overview  
PupProof is a smart dog-feeding system that combines IoT, AI, and Blockchain to ensure transparency, prevent misuse, and gamify community-driven pet care.

##🔗Blockchain Integration

Decentralized Storage (IPFS): Proof-of-refill images are stored on IPFS via Pinata, ensuring they cannot be tampered with or faked. This makes the refill history transparent, verifiable, and censorship-resistant.
Decentralized Identity (MetaMask): Users log in using their MetaMask wallets instead of centralized accounts, providing self-sovereign identity.
Tokenized Incentives: Refill rewards are mapped to wallet addresses as PupCoins, with a clear upgrade path to ERC-20 tokens on Ethereum/Polygon.
Trustless Verification: Admin decisions + IPFS proof = transparent, auditable, and trust-minimized feeding records.
The system includes:  
- 🛠️ A **vending machine prototype** (Arduino + Servo Motor) that dispenses food.  
- 🤖 **Azure Computer Vision** to detect whether the uploaded image contains a puppy or adult dog.  
- 📂 **MongoDB database** to enforce fairness (prevent repeated feeding within a timeframe).  
- 🌐 **IPFS integration via Pinata** to store proof-of-refill images in a decentralized way.  
- 🔑 **MetaMask login + wallet mapping** to assign reward coins for valid refills.  
- 📊 **Admin/User Dashboard** built with Node.js, Express, and EJS to monitor activity.  

---

## ✨ Features  

### 🐕 IoT + AI Integration  
- Arduino Nano with Servo Motor controls the food dispensing mechanism.  
- LED feedback for successful refills.  
- Users upload images of dogs → verified using **Azure CV API**.  

### 🗂️ Fairness Control  
- MongoDB prevents duplicate feeding within a restricted timeframe.  
- Each request is logged with **userId, timestamp, machineId**.  

### 🌐 Blockchain Components  
- Proof-of-refill images are uploaded to **IPFS** via Pinata.  
- Admin can preview uploaded proof images directly from **IPFS gateways**.  
- Users **log in via MetaMask wallets**, ensuring unique decentralized identity.  
- Coins are **mapped to wallets** and can later be **upgraded into ERC-20 tokens**.  

### 🎮 Gamification & Rewards  
- Users earn **PupCoins** for every valid refill.  
- Points are displayed on the **user dashboard**.  
- Admins verify refills before coins are granted.  

---

## 🖼️ System Architecture  

1. **User Interaction**  
   - User uploads a dog image via UI.  
   - System validates image using Azure CV.  
   - If valid → sends request to vending machine.  

2. **IoT Feeder**  
   - Arduino opens servo motor for defined duration.  
   - LED blinks while dispensing.  

3. **Proof Recording**  
   - Before/After images uploaded to IPFS via Pinata.  
   - IPFS CIDs stored in MongoDB.  

4. **Admin Dashboard**  
   - Shows all requests.  
   - Admin accepts/rejects refill requests.  
   - Preview proof images from IPFS.  

5. **Rewards System**  
   - Accepted requests earn PupCoins.  
   - Coins mapped to MetaMask wallet addresses.  

---

## 🛠️ Tech Stack  

- **Frontend**: HTML, CSS, EJS, JavaScript  
- **Backend**: Node.js, Express.js  
- **Database**: MongoDB  
- **AI**: Azure Computer Vision API  
- **IoT**: Arduino Nano, Servo Motor, LED  
- **Blockchain**: IPFS (Pinata), MetaMask Wallet Integration, ERC-20 upgrade path  

---

## ⚡ Quick Start  

### Clone & Install  
```bash
git clone https://github.com/yourusername/pupproof.git
cd pupproof
npm install
```
## 🔮 Future Scope  

- 🐕 **Sensor-based Independence**: Replace manual image uploads with **weight/motion sensors** at the feeder. Dogs can independently trigger the refill without human intervention.  
- 💰 Convert **PupCoins** to real ERC-20 tokens on Polygon/ETH testnet.  
- 📱 Build a **mobile app** for community dog-feeding events and live feeder tracking.  
- 🏆 NFT badges for top contributors in the dog-feeding network.  
- 🌍 Scaling to smart cities → network of IoT feeders backed by blockchain proof.

Team PupProof
Mrunalini Pachpute
