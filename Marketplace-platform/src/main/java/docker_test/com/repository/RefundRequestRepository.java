package docker_test.com.repository;

import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequest;

@Repository
public interface RefundRequestRepository extends org.springframework.data.jpa.repository.JpaRepository<ReturnRequest, Long> {
    
}
