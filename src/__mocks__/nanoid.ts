// Mock nanoid for Jest tests
let counter = 0;

export function nanoid(size?: number): string {
  counter++;
  return `mock-nanoid-${counter}`;
}

export default { nanoid };
