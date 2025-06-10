package com.lanshare.backend.websocket;

import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class ProgressController {

    @MessageMapping("/progress")
    @SendTo("/topic/progress")
    public String sendProgress(String message) {
        // Here you can process the incoming message and broadcast progress updates
        System.out.println("Received message: " + message);
        return message; // Echo the message to subscribers
    }
}
