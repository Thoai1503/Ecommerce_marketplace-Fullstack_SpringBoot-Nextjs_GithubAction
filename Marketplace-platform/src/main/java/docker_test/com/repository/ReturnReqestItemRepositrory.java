package docker_test.com.repository;

import org.springframework.stereotype.Repository;

@Repository
public interface ReturnReqestItemRepositrory extends org.springframework.data.jpa.repository.JpaRepository<docker_test.com.models.refunds.ReturnRequestItem, Long> {

}
