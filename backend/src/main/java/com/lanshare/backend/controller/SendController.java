package com.lanshare.backend.controller;

import java.io.File;
import java.net.InetAddress;
import java.net.Socket;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.lanshare.backend.tcp.TCPFileSender;
import com.lanshare.backend.websocket.WebSocketBroadcastService;

@RestController
public class SendController {

    @Autowired
    private WebSocketBroadcastService broadcastService;

    @PostMapping("/api/send")
    public ResponseEntity<Map<String, String>> sendFile(
            @RequestParam String receiverIp,
            @RequestParam int receiverPort,
            @RequestParam String filePath) {

        Map<String, String> response = new HashMap<>();

        File file = new File(filePath);
        if (!file.exists() || !file.isFile()) {
            response.put("status", "failure");
            response.put("error", "File does not exist or is not a file");
            return ResponseEntity.badRequest().body(response);
        }

        TCPFileSender sender = new TCPFileSender(broadcastService);
        boolean success;
        try {
            success = sender.sendFile(receiverIp, receiverPort, file);
        } catch (Exception e) {
            System.err.println("❌ Exception in sendFile: " + e.getMessage());
            e.printStackTrace();
            response.put("status", "failure");
            response.put("error", "Exception during file send: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }

        if (success) {
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "failure");
            response.put("error", "Failed to send file");
            return ResponseEntity.status(500).body(response);
        }
    }

    @GetMapping("/api/discover-receivers")
    public ResponseEntity<List<String>> discoverReceivers() {
        List<String> availableReceivers = new ArrayList<>();
        String subnet = getLocalSubnet();
        int port = 9090;
        int timeout = 300;

        try {
            InetAddress localHost = InetAddress.getLocalHost();
            System.out.println("Local host IP: " + localHost.getHostAddress());
        } catch (Exception e) {
            System.err.println("Failed to get local host IP: " + e.getMessage());
        }

        System.out.println("Discovering receivers on subnet: " + subnet);

        if (subnet == null) {
            System.out.println("Subnet is null, returning empty list");
            return ResponseEntity.ok(availableReceivers);
        }

        java.util.concurrent.ExecutorService executor = java.util.concurrent.Executors.newFixedThreadPool(20);
        java.util.List<java.util.concurrent.Future<?>> futures = new java.util.ArrayList<>();

        for (int i = 1; i < 255; i++) {
            final String host = subnet + i;
            futures.add(executor.submit(() -> {
                try (Socket socket = new Socket()) {
                    socket.connect(new java.net.InetSocketAddress(host, port), timeout);
                    System.out.println("Found receiver at: " + host);
                    synchronized (availableReceivers) {
                        availableReceivers.add(host);
                    }
                } catch (Exception e) {
                    System.err.println("No receiver at: " + host + " - " + e.getMessage());
                }
            }));
        }

        // Wait for all tasks to complete
        for (java.util.concurrent.Future<?> future : futures) {
            try {
                future.get();
            } catch (Exception e) {
                System.err.println("Error waiting for discovery task: " + e.getMessage());
            }
        }

        executor.shutdown();

        System.out.println("Discovery complete. Found " + availableReceivers.size() + " receivers.");

        // Add connection establishment status to response headers
        return ResponseEntity.ok()
                .header("X-Discovery-Status", "Discovery completed with " + availableReceivers.size() + " receivers found")
                .body(availableReceivers);
    }

    private String getLocalSubnet() {
        try {
            InetAddress localHost = InetAddress.getLocalHost();
            String ip = localHost.getHostAddress();
            int lastDot = ip.lastIndexOf('.');
            if (lastDot > 0) {
                return ip.substring(0, lastDot + 1);
            }
        } catch (Exception e) {
            System.err.println("❌ Failed to get local subnet: " + e.getMessage());
        }
        return null;
    }
}
