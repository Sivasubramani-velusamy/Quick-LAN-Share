package com.lanshare.backend;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.TimeUnit;

import org.junit.jupiter.api.AfterAll;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestTemplate;

import jakarta.websocket.ClientEndpoint;
import jakarta.websocket.ContainerProvider;
import jakarta.websocket.OnMessage;
import jakarta.websocket.Session;
import jakarta.websocket.WebSocketContainer;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public class ComprehensiveBackendTests {

    private static RestTemplate restTemplate;
    private static String baseUrl;

    private static Session wsSession;
    private static CountDownLatch messageLatch;
    private static String lastMessage;

    @BeforeAll
    public static void setup() throws Exception {
        restTemplate = new RestTemplate();
        // Setup WebSocket client
        WebSocketContainer container = ContainerProvider.getWebSocketContainer();
        messageLatch = new CountDownLatch(1);
        // wsSession will be connected in individual tests with dynamic port
    }

    @AfterAll
    public static void teardown() throws Exception {
        if (wsSession != null && wsSession.isOpen()) {
            wsSession.close();
        }
    }

    @ClientEndpoint
    public static class ProgressClientEndpoint {
        @OnMessage
        public void onMessage(String message) {
            lastMessage = message;
            messageLatch.countDown();
        }
    }

    @Test
    public void testInvalidIp() {
        String url = "http://localhost:9092/api/send?receiverIp=256.256.256.256&receiverPort=9090&filePath=README.md";
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
        assertEquals("failure", response.getBody().get("status"));
    }

    @Test
    public void testInvalidPort() {
        String url = "http://localhost:9092/api/send?receiverIp=127.0.0.1&receiverPort=99999&filePath=README.md";
        ResponseEntity<String> response = restTemplate.postForEntity(url, null, String.class);
        assertTrue(response.getStatusCode().is4xxClientError() || response.getStatusCode().is5xxServerError());
    }

    @Test
    public void testMissingFile() {
        String url = "http://localhost:9092/api/send?receiverIp=127.0.0.1&receiverPort=9090&filePath=nonexistentfile.txt";
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
        assertEquals("failure", response.getBody().get("status"));
    }

    @Test
    public void testSuccessfulFileSendAndWebSocketProgress() throws Exception {
        // Prepare a small test file
        String testFilePath = "testfile.txt";
        Files.write(Paths.get(testFilePath), "Test content".getBytes());

        String url = "http://localhost:9092/api/send?receiverIp=127.0.0.1&receiverPort=9090&filePath=" + testFilePath;
        ResponseEntity<Map> response = restTemplate.postForEntity(url, null, Map.class);
        assertEquals("success", response.getBody().get("status"));

        // Wait for WebSocket progress message
        boolean messageReceived = messageLatch.await(10, TimeUnit.SECONDS);
        assertTrue(messageReceived, "Expected WebSocket progress message not received");
        assertNotNull(lastMessage);
        assertTrue(lastMessage.contains("Sending"));

        // Cleanup test file
        Files.deleteIfExists(Paths.get(testFilePath));
    }

    // Additional performance and concurrency tests can be added here
}
