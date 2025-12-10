package com.example.mecha.dashboard;

import com.example.mecha.order.Order;
import com.example.mecha.order.OrderRepository;
import com.example.mecha.order.PaymentStatus;
import com.example.mecha.product.ProductRepository;
import com.example.mecha.user.UserRepository;
import com.example.mecha.user.UserRole;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        List<Order> allOrders = orderRepository.findAll();
        
        // Basic counts
        long totalOrders = allOrders.size();
        long totalCustomers = userRepository.countByRole(UserRole.USER);
        long totalProducts = productRepository.count();
        
        // Calculate total revenue (only PAID orders)
        BigDecimal totalRevenue = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calculate monthly revenue (current month, PAID orders)
        YearMonth currentMonth = YearMonth.now();
        Instant startOfMonth = currentMonth.atDay(1).atStartOfDay(ZoneId.systemDefault()).toInstant();
        Instant endOfMonth = currentMonth.atEndOfMonth().atTime(LocalTime.MAX).atZone(ZoneId.systemDefault()).toInstant();
        
        BigDecimal monthlyRevenue = allOrders.stream()
                .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                .filter(o -> o.getCreatedAt().isAfter(startOfMonth) && o.getCreatedAt().isBefore(endOfMonth))
                .map(Order::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Monthly sales data (last 12 months)
        List<DashboardStatsDto.MonthlySalesData> monthlySales = calculateMonthlySales(allOrders);
        
        // Monthly stats (sales count + revenue)
        List<DashboardStatsDto.MonthlyStatsData> monthlyStats = calculateMonthlyStats(allOrders);
        
        return DashboardStatsDto.builder()
                .totalOrders(totalOrders)
                .totalCustomers(totalCustomers)
                .totalProducts(totalProducts)
                .totalRevenue(totalRevenue)
                .monthlyRevenue(monthlyRevenue)
                .monthlySales(monthlySales)
                .monthlyStats(monthlyStats)
                .build();
    }
    
    private List<DashboardStatsDto.MonthlySalesData> calculateMonthlySales(List<Order> orders) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        int currentYear = Year.now().getValue();
        
        // Group orders by month
        Map<Integer, Long> ordersByMonth = orders.stream()
                .filter(o -> {
                    LocalDateTime ldt = LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.systemDefault());
                    return ldt.getYear() == currentYear;
                })
                .collect(Collectors.groupingBy(
                        o -> LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.systemDefault()).getMonthValue(),
                        Collectors.counting()
                ));
        
        List<DashboardStatsDto.MonthlySalesData> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            result.add(DashboardStatsDto.MonthlySalesData.builder()
                    .month(months[i - 1])
                    .orderCount(ordersByMonth.getOrDefault(i, 0L))
                    .build());
        }
        
        return result;
    }
    
    private List<DashboardStatsDto.MonthlyStatsData> calculateMonthlyStats(List<Order> orders) {
        String[] months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
        int currentYear = Year.now().getValue();
        
        // Group orders by month - only PAID orders for revenue
        Map<Integer, List<Order>> ordersByMonth = orders.stream()
                .filter(o -> {
                    LocalDateTime ldt = LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.systemDefault());
                    return ldt.getYear() == currentYear;
                })
                .collect(Collectors.groupingBy(
                        o -> LocalDateTime.ofInstant(o.getCreatedAt(), ZoneId.systemDefault()).getMonthValue()
                ));
        
        List<DashboardStatsDto.MonthlyStatsData> result = new ArrayList<>();
        for (int i = 1; i <= 12; i++) {
            List<Order> monthOrders = ordersByMonth.getOrDefault(i, Collections.emptyList());
            
            long sales = monthOrders.size();
            BigDecimal revenue = monthOrders.stream()
                    .filter(o -> o.getPaymentStatus() == PaymentStatus.PAID)
                    .map(Order::getTotalAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Convert to millions for chart display
            BigDecimal revenueInMillions = revenue.divide(BigDecimal.valueOf(1_000_000), 2, RoundingMode.HALF_UP);
            
            result.add(DashboardStatsDto.MonthlyStatsData.builder()
                    .month(months[i - 1])
                    .sales(sales)
                    .revenue(revenueInMillions)
                    .build());
        }
        
        return result;
    }
}
