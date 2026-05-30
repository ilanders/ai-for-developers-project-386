import { type ReactElement } from 'react'
import { render, type RenderOptions } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { MemoryRouter } from 'react-router-dom'

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[]
}

function AllTheProviders({
  children,
  initialEntries,
}: {
  children: React.ReactNode
  initialEntries?: string[]
}) {
  return (
    <MantineProvider>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </MantineProvider>
  )
}

function customRender(
  ui: ReactElement,
  options?: CustomRenderOptions,
) {
  const { initialEntries, ...renderOptions } = options ?? {}
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialEntries={initialEntries}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  })
}

export * from '@testing-library/react'
export { customRender as render }
