import { useEffect, useState } from 'react'
import { Stack, Title, Alert, Loader, Center } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { listBookings, ApiError } from '../../api/client'
import type { Booking } from '../../api/client'
import BookingTable from '../../components/BookingTable'

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listBookings()
      .then(setBookings)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.body.message)
        } else {
          setError('Failed to load bookings')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <Stack>
      <Title order={2}>Bookings</Title>
      {loading ? (
        <Center h={200}>
          <Loader />
        </Center>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      ) : (
        <BookingTable bookings={bookings} />
      )}
    </Stack>
  )
}
