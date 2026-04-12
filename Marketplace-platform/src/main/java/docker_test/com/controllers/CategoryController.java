package docker_test.com.controllers;

import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import docker_test.com.factory.RepoFactoryImpl;
import docker_test.com.models.Category;
import docker_test.com.repository.BrandRepository;
import docker_test.com.repository.CategoryBrandRepository;
import docker_test.com.repository.CategoryRepository;
import docker_test.com.repository.IRepositories;
import docker_test.com.repository.ProductRepository;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

	private final IRepositories<Category> repositories;

	public CategoryController() {
		repositories = RepoFactoryImpl.Instance().createRepo("category");
	}

	/* ================= GET ALL ================= */
	// GET http://localhost:8000/api/categories
	@GetMapping("")
	public ResponseEntity<List<Category>> getAll() {

		List<Category> list = repositories.GetAll();

		return ResponseEntity.ok(list);
	}

	/* ================= GET BY ID ================= */
	// GET http://localhost:8000/api/categories/{id}
	@GetMapping("/{id}")
	public ResponseEntity<?> getById(@PathVariable int id) {

		Category item = repositories.GetById(id);

		if (item == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
		}

		return ResponseEntity.ok(item);
	}

	/* ================= CREATE ================= */
	// POST http://localhost:8000/api/categories
	@PostMapping("")
	public ResponseEntity<?> create(@RequestBody Category item) {

		try {

			if (item.getCategory_name() == null || item.getCategory_name().isBlank()) {
				return ResponseEntity.badRequest().body("Category name cannot be empty");
			}

			// default values
			if (item.getParent_id() == null) {
				item.setParent_id(0);
			}

			if (item.getLevel() == null) {
				item.setLevel(0);
			}

			if (item.getIs_active() == null) {
				item.setIs_active(1);
			}

			Category created = repositories.Create(item);

			return ResponseEntity.status(HttpStatus.CREATED).body(created);

		} catch (SQLException e) {

			e.printStackTrace();

			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Create category failed");
		}
	}

	@PutMapping("/{id}")
	public ResponseEntity<?> update(@PathVariable int id, @RequestBody Category req) {

		Category existing = repositories.GetById(id);

		if (existing == null) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
		}

		// đảm bảo id đúng
		existing.setId(id);

		if (req.getCategory_name() != null) {
			existing.setCategory_name(req.getCategory_name());
		}

		if (req.getCategory_slug() != null) {
			existing.setCategory_slug(req.getCategory_slug());
		}

		if (req.getCategory_icon() != null) {
			existing.setCategory_icon(req.getCategory_icon());
		}

		if (req.getLevel() != null) {
			existing.setLevel(req.getLevel());
		}

		if (req.getIs_active() != null) {
			existing.setIs_active(req.getIs_active());
		}

		if (req.getParent_id() != null) {
			existing.setParent_id(req.getParent_id());
		}

		Category updated = repositories.Update(existing);

		if (updated == null) {
			return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Update failed");
		}

		return ResponseEntity.ok(updated);
	}

	/* ================= DELETE ================= */
	// DELETE http://localhost:8000/api/categories/{id}
	@DeleteMapping("/{id}")
	public ResponseEntity<?> delete(@PathVariable int id) {

		boolean deleted = repositories.Delete(id);

		if (!deleted) {
			return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Category not found");
		}

		return ResponseEntity.ok("Deleted successfully");
	}

	/* ================= GET BY PARENT ================= */
	// GET http://localhost:8000/api/categories/children/{parentId}

	@GetMapping("/children/{parentId}")
	public ResponseEntity<List<Category>> getByParent(@PathVariable int parentId) {

		List<Category> list = repositories.GetAll().stream()
				.filter(c -> c.getParent_id() != null && c.getParent_id() == parentId).toList();

		return ResponseEntity.ok(list);
	}

	/* ================= CATEGORY PRODUCTS ================= */
	// GET /api/categories/{id}/products

	@GetMapping("/{id}/products")
	public ResponseEntity<?> getProducts(@PathVariable int id, @RequestParam(required = false) Integer child,
			@RequestParam(required = false) List<Integer> brand, @RequestParam(required = false) String sort,
			@RequestParam(required = false) String order) {
		try {

			StringBuilder sql = new StringBuilder("""
					    SELECT
					        p.id,
					        p.product_name,
					        p.product_slug,
					        p.price,
					        p.original_price,
					        (
					            SELECT pi.image_url
					            FROM product_image pi
					            WHERE pi.product_id = p.id
					            ORDER BY pi.is_thumbnail DESC, pi.display_order ASC
					            LIMIT 1
					        ) AS image
					    FROM product p
					    WHERE 1=1
					""");

			List<Object> params = new ArrayList<>();

			// ===== CATEGORY =====
			if (child != null && child > 0) {
				sql.append(" AND p.category_id = ?");
				params.add(child);
			} else {
				sql.append("""
						    AND p.category_id IN (
						        SELECT id FROM category WHERE parent_id = ?
						    )
						""");
				params.add(id);
			}

			// ===== BRAND =====
			if (brand != null && !brand.isEmpty()) {
				String inSql = String.join(",", brand.stream().map(b -> "?").toList());
				sql.append(" AND p.brand_id IN (" + inSql + ")");
				params.addAll(brand);
			}

			// 🔥 ===== FIX CHUẨN SORT =====
			List<String> orderBy = new ArrayList<>();

			// 👉 1. ƯU TIÊN GIÁ TRƯỚC
			if (order != null) {
				if ("asc".equals(order)) {
					orderBy.add("p.price ASC");
				} else if ("desc".equals(order)) {
					orderBy.add("p.price DESC");
				}
			}

			// 👉 2. SORT CHÍNH
			if (sort != null) {
				switch (sort) {
				case "new":
					orderBy.add("p.created_at DESC");
					break;

				case "best":
					orderBy.add("p.sold DESC");
					break;

				default:
					orderBy.add("p.id DESC"); // popular
				}
			} else {
				orderBy.add("p.id DESC");
			}

			// 👉 APPLY ORDER BY
			if (!orderBy.isEmpty()) {
				sql.append(" ORDER BY " + String.join(", ", orderBy));
			}

			// ===== EXECUTE =====
			List<Map<String, Object>> products = ProductRepository.Instance().query(sql.toString(), params.toArray());

			return ResponseEntity.ok(products);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Load product failed");
		}
	}

	@GetMapping("/{id}/brands")
	public ResponseEntity<?> getBrandsByCategory(@PathVariable int id, @RequestParam(required = false) Integer child) {
		try {

			CategoryRepository categoryRepo = CategoryRepository.Instance();
			CategoryBrandRepository categoryBrandRepo = CategoryBrandRepository.Instance();
			BrandRepository brandRepo = BrandRepository.Instance();

			List<Integer> categoryIds = new ArrayList<>();

			if (child != null && child > 0) {
				categoryIds.add(child);
			} else {
				List<Category> children = categoryRepo.GetByParent(id);
				categoryIds.addAll(children.stream().map(Category::getId).toList());

				if (categoryIds.isEmpty()) {
					categoryIds.add(id); // fallback
				}
			}

			// ===== QUERY =====
			String inSql = String.join(",", categoryIds.stream().map(i -> "?").toList());

			String sql = "SELECT DISTINCT brand_id FROM category_brand WHERE category_id IN (" + inSql + ")";

			List<Map<String, Object>> rows = categoryBrandRepo.query(sql, categoryIds.toArray());

			List<Integer> brandIds = rows.stream().map(r -> (Integer) r.get("brand_id")).toList();

			if (brandIds.isEmpty()) {
				return ResponseEntity.ok(List.of());
			}

			String brandIn = String.join(",", brandIds.stream().map(i -> "?").toList());

			String sqlBrand = "SELECT * FROM brand WHERE id IN (" + brandIn + ")";

			List<Map<String, Object>> brands = brandRepo.query(sqlBrand, brandIds.toArray());

			return ResponseEntity.ok(brands);

		} catch (Exception e) {
			e.printStackTrace();
			return ResponseEntity.status(500).body("Load brand failed");
		}
	}

}
