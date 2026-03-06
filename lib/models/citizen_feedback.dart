import 'dart:typed_data';

enum CitizenActionStatus {
  pending('No action yet'),
  actionTaken('Action taken'),
  noAction('Not resolved');

  const CitizenActionStatus(this.label);

  final String label;
}

class CitizenFeedback {
  CitizenFeedback({
    required this.id,
    required this.citizenName,
    required this.district,
    required this.department,
    this.areaId = '',
    required this.areaDescription,
    required this.details,
    required this.rating,
    required this.actionStatus,
    required this.statusNote,
    required this.createdAt,
    this.imageBytes,
    this.latitude,
    this.longitude,
  });

  final int id;
  final String citizenName;
  final String district;
  final String department;
  final String areaId;
  final String areaDescription;
  final String details;
  final int rating;
  final CitizenActionStatus actionStatus;
  final String statusNote;
  final DateTime createdAt;
  final Uint8List? imageBytes;
  final double? latitude;
  final double? longitude;

  CitizenFeedback copyWith({CitizenActionStatus? actionStatus}) {
    return CitizenFeedback(
      id: id,
      citizenName: citizenName,
      district: district,
      department: department,
      areaId: areaId,
      areaDescription: areaDescription,
      details: details,
      rating: rating,
      actionStatus: actionStatus ?? this.actionStatus,
      statusNote: statusNote,
      createdAt: createdAt,
      imageBytes: imageBytes,
      latitude: latitude,
      longitude: longitude,
    );
  }

  Map<String, dynamic> toMap() {
    return <String, dynamic>{
      'id': id,
      'citizenName': citizenName,
      'district': district,
      'department': department,
      'areaId': areaId,
      'areaDescription': areaDescription,
      'details': details,
      'rating': rating,
      'actionStatus': actionStatus.name,
      'statusNote': statusNote,
      'createdAt': createdAt.toIso8601String(),
      'imageBytes': imageBytes,
      'latitude': latitude,
      'longitude': longitude,
    };
  }

  factory CitizenFeedback.fromMap(Map<String, dynamic> map) {
    return CitizenFeedback(
      id: map['id'] as int,
      citizenName: map['citizenName'] as String,
      district: map['district'] as String,
      department: map['department'] as String,
      areaId: map['areaId'] as String? ?? '',
      areaDescription: map['areaDescription'] as String,
      details: map['details'] as String,
      rating: map['rating'] as int? ?? 0,
      actionStatus: CitizenActionStatus.values.firstWhere(
        (e) => e.name == map['actionStatus'],
        orElse: () => CitizenActionStatus.pending,
      ),
      statusNote: map['statusNote'] as String? ?? '',
      createdAt: DateTime.parse(map['createdAt'] as String),
      imageBytes: map['imageBytes'] as Uint8List?,
      latitude: (map['latitude'] as num?)?.toDouble(),
      longitude: (map['longitude'] as num?)?.toDouble(),
    );
  }
}
