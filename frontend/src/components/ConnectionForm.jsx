// import React, { useState } from 'react';
// import { Box, TextField, Button, Typography, Paper } from '@mui/material';

// const ConnectionForm = ({ onConnect }) => {
//   const [ip, setIp] = useState('');
//   const [port, setPort] = useState(9090);

//   const handleConnect = () => {
//     if (ip && port) {
//       onConnect(ip, port);
//     }
//   };

//   return (
//     <Paper sx={{ p: 3, maxWidth: 400, margin: 'auto', mt: 6 }}>
//       <Typography variant="h5" gutterBottom>
//         Connect to Receiver
//       </Typography>
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//         <TextField
//           label="Receiver IP"
//           value={ip}
//           onChange={(e) => setIp(e.target.value)}
//           fullWidth
//         />
//         <TextField
//           label="Receiver Port"
//           type="number"
//           value={port}
//           onChange={(e) => setPort(Number(e.target.value))}
//           fullWidth
//         />
//         <Button variant="contained" onClick={handleConnect} disabled={!ip || !port}>
//           Connect
//         </Button>
//       </Box>
//     </Paper>
//   );
// };

// export default ConnectionForm;


import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  InputAdornment
} from '@mui/material';
import LanIcon from '@mui/icons-material/Lan';
import DnsIcon from '@mui/icons-material/Dns';

const ConnectionForm = ({ onConnect }) => {
  const [ip, setIp] = useState('');
  const [port, setPort] = useState(9090);
  const [error, setError] = useState('');

  const validateIP = (ip) => {
    const ipRegex = /^(25[0-5]|2[0-4]\d|[01]?\d\d?)\.((25[0-5]|2[0-4]\d|[01]?\d\d?)\.){2}(25[0-5]|2[0-4]\d|[01]?\d\d?)$/;
    return ipRegex.test(ip);
  };

  const handleConnect = () => {
    if (!validateIP(ip)) {
      setError('Invalid IP address');
      return;
    }
    setError('');
    onConnect(ip, port);
  };

  return (
    <Paper sx={{ p: 4, maxWidth: 400, margin: 'auto', mt: 6, boxShadow: 3 }}>
      <Typography variant="h5" gutterBottom textAlign="center">
        Connect to Receiver
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
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
          }}
        />

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

        <Button
          variant="contained"
          size="large"
          onClick={handleConnect}
          disabled={!ip || !port}
        >
          Connect
        </Button>
      </Box>
    </Paper>
  );
};

export default ConnectionForm;
