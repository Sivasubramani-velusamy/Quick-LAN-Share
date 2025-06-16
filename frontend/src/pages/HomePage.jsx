import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import ConnectionForm from '../components/ConnectionForm';
import FileUploader from '../components/FileUploader';
import useWebSocket from '../hooks/useWebSocket';

const HomePage = () => {
  const [connected, setConnected] = useState(false);
  const [receiverIp, setReceiverIp] = useState('');
  const [receiverPort, setReceiverPort] = useState(9090);
  const { connected: wsConnected, messages, sendMessage, error } = useWebSocket();

  const handleConnect = (ip, port) => {
    setReceiverIp(ip);
    setReceiverPort(port);
    setConnected(true);
  };

  const handleFileUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:9092/api/files/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('File upload failed');
      }

      // Optionally send a WebSocket message to notify progress
      sendMessage(`File uploaded: ${file.name}`);
    } catch (err) {
      alert('File upload error: ' + err.message);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
      <ConnectionForm onConnect={handleConnect} />
      {connected && (
        <Paper sx={{ p: 2, mt: 4 }}>
          <Typography variant="h6">Connected to {receiverIp}:{receiverPort}</Typography>
          <FileUploader onFileUpload={handleFileUpload} />
          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            WebSocket Connection: {wsConnected ? 'Connected' : 'Disconnected'}
          </Typography>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1 }}>
              WebSocket Error: {error}
            </Typography>
          )}
          <List dense sx={{ maxHeight: 200, overflowY: 'auto' }}>
            {messages.map((msg, idx) => (
              <ListItem key={idx}>
                <ListItemText primary={msg} />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
};

export default HomePage;
