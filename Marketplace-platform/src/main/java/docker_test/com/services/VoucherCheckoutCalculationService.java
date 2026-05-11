package docker_test.com.services;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import docker_test.com.dto.voucher.CheckoutVoucherCalculationRequest;
import docker_test.com.dto.voucher.CheckoutVoucherCalculationResponse;
import docker_test.com.models.voucher.UserVoucher;
import docker_test.com.models.voucher.Voucher;
import docker_test.com.models.voucher.VoucherScopeRule;
import docker_test.com.models.voucher.VoucherUserSegmentRule;
import docker_test.com.repository.UserVoucherRepository;
import docker_test.com.repository.VoucherRepository;
import docker_test.com.repository.VoucherScopeRuleRepository;
import docker_test.com.repository.VoucherUserSegmentRuleRepository;

@Service
public class VoucherCheckoutCalculationService {
    private static final double PLATFORM_COMMISSION_RATE = 0.10;

    private final VoucherRepository voucherRepository = VoucherRepository.Instance();
    private final VoucherScopeRuleRepository scopeRuleRepository = VoucherScopeRuleRepository.Instance();
    private final VoucherUserSegmentRuleRepository segmentRuleRepository = VoucherUserSegmentRuleRepository.Instance();
    private final UserVoucherRepository userVoucherRepository = UserVoucherRepository.Instance();

    public CheckoutVoucherCalculationResponse calculate(CheckoutVoucherCalculationRequest request) {
        List<CheckoutVoucherCalculationRequest.Item> items = request.getItems() == null
                ? List.of()
                : request.getItems();
        List<ItemAmount> originalAmounts = items.stream()
                .map(item -> new ItemAmount(item, subtotal(item)))
                .toList();
        List<ItemAmount> itemAmounts = copyAmounts(originalAmounts);
        List<ItemAmount> afterShopVoucherAmounts;
        List<CheckoutVoucherCalculationResponse.VoucherApplication> applications = new ArrayList<>();
        Set<Long> claimableVoucherIds = getClaimableVoucherIds(request.getUserId());

        Map<Long, Double> shopDiscountByShop = new LinkedHashMap<>();
        Map<String, List<Long>> selectedShopVoucherIds = request.getSelectedShopVoucherIdsByShop() == null
                ? Map.of()
                : request.getSelectedShopVoucherIdsByShop();

        for (Map.Entry<String, List<Long>> entry : selectedShopVoucherIds.entrySet()) {
            Long shopId = parseLong(entry.getKey());
            for (Long voucherId : safeIds(entry.getValue())) {
                Voucher voucher = loadUsableVoucher(voucherId, claimableVoucherIds);
                if (voucher == null || !"SHOP".equals(normalize(voucher.getIssuerType()))) {
                    continue;
                }

                ApplyResult result = applyVoucher(voucher, itemAmounts, request);
                itemAmounts = result.itemAmounts();

                if (result.discount() > 0) {
                    applications.add(toApplication(voucher.getId(), result));
                    Long targetShopId = shopId != null && shopId > 0
                            ? shopId
                            : firstShopId(result.discountByShop());
                    if (targetShopId != null) {
                        shopDiscountByShop.merge(targetShopId, result.discount(), Double::sum);
                    }
                }
            }
        }

        afterShopVoucherAmounts = copyAmounts(itemAmounts);

        double platformDiscount = 0.0;
        for (Long voucherId : safeIds(request.getSelectedPlatformVoucherIds())) {
            Voucher voucher = loadUsableVoucher(voucherId, claimableVoucherIds);
            if (voucher == null || !"PLATFORM".equals(normalize(voucher.getIssuerType()))) {
                continue;
            }

            ApplyResult result = applyVoucher(voucher, itemAmounts, request);
            itemAmounts = result.itemAmounts();

            if (result.discount() > 0) {
                platformDiscount += result.discount();
                applications.add(toApplication(voucher.getId(), result));
            }
        }

        return buildResponse(
                originalAmounts,
                afterShopVoucherAmounts,
                itemAmounts,
                shopDiscountByShop,
                platformDiscount,
                applications);
    }

