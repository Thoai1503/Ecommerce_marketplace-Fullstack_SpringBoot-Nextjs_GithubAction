package docker_test.com.models;

public class Attribute {
      private Integer id;
      public Attribute(Integer id, String name, String slug, Integer data_type) {
		super();
		this.id = id;
		this.name = name;
		this.slug = slug;
		this.data_type = data_type;
	}
      public Attribute() {}
	  public Integer getId() {
		return id;
	}
	  public void setId(Integer id) {
		  this.id = id;
	  }
	  public String getName() {
		  return name;
	  }
	  public void setName(String name) {
		  this.name = name;
	  }
	  public String getSlug() {
		  return slug;
	  }
	  public void setSlug(String slug) {
		  this.slug = slug;
	  }
	  public Integer getData_type() {
		  return data_type;
	  }
	  public void setData_type(Integer data_type) {
		  this.data_type = data_type;
	  }
	  private String name;
      private String slug;
      private Integer data_type;
}
