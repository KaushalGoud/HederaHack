import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/TransactionsPage.css';

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Simulate fetching transactions from an API
    const fetchedTransactions = [
      {
        id: 1,
        action: 'Buy',
        nftReceipt: '#4 (Token: 0.0.xxxxx)',
        txnId: '0.0.user-1748...',
        date: '2025-11-16',
        status: 'Success',
        hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.user-1748', // Placeholder
      },
      {
        id: 2,
        action: 'Send',
        nftReceipt: '#3',
        txnId: '0.0.user-1745...',
        date: '2025-11-16',
        status: 'Success',
        hashScanLink: 'https://hashscan.io/testnet/transaction/0.0.user-1745', // Placeholder
      },
      // Add more dummy transactions as needed
    ];
    setTransactions(fetchedTransactions);
  }, []);

  const handleBackHome = () => {
    navigate('/');
  };

  return (
    <div className="transactions-page">
      <div className="transactions-container">
        <h2 className="transactions-title">Your Recent Transactions</h2>
        {transactions.length === 0 ? (
          <p className="no-transactions">No transactions found.</p>
        ) : (
          <div className="transaction-list">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="transaction-item">
                <div className="transaction-details">
                  <p><strong>Action:</strong> {transaction.action}</p>
                  <p><strong>NFT Receipt:</strong> {transaction.nftReceipt}</p>
                  <p><strong>Txn ID:</strong> {transaction.txnId}</p>
                  <p><strong>Date:</strong> {transaction.date}</p>
                  <p><strong>Status:</strong> <span className={`status-${transaction.status.toLowerCase()}`}>{transaction.status}</span></p>
                </div>
                {transaction.hashScanLink && (
                  <a
                    href={transaction.hashScanLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hashscan-link"
                  >
                    View on HashScan
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
        <button className="submit-btn" onClick={handleBackHome}>
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default TransactionsPage;
