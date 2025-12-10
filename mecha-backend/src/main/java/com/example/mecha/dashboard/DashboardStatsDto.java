package com.example.mecha.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDto {
    private long totalOrders;
    private long totalCustomers;
    private long totalProducts;
    private BigDecimal totalRevenue;
    private BigDecimal monthlyRevenue;
    private List<MonthlySalesData> monthlySales;
    private List<MonthlyStatsData> monthlyStats;
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlySalesData {
        private String month;
        private long orderCount;
    }
    
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyStatsData {
        private String month;
        private long sales;       // Number of orders
        private BigDecimal revenue; // Revenue amount in millions VND
    }
}
