import 'package:flutter/material.dart';

class StarRatingPicker extends StatelessWidget {
  const StarRatingPicker({
    super.key,
    required this.rating,
    required this.onChanged,
    this.size = 28,
  });

  final int rating;
  final ValueChanged<int> onChanged;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Wrap(
      spacing: 4,
      children: List.generate(5, (index) {
        final value = index + 1;
        return InkWell(
          borderRadius: BorderRadius.circular(20),
          onTap: () => onChanged(value),
          child: Icon(
            value <= rating ? Icons.star : Icons.star_border,
            size: size,
            color: value <= rating ? const Color(0xFFF4A261) : Colors.grey,
          ),
        );
      }),
    );
  }
}

class StarRatingView extends StatelessWidget {
  const StarRatingView({super.key, required this.rating, this.size = 18});

  final int rating;
  final double size;

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        final value = index + 1;
        return Icon(
          value <= rating ? Icons.star : Icons.star_border,
          size: size,
          color: value <= rating ? const Color(0xFFF4A261) : Colors.grey,
        );
      }),
    );
  }
}
