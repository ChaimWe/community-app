export function routeId(value: string | string[] | undefined) {
  const id = Array.isArray(value) ? value[0] : value;
  return id ?? "";
}