    private Set<Long> getClaimableVoucherIds(Long userId) {
        if (userId == null || userId <= 0) {
            return Set.of();
        }

        return userVoucherRepository.getByUserId(userId).stream()
                .filter(userVoucher -> "CLAIMED".equals(normalize(userVoucher.getStatus())))
                .map(UserVoucher::getVoucherId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private Voucher loadUsableVoucher(Long voucherId, Set<Long> claimableVoucherIds) {
        if (voucherId == null || voucherId <= 0 || !claimableVoucherIds.contains(voucherId)) {
            return null;
        }

        Voucher voucher = voucherRepository.GetById(voucherId.intValue());
        if (voucher == null) {
            return null;
        }

        String status = normalize(voucher.getStatus());
        if (!"ACTIVE".equals(status)) {
            return null;
        }

        LocalDateTime now = LocalDateTime.now();
        if (voucher.getValidFrom() != null && voucher.getValidFrom().isAfter(now)) {
            return null;
        }
        if (voucher.getValidTo() != null && voucher.getValidTo().isBefore(now)) {
            return null;
        }

        return voucher;
    }

    private ApplyResult applyVoucher(
            Voucher voucher,
            List<ItemAmount> currentAmounts,
            CheckoutVoucherCalculationRequest request) {
        if (!isSegmentEligible(voucher, Boolean.TRUE.equals(request.getHasPreviousOrder()))) {
            return new ApplyResult(0.0, currentAmounts, List.of(), Map.of());
        }

        List<ItemAmount> applicableItems = getApplicableItems(voucher, currentAmounts);
        double applicableAmount = applicableItems.stream()
                .mapToDouble(ItemAmount::amount)
                .sum();
        double discount = getDiscountAmount(voucher, applicableAmount);

        if (discount <= 0 || applicableAmount <= 0) {
            return new ApplyResult(0.0, currentAmounts, List.of(), Map.of());
        }

        Set<String> applicableKeys = applicableItems.stream()
                .map(itemAmount -> itemAmount.item().getItemKey())
                .collect(Collectors.toCollection(HashSet::new));
        List<ItemAmount> nextAmounts = new ArrayList<>();
        List<CheckoutVoucherCalculationResponse.ItemDiscount> itemDiscounts = new ArrayList<>();
        Map<Long, Double> discountByShop = new LinkedHashMap<>();
        double remainingDiscount = discount;
        double remainingApplicableAmount = applicableAmount;

        for (ItemAmount entry : currentAmounts) {
            if (!applicableKeys.contains(entry.item().getItemKey()) || entry.amount() <= 0) {
                nextAmounts.add(entry);
                continue;
            }

            double reduction = remainingApplicableAmount <= entry.amount()
                    ? remainingDiscount
                    : discount * entry.amount() / applicableAmount;
            double safeReduction = money(Math.min(entry.amount(), reduction));
            double nextAmount = money(Math.max(0.0, entry.amount() - safeReduction));
            remainingDiscount = money(remainingDiscount - safeReduction);
            remainingApplicableAmount = money(remainingApplicableAmount - entry.amount());
            nextAmounts.add(new ItemAmount(entry.item(), nextAmount));

            if (safeReduction > 0) {
                CheckoutVoucherCalculationResponse.ItemDiscount itemDiscount =
                        new CheckoutVoucherCalculationResponse.ItemDiscount();
                itemDiscount.setItemKey(entry.item().getItemKey());
                itemDiscount.setDiscountAmount(safeReduction);
                itemDiscounts.add(itemDiscount);

                Long shopId = entry.item().getShopId();
                if (shopId != null && shopId > 0) {
                    discountByShop.merge(shopId, safeReduction, Double::sum);
                }
            }
        }

        double appliedDiscount = itemDiscounts.stream()
                .mapToDouble(CheckoutVoucherCalculationResponse.ItemDiscount::getDiscountAmount)
                .sum();

        return new ApplyResult(money(appliedDiscount), nextAmounts, itemDiscounts, discountByShop);
    }

    private boolean isSegmentEligible(Voucher voucher, boolean hasPreviousOrder) {
        List<VoucherUserSegmentRule> rules = segmentRuleRepository.getByVoucherId(voucher.getId());

        for (VoucherUserSegmentRule rule : rules) {
            String segmentType = normalize(rule.getSegmentType());
            if ("NEW_USER".equals(segmentType) || "FIRST_ORDER".equals(segmentType)) {
                if (hasPreviousOrder) {
                    return false;
                }
            } else {
                return false;
            }
        }

        return true;
    }

    private List<ItemAmount> getApplicableItems(Voucher voucher, List<ItemAmount> itemAmounts) {
        List<VoucherScopeRule> rules = scopeRuleRepository.getByVoucherId(voucher.getId());
        List<VoucherScopeRule> includedRules = rules.stream()
                .filter(rule -> "INCLUDE".equals(normalize(rule.getIncludeExclude())))
                .toList();
        List<VoucherScopeRule> excludedRules = rules.stream()
                .filter(rule -> "EXCLUDE".equals(normalize(rule.getIncludeExclude())))
                .toList();
        String issuerType = normalize(voucher.getIssuerType());
        List<ItemAmount> applicableItems = new ArrayList<>(itemAmounts);

        if ("SHOP".equals(issuerType)) {
            Set<Long> shopIds = new HashSet<>();
            if (voucher.getIssuerId() != null && voucher.getIssuerId() > 0) {
                shopIds.add(voucher.getIssuerId());
            }
            includedRules.stream()
                    .filter(rule -> "SHOP".equals(normalize(rule.getScopeType())))
                    .map(VoucherScopeRule::getScopeId)
                    .filter(Objects::nonNull)
                    .forEach(shopIds::add);

            if (shopIds.isEmpty()) {
                return List.of();
            }

            applicableItems = applicableItems.stream()
                    .filter(itemAmount -> shopIds.contains(itemAmount.item().getShopId()))
                    .toList();
        }

        if (!excludedRules.isEmpty()) {
            applicableItems = applicableItems.stream()
                    .filter(itemAmount -> excludedRules.stream()
                            .noneMatch(rule -> matchesScope(itemAmount.item(), rule)))
                    .toList();
        }

        List<VoucherScopeRule> productRules = "SHOP".equals(issuerType)
                ? includedRules.stream()
                        .filter(rule -> !"SHOP".equals(normalize(rule.getScopeType())))
                        .toList()
                : includedRules;

        if (!productRules.isEmpty()) {
            applicableItems = applicableItems.stream()
                    .filter(itemAmount -> productRules.stream()
                            .anyMatch(rule -> matchesScope(itemAmount.item(), rule)))
                    .toList();
        }

        return applicableItems;
    }

    private boolean matchesScope(CheckoutVoucherCalculationRequest.Item item, VoucherScopeRule rule) {
        Long scopeId = rule.getScopeId();
        if (scopeId == null) {
            return false;
        }

        return switch (normalize(rule.getScopeType())) {
            case "SHOP" -> Objects.equals(item.getShopId(), scopeId);
            case "PRODUCT" -> Objects.equals(item.getProductId(), scopeId);
            case "CATEGORY" -> Objects.equals(item.getCategoryId(), scopeId);
            case "BRAND" -> Objects.equals(item.getBrandId(), scopeId);
            default -> false;
        };
    }

    private double getDiscountAmount(Voucher voucher, double applicableAmount) {
        if (applicableAmount <= 0) {
            return 0.0;
        }

        double minOrderValue = decimal(voucher.getMinOrderValue());
        if (minOrderValue > 0 && applicableAmount < minOrderValue) {
            return 0.0;
        }

        return switch (normalize(voucher.getDiscountType())) {
            case "FIXED" -> money(Math.min(applicableAmount, decimal(voucher.getDiscountAmount())));
            case "PERCENT" -> {
                double rawDiscount = applicableAmount * decimal(voucher.getDiscountPercent()) / 100.0;
                double maxDiscount = decimal(voucher.getMaxDiscountAmount());
                yield money(Math.min(applicableAmount, maxDiscount > 0 ? Math.min(rawDiscount, maxDiscount) : rawDiscount));
            }
            default -> 0.0;
        };
    }

    private CheckoutVoucherCalculationResponse buildResponse(
            List<ItemAmount> originalAmounts,
            List<ItemAmount> afterShopAmounts,
            List<ItemAmount> afterAllAmounts,
            Map<Long, Double> shopDiscountByShop,
            double platformDiscount,
            List<CheckoutVoucherCalculationResponse.VoucherApplication> applications) {
        CheckoutVoucherCalculationResponse response = new CheckoutVoucherCalculationResponse();
        Map<String, Double> afterShopByKey = toAmountMap(afterShopAmounts);
        Map<String, Double> afterAllByKey = toAmountMap(afterAllAmounts);
        Map<Long, Double> platformCommissionByShop = new LinkedHashMap<>();
        Map<Long, Double> sellerReceivableByShop = new LinkedHashMap<>();

        for (ItemAmount original : originalAmounts) {
            CheckoutVoucherCalculationRequest.Item item = original.item();
            double afterShop = afterShopByKey.getOrDefault(item.getItemKey(), original.amount());
            double afterAll = afterAllByKey.getOrDefault(item.getItemKey(), afterShop);
            double shopDiscount = money(original.amount() - afterShop);
            double totalDiscount = money(original.amount() - afterAll);
            double commissionBase = getCommissionBase(original.amount(), afterShop, shopDiscount);
            double platformCommission = money(commissionBase * PLATFORM_COMMISSION_RATE);
            double sellerReceivable = money(Math.max(0.0, commissionBase - platformCommission));

            CheckoutVoucherCalculationResponse.ItemBreakdown breakdown =
                    new CheckoutVoucherCalculationResponse.ItemBreakdown();
            breakdown.setItemKey(item.getItemKey());
            breakdown.setShopId(item.getShopId());
            breakdown.setProductId(item.getProductId());
            breakdown.setVariantId(item.getVariantId());
            breakdown.setSubtotal(money(original.amount()));
            breakdown.setShopVoucherDiscountAmount(shopDiscount);
            breakdown.setPlatformVoucherDiscountAmount(money(totalDiscount - shopDiscount));
            breakdown.setTotalVoucherDiscountAmount(totalDiscount);
            breakdown.setTotalAfterShopVoucher(money(afterShop));
            breakdown.setTotalAfterAllVouchers(money(afterAll));
            breakdown.setPlatformCommissionRate(PLATFORM_COMMISSION_RATE);
            breakdown.setPlatformCommissionAmount(platformCommission);
            breakdown.setSellerReceivableAmount(sellerReceivable);
            response.getItems().add(breakdown);

            Long shopId = item.getShopId();
            if (shopId != null && shopId > 0) {
                platformCommissionByShop.merge(shopId, platformCommission, Double::sum);
                sellerReceivableByShop.merge(shopId, sellerReceivable, Double::sum);
            }
        }

        response.setShopVoucherDiscountByShop(shopDiscountByShop.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> money(entry.getValue()),
                        Double::sum,
                        LinkedHashMap::new)));
        response.setPlatformCommissionByShop(platformCommissionByShop.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> money(entry.getValue()),
                        Double::sum,
                        LinkedHashMap::new)));
        response.setSellerReceivableByShop(sellerReceivableByShop.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        entry -> money(entry.getValue()),
                        Double::sum,
                        LinkedHashMap::new)));
        response.setShopVoucherDiscount(money(response.getShopVoucherDiscountByShop().values().stream()
                .mapToDouble(Double::doubleValue)
                .sum()));
        response.setPlatformVoucherDiscount(money(platformDiscount));
        response.setTotalVoucherDiscount(money(response.getShopVoucherDiscount() + response.getPlatformVoucherDiscount()));
        response.setPlatformCommissionAmount(money(response.getPlatformCommissionByShop().values().stream()
                .mapToDouble(Double::doubleValue)
                .sum()));
        response.setSellerReceivableAmount(money(response.getSellerReceivableByShop().values().stream()
                .mapToDouble(Double::doubleValue)
                .sum()));
        response.setVoucherApplications(applications);

        return response;
    }

    private CheckoutVoucherCalculationResponse.VoucherApplication toApplication(Long voucherId, ApplyResult result) {
        CheckoutVoucherCalculationResponse.VoucherApplication application =
                new CheckoutVoucherCalculationResponse.VoucherApplication();
        application.setVoucherId(voucherId);
        application.setDiscountAmount(result.discount());
        application.setItemDiscounts(result.itemDiscounts());
        application.setDiscountByShop(result.discountByShop());
        return application;
    }

    private List<Long> safeIds(List<Long> ids) {
        return ids == null ? List.of() : ids.stream().filter(Objects::nonNull).toList();
    }

    private List<ItemAmount> copyAmounts(List<ItemAmount> itemAmounts) {
        return itemAmounts.stream()
                .map(itemAmount -> new ItemAmount(itemAmount.item(), itemAmount.amount()))
                .toList();
    }

    private Map<String, Double> toAmountMap(List<ItemAmount> amounts) {
        Map<String, Double> map = new HashMap<>();
        amounts.forEach(itemAmount -> map.put(itemAmount.item().getItemKey(), itemAmount.amount()));
        return map;
    }

    private Long firstShopId(Map<Long, Double> discountByShop) {
        return discountByShop.keySet().stream().findFirst().orElse(null);
    }

    private Long parseLong(String value) {
        try {
            return Long.parseLong(value);
        } catch (Exception ignored) {
            return null;
        }
    }

    private double subtotal(CheckoutVoucherCalculationRequest.Item item) {
        return money(safe(item.getPrice()) * Math.max(0, item.getQuantity() == null ? 0 : item.getQuantity()));
    }

    private double getCommissionBase(double subtotal, double totalAfterShopVoucher, double shopVoucherDiscount) {
        if (totalAfterShopVoucher > 0) {
            return money(totalAfterShopVoucher);
        }
        return money(Math.max(0.0, subtotal - shopVoucherDiscount));
    }

    private double decimal(BigDecimal value) {
        return value == null ? 0.0 : Math.max(0.0, value.doubleValue());
    }

    private double safe(Double value) {
        return value == null || value.isNaN() || value.isInfinite() ? 0.0 : value;
    }

    private double money(double value) {
        return Math.round(Math.max(0.0, value) * 100.0) / 100.0;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }

    private record ItemAmount(CheckoutVoucherCalculationRequest.Item item, double amount) {
    }

    private record ApplyResult(
            double discount,
            List<ItemAmount> itemAmounts,
            List<CheckoutVoucherCalculationResponse.ItemDiscount> itemDiscounts,
            Map<Long, Double> discountByShop) {
    }
}
