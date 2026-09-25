/**
 * Helper to generate readable ERP identifiers.
 * e.g., PROD-XXXXX or ORD-XXXXX
 */
export const generateId = (prefix = 'ID') => {
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const timestamp = Date.now().toString().slice(-4);
  return `${prefix}-${timestamp}${randomSuffix}`;
};
