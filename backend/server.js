const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const { createServer } = require("http")
const { Server } = require("socket.io")
require("dotenv").config();

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT"],
    credentials: true
  }
})

// Middleware
app.use(cors())
app.use(express.json())

// Socket.IO Connection Handler
io.on("connection", (socket) => {
  console.log("Client connected:", socket.id)

  // Handle new orders
  socket.on("newOrder", (order) => {
    // Broadcast to all connected clients
    io.emit("orderStatusUpdate", order)
  })

  // Handle order status updates
  socket.on("orderStatusUpdate", (order) => {
    // Broadcast to all connected clients
    io.emit("orderStatusUpdate", order)
  })

  // Handle rider assignment
  socket.on("riderAssigned", (data) => {
    // Notify specific rider
    io.emit(`newOrderForRider:${data.riderId}`, data.order)
  })

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id)
  })
})

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["admin", "manager", "rider"], required: true },
  createdAt: { type: Date, default: Date.now },
})

// Restaurant Schema
const restaurantSchema = new mongoose.Schema({
  restaurantName: { type: String, required: true },
  signatureDish: { type: String, required: true },
  manager: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
})

// Rider Schema
const riderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  status: { type: String, enum: ["available", "busy"], default: "available" },
  currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
  createdAt: { type: Date, default: Date.now },
})

// Order Schema
const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  items: { type: String, required: true },
  prepTime: { type: Number, required: true },
  status: {
    type: String,
    enum: ["PREP", "PICKED", "ON_ROUTE", "DELIVERED"],
    default: "PREP",
  },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: "Restaurant", required: true },
  assignedRider: { type: mongoose.Schema.Types.ObjectId, ref: "Rider", default: null },
  dispatchTime: Date,
}, { timestamps: true })

// Models
const User = mongoose.model("User", userSchema)
const Restaurant = mongoose.model("Restaurant", restaurantSchema)
const Rider = mongoose.model("Rider", riderSchema)
const Order = mongoose.model("Order", orderSchema)

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-for-development"

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (!token) {
    return res.status(401).json({ message: "Access token required" })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Invalid token" })
    }
    req.user = user
    next()
  })
}

// Routes

// Restaurant Signup
app.post("/api/auth/restaurant-signup", async (req, res) => {
  try {
    const { restaurantName, signatureDish, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name: restaurantName,
      email,
      password: hashedPassword,
      role: "manager",
    })

    await user.save()

    // Create restaurant
    const restaurant = new Restaurant({
      restaurantName,
      signatureDish,
      manager: user._id,
    })

    await restaurant.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "Restaurant registered successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Restaurant signup error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Rider Signup
app.post("/api/auth/rider-signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "rider",
    })

    await user.save()

    // Create rider profile
    const rider = new Rider({
      user: user._id,
      name,
    })

    await rider.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "Rider registered successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Rider signup error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin Signup
app.post("/api/auth/admin-signup", async (req, res) => {
  try {
    const { name, email, password } = req.body

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create admin user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
    })

    await user.save()

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    res.status(201).json({
      message: "Admin registered successfully",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Admin signup error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user
    const user = await User.findOne({ email })
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    // Generate token
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: "24h" })

    res.json({
      message: "Login successful",
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    })
  } catch (error) {
    console.error("Login error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Orders (for restaurant managers)
app.get("/api/orders", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Find restaurant managed by this user
    const restaurant = await Restaurant.findOne({ manager: req.user.userId })
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Get orders for this restaurant
    const orders = await Order.find({ restaurant: restaurant._id })
      .populate("assignedRider", "name")
      .populate("restaurant", "restaurantName")
      .sort({ createdAt: -1 })

    res.json(orders)
  } catch (error) {
    console.error("Get orders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create Order
app.post("/api/orders", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { orderId, items, prepTime } = req.body

    // Validate required fields
    if (!orderId || !items || !prepTime) {
      return res.status(400).json({ message: "Order ID, items, and prep time are required" })
    }

    // Validate prep time
    if (prepTime < 1 || prepTime > 120) {
      return res.status(400).json({ message: "Prep time must be between 1 and 120 minutes" })
    }

    // Find restaurant
    const restaurant = await Restaurant.findOne({ manager: req.user.userId })
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" })
    }

    // Check if order ID already exists
    const existingOrder = await Order.findOne({ orderId })
    if (existingOrder) {
      return res.status(400).json({ message: "Order ID already exists" })
    }

    // Create order
    const order = new Order({
      orderId,
      items,
      prepTime: Number.parseInt(prepTime),
      restaurant: restaurant._id
    })

    await order.save()

    // Emit socket event for new order
    io.emit("newOrder", order)

    res.status(201).json({
      message: "Order created successfully",
      order
    })
  } catch (error) {
    console.error("Create order error:", error)
    res.status(500).json({ 
      message: "Failed to create order",
      error: error.message 
    })
  }
})

// Get Available Riders
app.get("/api/riders/available", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" })
    }

    const availableRiders = await Rider.find({ status: "available" }).populate("user", "name email")

    res.json(availableRiders)
  } catch (error) {
    console.error("Get available riders error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Assign Rider to Order
app.put("/api/orders/:orderId/assign", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "manager") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { orderId } = req.params
    const { riderId } = req.body

    if (!riderId) {
      return res.status(400).json({ message: "Rider ID is required" })
    }

    // Find order
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if order is already assigned
    if (order.assignedRider) {
      return res.status(400).json({ message: "Order already assigned" })
    }

    // Find rider
    const rider = await Rider.findById(riderId)
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" })
    }

    // Check if rider is available
    if (rider.status !== "available") {
      return res.status(400).json({ message: "Rider is not available" })
    }

    // Calculate dispatch time (prep time + estimated delivery time)
    const dispatchTime = new Date(Date.now() + (order.prepTime + 30) * 60000) // +30 min ETA

    // Assign rider to order
    order.assignedRider = riderId
    order.dispatchTime = dispatchTime
    await order.save()

    // Update rider status
    rider.status = "busy"
    rider.currentOrder = order._id
    await rider.save()

    // Emit socket event for real-time update
    io.emit("riderAssigned", { orderId, riderId, order })

    // Return the updated order with populated fields
    const updatedOrder = await Order.findById(orderId)
      .populate("assignedRider", "name")
      .populate("restaurant", "restaurantName")

    res.json({
      message: "Rider assigned successfully",
      order: updatedOrder
    })
  } catch (error) {
    console.error("Assign rider error:", error)
    res.status(500).json({ 
      message: "Failed to assign rider",
      error: error.message 
    })
  }
})

