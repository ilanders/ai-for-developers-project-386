import { useEffect, useState, useCallback } from 'react'
import { Stack, Title, Alert, Loader, Center } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { listEventTypes, ApiError } from '../../api/client'
import type { EventType } from '../../api/client'
import EventTypeCard from '../../components/EventTypeCard'
import CreateEventTypeForm from '../../components/CreateEventTypeForm'

export default function EventTypesPage() {
  const [eventTypes, setEventTypes] = useState<EventType[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(() => {
    setLoading(true)
    setError(null)
    listEventTypes()
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

  useEffect(() => {
    fetch()
  }, [fetch])

  return (
    <Stack>
      <Title order={2}>Event Types</Title>
      <Title order={4}>Create New Event Type</Title>
      <CreateEventTypeForm onSuccess={fetch} />
      <Title order={4}>Existing Event Types</Title>
      {loading ? (
        <Center h={100}>
          <Loader />
        </Center>
      ) : error ? (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      ) : (
        <Stack>
          {eventTypes.map((et) => (
            <EventTypeCard key={et.id} eventType={et} />
          ))}
        </Stack>
      )}
    </Stack>
  )
}
