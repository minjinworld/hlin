"use client";

import { useEffect } from "react";

function isInstagramInApp() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.includes("Instagram");
}

export default function InAppBrowserHandler() {
  useEffect(() => {
    if (isInstagramInApp()) {
      // 🔹 여기서 인스타 인앱일 때만 실행할 로직 작성

      // 예시 1️⃣: 강제 리로드 (캐시 꼬임 방지용)
      // window.location.reload();

      // 예시 2️⃣: 서비스워커 비활성화 처리
      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.getRegistrations().then((regs) => {
          regs.forEach((reg) => reg.unregister());
        });
      }

      // 예시 3️⃣: body에 클래스 추가해서 CSS 분기 가능
      document.body.classList.add("instagram-iab");
    }
  }, []);

  return null; // ✅ UI 렌더 안 함
}
