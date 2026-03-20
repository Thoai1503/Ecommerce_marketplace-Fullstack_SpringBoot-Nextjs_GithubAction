package docker_test.com.models;

import java.util.List;
import java.util.Map;

public class OrderPageResponse {

    private List<Order> orders;
    private int totalRecords;
    private int totalPages;
    private int currentPage;
    private Map<String, Integer> statusStats;
    private Double pendingAmount;

    public OrderPageResponse() {}

    public OrderPageResponse(List<Order> orders,
                             int totalRecords,
                             int totalPages,
                             int currentPage,
                             Map<String, Integer> statusStats,
                             Double pendingAmount) {
        this.orders = orders;
        this.totalRecords = totalRecords;
        this.totalPages = totalPages;
        this.currentPage = currentPage;
        this.statusStats = statusStats;
        this.pendingAmount = pendingAmount;
    }

	public List<Order> getOrders() {
		return orders;
	}

	public void setOrders(List<Order> orders) {
		this.orders = orders;
	}

	public int getTotalRecords() {
		return totalRecords;
	}

	public void setTotalRecords(int totalRecords) {
		this.totalRecords = totalRecords;
	}

	public int getTotalPages() {
		return totalPages;
	}

	public void setTotalPages(int totalPages) {
		this.totalPages = totalPages;
	}

	public int getCurrentPage() {
		return currentPage;
	}

	public void setCurrentPage(int currentPage) {
		this.currentPage = currentPage;
	}

	public Map<String, Integer> getStatusStats() {
		return statusStats;
	}

	public void setStatusStats(Map<String, Integer> statusStats) {
		this.statusStats = statusStats;
	}

	public Double getPendingAmount() {
		return pendingAmount;
	}

	public void setPendingAmount(Double pendingAmount) {
		this.pendingAmount = pendingAmount;
	}

    
}
