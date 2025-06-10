
// import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Paper,
//   List,
//   ListItem,
//   ListItemText,
//   Snackbar,
//   Alert,
// } from '@mui/material';
// import axios from 'axios';
// import FileUploader from '../components/FileUploader';
// import TransferLogs from '../components/TransferLogs';

// const DashboardPage = ({ receiverIp, receiverPort }) => {
//   const [files, setFiles] = useState([]);
//   const [progressMessages, setProgressMessages] = useState([]);
//   const [uploading, setUploading] = useState(false);
//   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

//   useEffect(() => {
//     fetchFiles();
//   }, []);

//   const fetchFiles = async () => {
//     try {
//       const response = await axios.get('http://localhost:9092/api/files');
//       setFiles(response.data);
//     } catch (error) {
//       console.error('Error fetching files:', error);
//       showSnackbar('Failed to fetch files', 'error');
//     }
//   };

//   const showSnackbar = (message, severity = 'info') => {
//     setSnackbar({ open: true, message, severity });
//   };

//   const handleCloseSnackbar = () => {
//     setSnackbar({ ...snackbar, open: false });
//   };

//   const handleFileUpload = async (file) => {
//     if (!receiverIp || !receiverPort) {
//       showSnackbar('Receiver IP and port must be set.', 'warning');
//       return;
//     }

//     setUploading(true);
//     try {
//       const formData = new FormData();
//       formData.append('file', file);

//       // Upload file to backend
//       await axios.post('http://localhost:9092/api/files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       // Send file via TCP
//       await axios.post('http://localhost:9092/api/send', null, {
//         params: {
//           receiverIp,
//           receiverPort,
//           filePath: `received_files/${file.name}`,
//         },
//       });

//       showSnackbar('File sent successfully!', 'success');
//       fetchFiles();
//     } 
//     catch (error ) {
//       console.error('Error sending file:', error);
//       //showSnackbar('Failed to send file.', 'error');
//     } 
//     finally {
//       setUploading(false);
//     }
//   };

//   return (
//     <Box>
//       <Typography variant="h5" gutterBottom>
//         Dashboard
//       </Typography>

//       <FileUploader onFileUpload={handleFileUpload} uploading={uploading} />

//       <Typography variant="h6" sx={{ mt: 4 }}>
//         Available Files
//       </Typography>
//       <Paper sx={{ maxHeight: 200, overflowY: 'auto' }}>
//         <List>
//           {files.map((file) => (
//             <ListItem key={file.name} divider>
//               <ListItemText primary={file.name} secondary={`${file.size} bytes`} />
//             </ListItem>
//           ))}
//         </List>
//       </Paper>

//       <TransferLogs logs={progressMessages} />

//       <Snackbar
//         open={snackbar.open}
//         autoHideDuration={6000}
//         onClose={handleCloseSnackbar}
//         anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
//       >
//         <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
//           {snackbar.message}
//         </Alert>
//       </Snackbar>
//     </Box>
//   );
// };

// export default DashboardPage;
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
    // Clear any existing snackbar first to prevent overlap
    setSnackbar({ open: false, message: '', severity: 'info' });
    
    // Use setTimeout to ensure clean message display
    setTimeout(() => {
      setSnackbar({ open: true, message, severity });
    }, 100);
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  const addProgressMessage = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setProgressMessages(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const handleFileUpload = async (file) => {
    if (!receiverIp || !receiverPort) {
      showSnackbar('Receiver IP and port must be set.', 'warning');
      return;
    }

    setUploading(true);
    let uploadCompleted = false;
    let sendCompleted = false;

    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Step 1: Upload file to backend
      addProgressMessage(`Starting upload: ${file.name}`);
      
      await axios.post('http://localhost:9092/api/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 60000, // 60 second timeout for large files
      });
      
      uploadCompleted = true;
      addProgressMessage(`Upload completed: ${file.name}`);

      // Step 2: Send file via TCP
      addProgressMessage(`Sending file to ${receiverIp}:${receiverPort}`);
      
      await axios.post('http://localhost:9092/api/send', null, {
        params: {
          receiverIp,
          receiverPort,
          filePath: `received_files/${file.name}`,
        },
        timeout: 30000, // 30 second timeout for sending
      });

      sendCompleted = true;
      addProgressMessage(`File sent successfully: ${file.name}`);
      
      // Only show success if both operations completed
      showSnackbar(`File "${file.name}" uploaded and sent successfully!`, 'success');
      fetchFiles();
      
    } catch (error) {
      console.error('Error in file operation:', error);
      
      // Determine what failed and show appropriate message
      let errorMessage = '';
      
      if (!uploadCompleted) {
        errorMessage = `Failed to upload "${file.name}"`;
        addProgressMessage(`Upload failed: ${file.name} - ${error.message}`);
      } else if (!sendCompleted) {
        errorMessage = `Upload successful but failed to send "${file.name}"`;
        addProgressMessage(`Send failed: ${file.name} - ${error.message}`);
        // Still refresh files since upload succeeded
        fetchFiles();
      }

      // Add specific error context
      if (error.code === 'ECONNABORTED') {
        errorMessage += ' (Operation timed out)';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage += ' (Connection refused - check receiver)';
      } else if (error.response?.status === 404) {
        errorMessage += ' (File not found)';
      } else if (error.response?.status >= 500) {
        errorMessage += ' (Server error)';
      }

      showSnackbar(errorMessage, 'error');
      
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
        Available Files ({files.length})
      </Typography>
      
      <Paper sx={{ maxHeight: 200, overflowY: 'auto' }}>
        {files.length === 0 ? (
          <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">No files uploaded yet</Typography>
          </Box>
        ) : (
          <List>
            {files.map((file, index) => (
              <ListItem key={`${file.name}-${index}`} divider>
                <ListItemText 
                  primary={file.name} 
                  secondary={`${(file.size / 1024).toFixed(1)} KB`} 
                />
              </ListItem>
            ))}
          </List>
        )}
      </Paper>
      
      <TransferLogs logs={progressMessages} />
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        key={`${snackbar.message}-${snackbar.severity}`} // Force re-render on message change
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default DashboardPage;