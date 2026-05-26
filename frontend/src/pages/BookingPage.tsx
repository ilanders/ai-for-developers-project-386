import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Stack, Title, Text, Alert, Loader, Center, Paper } from '@mantine/core'
import { IconAlertCircle, IconCircleCheck } from '@tabler/icons-react'
import { getFreeSlots, ApiError } from '../api/client'
import type { Slot } from '../api/client'
import SlotPicker from '../components/SlotPicker'
import BookingForm from '../components/BookingForm'

export default function BookingPage() {
  const { eventTypeId } = useParams<{ eventTypeId: string }>()
  const [slots, setSlots] = useState<Slot[]>([])
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!eventTypeId) return
    getFreeSlots(eventTypeId)
      .then(setSlots)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.body.message)
        } else {
          setError('Failed to load available slots')
        }
      })
      .finally(() => setLoading(false))
  }, [eventTypeId])

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (success) {
    return (
      <Center h={200}>
        <Alert
          icon={<IconCircleCheck size={20} />}
          color="green"
          title="Booking confirmed!"
          variant="light"
        >
          Your meeting has been booked successfully.
        </Alert>
      </Center>
    )
  }

  return (
    <Stack>
      <Title order={2}>Select a Time Slot</Title>
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}
      {slots.length === 0 && !error ? (
        <Text c="dimmed">No available slots in the next 14 days.</Text>
      ) : (
        <>
          <SlotPicker slots={slots} onSelect={setSelectedSlot} />
          {selectedSlot && eventTypeId && (
            <Paper shadow="sm" p="md" radius="md" withBorder>
              <Title order={4} mb="md">
                Your Details
              </Title>
              <BookingForm
                eventTypeId={eventTypeId}
                slot={selectedSlot}
                onSuccess={() => setSuccess(true)}
              />
            </Paper>
          )}
        </>
      )}
    </Stack>
  )
}
