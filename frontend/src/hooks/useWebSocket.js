import { useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const useWebSocket = () => {
  const client = useRef(null);
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  useEffect(() => {
    const url = 'http://localhost:9092/ws/progress';

    const connect = () => {
      client.current = new Client({
        brokerURL: undefined,
        webSocketFactory: () => new SockJS(url),
        reconnectDelay: 5000,
        debug: (str) => {
          console.log(str);
        },
      });

      client.current.onConnect = () => {
        setConnected(true);
        setError(null);
        setRetryCount(0);
        console.log('STOMP connected');

        client.current.subscribe('/topic/progress', (message) => {
          if (message.body) {
            setMessages((prev) => [...prev, message.body]);
            console.log('Received message:', message.body);
          }
        });
      };

      client.current.onStompError = (frame) => {
        setConnected(false);
        setError('STOMP error: ' + frame.message);
        console.error('STOMP error:', frame);
      };

      client.current.onWebSocketClose = () => {
        setConnected(false);
        console.log('STOMP disconnected');
        if (retryCount < maxRetries) {
          setRetryCount((count) => count + 1);
          setTimeout(() => {
            connect();
          }, 2000);
        } else {
          setError('Max retry attempts reached. Connection failed.');
        }
      };

      client.current.activate();
    };

    connect();

    return () => {
      if (client.current) {
        client.current.deactivate();
      }
    };
  }, [retryCount]);

  const sendMessage = (msg) => {
    if (client.current && client.current.connected) {
      client.current.publish({ destination: '/app/progress', body: msg });
    } else {
      console.error('STOMP client is not connected');
      setError('Cannot send message: STOMP client is not connected');
    }
  };

  return { connected, messages, sendMessage, error };
};

export default useWebSocket;
