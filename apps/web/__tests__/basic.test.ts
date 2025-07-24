describe('Basic Tests', () => {
  it('should pass basic math test', () => {
    expect(2 + 2).toBe(4)
  })

  it('should validate environment', () => {
    expect(process.env.NODE_ENV).toBeDefined()
  })
})
