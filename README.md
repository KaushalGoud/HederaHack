# Hedera Instant NFT Receipts ⚡

Pitch(pdf):https://drive.google.com/file/d/1Mmt7icLX_mL6rEH3fPZTvRoulpD2Y6Po/view?usp=drive_link

Demo Video (1 min):https://www.youtube.com/watch?v=lvDQ5Thyf0c

# Project Description
Instant NFT receipts with zero user friction.  
Customer clicks "Buy" → receives a beautiful NFT receipt instantly — no wallet connect, no signature, no token association, no waiting.  
The merchant's operator account pays all fees and handles minting atomically on Hedera Testnet.  
Perfect for e-commerce receipts, event tickets, loyalty badges, certificates, and access passes.  
Built for speed, beauty, and real-world usability — proving Hedera can deliver the smoothest NFT experience on the planet.

# Selected Track
* DeFi / Payments *  


### Tech Stack
| Layer           | Technology                                   |
|-----------------|-----------------------------------------------|
| Frontend        | React 19 + Vite + Tailwind CSS + Lucide Icons |
| Backend         | Node.js + Express                            |
| Blockchain      | Hedera Testnet                               |
| SDK             | @hashgraph/sdk@latest                        |
|       |                        |
| Deployment      | Frontend: Netlify
| Environment     | .env + Vite proxy                            |

# Backend
cd hedera-backend
npm install
Add your testnet operator ID & key in .env
npm run dev

# Frontend (new terminal)
cd frontend
npm install
npm run dev
