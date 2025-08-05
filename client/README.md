# Tech Society Question Bank Platform

A comprehensive MERN stack platform for managing question banks and assignments for tech society students learning C/C++.

## 🎯 Project Overview

This platform provides:
- **Question Bank Management**: Create, edit, and organize programming questions
- **Assignment Builder**: Build assignments from question pools with flexible scheduling
- **Student Progress Tracking**: Monitor completion rates, scores, and learning progress
- **Role-based Access**: Different interfaces for admins, mentors, and students
- **Rich Text Support**: Advanced question editor with image support
- **Real-time Feedback**: Instant scoring and progress updates

## 🏗️ Architecture

### Backend (Node.js + Express)
- **Authentication**: JWT-based with role-based access control
- **Database**: MongoDB with Mongoose ODM
- **File Storage**: Cloudinary for image uploads
- **API Design**: RESTful APIs with comprehensive validation
- **Security**: Helmet, CORS, rate limiting, input sanitization

### Frontend (React + Vite)
- **UI Framework**: React 18 with modern hooks
- **Styling**: Tailwind CSS with custom design system
- **State Management**: Context API + React Query for server state
- **Routing**: React Router v6 with protected routes
- **Forms**: React Hook Form with validation
- **Rich Text**: React Quill for question editing

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **MongoDB** (local installation or MongoDB Atlas)
- **Cloudinary Account** (for image storage)
- **Git**

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd tech-society-platform
```

### 2. Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your `.env` file:**

```bash
# Server Configuration
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/tech_society_db
# Or use MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/tech_society_db

# JWT Secret (use a strong, random string)
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_complex

# Cloudinary Configuration (create free account at cloudinary.com)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
CLIENT_URL=http://localhost:5173
```

**Start the backend server:**

```bash
# Development mode with auto-restart
npm run dev

# Or production mode
npm start
```

The server will start on `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to client directory (open new terminal)
cd client

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

**Configure your client `.env` file:**

```bash
# API Configuration
VITE_API_URL=http://localhost:5000/api

# App Configuration
VITE_APP_NAME=Tech Society
VITE_APP_VERSION=1.0.0

# Development
VITE_DEV_MODE=true
```

**Start the frontend development server:**

```bash
npm run dev
```

The client will start on `http://localhost:5173`

### 4. MongoDB Setup

#### Option A: Local MongoDB
1. Install MongoDB Community Edition
2. Start MongoDB service
3. The application will automatically create the database and collections

#### Option B: MongoDB Atlas (Recommended)
1. Create free account at [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a new cluster
3. Create database user and get connection string
4. Update `MONGODB_URI` in your `.env` file

### 5. Cloudinary Setup

1. Create free account at [Cloudinary](https://cloudinary.com/)
2. Go to Dashboard to find your credentials
3. Update your `.env` file with:
   - `CLOUDINARY_CLOUD_NAME`
   - `CLOUDINARY_API_KEY`
   - `CLOUDINARY_API_SECRET`

## 👥 User Roles & Demo Accounts

The platform supports three user roles:

### Admin
- **Email**: admin@techsociety.com
- **Password**: password123
- **Permissions**: Full system access, user management, platform analytics

### Mentor
- **Email**: mentor@techsociety.com  
- **Password**: password123
- **Permissions**: Create/edit questions and assignments, view student progress

### Student
- **Email**: student@techsociety.com
- **Password**: password123
- **Permissions**: Attempt assignments, view results, manage profile

## 📁 Project Structure

```
tech-society-platform/
├── server/                 # Backend Node.js application
│   ├── config/            # Database and Cloudinary configuration
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Authentication, validation, upload middleware
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── utils/            # Helper utilities
│   └── server.js         # Main server file
├── client/               # Frontend React application
│   ├── public/           # Static assets
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # React Context providers
│   │   ├── layouts/      # Page layouts
│   │   ├── pages/        # Page components
│   │   ├── services/     # API services
│   │   └── utils/        # Frontend utilities
│   └── package.json
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password

### Questions
- `GET /api/questions` - Get questions with filters
- `POST /api/questions` - Create question
- `GET /api/questions/:id` - Get question by ID
- `PUT /api/questions/:id` - Update question
- `DELETE /api/questions/:id` - Delete question

### Assignments
- `GET /api/assignments` - Get assignments
- `POST /api/assignments` - Create assignment
- `GET /api/assignments/:id` - Get assignment details
- `POST /api/assignments/:id/start` - Start assignment attempt

### Submissions
- `POST /api/submissions/:assignmentId/answer` - Submit answer
- `POST /api/submissions/:assignmentId/submit` - Submit assignment
- `GET /api/submissions/:id` - Get submission details

## 🎨 Features

### For Students
- ✅ View available assignments
- ✅ Attempt assignments with time tracking
- ✅ Real-time answer saving
- ✅ Progress tracking and score history
- ✅ Profile management

### For Mentors
- ✅ Rich question editor with image support
- ✅ Multiple question types (MCQ, MSQ, Coding, Descriptive)
- ✅ Assignment builder with drag-and-drop
- ✅ Student progress monitoring
- ✅ Bulk grading and feedback

### For Admins
- ✅ User management and role assignment
- ✅ Platform analytics and reporting
- ✅ Question bank oversight
- ✅ Assignment approval workflow

## 🛠️ Development

### Backend Development

```bash
cd server

# Install new dependency
npm install package-name

# Run with debugging
DEBUG=app:* npm run dev

# Run tests (when implemented)
npm test
```

### Frontend Development

```bash
cd client

# Install new dependency
npm install package-name

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🔧 Configuration

### Environment Variables

**Server (.env)**
```bash
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/tech_society_db
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLIENT_URL=http://localhost:5173
```

**Client (.env)**
```bash
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=Tech Society
VITE_APP_VERSION=1.0.0
```

## 🚢 Deployment

### Backend Deployment (e.g., Railway, Render, Heroku)

1. Push code to GitHub
2. Connect repository to deployment platform
3. Set environment variables
4. Deploy

### Frontend Deployment (e.g., Vercel, Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Set environment variables
4. Configure API URL for production

## 🐛 Troubleshooting

### Common Issues

**MongoDB Connection Error**
- Ensure MongoDB is running
- Check connection string format
- Verify network access (for Atlas)

**Cloudinary Upload Fails**
- Verify API credentials
- Check file size limits
- Ensure proper CORS settings

**Login Issues**
- Clear browser local storage
- Check JWT secret configuration
- Verify user exists in database

**Development Server Won't Start**
- Check if ports 5000 and 5173 are available
- Delete `node_modules` and run `npm install`
- Check Node.js version compatibility

## 📈 Next Steps

The current implementation provides a solid foundation. Here are some planned enhancements:

1. **Rich Question Editor**: Complete implementation with advanced formatting
2. **Code Execution**: Integrate code compilation and testing
3. **Real-time Features**: WebSocket integration for live updates
4. **Advanced Analytics**: Detailed reporting and insights
5. **Mobile App**: React Native mobile application
6. **Offline Support**: Progressive Web App features

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or need help:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information
4. Join our community discussions

---

**Happy coding! 🚀**

Built with ❤️ by the Tech Society team.