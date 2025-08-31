const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

function stringToBytes(str: string): number[] {
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const charCode = str.charCodeAt(i);
    if (charCode <= 0x7f) {
      bytes.push(charCode);
    } else if (charCode <= 0x7ff) {
      bytes.push(0xc0 | (charCode >> 6));
      bytes.push(0x80 | (charCode & 0x3f));
    } else if ((charCode & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
      const surrogatePair = 0x10000 + (((charCode & 0x03ff) << 10) | (str.charCodeAt(++i) & 0x03ff));
      bytes.push(0xf0 | (surrogatePair >> 18));
      bytes.push(0x80 | ((surrogatePair >> 12) & 0x3f));
      bytes.push(0x80 | ((surrogatePair >> 6) & 0x3f));
      bytes.push(0x80 | (surrogatePair & 0x3f));
    } else {
      bytes.push(0xe0 | (charCode >> 12));
      bytes.push(0x80 | ((charCode >> 6) & 0x3f));
      bytes.push(0x80 | (charCode & 0x3f));
    }
  }
  return bytes;
}

export function encodeBase64(input: string): string {
  const bytes = stringToBytes(input);
  let result = '';
  let i = 0;

  while (i < bytes.length) {
    const byte1 = bytes[i++];
    const byte2 = i < bytes.length ? bytes[i++] : 0;
    const byte3 = i < bytes.length ? bytes[i++] : 0;

    const encoded1 = byte1 >> 2;
    const encoded2 = ((byte1 & 0x03) << 4) | (byte2 >> 4);
    const encoded3 = ((byte2 & 0x0f) << 2) | (byte3 >> 6);
    const encoded4 = byte3 & 0x3f;

    result += base64Chars[encoded1] + base64Chars[encoded2];
    result += (i - 2 < bytes.length) ? base64Chars[encoded3] : '=';
    result += (i - 1 < bytes.length) ? base64Chars[encoded4] : '=';
  }

  return result;
}

export function createBasicAuthHeader(username: string, password: string): string {
  const credentials = `${username}:${password}`;
  return `Basic ${encodeBase64(credentials)}`;
}
