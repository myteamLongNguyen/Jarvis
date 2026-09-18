/**
 * Formik keeps numeric inputs as strings, so every numeric initialValue has to be
 * stringified — including the ones Smart Scan filled in. `undefined` becomes an
 * empty field rather than the string "undefined".
 */
export function numberField(value: number | undefined | null): string {
  return value === undefined || value === null ? '' : String(value);
}
