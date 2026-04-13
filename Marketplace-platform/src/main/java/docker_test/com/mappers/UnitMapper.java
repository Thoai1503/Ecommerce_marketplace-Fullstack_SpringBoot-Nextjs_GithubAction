package docker_test.com.mappers;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

import docker_test.com.models.Unit;
import docker_test.com.utils.StringValue;

public final class UnitMapper implements IMapper<Unit> {

    // ================= SINGLE ROW =================
    @Override
    public Unit RowMap(ResultSet rs) {
        try {
            Unit unit = new Unit();
            unit.setId(rs.getInt(StringValue.UNIT_ID_COL));
            unit.setLabel(rs.getString(StringValue.UNIT_LABEL_COL));
            unit.setSymbol(rs.getString(StringValue.UNIT_SYMBOL_COL));
            unit.setStatus(rs.getInt(StringValue.UNIT_STATUS_COL));
            return unit;
        } catch (SQLException e) {
            throw new RuntimeException("Error mapping Unit", e);
        }
    }

    // ================= MULTIPLE ROWS =================
    @Override
    public List<Unit> RowsMap(ResultSet rs) {
        List<Unit> units = new ArrayList<>();
        try {
            while (rs.next()) {
                units.add(RowMap(rs));
            }
        } catch (SQLException e) {
            throw new RuntimeException("Error mapping Unit list", e);
        }
        return units;
    }

    // ================= JDBC TEMPLATE =================
    @Override
    public Unit mapRow(ResultSet rs, int rowNum) throws SQLException {
        Unit unit = new Unit();
        unit.setId(rs.getInt(StringValue.UNIT_ID_COL));
        unit.setLabel(rs.getString(StringValue.UNIT_LABEL_COL));
        unit.setSymbol(rs.getString(StringValue.UNIT_SYMBOL_COL));
        unit.setStatus(rs.getInt(StringValue.UNIT_STATUS_COL));
        return unit;
    }
}
