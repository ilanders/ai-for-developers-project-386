import { test, expect } from '@playwright/test'

test('main booking flow', async ({ page }) => {
  const eventTypeId = 'consultation'
  const eventTypeTitle = 'Consultation'
  const guestName = 'Alice Smith'
  const guestEmail = 'alice@example.com'

  // 1. Admin opens admin part and creates event type
  await page.goto('/admin/event-types')
  await page.getByLabel('ID').fill(eventTypeId)
  await page.getByLabel('Title').fill(eventTypeTitle)
  await page.getByLabel('Description').fill('Test booking event')
  await page.getByLabel('Duration (minutes)').fill('30')
  await page.getByRole('button', { name: 'Create' }).click()

  // 2. Admin sees the created event type in the list
  await expect(page.getByText(eventTypeTitle)).toBeVisible()

  // 3. Guest opens the guest page and sees the event type
  await page.goto('/')
  await expect(page.getByText(eventTypeTitle)).toBeVisible()

  // 4. Guest selects the event type
  await page.getByRole('button', { name: 'Book' }).click()
  await expect(page).toHaveURL(`/book/${eventTypeId}`)

  // 5. Guest selects a free slot
  const slotButton = page.locator('button:has-text(":")').first()
  await expect(slotButton).toBeVisible({ timeout: 10000 })
  const selectedSlotText = await slotButton.textContent()
  await slotButton.click()

  // 6. Guest fills booking form and confirms
  await page.getByLabel('Name').fill(guestName)
  await page.getByLabel('Email').fill(guestEmail)
  await page.getByRole('button', { name: /Confirm Booking/i }).click()

  // 7. Guest sees success message
  await expect(page.getByText(/Booking confirmed/i)).toBeVisible({ timeout: 10000 })

  // 8. Admin opens bookings and sees the booking
  await page.goto('/admin/bookings')
  await expect(page.getByRole('cell', { name: guestName })).toBeVisible({ timeout: 10000 })

  // 9. Guest re-opens slot selection; booked slot is no longer first
  await page.goto(`/book/${eventTypeId}`)
  await expect(page.locator('button:has-text(":")').first()).toBeVisible({ timeout: 10000 })

  const newFirstSlotText = await page.locator('button:has-text(":")').first().textContent()
  expect(newFirstSlotText).not.toBe(selectedSlotText)
})
