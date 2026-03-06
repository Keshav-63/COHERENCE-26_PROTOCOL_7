import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:geolocator/geolocator.dart';
import 'package:latlong2/latlong.dart';
import 'package:protocol7/data/feedback_database.dart';
import 'package:protocol7/models/area_map_models.dart';
import 'package:protocol7/pages/area_detail_page.dart';

class AnalysisMapPage extends StatefulWidget {
  const AnalysisMapPage({super.key, required this.database});

  final FeedbackDatabase database;

  @override
  State<AnalysisMapPage> createState() => _AnalysisMapPageState();
}

class _AnalysisMapPageState extends State<AnalysisMapPage> {
  final List<AreaInsight> _areas = AreaMapSeedData.areas;
  final MapController _mapController = MapController();

  late Future<Map<String, int>> _feedbackCountsFuture;
  LatLng? _userLocation;
  String? _userAddress;
  String? _locationError;
  bool _locating = false;
  AreaInsight? _expandedAreaOnMap;

  static const LatLng _vasaiMockLocation = LatLng(19.3919, 72.8397);
  static const bool _forceVasaiMockLocation = true;

  @override
  void initState() {
    super.initState();
    _feedbackCountsFuture = _areaFeedbackCounts();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _detectUserLocation();
    });
  }

  Future<Map<String, int>> _areaFeedbackCounts() async {
    final feedback = await widget.database.all();
    final counts = <String, int>{};
    for (final area in _areas) {
      counts[area.id] = 0;
    }

    for (final entry in feedback) {
      var key = entry.areaId;
      if (key.isEmpty) {
        final matched = _areas.where(
          (area) =>
              area.district == entry.district &&
              area.areaName == entry.areaDescription,
        );
        if (matched.isNotEmpty) {
          key = matched.first.id;
        }
      }
      if (key.isNotEmpty && counts.containsKey(key)) {
        counts[key] = counts[key]! + 1;
      }
    }

    return counts;
  }

  Future<void> _detectUserLocation() async {
    try {
      final proceed = await _confirmLocationAccessAttempt();
      if (!proceed || !mounted) {
        return;
      }

      setState(() {
        _locating = true;
        _locationError = null;
      });

      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locating = false;
          _locationError =
              'Please enable Location Services in your phone settings.';
        });
        return;
      }

      var permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied) {
        permission = await Geolocator.requestPermission();
      }
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) {
        setState(() {
          _locating = false;
          _locationError =
              'Location permission required. Please allow access in settings.';
        });
        return;
      }

      LatLng resolvedLocation = _vasaiMockLocation;
      if (!_forceVasaiMockLocation) {
        // High-accuracy GPS position with explicit Android settings.
        final position = await Geolocator.getCurrentPosition(
          locationSettings: AndroidSettings(
            accuracy: LocationAccuracy.best,
            distanceFilter: 0,
            forceLocationManager: true,
            timeLimit: Duration(seconds: 15),
          ),
        );
        if (!mounted) return;

        if (!_isLikelyInIndia(position.latitude, position.longitude)) {
          setState(() {
            _locating = false;
            _locationError =
                'Detected location looks outside India (${position.latitude.toStringAsFixed(4)}, ${position.longitude.toStringAsFixed(4)}). Set emulator mock location to Vasai and retry.';
            _userLocation = null;
            _userAddress = null;
            _expandedAreaOnMap = null;
          });
          _mapController.move(_vasaiMockLocation, 12.0);
          return;
        }
        resolvedLocation = LatLng(position.latitude, position.longitude);
      }

      if (!mounted) return;
      if (_forceVasaiMockLocation) {
        setState(() {
          _locating = false;
          _locationError = null;
          _userLocation = _vasaiMockLocation;
          _userAddress =
              'Vasai, Palghar, Maharashtra (mock mode)\nLat: ${_vasaiMockLocation.latitude.toStringAsFixed(4)}, Lng: ${_vasaiMockLocation.longitude.toStringAsFixed(4)}';
          _expandedAreaOnMap = _nearestArea(
            _vasaiMockLocation.latitude,
            _vasaiMockLocation.longitude,
          );
        });
        _mapController.move(_vasaiMockLocation, 13.0);
        return;
      }

      final addressStr =
          'Lat: ${resolvedLocation.latitude.toStringAsFixed(4)}, Lng: ${resolvedLocation.longitude.toStringAsFixed(4)}';
      final nearest = _nearestArea(
        resolvedLocation.latitude,
        resolvedLocation.longitude,
      );

      setState(() {
        _userLocation = resolvedLocation;
        _userAddress = addressStr;
        _expandedAreaOnMap = nearest;
        _locating = false;
      });

      _mapController.move(resolvedLocation, 13.0);
    } catch (e) {
      if (!mounted) return;
      setState(() {
        _locating = false;
        _locationError = 'Could not detect your location. Please try again.';
      });
    }
  }

  bool _isLikelyInIndia(double latitude, double longitude) {
    return latitude >= 6.0 &&
        latitude <= 38.0 &&
        longitude >= 68.0 &&
        longitude <= 98.0;
  }

  Future<bool> _confirmLocationAccessAttempt() async {
    final decision = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Allow Location Access'),
        content: const Text(
          'To pinpoint nearby work updates and feedback areas, allow location access for this check.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Not now'),
          ),
          ElevatedButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Allow now'),
          ),
        ],
      ),
    );
    return decision ?? false;
  }

  AreaInsight _nearestArea(double latitude, double longitude) {
    AreaInsight nearest = _areas.first;
    var bestDistance = double.infinity;

    for (final area in _areas) {
      final distance = Geolocator.distanceBetween(
        latitude,
        longitude,
        area.latitude,
        area.longitude,
      );

      if (distance < bestDistance) {
        bestDistance = distance;
        nearest = area;
      }
    }

    return nearest;
  }

  Color _colorForRate(double rate) {
    if (rate >= 0.80) return Colors.green;
    if (rate >= 0.60) return Colors.amber;
    return Colors.red;
  }

  void _showAreaBottomSheet(
    BuildContext context,
    AreaInsight area,
    int feedbackCount,
  ) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (context) => DraggableScrollableSheet(
        initialChildSize: 0.65,
        minChildSize: 0.4,
        maxChildSize: 0.9,
        expand: false,
        builder: (context, scrollController) => SingleChildScrollView(
          controller: scrollController,
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  area.areaName,
                  style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 12),
                // Status chips
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    _StatusChip(
                      icon: Icons.check_circle,
                      label: 'Completion',
                      value:
                          '${(area.completionRate * 100).toStringAsFixed(0)}%',
                      color: _colorForRate(area.completionRate),
                    ),
                    _StatusChip(
                      icon: Icons.trending_up,
                      label: 'Utilization',
                      value:
                          '${(area.utilizationRate * 100).toStringAsFixed(0)}%',
                      color: _colorForRate(area.utilizationRate),
                    ),
                    _StatusChip(
                      icon: Icons.warning,
                      label: 'Risk',
                      value: area.riskLevel.toUpperCase().substring(0, 1),
                      color: area.riskLevel == 'high'
                          ? Colors.red
                          : area.riskLevel == 'medium'
                          ? Colors.orange
                          : Colors.green,
                    ),
                    _StatusChip(
                      icon: Icons.feedback,
                      label: 'Feedback',
                      value: feedbackCount.toString(),
                      color: Colors.blue,
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Financial Card
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Financial Allocation',
                          style: Theme.of(context).textTheme.titleMedium
                              ?.copyWith(fontWeight: FontWeight.bold),
                        ),
                        const SizedBox(height: 8),
                        Row(
                          children: [
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Allocated',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                  Text(
                                    '₹${area.allocatedBudgetCr} Cr',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    'Spent',
                                    style: Theme.of(
                                      context,
                                    ).textTheme.bodySmall,
                                  ),
                                  Text(
                                    '₹${area.spentBudgetCr} Cr',
                                    style: Theme.of(context)
                                        .textTheme
                                        .titleMedium
                                        ?.copyWith(fontWeight: FontWeight.bold),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                // Financial Advancements
                if (area.financialAdvancements.isNotEmpty)
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Recent Advancements',
                        style: Theme.of(context).textTheme.titleMedium
                            ?.copyWith(fontWeight: FontWeight.bold),
                      ),
                      const SizedBox(height: 8),
                      ...area.financialAdvancements.map(
                        (advancement) => Padding(
                          padding: const EdgeInsets.symmetric(vertical: 4),
                          child: Row(
                            children: [
                              Icon(
                                Icons.check_circle,
                                color: Colors.green,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  advancement,
                                  style: Theme.of(context).textTheme.bodySmall,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                const SizedBox(height: 16),
                // Work Status
                ExpansionTile(
                  title: Text(
                    'Work Completed (${area.completedProjects}/${area.totalProjects})',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        area.workDone.isNotEmpty
                            ? area.workDone.join('\n')
                            : 'No details available',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
                ExpansionTile(
                  title: Text(
                    'Pending Work (${area.totalProjects - area.completedProjects}/${area.totalProjects})',
                    style: Theme.of(context).textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  children: [
                    Padding(
                      padding: const EdgeInsets.all(12),
                      child: Text(
                        area.pendingWork.isNotEmpty
                            ? area.pendingWork.join('\n')
                            : 'No details available',
                        style: Theme.of(context).textTheme.bodySmall,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 16),
                // Submit Feedback Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: () {
                      Navigator.pop(context);
                      Navigator.push(
                        context,
                        MaterialPageRoute(
                          builder: (context) => AreaDetailPage(
                            database: widget.database,
                            area: area,
                          ),
                        ),
                      );
                    },
                    icon: const Icon(Icons.feedback),
                    label: const Text('Submit Feedback'),
                  ),
                ),
                const SizedBox(height: 16),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFEAF3FF), Color(0xFFF9FCFF)],
        ),
      ),
      child: FutureBuilder<Map<String, int>>(
        future: _feedbackCountsFuture,
        builder: (context, snapshot) {
          final feedbackCounts = snapshot.data ?? {};

          return SingleChildScrollView(
            child: Column(
              children: [
                const SizedBox(height: 16),
                // Map Container
                Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: ClipRRect(
                    borderRadius: BorderRadius.circular(12),
                    child: SizedBox(
                      height: 420,
                      child: Stack(
                        children: [
                          FlutterMap(
                            mapController: _mapController,
                            options: MapOptions(
                              initialCenter: _vasaiMockLocation,
                              initialZoom: 11.5,
                            ),
                            children: [
                              TileLayer(
                                urlTemplate:
                                    'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                                userAgentPackageName: 'com.example.protocol7',
                              ),
                              MarkerLayer(
                                markers: [
                                  // Area markers with expansion
                                  ..._areas.map((area) {
                                    final isExpanded =
                                        _expandedAreaOnMap?.id == area.id;
                                    final feedbackCount =
                                        feedbackCounts[area.id] ?? 0;
                                    final color = _colorForRate(
                                      area.completionRate,
                                    );

                                    return Marker(
                                      point: LatLng(
                                        area.latitude,
                                        area.longitude,
                                      ),
                                      width: isExpanded ? 168 : 44,
                                      height: isExpanded ? 122 : 44,
                                      child: GestureDetector(
                                        onTap: () {
                                          setState(() {
                                            if (isExpanded) {
                                              _showAreaBottomSheet(
                                                context,
                                                area,
                                                feedbackCount,
                                              );
                                            } else {
                                              _expandedAreaOnMap = area;
                                            }
                                          });
                                        },
                                        child: AnimatedContainer(
                                          duration: const Duration(
                                            milliseconds: 300,
                                          ),
                                          width: isExpanded ? 168 : 44,
                                          height: isExpanded ? 122 : 44,
                                          padding: const EdgeInsets.all(6),
                                          decoration: BoxDecoration(
                                            color: isExpanded
                                                ? color
                                                : Colors.transparent,
                                            borderRadius: BorderRadius.circular(
                                              14,
                                            ),
                                            boxShadow: [
                                              BoxShadow(
                                                color: Colors.black.withValues(
                                                  alpha: isExpanded
                                                      ? 0.25
                                                      : 0.15,
                                                ),
                                                blurRadius: isExpanded ? 12 : 6,
                                                offset: Offset(
                                                  0,
                                                  isExpanded ? 4 : 2,
                                                ),
                                              ),
                                            ],
                                            border: Border.all(
                                              color: isExpanded
                                                  ? Colors.white
                                                  : Colors.transparent,
                                              width: 2,
                                            ),
                                          ),
                                          child: isExpanded
                                              ? SingleChildScrollView(
                                                  child: Column(
                                                    mainAxisSize:
                                                        MainAxisSize.min,
                                                    children: [
                                                      Text(
                                                        area.areaName,
                                                        maxLines: 2,
                                                        overflow: TextOverflow
                                                            .ellipsis,
                                                        textAlign:
                                                            TextAlign.center,
                                                        style: const TextStyle(
                                                          color: Colors.white,
                                                          fontWeight:
                                                              FontWeight.w700,
                                                          fontSize: 11,
                                                        ),
                                                      ),
                                                      const SizedBox(height: 4),
                                                      Column(
                                                        mainAxisSize:
                                                            MainAxisSize.min,
                                                        children: [
                                                          Text(
                                                            '${(area.completionRate * 100).toStringAsFixed(0)}%',
                                                            style:
                                                                const TextStyle(
                                                                  color: Colors
                                                                      .white,
                                                                  fontWeight:
                                                                      FontWeight
                                                                          .w600,
                                                                  fontSize: 10,
                                                                ),
                                                          ),
                                                          Text(
                                                            'F: $feedbackCount',
                                                            style:
                                                                const TextStyle(
                                                                  color: Colors
                                                                      .white,
                                                                  fontSize: 9,
                                                                ),
                                                          ),
                                                        ],
                                                      ),
                                                    ],
                                                  ),
                                                )
                                              : Column(
                                                  mainAxisAlignment:
                                                      MainAxisAlignment.center,
                                                  children: [
                                                    Icon(
                                                      Icons.location_pin,
                                                      color: color,
                                                      size: 34,
                                                    ),
                                                    Text(
                                                      '${(area.completionRate * 100).toStringAsFixed(0)}%',
                                                      style: TextStyle(
                                                        color: color,
                                                        fontWeight:
                                                            FontWeight.w700,
                                                        fontSize: 10,
                                                      ),
                                                    ),
                                                  ],
                                                ),
                                        ),
                                      ),
                                    );
                                  }),
                                  // User location marker
                                  if (_userLocation != null)
                                    Marker(
                                      point: _userLocation!,
                                      width: 48,
                                      height: 48,
                                      child: Container(
                                        decoration: BoxDecoration(
                                          color: const Color(0xFF1155CC),
                                          borderRadius: BorderRadius.circular(
                                            24,
                                          ),
                                          border: Border.all(
                                            color: Colors.white,
                                            width: 3,
                                          ),
                                          boxShadow: const [
                                            BoxShadow(
                                              color: Color(0x22000000),
                                              blurRadius: 6,
                                              offset: Offset(0, 2),
                                            ),
                                          ],
                                        ),
                                        child: const Icon(
                                          Icons.person_pin_circle,
                                          color: Colors.white,
                                          size: 28,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ],
                          ),
                          Positioned(
                            right: 12,
                            bottom: 12,
                            child: FloatingActionButton.small(
                              onPressed: _locating ? null : _detectUserLocation,
                              child: const Icon(Icons.my_location),
                            ),
                          ),
                          Positioned(
                            left: 12,
                            top: 12,
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 10,
                                vertical: 6,
                              ),
                              decoration: BoxDecoration(
                                color: Colors.white,
                                borderRadius: BorderRadius.circular(20),
                                border: Border.all(color: Colors.green),
                              ),
                              child: const Text(
                                'Vasai Mock ON',
                                style: TextStyle(
                                  color: Colors.green,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 11,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 14),
                // Location info
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _locationError != null
                      ? Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: Colors.red[50],
                            borderRadius: BorderRadius.circular(8),
                            border: Border.all(color: Colors.red[200]!),
                          ),
                          child: Row(
                            children: [
                              Icon(Icons.error_outline, color: Colors.red[700]),
                              const SizedBox(width: 8),
                              Expanded(
                                child: Text(
                                  _locationError!,
                                  style: TextStyle(
                                    color: Colors.red[700],
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Your Location: ${_userAddress ?? 'Locating near Vasai...'}',
                              style: const TextStyle(
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                            if (_expandedAreaOnMap != null)
                              Text(
                                'Nearest: ${_expandedAreaOnMap!.areaName}',
                                style: const TextStyle(
                                  fontStyle: FontStyle.italic,
                                  color: Colors.green,
                                ),
                              ),
                          ],
                        ),
                ),
                const SizedBox(height: 14),
                // Legend
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Card(
                    child: Padding(
                      padding: const EdgeInsets.all(12),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Completion Status Legend',
                            style: Theme.of(context).textTheme.titleSmall,
                          ),
                          const SizedBox(height: 8),
                          Wrap(
                            spacing: 8,
                            runSpacing: 8,
                            children: [
                              _LegendRow(
                                color: _colorForRate(0.85),
                                label: 'High (>=80%)',
                              ),
                              _LegendRow(
                                color: _colorForRate(0.68),
                                label: 'Moderate (60-79%)',
                              ),
                              _LegendRow(
                                color: _colorForRate(0.45),
                                label: 'Critical (<60%)',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 20),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _StatusChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatusChip({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        border: Border.all(color: color),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, size: 16, color: color),
          const SizedBox(width: 6),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisSize: MainAxisSize.min,
            children: [
              Text(
                label,
                style: TextStyle(
                  fontSize: 10,
                  color: color,
                  fontWeight: FontWeight.w500,
                ),
              ),
              Text(
                value,
                style: TextStyle(
                  fontSize: 12,
                  color: color,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _LegendRow extends StatelessWidget {
  final Color color;
  final String label;

  const _LegendRow({required this.color, required this.label});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          width: 16,
          height: 16,
          decoration: BoxDecoration(
            color: color,
            borderRadius: BorderRadius.circular(4),
          ),
        ),
        const SizedBox(width: 8),
        Text(label, style: Theme.of(context).textTheme.bodySmall),
      ],
    );
  }
}
