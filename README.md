# QuickLAN

QuickLAN is a local network file sharing application that allows users to transfer files between devices connected on the same local network (LAN) without requiring internet data usage.

## Running the Project

### Backend (Java Spring Boot)
1. Open a terminal in the project root directory.
2. Run the backend server using the Maven wrapper:
   - On Windows CMD or PowerShell:
     ```
     backend\mvnw.cmd spring-boot:run
     ```
3. The backend server will start on port 9092 by default.

### Frontend (React)
1. Open another terminal in the project root directory.
2. Navigate to the frontend directory:
   ```
   cd frontend
   ```
3. Install dependencies if not already done:
   ```
   npm install
   ```
4. Start the React development server:
   ```
   npm start
   ```
5. The frontend will start on port 3000 and open in your default browser.

## Usage

- The connection form in the frontend UI allows auto-detection of available receiver devices on the local network.
- Click the dropdown arrow next to the IP input field to see available devices discovered by the backend.
- Select a device IP from the dropdown or enter it manually.
- Upload files to transfer them to the selected receiver device.
- File transfer progress is displayed in the UI.
- Received files are stored in the `backend/received_files/` directory on the receiver device.

## Network Requirements

- Both sender and receiver devices must be connected to the same local network (LAN).
- No internet or external data usage is required for file sharing.
- The backend discovers devices and transfers files directly over the local network.

## Testing

- Automated tests cover frontend components and backend API endpoints.
- Manual testing is recommended to verify device discovery, file upload, and transfer progress.

## Troubleshooting

- Ensure both devices are on the same network.
- Check firewall settings to allow backend server communication.
- Verify backend server is running on both sender and receiver devices.
