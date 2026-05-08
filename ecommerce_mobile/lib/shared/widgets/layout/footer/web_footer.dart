import 'package:flutter/material.dart';

class WebFooter extends StatelessWidget {
  const WebFooter({super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 24),
      color: Colors.grey.shade200,
      child: const Center(
        child: Text(
          '© 2026 NexaMart. All rights reserved.',
          style: TextStyle(fontSize: 14, color: Colors.black54),
        ),
      ),
    );
  }
}
