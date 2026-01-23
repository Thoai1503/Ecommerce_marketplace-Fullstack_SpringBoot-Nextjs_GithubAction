package docker_test.com.dto;

public class LoginResponse {
	private Long id;
	private String email;
	private String fullName;
	private String userType;

	public LoginResponse(Long id, String email, String fullName, String userType) {
		this.id = id;
		this.email = email;
		this.fullName = fullName;
		this.userType = userType;
	}

	public Long getId() {
		return id;
	}

	public String getEmail() {
		return email;
	}

	public String getFullName() {
		return fullName;
	}

	public String getUserType() {
		return userType;
	}
}
