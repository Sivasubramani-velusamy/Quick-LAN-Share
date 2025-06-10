import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';

const HomePage = ({ onConnect }) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(9090);
  const [recentDevices, setRecentDevices] = useState([]);

  useEffect(() => {
    const storedDevices = localStorage.getItem('recentDevices');
    if (storedDevices) {
      setRecentDevices(JSON.parse(storedDevices));
    }
  }, []);

  const handleConnect = () => {
    if (ip && port) {
      onConnect(ip, port);
      const updatedDevices = [ { ip, port }, ...recentDevices.filter(d => d.ip !== ip || d.port !== port) ];
      setRecentDevices(updatedDevices);
      localStorage.setItem('recentDevices', JSON.stringify(updatedDevices));
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 400, margin: 'auto', mt: 6 }}>
      <Typography variant="h5" gutterBottom>
        Connect to Receiver
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Receiver IP"
          value={ip}
          onChange={(e) => setIp(e.target.value)}
          fullWidth
        />
        <TextField
          label="Receiver Port"
          type="number"
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
          fullWidth
        />
        <Button variant="contained" onClick={handleConnect} disabled={!ip || !port}>
          Connect
        </Button>
      </Box>

      {recentDevices.length > 0 && (
        <>
          <Typography variant="subtitle1" sx={{ mt: 3 }}>
            Recent Devices
          </Typography>
          <List>
            {recentDevices.map(({ ip, port }, index) => (
              <ListItem button key={index} onClick={() => onConnect(ip, port)}>
                <ListItemText primary={`${ip}:${port}`} />
              </ListItem>
            ))}
          </List>
        </>
      )}
    </Paper>
  );
};

export default HomePage;
