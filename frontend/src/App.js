import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [connected, setConnected] = useState(false);
  const [receiverIp, setReceiverIp] = useState('');
  const [receiverPort, setReceiverPort] = useState(9090);

  const handleConnect = (ip, port) => {
    setReceiverIp(ip);
    setReceiverPort(port);
    setConnected(true);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">QuickLAN File Sender</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        {!connected ? (
          <HomePage onConnect={handleConnect} />
        ) : (
          <DashboardPage receiverIp={receiverIp} receiverPort={receiverPort} />
        )}
      </Container>
    </>
  );
}

export default App;
