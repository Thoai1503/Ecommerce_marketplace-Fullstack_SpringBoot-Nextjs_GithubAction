package docker_test.com.configs.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
public class ReturnRequestToLogistic {
      private static final String TOPIC_NAME = "return_request_to_logistic";
      private static final Logger LOG = LoggerFactory.getLogger(ReturnRequestToLogistic.class);
      private final KafkaTemplate<Object, Object> kafkaTemplate;
      private final ObjectMapper objectMapper;
      
      
		public ReturnRequestToLogistic(
				KafkaTemplate<Object, Object> kafkaTemplate,
				ObjectProvider<ObjectMapper> objectMapperProvider
				) {
	 		this.kafkaTemplate = kafkaTemplate;
		 		this.objectMapper = objectMapperProvider.getIfAvailable(ObjectMapper::new);
    }
    
    public void publish(Object object) {
		try {
	    		String json = objectMapper.writeValueAsString(object);
	    		LOG.info("Publishing return request to topic {}: data={}", TOPIC_NAME, json);
			kafkaTemplate.send(TOPIC_NAME, json).whenComplete(
					(result, ex) -> {
						if (ex != null) {
							LOG.error("Failed to publish message to topic {}: {}", TOPIC_NAME, ex.getMessage(), ex);
						} else {
							LOG.info("Message published to topic {}: partition={}, offset={}", TOPIC_NAME,
									result.getRecordMetadata().partition(), result.getRecordMetadata().offset());
						}
					}
			);
		} catch (Exception e) {
			LOG.error("Failed to serialize return request payload: {}", e.getMessage(), e);
			throw new IllegalStateException("Cannot serialize return request payload", e);
		}
	}
      	
      						
 

}
