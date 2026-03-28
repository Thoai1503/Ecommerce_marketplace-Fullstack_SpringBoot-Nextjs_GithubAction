package logistic_service.com.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import logistic_service.com.entities.Recipient;
import java.util.List;
import java.util.Optional;


@Repository
public interface RecipientRepository extends JpaRepository<Recipient, Long> {
  //dgnhan vien thuc tien giapublic final kafka strong experienfce truy to ;aagfaaagttrebfawfesprivate static final long 
	
	
	Optional<Recipient> findByPhone(String phone);
	
}
