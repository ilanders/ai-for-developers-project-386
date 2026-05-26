import { useEffect, useState } from 'react'
import { Stack, Title, Text, Alert, Loader, Center, Paper } from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { getOwner, ApiError } from '../../api/client'
import type { Owner } from '../../api/client'

export default function OwnerPage() {
  const [owner, setOwner] = useState<Owner | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOwner()
      .then(setOwner)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.body.message)
        } else {
          setError('Failed to load owner')
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

  if (!owner) {
    return error ? (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {error}
      </Alert>
    ) : null
  }

  return (
    <Stack>
      <Title order={2}>Owner Profile</Title>
      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Text>
          <strong>ID:</strong> {owner.id}
        </Text>
        <Text>
          <strong>Name:</strong> {owner.displayName}
        </Text>
        <Text>
          <strong>Timezone:</strong> {owner.timezone}
        </Text>
      </Paper>
    </Stack>
  )
}
