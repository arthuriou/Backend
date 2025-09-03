export function getMissingFields(body: any, requiredFields: string[]): string[] {
  const missingFields: string[] = [];
  
  for (const field of requiredFields) {
    if (!body[field] || body[field].toString().trim() === '') {
      missingFields.push(field);
    }
  }
  
  return missingFields;
}
