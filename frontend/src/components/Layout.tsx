import { Outlet, Link } from 'react-router-dom'
import { AppShell, Group, Title, Anchor } from '@mantine/core'

export default function Layout() {
  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Anchor component={Link} to="/" underline="never">
            <Title order={3}>Calendar Booking</Title>
          </Anchor>
          <Anchor component={Link} to="/admin">
            Admin
          </Anchor>
        </Group>
      </AppShell.Header>
      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  )
}
