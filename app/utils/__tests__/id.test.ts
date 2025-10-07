import { generateId, generateTimestamp } from '@/utils/id'

describe('utils/id', () => {
  test('generateId returns a unique string', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(typeof id1).toBe('string')
    expect(typeof id2).toBe('string')
    expect(id1).not.toEqual(id2)
    expect(id1).toMatch(/\d{13}-[a-z0-9]{9}/)
  })

  test('generateTimestamp returns ISO string', () => {
    const ts = generateTimestamp()
    expect(typeof ts).toBe('string')
    expect(() => new Date(ts)).not.toThrow()
    expect(ts).toMatch(/\d{4}-\d{2}-\d{2}T/)
  })
})
