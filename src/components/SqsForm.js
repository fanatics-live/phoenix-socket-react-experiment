import React, {useState} from 'react';
import AWS from 'aws-sdk';
import {v4 as uuidv4} from 'uuid';
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

    // New fields for updated payload structure
    const [imageUrl, setImageUrl] = useState('https://example.com/image.jpg');
    const [allowBidding, setAllowBidding] = useState(true);
    const [askingPrice, setAskingPrice] = useState(100);
    const [bidCount, setBidCount] = useState(5);
    const [favoritedCount, setFavoritedCount] = useState(10);
    const [isGreatPrice, setIsGreatPrice] = useState(true);
    const [listingStatus, setListingStatus] = useState('active');
    const [updatedAt, setUpdatedAt] = useState(new Date().toISOString());
    const [highBidderTenantId, setHighBidderTenantId] = useState(uuidv4());
    const [highBidderName, setHighBidderName] = useState('John Doe');
    const [prevHighBidderTenantId, setPrevHighBidderTenantId] = useState(uuidv4());
    const [prevHighBidderName, setPrevHighBidderName] = useState('Jane Smith');
    const [marketplaceEventId, setMarketplaceEventId] = useState(uuidv4());
    const [marketplaceEventName, setMarketplaceEventName] = useState('Summer Collectibles Auction');
    const [marketplaceEventMarketplace, setMarketplaceEventMarketplace] = useState('Weekly Auction');
    const [marketplaceEventStatus, setMarketplaceEventStatus] = useState('active');

    // SQS configuration
    const [sqsUrl, setSqsUrl] = useState('http://localhost:4566/000000000000/marketplace-events');
    const [region, setRegion] = useState('us-west-2');
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

    const generateRandomImageUrl = () => {
        const imageIds = ['abc123', 'def456', 'ghi789', 'jkl012', 'mno345'];
        setImageUrl(`https://example.com/images/${imageIds[Math.floor(Math.random() * imageIds.length)]}.jpg`);
    };

    const generateRandomBidCount = () => {
        setBidCount(Math.floor(Math.random() * 50) + 1);
    };

    const generateRandomFavoritedCount = () => {
        setFavoritedCount(Math.floor(Math.random() * 100) + 1);
    };

    const generateRandomListingStatus = () => {
        const statuses = ['active', 'pending', 'sold', 'expired'];
        setListingStatus(statuses[Math.floor(Math.random() * statuses.length)]);
    };

    const generateRandomHighBidder = () => {
        const names = ['John Doe', 'Jane Smith', 'Alex Johnson', 'Sam Wilson', 'Taylor Swift'];
        const index = Math.floor(Math.random() * names.length);
        setHighBidderName(names[index]);
        setHighBidderTenantId(uuidv4());
    };

    const generateRandomPrevHighBidder = () => {
        const names = ['Mike Brown', 'Sarah Lee', 'Chris Evans', 'Emma Stone', 'Robert Downey'];
        const index = Math.floor(Math.random() * names.length);
        setPrevHighBidderName(names[index]);
        setPrevHighBidderTenantId(uuidv4());
    };

    const generateRandomMarketplaceEvent = () => {
        const names = ['Summer Auction', 'Winter Collection', 'Rare Finds', 'Vintage Sale', 'Limited Edition'];
        const marketplaces = ['Weekly Auction', 'Premier Auction'];
        const statuses = ['active', 'upcoming', 'completed', 'featured'];

        setMarketplaceEventName(names[Math.floor(Math.random() * names.length)]);
        setMarketplaceEventMarketplace(marketplaces[Math.floor(Math.random() * marketplaces.length)]);
        setMarketplaceEventStatus(statuses[Math.floor(Math.random() * statuses.length)]);
        setMarketplaceEventId(uuidv4());
    };

    // Send message to SQS
    // Inside your sendToSqs function, replace the AWS configuration part with this:
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
            // Extract endpoint URL from the SQS URL
            const endpointUrl = new URL(sqsUrl).origin;

            // Configure AWS with more detailed options for LocalStack
            AWS.config.update({
                region,
                credentials: new AWS.Credentials({
                    accessKeyId: accessKeyId || 'test',
                    secretAccessKey: secretAccessKey || 'test'
                }),
                endpoint: endpointUrl,
                s3ForcePathStyle: true,
            });

            // Create SQS client with more options
            const sqs = new AWS.SQS({
                apiVersion: '2012-11-05',
                endpoint: endpointUrl,
                sslEnabled: false, // Disable SSL for LocalStack
                httpOptions: {
                    timeout: 5000, // Increase timeout
                    connectTimeout: 5000
                }
            });

            // Prepare the message payload with the new structure
            const payload = {
                metadata: {
                    type: "Bid.Created",
                    version: "1.0.1"
                },
                payload: {
                    listing: {
                        id: listingId,
                        title,
                        images: [
                            {
                                medium: imageUrl
                            }
                        ],
                        endDatetime,
                        currentBid: parseInt(currentBid, 10),
                        allowBidding,
                        askingPrice: parseInt(askingPrice, 10),
                        bidCount: parseInt(bidCount, 10),
                        favoritedCount: parseInt(favoritedCount, 10),
                        isGreatPrice,
                        status: listingStatus,
                        updatedAt
                    },
                    auction: {
                        id: auctionId,
                        marketplace,
                        status
                    },
                    highBidder: {
                        tenantId: highBidderTenantId,
                        name: highBidderName
                    },
                    previousHighBidder: {
                        tenantId: prevHighBidderTenantId,
                        name: prevHighBidderName
                    },
                    marketplaceEvent: {
                        id: marketplaceEventId,
                        name: marketplaceEventName,
                        marketplace: marketplaceEventMarketplace,
                        status: marketplaceEventStatus
                    }
                }
            };

            // Instead of using the AWS SDK directly, let's try a fetch request
            // This can help bypass some CORS issues
            const params = {
                MessageBody: JSON.stringify({
                    Message: JSON.stringify(payload)
                }),
                QueueUrl: sqsUrl,
                Action: 'SendMessage'
            };

            console.log('Sending message to SQS with params:', params);

            // Try direct fetch approach first
            try {
                const response = await fetch(`${endpointUrl}?Action=SendMessage`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                        'X-Amz-Target': 'AmazonSQS.SendMessage'
                    },
                    body: new URLSearchParams({
                        QueueUrl: sqsUrl,
                        MessageBody: JSON.stringify({
                            Message: JSON.stringify(payload)
                        })
                    }).toString()
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.text();
                console.log('Message sent to SQS via fetch:', data);

                // Extract message ID from XML response
                const messageIdMatch = data.match(/<MessageId>(.*?)<\/MessageId>/);
                const messageId = messageIdMatch ? messageIdMatch[1] : 'Unknown';

                setResult({
                    messageId: messageId,
                    timestamp: new Date().toISOString(),
                    payload
                });
            } catch (fetchError) {
                console.error('Fetch approach failed, trying AWS SDK:', fetchError);

                // Fall back to AWS SDK if fetch fails
                const response = await sqs.sendMessage({
                    MessageBody: JSON.stringify({
                        Message: JSON.stringify(payload)
                    }),
                    QueueUrl: sqsUrl
                }).promise();

                console.log('Message sent to SQS via SDK:', response);

                setResult({
                    messageId: response.MessageId,
                    timestamp: new Date().toISOString(),
                    payload
                });
            }
        } catch (err) {
            console.error('Error sending message to SQS:', err);

            // More detailed error message
            let errorMessage = `Failed to send message: ${err.message}`;
            if (err.code) {
                errorMessage += ` (Code: ${err.code})`;
            }
            if (err.statusCode) {
                errorMessage += ` (Status: ${err.statusCode})`;
            }

            setError(errorMessage);

            // Provide troubleshooting advice based on error
            if (err.message.includes('Network Failure') || err.code === 'NetworkingError') {
                setError(`${errorMessage}. This could be a CORS issue. Try these solutions:
          1. Make sure LocalStack is running with CORS enabled
          2. Check your browser console for specific CORS errors
          3. Try using a different browser or a CORS proxy`);
            } else if (err.code === 'CredentialsError') {
                setError(`${errorMessage}. Check your AWS credentials.`);
            } else if (err.code === 'QueueDoesNotExist') {
                setError(`${errorMessage}. The specified queue does not exist. Check your queue URL.`);
            }
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
                        placeholder="http://localhost:4566/000000000000/marketplace-events"
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
                    <label htmlFor="imageUrl">Image URL:</label>
                    <input
                        type="text"
                        id="imageUrl"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                    />
                    <button type="button" onClick={generateRandomImageUrl} className="generate-btn">
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

                <div className="form-group with-button">
                    <label htmlFor="askingPrice">Asking Price:</label>
                    <input
                        type="number"
                        id="askingPrice"
                        value={askingPrice}
                        onChange={(e) => setAskingPrice(e.target.value)}
                        placeholder="Asking price"
                    />
                </div>

                <div className="form-group with-button">
                    <label htmlFor="bidCount">Bid Count:</label>
                    <input
                        type="number"
                        id="bidCount"
                        value={bidCount}
                        onChange={(e) => setBidCount(e.target.value)}
                        placeholder="Number of bids"
                    />
                    <button type="button" onClick={generateRandomBidCount} className="generate-btn">
                        Generate
                    </button>
                </div>

                <div className="form-group with-button">
                    <label htmlFor="favoritedCount">Favorited Count:</label>
                    <input
                        type="number"
                        id="favoritedCount"
                        value={favoritedCount}
                        onChange={(e) => setFavoritedCount(e.target.value)}
                        placeholder="Number of favorites"
                    />
                    <button type="button" onClick={generateRandomFavoritedCount} className="generate-btn">
                        Generate
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="allowBidding">Allow Bidding:</label>
                    <input
                        type="checkbox"
                        id="allowBidding"
                        checked={allowBidding}
                        onChange={(e) => setAllowBidding(e.target.checked)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="isGreatPrice">Is Great Price:</label>
                    <input
                        type="checkbox"
                        id="isGreatPrice"
                        checked={isGreatPrice}
                        onChange={(e) => setIsGreatPrice(e.target.checked)}
                    />
                </div>

                <div className="form-group with-button">
                    <label htmlFor="listingStatus">Listing Status:</label>
                    <input
                        type="text"
                        id="listingStatus"
                        value={listingStatus}
                        onChange={(e) => setListingStatus(e.target.value)}
                        placeholder="active, pending, sold, expired"
                    />
                    <button type="button" onClick={generateRandomListingStatus} className="generate-btn">
                        Generate
                    </button>
                </div>
                <div className="form-group">
                    <label htmlFor="updatedAt">Updated At:</label>
                    <input
                        type="text"
                        id="updatedAt"
                        value={updatedAt}
                        onChange={(e) => setUpdatedAt(e.target.value)}
                        placeholder="ISO format date/time"
                    />
                </div>
            </div>

            <div className="form-section">
                <h3>Bidder Information</h3>
                <div className="form-group with-button">
                    <label htmlFor="highBidderName">High Bidder Name:</label>
                    <input
                        type="text"
                        id="highBidderName"
                        value={highBidderName}
                        onChange={(e) => setHighBidderName(e.target.value)}
                        placeholder="Bidder name"
                    />
                    <button type="button" onClick={generateRandomHighBidder} className="generate-btn">
                        Generate
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="highBidderTenantId">High Bidder Tenant ID:</label>
                    <input
                        type="text"
                        id="highBidderTenantId"
                        value={highBidderTenantId}
                        onChange={(e) => setHighBidderTenantId(e.target.value)}
                        placeholder="Tenant ID"
                    />
                </div>

                <div className="form-group with-button">
                    <label htmlFor="prevHighBidderName">Previous High Bidder Name:</label>
                    <input
                        type="text"
                        id="prevHighBidderName"
                        value={prevHighBidderName}
                        onChange={(e) => setPrevHighBidderName(e.target.value)}
                        placeholder="Previous bidder name"
                    />
                    <button type="button" onClick={generateRandomPrevHighBidder} className="generate-btn">
                        Generate
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="prevHighBidderTenantId">Previous High Bidder Tenant ID:</label>
                    <input
                        type="text"
                        id="prevHighBidderTenantId"
                        value={prevHighBidderTenantId}
                        onChange={(e) => setPrevHighBidderTenantId(e.target.value)}
                        placeholder="Previous tenant ID"
                    />
                </div>
            </div>

            <div className="form-section">
                <h3>Marketplace Event</h3>
                <div className="form-group with-button">
                    <label htmlFor="marketplaceEventId">Event ID:</label>
                    <input
                        type="text"
                        id="marketplaceEventId"
                        value={marketplaceEventId}
                        onChange={(e) => setMarketplaceEventId(e.target.value)}
                        placeholder="Event ID"
                    />
                    <button type="button" onClick={generateRandomMarketplaceEvent} className="generate-btn">
                        Generate All
                    </button>
                </div>

                <div className="form-group">
                    <label htmlFor="marketplaceEventName">Event Name:</label>
                    <input
                        type="text"
                        id="marketplaceEventName"
                        value={marketplaceEventName}
                        onChange={(e) => setMarketplaceEventName(e.target.value)}
                        placeholder="Event name"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="marketplaceEventMarketplace">Event Marketplace:</label>
                    <input
                        type="text"
                        id="marketplaceEventMarketplace"
                        value={marketplaceEventMarketplace}
                        onChange={(e) => setMarketplaceEventMarketplace(e.target.value)}
                        placeholder="Event marketplace"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="marketplaceEventStatus">Event Status:</label>
                    <input
                        type="text"
                        id="marketplaceEventStatus"
                        value={marketplaceEventStatus}
                        onChange={(e) => setMarketplaceEventStatus(e.target.value)}
                        placeholder="Event status"
                    />
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