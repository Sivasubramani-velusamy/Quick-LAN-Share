import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Paper,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Snackbar,
  Alert,
} from '@mui/material';

const FileUploader = ({ onFileUpload }) => {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [successFiles, setSuccessFiles] = useState([]);
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const handleFileSelect = (e) => {
    setSelectedFiles(Array.from(e.target.files));
    setSuccessFiles([]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setSelectedFiles(Array.from(e.dataTransfer.files));
    setSuccessFiles([]);
  };

  const preventDefaults = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleUpload = async () => {
    if (!selectedFiles.length) return;

    setUploading(true);
    const uploaded = [];

    for (const file of selectedFiles) {
      try {
        await onFileUpload(file);
        uploaded.push(file.name);
      } catch (err) {
        console.error('Upload failed for:', file.name, err);
      }
    }

    setUploading(false);
    setSuccessFiles(uploaded);
    setSnackbarOpen(true);
    setSelectedFiles([]);
  };

  return (
    <>
      <Paper
        sx={{
          p: 4,
          mt: 4,
          maxWidth: 600,
          margin: 'auto',
          boxShadow: 3,
          textAlign: 'center',
          border: '2px dashed #1976d2',
          bgcolor: '#f9f9f9',
        }}
        onDrop={handleDrop}
        onDragOver={preventDefaults}
        onDragEnter={preventDefaults}
        onDragLeave={preventDefaults}
      >
        <Typography variant="h5" gutterBottom>
          Upload Files
        </Typography>
        <Typography variant="body2" color="textSecondary" gutterBottom>
          Drag & drop files here or use the button below
        </Typography>

        <input
          type="file"
          multiple
          hidden
          id="fileInput"
          onChange={handleFileSelect}
        />
        <label htmlFor="fileInput">
          <Button variant="outlined" component="span" sx={{ mt: 2 }}>
            Choose Files
          </Button>
        </label>

        {selectedFiles.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1">Selected Files:</Typography>
            <List dense>
              {selectedFiles.map((file, idx) => (
                <ListItem key={idx}>
                  <ListItemText
                    primary={file.name}
                    secondary={`${(file.size / 1024).toFixed(2)} KB`}
                  />
                </ListItem>
              ))}
            </List>

            <Button
              variant="contained"
              color="primary"
              onClick={handleUpload}
              disabled={uploading}
              sx={{ mt: 2 }}
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </Button>

            {uploading && <LinearProgress sx={{ mt: 2 }} />}
          </Box>
        )}
      </Paper>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity="success"
          variant="filled"
          sx={{ width: '100%' }}
        >
          {successFiles.length} file(s) uploaded successfully!
        </Alert>
      </Snackbar>
    </>
  );
};

export default FileUploader;
