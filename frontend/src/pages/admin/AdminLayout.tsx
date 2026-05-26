import { Outlet, Link, useLocation } from 'react-router-dom'
import { AppShell, Group, Title, NavLink, Anchor } from '@mantine/core'
import { IconUser, IconCalendarEvent, IconCalendarCheck } from '@tabler/icons-react'

const links = [
  { to: '/admin/owner', label: 'Owner', icon: IconUser },
  { to: '/admin/event-types', label: 'Event Types', icon: IconCalendarEvent },
  { to: '/admin/bookings', label: 'Bookings', icon: IconCalendarCheck },
]

export default function AdminLayout() {
  const location = useLocation()

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 220, breakpoint: 'sm' }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Anchor component={Link} to="/" underline="never">
            <Title order={3}>Admin Panel</Title>
          </Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="xs">
        {links.map((l) => (
          <NavLink
            key={l.to}
            component={Link}
            to={l.to}
            label={l.label}
            leftSection={<l.icon size={20} />}
            active={location.pathname === l.to}
            variant="light"
          />
        ))}
      </AppShell.Navbar>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
