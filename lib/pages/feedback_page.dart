import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:protocol7/data/feedback_database.dart';
import 'package:protocol7/models/budget_models.dart';
import 'package:protocol7/models/citizen_feedback.dart';
import 'package:protocol7/widgets/star_rating.dart';

class FeedbackPage extends StatefulWidget {
  const FeedbackPage({super.key, required this.database});

  final FeedbackDatabase database;

  @override
  State<FeedbackPage> createState() => _FeedbackPageState();
}

class _FeedbackPageState extends State<FeedbackPage> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _areaController = TextEditingController();
  final _detailsController = TextEditingController();
  final _statusNoteController = TextEditingController();
  final _picker = ImagePicker();

  String _selectedDistrict = BudgetSeedData.districts.first;
  String _selectedDepartment = BudgetSeedData.departments.first;
  CitizenActionStatus _status = CitizenActionStatus.pending;
  int? _rating;
  Uint8List? _imageBytes;
  List<CitizenFeedback> _entries = <CitizenFeedback>[];
  bool _saving = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    final rows = await widget.database.all();
    if (!mounted) {
      return;
    }
    setState(() {
      _entries = rows;
    });
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
        district: _selectedDistrict,
        department: _selectedDepartment,
        areaDescription: _areaController.text.trim(),
        details: _detailsController.text.trim(),
        rating: _rating!,
        actionStatus: _status,
        statusNote: _statusNoteController.text.trim(),
        createdAt: DateTime.now(),
        imageBytes: _imageBytes,
      );

      await widget.database.add(feedback);
      _nameController.clear();
      _areaController.clear();
      _detailsController.clear();
      _statusNoteController.clear();
      setState(() {
        _status = CitizenActionStatus.pending;
        _rating = null;
        _imageBytes = null;
      });

      await _load();
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Feedback submitted to database.')),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _saving = false);
      }
    }
  }

  Future<void> _updateStatus(
    CitizenFeedback entry,
    CitizenActionStatus next,
  ) async {
    final updated = entry.copyWith(actionStatus: next);
    await widget.database.update(updated);
    await _load();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _areaController.dispose();
    _detailsController.dispose();
    _statusNoteController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [Color(0xFFF2F8FF), Color(0xFFFAFCFF)],
        ),
      ),
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(14),
              child: Form(
                key: _formKey,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Report Ground Reality',
                      style: Theme.of(context).textTheme.titleLarge,
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
                      initialValue: _selectedDistrict,
                      decoration: const InputDecoration(labelText: 'District'),
                      items: BudgetSeedData.districts
                          .map(
                            (d) => DropdownMenuItem(value: d, child: Text(d)),
                          )
                          .toList(),
                      onChanged: (value) {
                        if (value != null) {
                          setState(() => _selectedDistrict = value);
                        }
                      },
                    ),
                    const SizedBox(height: 10),
                    DropdownButtonFormField<String>(
                      initialValue: _selectedDepartment,
                      decoration: const InputDecoration(
                        labelText: 'Department',
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
                      controller: _areaController,
                      decoration: const InputDecoration(
                        labelText: 'Area / Project Site',
                      ),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Enter area or site'
                          : null,
                    ),
                    const SizedBox(height: 10),
                    TextFormField(
                      controller: _detailsController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Issue Details',
                        hintText:
                            'What work is missing compared to budget data?',
                      ),
                      validator: (value) =>
                          (value == null || value.trim().isEmpty)
                          ? 'Enter issue details'
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
                              'Work Quality Rating (required)',
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
                            'Example: No action yet / Team visited the site',
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
          const SizedBox(height: 16),
          Text(
            'Submitted Feedback (${_entries.length})',
            style: Theme.of(context).textTheme.titleMedium,
          ),
          const SizedBox(height: 8),
          ..._entries.map(
            (entry) => Card(
              child: Padding(
                padding: const EdgeInsets.all(12),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '${entry.department} - ${entry.district}',
                      style: Theme.of(context).textTheme.titleSmall,
                    ),
                    const SizedBox(height: 4),
                    Text('Area: ${entry.areaDescription}'),
                    Text(
                      'By: ${entry.citizenName} | ${_date(entry.createdAt)}',
                    ),
                    const SizedBox(height: 6),
                    Row(
                      children: [
                        const Text('Citizen Rating: '),
                        StarRatingView(rating: entry.rating),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(entry.details),
                    if (entry.statusNote.isNotEmpty) ...[
                      const SizedBox(height: 6),
                      Text('Citizen Note: ${entry.statusNote}'),
                    ],
                    const SizedBox(height: 8),
                    if (entry.imageBytes != null)
                      ClipRRect(
                        borderRadius: BorderRadius.circular(10),
                        child: Image.memory(
                          entry.imageBytes!,
                          width: double.infinity,
                          height: 170,
                          fit: BoxFit.cover,
                        ),
                      ),
                    const SizedBox(height: 8),
                    DropdownButtonFormField<CitizenActionStatus>(
                      initialValue: entry.actionStatus,
                      decoration: const InputDecoration(
                        labelText: 'Government Action Status',
                        border: OutlineInputBorder(),
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
                          _updateStatus(entry, value);
                        }
                      },
                    ),
                  ],
                ),
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
