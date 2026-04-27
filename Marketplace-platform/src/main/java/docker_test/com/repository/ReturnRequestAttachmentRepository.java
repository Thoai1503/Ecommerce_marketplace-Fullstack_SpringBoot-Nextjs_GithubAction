package docker_test.com.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import docker_test.com.models.refunds.ReturnRequestAttachment;

@Repository
public interface ReturnRequestAttachmentRepository extends JpaRepository<ReturnRequestAttachment, Long> {

    List<ReturnRequestAttachment> findByReturnRequestIdOrderByCreatedAtDesc(Long returnRequestId);

    void deleteByReturnRequestId(Long returnRequestId);
}
