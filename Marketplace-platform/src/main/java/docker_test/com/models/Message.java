package docker_test.com.models;

import java.time.LocalDateTime;

public final class Message {
    private long messageId;
    private long conversationId;
    private long senderId;
    private String messageText;
    private String imageUrl;
    private int isRead;
    private LocalDateTime createdAt;

    public Message() {
        this.isRead = 0;
        this.createdAt = LocalDateTime.now();
    }

    public Message(long messageId, long conversationId, long senderId, String messageText,
                   String imageUrl, int isRead, LocalDateTime createdAt) {
        this.messageId = messageId;
        this.conversationId = conversationId;
        this.senderId = senderId;
        this.messageText = messageText;
        this.imageUrl = imageUrl;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public long getMessageId() { return messageId; }
    public void setMessageId(long messageId) { this.messageId = messageId; }
    public long getConversationId() { return conversationId; }
    public void setConversationId(long conversationId) { this.conversationId = conversationId; }
    public long getSenderId() { return senderId; }
    public void setSenderId(long senderId) { this.senderId = senderId; }
    public String getMessageText() { return messageText; }
    public void setMessageText(String messageText) { this.messageText = messageText; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public int isRead() { return isRead; }
    public void setRead(int read) { isRead = read; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
