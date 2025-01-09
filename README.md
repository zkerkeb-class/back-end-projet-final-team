# Backend Project Setup Checklist

### Framework

- [x] Create basic server configuration
- [ ] Set up middleware
  - [x] CORS
  - [ ] Helmet for security
  - [~] Rate limiting
  - [ ] JSON parsing

## 💾 Database Configuration

### PostgreSQL Setup

- [x] Install PostgreSQL
- [x] Create database
- [x] Configure database connection
- [x] Set up Sequelize ORM
  - [x] Create database models
  - [ ] Configure migrations
  - [x] Set up associations

## 🚦 Caching System

### Redis Setup

- [ ] Install Redis
- [ ] Configure Redis connection
- [ ] Implement caching strategies
  - [ ] Query caching
  - [ ] Session caching
  - [ ] Rate limiting

## ☁️ Cloud Services

### CDN Configuration

- [x] Choose CDN (CloudFront/CloudFlare)
- [x] Configure CDN settings
- [x] Set up content distribution

### Cloud Storage

- [x] Set up AWS S3 (or equivalent)
- [x] Configure storage bucket
- [ ] Implement file upload/download services
- [x] Set up access permissions

## 🧪 Testing

### Jest Configuration

- [ ] Configure test environment
- [ ] Create test files
  - [ ] Unit tests
  - [ ] Integration tests
  - [ ] API endpoint tests
- [ ] Set up test coverage reporting

## 📄 API Documentation

### Swagger/OpenAPI

- [x] Create Swagger configuration
- [x] Document API endpoints
  - [x] Request schemas
  - [x] Response models
  - [ ] Authentication methods

## 🔐 Security

- [x] Implement authentication middleware
- [x] Set up JWT token management
- [x] Create password hashing utility
- [x] Implement role-based access control
- [x] Add input validation
- [ ] Configure CORS policies

## 📦 Deployment Preparation

- [ ] Create Dockerfile
- [ ] Set up docker-compose
- [ ] Configure CI/CD pipeline
  - [ ] GitHub Actions
  - [ ] GitLab CI
  - [ ] Jenkins

## 📝 Documentation

- [x] Document API endpoints
- [ ] Add setup instructions
- [ ] List environment requirements

## 🔍 Monitoring & Logging

- [x] Set up Winston logging
- [x] Configure Morgan for HTTP logging
- [x] Implement error tracking
- [ ] Set up performance monitoring

## 🚧 Advanced Features

- [ ] WebSocket support
- [x] GraphQL endpoint
- [ ] Microservices architecture (option)
- [ ] Serverless deployment options

---

### 📌 Quick Start

```bash
# Clone the repository
git clone https://github.com/zkerkeb-class/back-end-projet-final-team.git

# Install dependencies
npm install

# Edit .env with your configurations

# Launch the database with docker compose. You can find the credentials for pgAdmin in ./db-compose 
npm run dev:db

# Seed the database with fake data
npm run seed

# Run development server
npm run dev

# Run tests
npm test
```
