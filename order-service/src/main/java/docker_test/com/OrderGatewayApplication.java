package docker_test.com;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.data.redis.core.RedisTemplate;
//import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.web.reactive.function.client.WebClient;

import docker_test.com.OrderGatewayApplication.LeftJoinSimulation.Department;
import docker_test.com.OrderGatewayApplication.LeftJoinSimulation.Employee;
import docker_test.com.OrderGatewayApplication.LeftJoinSimulation.JoinResult;

//import docker_test.com.models.Cart;

@SpringBootApplication
//@EnableDiscoveryClient
public class OrderGatewayApplication {
    @Autowired
    private RedisTemplate template;

    @Bean
    public WebClient webClient() {
        return WebClient.builder().build();
    }

    public static void main(String[] args) {
    	
    	List<Employee> employees = Arrays.asList(
                new Employee(1, "Alice", 101),
                new Employee(2, "Bob", 102),
                new Employee(3, "Charlie", null),   // không có department
                new Employee(4, "David", 103),
                new Employee(5, "Emma", 104)        // department không tồn tại
            );

            // Bảng phải - Departments
            List<Department> departments = Arrays.asList(
                new Department(101, "HR"),
                new Department(102, "IT"),
                new Department(103, "Finance")
                // 104 không tồn tại
            );
            
            List<LeftJoinSimulation.JoinResult> joinResults = LeftJoinSimulation.leftJoin(employees, departments);
            System.out.println("LEFT JOIN Result:");
            System.out.println("--------------------------------------------------");
            for (JoinResult row : joinResults) {
                System.out.println(row);
            }
            
        SpringApplication.run(OrderGatewayApplication.class, args);
    }

    public static class LeftJoinSimulation {

        // Class đại diện cho dòng dữ liệu
      public  static class Employee {
            int id;
            String name;
            Integer deptId;   // có thể null

            Employee(int id, String name, Integer deptId) {
                this.id = id;
                this.name = name;
                this.deptId = deptId;
            }
        }

        static class Department {
            int id;
            String deptName;

            Department(int id, String deptName) {
                this.id = id;
                this.deptName = deptName;
            }
        }
        
        //CLass đại diện cho kết quả sau  khi join	
        static class JoinResult {
            int empId;
            String empName;
            String deptName;   // có thể null

            JoinResult(int empId, String empName, String deptName) {
                this.empId = empId;
                this.empName = empName;
                this.deptName = deptName;
            }

            @Override
            public String toString() {
                return String.format("(%d, %s, %s)", empId, empName, deptName == null ? "NULL" : deptName);
            }
        }

        public static List<JoinResult> leftJoin(List<Employee> left, List<Department> right) {
            List<JoinResult> result = new ArrayList<>();
            

            // Tạo Map để tìm nhanh department theo id (tăng tốc độ)
            Map<Integer, String> deptMap = new HashMap<>();
            for (Department d : right) {
                deptMap.put(d.id, d.deptName);
            }

            // Duyệt từng record trong bảng trái
            for (Employee emp : left) {
                String deptName = null;

                if (emp.deptId != null) {
                    deptName = deptMap.get(emp.deptId);
                }

                result.add(new JoinResult(emp.id, emp.name, deptName));
            }

            return result;
        }
    }
}
