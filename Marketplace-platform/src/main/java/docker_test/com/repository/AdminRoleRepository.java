package docker_test.com.repository;

import docker_test.com.models.AdminRole;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AdminRoleRepository extends JpaRepository<AdminRole, Long> {
    AdminRole findByUserId(Long userId);

    List<AdminRole> findByRoleName(String roleName);

    List<AdminRole> findByIsActiveTrue();

    boolean existsByUserIdAndRoleName(Long userId, String roleName);

    Optional<AdminRole> findByUserIdAndIsActiveTrue(Long userId);

    @Modifying
    @Transactional
    @Query("update AdminRole ar set ar.isActive = :isActive where ar.userId = :userId")
    void updateIsActiveByUserId(@Param("userId") Long userId, @Param("isActive") boolean isActive);
}
