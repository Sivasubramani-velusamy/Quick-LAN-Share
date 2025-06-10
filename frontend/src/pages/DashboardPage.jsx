import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';
import axios from 'axios';
import FileUploader from '../components/FileUploader';
import TransferLogs from '../components/TransferLogs';

const DashboardPage = ({ receiverIp, receiverPort }) => {
  const [files, setFiles] = useState([]);
  const [progressMessages, setProgressMessages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  useEffect(() => {
    fetchFiles();
  }, []);

  const fetchFiles = async () => {
    try {
      const response = await axios.get('http://localhost:9092/api/files');
      setFiles(response.data);
    } catch (error) {
      console.error('Error fetching files:', error);
      showSnackbar('Failed to fetch files', 'error');
    }
  };

  const showSnackbar = (message, severity = 'info') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const handleFileUpload = async (file) => {
    if (!receiverIp || !receiverPort) {
      showSnackbar('Receiver IP and port must be set.', 'warning');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Upload file to backend
      await axios.post('http://localhost:9092/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Send file via TCP
      await axios.post('http://localhost:9092/api/send', null, {
        params: {
          receiverIp,
          receiverPort,
          filePath: `received_files/${file.name}`,
        },
      });

      showSnackbar('File sent successfully!', 'success');
      fetchFiles();
    } catch (error) {
      console.error('Error sending file:', error);
      showSnackbar('Failed to send file.', 'error');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Dashboard
      </Typography>

      <FileUploader onFileUpload={handleFileUpload} uploading={uploading} />

      <Typography variant="h6" sx={{ mt: 4 }}>
        Available Files
      </Typography>
      <Paper sx={{ maxHeight: 200, overflowY: 'auto' }}>
        <List>
          {files.map((file) => (
            <ListItem key={file.name} divider>
              <ListItemText primary={file.name} secondary={`${file.size} bytes`} />
            </ListItem>
          ))}
        </List>
      </Paper>

      <TransferLogs logs={progressMessages} />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;
