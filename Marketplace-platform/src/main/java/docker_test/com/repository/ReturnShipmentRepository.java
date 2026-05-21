package docker_test.com.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import docker_test.com.models.ReturnShipment;


@Repository
public interface ReturnShipmentRepository extends JpaRepository<ReturnShipment, Long> {
     Optional<ReturnShipment> findById(Long id);
}
