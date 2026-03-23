import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px",
          background:
            "radial-gradient(circle at top left, rgba(242,140,100,0.35), transparent 30%), radial-gradient(circle at right, rgba(154,183,152,0.35), transparent 28%), linear-gradient(135deg, #08111f, #172f47)",
          color: "#f7f5f0"
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "18px"
          }}
        >
          <div
            style={{
              width: "74px",
              height: "74px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "22px",
              background: "rgba(255,255,255,0.08)",
              color: "#f28c64",
              fontSize: "34px",
              fontWeight: 700
            }}
          >
            pL
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column"
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 700
              }}
            >
              pLUto
            </div>
            <div
              style={{
                fontSize: "16px",
                color: "rgba(247,245,240,0.78)"
              }}
            >
              AI Research Assistant for Students
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "18px",
            maxWidth: "920px"
          }}
        >
          <div
            style={{
              fontSize: "64px",
              lineHeight: 1.05,
              fontWeight: 700
            }}
          >
            Compare research papers and analyse sources using AI.
          </div>
          <div
            style={{
              fontSize: "28px",
              color: "rgba(247,245,240,0.84)"
            }}
          >
            Find, compare, and understand academic research faster with pLUto.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: "14px",
            fontSize: "18px",
            color: "rgba(247,245,240,0.8)"
          }}
        >
          <div>AI summaries</div>
          <div>Source comparison</div>
          <div>Student-friendly insights</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630
    }
  );
}
