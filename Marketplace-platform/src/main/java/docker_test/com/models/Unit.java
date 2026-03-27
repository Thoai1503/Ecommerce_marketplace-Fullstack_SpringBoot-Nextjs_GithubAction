package docker_test.com.models;

public final class Unit {

    private Integer id; // ✅ FIX ở đây
    private String label;
    private String symbol;
    private int status;

    public Unit() {
        this.status = 1;
    }

    public Unit(Integer id, String label, String symbol, int status) {
        this.id = id;
        this.label = label;
        this.symbol = symbol;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public int getStatus() {
        return status;
    }

    public void setStatus(int status) {
        this.status = status;
    }
}