package docker_test.com.models;

import java.time.LocalDateTime;

public final class Conversation {
	private long conversationId;
	private long buyerId;
	private long shopId;
	private String lastMessage;
	private LocalDateTime lastMessageAt;
	private LocalDateTime createdAt;

	public Conversation() {
		this.createdAt = LocalDateTime.now();
	}

	public Conversation(long conversationId, long buyerId, long shopId, String lastMessage, LocalDateTime lastMessageAt,
			LocalDateTime createdAt) {
		this.conversationId = conversationId;
		this.buyerId = buyerId;
		this.shopId = shopId;
		this.lastMessage = lastMessage;
		this.lastMessageAt = lastMessageAt;
		this.createdAt = createdAt;
	}

	public long getConversationId() {
		return conversationId;
	}

	public void setConversationId(long conversationId) {
		this.conversationId = conversationId;
	}

	public long getBuyerId() {
		return buyerId;
	}

	public void setBuyerId(long buyerId) {
		this.buyerId = buyerId;
	}

	public long getShopId() {
		return shopId;
	}

	public void setShopId(long shopId) {
		this.shopId = shopId;
	}

	public String getLastMessage() {
		return lastMessage;
	}

	public void setLastMessage(String lastMessage) {
		this.lastMessage = lastMessage;
	}

	public LocalDateTime getLastMessageAt() {
		return lastMessageAt;
	}

	public void setLastMessageAt(LocalDateTime lastMessageAt) {
		this.lastMessageAt = lastMessageAt;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
