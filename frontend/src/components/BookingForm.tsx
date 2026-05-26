import { useState } from 'react'
import { TextInput, Button, Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { createBooking, ApiError } from '../api/client'
import type { Slot } from '../api/client'

interface Props {
  eventTypeId: string
  slot: Slot
  onSuccess: () => void
}

export default function BookingForm({ eventTypeId, slot, onSuccess }: Props) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createBooking({
        eventTypeId,
        startTime: slot.startTime,
        guest: { name, email },
      })
      onSuccess()
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.message)
      } else {
        setError('Failed to create booking')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stack>
        {error && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            color="red"
            variant="light"
          >
            {error}
          </Alert>
        )}
        <TextInput
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <TextInput
          label="Email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.currentTarget.value)}
        />
        <Button type="submit" loading={loading} fullWidth>
          Confirm Booking
        </Button>
      </Stack>
    </form>
  )
}
