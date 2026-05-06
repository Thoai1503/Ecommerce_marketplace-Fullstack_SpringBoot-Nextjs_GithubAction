package docker_test.com.dto;

public class AuthenticatedUser {
    private final Long id;
    private final String email;
    private final String fullName;
    private final String userType;

    public AuthenticatedUser(Long id, String email, String fullName, String userType) {
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

    public String getName() {
        return fullName;
    }

    public String getUserType() {
        return userType;
    }

    public String getRole() {
        return LoginResponse.normalizeRole(userType);
    }
}
