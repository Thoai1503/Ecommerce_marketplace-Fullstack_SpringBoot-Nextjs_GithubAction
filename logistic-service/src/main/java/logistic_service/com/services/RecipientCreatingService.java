package logistic_service.com.services;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import logistic_service.com.dto.RecipientDTO;
import logistic_service.com.entities.Recipient;
import logistic_service.com.repositories.RecipientRepository;


@Service
public class RecipientCreatingService {
    public RecipientCreatingService(RecipientRepository recipientRepository) {
		super();
		this.recipientRepository = recipientRepository;
	}

	private final RecipientRepository recipientRepository;
    
    private static final Logger log = LoggerFactory.getLogger(RecipientCreatingService.class);
	public Recipient createRecipient(RecipientDTO recipient) {
	   var en = map(recipient);
	   var recipientByPhone = recipientRepository.findByPhone(map(recipient).getPhone());
	   if (recipientByPhone==null) {
		   en = recipientRepository.save(map(recipient));
		   log.info("Recipient saved => {}", en.getId());
		   return en;
	   }
	   log.info("Recipient saved => {}", recipientByPhone.getId());
		return recipientByPhone;
	}
	
	private Recipient map(RecipientDTO dto) {
		return Recipient.builder().name(dto.getName())
				.address(dto.getAddress())
				.email(dto.getEmail())
				.phone(dto.getPhone())
				.province(dto.getProvince())
				.ward(dto.getWard())
				.district(dto.getDistrict())
				.build();
	}
}
