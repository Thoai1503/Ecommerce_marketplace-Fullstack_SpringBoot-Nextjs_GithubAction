package docker_test.com.models;

import java.util.List;

public class PageResult<T> {
    private List<T> data;
    private long total;
    private int page;
    private int pageSize;
    private int totalPages;

    public PageResult(List<T> data, long total, int page, int pageSize) {
        this.data = data;
        this.total = total;
        this.page = page;
        this.pageSize = pageSize;
        this.totalPages = (int) Math.ceil((double) total / pageSize);
    }

    // getters
    public List<T> getData() { return data; }
    public long getTotal() { return total; }
    public int getPage() { return page; }
    public int getPageSize() { return pageSize; }
    public int getTotalPages() { return totalPages; }
}
