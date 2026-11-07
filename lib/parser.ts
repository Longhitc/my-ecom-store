export function parseUserAgent(userAgent: string) {
  let os = "Unknown OS";
  let deviceModel = "Unknown Device";
  let browser = "Unknown Browser";

  if (!userAgent) return { os, deviceModel, browser };

  // Nhận diện Hệ điều hành & Thiết bị cơ bản
  if (userAgent.includes("Windows NT 10.0")) {
    os = "Windows 11/10";
    deviceModel = "Windows PC";
  } else if (userAgent.includes("Macintosh")) {
    os = "macOS";
    deviceModel = "Mac / MacBook";
  } else if (userAgent.includes("iPhone")) {
    os = "iOS";
    deviceModel = "iPhone";
  } else if (userAgent.includes("iPad")) {
    os = "iOS";
    deviceModel = "iPad";
  } else if (userAgent.includes("Android")) {
    os = "Android";
    deviceModel = "Android Phone";
    const match = userAgent.match(/Android[^;]+;\s*([^)]+)\)/);
    if (match && match[1]) {
      deviceModel = match[1].trim();
    }
  } else if (userAgent.includes("Linux")) {
    os = "Linux";
    deviceModel = "Linux PC";
  }

  // Nhận diện Trình duyệt
  if (userAgent.includes("Edg/")) {
    browser = "Edge";
  } else if (userAgent.includes("Chrome/") && !userAgent.includes("Edg/")) {
    browser = "Chrome";
  } else if (userAgent.includes("Safari/") && !userAgent.includes("Chrome")) {
    browser = "Safari";
  } else if (userAgent.includes("Firefox/")) {
    browser = "Firefox";
  }

  return { os, deviceModel, browser };
}