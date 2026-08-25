/**
 * Utility functions for installer API calls
 */

/**
 * Get CSRF token from meta tag or cookie
 * @returns {string} CSRF token
 * @throws {Error} If CSRF token is not found
 */
export function getCsrfToken() {
    // First try to get from meta tag
    let token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    // If not found, try to get from cookie
    if (!token) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'XSRF-TOKEN') {
                token = decodeURIComponent(value);
                break;
            }
        }
    }

    if (!token) {
        console.error('CSRF token not found. This may cause installation issues.');
        // Return a fallback token for installer (will be validated server-side)
        return 'installer-csrf-fallback';
    }
    return token;
}

/**
 * Make an authenticated API request to installer endpoints
 * @param {string} url - The API endpoint URL
 * @param {Object} options - Fetch options
 * @returns {Promise<Response>} Fetch response
 */
export async function installerApiRequest(url, options = {}) {
    const csrfToken = getCsrfToken();

    const defaultOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': csrfToken,
            Accept: 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
        },
        credentials: 'same-origin',
    };

    const mergedOptions = {
        ...defaultOptions,
        ...options,
        headers: {
            ...defaultOptions.headers,
            ...options.headers,
        },
    };

    let response = await fetch(url, mergedOptions);

    // If we get a 419 (CSRF token mismatch), try to refresh token and retry once
    if (response.status === 419) {
        // Try to get fresh token from response headers or meta tag
        const freshToken = getCsrfToken();

        // Update headers with fresh token
        mergedOptions.headers['X-CSRF-TOKEN'] = freshToken;

        // Retry the request
        response = await fetch(url, mergedOptions);
    }

    return response;
}

/**
 * Handle API response and extract JSON data
 * @param {Response} response - Fetch response
 * @returns {Promise<Object>} Parsed JSON data
 * @throws {Error} If response is not ok or JSON parsing fails
 */
export async function handleApiResponse(response) {
    // Get response text first to check what we're dealing with
    const responseText = await response.text();

    if (!response.ok) {
        let errorMessage = 'Request failed';
        try {
            const errorData = JSON.parse(responseText);
            errorMessage = errorData.message || errorMessage;
        } catch (e) {
            // If we can't parse the error response, use the status text or response text
            errorMessage = responseText || response.statusText || errorMessage;
            // If it looks like HTML, provide a more helpful message
            if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
                errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}. This might be a server error page.`;
            }
        }
        throw new Error(errorMessage);
    }

    // If response is empty, return empty object
    if (!responseText || responseText.trim() === '') {
        return {};
    }

    try {
        return JSON.parse(responseText);
    } catch (e) {
        console.error('Failed to parse JSON response:', responseText.substring(0, 200));
        throw new Error(`Invalid response format: ${e.message}. Response: ${responseText.substring(0, 100)}`);
    }
}
