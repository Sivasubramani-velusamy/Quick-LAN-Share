package com.lanshare.backend.tcp;

import java.io.BufferedOutputStream;
import java.io.DataInputStream;
import java.io.EOFException;
import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.ServerSocket;
import java.net.Socket;
import java.nio.file.Files;
import java.nio.file.Path;

import org.springframework.lang.NonNull;

import com.lanshare.backend.websocket.WebSocketBroadcastService;

public class TCPFileReceiver implements Runnable {

    private static final int PORT = 9090;
    private static final String SAVE_DIR = "received_files";

    private final WebSocketBroadcastService broadcastService;

    public TCPFileReceiver(WebSocketBroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    @Override
    public void run() {
        try (ServerSocket serverSocket = new ServerSocket(PORT)) {
            System.out.println("📥 Receiver listening on port " + PORT);

            Path saveDirPath = Path.of(SAVE_DIR);
            if (Files.notExists(saveDirPath)) {
                Files.createDirectories(saveDirPath);
            }

            while (true) {
                Socket socket = serverSocket.accept();
                System.out.println("New connection from " + socket.getRemoteSocketAddress());
                new Thread(() -> handleClient(socket)).start();
            }

        } catch (IOException e) {
            System.err.println("❌ Failed to start receiver: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private void handleClient(@NonNull Socket socket) {
        try (InputStream inputStream = socket.getInputStream();
             DataInputStream dis = new DataInputStream(inputStream)) {

            // Remove the check for dis.available() == 0 to avoid premature connection closure
            // if (dis.available() == 0) {
            //     System.out.println("No data received from " + socket.getRemoteSocketAddress() + ", closing connection.");
            //     if (socket != null && !socket.isClosed()) {
            //         socket.close();
            //     }
            //     return;
            // }

            String fileName = dis.readUTF();
            long fileSize = dis.readLong();

            File outFile = new File(SAVE_DIR, fileName);
            try (BufferedOutputStream bos = new BufferedOutputStream(new FileOutputStream(outFile))) {

                byte[] buffer = new byte[4096];
                int bytesRead;
                long totalRead = 0;

                while (totalRead < fileSize && (bytesRead = dis.read(buffer)) != -1) {
                    bos.write(buffer, 0, bytesRead);
                    totalRead += bytesRead;

                    String percent = String.format("%.2f", (totalRead * 100.0) / fileSize);
                    broadcastService.broadcast("Receiving " + fileName + ": " + percent + "%");
                }

                if (totalRead < fileSize) {
                    broadcastService.broadcastWarning("Client disconnected prematurely while receiving " + fileName);
                    System.err.println("⚠️ Client disconnected prematurely while receiving " + fileName + " from " + socket.getRemoteSocketAddress());
                    // Optionally delete partial file
                    if (outFile.exists()) {
                        boolean deleted = outFile.delete();
                        if (deleted) {
                            System.out.println("🗑️ Partial file deleted: " + outFile.getAbsolutePath());
                        } else {
                            System.err.println("❌ Failed to delete partial file: " + outFile.getAbsolutePath());
                        }
                    }
                } else {
                    System.out.println("✅ File received: " + outFile.getAbsolutePath());
                }
            }

        } catch (EOFException eof) {
            System.err.println("❌ EOFException: Client disconnected prematurely from " + socket.getRemoteSocketAddress());
        } catch (IOException e) {
            System.err.println("❌ Error while receiving file from " + socket.getRemoteSocketAddress() + ": " + e.getMessage());
            e.printStackTrace();
        } finally {
            try {
                if (socket != null && !socket.isClosed()) {
                    socket.close();
                }
            } catch (IOException e) {
                System.err.println("❌ Error closing socket: " + e.getMessage());
            }
        }
    }
}
