package docker_test.com.configs;

import java.sql.Connection;

import com.mysql.cj.jdbc.MysqlDataSource;

import docker_test.com.utils.StringValue;


public final class DBConnection {
		private static DBConnection instance=null;
		private DBConnection() {}
		public static DBConnection GetInstance() {
			if (instance==null) {
				instance=new DBConnection();
			}
			return instance;
		}
		public Connection GetConn() {
			try {
				MysqlDataSource ds = new MysqlDataSource();
		        ds.setUser(StringValue.DATABASE_MySQL);
		        ds.setPassword(StringValue.PWD_MySQL);
		        ds.setServerName(StringValue.MySQL_Sever);
		        ds.setPortNumber(Integer.parseInt(StringValue.PORT_MySQL));
		        ds.setDatabaseName(StringValue.DATABASE_MySQL);
		        return ds.getConnection();
			} catch (Exception e) {
				// TODO: handle exception
				System.out.println(e.getMessage());
			}
			return null;	
		}
}
