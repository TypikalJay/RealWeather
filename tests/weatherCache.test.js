import { describe, expect, it, vi } from 'vitest'
import { buildWeatherCacheKey, readWeatherCache, writeWeatherCache } from '@/utils/weatherCache'

describe('weather cache ttl', () => {
  it('treats exactly 15 minutes as fresh and 15min+1ms as stale', () => {
    const now = 1_700_000_000_000
    vi.spyOn(Date, 'now').mockReturnValue(now)

    const key = buildWeatherCacheKey({ q: 'London' })
    writeWeatherCache(key, { hello: 'world' })

    vi.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000)
    expect(readWeatherCache(key, 15 * 60 * 1000).fresh).toBe(true)

    vi.spyOn(Date, 'now').mockReturnValue(now + 15 * 60 * 1000 + 1)
    expect(readWeatherCache(key, 15 * 60 * 1000).fresh).toBe(false)
  })
})
