import { useState, useEffect } from 'react'
import toast, { Toaster } from 'react-hot-toast'

const RestaurantDashboard = () => {
  const [orders, setOrders] = useState([])
  const [availableRiders, setAvailableRiders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [newOrder, setNewOrder] = useState({
    orderId: '',
    items: '',
    prepTime: ''
  })

  useEffect(() => {
    fetchOrders()
    fetchAvailableRiders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setOrders(data)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('Failed to fetch orders')
    }
  }

  const fetchAvailableRiders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/riders/available', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      const data = await response.json()
      setAvailableRiders(data)
    } catch (error) {
      console.error('Error fetching riders:', error)
      toast.error('Failed to fetch available riders')
    }
  }

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate form fields
    if (!newOrder.orderId || !newOrder.items || !newOrder.prepTime) {
      toast.error('Please fill in all order details')
      return
    }

    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          orderId: newOrder.orderId,
          items: newOrder.items,
          prepTime: newOrder.prepTime
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create order")
      }

      setOrders([...orders, data.order])
      setNewOrder({ orderId: '', items: '', prepTime: '' })
      toast.success('Order created successfully')
    } catch (error) {
      console.error("Error creating order:", error)
      toast.error(error instanceof Error ? error.message : "Failed to create order. Please try again.")
    }
  }

  const handleAssignRider = async (orderId: string, riderId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ riderId })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to assign rider")
      }

      // Update the orders list with the assigned rider
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId ? { ...order, assignedRider: data.order.assignedRider } : order
        )
      )

      // Close the modal
      setSelectedOrder(null)
      toast.success('Rider assigned successfully')
    } catch (error) {
      console.error("Error assigning rider:", error)
      toast.error(error instanceof Error ? error.message : "Failed to assign rider. Please try again.")
    }
  }

  return (
    <div className="p-4">
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            theme: {
              primary: '#4aed88',
            },
          },
          error: {
            duration: 4000,
            theme: {
              primary: '#ff4b4b',
            },
          },
        }}
      />
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Create New Order</h2>
        <form onSubmit={handleCreateOrder} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Order ID</label>
              <input
                type="text"
                value={newOrder.orderId}
                onChange={(e) => setNewOrder({ ...newOrder, orderId: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Items</label>
              <input
                type="text"
                value={newOrder.items}
                onChange={(e) => setNewOrder({ ...newOrder, items: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Prep Time (minutes)</label>
              <input
                type="number"
                value={newOrder.prepTime}
                onChange={(e) => setNewOrder({ ...newOrder, prepTime: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                min="1"
                max="120"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Create Order
          </button>
        </form>
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Orders</h2>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p><strong>Order ID:</strong> {order.orderId}</p>
                  <p><strong>Items:</strong> {order.items}</p>
                  <p><strong>Prep Time:</strong> {order.prepTime} minutes</p>
                  <p><strong>Status:</strong> {order.status}</p>
                  {order.assignedRider && (
                    <p><strong>Assigned Rider:</strong> {order.assignedRider.name}</p>
                  )}
                </div>
                {!order.assignedRider && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Assign Rider
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-xl font-bold mb-4">Assign Rider</h2>
            
            {/* Available Riders */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Available Riders</h3>
              <div className="space-y-2">
                {availableRiders.map((rider) => (
                  <div
                    key={rider._id}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div>
                      <p className="font-medium">{rider.name}</p>
                      <p className="text-sm text-gray-600">{rider.email}</p>
                    </div>
                    <button
                      onClick={() => handleAssignRider(selectedOrder._id, rider._id)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      Assign
                    </button>
                  </div>
                ))}
                {availableRiders.length === 0 && (
                  <p className="text-gray-500">No riders available at the moment</p>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedOrder(null)}
              className="mt-4 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default RestaurantDashboard 