import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Visible in Vercel → Functions → Logs
  console.log("[OrbitWork Feedback]", JSON.stringify(body));

  const formId = process.env.FORMSPREE_ID ?? "xnjkynvz";
  try {
    await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    // don't fail the request if forwarding fails
  }

  return NextResponse.json({ ok: true });
}
