package docker_test.com.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OrderItem extends OrderItemDTO {

    public OrderItem() {
        super();
    }
}
