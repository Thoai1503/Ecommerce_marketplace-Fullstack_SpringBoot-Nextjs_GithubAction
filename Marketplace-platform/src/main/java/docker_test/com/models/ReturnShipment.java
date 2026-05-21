package docker_test.com.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import jakarta.persistence.*;
import lombok.*;


@Entity
@Table(name = "return_shipment")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class ReturnShipment {
     
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;
	
	@Column(name = "return_request_id", nullable = false, length = 100)
	private String returnRequestId;
	
	@Column(name= "tracking_code", length = 100)
	private String trackingCode;
	
	 @Enumerated(EnumType.STRING)
	@Column(name ="status", nullable = false, length = 50)
	private ReturnShipmentStatus status;
	
}
