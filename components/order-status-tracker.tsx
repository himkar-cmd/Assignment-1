import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, Truck, Package } from "lucide-react"

interface OrderStatusTrackerProps {
  currentStatus: "PREP" | "PICKED" | "ON_ROUTE" | "DELIVERED"
  className?: string
}

export function OrderStatusTracker({ currentStatus, className = "" }: OrderStatusTrackerProps) {
  const statuses = [
    { key: "PREP", label: "Preparing", icon: Clock },
    { key: "PICKED", label: "Picked Up", icon: Package },
    { key: "ON_ROUTE", label: "On Route", icon: Truck },
    { key: "DELIVERED", label: "Delivered", icon: CheckCircle },
  ]

  const currentIndex = statuses.findIndex((status) => status.key === currentStatus)

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        {statuses.map((status, index) => {
          const Icon = status.icon
          const isActive = index <= currentIndex
          const isCurrent = index === currentIndex

          return (
            <div key={status.key} className="flex flex-col items-center flex-1">
              <div
                className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors
                ${isActive ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-300 text-gray-400"}
                ${isCurrent ? "ring-4 ring-blue-200" : ""}
              `}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span
                className={`
                text-xs mt-2 text-center
                ${isActive ? "text-blue-600 font-medium" : "text-gray-500"}
              `}
              >
                {status.label}
              </span>
              {index < statuses.length - 1 && (
                <div
                  className={`
                  absolute h-0.5 w-full top-5 left-1/2 transform -translate-y-1/2
                  ${index < currentIndex ? "bg-blue-600" : "bg-gray-300"}
                `}
                  style={{ zIndex: -1 }}
                />
              )}
            </div>
          )
        })}
      </div>

      <div className="text-center">
        <Badge
          className={`
            ${currentStatus === "PREP" ? "bg-yellow-100 text-yellow-800" : ""}
            ${currentStatus === "PICKED" ? "bg-blue-100 text-blue-800" : ""}
            ${currentStatus === "ON_ROUTE" ? "bg-purple-100 text-purple-800" : ""}
            ${currentStatus === "DELIVERED" ? "bg-green-100 text-green-800" : ""}
          `}
        >
          {currentStatus.replace("_", " ")}
        </Badge>
      </div>
    </div>
  )
}
