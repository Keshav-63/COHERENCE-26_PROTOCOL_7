import 'package:path_provider/path_provider.dart';
import 'package:protocol7/models/citizen_feedback.dart';
import 'package:sembast/sembast_io.dart';

class FeedbackDatabase {
  FeedbackDatabase._(this._db);

  final Database _db;
  final _store = intMapStoreFactory.store('citizen_feedback');

  static Future<FeedbackDatabase> create() async {
    final root = await getApplicationDocumentsDirectory();
    final db = await databaseFactoryIo.openDatabase(
      '${root.path}/protocol7_feedback.db',
    );
    return FeedbackDatabase._(db);
  }

  Future<void> add(CitizenFeedback feedback) async {
    await _store.record(feedback.id).put(_db, feedback.toMap());
  }

  Future<void> update(CitizenFeedback feedback) async {
    await _store.record(feedback.id).put(_db, feedback.toMap(), merge: true);
  }

  Future<List<CitizenFeedback>> all() async {
    final snaps = await _store.find(
      _db,
      finder: Finder(sortOrders: [SortOrder('createdAt', false)]),
    );
    return snaps.map((snap) => CitizenFeedback.fromMap(snap.value)).toList();
  }

  Future<List<CitizenFeedback>> byArea({
    required String district,
    required String areaDescription,
    String? areaId,
  }) async {
    final filters = <Filter>[
      Filter.equals('district', district),
      Filter.equals('areaDescription', areaDescription),
    ];

    if (areaId != null && areaId.isNotEmpty) {
      filters.add(Filter.equals('areaId', areaId));
    }

    final snaps = await _store.find(
      _db,
      finder: Finder(
        filter: Filter.and(filters),
        sortOrders: [SortOrder('createdAt', false)],
      ),
    );

    return snaps.map((snap) => CitizenFeedback.fromMap(snap.value)).toList();
  }
}
