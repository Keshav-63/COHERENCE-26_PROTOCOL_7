import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:protocol7/data/feedback_database.dart';
import 'package:protocol7/models/budget_models.dart';
import 'package:protocol7/pages/dashboard_page.dart';
import 'package:protocol7/pages/feedback_page.dart';

class BudgetIntelligenceApp extends StatelessWidget {
  const BudgetIntelligenceApp({super.key, required this.database});

  final FeedbackDatabase database;

  @override
  Widget build(BuildContext context) {
    final scheme = ColorScheme.fromSeed(
      seedColor: const Color(0xFF0E6B57),
      brightness: Brightness.light,
    );

    return MaterialApp(
      title: 'Budget Flow Intelligence',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: scheme,
        textTheme: GoogleFonts.spaceGroteskTextTheme(),
        useMaterial3: true,
      ),
      home: AppHome(database: database),
    );
  }
}

class AppHome extends StatefulWidget {
  const AppHome({super.key, required this.database});

  final FeedbackDatabase database;

  @override
  State<AppHome> createState() => _AppHomeState();
}

class _AppHomeState extends State<AppHome> {
  int _index = 0;

  @override
  Widget build(BuildContext context) {
    final pages = [
      DashboardPage(analytics: BudgetAnalytics.fromSeedData()),
      FeedbackPage(database: widget.database),
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('National Budget Flow Intelligence')),
      body: pages[_index],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _index,
        onDestinationSelected: (value) => setState(() => _index = value),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.analytics_outlined),
            selectedIcon: Icon(Icons.analytics),
            label: 'Analytics',
          ),
          NavigationDestination(
            icon: Icon(Icons.campaign_outlined),
            selectedIcon: Icon(Icons.campaign),
            label: 'Citizen Feedback',
          ),
        ],
      ),
    );
  }
}
