package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.models.Brand;

public class BrandMapper implements IMapper<Brand> {

    private Brand map(ResultSet rs) throws SQLException {
        Brand b = new Brand();

        b.setId(rs.getInt("id"));
        b.setName(rs.getString("name"));
        b.setSlug(rs.getString("slug"));
        b.setLogo(rs.getString("logo"));
        b.setStatus(rs.getInt("status"));

        return b;
    }

    @Override
    public Brand RowMap(ResultSet rs) {
        try {
            return map(rs);
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public List<Brand> RowsMap(ResultSet rs) {
        List<Brand> list = new ArrayList<>();
        try {
            while (rs.next()) {
                list.add(map(rs));
            }
        } catch (Exception e) {}
        return list;
    }

    @Override
    public Brand mapRow(ResultSet rs, int rowNum) throws SQLException {
        return map(rs);
    }
}