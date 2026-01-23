// Simple test endpoint to verify DodoPayments can reach the server
// No signature verification - just logs the request

export async function GET() {
  return Response.json({ ok: true, message: "Webhook test endpoint is reachable" });
}

export async function POST(request: Request) {
  try {
    // Log all headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });
    console.log("[Webhook Test] Headers:", JSON.stringify(headers, null, 2));

    // Log the body
    const body = await request.text();
    console.log("[Webhook Test] Body length:", body.length);
    console.log("[Webhook Test] Body preview:", body.substring(0, 500));

    return Response.json({
      ok: true,
      message: "Webhook received successfully",
      headersReceived: Object.keys(headers),
      bodyLength: body.length
    });
  } catch (error: any) {
    console.error("[Webhook Test] Error:", error);
    return Response.json({ ok: false, error: error?.message }, { status: 500 });
  }
}
