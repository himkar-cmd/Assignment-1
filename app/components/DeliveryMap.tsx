'use client'

import { useEffect, useState } from 'react'
import { GoogleMap, LoadScript, DirectionsRenderer, Marker } from '@react-google-maps/api'

interface Location {
  lat: number
  lng: number
  address: string
}

interface DeliveryMapProps {
  pickupLocation: Location
  deliveryLocation: Location
  isRider?: boolean
}

const DeliveryMap = ({ pickupLocation, deliveryLocation, isRider = false }: DeliveryMapProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)

  const mapContainerStyle = {
    width: '100%',
    height: '400px'
  }

  const center = {
    lat: (pickupLocation.lat + deliveryLocation.lat) / 2,
    lng: (pickupLocation.lng + deliveryLocation.lng) / 2
  }

  useEffect(() => {
    if (!map) return

    const directionsService = new google.maps.DirectionsService()

    directionsService.route(
      {
        origin: pickupLocation,
        destination: deliveryLocation,
        travelMode: google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK) {
          setDirections(result)
        } else {
          console.error(`Directions request failed: ${status}`)
        }
      }
    )
  }, [map, pickupLocation, deliveryLocation])

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={setMap}
      >
        {directions && <DirectionsRenderer directions={directions} />}
        {!directions && (
          <>
            <Marker
              position={pickupLocation}
              label="P"
              title="Pickup Location"
            />
            <Marker
              position={deliveryLocation}
              label="D"
              title="Delivery Location"
            />
          </>
        )}
      </GoogleMap>
    </LoadScript>
  )
}

export default DeliveryMap 