import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment,
  MenuItem,
  CircularProgress,
  Popper,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ClickAwayListener,
  IconButton
} from '@mui/material';
import LanIcon from '@mui/icons-material/Lan';
import DnsIcon from '@mui/icons-material/Dns';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const ConnectionForm = ({ onConnect }) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(9090);
  const [error, setError] = useState('');
  const [availableDevices, setAvailableDevices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const anchorRef = useRef(null);

  const validateIP = (ip) => {
    const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){2}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    return ipRegex.test(ip);
  };

  const fetchAvailableDevices = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:9092/api/discover-receivers');
      if (response.ok) {
        try {
          const devices = await response.json();
          console.log('Devices:', devices);
          setAvailableDevices(devices);
        } catch (jsonError) {
          const text = await response.text();
          console.error('Failed to parse JSON. Response text:', text);
          setAvailableDevices([]);
        }
      } else {
        console.error('HTTP error fetching devices:', response.status);
        setAvailableDevices([]);
      }
    } catch (err) {
      console.error('Fetch error:', err);
      alert('Error fetching available devices: ' + err.message);
      setAvailableDevices([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (dropdownOpen) fetchAvailableDevices();
  }, [dropdownOpen]);

  const handleConnect = () => {
    if (!validateIP(ip)) {
      setError('Invalid IP address');
      return;
    }
    setError('');
    onConnect(ip, port);
  };

  const handleSelectDevice = (device) => {
    setIp(device);
    setDropdownOpen(false);
    setError('');
  };

  // Ensure availableDevices is an array of strings (IPs) for rendering
  useEffect(() => {
    if (availableDevices.length > 0 && typeof availableDevices[0] === 'object' && availableDevices[0].ip) {
      setAvailableDevices(availableDevices.map(d => d.ip));
    }
  }, [availableDevices]);


  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: 'auto', mt: 6, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        Connect to Receiver
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            label="Receiver IP"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
            error={!!error}
            helperText={error}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LanIcon />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton ref={anchorRef} onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <ArrowDropDownIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Popper open={dropdownOpen} anchorEl={anchorRef.current} placement="bottom-start" style={{ zIndex: 1300 }}>
            <ClickAwayListener onClickAway={() => setDropdownOpen(false)}>
              <Paper sx={{ maxHeight: 200, overflowY: 'auto', width: 300 }}>
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : availableDevices.length === 0 ? (
                  <Typography sx={{ p: 2 }}>No devices found.</Typography>
                ) : (
                  <List dense>
{availableDevices.map((device) => (
  <ListItem key={device} disablePadding>
    <ListItemButton onClick={() => handleSelectDevice(device)}>
      <ListItemText primary={device} />
    </ListItemButton>
  </ListItem>
))}
                  </List>
                )}
              </Paper>
            </ClickAwayListener>
          </Popper>
        </Box>

        <TextField
          label="Port"
          type="number"
          value={port}
          onChange={(e) => setPort(Number(e.target.value))}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DnsIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button variant="contained" size="large" onClick={handleConnect} disabled={!ip || !port}>
          Connect
        </Button>
      </Box>
    </Paper>
  );
};

export default ConnectionForm;
