package com.lanshare.backend;

import java.io.DataOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.net.Socket;

public class TestFileSendClient {

    public static void main(String[] args) {
        String serverIp = "127.0.0.1";
        int serverPort = 9090;
        String filePath = "../README.md"; // Adjusted path to file relative to backend/src/test/java directory

        try (Socket socket = new Socket(serverIp, serverPort);
             DataOutputStream dos = new DataOutputStream(socket.getOutputStream());
             FileInputStream fis = new FileInputStream(new File(filePath))) {

            File file = new File(filePath);
            dos.writeUTF(file.getName());
            dos.writeLong(file.length());

            byte[] buffer = new byte[4096];
            int read;
            while ((read = fis.read(buffer)) != -1) {
                dos.write(buffer, 0, read);
            }
            dos.flush();

            System.out.println("File sent successfully: " + file.getName());

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
