package docker_test.com.models;

import java.time.LocalDateTime;

public final class Conversation {
    private long conversation_id;
    private long buyer_id;
    private long shop_id;
    private String last_message;
    private LocalDateTime last_message_at;
    private LocalDateTime created_at;

    public Conversation() {
        this.created_at = LocalDateTime.now();
    }

    public Conversation(long conversation_id, long buyer_id, long shop_id, 
                       String last_message, LocalDateTime last_message_at,
                       LocalDateTime created_at) {
        this.conversation_id = conversation_id;
        this.buyer_id = buyer_id;
        this.shop_id = shop_id;
        this.last_message = last_message;
        this.last_message_at = last_message_at;
        this.created_at = created_at;
    }

    public long getConversationId() {
        return conversation_id;
    }

    public void setConversationId(long conversation_id) {
        this.conversation_id = conversation_id;
    }

    public long getBuyerId() {
        return buyer_id;
    }

    public void setBuyerId(long buyer_id) {
        this.buyer_id = buyer_id;
    }

    public long getShopId() {
        return shop_id;
    }

    public void setShopId(long shop_id) {
        this.shop_id = shop_id;
    }

    public String getLastMessage() {
        return last_message;
    }

    public void setLastMessage(String last_message) {
        this.last_message = last_message;
    }

    public LocalDateTime getLastMessageAt() {
        return last_message_at;
    }

    public void setLastMessageAt(LocalDateTime last_message_at) {
        this.last_message_at = last_message_at;
    }

    public LocalDateTime getCreatedAt() {
        return created_at;
    }

    public void setCreatedAt(LocalDateTime created_at) {
        this.created_at = created_at;
    }
}