import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Fix Ahmedabad — Crowdsourced Garbage Map for Ahmedabad";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f0fdf4",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              backgroundColor: "#16a34a",
              color: "white",
              fontSize: "40px",
            }}
          >
            📍
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <h1
              style={{
                fontSize: "56px",
                fontWeight: 800,
                color: "#111827",
                margin: 0,
                letterSpacing: "-1px",
              }}
            >
              Fix Ahmedabad
            </h1>
            <p
              style={{
                fontSize: "24px",
                color: "#4b5563",
                margin: 0,
              }}
            >
              Report garbage. Tag your neta. Fix Ahmedabad.
            </p>
          </div>
          <div
            style={{
              display: "flex",
              gap: "16px",
              marginTop: "16px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px 20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#16a34a" }}>48</span>
              <span style={{ fontSize: "16px", color: "#6b7280" }}>Wards</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px 20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#16a34a" }}>7</span>
              <span style={{ fontSize: "16px", color: "#6b7280" }}>Zones</span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                backgroundColor: "white",
                borderRadius: "12px",
                padding: "12px 20px",
                border: "1px solid #e5e7eb",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: 600, color: "#16a34a" }}>19</span>
              <span style={{ fontSize: "16px", color: "#6b7280" }}>Representatives</span>
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
