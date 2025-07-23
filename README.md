# 🤖 Giorgio - Advanced AI Assistant

**A futuristic mobile-only AI assistant with voice interactions, semantic memory, and cutting-edge technology stack.**

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=for-the-badge&logo=Capacitor&logoColor=white)](https://capacitorjs.com/)

---

## 🌟 Features

### 🎤 **Advanced Voice Processing**
- **Multi-Engine TTS**: Google Gemini, ElevenLabs, and native device TTS
- **Intelligent Routing**: Automatic engine selection based on user preferences
- **Speech-to-Text**: Real-time audio transcription using Google Gemini multimodal API
- **Voice Waveform Feedback**: Visual feedback during voice interactions

### 🧠 **Semantic Memory System**
- **Vector Database**: Qdrant-powered semantic memory with embeddings
- **Automatic Memory Extraction**: AI-powered information extraction from conversations
- **Contextual Responses**: Personalized AI responses based on user memory
- **Memory Categories**: Personal, preferences, work, relationships, and goals

### 🤖 **AI-Powered Conversations**
- **Giorgio Personality**: JARVIS-inspired British butler with refined elegance
- **Multi-Language Support**: Automatic language detection and response adaptation
- **Tool Integration**: Web search, todo management, and memory tools
- **LangChain Integration**: Advanced AI agent with tool routing

### 📱 **Mobile-First Design**
- **Native iOS/Android**: Capacitor-powered native mobile applications
- **Futuristic UI**: Sci-fi inspired interface with holographic effects
- **Progressive Web App**: PWA capabilities with offline support
- **Touch-Optimized**: Mobile-specific interactions and layouts

### 🔐 **Enterprise-Grade Security**
- **JWT Authentication**: Dual-token system with automatic refresh
- **User Management**: Secure registration, login, and profile management  
- **API Protection**: Protected endpoints with role-based access
- **Data Encryption**: Secure data storage and transmission

---

## 🏗️ Architecture

Giorgio is built as a **full-stack TypeScript monorepo** with separate frontend and backend applications:

```
giorgio/
├── frontend/          # React mobile application (Capacitor)
├── backend/           # NestJS API server
├── docker-compose.yml # Infrastructure services
└── README.md          # This file
```

### 🎯 **Technology Stack**

#### Frontend (Mobile Application)
- **Framework**: React 18 with TypeScript
- **Build System**: Vite with SWC for lightning-fast compilation
- **Mobile Platform**: Capacitor for native iOS/Android deployment
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Zustand + TanStack Query for optimal performance
- **Voice Integration**: Native TextToSpeech + MediaRecorder APIs
- **Error Tracking**: Sentry integration for production monitoring

#### Backend (API Server)
- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: LangChain + Google Gemini AI models
- **Vector Database**: Qdrant for semantic memory storage
- **File Storage**: S3/MinIO compatible object storage
- **Voice Processing**: Multi-provider TTS (Google, ElevenLabs)
- **Search Integration**: Tavily for real-time web information

#### Infrastructure
- **Database**: MongoDB 8.0 for conversations and user data
- **Vector Store**: Qdrant 1.x for semantic memory
- **Object Storage**: MinIO for file management
- **Containerization**: Docker Compose for development
- **Authentication**: JWT with automatic token refresh

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **Docker & Docker Compose**
- **iOS Development**: Xcode 14+ (for iOS builds)
- **Android Development**: Android Studio (for Android builds)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/giorgio.git
cd giorgio
```

### 2. Start Infrastructure Services
```bash
# Start MongoDB, Qdrant, and MinIO
docker-compose up -d

# Verify services are running
docker-compose ps
```

### 3. Backend Setup
```bash
cd backend

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your API keys and configuration

# Start development server
npm run start:dev
```

### 4. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# For mobile development
npm run cap:build        # Build and sync with Capacitor
npx cap open ios         # Open iOS project in Xcode
npx cap open android     # Open Android project in Android Studio
```

---

## 📦 Environment Configuration

### Backend Environment Variables
```bash
# Database Configuration
MONGODB_URI=mongodb://admin:password@localhost:27017/giorgio?authSource=admin
QDRANT_HOST=localhost
QDRANT_PORT=6333

# AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here

# Authentication
JWT_ACCESS_SECRET=your_jwt_access_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret
JWT_ACCESS_EXPIRATION=5m
JWT_REFRESH_EXPIRATION=7d

# File Storage (S3/MinIO)
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin123
S3_DEFAULT_BUCKET=giorgio-storage

# External APIs
TAVILY_API_KEY=your_tavily_api_key_here
```

### Frontend Configuration
```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000
VITE_SENTRY_DSN=your_sentry_dsn_here
```

---

## 🛠️ Development

### Available Commands

#### Frontend Commands
```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run preview          # Preview production build

# Mobile Development
npm run cap:build        # Build and sync with Capacitor
npm run cap:open:ios     # Open iOS project in Xcode
npm run cap:open:android # Open Android project in Android Studio
npm run cap:run:ios      # Run on iOS device/simulator
npm run cap:run:android  # Run on Android device/emulator

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format code with Prettier
```

#### Backend Commands
```bash
# Development
npm run start:dev        # Start development server with hot reload
npm run start:debug      # Start with debugging enabled
npm run build            # Build for production
npm run start:prod       # Start production server

# Testing
npm run test             # Run unit tests
npm run test:e2e         # Run end-to-end tests
npm run test:cov         # Run tests with coverage

# Code Quality
npm run lint             # Run ESLint with auto-fix
npm run format           # Format code with Prettier
```

### Infrastructure Commands
```bash
# Docker Services
docker-compose up -d     # Start all services
docker-compose down      # Stop all services
docker-compose logs -f   # Follow logs

# Individual Services
docker-compose up mongodb    # Start only MongoDB
docker-compose up qdrant     # Start only Qdrant
docker-compose up minio      # Start only MinIO
```

---

## 🏭 Production Deployment

### Docker Build
```bash
# Backend
cd backend
docker build -t giorgio-backend .

# Frontend (for web deployment)
cd frontend
npm run build
# Deploy dist/ to your static hosting service
```

### Mobile App Store Deployment
```bash
cd frontend

# iOS App Store
npm run cap:build
npx cap open ios
# Use Xcode to archive and upload to App Store Connect

# Google Play Store
npm run cap:build
npx cap open android
# Use Android Studio to build signed APK/AAB
```

### Environment-Specific Configurations
- **Development**: Local Docker services
- **Staging**: Cloud MongoDB, managed Qdrant
- **Production**: Kubernetes deployment with auto-scaling

---

## 🔧 API Documentation

### Authentication Endpoints
```typescript
POST /auth/register     # User registration
POST /auth/login        # User login
POST /auth/refresh      # Token refresh
POST /auth/logout       # User logout
GET  /auth/me          # Get current user
```

### AI Agent Endpoints
```typescript
POST /giorgio/chat                    # Send message to Giorgio
GET  /giorgio/conversations           # List user conversations
GET  /giorgio/conversations/:threadId # Get specific conversation
```

### Voice Processing Endpoints
```typescript
POST /voice/speech-to-text  # Convert audio to text
POST /voice/text-to-speech  # Convert text to speech
```

### Todo List Management Endpoints
```typescript
GET    /todo-lists                    # Get all user todo lists
POST   /todo-lists                    # Create new todo list
GET    /todo-lists/:id                # Get specific todo list
PUT    /todo-lists/:id                # Update todo list
DELETE /todo-lists/:id                # Delete todo list

POST   /todo-lists/:listId/tasks      # Add task to todo list
PUT    /todo-lists/:listId/tasks/:taskId    # Update task
PATCH  /todo-lists/:listId/tasks/:taskId/toggle  # Toggle task completion
DELETE /todo-lists/:listId/tasks/:taskId    # Delete task
```

---

## 🧪 Testing

### Unit Tests
```bash
# Backend
cd backend
npm run test

# Frontend
cd frontend
npm run test
```

### End-to-End Tests
```bash
# Backend E2E
cd backend
npm run test:e2e

# Mobile E2E (requires device/simulator)
cd frontend
npm run cap:run:ios
# Run tests in Xcode
```

### Performance Testing
```bash
# Memory system performance
cd backend
npm run test:performance

# Load testing with Artillery
npm install -g artillery
artillery run load-test.yml
```

---

## 📊 Monitoring & Analytics

### Error Tracking
- **Frontend**: Sentry integration for error tracking and performance monitoring
- **Backend**: Structured logging with Winston and error reporting

### Performance Monitoring
- **Database**: MongoDB performance insights and query optimization
- **Vector Search**: Qdrant metrics and search performance
- **API**: Response time monitoring and rate limiting

### Analytics
- **User Engagement**: Conversation metrics and voice usage analytics
- **AI Performance**: Response quality and tool usage statistics
- **Mobile Metrics**: App usage patterns and crash reporting

---

## 🤝 Contributing

### Development Workflow
1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards
- **TypeScript**: Strict type checking enabled
- **ESLint**: Consistent code style enforcement
- **Prettier**: Automatic code formatting
- **Conventional Commits**: Standardized commit messages

### Testing Requirements
- **Unit Tests**: Required for all new features
- **Integration Tests**: Required for API endpoints
- **E2E Tests**: Required for critical user flows

---

## 🙏 Acknowledgments

### Technologies & Libraries
- **OpenAI & Google**: AI model providers
- **LangChain**: AI agent framework
- **Qdrant**: Vector database technology
- **Capacitor**: Cross-platform mobile development
- **shadcn/ui**: Beautiful UI components

### Inspiration
- **JARVIS** (Marvel): AI assistant personality inspiration
- **Sci-Fi Interface Design**: Futuristic UI/UX inspiration
- **Modern AI Assistants**: Conversational AI best practices

---

<div align="center">

**Live Demo**: [giorgio.fumarola.dev](https://giorgio.fumarola.dev)

</div>