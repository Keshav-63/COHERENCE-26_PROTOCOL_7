import 'package:flutter/material.dart';
import 'package:protocol7/app.dart';
import 'package:protocol7/data/feedback_database.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final database = await FeedbackDatabase.create();
  runApp(BudgetIntelligenceApp(database: database));
}
