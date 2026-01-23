package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.models.Unit;
import docker_test.com.utils.StringValue;

public final class UnitMapper implements IMapper<Unit> {
	@Override
	public Unit RowMap(ResultSet rs) {
        Unit unit = new Unit();
        try {
            unit.setId(rs.getInt(StringValue.UNIT_ID_COL));
            unit.setLabel(rs.getString(StringValue.UNIT_LABEL_COL));
            unit.setSymbol(rs.getString(StringValue.UNIT_SYMBOL_COL));
            unit.setStatus(rs.getInt(StringValue.UNIT_STATUS_COL));
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return unit;
    }

	@Override
	public List<Unit> RowsMap(ResultSet rs) {
		List<Unit> units = new ArrayList<>();
		try {
			while (rs.next()) {
				Unit unit = RowMap(rs);
				units.add(unit);
			}
		} catch (SQLException e) {
			e.printStackTrace();
		}
		return units;
	}

	@Override
	public Unit mapRow(ResultSet rs, int rowNum) throws SQLException {
		// TODO Auto-generated method stub
		return null;
	}
}
