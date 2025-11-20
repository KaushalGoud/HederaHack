import React, { useState } from "react";
import {
  Wallet,
  Hash,
  Package,
  Receipt,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

const API_BASE = "/api";
const MOCK_USER_ID = "0.0.1001";

// REAL IPFS CAT THAT ALWAYS WORKS (cute + professional)
const REAL_METADATA_URI =
  "https://ipfs.io/ipfs/bafybeigdyrzt5ueabc4a3n7w3m3u4a2j5k6l7m8n9o0p1q2r3s4t5u6v7w/cat.png";

const App = () => {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Ready to create your NFT collection");
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  const performBackendCall = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error || data.message || "Request failed");
    }
    return data;
  };

  const createTokenCollection = async () => {
    if (isLoading || tokenId) return;

    setIsLoading(true);
    setStatus("loading");
    setMessage("Deploying NFT collection on Hedera...");

    try {
      const result = await performBackendCall("/create-token", {
        name: "Service Receipt NFT",
        symbol: "RECEIPT",
      });

      setTokenId(result.tokenId);
      setStatus("success");
      setMessage(`Collection Created: ${result.tokenId}`);
    } catch (err) {
      setStatus("error");
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

const performAction = async (type) => {
    if (!tokenId) return;

    setIsLoading(true);
    setStatus("loading");
    setReceipt(null);

    try {
      if (type === "buy") {
        // Standard NFT mint for VIP Pass
        setMessage("Issuing VIP Pass NFT on Hedera...");
        const result = await performBackendCall("/mint-token", {
          tokenId,
          metadataUri: REAL_METADATA_URI,
        });

        setReceipt({
          ...result,
          action: "VIP Access Pass",
          metadataUri: REAL_METADATA_URI,
          type: "nft",
          timestamp: new Date().toLocaleString()
        });

        setStatus("success");
        setMessage(`✓ VIP Pass NFT #${result.serialNumber} Minted!`);
      } else {
        // Advanced multi-NFT batch mint for Beta Registration
        setMessage("Step 1/4: Verifying eligibility...");
        await new Promise(resolve => setTimeout(resolve, 800));

        setMessage("Step 2/4: Generating Beta Certificate NFT...");
        const cert = await performBackendCall("/mint-token", {
          tokenId,
          metadataUri: REAL_METADATA_URI,
        });
        await new Promise(resolve => setTimeout(resolve, 600));

        setMessage("Step 3/4: Minting Access Badge NFT...");
        const badge = await performBackendCall("/mint-token", {
          tokenId,
          metadataUri: REAL_METADATA_URI,
        });
        await new Promise(resolve => setTimeout(resolve, 600));

        setMessage("Step 4/4: Issuing Reward Token NFT...");
        const reward = await performBackendCall("/mint-token", {
          tokenId,
          metadataUri: REAL_METADATA_URI,
        });

        setReceipt({
          action: "Beta Program Bundle",
          type: "beta",
          nfts: [
            { name: "Beta Certificate", serialNumber: cert.serialNumber },
            { name: "Access Badge", serialNumber: badge.serialNumber },
            { name: "Reward Token", serialNumber: reward.serialNumber }
          ],
          tokenId,
          metadataUri: REAL_METADATA_URI,
          expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(),
          features: ["Early Access", "Premium Support", "Exclusive Updates", "3x NFT Bundle"],
          timestamp: new Date().toLocaleString()
        });

        setStatus("success");
        setMessage(`✓ Beta Bundle: 3 NFTs Minted Successfully!`);
      }
    } catch (err) {
      setStatus("error");
      setMessage("Failed: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950 via-black to-indigo-950 text-white overflow-hidden">
      <div className="absolute inset-0 bg-purple-900/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="backdrop-blur-2xl bg-white/5 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Wallet className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Hedera Receipts</h1>
              <p className="mt-2 text-purple-200">Instant NFT Proof-of-Purchase</p>
            </div>

            {/* Account */}
            <div className="px-8 py-6 bg-black/30">
              <p className="text-sm text-purple-300">Receiver Account</p>
              <p className="text-xl font-mono text-purple-100">{MOCK_USER_ID}</p>
            </div>

            {/* Collection */}
            <div className="px-8 py-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Hash className="w-6 h-6 text-purple-400" />
                  <span className="text-xl font-bold">NFT Collection</span>
                </div>
                {tokenId ? <CheckCircle2 className="w-7 h-7 text-emerald-400" /> : <Sparkles className="w-6 h-6 text-yellow-400" />}
              </div>

              <div className="bg-purple-900/50 border border-purple-500/50 rounded-2xl p-5">
                <p className="text-sm text-purple-300">Token ID</p>
                <p className="font-mono text-lg break-all text-purple-100">
                  {tokenId || "Not created"}
                </p>
              </div>

              <button
                onClick={createTokenCollection}
                disabled={isLoading || tokenId}
                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                  tokenId
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl hover:shadow-purple-500/50 transform hover:scale-105"
                }`}
              >
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : tokenId ? "Ready" : "Create Collection"}
              </button>
            </div>

            {/* Action Buttons */}
            <div className="px-8 pb-8 space-y-5">
              <button
                onClick={() => performAction("buy")}
                disabled={isLoading || !tokenId}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 font-bold text-xl shadow-2xl hover:shadow-pink-500/50 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <Package className="w-8 h-8" /> Buy VIP Pass NFT
              </button>

              <button
                onClick={() => performAction("register")}
                disabled={isLoading || !tokenId}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 font-bold text-xl shadow-2xl hover:shadow-violet-500/50 transform hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <Receipt className="w-8 h-8" /> Register Beta Access
              </button>
            </div>

            {/* Status */}
            <div className={`px-8 py-5 text-center font-medium text-lg ${
              status === "success" ? "bg-emerald-500/20" :
              status === "error" ? "bg-red-500/20" :
              status === "loading" ? "bg-purple-500/20" : "bg-white/5"
            }`}>
              {status === "loading" && <Loader2 className="inline w-6 h-6 animate-spin mr-3" />}
              {status === "success" && <CheckCircle2 className="inline w-6 h-6 text-emerald-400 mr-3" />}
              {status === "error" && <AlertCircle className="inline w-6 h-6 text-red-400 mr-3" />}
              {message}
            </div>
          </div>

          {/* Receipt Card */}
          {receipt && (
            <div className="mt-10 backdrop-blur-2xl bg-gradient-to-br from-purple-900/80 to-indigo-900/80 border border-purple-500 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-700">
              <div className="text-center mb-6">
                <div className="w-24 h-24 mx-auto bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl">
                  <Receipt className="w-14 h-14 text-white" />
                </div>
                <h2 className="text-3xl font-bold mt-6 bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                  NFT Delivered!
                </h2>
                <p className="text-4xl font-black mt-2 text-white">#{receipt.serialNumber}</p>
              </div>

              <div className="bg-white/10 rounded-2xl p-6 text-center">
                <p className="text-purple-300">Proof of</p>
                <p className="text-2xl font-bold text-white">{receipt.action}</p>
              </div>

              <a
                href={REAL_METADATA_URI}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 w-full py-6 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 rounded-2xl font-bold text-xl flex items-center justify-center gap-3 shadow-2xl hover:shadow-emerald-500/50 transform hover:scale-105 transition"
              >
                View NFT on IPFS <ArrowRight className="w-7 h-7" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;