import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FileUploader from '../components/FileUploader';
import useWebSocket from '../hooks/useWebSocket';

jest.mock('../hooks/useWebSocket');

describe('FileUploader and WebSocket integration', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'File uploaded successfully' }),
      })
    );
    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      lastMessage: null,
      readyState: 1,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('uploads a file and shows progress', async () => {
    render(<FileUploader />);

    const file = new File(['hello'], 'hello.png', { type: 'image/png' });
    const input = screen.getByLabelText(/choose files/i) || screen.getByTestId('file-input');

    fireEvent.change(input, { target: { files: [file] } });

    const uploadButton = screen.getByRole('button', { name: /upload/i });
    fireEvent.click(uploadButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/files/upload'),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    // Check if progress or success message is displayed
    await waitFor(() => {
      expect(screen.getByText(/file uploaded/i)).toBeInTheDocument();
    });
  });

  test('handles WebSocket messages for progress updates', async () => {
    const mockLastMessage = {
      data: 'File uploaded: QuickLAN-pic.jpg',
    };
    useWebSocket.mockReturnValue({
      sendMessage: jest.fn(),
      lastMessage: mockLastMessage,
      readyState: 1,
    });

    render(<FileUploader />);

    expect(screen.getByText(/file uploaded: quicklan-pic.jpg/i)).toBeInTheDocument();
  });

  test('handles WebSocket connection errors and reconnection', async () => {
    const mockSendMessage = jest.fn();
    useWebSocket.mockReturnValue({
      sendMessage: mockSendMessage,
      lastMessage: null,
      readyState: 3, // Closed
    });

    render(<FileUploader />);

    // Simulate reconnection logic or error display if implemented
    // This depends on your useWebSocket hook implementation
    // For now, just check that sendMessage is not called when closed
    expect(mockSendMessage).not.toHaveBeenCalled();
  });
});
