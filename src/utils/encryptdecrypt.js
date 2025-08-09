// Frontend Encryption/Decryption Utility
// Browser-compatible implementation using Web Crypto API

const keyHex = "d032ec23daae2a3260d1f6d0d871b2fef0abbdece8ca986f49c93fb9e283e1d0";
const ivHex = "ba81fc0dfda4ad7b0571bc4dbaa77143";

const algorithm = "AES-CBC";
const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();

// Convert hex string to byte array
const hexToBytes = (hex) => {
  const match = hex.match(/.{1,2}/g);
  if (!match) throw new Error("Invalid hex string");
  return new Uint8Array(match.map((byte) => parseInt(byte, 16)));
};

// Convert byte array to hex string
const bytesToHex = (bytes) => {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

// Validate hex string
const isValidHex = (str) => /^[0-9a-fA-F]+$/.test(str);

// Basic encryption function
const encryptField = async (data) => {
  try {
    const keyBytes = hexToBytes(keyHex);
    const ivBytes = hexToBytes(ivHex);

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: algorithm },
      false,
      ["encrypt"]
    );

    const encrypted = await crypto.subtle.encrypt(
      { name: algorithm, iv: ivBytes },
      key,
      textEncoder.encode(data)
    );

    return bytesToHex(new Uint8Array(encrypted));
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Basic decryption function
const decryptField = async (encryptedData) => {
  try {
    if (!isValidHex(encryptedData)) {
      throw new Error('Invalid hex string');
    }

    const keyBytes = hexToBytes(keyHex);
    const ivBytes = hexToBytes(ivHex);
    const encryptedBytes = hexToBytes(encryptedData);

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: algorithm },
      false,
      ["decrypt"]
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: algorithm, iv: ivBytes },
      key,
      encryptedBytes
    );

    return textDecoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Main encryption function - encrypts any data type
export const encryp = async (data) => {
  try {
    const text = typeof data === "string" ? data : JSON.stringify(data);
    return await encryptField(text);
  } catch (error) {
    console.error("Encryption error:", error);
    return null;
  }
};

// Main decryption function - decrypts and tries to parse JSON
export const decryp = async (encryptedText) => {
  try {
    const decrypted = await decryptField(encryptedText);
    if (decrypted === null) return null;

    // Try to parse as JSON, if fails return as string
    try {
      return JSON.parse(decrypted);
    } catch {
      return decrypted;
    }
  } catch (error) {
    console.error("Decryption error:", error);
    return null;
  }
};

// Encrypt text (wrapper for backward compatibility)
export const encryptText = async (data) => {
  console.log("Encrypting data:", data);
  const inputJsonString = JSON.stringify(data);
  const encryptedData = await encryp(inputJsonString);
  console.log("Encrypted data:", encryptedData);
  return encryptedData;
};

// Decrypt text (wrapper for backward compatibility)
export const decryptText = async (data) => {
  const decryptedData = await decryp(data);
  return decryptedData;
};

// Recursive decryption function for nested objects
export const decryptRecursive = async (data, shouldDecrypt = () => true) => {
  try {
    if (data instanceof Date) return data;

    if (Array.isArray(data)) {
      const decryptedArray = [];
      for (const item of data) {
        decryptedArray.push(await decryptRecursive(item, shouldDecrypt));
      }
      return decryptedArray;
    } else if (typeof data === "object" && data !== null) {
      const decryptedObject = {};
      for (const [key, value] of Object.entries(data)) {
        decryptedObject[key] = shouldDecrypt(key, value) 
          ? await decryptRecursive(value, shouldDecrypt)
          : value;
      }
      return decryptedObject;
    } else if (typeof data === "string") {
      const decrypted = await decryp(data);
      return decrypted !== null ? decrypted : data;
    }

    return data;
  } catch (error) {
    console.error("Error in decryptRecursive:", error);
    return data;
  }
};

// API encryption with custom keys
export const apiEncryp = async (data, secretKeyHex, ivHex) => {
  try {
    if (!secretKeyHex || !ivHex) {
      console.error("API key or IV is missing");
      return null;
    }

    const keyBytes = hexToBytes(secretKeyHex);
    const ivBytes = hexToBytes(ivHex);

    if (keyBytes.length !== 32) throw new Error("Invalid SECRET_KEY length: must be 32 bytes");
    if (ivBytes.length !== 16) throw new Error("Invalid IV length: must be 16 bytes");

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: algorithm },
      false,
      ["encrypt"]
    );

    const text = typeof data === "string" ? data : JSON.stringify(data);
    const encrypted = await crypto.subtle.encrypt(
      { name: algorithm, iv: ivBytes },
      key,
      textEncoder.encode(text)
    );

    return bytesToHex(new Uint8Array(encrypted));
  } catch (error) {
    console.error("API Encryption error:", error);
    return null;
  }
};

// API decryption with custom keys
export const apiDecryp = async (encryptedText, secretKeyHex, ivHex) => {
  try {
    if (!isValidHex(encryptedText)) {
      return false;
    }

    const keyBytes = hexToBytes(secretKeyHex);
    const ivBytes = hexToBytes(ivHex);

    if (keyBytes.length !== 32) throw new Error("Invalid SECRET_KEY length: must be 32 bytes");
    if (ivBytes.length !== 16) throw new Error("Invalid IV length: must be 16 bytes");

    const key = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: algorithm },
      false,
      ["decrypt"]
    );

    const encryptedBytes = hexToBytes(encryptedText);
    const decrypted = await crypto.subtle.decrypt(
      { name: algorithm, iv: ivBytes },
      key,
      encryptedBytes
    );

    const decryptedText = textDecoder.decode(decrypted);

    try {
      return JSON.parse(decryptedText);
    } catch {
      return decryptedText;
    }
  } catch (error) {
    console.error("API Decryption error:", error);
    return null;
  }
};

// Encrypt specific fields in an object, excluding specified keys
export const encryptFields = async (data, excludeKeys = []) => {
  const encryptedData = {};

  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      encryptedData[key] = excludeKeys.includes(key)
        ? data[key] // Skip encryption for excluded keys
        : await encryp(data[key]); // Encrypt all others
    }
  }

  return encryptedData;
};

// Utility function to convert base64 to file (from your original code)
export const base64ToFile = (base64String, fileName) => {
  const arr = base64String.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const byteString = atob(arr[1]);
  let n = byteString.length;
  const uint8Array = new Uint8Array(n);
  while (n--) {
    uint8Array[n] = byteString.charCodeAt(n);
  }
  return new File([uint8Array], fileName, { type: mime });
};

// Export default object with all functions
export default {
  encryp,
  decryp,
  encryptText,
  decryptText,
  decryptRecursive,
  apiEncryp,
  apiDecryp,
  encryptFields,
  base64ToFile
};
