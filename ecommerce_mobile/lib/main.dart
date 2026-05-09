import 'package:flutter/material.dart';
import 'features/home/pages/home_page.dart';
import 'filter_page.dart';

void main() {
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'NEXAMART - Ecommerce Marketplace',
      theme: ThemeData(
        useMaterial3: true,
        primarySwatch: Colors.blue,
        primaryColor: Colors.blue,
        scaffoldBackgroundColor: const Color(0xFFF8F9FB),
        appBarTheme: const AppBarTheme(
          elevation: 1,
          backgroundColor: Colors.white,
          foregroundColor: Colors.black,
        ),
        cardTheme: const CardThemeData(
          elevation: 2,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(12)),
          ),
        ),
      ),
      debugShowCheckedModeBanner: false,
      initialRoute: '/',
      routes: {
        '/': (context) => const HomePage(),
        '/filter': (context) => const FilterPage(),
      },
    );
  }
}
