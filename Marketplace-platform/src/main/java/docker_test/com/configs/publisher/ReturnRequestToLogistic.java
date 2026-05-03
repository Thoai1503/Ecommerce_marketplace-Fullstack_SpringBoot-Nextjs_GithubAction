package docker_test.com.configs.publisher;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.kafka.core.KafkaTemplate;

import com.fasterxml.jackson.databind.ObjectMapper;

@Component
public class ReturnRequestToLogistic {
      private static final String TOPIC_NAME = "return_request_to_logistic";
      private static final Logger LOG = LoggerFactory.getLogger(ReturnRequestToLogistic.class);
      private final KafkaTemplate<String, String> kafkaTemplate;
			private final ObjectMapper objectMapper;
      
      
		public ReturnRequestToLogistic(
				ObjectProvider<KafkaTemplate<String, String>> kafkaTemplateProvider,
				ObjectProvider<ObjectMapper> objectMapperProvider) {
	 		this.kafkaTemplate = kafkaTemplateProvider.getIfAvailable();
		 		this.objectMapper = objectMapperProvider.getIfAvailable(ObjectMapper::new);
    }
    
    public void publish(Object payload) {
		try {
			if (kafkaTemplate == null) {
				LOG.warn("KafkaTemplate is not configured. Skip publishing return request message.");
				return;
			}
			String json = objectMapper.writeValueAsString(payload);
			LOG.info("Publishing return request to topic={}: {}", TOPIC_NAME, json);
			kafkaTemplate.send(TOPIC_NAME, json);
		} catch (Exception e) {
			LOG.error("Failed to serialize return request payload: {}", e.getMessage(), e);
			throw new IllegalStateException("Cannot serialize return request payload", e);
		}
	}
      	
      						
 

}
