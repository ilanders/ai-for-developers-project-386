import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Stack, Title, Alert, Loader, Center } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { listPublicEventTypes, ApiError } from '../api/client'
import type { EventType } from '../api/client'
import EventTypeCard from '../components/EventTypeCard'

export default function HomePage() {
  const navigate = useNavigate()
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listPublicEventTypes()
      .then(setEventTypes)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.body.message)
        } else {
          setError('Failed to load event types')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  return (
    <Stack>
      <Title order={2}>Book a Meeting</Title>
      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}
      <Stack>
        {eventTypes.map((et) => (
          <EventTypeCard
            key={et.id}
            eventType={et}
            onBook={(id) => navigate(`/book/${id}`)}
          />
        ))}
      </Stack>
    </Stack>
  )
}
