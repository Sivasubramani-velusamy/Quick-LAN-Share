package com.lanshare.backend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.stereotype.Component;

import com.lanshare.backend.tcp.TCPFileReceiver;
import com.lanshare.backend.websocket.WebSocketBroadcastService;

import jakarta.annotation.PostConstruct;

@SpringBootApplication
public class BackendApplication {

    public static void main(String[] args) {
        SpringApplication.run(BackendApplication.class, args);
    }
}

@Component
class TCPReceiverStarter {

    @Autowired
    private WebSocketBroadcastService broadcastService;

    @PostConstruct
    public void startReceiver() {
        Thread receiverThread = new Thread(new TCPFileReceiver(broadcastService));
        receiverThread.setDaemon(false); // Keeps app running
        receiverThread.start();
        System.out.println("🟢 TCP Receiver thread started");
    }
}
