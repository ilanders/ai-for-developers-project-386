import { useState } from 'react'
import { TextInput, NumberInput, Button, Stack, Alert } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { createEventType, ApiError } from '../api/client'

interface Props {
  onSuccess: () => void
}

export default function CreateEventTypeForm({ onSuccess }: Props) {
  const [id, setId] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [durationMinutes, setDurationMinutes] = useState<number | string>(30)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createEventType({
        id,
        title,
        description,
        durationMinutes: Number(durationMinutes),
      })
      onSuccess()
      setId('')
      setTitle('')
      setDescription('')
      setDurationMinutes(30)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.message)
      } else {
        setError('Failed to create event type')
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
          label="ID"
          required
          value={id}
          onChange={(e) => setId(e.currentTarget.value)}
        />
        <TextInput
          label="Title"
          required
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
        <TextInput
          label="Description"
          required
          value={description}
          onChange={(e) => setDescription(e.currentTarget.value)}
        />
        <NumberInput
          label="Duration (minutes)"
          required
          min={5}
          value={durationMinutes}
          onChange={(v) => setDurationMinutes(v ?? 30)}
        />
        <Button type="submit" loading={loading}>
          Create
        </Button>
      </Stack>
    </form>
  )
}
