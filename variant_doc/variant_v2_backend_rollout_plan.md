# Variant V2 Backend Rollout Plan

## Objective
Refactor backend product variant logic to support seller-defined classification groups (Shopee/Tiki style), while keeping current APIs working during migration.

## Current System Snapshot
- Product variants are stored flat in `product_variant` with `variant_name`, `sku`, `price`, `stock_quantity`.
- Product detail endpoint currently returns variants via JSON aggregation in [Marketplace-platform/src/main/java/docker_test/com/repository/ProductRepository.java](Marketplace-platform/src/main/java/docker_test/com/repository/ProductRepository.java).
- Seller APIs for variant are currently under [Marketplace-platform/src/main/java/docker_test/com/controllers/seller/ProductVariantController.java](Marketplace-platform/src/main/java/docker_test/com/controllers/seller/ProductVariantController.java).
- Repository pattern is custom JDBC singleton based (no migration framework).

## Target Domain Model
- `variant_group`: classification group per product (Color, Size, Capacity).
- `variant_option`: option value under a group (Black, XL, 256GB).
- `product_variant`: purchasable combination row with price/stock/sku/image.
- `product_variant_option`: join table mapping each variant to selected options.
- `product_variant.option_signature`: normalized combination key to prevent duplicates.

## Milestone Plan

### M1 - Schema Foundation (Day 1)
Deliverables:
- Create new tables and indexes (non-breaking)
- Add `option_signature` to `product_variant`
- Provide reversible SQL scripts

Done criteria:
- DDL applies cleanly in staging
- Existing APIs still run without code changes

### M2 - Seller Write APIs V2 (Day 2-3)
Deliverables:
- New endpoints:
  - `POST /seller/product/{productId}/variant-groups`
  - `POST /seller/product/{productId}/variant-groups/{groupId}/options`
  - `POST /seller/product/{productId}/variants/generate`
  - `PATCH /seller/product/{productId}/variants/bulk`
- Validation rules:
  - max 2 groups (configurable)
  - unique option in a group
  - unique signature in product

Done criteria:
- Seller can define groups/options and generate combinations
- Duplicate combination is blocked by validation + DB unique key

### M3 - Buyer Read APIs V2 (Day 4)
Deliverables:
- New endpoint:
  - `GET /product/{id}/variant-schema`
- Response includes:
  - `variantGroups`
  - `variants`
  - availability metadata

Done criteria:
- Frontend can render group-based selection (Color then Size)
- Buyer sees resolved combination and matching variant id

### M4 - Compatibility Layer (Day 5)
Deliverables:
- Keep old product detail API response shape
- Build old `variants` response from new schema data

Done criteria:
- Existing frontend flows do not break during rollout

### M5 - Data Migration (Day 6)
Deliverables:
- Backfill script from existing `variant_name` -> group/option model
- Fallback to 1 default group `Phan loai` if parsing fails

Done criteria:
- Variant counts before/after match
- No stock/price/sku loss

### M6 - Rollout + Cleanup (Day 7)
Deliverables:
- Feature flags:
  - `variant_v2_seller`
  - `variant_v2_buyer`
- Monitoring dashboard and error alerts

Done criteria:
- Gradual enablement by environment/shop
- Ability to rollback by flag (without schema rollback)

## Backend Tasks by Layer

### Database
- Add SQL files:
  - `variant_v2_phase1_schema.sql`
  - `variant_v2_phase2_data_backfill.sql`
  - `variant_v2_rollback.sql`

### Model
Create new model classes under [Marketplace-platform/src/main/java/docker_test/com/models/product](Marketplace-platform/src/main/java/docker_test/com/models/product):
- `VariantGroup`
- `VariantOption`
- `ProductVariantOption`

### Repository
Create repositories under [Marketplace-platform/src/main/java/docker_test/com/repository](Marketplace-platform/src/main/java/docker_test/com/repository):
- `VariantGroupRepository`
- `VariantOptionRepository`
- `ProductVariantOptionRepository`
- Extend `ProductVariantRepository` for signature based operations

### Service
Create service under [Marketplace-platform/src/main/java/docker_test/com/services](Marketplace-platform/src/main/java/docker_test/com/services):
- `VariantV2Service`
- Responsibilities:
  - create groups/options
  - generate cartesian combinations
  - build option signature
  - bulk update variant inventory/price/sku

### Controller
Create V2 controller under [Marketplace-platform/src/main/java/docker_test/com/controllers/seller](Marketplace-platform/src/main/java/docker_test/com/controllers/seller):
- `ProductVariantV2Controller`

Create buyer read controller under [Marketplace-platform/src/main/java/docker_test/com/controllers](Marketplace-platform/src/main/java/docker_test/com/controllers):
- `ProductVariantSchemaController`

### DTO
Add request/response DTOs under [Marketplace-platform/src/main/java/docker_test/com/dto](Marketplace-platform/src/main/java/docker_test/com/dto):
- `CreateVariantGroupRequest`
- `CreateVariantOptionRequest`
- `GenerateVariantsRequest`
- `BulkUpdateVariantRequest`
- `VariantSchemaResponse`

## Risk Register
- Legacy carts reference old variant ids
  - Mitigation: do not regenerate ids for existing variants in migration
- Inconsistent `variant_name` format
  - Mitigation: parser + fallback group
- Large combination count explosion
  - Mitigation: cap options per group and max combinations

## Testing Checklist
- Unit:
  - signature generation
  - duplicate prevention
  - combination generator
- Integration:
  - create groups/options -> generate -> query schema
- Regression:
  - existing `/product/{id}` still returns usable variant list

## Start-Now Execution (Today)
1. Apply `variant_v2_phase1_schema.sql` in staging.
2. Add model/repository skeletons and compile.
3. Implement `POST /seller/product/{id}/variant-groups`.
4. Implement `POST /seller/product/{id}/variant-groups/{groupId}/options`.
5. Smoke test with one product and two groups.
