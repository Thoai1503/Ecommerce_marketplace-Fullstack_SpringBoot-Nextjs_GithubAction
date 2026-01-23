package docker_test.com.services;

import java.sql.SQLException;

import org.mindrot.jbcrypt.BCrypt;

import docker_test.com.dto.RegisterRequest;
import docker_test.com.models.User;
import docker_test.com.repository.UserRepository;

public class UserService {

    private final UserRepository repo = UserRepository.Instance();

    public User register(RegisterRequest req) throws SQLException {

        if (repo.existsByEmail(req.getEmail())) {
            throw new RuntimeException("Email đã tồn tại");
        }

        User user = new User();
        user.setFullName(req.getFullName());
        user.setEmail(req.getEmail());

        // ✅ HASH PASSWORD (BCrypt thuần)
        String hashed = BCrypt.hashpw(req.getPassword(), BCrypt.gensalt(10));
        user.setPasswordHash(hashed);

        return repo.Create(user);
    }
}
