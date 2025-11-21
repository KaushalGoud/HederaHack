import React from "react";
import { useParams } from "react-router-dom";
import Confetti from "react-confetti";
import QRCode from "qrcode.react";
import { ArrowLeft, Share2, Copy, Check } from "lucide-react";

const VIPReceipt = () => {
  const { serial } = useParams();
  const [copied, setCopied] = React.useState(false);

  const url = window.location.href;
  const copyLink = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-900 via-black to-orange-900 text-white flex items-center justify-center p-6 relative overflow-hidden">
      <Confetti recycle={false} numberOfPieces={500} />
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative z-10 max-w-lg w-full">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-yellow-600/20 to-orange-600/20 border-4 border-yellow-500 rounded-3xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 p-8 text-center">
            <h1 className="text-5xl font-black tracking-tighter">VIP ACCESS PASS</h1>
            <p className="text-8xl font-bold mt-4 text-black">#{serial}</p>
            <p className="text-2xl mt-2 text-yellow-100">GOLDEN EDITION</p>
          </div>

          <div className="p-10 text-center space-y-8">
            

            <div className="bg-black/50 rounded-2xl p-6">
              <p className="text-yellow-300 text-lg">Congratulations!</p>
              <p className="text-3xl font-bold">You are now a VIP member</p>
              <p className="text-yellow-200 mt-4">Exclusive access • Lifetime perks • Golden status</p>
            </div>

            <div className="flex justify-center">
              <QRCode value={url} size={120} bgColor="#000" fgColor="#FFD700" />
            </div>

            <button
              onClick={copyLink}
              className="w-full py-5 bg-yellow-600 hover:bg-yellow-500 rounded-2xl font-bold text-xl flex items-center justify-center gap-3"
            >
              {copied ? <Check className="w-7 h-7" /> : <Copy className="w-7 h-7" />}
              {copied ? "Copied!" : "Copy Share Link"}
            </button>
          </div>
        </div>

        <a
          href="/"
          className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-center flex items-center justify-center gap-3"
        >
          <ArrowLeft /> Back to App
        </a>
      </div>
    </div>
  );
};

export default VIPReceipt;