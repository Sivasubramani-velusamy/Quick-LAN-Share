package com.lanshare.backend;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;

public class RestApiErrorHandlingTest {

    public static void main(String[] args) throws Exception {
        testInvalidIp();
        testInvalidPort();
        testMissingFile();
    }

    private static void testInvalidIp() throws Exception {
        String ip = "256.256.256.256"; // Invalid IP
        int port = 9090;
        String filePath = "../README.md";
        sendRequest(ip, port, filePath, "Invalid IP Test");
    }

    private static void testInvalidPort() throws Exception {
        String ip = "127.0.0.1";
        int port = 99999; // Invalid port
        String filePath = "../README.md";
        sendRequest(ip, port, filePath, "Invalid Port Test");
    }

    private static void testMissingFile() throws Exception {
        String ip = "127.0.0.1";
        int port = 9090;
        String filePath = "../nonexistentfile.txt"; // Missing file
        sendRequest(ip, port, filePath, "Missing File Test");
    }

    private static void sendRequest(String ip, int port, String filePath, String testName) throws Exception {
        String urlStr = String.format("http://localhost:9092/api/send?receiverIp=%s&receiverPort=%d&filePath=%s",
                URLEncoder.encode(ip, "UTF-8"),
                port,
                URLEncoder.encode(filePath, "UTF-8"));

        URL url = new URL(urlStr);
        HttpURLConnection con = (HttpURLConnection) url.openConnection();
        con.setRequestMethod("POST");

        int responseCode = con.getResponseCode();
        System.out.println(testName + " - Response Code: " + responseCode);

        BufferedReader in;
        if (responseCode >= 200 && responseCode < 400) {
            in = new BufferedReader(new InputStreamReader(con.getInputStream()));
        } else {
            in = new BufferedReader(new InputStreamReader(con.getErrorStream()));
        }
        String inputLine;
        StringBuilder response = new StringBuilder();

        while ((inputLine = in.readLine()) != null) {
            response.append(inputLine);
        }
        in.close();

        System.out.println(testName + " - Response Body: " + response.toString());
    }
}
