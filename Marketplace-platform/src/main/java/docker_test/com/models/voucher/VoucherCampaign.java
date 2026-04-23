package docker_test.com.models.voucher;

import java.time.LocalDateTime;

public class VoucherCampaign {
	private Integer id;
	private String code;
	private String name;
	private String description;
	private LocalDateTime start_at;
	private LocalDateTime end_at;
	private String status;
	private Integer created_by;
	private LocalDateTime created_at;
	private LocalDateTime updated_at;

	public Integer getId() {
		return id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public LocalDateTime getStart_at() {
		return start_at;
	}

	public void setStart_at(LocalDateTime start_at) {
		this.start_at = start_at;
	}

	public LocalDateTime getEnd_at() {
		return end_at;
	}

	public void setEnd_at(LocalDateTime end_at) {
		this.end_at = end_at;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getCreated_by() {
		return created_by;
	}

	public void setCreated_by(Integer created_by) {
		this.created_by = created_by;
	}

	public LocalDateTime getCreated_at() {
		return created_at;
	}

	public void setCreated_at(LocalDateTime created_at) {
		this.created_at = created_at;
	}

	public LocalDateTime getUpdated_at() {
		return updated_at;
	}

	public void setUpdated_at(LocalDateTime updated_at) {
		this.updated_at = updated_at;
	}

	public VoucherCampaign() {
	}

	public VoucherCampaign(Integer id, String code, String name, String description, LocalDateTime start_at,
			LocalDateTime end_at, String status, Integer created_by, LocalDateTime created_at, LocalDateTime updated_at) {
		this.id = id;
		this.code = code;
		this.name = name;
		this.description = description;
		this.start_at = start_at;
		this.end_at = end_at;
		this.status = status;
		this.created_by = created_by;
		this.created_at = created_at;
		this.updated_at = updated_at;
	}

}
