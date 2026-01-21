package docker_test.com.models;

import java.time.LocalDateTime;

public final class Notification {
	private long notificationId;
	private long userId;
	private String type;
	private String title;
	private String message;
	private Long referenceId;
	private int isRead;
	private LocalDateTime createdAt;

	public Notification() {
		this.isRead = 0;
		this.createdAt = LocalDateTime.now();
	}

	public Notification(long notificationId, long userId, String type, String title, String message, Long referenceId,
			int isRead, LocalDateTime createdAt) {
		this.notificationId = notificationId;
		this.userId = userId;
		this.type = type;
		this.title = title;
		this.message = message;
		this.referenceId = referenceId;
		this.isRead = isRead;
		this.createdAt = createdAt;
	}

	public long getNotificationId() {
		return notificationId;
	}

	public void setNotificationId(long notificationId) {
		this.notificationId = notificationId;
	}

	public long getUserId() {
		return userId;
	}

	public void setUserId(long userId) {
		this.userId = userId;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public Long getReferenceId() {
		return referenceId;
	}

	public void setReferenceId(Long referenceId) {
		this.referenceId = referenceId;
	}

	public int isRead() {
		return isRead;
	}

	public void setRead(int read) {
		isRead = read;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}
	