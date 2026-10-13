import crypto from 'crypto';

/**
 * Generates a short, secure alphanumeric access key using Node's crypto module.
 * 
 * @param length The length of the generated key (default 12)
 * @returns A cryptographically secure random alphanumeric string
 */
export function generateAccessKey(length: number = 12): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charsetLength = charset.length;
  let result = '';
  
  // Generate random bytes for entropy
  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    // Map each byte to a character in the charset using modulo
    const randomIndex = randomBytes[i] % charsetLength;
    result += charset[randomIndex];
  }
  
  return result;
}
