import 'package:flutter/material.dart';
import 'package:protocol7/models/budget_models.dart';
import 'package:protocol7/widgets/dashboard_widgets.dart';

class DashboardPage extends StatelessWidget {
  const DashboardPage({super.key, required this.analytics});

  final BudgetAnalytics analytics;

  @override
  Widget build(BuildContext context) {
    final currency = analytics.currency;

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFE8F5EE), Color(0xFFF7FBF9)],
        ),
      ),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Wrap(
            spacing: 12,
            runSpacing: 12,
            children: [
              MetricCard(
                title: 'Total Allocation',
                value:
                    '$currency ${analytics.totalAllocation.toStringAsFixed(1)} Cr',
                subtitle: 'Across all districts and departments',
              ),
              MetricCard(
                title: 'Total Utilization',
                value:
                    '${(analytics.totalUtilization * 100).toStringAsFixed(1)}%',
                subtitle:
                    '$currency ${analytics.totalSpent.toStringAsFixed(1)} Cr spent',
              ),
              MetricCard(
                title: 'Lapse Risk Exposure',
                value:
                    '$currency ${analytics.totalProjectedLapse.toStringAsFixed(1)} Cr',
                subtitle: 'Predicted unutilized funds',
              ),
            ],
          ),
          const SizedBox(height: 16),
          ChartCard(
            title: 'Department-Wise Allocation vs Spending',
            child: SizedBox(
              height: 260,
              child: AllocationBarChart(data: analytics.departmentSummaries),
            ),
          ),
          const SizedBox(height: 16),
          ChartCard(
            title: 'Fund Share by Department',
            child: SizedBox(
              height: 250,
              child: AllocationPieChart(data: analytics.departmentSummaries),
            ),
          ),
          const SizedBox(height: 16),
          ChartCard(
            title: 'Monthly Utilization Trend',
            child: SizedBox(
              height: 240,
              child: UtilizationLineChart(points: analytics.monthlyUtilization),
            ),
          ),
          const SizedBox(height: 16),
          InsightListCard(
            title: 'Anomaly Detection Highlights',
            icon: Icons.warning_amber_rounded,
            items: analytics.anomalies,
          ),
          const SizedBox(height: 16),
          InsightListCard(
            title: 'Reallocation Recommendations',
            icon: Icons.swap_horiz,
            items: analytics.reallocationSuggestions,
          ),
        ],
      ),
    );
  }
}
