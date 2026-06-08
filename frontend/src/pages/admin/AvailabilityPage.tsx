import { useEffect, useState } from 'react'
import {
  Stack, Title, Text, Alert, Loader, Center, Paper, Button, Group,
  TextInput, NumberInput, Switch, ActionIcon, Divider, Badge,
} from '@mantine/core'
import { IconAlertCircle, IconTrash, IconPlus } from '@tabler/icons-react'
import { getAvailability, updateAvailability, ApiError } from '../../api/client'
import type { AvailabilitySettings, DailyBreak, DateOverride, TimeWindow } from '../../api/client'

const DAY_LABELS: Record<number, string> = {
  1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday',
  5: 'Friday', 6: 'Saturday', 7: 'Sunday',
}

const DAY_OPTIONS = [1, 2, 3, 4, 5, 6, 7]

function emptyWindows(): AvailabilitySettings {
  return {
    windows: DAY_OPTIONS.map((d) => ({ dayOfWeek: d, startTime: '09:00', endTime: '17:00' })),
    breaks: [],
    overrides: [],
  }
}

export default function AvailabilityPage() {
  const [settings, setSettings] = useState<AvailabilitySettings | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    getAvailability()
      .then(setSettings)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.body.message)
        } else {
          setError('Failed to load availability settings')
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const updateWindow = (dayOfWeek: number, field: 'startTime' | 'endTime', value: string) => {
    if (!settings) return
    setSettings({
      ...settings,
      windows: settings.windows.map((w) =>
        w.dayOfWeek === dayOfWeek ? { ...w, [field]: value } : w
      ),
    })
  }

  const addBreak = () => {
    if (!settings) return
    setSettings({ ...settings, breaks: [...settings.breaks, { dayOfWeek: 1, startTime: '12:00', endTime: '13:00' }] })
  }

  const updateBreak = (index: number, field: keyof DailyBreak, value: number | string) => {
    if (!settings) return
    const updated = [...settings.breaks]
    updated[index] = { ...updated[index], [field]: value }
    setSettings({ ...settings, breaks: updated })
  }

  const removeBreak = (index: number) => {
    if (!settings) return
    setSettings({ ...settings, breaks: settings.breaks.filter((_, i) => i !== index) })
  }

  const addOverride = () => {
    if (!settings) return
    setSettings({
      ...settings,
      overrides: [...settings.overrides, { date: '', isHoliday: false, windows: [] }],
    })
  }

  const updateOverride = (index: number, field: keyof DateOverride, value: unknown) => {
    if (!settings) return
    const updated = [...settings.overrides]
    updated[index] = { ...updated[index], [field]: value } as DateOverride
    setSettings({ ...settings, overrides: updated })
  }

  const addOverrideWindow = (overrideIndex: number) => {
    if (!settings) return
    const updated = [...settings.overrides]
    updated[overrideIndex] = {
      ...updated[overrideIndex],
      windows: [...updated[overrideIndex].windows, { startTime: '09:00', endTime: '17:00' }],
    }
    setSettings({ ...settings, overrides: updated })
  }

  const updateOverrideWindow = (overrideIndex: number, windowIndex: number, field: keyof TimeWindow, value: string) => {
    if (!settings) return
    const updated = [...settings.overrides]
    const windows = [...updated[overrideIndex].windows]
    windows[windowIndex] = { ...windows[windowIndex], [field]: value }
    updated[overrideIndex] = { ...updated[overrideIndex], windows }
    setSettings({ ...settings, overrides: updated })
  }

  const removeOverrideWindow = (overrideIndex: number, windowIndex: number) => {
    if (!settings) return
    const updated = [...settings.overrides]
    updated[overrideIndex] = {
      ...updated[overrideIndex],
      windows: updated[overrideIndex].windows.filter((_, i) => i !== windowIndex),
    }
    setSettings({ ...settings, overrides: updated })
  }

  const removeOverride = (index: number) => {
    if (!settings) return
    setSettings({ ...settings, overrides: settings.overrides.filter((_, i) => i !== index) })
  }

  const handleSave = async () => {
    if (!settings) return
    setSaving(true)
    setSaved(false)
    try {
      const result = await updateAvailability(settings)
      setSettings(result)
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.body.message)
      } else {
        setError('Failed to save availability settings')
      }
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setSettings(emptyWindows())
  }

  if (loading) {
    return (
      <Center h={200}>
        <Loader />
      </Center>
    )
  }

  if (!settings) {
    return error ? (
      <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
        {error}
      </Alert>
    ) : null
  }

  return (
    <Stack>
      <Title order={2}>Availability Settings</Title>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {error}
        </Alert>
      )}

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Title order={4}>Weekly Schedule</Title>
        <Text size="sm" c="dimmed" mb="md">
          Set your regular availability windows for each day of the week.
        </Text>

        <Stack>
          {DAY_OPTIONS.map((day) => {
            const window = settings.windows.find((w) => w.dayOfWeek === day)
            return (
              <Group key={day} grow>
                <Text w={120}>{DAY_LABELS[day]}</Text>
                <TextInput
                  type="time"
                  value={window?.startTime ?? ''}
                  onChange={(e) => updateWindow(day, 'startTime', e.currentTarget.value)}
                  aria-label={`${DAY_LABELS[day]} start time`}
                />
                <TextInput
                  type="time"
                  value={window?.endTime ?? ''}
                  onChange={(e) => updateWindow(day, 'endTime', e.currentTarget.value)}
                  aria-label={`${DAY_LABELS[day]} end time`}
                />
              </Group>
            )
          })}
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Breaks</Title>
          <Button size="compact-sm" leftSection={<IconPlus size={14} />} onClick={addBreak}>
            Add Break
          </Button>
        </Group>
        <Text size="sm" c="dimmed" mb="md">
          Define breaks that apply to specific days of the week.
        </Text>

        {settings.breaks.length === 0 && (
          <Text size="sm" c="dimmed" fs="italic">
            No breaks configured.
          </Text>
        )}

        <Stack>
          {settings.breaks.map((b, i) => (
            <Group key={i} grow>
              <NumberInput
                value={b.dayOfWeek}
                onChange={(v) => updateBreak(i, 'dayOfWeek', Number(v))}
                min={1}
                max={7}
                aria-label="Day of week"
                w={80}
              />
              <Badge variant="light" color="gray" size="lg" w={100}>
                {DAY_LABELS[b.dayOfWeek]}
              </Badge>
              <TextInput
                type="time"
                value={b.startTime}
                onChange={(e) => updateBreak(i, 'startTime', e.currentTarget.value)}
                aria-label="Break start time"
              />
              <TextInput
                type="time"
                value={b.endTime}
                onChange={(e) => updateBreak(i, 'endTime', e.currentTarget.value)}
                aria-label="Break end time"
              />
              <ActionIcon color="red" onClick={() => removeBreak(i)} aria-label="Remove break">
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          ))}
        </Stack>
      </Paper>

      <Paper shadow="sm" p="md" radius="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={4}>Date Overrides</Title>
          <Button size="compact-sm" leftSection={<IconPlus size={14} />} onClick={addOverride}>
            Add Override
          </Button>
        </Group>
        <Text size="sm" c="dimmed" mb="md">
          Add holidays (fully unavailable) or custom hours for specific dates.
        </Text>

        {settings.overrides.length === 0 && (
          <Text size="sm" c="dimmed" fs="italic">
            No overrides configured.
          </Text>
        )}

        <Stack>
          {settings.overrides.map((o, oi) => (
            <Paper key={oi} p="sm" withBorder radius="sm">
              <Group mb="sm">
                <TextInput
                  type="date"
                  value={o.date}
                  onChange={(e) => updateOverride(oi, 'date', e.currentTarget.value)}
                  aria-label="Override date"
                />
                <Switch
                  label="Holiday (unavailable)"
                  checked={o.isHoliday}
                  onChange={(e) => updateOverride(oi, 'isHoliday', e.currentTarget.checked)}
                />
                <ActionIcon color="red" onClick={() => removeOverride(oi)} aria-label="Remove override">
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>

              {!o.isHoliday && (
                <Stack>
                  <Group justify="space-between">
                    <Text size="sm">Custom time windows</Text>
                    <Button size="compact-xs" leftSection={<IconPlus size={12} />} onClick={() => addOverrideWindow(oi)}>
                      Add Window
                    </Button>
                  </Group>
                  {o.windows.map((w, wi) => (
                    <Group key={wi} grow>
                      <TextInput
                        type="time"
                        value={w.startTime}
                        onChange={(e) => updateOverrideWindow(oi, wi, 'startTime', e.currentTarget.value)}
                        aria-label="Window start time"
                      />
                      <TextInput
                        type="time"
                        value={w.endTime}
                        onChange={(e) => updateOverrideWindow(oi, wi, 'endTime', e.currentTarget.value)}
                        aria-label="Window end time"
                      />
                      <ActionIcon color="red" onClick={() => removeOverrideWindow(oi, wi)} aria-label="Remove window">
                        <IconTrash size={14} />
                      </ActionIcon>
                    </Group>
                  ))}
                </Stack>
              )}
            </Paper>
          ))}
        </Stack>
      </Paper>

      <Divider />

      <Group>
        <Button onClick={handleSave} loading={saving}>
          {saved ? 'Saved!' : 'Save Changes'}
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset to Defaults
        </Button>
      </Group>
    </Stack>
  )
}
