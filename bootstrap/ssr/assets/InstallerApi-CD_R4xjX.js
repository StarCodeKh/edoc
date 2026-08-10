function getCsrfToken() {
  var _a;
  let token = (_a = document.querySelector('meta[name="csrf-token"]')) == null ? void 0 : _a.getAttribute("content");
  if (!token) {
    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === "XSRF-TOKEN") {
        token = decodeURIComponent(value);
        break;
      }
    }
  }
  if (!token) {
    console.error("CSRF token not found. This may cause installation issues.");
    return "installer-csrf-fallback";
  }
  return token;
}
async function installerApiRequest(url, options = {}) {
  const csrfToken = getCsrfToken();
  const defaultOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-CSRF-TOKEN": csrfToken,
      "Accept": "application/json",
      "X-Requested-With": "XMLHttpRequest"
    },
    credentials: "same-origin"
  };
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  };
  let response = await fetch(url, mergedOptions);
  if (response.status === 419) {
    const freshToken = getCsrfToken();
    mergedOptions.headers["X-CSRF-TOKEN"] = freshToken;
    response = await fetch(url, mergedOptions);
  }
  return response;
}
async function handleApiResponse(response) {
  const responseText = await response.text();
  if (!response.ok) {
    let errorMessage = "Request failed";
    try {
      const errorData = JSON.parse(responseText);
      errorMessage = errorData.message || errorMessage;
    } catch (e) {
      errorMessage = responseText || response.statusText || errorMessage;
      if (responseText.includes("<!DOCTYPE") || responseText.includes("<html")) {
        errorMessage = `Server returned HTML instead of JSON. Status: ${response.status}. This might be a server error page.`;
      }
    }
    throw new Error(errorMessage);
  }
  if (!responseText || responseText.trim() === "") {
    return {};
  }
  try {
    return JSON.parse(responseText);
  } catch (e) {
    console.error("Failed to parse JSON response:", responseText.substring(0, 200));
    throw new Error(`Invalid response format: ${e.message}. Response: ${responseText.substring(0, 100)}`);
  }
}
export {
  handleApiResponse as h,
  installerApiRequest as i
};
