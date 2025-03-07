import React, { useState } from 'react';
import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';
import './SqsForm.css';

function SqsForm() {
  // State for form fields
  const [auctionId, setAuctionId] = useState(uuidv4());
  const [marketplace, setMarketplace] = useState('eBay');
  const [status, setStatus] = useState('open');
  const [listingId, setListingId] = useState(uuidv4());
  const [title, setTitle] = useState('Test Auction Ab3xY7Zq');
  const [endDatetime, setEndDatetime] = useState(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString());
  const [currentBid, setCurrentBid] = useState(5432);
  
  // SQS configuration
  const [sqsUrl, setSqsUrl] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [accessKeyId, setAccessKeyId] = useState('');
  const [secretAccessKey, setSecretAccessKey] = useState('');
  
  // Status and error handling
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  // Generate random values
  const generateRandomAuctionId = () => setAuctionId(uuidv4());
  const generateRandomListingId = () => setListingId(uuidv4());
  
  const generateRandomMarketplace = () => {
    const marketplaces = ['eBay', 'Amazon', 'Etsy', 'Shopify', 'Walmart'];
    setMarketplace(marketplaces[Math.floor(Math.random() * marketplaces.length)]);
  };
  
  const generateRandomStatus = () => {
    const statuses = ['open', 'closed', 'pending', 'cancelled'];
    setStatus(statuses[Math.floor(Math.random() * statuses.length)]);
  };
  
  const generateRandomTitle = () => {
    const adjectives = ['Vintage', 'Modern', 'Antique', 'Rare', 'Unique', 'Handmade'];
    const nouns = ['Painting', 'Sculpture', 'Furniture', 'Jewelry', 'Watch', 'Collectible'];
    const randomCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    setTitle(`${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]} ${randomCode}`);
  };
  
  const generateRandomEndDate = () => {
    // Random date between now and 30 days in the future
    const now = new Date();
    const future = new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000);
    setEndDatetime(future.toISOString());
  };
  
  const generateRandomBid = () => {
    // Random bid between 1 and 10000
    setCurrentBid(Math.floor(Math.random() * 10000) + 1);
  };

  // Send message to SQS
  const sendToSqs = async (e) => {
    e.preventDefault();
    
    if (!sqsUrl) {
      setError('Please provide an SQS URL');
      return;
    }

    setSending(true);
    setError(null);
    setResult(null);

    try {
      // Configure AWS
      AWS.config.update({
        region,
        credentials: new AWS.Credentials({
          accessKeyId,
          secretAccessKey
        })
      });

      const sqs = new AWS.SQS();
      
      // Prepare the message payload
      const payload = {
        auction: {
          id: auctionId,
          marketplace,
          status
        },
        listing: {
          id: listingId,
          title,
          endDatetime,
          currentBid: parseInt(currentBid, 10)
        }
      };

      // Send message to SQS
      const params = {
        MessageBody: JSON.stringify(payload),
        QueueUrl: sqsUrl
      };

      const response = await sqs.sendMessage(params).promise();
      
      setResult({
        messageId: response.MessageId,
        timestamp: new Date().toISOString(),
        payload
      });
      
      console.log('Message sent to SQS:', response);
    } catch (err) {
      console.error('Error sending message to SQS:', err);
      setError(`Failed to send message: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="sqs-form-container">
      <h2>Send Event to SQS Queue</h2>
      
      <div className="form-section">
        <h3>AWS Configuration</h3>
        <div className="form-group">
          <label htmlFor="sqsUrl">SQS Queue URL:</label>
          <input
            type="text"
            id="sqsUrl"
            value={sqsUrl}
            onChange={(e) => setSqsUrl(e.target.value)}
            placeholder="https://sqs.region.amazonaws.com/account-id/queue-name"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="region">AWS Region:</label>
          <input
            type="text"
            id="region"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            placeholder="us-east-1"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="accessKeyId">Access Key ID:</label>
          <input
            type="text"
            id="accessKeyId"
            value={accessKeyId}
            onChange={(e) => setAccessKeyId(e.target.value)}
            placeholder="Your AWS Access Key ID"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="secretAccessKey">Secret Access Key:</label>
          <input
            type="password"
            id="secretAccessKey"
            value={secretAccessKey}
            onChange={(e) => setSecretAccessKey(e.target.value)}
            placeholder="Your AWS Secret Access Key"
          />
        </div>
      </div>
      
      <div className="form-section">
        <h3>Auction Details</h3>
        <div className="form-group with-button">
          <label htmlFor="auctionId">Auction ID:</label>
          <input
            type="text"
            id="auctionId"
            value={auctionId}
            onChange={(e) => setAuctionId(e.target.value)}
            placeholder="UUID"
          />
          <button type="button" onClick={generateRandomAuctionId} className="generate-btn">
            Generate
          </button>
        </div>
        
        <div className="form-group with-button">
          <label htmlFor="marketplace">Marketplace:</label>
          <input
            type="text"
            id="marketplace"
            value={marketplace}
            onChange={(e) => setMarketplace(e.target.value)}
            placeholder="eBay, Amazon, etc."
          />
          <button type="button" onClick={generateRandomMarketplace} className="generate-btn">
            Generate
          </button>
        </div>
        
        <div className="form-group with-button">
          <label htmlFor="status">Status:</label>
          <input
            type="text"
            id="status"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            placeholder="open, closed, etc."
          />
          <button type="button" onClick={generateRandomStatus} className="generate-btn">
            Generate
          </button>
        </div>
      </div>
      
      <div className="form-section">
        <h3>Listing Details</h3>
        <div className="form-group with-button">
          <label htmlFor="listingId">Listing ID:</label>
          <input
            type="text"
            id="listingId"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            placeholder="UUID"
          />
          <button type="button" onClick={generateRandomListingId} className="generate-btn">
            Generate
          </button>
        </div>
        
        <div className="form-group with-button">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Listing title"
          />
          <button type="button" onClick={generateRandomTitle} className="generate-btn">
            Generate
          </button>
        </div>
        
        <div className="form-group with-button">
          <label htmlFor="endDatetime">End Date/Time:</label>
          <input
            type="text"
            id="endDatetime"
            value={endDatetime}
            onChange={(e) => setEndDatetime(e.target.value)}
            placeholder="ISO format date/time"
          />
          <button type="button" onClick={generateRandomEndDate} className="generate-btn">
            Generate
          </button>
        </div>
        
        <div className="form-group with-button">
          <label htmlFor="currentBid">Current Bid:</label>
          <input
            type="number"
            id="currentBid"
            value={currentBid}
            onChange={(e) => setCurrentBid(e.target.value)}
            placeholder="Bid amount"
          />
          <button type="button" onClick={generateRandomBid} className="generate-btn">
            Generate
          </button>
        </div>
      </div>
      
      <div className="form-actions">
        <button 
          onClick={sendToSqs} 
          disabled={sending}
          className="send-button"
        >
          {sending ? 'Sending...' : 'Send to SQS'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {result && (
        <div className="result-container">
          <h3>Message Sent Successfully</h3>
          <p><strong>Message ID:</strong> {result.messageId}</p>
          <p><strong>Timestamp:</strong> {result.timestamp}</p>
          <div className="payload-preview">
            <h4>Payload:</h4>
            <pre>{JSON.stringify(result.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default SqsForm;