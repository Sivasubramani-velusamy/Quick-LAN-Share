import React from 'react';
import { Card, CardContent, Typography, LinearProgress, Box } from '@mui/material';

/**
 * FileProgressCard component displays the progress of a file transfer.
 * Props:
 * - fileName: string - name of the file being transferred
 * - progress: number - progress percentage (0-100)
 * - status: string - status message (e.g., "Uploading", "Completed", "Failed")
 */
const FileProgressCard = ({ fileName, progress, status }) => {
  return (
    <Card variant="outlined" sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6" component="div" gutterBottom>
          {fileName}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <LinearProgress variant="determinate" value={progress} />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ minWidth: 75 }}>
            {progress}%
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {status}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FileProgressCard;
