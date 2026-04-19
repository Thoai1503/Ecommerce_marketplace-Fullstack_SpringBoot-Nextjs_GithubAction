package docker_test.com.controllers.seller;

import java.sql.SQLException;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import docker_test.com.dto.CreateVariantGroupRequest;
import docker_test.com.dto.CreateVariantOptionRequest;
import docker_test.com.models.product.VariantGroup;
import docker_test.com.models.product.VariantOption;
import docker_test.com.repository.VariantGroupRepository;
import docker_test.com.repository.VariantOptionRepository;

@RestController
@RequestMapping("/seller/product-variant-v2")
public class ProductVariantV2Controller {

    private final VariantGroupRepository variantGroupRepository;
    private final VariantOptionRepository variantOptionRepository;

    public ProductVariantV2Controller() {
        this.variantGroupRepository = VariantGroupRepository.Instance();
        this.variantOptionRepository = VariantOptionRepository.Instance();
    }

    @PostMapping("/product/{productId}/groups")
    public ResponseEntity<?> createGroup(
            @PathVariable long productId,
            @RequestBody CreateVariantGroupRequest req) {

        try {
            if (req.getGroup_name() == null || req.getGroup_name().isBlank()) {
                return ResponseEntity.badRequest().body("group_name is required");
            }

            VariantGroup group = new VariantGroup();
            group.setProduct_id(productId);
            group.setGroup_name(req.getGroup_name().trim());
            group.setSort_order(req.getSort_order() != null ? req.getSort_order() : 1);

            VariantGroup created = variantGroupRepository.Create(group);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Create group failed: " + e.getMessage());
        }
    }

    @GetMapping("/product/{productId}/groups")
    public ResponseEntity<?> getGroupsByProduct(@PathVariable long productId) {
        return ResponseEntity.ok(variantGroupRepository.GetByProductId(productId));
    }

    @PostMapping("/groups/{groupId}/options")
    public ResponseEntity<?> createOption(
            @PathVariable long groupId,
            @RequestBody CreateVariantOptionRequest req) {

        try {
            if (req.getOption_value() == null || req.getOption_value().isBlank()) {
                return ResponseEntity.badRequest().body("option_value is required");
            }

            VariantOption option = new VariantOption();
            option.setVariant_group_id(groupId);
            option.setOption_value(req.getOption_value().trim());
            option.setSort_order(req.getSort_order() != null ? req.getSort_order() : 1);
            option.setImage_url(req.getImage_url());

            VariantOption created = variantOptionRepository.Create(option);
            return ResponseEntity.status(HttpStatus.CREATED).body(created);
        } catch (SQLException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Create option failed: " + e.getMessage());
        }
    }

    @GetMapping("/groups/{groupId}/options")
    public ResponseEntity<?> getOptionsByGroup(@PathVariable long groupId) {
        return ResponseEntity.ok(variantOptionRepository.GetByGroupId(groupId));
    }
}
