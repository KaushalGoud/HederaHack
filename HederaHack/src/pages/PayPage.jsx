import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/PayPage.css';

const PayPage = () => {
  const [formData, setFormData] = useState({
    recipientAddress: '',
    amount: '',
    memo: '',
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    navigate('/transaction-status', { state: { action: 'pay', ...formData } });
  };

  return (
    <div className="pay-page">
      <div className="form-container">
        <h2 className="form-title">Send Crypto</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="recipientAddress">Recipient Address</label>
            <input
              type="text"
              id="recipientAddress"
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={handleChange}
              placeholder="0.0.123456"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="amount">Amount (HBAR)</label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              placeholder="0.00"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="memo">Memo (Optional)</label>
            <input
              type="text"
              id="memo"
              name="memo"
              value={formData.memo}
              onChange={handleChange}
              placeholder="e.g. For dinner"
            />
          </div>
          <button type="submit" className="submit-btn">
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default PayPage;
