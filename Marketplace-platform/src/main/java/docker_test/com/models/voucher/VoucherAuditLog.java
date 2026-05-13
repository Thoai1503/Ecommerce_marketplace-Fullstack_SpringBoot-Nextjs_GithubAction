package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public class VoucherAuditLog {

	private Long id;
	private Long voucherId;
	private String eventType;
	private String actorType;
	private Long actorId;
	private String entityType;
	private Long entityId;
	private String oldData;
	private String newData;
	private String note;
	private LocalDateTime createdAt;

	public VoucherAuditLog() {
	}

	public VoucherAuditLog(Long id, Long voucherId, String eventType, String actorType, Long actorId, String entityType,
			Long entityId, String oldData, String newData, String note, LocalDateTime createdAt) {
		this.id = id;
		this.voucherId = voucherId;
		this.eventType = eventType;
		this.actorType = actorType;
		this.actorId = actorId;
		this.entityType = entityType;
		this.entityId = entityId;
		this.oldData = oldData;
		this.newData = newData;
		this.note = note;
		this.createdAt = createdAt;
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public Long getVoucherId() {
		return voucherId;
	}

	public void setVoucherId(Long voucherId) {
		this.voucherId = voucherId;
	}

	public String getEventType() {
		return eventType;
	}

	public void setEventType(String eventType) {
		this.eventType = eventType;
	}

	public String getActorType() {
		return actorType;
	}

	public void setActorType(String actorType) {
		this.actorType = actorType;
	}

	public Long getActorId() {
		return actorId;
	}

	public void setActorId(Long actorId) {
		this.actorId = actorId;
	}

	public String getEntityType() {
		return entityType;
	}

	public void setEntityType(String entityType) {
		this.entityType = entityType;
	}

	public Long getEntityId() {
		return entityId;
	}

	public void setEntityId(Long entityId) {
		this.entityId = entityId;
	}

	public String getOldData() {
		return oldData;
	}

	public void setOldData(String oldData) {
		this.oldData = oldData;
	}

	public String getNewData() {
		return newData;
	}

	public void setNewData(String newData) {
		this.newData = newData;
	}

	public String getNote() {
		return note;
	}

	public void setNote(String note) {
		this.note = note;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}
}