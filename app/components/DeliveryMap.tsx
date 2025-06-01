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
  onLocationSelect?: (location: Location) => void
}

const DeliveryMap = ({ pickupLocation, deliveryLocation, isRider = false, onLocationSelect }: DeliveryMapProps) => {
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null)

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  }

  const center = {
    lat: (pickupLocation.lat + deliveryLocation.lat) / 2 || 0,
    lng: (pickupLocation.lng + deliveryLocation.lng) / 2 || 0
  }

  useEffect(() => {
    if (!map) return

    const directionsService = new google.maps.DirectionsService()
    const geocoder = new google.maps.Geocoder()
    setGeocoder(geocoder)

    if (pickupLocation.lat && deliveryLocation.lat) {
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
    }
  }, [map, pickupLocation, deliveryLocation])

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!onLocationSelect || !e.latLng || !geocoder) return

    const lat = e.latLng.lat()
    const lng = e.latLng.lng()

    try {
      const response = await geocoder.geocode({
        location: { lat, lng }
      })

      if (response.results[0]) {
        onLocationSelect({
          lat,
          lng,
          address: response.results[0].formatted_address
        })
      }
    } catch (error) {
      console.error('Geocoding error:', error)
    }
  }

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={12}
        onLoad={setMap}
        onClick={handleMapClick}
      >
        {directions && <DirectionsRenderer directions={directions} />}
        {!directions && (
          <>
            <Marker
              position={pickupLocation}
              label="P"
              title="Pickup Location"
            />
            {deliveryLocation.lat !== 0 && (
              <Marker
                position={deliveryLocation}
                label="D"
                title="Delivery Location"
              />
            )}
          </>
        )}
      </GoogleMap>
    </LoadScript>
  )
}

export default DeliveryMap 