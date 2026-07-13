import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 22,
          background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "8px",
          fontWeight: 900,
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        }}
      >
        +
      </div>
    ),
    {
      ...size,
    }
  );
}
