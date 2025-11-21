import React, { useState } from "react";
import {
  Wallet, Hash, Package, Receipt, ArrowRight,
  Sparkles, CheckCircle2, AlertCircle, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const API_BASE = "/api";
const MOCK_USER_ID = "0.0.1001";

const VIP_CAT = "https://ipfs.io/ipfs/bafybeigdyrzt5ueabc4a3n7w3m3u4a2j5k6l7m8n9o0p1q2r3s4t5u6v7w/cat.png";
const BETA_CAT = "https://ipfs.io/ipfs/bafybeihzolb2u5w5ca4x3j4u6v7w8x9y2z3a4b5c6d7e8f9g1h2i3j4k5l/purple-cat.png";

const App = () => {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("Ready to create your NFT collection");
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenId, setTokenId] = useState(null);
  const navigate = useNavigate();

  const performBackendCall = async (endpoint, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Failed");
    return data;
  };

  const createTokenCollection = async () => {
    if (isLoading || tokenId) return;
    setIsLoading(true);
    setStatus("loading");
    setMessage("Deploying NFT collection on Hedera...");

    try {
      const result = await performBackendCall("/create-token", {});
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
    if (!tokenId) return setMessage("Create collection first!");

    setIsLoading(true);
    setStatus("loading");
    setReceipt(null);

    const isVIP = type === "buy";
    const metadataUri = isVIP ? VIP_CAT : BETA_CAT;
    const actionTitle = isVIP ? "VIP Access Pass" : "Beta Program Access";
    const loadingText = isVIP ? "Issuing VIP Pass..." : "Registering Beta Access...";
    setMessage(loadingText);

    try {
      const result = await performBackendCall("/mint-token", {
        tokenId,
        metadataUri
      });

      setReceipt({ ...result, action: actionTitle, metadataUri });
      setStatus("success");
      setMessage(`NFT #${result.serialNumber} Delivered!`);

      // Auto-redirect to receipt page
      setTimeout(() => {
        navigate(isVIP ? `/vip-receipt/${result.serialNumber}` : `/beta-receipt/${result.serialNumber}`);
      }, 1500);

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
          <div className="backdrop-blur-2xl bg-white/5 border border-purple-500/30 rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-700 via-purple-600 to-indigo-700 p-8 text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
                <Wallet className="w-12 h-12" />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">Hedera Receipts</h1>
              <p className="mt-2 text-purple-200">Instant NFT Proof-of-Purchase</p>
            </div>

            <div className="px-8 py-6 bg-black/30">
              <p className="text-sm text-purple-300">Receiver Account</p>
              <p className="text-xl font-mono text-purple-100">{MOCK_USER_ID}</p>
            </div>

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
                <p className="font-mono text-lg break-all text-purple-100">{tokenId || "Not created"}</p>
              </div>

              <button
                onClick={createTokenCollection}
                disabled={isLoading || tokenId}
                className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-3 ${
                  tokenId
                    ? "bg-emerald-600/30 text-emerald-300 border border-emerald-500"
                    : "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-xl hover:scale-105"
                }`}
              >
                {isLoading ? <Loader2 className="w-7 h-7 animate-spin" /> : tokenId ? "Ready" : "Create Collection"}
              </button>
            </div>

            <div className="px-8 pb-8 space-y-5">
              <button
                onClick={() => performAction("buy")}
                disabled={isLoading || !tokenId}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-500 hover:to-orange-500 font-bold text-xl shadow-2xl hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <Package className="w-8 h-8" /> Buy VIP Pass 
              </button>

              <button
                onClick={() => performAction("register")}
                disabled={isLoading || !tokenId}
                className="w-full py-6 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-bold text-xl shadow-2xl hover:scale-105 disabled:opacity-50 flex items-center justify-center gap-4"
              >
                <Receipt className="w-8 h-8" /> Register Beta Access 
              </button>
            </div>

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
        </div>
      </div>
    </div>
  );
};

export default App;