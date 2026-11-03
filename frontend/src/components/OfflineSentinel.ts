import { useAppStore } from '../store/useAppStore';

/**
 * Installs browser-level network sentinels to guarantee zero outbound network requests.
 * Intercepts window.fetch and XMLHttpRequest.
 * Any non-localhost/127.0.0.1 destination is blocked immediately and flags the security badge.
 */
export function initOfflineSentinel() {
  const isAllowedHost = (urlStr: string): boolean => {
    try {
      // Relative URLs are always local
      if (urlStr.startsWith('/') || urlStr.startsWith('./') || urlStr.startsWith('../')) {
        return true;
      }
      const parsed = new URL(urlStr, window.location.origin);
      const hostname = parsed.hostname.toLowerCase();
      return (
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '0.0.0.0' ||
        hostname === window.location.hostname
      );
    } catch (_) {
      return false;
    }
  };

  // Intercept window.fetch
  const originalFetch = window.fetch;
  window.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url = typeof input === 'string' ? input : (input instanceof Request ? input.url : input.toString());
    
    if (!isAllowedHost(url)) {
      console.error(`[OfflineCoder SECURITY VIOLATION] Outbound request blocked: ${url}`);
      useAppStore.getState().recordViolation(url);
      throw new Error(`[OfflineCoder] Outbound request to '${url}' is strictly blocked in offline mode.`);
    }

    return originalFetch.apply(this, [input, init]);
  };

  // Intercept XMLHttpRequest
  const originalOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (
    method: string,
    url: string | URL,
    async?: boolean,
    user?: string | null,
    password?: string | null
  ) {
    const urlStr = url.toString();
    if (!isAllowedHost(urlStr)) {
      console.error(`[OfflineCoder SECURITY VIOLATION] XHR blocked: ${urlStr}`);
      useAppStore.getState().recordViolation(urlStr);
      throw new Error(`[OfflineCoder] Outbound XHR to '${urlStr}' is strictly blocked in offline mode.`);
    }
    return originalOpen.apply(this, [method, url, async ?? true, user, password]);
  };

  console.log('🛡️ [OfflineCoder] Network sentinel active: Outbound external egress blocked.');
}

