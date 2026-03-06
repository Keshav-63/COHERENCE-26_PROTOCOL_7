import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:protocol7/data/feedback_database.dart';
import 'package:protocol7/models/budget_models.dart';
import 'package:protocol7/pages/analysis_map_page.dart';
import 'package:protocol7/pages/dashboard_page.dart';

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
  BudgetAnalytics? _analytics;

  @override
  Widget build(BuildContext context) {
    // Compute analytics lazily only when Analytics tab is viewed
    if (_index == 0 && _analytics == null) {
      // Use a FutureBuilder to avoid blocking the UI thread
      return Scaffold(
        appBar: AppBar(title: const Text('National Budget Flow Intelligence')),
        body: FutureBuilder<BudgetAnalytics>(
          future: Future.microtask(() => BudgetAnalytics.fromSeedData()),
          builder: (context, snapshot) {
            if (snapshot.hasData) {
              // Cache the result
              WidgetsBinding.instance.addPostFrameCallback((_) {
                if (mounted) {
                  setState(() {
                    _analytics = snapshot.data!;
                  });
                }
              });
              return DashboardPage(analytics: snapshot.data!);
            }
            return const Center(child: CircularProgressIndicator());
          },
        ),
        bottomNavigationBar: _buildNavigationBar(),
      );
    }

    // Once analytics is cached, use it directly
    final currentPage = _index == 0
        ? DashboardPage(analytics: _analytics!)
        : AnalysisMapPage(database: widget.database);

    return Scaffold(
      appBar: AppBar(title: const Text('National Budget Flow Intelligence')),
      body: currentPage,
      bottomNavigationBar: _buildNavigationBar(),
    );
  }

  NavigationBar _buildNavigationBar() {
    return NavigationBar(
      selectedIndex: _index,
      onDestinationSelected: (value) => setState(() => _index = value),
      destinations: const [
        NavigationDestination(
          icon: Icon(Icons.analytics_outlined),
          selectedIcon: Icon(Icons.analytics),
          label: 'Analytics',
        ),
        NavigationDestination(
          icon: Icon(Icons.map_outlined),
          selectedIcon: Icon(Icons.map),
          label: 'Analysis',
        ),
      ],
    );
  }
}
