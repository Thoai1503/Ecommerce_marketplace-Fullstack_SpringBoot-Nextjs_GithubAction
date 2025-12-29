package docker_test.com.models;

import java.time.LocalDateTime;

public final class SearchHistory {
    private long searchId;
    private Long userId;
    private String searchQuery;
    private int resultCount;
    private LocalDateTime searchedAt;

    public SearchHistory() {
        this.resultCount = 0;
        this.searchedAt = LocalDateTime.now();
    }

    public SearchHistory(long searchId, Long userId, String searchQuery, int resultCount,
                         LocalDateTime searchedAt) {
        this.searchId = searchId;
        this.userId = userId;
        this.searchQuery = searchQuery;
        this.resultCount = resultCount;
        this.searchedAt = searchedAt;
    }

    public long getSearchId() { return searchId; }
    public void setSearchId(long searchId) { this.searchId = searchId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getSearchQuery() { return searchQuery; }
    public void setSearchQuery(String searchQuery) { this.searchQuery = searchQuery; }
    public int getResultCount() { return resultCount; }
    public void setResultCount(int resultCount) { this.resultCount = resultCount; }
    public LocalDateTime getSearchedAt() { return searchedAt; }
    public void setSearchedAt(LocalDateTime searchedAt) { this.searchedAt = searchedAt; }
}
