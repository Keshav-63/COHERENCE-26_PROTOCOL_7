import 'dart:math';

class BudgetAnalytics {
  BudgetAnalytics({
    required this.records,
    required this.departmentSummaries,
    required this.anomalies,
    required this.reallocationSuggestions,
    required this.monthlyUtilization,
    required this.totalAllocation,
    required this.totalSpent,
    required this.totalProjectedLapse,
    this.currency = 'INR',
  });

  final List<BudgetRecord> records;
  final List<DepartmentSummary> departmentSummaries;
  final List<String> anomalies;
  final List<String> reallocationSuggestions;
  final List<double> monthlyUtilization;
  final double totalAllocation;
  final double totalSpent;
  final double totalProjectedLapse;
  final String currency;

  double get totalUtilization =>
      totalAllocation == 0 ? 0 : totalSpent / totalAllocation;

  factory BudgetAnalytics.fromSeedData() {
    final records = BudgetSeedData.generateRecords();

    final depMap = <String, DepartmentSummary>{};
    for (final row in records) {
      depMap.update(
        row.department,
        (existing) => existing.copyWith(
          allocated: existing.allocated + row.allocated,
          spent: existing.spent + row.spent,
        ),
        ifAbsent: () => DepartmentSummary(
          department: row.department,
          allocated: row.allocated,
          spent: row.spent,
        ),
      );
    }

    final departmentSummaries = depMap.values.toList()
      ..sort((a, b) => b.allocated.compareTo(a.allocated));

    final monthlyAllocation = List<double>.filled(12, 0);
    final monthlySpent = List<double>.filled(12, 0);

    for (final row in records) {
      final index = row.month - 1;
      monthlyAllocation[index] += row.allocated;
      monthlySpent[index] += row.spent;
    }

    final monthlyUtilization = List<double>.generate(12, (i) {
      if (monthlyAllocation[i] == 0) {
        return 0;
      }
      return monthlySpent[i] / monthlyAllocation[i];
    });

    final totalAllocation = records.fold<double>(
      0,
      (sum, e) => sum + e.allocated,
    );
    final totalSpent = records.fold<double>(0, (sum, e) => sum + e.spent);

    return BudgetAnalytics(
      records: records,
      departmentSummaries: departmentSummaries,
      anomalies: _detectAnomalies(records),
      reallocationSuggestions: _simulateReallocation(records),
      monthlyUtilization: monthlyUtilization,
      totalAllocation: totalAllocation,
      totalSpent: totalSpent,
      totalProjectedLapse: _forecastLapse(records),
    );
  }

  static List<String> _detectAnomalies(List<BudgetRecord> records) {
    final byKey = <String, List<BudgetRecord>>{};
    for (final row in records) {
      byKey
          .putIfAbsent(
            '${row.department}-${row.district}',
            () => <BudgetRecord>[],
          )
          .add(row);
    }

    final findings = <String>[];

    byKey.forEach((_, rows) {
      final spends = rows.map((e) => e.spent).toList();
      final avg = spends.fold<double>(0, (sum, e) => sum + e) / spends.length;
      final variance =
          spends.fold<double>(0, (sum, e) => sum + pow(e - avg, 2)) /
          spends.length;
      final stdDev = sqrt(variance);

      for (final row in rows) {
        final z = stdDev == 0 ? 0 : (row.spent - avg) / stdDev;
        if (z.abs() > 2.0) {
          findings.add(
            '${row.department} in ${row.district}: month ${row.month} spend spike (z=${z.toStringAsFixed(1)}).',
          );
        }
        if (row.spent > row.allocated * 1.15) {
          findings.add(
            '${row.department} in ${row.district}: month ${row.month} spent ${(row.spent / row.allocated * 100).toStringAsFixed(0)}% of allocation.',
          );
        }
      }
    });

    return findings.take(8).toList();
  }

  static double _forecastLapse(List<BudgetRecord> records) {
    final byKey = <String, List<BudgetRecord>>{};
    for (final row in records) {
      byKey
          .putIfAbsent(
            '${row.department}-${row.district}',
            () => <BudgetRecord>[],
          )
          .add(row);
    }

    var projectedLapse = 0.0;
    byKey.forEach((_, rows) {
      final yearlyAllocation = rows.fold<double>(
        0,
        (sum, e) => sum + e.allocated,
      );
      final spentToDate = rows.fold<double>(0, (sum, e) => sum + e.spent);
      final averageMonthlySpend = spentToDate / 12;
      final projectedYearSpend = averageMonthlySpend * 12;
      projectedLapse += max(0.0, yearlyAllocation - projectedYearSpend);
    });

    return projectedLapse;
  }

