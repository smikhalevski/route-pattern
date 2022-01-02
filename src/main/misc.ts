export function die(message: string, offset: number): never {
  throw new SyntaxError(message + ' at ' + offset);
}
