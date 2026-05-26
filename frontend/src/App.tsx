import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import AdminLayout from './pages/admin/AdminLayout'
import HomePage from './pages/HomePage'
import BookingPage from './pages/BookingPage'
import OwnerPage from './pages/admin/OwnerPage'
import EventTypesPage from './pages/admin/EventTypesPage'
import BookingsPage from './pages/admin/BookingsPage'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/book/:eventTypeId" element={<BookingPage />} />
      </Route>
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/owner" replace />} />
        <Route path="owner" element={<OwnerPage />} />
        <Route path="event-types" element={<EventTypesPage />} />
        <Route path="bookings" element={<BookingsPage />} />
      </Route>
    </Routes>
  )
}
