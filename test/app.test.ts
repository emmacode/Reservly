describe('sum', () => {
  describe('sum two positive integers', () => {
    it('should return whole number', () => {
      const result = sum(2, 4);
      expect(result).toBe(6);
    });
  });

  describe('sum two positive decimal', () => {
    it('should return decimal', () => {
      const result = sum(2.5, 5.0);
      expect(result).toBe(7.5);
    });
  });
});

function sum(a: number, b: number): number {
  return a + b;
}