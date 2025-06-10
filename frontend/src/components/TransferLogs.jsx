import React from 'react';
import { Box, Typography, Paper, List, ListItem, ListItemText } from '@mui/material';

const TransferLogs = ({ logs }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6" gutterBottom>
        Transfer Logs
      </Typography>
      <Paper sx={{ maxHeight: 200, overflowY: 'auto', p: 2, backgroundColor: '#f5f5f5' }}>
        {logs.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No transfer logs available.
          </Typography>
        ) : (
          <List dense>
            {logs.map((log, index) => (
              <ListItem key={index} divider>
                <ListItemText primary={log} />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TransferLogs;
