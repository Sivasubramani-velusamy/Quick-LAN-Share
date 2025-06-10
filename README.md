# QuickLAN Backend Service

## Overview
QuickLAN is a backend service designed to facilitate file transfer over a local network using TCP sockets. It provides a TCP file receiver that listens for incoming file transfers and saves received files to a designated directory. Additionally, it offers real-time progress updates via WebSocket to connected clients.

## Tech Stack
- Java 17+
- Spring Boot
- Spring Web (REST API)
- Spring WebSocket
- Java Socket Programming (TCP)
- Maven for build
- Java IO Streams for chunked file reading/writing

## Frontend Tech Stack
- React.js (18+)
- Material UI for responsive design
- Axios for HTTP API requests
- WebSocket Client for real-time progress updates
- Drag & Drop UI and form inputs (IP, port, file select)

## Features
- TCP-based file receiving on port 9090.
- Saves received files to the `received_files` directory.
- Real-time progress updates broadcasted over WebSocket at `/ws/progress`.
- Spring Boot application running on port 9092.

## Key Features
- 🔁 Reliable file transfer over TCP Socket
- ⚡ Real-time progress tracking via WebSocket
- 💻 Works entirely offline within a LAN
- 📂 Supports any file type with chunked transfer
- 🧩 Modular design – backend and frontend are cleanly separated
- 🧪 Easily testable across multiple LAN devices

## Project Structure
- `BackendApplication.java`: Main Spring Boot application class that starts the TCP receiver thread.
- `tcp/TCPFileReceiver.java`: Implements the TCP server to receive files.
- `tcp/TCPFileSender.java`: Implements the TCP client to send files.
- `controller/SendController.java`: REST API controller to handle file sending requests.
- `websocket/WebSocketConfig.java`: Configures WebSocket endpoints.
- `websocket/ProgressController.java`: Handles WebSocket connections and broadcasts progress messages.
- `received_files/`: Directory where received files are saved.

## Running the Project
1. Ensure Java 23 and Maven are installed.
2. Build and run the backend service:
   ```bash
   mvn spring-boot:run -f backend/pom.xml
   ```
3. The backend will start on port 9092, and the TCP receiver will listen on port 9090.

## Notes
- If the TCP receiver port 9090 is already in use, the receiver will fail to start. Ensure the port is free before running the service.
- WebSocket endpoint is available at `/ws/progress` for real-time progress updates.
- Frontend React app should be run separately and configured to connect to backend API and WebSocket endpoints.

## Dependencies
- Spring Boot 3.5.0
- Jakarta Annotations
- WebSocket support

## License
This project is licensed under the MIT License.
