import { useNavigate, useLocation } from 'react-router-dom';
// import {QRCode} from 'qrcode.react';
import '../styles/ReceiptPage.css';
import { useEffect } from 'react';

export default function ReceiptPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!location.state) {
      navigate('/');
    }
  }, [location, navigate]);

  const { action, transactionId, ...formData } = location.state || {};
  const timestamp = new Date().toISOString();
  const status = 'Confirmed';

  let amount;
  if (action === 'buy') {
    amount = formData.cryptoAmount;
  } else {
    amount = formData.amount;
  }

  const receiptData = {
    ...formData,
    transactionId,
    timestamp,
    action,
    status,
    amount,
  };

  const qrCodeData = JSON.stringify({
    transactionId: receiptData.transactionId,
    action: receiptData.action,
    nftName: receiptData.nftName || '',
    serialNumber: receiptData.serialNumber || '',
    amount: receiptData.amount,
    owner: receiptData.buyerName || receiptData.fullName || '',
    timestamp: receiptData.timestamp,
  });

  const handleBackHome = () => {
    navigate('/');
  };

  const handleDownloadReceipt = () => {
    let receiptText = `
TRANSACTION RECEIPT
====================
Transaction ID: ${receiptData.transactionId}
Timestamp: ${receiptData.timestamp}
Action: ${receiptData.action}
Status: ${receiptData.status}
`;

    if (receiptData.action === 'buy') {
      receiptText += `
Amount (HBAR): ${receiptData.cryptoAmount}
Amount (USD): ${receiptData.fiatAmount}
Payment Method: ${receiptData.paymentMethod}
`;
    } else if (receiptData.action === 'pay') {
      receiptText += `
Recipient Address: ${receiptData.recipientAddress}
Amount (HBAR): ${receiptData.amount}
Memo: ${receiptData.memo}
`;
    }

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${receiptData.transactionId}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadQR = () => {
    const canvas = document.getElementById('qrcode');
    const pngUrl = canvas
      .toDataURL('image/png')
      .replace('image/png', 'image/octet-stream');
    let downloadLink = document.createElement('a');
    downloadLink.href = pngUrl;
    downloadLink.download = `qrcode-${receiptData.transactionId}.png`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const renderReceiptDetails = () => {
    if (!receiptData.action) {
      return null;
    }

    return (
      <>
        {receiptData.action === 'buy' && (
          <>
            <div className="receipt-item">
              <label className="receipt-label">Amount (HBAR)</label>
              <p className="receipt-value">{receiptData.cryptoAmount}</p>
            </div>
            <div className="receipt-item">
              <label className="receipt-label">Amount (USD)</label>
              <p className="receipt-value">{receiptData.fiatAmount}</p>
            </div>
            <div className="receipt-item">
              <label className="receipt-label">Payment Method</label>
              <p className="receipt-value">{receiptData.paymentMethod}</p>
            </div>
          </>
        )}

        {receiptData.action === 'pay' && (
          <>
            <div className="receipt-item">
              <label className="receipt-label">Recipient Address</label>
              <p className="receipt-value">{receiptData.recipientAddress}</p>
            </div>
            <div className="receipt-item">
              <label className="receipt-label">Amount (HBAR)</label>
              <p className="receipt-value">{receiptData.amount}</p>
            </div>
            <div className="receipt-item">
              <label className="receipt-label">Memo</label>
              <p className="receipt-value">{receiptData.memo}</p>
            </div>
          </>
        )}
      </>
    );
  };

  return (
    <div className="receipt-page">
      <div className="form-container">
        <header className="receipt-header">
          <h1 className="receipt-title">Transaction Receipt</h1>
        </header>

        <div className="receipt-content">
          <section className="receipt-section">
            <h2 className="section-title">Summary</h2>
            <div className="receipt-grid">
              <div className="receipt-item">
                <label className="receipt-label">Transaction ID</label>
                <p className="receipt-value font-mono">{receiptData.transactionId}</p>
              </div>
              <div className="receipt-item">
                <label className="receipt-label">Timestamp</label>
                <p className="receipt-value">{new Date(receiptData.timestamp).toLocaleString()}</p>
              </div>
              <div className="receipt-item">
                <label className="receipt-label">Action</label>
                <p className="receipt-value capitalize">{receiptData.action}</p>
              </div>
              <div className="receipt-item">
                <label className="receipt-label">Status</label>
                <p className="receipt-value status-confirmed">{receiptData.status}</p>
              </div>
            </div>
          </section>

          <section className="receipt-section">
            <h2 className="section-title">Details</h2>
            <div className="receipt-grid">{renderReceiptDetails()}</div>
          </section>

          <section className="receipt-section qr-section">
            <h2 className="section-title">Scan QR to verify your NFT receipt</h2>
            <div className="qr-code-container">
              <QRCode id="qrcode" value={qrCodeData} size={150} />
              <button className="submit-btn" onClick={handleDownloadQR}>
                Download QR
              </button>
            </div>
          </section>
        </div>

        <div className="receipt-actions">
          <button className="submit-btn" onClick={handleDownloadReceipt}>
            Download Receipt
          </button>
          <button className="submit-btn secondary" onClick={handleBackHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}
