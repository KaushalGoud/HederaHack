import React, { useState, useCallback } from "react";
import {
  RefreshCw,
  Zap,
  CheckCircle,
  Package,
  Receipt,
  ArrowRight,
  Server,
  Wallet,
  Hash,
} from "lucide-react";

const API_BASE = "/api";
const MOCK_USER_ID = "0.0.1001"; // Your receiver account ID

const App = () => {
  const [status, setStatus] = useState("Idle");
  const [message, setMessage] = useState(
    "Please initialize the NFT Collection below."
  );
  const [receipt, setReceipt] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [tokenId, setTokenId] = useState(null);

  const statusMap = {
    Idle: { color: "text-gray-500", icon: Zap },
    Processing: { color: "text-indigo-500", icon: RefreshCw },
    Success: { color: "text-green-500", icon: CheckCircle },
    Error: { color: "text-red-500", icon: Package },
  };

  const performBackendCall = useCallback(async (endpoint, body) => {
    const cleanEndpoint = endpoint.startsWith("/")
      ? endpoint.substring(1)
      : endpoint;
    const baseUrl = API_BASE.endsWith("/") ? API_BASE : `${API_BASE}/`;
    const fullUrl = `${baseUrl}${cleanEndpoint}`;

    const response = await fetch(fullUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    let result = {};
    try {
      result = await response.json();
    } catch (e) {
      result.error = `Server error (HTTP ${response.status})`;
    }

    if (!response.ok || !result.success) {
      const errorMsg =
        result.error || result.message || `API call failed: ${response.status}`;
      console.error("Backend error:", errorMsg, result);
      throw new Error(errorMsg);
    }

    return result;
  }, []);

  const createTokenCollection = useCallback(async () => {
    if (isLoading || tokenId) return;

    setIsLoading(true);
    setStatus("Processing");
    setMessage("Creating NFT Collection on Hedera...");

    try {
      const result = await performBackendCall("/create-token", {
        name: "Service Receipt NFT",
        symbol: "NFTREC",
      });

      setTokenId(result.tokenId);
      setStatus("Success");
      setMessage(`Collection created! Token ID: ${result.tokenId}`);
    } catch (error) {
      setStatus("Error");
      setMessage(`Failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, tokenId, performBackendCall]);

  const performAction = useCallback(
    async (actionType) => {
      if (isLoading || !tokenId) {
        setMessage("Please initialize collection first.");
        return;
      }

      setIsLoading(true);
      setStatus("Processing");
      setReceipt(null);

      const actionDetails =
        actionType === "buy"
          ? "Purchase: VIP Access Pass"
          : "Service: Beta Program Registration";

      // NEW — opens in browser immediately
      const mockMetadataUri = `https://ipfs.io/ipfs/receipt/${actionType}-${Date.now()}`;

      try {
        setMessage(`Delivering NFT receipt for ${actionDetails}...`);

        // ONE CALL DOES EVERYTHING: Mint + Transfer in a single transaction
        const result = await performBackendCall("/mint-token", {
          tokenId: tokenId,
          metadataUri: mockMetadataUri,
          receiver: MOCK_USER_ID, // REQUIRED
        });

        const { serialNumber } = result;

        setStatus("Success");
        setMessage(`NFT Receipt #${serialNumber} delivered instantly!`);

        setReceipt({
          tokenId,
          serialNumber,
          action: actionDetails,
          timestamp: Date.now(),
          receiverAccountId: MOCK_USER_ID,
          metadataUri: mockMetadataUri,
        });
      } catch (error) {
        setStatus("Error");
        setMessage(`Failed: ${error.message}`);
        console.error("Action failed:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [isLoading, tokenId, performBackendCall]
  );

  const CurrentIcon = statusMap[status]?.icon || Zap;
  const baseButtonClass =
    "flex items-center justify-center space-x-2 px-4 py-2 text-md font-semibold rounded-lg transition-all duration-300 transform shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60";

  const DetailBox = ({
    icon: IconComponent,
    title,
    value,
    colorClass = "text-gray-800",
    isMonospace = false,
  }) => (
    <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
      {IconComponent && <IconComponent className={`w-5 h-5 ${colorClass}`} />}
      <div>
        <p className="text-xs font-medium text-gray-500">{title}</p>
        <p
          className={`text-sm ${
            isMonospace ? "font-mono" : "font-semibold"
          } ${colorClass} truncate`}
        >
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center p-4 font-inter">
      <div className="w-full max-w-lg mx-auto">
        <div className="bg-indigo-600 text-white p-6 rounded-t-3xl shadow-xl">
          <h1 className="text-3xl font-bold flex items-center">
            <Wallet className="w-6 h-6 mr-2" /> Hedera Receipt Wallet
          </h1>
          <div className="mt-4">
            <p className="text-sm font-light opacity-80">Receiver Account</p>
            <p className="font-mono text-xl">{MOCK_USER_ID}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-b-3xl shadow-xl mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">
            NFT Collection
          </h2>
          <DetailBox
            icon={Hash}
            title="Collection ID"
            value={tokenId || "Not initialized"}
            colorClass={tokenId ? "text-green-700" : "text-red-500"}
            isMonospace={true}
          />

          <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 border-b pb-2">
            Actions
          </h2>

          <button
            onClick={createTokenCollection}
            disabled={isLoading || !!tokenId}
            className={`${baseButtonClass} w-full mb-4 ${
              tokenId
                ? "bg-gray-400 text-gray-700"
                : "bg-yellow-500 text-white hover:bg-yellow-600"
            }`}
          >
            {isLoading && status === "Processing" ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : tokenId ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <Server className="w-5 h-5" />
            )}
            <span>
              {tokenId ? "Collection Ready" : "1. Initialize Collection"}
            </span>
          </button>

          <div className="flex space-x-4">
            <button
              onClick={() => performAction("buy")}
              disabled={isLoading || !tokenId}
              className={`${baseButtonClass} flex-1 bg-indigo-600 text-white hover:bg-indigo-700`}
            >
              <Package className="w-5 h-5" />
              <span>Buy NFT Receipt</span>
            </button>

            <button
              onClick={() => performAction("register")}
              disabled={isLoading || !tokenId}
              className={`${baseButtonClass} flex-1 bg-purple-600 text-white hover:bg-purple-700`}
            >
              <Receipt className="w-5 h-5" />
              <span>Register NFT Receipt</span>
            </button>
          </div>

          <div
            className={`mt-6 p-4 rounded-xl border-2 ${
              status === "Success"
                ? "bg-green-50 border-green-300"
                : status === "Error"
                ? "bg-red-50 border-red-300"
                : status === "Processing"
                ? "bg-indigo-50 border-indigo-300"
                : "bg-gray-100 border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-3">
              <CurrentIcon
                className={`w-5 h-5 ${statusMap[status]?.color} ${
                  isLoading ? "animate-spin" : ""
                }`}
              />
              <h3 className={`text-lg font-bold ${statusMap[status]?.color}`}>
                {status}
              </h3>
            </div>
            <p className="mt-1 text-sm text-gray-600">{message}</p>
          </div>
        </div>

        {receipt && (
          <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-400">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-indigo-600" />
              Last Minted NFT Receipt
            </h2>
            <div className="bg-indigo-100 p-5 rounded-xl border border-indigo-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-indigo-700">
                  {receipt.action}
                </h3>
                <span className="text-3xl font-extrabold text-indigo-500">
                  #{receipt.serialNumber}
                </span>
              </div>
              <div className="space-y-3 text-sm text-gray-700">
                <p className="flex justify-between">
                  <span className="font-medium text-gray-500">Token ID:</span>{" "}
                  <span className="font-mono">{receipt.tokenId}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-500">Serial #:</span>{" "}
                  <span className="font-mono">{receipt.serialNumber}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-medium text-gray-500">
                    Delivered to:
                  </span>{" "}
                  <span className="font-mono">{receipt.receiverAccountId}</span>
                </p>
              </div>
              <a
                href={receipt.metadataUri}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center"
              >
                View Metadata URI <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
