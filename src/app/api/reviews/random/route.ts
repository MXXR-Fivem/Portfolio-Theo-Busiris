import { NextRequest, NextResponse } from "next/server";

const REVIEW_API_URL = "http://151.80.144.3:8090/api/reviews/random";
const REVIEW_API_BEARER_TOKEN = process.env.REVIEW_API_BEARER_TOKEN;

export async function GET(request: NextRequest) {
    if (!REVIEW_API_BEARER_TOKEN) {
        return NextResponse.json(
            { error: "Missing REVIEW_API_BEARER_TOKEN" },
            { status: 500 }
        );
    }

    const limit = request.nextUrl.searchParams.get("limit") || "3";

    try {
        const response = await fetch(`${REVIEW_API_URL}?limit=${limit}`, {
            headers: {
                Authorization: `Bearer ${REVIEW_API_BEARER_TOKEN}`,
                Accept: "application/json",
            },
            cache: "no-store",
        });

        if (!response.ok) {
            return NextResponse.json(
                { error: `Reviews upstream HTTP error: ${response.status}` },
                { status: response.status }
            );
        }

        const payload = await response.json();

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "no-store, max-age=0",
            },
        });
    } catch (error) {
        const message =
            error instanceof Error ? error.message : "Unknown reviews error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