// Get Rider's Current Order
app.get("/api/riders/:riderId/order", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { riderId } = req.params

    // Find rider
    const rider = await Rider.findOne({ user: riderId })
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" })
    }

    // Get current order
    if (rider.currentOrder) {
      const order = await Order.findById(rider.currentOrder).populate("restaurant", "restaurantName")
      res.json(order)
    } else {
      res.json(null)
    }
  } catch (error) {
    console.error("Get rider order error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update Order Status
app.put("/api/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { orderId } = req.params
    const { status } = req.body

    // Validate status flow
    const validStatusFlow = {
      PREP: "PICKED",
      PICKED: "ON_ROUTE",
      ON_ROUTE: "DELIVERED",
    }

    // Find order
    const order = await Order.findById(orderId)
    if (!order) {
      return res.status(404).json({ message: "Order not found" })
    }

    // Check if status transition is valid
    if (validStatusFlow[order.status] !== status) {
      return res.status(400).json({ message: "Invalid status transition" })
    }

    // Update order status
    order.status = status
    if (status === "DELIVERED") {
      order.dispatchTime = new Date()
    }
    await order.save()

    // Emit socket event for real-time update
    io.emit("orderStatusUpdate", order)

    // If order is delivered, make rider available
    if (status === "DELIVERED") {
      const rider = await Rider.findById(order.assignedRider)
      if (rider) {
        rider.status = "available"
        rider.currentOrder = null
        await rider.save()
      }
    }

    res.json({
      message: "Order status updated successfully",
      order,
    })
  } catch (error) {
    console.error("Update order status error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Admin Stats
app.get("/api/admin/stats", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" })
    }

    const totalRestaurants = await Restaurant.countDocuments()
    const totalRiders = await Rider.countDocuments()
    const activeRiders = await Rider.countDocuments({ status: "available" })
    const totalOrders = await Order.countDocuments()

    res.json({
      totalRestaurants,
      totalRiders,
      activeRiders,
      totalOrders,
    })
  } catch (error) {
    console.error("Get admin stats error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get Rider's Completed Rides
app.get("/api/riders/:riderId/completed-rides", authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== "rider") {
      return res.status(403).json({ message: "Access denied" })
    }

    const { riderId } = req.params

    // Find rider
    const rider = await Rider.findOne({ user: riderId })
    if (!rider) {
      return res.status(404).json({ message: "Rider not found" })
    }

    // Find completed orders for this rider
    const completedOrders = await Order.find({
      assignedRider: rider._id,
      status: "DELIVERED"
    }).populate("restaurant", "restaurantName").sort({ updatedAt: -1 })

    res.json(completedOrders)
  } catch (error) {
    console.error("Get completed rides error:", error)
    res.status(500).json({ message: "Server error" })
  }
})

// Start server
const PORT = process.env.PORT || 5000
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

module.exports = app
