package docker_test.com.dto;

import java.util.List;

public class CategoryAttributeBulkRequest {
    private long categoryId;
    private List<Long> attributeIds;
	public long getCategoryId() {
		return categoryId;
	}
	public void setCategoryId(long categoryId) {
		this.categoryId = categoryId;
	}
	public List<Long> getAttributeIds() {
		return attributeIds;
	}
	public void setAttributeIds(List<Long> attributeIds) {
		this.attributeIds = attributeIds;
	}
    
}
