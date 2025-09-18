/**
 * Mock для Next.js navigation
 */

export const useRouter = () => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
})

export const useSearchParams = () => new URLSearchParams()

export const usePathname = () => '/'
