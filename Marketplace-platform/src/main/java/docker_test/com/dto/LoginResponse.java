package docker_test.com.dto;

public class LoginResponse {
	private Long id;
	private String email;
	private String fullName;
	private String userType;
	private String accessToken;
	private String refreshToken;
	private String tokenType;
	private long expiresIn;
	private long refreshExpiresIn;
	private long idleTimeoutSeconds;
	private UserSummary user;

	public LoginResponse(Long id, String email, String fullName, String userType) {
		this(id, email, fullName, userType, null, null, 0);
	}

	public LoginResponse(Long id, String email, String fullName, String userType,
			String accessToken, String refreshToken, long expiresIn) {
		this(id, email, fullName, userType, accessToken, refreshToken, expiresIn, 0, 0);
	}

	public LoginResponse(Long id, String email, String fullName, String userType,
			String accessToken, String refreshToken, long expiresIn,
			long refreshExpiresIn, long idleTimeoutSeconds) {
		this.id = id;
		this.email = email;
		this.fullName = fullName;
		this.userType = userType;
		this.accessToken = accessToken;
		this.refreshToken = refreshToken;
		this.tokenType = "Bearer";
		this.expiresIn = expiresIn;
		this.refreshExpiresIn = refreshExpiresIn;
		this.idleTimeoutSeconds = idleTimeoutSeconds;
		this.user = new UserSummary(id, email, fullName, userType);
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

	public String getAccessToken() {
		return accessToken;
	}

	public String getRefreshToken() {
		return refreshToken;
	}

	public String getToken() {
		return accessToken;
	}

	public String getTokenType() {
		return tokenType;
	}

	public long getExpiresIn() {
		return expiresIn;
	}

	public long getRefreshExpiresIn() {
		return refreshExpiresIn;
	}

	public long getIdleTimeoutSeconds() {
		return idleTimeoutSeconds;
	}

	public UserSummary getUser() {
		return user;
	}

	public static String normalizeRole(String userType) {
		String role = userType == null ? "" : userType.trim().toLowerCase();

		if ("admin".equals(role)) {
			return "admin";
		}

		if ("seller".equals(role) || "both".equals(role)) {
			return "seller";
		}

		return "user";
	}

	public static class UserSummary {
		private Long id;
		private String email;
		private String name;
		private String fullName;
		private String role;
		private String userType;

		public UserSummary(Long id, String email, String fullName, String userType) {
			this.id = id;
			this.email = email;
			this.name = fullName;
			this.fullName = fullName;
			this.role = normalizeRole(userType);
			this.userType = userType;
		}

		public Long getId() {
			return id;
		}

		public String getEmail() {
			return email;
		}

		public String getName() {
			return name;
		}

		public String getFullName() {
			return fullName;
		}

		public String getRole() {
			return role;
		}

		public String getUserType() {
			return userType;
		}
	}
}
