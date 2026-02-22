import { ImageResponse } from "next/og";

export const alt = "Critiqo — Rate Movies & TV Like a Critic";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #1a1520 0%, #0f0d12 50%, #1a1520 100%)",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "radial-gradient(ellipse at 50% 40%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)",
            display: "flex",
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: "linear-gradient(135deg, #f59e0b, #d97706)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 36,
              fontWeight: 800,
              color: "#0f0d12",
            }}
          >
            C
          </div>
          <span
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: "#f5f0e8",
              letterSpacing: "-0.02em",
            }}
          >
            Critiqo
          </span>
        </div>
        <p
          style={{
            fontSize: 28,
            color: "#a8a0b0",
            maxWidth: 600,
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          Rate movies &amp; TV shows across five dimensions. Track, review, and
          share your critiques.
        </p>
        <div
          style={{
            display: "flex",
            gap: 32,
            marginTop: 40,
          }}
        >
          {["Story", "Acting", "Visuals", "Directing", "Music"].map((dim) => (
            <div
              key={dim}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 4,
                }}
              >
                {[1, 2, 3, 4, 5].map((s) => (
                  <div
                    key={s}
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 2,
                      background: s <= 4 ? "#f59e0b" : "#3a3540",
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: 14, color: "#6b6574" }}>{dim}</span>
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
