package com.lanshare.backend.controller;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        boolean success = sender.sendFile(receiverIp, receiverPort, file);

        if (success) {
            response.put("status", "success");
            return ResponseEntity.ok(response);
        } else {
            response.put("status", "failure");
            response.put("error", "Failed to send file");
            return ResponseEntity.status(500).body(response);
        }
    }
}
