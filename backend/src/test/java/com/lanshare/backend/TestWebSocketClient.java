package com.lanshare.backend;

import org.springframework.web.socket.client.standard.StandardWebSocketClient;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

public class TestWebSocketClient {

    public static void main(String[] args) throws Exception {
        String uri = "ws://localhost:9092/ws/progress";
        CountDownLatch latch = new CountDownLatch(1);

        StandardWebSocketClient client = new StandardWebSocketClient();
        WebSocketSession session = client.doHandshake(new TextWebSocketHandler() {
            @Override
            public void handleTextMessage(WebSocketSession session, TextMessage message) {
                System.out.println("Received WebSocket message: " + message.getPayload());
                latch.countDown();
            }
        }, uri).get();

        System.out.println("WebSocket client connected to " + uri);

        // Wait for a message or timeout after 30 seconds
        if (!latch.await(30, TimeUnit.SECONDS)) {
            System.out.println("No WebSocket message received within timeout.");
        }

        session.close();
        System.out.println("WebSocket client closed.");
    }
}
