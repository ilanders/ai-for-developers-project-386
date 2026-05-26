import { Table } from '@mantine/core'
import type { Booking } from '../api/client'

interface Props {
  bookings: Booking[]
}

function formatDateTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export default function BookingTable({ bookings }: Props) {
  const rows = bookings.map((b) => (
    <Table.Tr key={b.id}>
      <Table.Td>{b.guest.name}</Table.Td>
      <Table.Td>{b.guest.email}</Table.Td>
      <Table.Td>{b.eventTypeId}</Table.Td>
      <Table.Td>{formatDateTime(b.startTime)}</Table.Td>
      <Table.Td>{formatDateTime(b.endTime)}</Table.Td>
    </Table.Tr>
  ))

  return (
    <Table striped highlightOnHover>
      <Table.Thead>
        <Table.Tr>
          <Table.Th>Name</Table.Th>
          <Table.Th>Email</Table.Th>
          <Table.Th>Event Type</Table.Th>
          <Table.Th>Start</Table.Th>
          <Table.Th>End</Table.Th>
        </Table.Tr>
      </Table.Thead>
      <Table.Tbody>{rows}</Table.Tbody>
    </Table>
  )
}
