import 'package:flutter_test/flutter_test.dart';
import 'package:protocol7/models/budget_models.dart';

void main() {
  test('Seed analytics produces usable outputs', () {
    final analytics = BudgetAnalytics.fromSeedData();

    expect(analytics.departmentSummaries, isNotEmpty);
    expect(analytics.monthlyUtilization.length, 12);
    expect(analytics.totalAllocation, greaterThan(analytics.totalSpent));
    expect(analytics.reallocationSuggestions, isNotEmpty);
  });
}
