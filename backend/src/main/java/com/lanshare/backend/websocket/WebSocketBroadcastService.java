package com.lanshare.backend.websocket;

import java.util.concurrent.CopyOnWriteArrayList;

import org.springframework.stereotype.Service;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

@Service
public class WebSocketBroadcastService {

    private static final CopyOnWriteArrayList<WebSocketSession> sessions = new CopyOnWriteArrayList<>();

    public void addSession(WebSocketSession session) {
        sessions.add(session);
    }

    public void removeSession(WebSocketSession session) {
        sessions.remove(session);
    }

    public void broadcast(String message) {
        for (WebSocketSession session : sessions) {
            try {
                if (session.isOpen()) {
                    session.sendMessage(new TextMessage(message));
                }
            } catch (Exception e) {
                System.err.println("⚠️ Failed to send message to " + session.getId());
                e.printStackTrace();
            }
        }
    }

    public void broadcastError(String message) {
        broadcast("❌ ERROR: " + message);
    }

    public void broadcastWarning(String message) {
        broadcast("⚠️ WARNING: " + message);
    }
}
