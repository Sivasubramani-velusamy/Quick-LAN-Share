package com.lanshare.backend.tcp;

import java.io.BufferedInputStream;
import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.net.Socket;

import com.lanshare.backend.websocket.WebSocketBroadcastService;

public class TCPFileSender {

    private final WebSocketBroadcastService broadcastService;

    public TCPFileSender(WebSocketBroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    public boolean sendFile(String receiverIp, int receiverPort, File file) {
        if (file == null || !file.exists() || !file.isFile()) {
            System.err.println("❌ Invalid file provided for sending.");
            return false;
        }

        try (Socket socket = new Socket(receiverIp, receiverPort);
             DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
             BufferedInputStream bis = new BufferedInputStream(new FileInputStream(file))) {

            dos.writeUTF(file.getName());
            dos.writeLong(file.length());

            byte[] buffer = new byte[4096];
            int bytesRead;
            long totalSent = 0;
            long fileSize = file.length();

            while ((bytesRead = bis.read(buffer)) != -1) {
                dos.write(buffer, 0, bytesRead);
                totalSent += bytesRead;

                String percent = String.format("%.2f", (totalSent * 100.0) / fileSize);
                broadcastService.broadcast("Sending " + file.getName() + ": " + percent + "%");
            }

            dos.flush();
            System.out.println("✅ File sent successfully: " + file.getName());
            return true;

        } catch (IOException e) {
            System.err.println("❌ Error sending file: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
