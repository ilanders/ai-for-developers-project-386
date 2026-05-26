import { Card, Text, Group, Button } from '@mantine/core'
import type { EventType } from '../api/client'

interface Props {
  eventType: EventType
  onBook?: (id: string) => void
}

export default function EventTypeCard({ eventType, onBook }: Props) {
  return (
    <Card shadow="sm" padding="lg" radius="md" withBorder>
      <Group justify="space-between" mb="xs">
        <Text fw={500}>{eventType.title}</Text>
        <Text size="sm" c="dimmed">
          {eventType.durationMinutes} min
        </Text>
      </Group>
      <Text size="sm" c="dimmed" mb="md">
        {eventType.description}
      </Text>
      {onBook && (
        <Button
          fullWidth
          variant="light"
          onClick={() => onBook(eventType.id)}
        >
          Book
        </Button>
      )}
    </Card>
  )
}
