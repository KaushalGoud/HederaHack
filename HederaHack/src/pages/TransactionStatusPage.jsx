import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import '../styles/TransactionStatusPage.css';

export default function TransactionStatusPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [transactionId, setTransactionId] = useState('');
  const action = location.state?.action || 'transaction';

  useEffect(() => {
    const timer = setTimeout(() => {
      const dummyId = `0x${Math.random().toString(16).substr(2, 40)}`;
      setTransactionId(dummyId);
      setIsLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleViewReceipt = () => {
    navigate('/receipt', {
      state: {
        ...location.state,
        transactionId,
      },
    });
  };

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="transaction-status-page">
      <div className="form-container">
        {isLoading ? (
          <div className="loading-section">
            <LoadingSpinner />
            <p className="loading-text">Processing your {action} transaction...</p>
          </div>
        ) : (
          <div className="success-section">
            <div className="success-icon">✓</div>
            <h2 className="success-title">Transaction Successful!</h2>

            <div className="transaction-details">
              <div className="detail-item">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">{transactionId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Action:</span>
                <span className="detail-value capitalize">{action}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Timestamp:</span>
                <span className="detail-value">{new Date().toLocaleString()}</span>
              </div>
            </div>

            <div className="action-buttons">
              <button className="submit-btn" onClick={handleViewReceipt}>
                View Receipt
              </button>
              <button className="submit-btn secondary" onClick={handleBackHome}>
                Back to Home
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
