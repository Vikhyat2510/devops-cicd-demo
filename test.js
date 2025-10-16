// Simple test file for the application
const request = require('supertest');

// Create app without starting the server
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Main API endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to DevOps CI/CD Demo App! 🚀',
    version: '1.0.1',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    // Test commit to trigger CI/CD pipeline
    pipeline: 'GitHub Actions + Docker + Kubernetes'
  });
});

// API routes
app.get('/api/status', (req, res) => {
  res.json({
    status: 'success',
    data: {
      app: 'DevOps CI/CD Demo',
      version: '1.0.1',
      environment: process.env.NODE_ENV || 'development',
      nodeVersion: process.version,
      platform: process.platform
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

describe('DevOps CI/CD App', () => {
  test('GET / should return welcome message', async () => {
    const response = await request(app)
      .get('/')
      .expect(200);
    
    expect(response.body.message).toBe('Welcome to DevOps CI/CD Demo App! 🚀');
    expect(response.body.version).toBe('1.0.1');
  });

  test('GET /health should return health status', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('healthy');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });

  test('GET /api/status should return detailed status', async () => {
    const response = await request(app)
      .get('/api/status')
      .expect(200);
    
    expect(response.body.status).toBe('success');
    expect(response.body.data.app).toBe('DevOps CI/CD Demo');
    expect(response.body.data.version).toBe('1.0.1');
  });

  test('GET /nonexistent should return 404', async () => {
    const response = await request(app)
      .get('/nonexistent')
      .expect(404);
    
    expect(response.body.error).toBe('Route not found');
  });
});