  static List<String> _simulateReallocation(List<BudgetRecord> records) {
    final byKey = <String, List<BudgetRecord>>{};
    for (final row in records) {
      byKey
          .putIfAbsent(
            '${row.department}|${row.district}',
            () => <BudgetRecord>[],
          )
          .add(row);
    }

    final underUtilized = <_Node>[];
    final overPressured = <_Node>[];

    byKey.forEach((key, rows) {
      final parts = key.split('|');
      final department = parts[0];
      final district = parts[1];
      final allocated = rows.fold<double>(0, (sum, e) => sum + e.allocated);
      final spent = rows.fold<double>(0, (sum, e) => sum + e.spent);
      final utilization = allocated == 0 ? 0 : spent / allocated;
      final remaining = max(0.0, allocated - spent);

      if (utilization < 0.58 && remaining > 0) {
        underUtilized.add(_Node(department, district, remaining));
      }
      if (utilization > 0.9) {
        overPressured.add(
          _Node(department, district, max(0.0, spent - allocated * 0.9)),
        );
      }
    });

    underUtilized.sort((a, b) => b.value.compareTo(a.value));
    overPressured.sort((a, b) => b.value.compareTo(a.value));

    final recommendations = <String>[];
    for (
      var i = 0;
      i < min(3, min(underUtilized.length, overPressured.length));
      i++
    ) {
      final source = underUtilized[i];
      final target = overPressured[i];
      final shift = min(source.value * 0.2, target.value).clamp(4.0, 30.0);
      recommendations.add(
        'Shift INR ${shift.toStringAsFixed(1)} Cr from ${source.department} (${source.district}) to ${target.department} (${target.district}).',
      );
    }

    if (recommendations.isEmpty) {
      recommendations.add(
        'No critical reallocation needed based on current simulated cycle.',
      );
    }

    return recommendations;
  }
}

class BudgetRecord {
  BudgetRecord({
    required this.department,
    required this.district,
    required this.month,
    required this.allocated,
    required this.spent,
  });

  final String department;
  final String district;
  final int month;
  final double allocated;
  final double spent;
}

class DepartmentSummary {
  DepartmentSummary({
    required this.department,
    required this.allocated,
    required this.spent,
  });

  final String department;
  final double allocated;
  final double spent;

  DepartmentSummary copyWith({double? allocated, double? spent}) {
    return DepartmentSummary(
      department: department,
      allocated: allocated ?? this.allocated,
      spent: spent ?? this.spent,
    );
  }
}

class BudgetSeedData {
  static const departments = <String>[
    'Rural Development',
    'Water & Sanitation',
    'Health Services',
    'Roads & Infrastructure',
    'Education',
  ];

  static const districts = <String>['Indore', 'Bhopal', 'Jabalpur', 'Gwalior'];

  static List<BudgetRecord> generateRecords() {
    final random = Random(7);
    final rows = <BudgetRecord>[];

    for (final department in departments) {
      for (final district in districts) {
        for (var month = 1; month <= 12; month++) {
          final baseline = 8 + random.nextDouble() * 10;
          final seasonality = 0.85 + (sin(month / 12 * pi * 2) + 1) * 0.15;
          final allocated = baseline * seasonality;
          final spendSkew = 0.55 + random.nextDouble() * 0.65;
          final spent = allocated * spendSkew;

          rows.add(
            BudgetRecord(
              department: department,
              district: district,
              month: month,
              allocated: double.parse(allocated.toStringAsFixed(2)),
              spent: double.parse(spent.toStringAsFixed(2)),
            ),
          );
        }
      }
    }

    rows.add(
      BudgetRecord(
        department: 'Water & Sanitation',
        district: 'Gwalior',
        month: 10,
        allocated: 9.0,
        spent: 15.4,
      ),
    );

    return rows;
  }
}

class _Node {
  _Node(this.department, this.district, this.value);

  final String department;
  final String district;
  final double value;
}
