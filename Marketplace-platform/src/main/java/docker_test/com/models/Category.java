package docker_test.com.models;

public class Category {
    public Category(Integer id, int parent_id, String category_name, String category_slug, int level, int is_active) {
		super();
		this.id = id;
		this.parent_id = parent_id;
		this.category_name = category_name;
		this.category_slug = category_slug;
		this.level = level;
		this.is_active = is_active;
	}
    public Category() {
    	
    }
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getParent_id() {
		return parent_id;
	}
	public void setParent_id(int parent_id) {
		this.parent_id = parent_id;
	}
	public String getCategory_name() {
		return category_name;
	}
	public void setCategory_name(String category_name) {
		this.category_name = category_name;
	}
	public String getCategory_slug() {
		return category_slug;
	}
	public void setCategory_slug(String category_slug) {
		this.category_slug = category_slug;
	}
	public int getLevel() {
		return level;
	}
	public void setLevel(int level) {
		this.level = level;
	}
	public int getIs_active() {
		return is_active;
	}
	public void setIs_active(int is_active) {
		this.is_active = is_active;
	}
	private Integer id ;
    private int parent_id ;
    private String category_name;
    private String category_slug;
    private int level;
    private int is_active;
}
