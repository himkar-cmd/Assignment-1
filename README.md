# Zomato Clone - Full-Stack Logistics Coordination Platform

A comprehensive MERN stack application for managing food delivery logistics with separate dashboards for restaurants, riders, and administrators.

## video-Rec


[Screencast from 2025-06-01 12-08-22.webm](https://github.com/user-attachments/assets/0ef9098c-8840-4439-adab-478c40186c88)


## Features

### 🔐 Authentication System
- **Restaurant Registration**: Restaurant name, signature dish, manager email, password
- **Rider Registration**: Name, email, password
- **Admin Access**: Signup/Login for platform administration
- **JWT-based Authentication**: Secure token-based authentication

### 📦 Core Functionality

#### Restaurant Manager Dashboard
- Add and manage orders with order ID, items, and prep time
- View all orders with real-time status tracking
- Assign available delivery partners to orders
- Prevent double-assignment of riders
- Auto-calculated dispatch times

#### Rider Dashboard
- View assigned order details
- Sequential status updates: PREP → PICKED → ON_ROUTE → DELIVERED
- Real-time order progress tracking
- Automatic availability status management

#### Admin Dashboard
- View total restaurants registered
- Monitor active/available riders
- Platform-wide statistics and analytics
- Real-time metrics dashboard

### 🚀 Advanced Features
- **Real-time Updates**: Polling-based real-time status updates
- **Status Validation**: Sequential order status flow enforcement
- **Rider Availability**: Automatic rider status management
- **Visual Progress Tracking**: Interactive order status indicators
- **Responsive Design**: Mobile-friendly interface

## Tech Stack

### Frontend
- **React 18** with functional components and hooks
- **Next.js 14** with App Router
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **shadcn/ui** component library
- **Lucide React** for icons

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory**:
\`\`\`bash
cd backend
\`\`\`

Please add .env file which contain 
PORT="Your_Port"
MONGODB_URI="Your_Mongo_URI"
JWT_SECRET=="Secrets"
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="PUBLIC_API_KEY"
2. **Install dependencies**:
\`\`\`bash
npm install
\`\`\`

3. **Start MongoDB** (if running locally):
\`\`\`bash
mongod
\`\`\`

4. **Start the backend server**:
\`\`\`bash
npm run dev
\`\`\`

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. **Install dependencies** (from project root):
\`\`\`bash
npm install
\`\`\`

2. **Start the development server**:
\`\`\`bash
npm run dev
\`\`\`

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/restaurant-signup` - Register restaurant
- `POST /api/auth/rider-signup` - Register rider
- `POST /api/auth/admin-signup` - Register admin
- `POST /api/auth/login` - Login user

### Orders Management
- `GET /api/orders` - Get restaurant orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:orderId/assign` - Assign rider to order
- `PUT /api/orders/:orderId/status` - Update order status

### Riders
- `GET /api/riders/available` - Get available riders
- `GET /api/riders/:riderId/order` - Get rider's current order

### Admin
- `GET /api/admin/stats` - Get platform statistics

## Database Schema

### User Model
\`\`\`javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['admin', 'manager', 'rider'],
  createdAt: Date
}
\`\`\`

### Restaurant Model
\`\`\`javascript
{
  restaurantName: String,
  signatureDish: String,
  manager: ObjectId (User),
  createdAt: Date
}
\`\`\`

### Rider Model
\`\`\`javascript
{
  user: ObjectId (User),
  name: String,
  status: ['available', 'busy'],
  currentOrder: ObjectId (Order),
  createdAt: Date
}
\`\`\`

### Order Model
\`\`\`javascript
{
  orderId: String (unique),
  items: String,
  prepTime: Number,
  status: ['PREP', 'PICKED', 'ON_ROUTE', 'DELIVERED'],
  restaurant: ObjectId (Restaurant),
  assignedRider: ObjectId (Rider),
  dispatchTime: Date,
  createdAt: Date
}
\`\`\`

## Usage Guide

### For Restaurant Managers
1. Register your restaurant with name, signature dish, and manager details
2. Login to access the restaurant dashboard
3. Add orders with unique order IDs, items, and preparation time
4. Assign available riders to orders
5. Monitor order status in real-time

### For Riders
1. Register as a rider with your details
2. Login to access the rider dashboard
3. View assigned orders when available
4. Update order status sequentially through the delivery process
5. Become available for new orders after delivery completion

### For Administrators
1. Register or login as an admin
2. Access platform-wide statistics
3. Monitor total restaurants and riders
4. Track platform performance metrics

## Security Features

- **Password Hashing**: bcryptjs for secure password storage
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Different permissions for each user type
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests

## Real-time Features

- **Order Status Updates**: Automatic polling every 10-30 seconds
- **Rider Availability**: Real-time status updates
- **Dashboard Metrics**: Live statistics refresh
- **Status Synchronization**: Consistent state across all dashboards

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository or contact the development team.

---

**Note**: This is a demonstration project. For production use, additional security measures, error handling, and performance optimizations should be implemented.
