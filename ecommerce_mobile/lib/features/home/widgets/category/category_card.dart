import 'package:flutter/material.dart';

class CategoryCard extends StatelessWidget {
  final String title;
  final String? icon;
  final bool isSelected;
  final VoidCallback onTap;

  const CategoryCard({
    super.key,
    required this.title,
    this.icon,
    required this.isSelected,
    required this.onTap,
  });

  bool _isImageUrl(String? value) {
    if (value == null) return false;
    return value.startsWith('http') || value.contains('.');
  }

  @override
  Widget build(BuildContext context) {
    final Color activeColor = Colors.blue;
    return Card(
      elevation: 0.5,
      color: Colors.white,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.all(16),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              if (_isImageUrl(icon))
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.network(
                    icon!,
                    width: 32,
                    height: 32,
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return const Text('📦', style: TextStyle(fontSize: 32));
                    },
                  ),
                )
              else
                Text(icon ?? '📦', style: const TextStyle(fontSize: 32)),
              const SizedBox(height: 12),
              Text(
                title,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                  color: isSelected ? activeColor : Colors.black87,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
