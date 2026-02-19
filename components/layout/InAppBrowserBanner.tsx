"use client";

import { useEffect, useState } from "react";

function isInstagramInApp() {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent || "";
  return ua.includes("Instagram");
}

export default function InAppBrowserBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isInstagramInApp()) {
      setShow(true);
    }
  }, []);

  if (!show) return null;

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 9999,
        background: "#111",
        color: "white",
        padding: "10px 14px",
        fontSize: "13px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <span style={{ lineHeight: 1.3 }}>
        인스타 내부 브라우저에서는 화면이 제대로 보이지 않을 수 있어요.
      </span>

      <button
        onClick={() => {
          window.location.href = window.location.href;
        }}
        style={{
          background: "white",
          color: "black",
          borderRadius: "20px",
          padding: "6px 12px",
          fontWeight: 600,
          border: "none",
          cursor: "pointer",
        }}
      >
        브라우저에서 열기
      </button>
    </div>
  );
}