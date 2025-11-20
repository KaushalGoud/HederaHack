import React, { useState, useCallback } from 'react';
import { RefreshCw, Zap, CheckCircle, Package, Receipt, ArrowRight, Server, Key, Wallet, User, Hash } from 'lucide-react';

// --- CONFIGURATION ---
// Assuming your backend is running and accessible on the same host or a proxy handles it.
const API_BASE = '/api';
const MOCK_USER_ID = "0.0.1001"; // The Hedera Account ID receiving the NFT Receipt
// --- END CONFIGURATION ---

// --- MAIN APPLICATION COMPONENT ---
const App = () => {
    // State Management for UI and Transaction Data
    const [status, setStatus] = useState('Idle');
    const [message, setMessage] = useState('Please initialize the NFT Collection below.');
    const [receipt, setReceipt] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [tokenId, setTokenId] = useState(null); // State to hold the created Token ID

    // Map status strings to colors and icons for visual feedback
    const statusMap = {
        Idle: { color: 'text-gray-500', icon: Zap },
        Processing: { color: 'text-indigo-500', icon: RefreshCw },
        Success: { color: 'text-green-500', icon: CheckCircle },
        Error: { color: 'text-red-500', icon: Package },
    };

    /**
     * Generic function to handle POST requests to the backend API.
     * FIX: Implemented robust JSON parsing to handle non-JSON responses (like server crashes).
     */
    const performBackendCall = useCallback(async (endpoint, body) => {
        // 1. Remove leading slash from the endpoint argument (e.g., '/create-token' -> 'create-token')
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint.substring(1) : endpoint;
        
        // 2. Construct the URL ensuring API_BASE always ends with one slash before appending the endpoint.
        const baseUrl = API_BASE.endsWith('/') ? API_BASE : `${API_BASE}/`;
        const fullUrl = `${baseUrl}${cleanEndpoint}`; // Correctly forms '/api/create-token'

        const response = await fetch(fullUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        // --- ROBUST JSON PARSING ---
        let result = {};
        try {
            // Attempt to parse JSON response body
            result = await response.json();
        } catch (e) {
            // If parsing fails (e.g., empty body on 500 error), set a generic error message.
            console.error("Failed to parse JSON response, server may have crashed:", e);
            result.error = `Server error (HTTP ${response.status}) or no valid JSON response received. Check backend console for OPERATOR_ID/KEY errors.`;
        }
        // --- END ROBUST JSON PARSING ---

        // 1. Check for non-OK HTTP status (e.g., 400, 500)
        if (!response.ok) {
            console.error('Backend HTTP Error:', response.status, response.statusText);
            console.error('Backend Error Details:', result);
            // Throw the specific error message provided by the backend or the generic message created above
            throw new Error(result.error || result.message || `API call failed with status ${response.status}`);
        }

        // 2. Check for server-side success status (for 200 responses with an error payload)
        if (!result.success) {
            console.error('Backend Logic Error:', result);
            throw new Error(result.error || result.message || `API call failed for ${endpoint}`);
        }
        
        return result;
    }); // Added API_BASE to dependencies

    /**
     * Step 0: Create the NFT Collection on Hedera. (One-time setup)
     */
    const createTokenCollection = useCallback(async () => {
        if (isLoading || tokenId) return;

        setIsLoading(true);
        setStatus('Processing');
        setMessage('Creating NFT Collection on Hedera...');
        setReceipt(null);

        try {
            // Call backend endpoint to create the NFT collection
            const result = await performBackendCall('/create-token', {
                name: "Service Receipt NFT",
                symbol: "NFTREC"
            });

            setTokenId(result.tokenId);
            setStatus('Success');
            setMessage(`Collection created! Token ID: ${result.tokenId}. Now you can Mint & Transfer receipts.`);

        } catch (error) {
            setStatus('Error');
            setMessage(`Initialization Failed. Check backend server and .env file: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, tokenId, performBackendCall]);

    /**
     * Steps 1 & 2: Mint a new NFT receipt and transfer it to the user.
     * FIX: TokenId is now explicitly passed in the body for both mint and transfer calls.
     */
    const performAction = useCallback(async (actionType) => {
        // Prevent action if loading or if the collection is not initialized
        if (isLoading || !tokenId) {
            setMessage('Initialization is required before performing actions.');
            return;
        }

        setIsLoading(true);
        setStatus('Processing');
        setReceipt(null);

        const actionDetails = actionType === 'buy'
            ? "Purchase: VIP Access Pass"
            : "Service: Beta Program Registration";
        
        // Generate a mock URI based on the action and time
        const mockMetadataUri = `ipfs://receipt/${actionType}-${Date.now()}`;

        try {
            // --- STEP 1: MINT NFT ---
            setMessage(`Step 1/2: Minting new NFT receipt for: ${actionDetails}...`);
            const mintResult = await performBackendCall('/mint-token', {
                // FIX: Pass the Token ID required by the backend
                tokenId: tokenId, 
                metadataUri: mockMetadataUri
            });

            const { serialNumber } = mintResult;
            
            // --- STEP 2: TRANSFER NFT ---
            setMessage(`Step 2/2: Transferring Serial #${serialNumber} to ${MOCK_USER_ID}...`);
            await performBackendCall('/transfer-token', {
                // FIX: Pass the Token ID required by the backend
                tokenId: tokenId, 
                recipient: MOCK_USER_ID,
                serialNumber: serialNumber
            });
            
            // Final Success State
            setStatus('Success');
            setMessage(`Transaction successful! NFT Receipt Serial #${serialNumber} sent to wallet.`);
            
            // Finalize Receipt Data for Display
            setReceipt({
                tokenId: tokenId,
                serialNumber: serialNumber,
                action: actionDetails,
                timestamp: Date.now(),
                receiverAccountId: MOCK_USER_ID,
                metadataUri: mockMetadataUri,
            });

        } catch (error) {
            // Handle any error from the two-step process
            setStatus('Error');
            setMessage(`Action failed. Check console for details: ${error.message}`);
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, tokenId, performBackendCall]);

    const CurrentIcon = statusMap[status]?.icon || Zap;
    const baseButtonClass = "flex items-center justify-center space-x-2 px-4 py-2 text-md font-semibold rounded-lg transition-all duration-300 transform shadow-md hover:shadow-lg active:scale-95 disabled:opacity-60";

    const DetailBox = ({ icon: IconComponent, title, value, colorClass = "text-gray-800", isMonospace = false }) => (
        <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            {IconComponent && <IconComponent className={`w-5 h-5 ${colorClass}`} />}
            <div>
                <p className="text-xs font-medium text-gray-500">{title}</p>
                <p className={`text-sm ${isMonospace ? 'font-mono' : 'font-semibold'} ${colorClass} truncate`}>{value}</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-200 flex flex-col items-center p-4 font-inter">
            <div className="w-full max-w-lg mx-auto">
                {/* WALLET CARD HEADER */}
                <div className="bg-indigo-600 text-white p-6 rounded-t-3xl shadow-xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold flex items-center">
                            <Wallet className="w-6 h-6 mr-2" />
                            Hedera Receipt Wallet
                        </h1>
                    </div>
                    <div className="mt-4">
                        <p className="text-sm font-light opacity-80">Connected Account (NFT Receiver)</p>
                        <p className="font-mono text-xl truncate">{MOCK_USER_ID}</p>
                    </div>
                </div>

                {/* MAIN CARD BODY */}
                <div className="bg-white p-6 rounded-b-3xl shadow-xl mb-6">
                    
                    {/* ASSET DETAILS: TOKEN ID */}
                    <h2 className="text-xl font-bold text-gray-800 mb-3 border-b pb-2">NFT Collection</h2>
                    <DetailBox
                        icon={Hash}
                        title="Collection ID"
                        value={tokenId || "Awaiting Initialization..."}
                        colorClass={tokenId ? "text-green-700" : "text-red-500"}
                        isMonospace={true}
                    />

                    {/* ACTIONS PANEL */}
                    <h2 className="text-xl font-bold text-gray-800 mt-6 mb-3 border-b pb-2">Actions</h2>
                    
                    {/* Initialization Button */}
                    <button
                        onClick={createTokenCollection}
                        disabled={isLoading || !!tokenId}
                        className={`${baseButtonClass} w-full mb-4 ${tokenId ? 'bg-gray-400 text-gray-700' : 'bg-yellow-500 text-white hover:bg-yellow-600'}`}
                    >
                        {isLoading && status === 'Processing' ? (
                            <RefreshCw className="w-5 h-5 animate-spin" />
                        ) : tokenId ? (
                            <CheckCircle className="w-5 h-5" />
                        ) : (
                            <Server className="w-5 h-5" />
                        )}
                        <span>{tokenId ? 'Collection Initialized' : '1. Initialize NFT Collection'}</span>
                    </button>

                    <div className="flex space-x-4">
                        {/* BUY Button */}
                        <button
                            onClick={() => performAction('buy')}
                            disabled={isLoading || !tokenId}
                            className={`${baseButtonClass} flex-1 bg-indigo-600 text-white hover:bg-indigo-700`}
                        >
                            <Package className="w-5 h-5" />
                            <span>Buy NFT Receipt</span>
                        </button>

                        {/* REGISTER Button */}
                        <button
                            onClick={() => performAction('register')}
                            disabled={isLoading || !tokenId}
                            className={`${baseButtonClass} flex-1 bg-purple-600 text-white hover:bg-purple-700`}
                        >
                            <Receipt className="w-5 h-5" />
                            <span>Register NFT Receipt</span>
                        </button>
                    </div>

                    {/* STATUS BAR / TRANSACTION LOG */}
                    <div className={`mt-6 p-4 rounded-xl border-2 ${status === 'Success' ? 'bg-green-50 border-green-300' : status === 'Error' ? 'bg-red-50 border-red-300' : status === 'Processing' ? 'bg-indigo-50 border-indigo-300' : 'bg-gray-100 border-gray-300'} transition-colors duration-300`}>
                        <div className="flex items-center space-x-3">
                            <CurrentIcon className={`w-5 h-5 ${statusMap[status]?.color} ${isLoading ? 'animate-spin' : ''}`} />
                            <h3 className={`text-lg font-bold ${statusMap[status]?.color}`}>{status}</h3>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{message}</p>
                    </div>
                </div>

                {/* MINTED NFT RECEIPT DISPLAY CARD */}
                {receipt && (
                    <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-400">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
                            <Receipt className="w-6 h-6 mr-2 text-indigo-600" />
                            Last Minted NFT
                        </h2>
                        
                        <div className="bg-indigo-100 p-5 rounded-xl border border-indigo-300">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-indigo-700 truncate">{receipt.action}</h3>
                                <span className="text-3xl font-extrabold text-indigo-500">
                                    # {receipt.serialNumber}
                                </span>
                            </div>

                            <div className="space-y-3 text-sm text-gray-700">
                                <p className="flex justify-between">
                                    <span className="font-medium text-gray-500">Token ID:</span>
                                    <span className="font-mono">{receipt.tokenId}</span>
                                </p>
                                <p className="flex justify-between">
                                    <span className="font-medium text-gray-500">Date:</span>
                                    <span className="font-mono">{new Date(receipt.timestamp).toLocaleString()}</span>
                                </p>
                            </div>
                            
                            <a 
                                href={receipt.metadataUri} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="mt-4 block text-center text-blue-600 hover:text-blue-800 text-sm font-semibold flex items-center justify-center"
                            >
                                View Metadata URI
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </a>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default App;