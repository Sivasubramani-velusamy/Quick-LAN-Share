package com.lanshare.backend;

import java.net.URI;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

@ClientEndpoint
public class StandardWebSocketTestClient {

    private static CountDownLatch latch;

    @OnMessage
    public void onMessage(String message) {
        System.out.println("Received WebSocket message: " + message);
        latch.countDown();
    }

    public static void main(String[] args) {
        latch = new CountDownLatch(1);
        try {
            WebSocketContainer container = ContainerProvider.getWebSocketContainer();
            String uri = "ws://localhost:9092/ws/progress";
            System.out.println("Connecting to " + uri);
            Session session = container.connectToServer(StandardWebSocketTestClient.class, URI.create(uri));

            // Wait for a message or timeout after 30 seconds
            if (!latch.await(30, TimeUnit.SECONDS)) {
                System.out.println("No WebSocket message received within timeout.");
            }

            session.close();
            System.out.println("WebSocket client closed.");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
