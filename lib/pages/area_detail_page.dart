import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:image_picker/image_picker.dart';
import 'package:protocol7/data/feedback_database.dart';
import 'package:protocol7/models/area_map_models.dart';
import 'package:protocol7/models/budget_models.dart';
import 'package:protocol7/models/citizen_feedback.dart';
import 'package:protocol7/widgets/star_rating.dart';

class AreaDetailPage extends StatefulWidget {
  const AreaDetailPage({super.key, required this.database, required this.area});

  final FeedbackDatabase database;
  final AreaInsight area;

  @override
  State<AreaDetailPage> createState() => _AreaDetailPageState();
}

class _AreaDetailPageState extends State<AreaDetailPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _detailsController = TextEditingController();
  final _statusNoteController = TextEditingController();
  final _picker = ImagePicker();

  String _selectedDepartment = BudgetSeedData.departments.first;
  CitizenActionStatus _status = CitizenActionStatus.pending;
  int? _rating;
  Uint8List? _imageBytes;
  Position? _currentPosition;
  String? _locationError;
  bool _locating = false;
  bool _saving = false;

  late Future<List<CitizenFeedback>> _feedbackFuture;

  @override
  void initState() {
    super.initState();
    _feedbackFuture = _fetchAreaFeedback();
    _fetchUserLocation();
  }

  Future<List<CitizenFeedback>> _fetchAreaFeedback() {
    return widget.database.byArea(
      district: widget.area.district,
      areaDescription: widget.area.areaName,
      areaId: widget.area.id,
    );
  }

  Future<void> _pickImage() async {
    final file = await _picker.pickImage(
      source: ImageSource.gallery,
      imageQuality: 80,
    );
    if (file == null) {
      return;
    }
    final bytes = await file.readAsBytes();
    setState(() {
      _imageBytes = bytes;
    });
  }

  Future<void> _fetchUserLocation() async {
    setState(() {
      _locating = true;
      _locationError = null;
    });

    try {
      final serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        setState(() {
          _locationError = 'Location services are off. Enable GPS and retry.';
          _locating = false;
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
          _locationError =
              'Location permission is required to pinpoint your position.';
          _locating = false;
        });
        return;
      }

      final position = await Geolocator.getCurrentPosition();
      if (!mounted) {
        return;
      }
      setState(() {
        _currentPosition = position;
        _locating = false;
      });
    } catch (_) {
      if (!mounted) {
        return;
      }
      setState(() {
        _locationError = 'Unable to read your location. Please retry.';
        _locating = false;
      });
    }
  }

  Future<void> _submit() async {
    final isValid = _formKey.currentState?.validate() ?? false;
    if (!isValid || _rating == null) {
      return;
    }

    setState(() => _saving = true);
    try {
      final feedback = CitizenFeedback(
        id: DateTime.now().millisecondsSinceEpoch,
        citizenName: _nameController.text.trim().isEmpty
            ? 'Anonymous'
            : _nameController.text.trim(),
        district: widget.area.district,
        department: _selectedDepartment,
        areaId: widget.area.id,
        areaDescription: widget.area.areaName,
        details: _detailsController.text.trim(),
        rating: _rating!,
        actionStatus: _status,
        statusNote: _statusNoteController.text.trim(),
        createdAt: DateTime.now(),
        imageBytes: _imageBytes,
        latitude: _currentPosition?.latitude,
        longitude: _currentPosition?.longitude,
      );

      await widget.database.add(feedback);
      _nameController.clear();
      _detailsController.clear();
      _statusNoteController.clear();
      setState(() {
        _rating = null;
        _status = CitizenActionStatus.pending;
        _imageBytes = null;
        _feedbackFuture = _fetchAreaFeedback();
      });

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Area-wise feedback submitted.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _detailsController.dispose();
    _statusNoteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final area = widget.area;

    return Scaffold(
      appBar: AppBar(title: Text('${area.areaName} Analysis')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '${area.areaName}, ${area.district}',
                    style: Theme.of(context).textTheme.titleLarge,
                  ),
                  const SizedBox(height: 8),
                  Wrap(
                    spacing: 12,
                    runSpacing: 8,
                    children: [
                      _MetricChip(
                        label: 'Completion',
                        value:
                            '${(area.completionRate * 100).toStringAsFixed(0)}%',
                      ),
                      _MetricChip(
                        label: 'Utilization',
                        value:
                            '${(area.utilizationRate * 100).toStringAsFixed(0)}%',
                      ),
                      _MetricChip(label: 'Risk', value: area.riskLevel),
                      _MetricChip(
                        label: 'Projects',
                        value:
                            '${area.completedProjects}/${area.totalProjects}',
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    area.descriptiveAnalysis,
                    style: Theme.of(context).textTheme.bodyMedium,
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Work Completed',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  ...area.workDone.map((item) => Text('- $item')),
                  const SizedBox(height: 12),
                  Text(
                    'Pending / Delayed Work',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  ...area.pendingWork.map((item) => Text('- $item')),
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Submit Area Feedback From Map',
                      style: Theme.of(context).textTheme.titleMedium,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _nameController,
                      decoration: const InputDecoration(
                        labelText: 'Name (optional)',
                      ),
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedDepartment,
                      decoration: const InputDecoration(
                        labelText: 'Department Related to Issue',
                      ),
                      items: BudgetSeedData.departments
                          .map(
                            (d) => DropdownMenuItem(value: d, child: Text(d)),
                          )
                          .toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedDepartment = value);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      initialValue: '${area.areaName}, ${area.district}',
                      enabled: false,
                      decoration: const InputDecoration(
                        labelText: 'Mapped Area',
                      ),
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _detailsController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Issue / Observation',
                        hintText:
                            'Describe what is completed and what is still missing in this area.',
                      ),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Enter area-wise issue details'
                          : null,
                    ),
                    const SizedBox(height: 10),
                    FormField<int>(
                      validator: (value) {
                        if (value == null || value < 1 || value > 5) {
                          return 'Please select a rating out of 5 stars.';
                        }
                        return null;
                      },
                      initialValue: _rating,
                      builder: (field) {
                        return Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Area Execution Rating (required)',
                              style: Theme.of(context).textTheme.bodyMedium,
                            ),
                            const SizedBox(height: 6),
                            StarRatingPicker(
                              rating: field.value ?? 0,
                              onChanged: (value) {
                                field.didChange(value);
                                setState(() => _rating = value);
                              },
                            ),
                            if (field.hasError)
                              Padding(
                                padding: const EdgeInsets.only(top: 4),
                                child: Text(
                                  field.errorText!,
                                  style: TextStyle(
                                    color: Theme.of(context).colorScheme.error,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                          ],
                        );
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<CitizenActionStatus>(
                      initialValue: _status,
                      decoration: const InputDecoration(
                        labelText: 'Current Action Status',
                      ),
                      items: CitizenActionStatus.values
                          .map(
                            (state) => DropdownMenuItem(
                              value: state,
                              child: Text(state.label),
                            ),
                          )
                          .toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _status = value);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _statusNoteController,
                      decoration: const InputDecoration(
                        labelText: 'Citizen Note',
                        hintText:
                            'Example: Team visited but no repair done yet.',
                      ),
                    ),
                    const SizedBox(height: 10),
                    Wrap(
                      spacing: 10,
                      runSpacing: 10,
                      crossAxisAlignment: WrapCrossAlignment.center,
                      children: [
                        FilledButton.icon(
                          onPressed: _pickImage,
                          icon: const Icon(Icons.photo_library_outlined),
                          label: const Text('Upload Photo'),
                        ),
                        if (_imageBytes != null)
                          ClipRRect(
                            borderRadius: BorderRadius.circular(10),
                            child: Image.memory(
                              _imageBytes!,
                              width: 72,
                              height: 72,
                              fit: BoxFit.cover,
                            ),
                          ),
                      ],
                    ),
                    const SizedBox(height: 10),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(10),
                      decoration: BoxDecoration(
                        color: const Color(0xFFF3F7FC),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Your current location for map pin',
                            style: TextStyle(fontWeight: FontWeight.w600),
                          ),
                          const SizedBox(height: 4),
                          if (_locating)
                            const Text('Detecting your location...')
                          else if (_currentPosition != null)
                            Text(
                              'Lat: ${_currentPosition!.latitude.toStringAsFixed(5)}, Lng: ${_currentPosition!.longitude.toStringAsFixed(5)}',
                            )
                          else
                            Text(
                              _locationError ??
                                  'Location not available yet. Tap refresh.',
                            ),
                          const SizedBox(height: 8),
                          OutlinedButton.icon(
                            onPressed: _locating ? null : _fetchUserLocation,
                            icon: const Icon(Icons.my_location_outlined),
                            label: const Text('Refresh Location'),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 12),
                    SizedBox(
                      width: double.infinity,
                      child: FilledButton(
                        onPressed: _saving ? null : _submit,
                        child: Text(
                          _saving ? 'Submitting...' : 'Submit Feedback',
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Area Feedback Timeline',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                  const SizedBox(height: 8),
                  FutureBuilder<List<CitizenFeedback>>(
                    future: _feedbackFuture,
                    builder: (context, snapshot) {
                      if (!snapshot.hasData) {
                        return const Padding(
                          padding: EdgeInsets.symmetric(vertical: 14),
                          child: Center(child: CircularProgressIndicator()),
                        );
                      }
                      final rows = snapshot.data!;
                      if (rows.isEmpty) {
                        return const Text(
                          'No area-specific feedback yet. Submit from the map form above.',
                        );
                      }

                      return Column(
                        children: rows
                            .map(
                              (entry) => Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(10),
                                decoration: BoxDecoration(
                                  borderRadius: BorderRadius.circular(10),
                                  color: const Color(0xFFF7FAFC),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      '${entry.citizenName} - ${_date(entry.createdAt)}',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.w700,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Row(
                                      children: [
                                        const Text('Rating: '),
                                        StarRatingView(rating: entry.rating),
                                      ],
                                    ),
                                    const SizedBox(height: 4),
                                    Text(entry.details),
                                    if (entry.statusNote.isNotEmpty) ...[
                                      const SizedBox(height: 4),
                                      Text('Note: ${entry.statusNote}'),
                                    ],
                                    if (entry.latitude != null &&
                                        entry.longitude != null) ...[
                                      const SizedBox(height: 4),
                                      Text(
                                        'Reported from: ${entry.latitude!.toStringAsFixed(5)}, ${entry.longitude!.toStringAsFixed(5)}',
                                      ),
                                    ],
                                    if (entry.imageBytes != null) ...[
                                      const SizedBox(height: 8),
                                      ClipRRect(
                                        borderRadius: BorderRadius.circular(8),
                                        child: Image.memory(
                                          entry.imageBytes!,
                                          height: 120,
                                          width: double.infinity,
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ],
                                  ],
                                ),
                              ),
                            )
                            .toList(),
                      );
                    },
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _date(DateTime value) {
    return '${value.day.toString().padLeft(2, '0')}-${value.month.toString().padLeft(2, '0')}-${value.year}';
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFFEFF4FA),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Text('$label: $value'),
    );
  }
}
