package com.lanshare.backend.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HealthCheckController {

    private static volatile boolean tcpReceiverRunning = false;

    public static void setTcpReceiverRunning(boolean running) {
        tcpReceiverRunning = running;
    }

    @GetMapping("/api/health/tcp-receiver")
    public String tcpReceiverHealth() {
        return tcpReceiverRunning ? "TCPFileReceiver is running" : "TCPFileReceiver is not running";
    }
}
