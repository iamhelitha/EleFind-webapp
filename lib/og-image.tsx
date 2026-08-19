import { ImageResponse } from "next/og";

interface OgMetric {
  value: string;
  label: string;
}

interface OgImageOptions {
  eyebrow: string;
  title: string;
  description: string;
  metrics?: OgMetric[];
}

export const OG_SIZE = {
  width: 1200,
  height: 630,
};

export function createOgImage({
  eyebrow,
  title,
  description,
  metrics = [],
}: OgImageOptions) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          position: "relative",
          padding: "54px 64px",
          background: "#191d16",
          color: "#f0e9d9",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: -120,
            top: -150,
            width: 560,
            height: 560,
            borderRadius: "50%",
            background: "#3d4932",
            opacity: 0.8,
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 110,
            bottom: -190,
            width: 460,
            height: 460,
            borderRadius: "50%",
            border: "46px solid #aebf92",
            opacity: 0.12,
          }}
        />

        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 64,
            right: 64,
            top: 54,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center" }}>
            <div
              style={{
                width: 44,
                height: 44,
                marginRight: 14,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 22,
                border: "3px solid #aebf92",
                color: "#cf824d",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              E
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 800 }}>
              EleFind
            </div>
          </div>
          <div
            style={{
              display: "flex",
              borderRadius: 999,
              padding: "10px 18px",
              background: "rgba(240,233,217,0.08)",
              color: "#aebf92",
              fontSize: 15,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            }}
          >
            Aerial conservation AI
          </div>
        </div>

        <div
          style={{
            width: 780,
            display: "flex",
            position: "absolute",
            left: 64,
            top: 180,
            flexDirection: "column",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: 16,
              color: "#cf824d",
              fontSize: 17,
              fontWeight: 700,
              letterSpacing: "0.13em",
              textTransform: "uppercase",
            }}
          >
            {eyebrow}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: title.length > 34 ? 58 : 68,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: "-0.035em",
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              width: 720,
              maxWidth: 720,
              flexWrap: "wrap",
              marginTop: 22,
              color: "rgba(240,233,217,0.72)",
              fontSize: 23,
              lineHeight: 1.45,
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            position: "absolute",
            left: 64,
            right: 64,
            bottom: 48,
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid rgba(240,233,217,0.16)",
            paddingTop: 22,
          }}
        >
          <div style={{ display: "flex" }}>
            {metrics.length > 0 ? (
              metrics.map(({ value, label }, index) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    marginRight: index === metrics.length - 1 ? 0 : 36,
                  }}
                >
                  <span style={{ fontSize: 28, fontWeight: 800 }}>{value}</span>
                  <span
                    style={{
                      marginLeft: 10,
                      color: "rgba(240,233,217,0.58)",
                      fontSize: 14,
                    }}
                  >
                    {label}
                  </span>
                </div>
              ))
            ) : (
              <div
                style={{
                  display: "flex",
                  color: "rgba(240,233,217,0.65)",
                  fontSize: 17,
                }}
              >
                Detect → review → map → protect
              </div>
            )}
          </div>
          <div style={{ display: "flex", color: "#aebf92", fontSize: 17 }}>
            elefind
          </div>
        </div>
      </div>
    ),
    OG_SIZE
  );
}
