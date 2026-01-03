import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';

void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter → Node.js POST',
      home: SendMessageScreen(),
    );
  }
}

class SendMessageScreen extends StatefulWidget {
  @override
  _SendMessageScreenState createState() => _SendMessageScreenState();
}

class _SendMessageScreenState extends State<SendMessageScreen> {
  final _controller = TextEditingController();
  String _response = '';

  Future<void> _sendMessage() async {
    final url = Uri.parse('http://localhost:4000/pythonrequest'); // Update host
    try {
      final res = await http.post(
        url,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'msg': _controller.text}),
      );
      if (res.statusCode == 200) {
        setState(() {
          _response = res.body;
        });
      } else {
        setState(() {
          _response = 'Error: ${res.statusCode}';
        });
      }
    } catch (e) {
      setState(() {
        _response = 'Exception: $e';
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Send to Node.js')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: _controller, decoration: InputDecoration(labelText: 'Enter message')),
            SizedBox(height: 12),
            ElevatedButton(onPressed: _sendMessage, child: const Text('Send')),
            const SizedBox(height: 20),
            Text(_response),
          ],
        ),
      ),
    );
  }
}
