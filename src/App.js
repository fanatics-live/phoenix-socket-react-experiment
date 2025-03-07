// src/App.js
import React, { useState, useEffect, useRef } from 'react';
import { Socket } from 'phoenix';
import './App.css';
import SqsForm from './components/SqsForm';

function App() {
  // State management for the application
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [channelName, setChannelName] = useState('global_auctions:all');
  const [authToken, setAuthToken] = useState('');
  const [socketUrl, setSocketUrl] = useState('ws://localhost:5004/auctions');
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('phoenix'); // 'phoenix' or 'sqs'

  // References to maintain the socket and channel connections
  const socketRef = useRef(null);
  const channelRef = useRef(null);

  // Function to establish a connection to the Phoenix socket server
  const connectSocket = () => {
    if (!socketUrl) {
      setError('Please provide a socket URL');
      return;
    }

    try {
      // Close any existing connection
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create socket params object - only include auth_token if it's provided
      const socketParams = {};
      if (authToken) {
        socketParams.auth_token = authToken;
      }

      // Create a new socket connection with authentication if token is provided
      const socket = new Socket(socketUrl, {
        params: socketParams
      });

      // Initialize the socket connection
      socket.connect();
      socketRef.current = socket;

      // Log socket connection events
      socket.onOpen(() => console.log('Socket connection opened'));
      socket.onError((error) => {
        console.error('Socket connection error:', error);
        setError(`Connection error: ${error.message || 'Unknown error'}`);
        setConnected(false);
      });
      socket.onClose(() => {
        console.log('Socket connection closed');
        setConnected(false);
      });

      // Join the specified channel
      joinChannel(socket);
    } catch (error) {
      console.error('Error connecting to socket:', error);
      setError(`Failed to connect: ${error.message}`);
    }
  };

  // Function to join a Phoenix channel
  const joinChannel = (socket) => {
    // Get the channel from the socket
    const channel = socket.channel(channelName, {});
    channelRef.current = channel;

    // Handle the channel join event
    channel.join()
        .receive("ok", response => {
          console.log("Successfully joined channel", response);
          setConnected(true);
          setError(null);

          // Add a system message to indicate successful connection
          setMessages(prevMessages => [
            ...prevMessages,
            { text: `Connected to ${channelName}`, type: 'system', timestamp: new Date() }
          ]);
        })
        .receive("error", response => {
          console.error("Failed to join channel", response);
          setError(`Failed to join channel: ${response.reason || 'Unknown error'}`);
          setConnected(false);
        });

    // Listen for new messages from the server
    channel.on("new_message", payload => {
      console.log("Received new message:", payload);
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: payload.content || payload.message || JSON.stringify(payload),
          sender: payload.sender || 'Server',
          timestamp: new Date(),
          type: 'received'
        }
      ]);
    });

    // Set up other common event listeners
    channel.on("user_joined", payload => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: `${payload.username || 'A user'} joined the channel`,
          type: 'system',
          timestamp: new Date()
        }
      ]);
    });

    channel.on("user_left", payload => {
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: `${payload.username || 'A user'} left the channel`,
          type: 'system',
          timestamp: new Date()
        }
      ]);
    });

    channel.on("new_notification", payload => {
      // Format JSON payload for better readability
      const formattedText = typeof payload === 'object' ? (
        <>
          <div className="message-type-header">New Notification</div>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </>
      ) : payload.content || payload.message || String(payload);
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: formattedText,
          type: 'notification',
          timestamp: new Date()
        }
      ]);
    });

    channel.on("last_update", payload => {
      // Format JSON payload for better readability
      const formattedText = typeof payload === 'object' ? (
        <>
          <div className="message-type-header">Last Update</div>
          <pre>{JSON.stringify(payload, null, 2)}</pre>
        </>
      ) : payload.content || payload.message || String(payload);
      
      setMessages(prevMessages => [
        ...prevMessages,
        {
          text: formattedText,
          type: 'update',
          timestamp: new Date()
        }
      ]);
    });
  };

  // Function to disconnect from the socket
  const disconnectSocket = () => {
    if (channelRef.current) {
      channelRef.current.leave();
    }
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    setConnected(false);

    // Add a system message to indicate disconnection
    setMessages(prevMessages => [
      ...prevMessages,
      { text: 'Disconnected from server', type: 'system', timestamp: new Date() }
    ]);
  };

  // Clean up the socket connection when the component unmounts
  useEffect(() => {
    return () => {
      if (channelRef.current) {
        channelRef.current.leave();
      }
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Function to format timestamps
  const formatTime = (date) => {
    return date.toLocaleTimeString();
  };

  return (
      <div className="app-container">
        <h1>Phoenix Socket & AWS SQS Demo</h1>

        <div className="tab-navigation">
          <button
              className={`tab-button ${activeTab === 'phoenix' ? 'active' : ''}`}
              onClick={() => setActiveTab('phoenix')}
          >
            Phoenix Socket
          </button>
          <button
              className={`tab-button ${activeTab === 'sqs' ? 'active' : ''}`}
              onClick={() => setActiveTab('sqs')}
          >
            AWS SQS
          </button>
        </div>

        {activeTab === 'phoenix' ? (
            <div className="phoenix-tab">
              <div className="connection-panel">
                <div className="form-group">
                  <label htmlFor="socketUrl">Socket URL:</label>
                  <input
                      type="text"
                      id="socketUrl"
                      value={socketUrl}
                      onChange={(e) => setSocketUrl(e.target.value)}
                      placeholder="ws://localhost:5004/auctions"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="authToken">JWT Auth Token (optional):</label>
                  <input
                      type="text"
                      id="authToken"
                      value={authToken}
                      onChange={(e) => setAuthToken(e.target.value)}
                      placeholder="Enter your JWT token (optional)"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="channelName">Channel Name:</label>
                  <input
                      type="text"
                      id="channelName"
                      value={channelName}
                      onChange={(e) => setChannelName(e.target.value)}
                      placeholder="room:lobby"
                  />
                </div>

                <div className="connection-buttons">
                  <button
                      onClick={connectSocket}
                      disabled={connected}
                      className={connected ? 'disabled' : ''}
                  >
                    Connect
                  </button>
                  <button
                      onClick={disconnectSocket}
                      disabled={!connected}
                      className={!connected ? 'disabled' : ''}
                  >
                    Disconnect
                  </button>
                </div>

                {error && <div className="error-message">{error}</div>}

                <div className="connection-status">
                  Status: <span className={connected ? 'connected' : 'disconnected'}>
                {connected ? 'Connected' : 'Disconnected'}
              </span>
                </div>
              </div>

              <div className="messages-container">
                <h2>Messages</h2>
                <div className="messages-list">
                  {messages.length === 0 ? (
                      <div className="no-messages">No messages yet</div>
                  ) : (
                      messages.map((msg, index) => (
                          <div key={index} className={`message ${msg.type}`}>
                            <div className="message-header">
                              {msg.sender && <span className="sender">{msg.sender}</span>}
                              <span className="timestamp">{formatTime(msg.timestamp)}</span>
                            </div>
                            <div className="message-content">{msg.text}</div>
                          </div>
                      ))
                  )}
                </div>
              </div>
            </div>
        ) : (
            <div className="sqs-tab">
              <SqsForm />
            </div>
        )}
      </div>
  );
}

export default App;