package docker_test.com.models;

public class Units {
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
	public Integer getStatus() {
		return status;
	}
	public void setStatus(Integer status) {
		this.status = status;
	}
  public Units(Integer id, String label, String symbol, Integer status) {
		super();
		this.id = id;
		this.label = label;
		this.symbol = symbol;
		this.status = status;
	}
  public Units() {
	  
  }
  private Integer id;
  private String label;
  private String symbol;
  private Integer status;
}
