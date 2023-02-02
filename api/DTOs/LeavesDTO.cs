namespace api.DTOs
{
    public class LeavesDTO
    {
        public LeaveHeatMapDTO Heatmap { get; set; }
        public List<LeavesTableDTO> Table { get; set; }
        public LeaveBreakdownDTO Breakdown { get; set; }

        public LeavesDTO(LeaveHeatMapDTO heatmapLeaves, List<LeavesTableDTO> table)
        {
            Heatmap = heatmapLeaves;
            Table = table;
            Breakdown = new LeaveBreakdownDTO(table);
        }
    }
}
