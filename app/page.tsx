"use client"

import React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Store, Bike, Shield, Eye, EyeOff } from "lucide-react"

export default function HomePage() {
  const [currentView, setCurrentView] = useState("landing")
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    restaurantName: "",
    signatureDish: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent, userType: string) => {
    e.preventDefault()

    try {
      const endpoint =
        userType === "restaurant"
          ? "/api/auth/restaurant-signup"
          : userType === "rider"
            ? "/api/auth/rider-signup"
            : "/api/auth/admin-signup"

      const payload =
        userType === "restaurant"
          ? {
              restaurantName: formData.restaurantName,
              signatureDish: formData.signatureDish,
              email: formData.email,
              password: formData.password,
            }
          : {
              name: formData.name,
              email: formData.email,
              password: formData.password,
            }

      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userId", data.user._id)

        // Redirect based on role
        if (data.user.role === "manager") {
          setCurrentView("restaurant-dashboard")
        } else if (data.user.role === "rider") {
          setCurrentView("rider-dashboard")
        } else if (data.user.role === "admin") {
          setCurrentView("admin-dashboard")
        }
      } else {
        alert(data.message || "Registration failed")
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("Registration failed. Please try again.")
    }
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        localStorage.setItem("token", data.token)
        localStorage.setItem("userRole", data.user.role)
        localStorage.setItem("userId", data.user._id)

        // Redirect based on role
        if (data.user.role === "manager") {
          setCurrentView("restaurant-dashboard")
        } else if (data.user.role === "rider") {
          setCurrentView("rider-dashboard")
        } else if (data.user.role === "admin") {
          setCurrentView("admin-dashboard")
        }
      } else {
        alert(data.message || "Login failed")
      }
    } catch (error) {
      console.error("Login error:", error)
      alert("Login failed. Please try again.")
    }
  }

  if (currentView === "restaurant-dashboard") {
    return <RestaurantDashboard />
  }

  if (currentView === "rider-dashboard") {
    return <RiderDashboard />
  }

  if (currentView === "admin-dashboard") {
    return <AdminDashboard />
  }

  if (currentView === "restaurant-signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Store className="w-6 h-6 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Open a Restaurant</CardTitle>
            <CardDescription>Register your restaurant on our platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, "restaurant")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="restaurantName">Restaurant Name</Label>
                <Input
                  id="restaurantName"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleInputChange}
                  placeholder="Enter restaurant name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signatureDish">Signature Dish</Label>
                <Input
                  id="signatureDish"
                  name="signatureDish"
                  value={formData.signatureDish}
                  onChange={handleInputChange}
                  placeholder="Enter signature dish"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Manager Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="manager@restaurant.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-orange-600 hover:bg-orange-700">
                Register Restaurant
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setCurrentView("landing")}>
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentView === "rider-signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
              <Bike className="w-6 h-6 text-blue-600" />
            </div>
            <CardTitle className="text-2xl">Join as Rider</CardTitle>
            <CardDescription>Start delivering with us today</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleSubmit(e, "rider")} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rider Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="rider@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Enter password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Register as Rider
              </Button>
              <Button type="button" variant="outline" className="w-full" onClick={() => setCurrentView("landing")}>
                Back to Home
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentView === "admin-signup") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-6 h-6 text-purple-600" />
            </div>
            <CardTitle className="text-2xl">Admin Access</CardTitle>
            <CardDescription>Platform administration panel</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Signup</TabsTrigger>
              </TabsList>
              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@platform.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Login as Admin
                  </Button>
                </form>
              </TabsContent>
              <TabsContent value="signup">
                <form onSubmit={(e) => handleSubmit(e, "admin")} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Admin Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter admin name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="admin@platform.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-purple-600 hover:bg-purple-700">
                    Register as Admin
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
            <Button type="button" variant="outline" className="w-full mt-4" onClick={() => setCurrentView("landing")}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            Food<span className="text-orange-600">Express</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">Complete logistics coordination platform for food delivery</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-orange-200"
            onClick={() => setCurrentView("restaurant-signup")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Store className="w-8 h-8 text-orange-600" />
              </div>
              <CardTitle className="text-xl">Open a Restaurant</CardTitle>
              <CardDescription>Register your restaurant and start managing orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-orange-600 hover:bg-orange-700">Get Started</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-blue-200"
            onClick={() => setCurrentView("rider-signup")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Bike className="w-8 h-8 text-blue-600" />
              </div>
              <CardTitle className="text-xl">I am a Rider</CardTitle>
              <CardDescription>Join our delivery network and start earning</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-blue-600 hover:bg-blue-700">Join Now</Button>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-shadow border-2 hover:border-purple-200 md:col-span-2 lg:col-span-1"
            onClick={() => setCurrentView("admin-signup")}
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle className="text-xl">Admin Access</CardTitle>
              <CardDescription>Platform administration and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full bg-purple-600 hover:bg-purple-700">Admin Panel</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-16 text-center">
          <div className="grid md:grid-cols-3 gap-8 max-w-3xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">500+</div>
              <div className="text-gray-600">Restaurants</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Active Riders</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">50K+</div>
              <div className="text-gray-600">Orders Delivered</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function RestaurantDashboard() {
  const [orders, setOrders] = useState([])
  const [riders, setRiders] = useState([])
  const [newOrder, setNewOrder] = useState({
    orderId: "",
    items: "",
    prepTime: "",
  })

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/orders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setOrders(data)
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
    }
  }

  const fetchAvailableRiders = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/riders/available", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setRiders(data)
      }
    } catch (error) {
      console.error("Error fetching riders:", error)
    }
  }

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newOrder),
      })

      if (response.ok) {
        setNewOrder({ orderId: "", items: "", prepTime: "" })
        fetchOrders()
        alert("Order added successfully!")
      }
    } catch (error) {
      console.error("Error adding order:", error)
    }
  }

  const assignRider = async (orderId: string, riderId: string) => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/assign`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ riderId }),
      })

      if (response.ok) {
        fetchOrders()
        fetchAvailableRiders()
        alert("Rider assigned successfully!")
      }
    } catch (error) {
      console.error("Error assigning rider:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusColors = {
      PREP: "bg-yellow-100 text-yellow-800",
      PICKED: "bg-blue-100 text-blue-800",
      ON_ROUTE: "bg-purple-100 text-purple-800",
      DELIVERED: "bg-green-100 text-green-800",
    }
    return statusColors[status as keyof typeof statusColors] || "bg-gray-100 text-gray-800"
  }

  React.useEffect(() => {
    fetchOrders()
    fetchAvailableRiders()

    // Poll for updates every 30 seconds
    const interval = setInterval(() => {
      fetchOrders()
      fetchAvailableRiders()
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Restaurant Dashboard</h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Add New Order</CardTitle>
                <CardDescription>Create a new order for delivery</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddOrder} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Order ID</Label>
                    <Input
                      id="orderId"
                      value={newOrder.orderId}
                      onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                      placeholder="ORD-001"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="items">Items</Label>
                    <Input
                      id="items"
                      value={newOrder.items}
                      onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                      placeholder="2x Burger, 1x Fries"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="prepTime">Prep Time (minutes)</Label>
                    <Input
                      id="prepTime"
                      type="number"
                      value={newOrder.prepTime}
                      onChange={(e) => setNewOrder({ ...newOrder, prepTime: e.target.value })}
                      placeholder="15"
                      min="1"
                      max="120"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Add Order
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Orders Management</CardTitle>
                <CardDescription>Track and manage all your orders</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Order ID</th>
                        <th className="text-left py-2">Items</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-left py-2">Prep Time</th>
                        <th className="text-left py-2">Rider</th>
                        <th className="text-left py-2">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map((order: any) => (
                        <tr key={order._id} className="border-b">
                          <td className="py-3 font-medium">{order.orderId}</td>
                          <td className="py-3">{order.items}</td>
                          <td className="py-3">
                            <Badge className={getStatusBadge(order.status)}>{order.status}</Badge>
                          </td>
                          <td className="py-3">{order.prepTime}m</td>
                          <td className="py-3">{order.assignedRider ? order.assignedRider.name : "Unassigned"}</td>
                          <td className="py-3">
                            {!order.assignedRider && riders.length > 0 && (
                              <select
                                onChange={(e) => assignRider(order._id, e.target.value)}
                                className="text-sm border rounded px-2 py-1"
                                defaultValue=""
                              >
                                <option value="" disabled>
                                  Assign Rider
                                </option>
                                {riders.map((rider: any) => (
                                  <option key={rider._id} value={rider._id}>
                                    {rider.name}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {orders.length === 0 && (
                    <div className="text-center py-8 text-gray-500">No orders yet. Add your first order above.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

function RiderDashboard() {
  const [assignedOrder, setAssignedOrder] = useState(null)
  const [riderStatus, setRiderStatus] = useState("available")

  const fetchAssignedOrder = async () => {
    try {
      const token = localStorage.getItem("token")
      const riderId = localStorage.getItem("userId")
      const response = await fetch(`http://localhost:5000/api/riders/${riderId}/order`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok && data) {
        setAssignedOrder(data)
        setRiderStatus("busy")
      } else {
        setAssignedOrder(null)
        setRiderStatus("available")
      }
    } catch (error) {
      console.error("Error fetching assigned order:", error)
    }
  }

  const updateOrderStatus = async (newStatus: string) => {
    if (!assignedOrder) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`http://localhost:5000/api/orders/${(assignedOrder as any)._id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        if (newStatus === "DELIVERED") {
          setAssignedOrder(null)
          setRiderStatus("available")
        } else {
          fetchAssignedOrder()
        }
        alert(`Order status updated to ${newStatus}`)
      }
    } catch (error) {
      console.error("Error updating order status:", error)
    }
  }

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      PREP: "PICKED",
      PICKED: "ON_ROUTE",
      ON_ROUTE: "DELIVERED",
    }
    return statusFlow[currentStatus as keyof typeof statusFlow]
  }

  const getStatusProgress = (status: string) => {
    const statusOrder = ["PREP", "PICKED", "ON_ROUTE", "DELIVERED"]
    const currentIndex = statusOrder.indexOf(status)
    return ((currentIndex + 1) / statusOrder.length) * 100
  }

  React.useEffect(() => {
    fetchAssignedOrder()

    // Poll for updates every 10 seconds
    const interval = setInterval(fetchAssignedOrder, 10000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Rider Dashboard</h1>
            <div className="flex items-center gap-4">
              <Badge
                className={riderStatus === "available" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
              >
                {riderStatus === "available" ? "Available" : "Busy"}
              </Badge>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.clear()
                  window.location.reload()
                }}
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {assignedOrder ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Current Assignment</CardTitle>
                <CardDescription>Order details and status management</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Order ID</Label>
                    <div className="text-lg font-semibold">{(assignedOrder as any).orderId}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Items</Label>
                    <div className="text-lg">{(assignedOrder as any).items}</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Prep Time</Label>
                    <div className="text-lg">{(assignedOrder as any).prepTime} minutes</div>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-gray-500">Restaurant</Label>
                    <div className="text-lg">{(assignedOrder as any).restaurant?.restaurantName || "N/A"}</div>
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-500 mb-2 block">Order Progress</Label>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getStatusProgress((assignedOrder as any).status)}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span className={(assignedOrder as any).status === "PREP" ? "font-semibold text-blue-600" : ""}>
                      Preparing
                    </span>
                    <span className={(assignedOrder as any).status === "PICKED" ? "font-semibold text-blue-600" : ""}>
                      Picked Up
                    </span>
                    <span className={(assignedOrder as any).status === "ON_ROUTE" ? "font-semibold text-blue-600" : ""}>
                      On Route
                    </span>
                    <span
                      className={(assignedOrder as any).status === "DELIVERED" ? "font-semibold text-blue-600" : ""}
                    >
                      Delivered
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">Current Status:</span>
                    <Badge
                      className={`${
                        (assignedOrder as any).status === "PREP"
                          ? "bg-yellow-100 text-yellow-800"
                          : (assignedOrder as any).status === "PICKED"
                            ? "bg-blue-100 text-blue-800"
                            : (assignedOrder as any).status === "ON_ROUTE"
                              ? "bg-purple-100 text-purple-800"
                              : "bg-green-100 text-green-800"
                      }`}
                    >
                      {(assignedOrder as any).status}
                    </Badge>
                  </div>

                  {(assignedOrder as any).status !== "DELIVERED" && (
                    <Button
                      onClick={() => updateOrderStatus(getNextStatus((assignedOrder as any).status))}
                      className="w-full"
                      size="lg"
                    >
                      Mark as {getNextStatus((assignedOrder as any).status)}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-md mx-auto text-center">
            <Card>
              <CardContent className="py-12">
                <Bike className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Orders</h3>
                <p className="text-gray-600 mb-6">
                  You're currently available for new deliveries. Orders will appear here when assigned.
                </p>
                <Badge className="bg-green-100 text-green-800">Available for Delivery</Badge>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

function AdminDashboard() {
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalRiders: 0,
    activeRiders: 0,
    totalOrders: 0,
  })

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://localhost:5000/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      const data = await response.json()
      if (response.ok) {
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  React.useEffect(() => {
    fetchStats()

    // Refresh stats every minute
    const interval = setInterval(fetchStats, 60000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <Button
              variant="outline"
              onClick={() => {
                localStorage.clear()
                window.location.reload()
              }}
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Restaurants</CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRestaurants}</div>
              <p className="text-xs text-muted-foreground">Registered on platform</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Riders</CardTitle>
              <Bike className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRiders}</div>
              <p className="text-xs text-muted-foreground">Registered riders</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Riders</CardTitle>
              <Badge className="h-4 w-4 bg-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRiders}</div>
              <p className="text-xs text-muted-foreground">Currently available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
              <p className="text-xs text-muted-foreground">All time orders</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
              <CardDescription>Key metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Restaurant Utilization</span>
                  <span className="text-sm text-gray-600">
                    {stats.totalRestaurants > 0
                      ? Math.round((stats.totalOrders / stats.totalRestaurants) * 100) / 100
                      : 0}{" "}
                    orders/restaurant
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Rider Availability</span>
                  <span className="text-sm text-gray-600">
                    {stats.totalRiders > 0 ? Math.round((stats.activeRiders / stats.totalRiders) * 100) : 0}% available
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Platform Status</span>
                  <Badge className="bg-green-100 text-green-800">Operational</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Administrative tools and controls</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Store className="mr-2 h-4 w-4" />
                  Manage Restaurants
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Bike className="mr-2 h-4 w-4" />
                  Manage Riders
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Shield className="mr-2 h-4 w-4" />
                  View All Orders
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={fetchStats}>
                  <Badge className="mr-2 h-4 w-4" />
                  Refresh Stats
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
