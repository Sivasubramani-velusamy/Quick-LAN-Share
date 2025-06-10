package com.lanshare.backend.websocket;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProgressMessage {
    private String fileName;
    private long bytesSent;
    private long totalBytes;
}
