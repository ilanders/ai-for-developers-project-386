import { useState } from 'react'
import { Stack, Group, Button, Text, Box } from '@mantine/core'
import type { Slot } from '../api/client'

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface Props {
  slots: Slot[]
  onSelect: (slot: Slot) => void
}

interface SlotGroup {
  date: string
  slots: Slot[]
}

function groupSlots(slots: Slot[]): SlotGroup[] {
  const map = new Map<string, Slot[]>()
  for (const s of slots) {
    const key = new Date(s.startTime).toDateString()
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(s)
  }
  return Array.from(map.entries()).map(([date, slots]) => ({
    date,
    slots,
  }))
}

export default function SlotPicker({ slots, onSelect }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const groups = groupSlots(slots)

  return (
    <Stack>
      {groups.map((g) => (
        <Box key={g.date}>
          <Text fw={500} mb="xs">
            {formatDate(g.date)}
          </Text>
          <Group gap="xs">
            {g.slots.map((s) => {
              const key = s.startTime
              return (
                <Button
                  key={key}
                  variant={selected === key ? 'filled' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setSelected(key)
                    onSelect(s)
                  }}
                >
                  {formatTime(s.startTime)}
                </Button>
              )
            })}
          </Group>
        </Box>
      ))}
    </Stack>
  )
}
