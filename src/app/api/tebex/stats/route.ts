import { NextResponse } from "next/server";

const TEBEX_SECRET = process.env.TEBEX_GAME_SERVER_KEY;
const TEBEX_BASE_URL = "https://plugin.tebex.io/payments?paged=1&page=";

type TebexPayment = {
    email?: string;
    player?: {
        id?: string | number;
    };
};

type TebexPaymentsResponse = {
    total?: number;
    last_page?: number;
    data?: TebexPayment[];
};

type TebexStatsResponse = {
    totalSales: number;
    totalCustomers: number;
};

async function fetchPaymentsPage(page: number): Promise<TebexPaymentsResponse> {
    const response = await fetch(`${TEBEX_BASE_URL}${page}`, {
        method: "GET",
        headers: {
            "X-Tebex-Secret": TEBEX_SECRET || "",
            Accept: "application/json",
        },
        next: { revalidate: 300 },
    });

    if (!response.ok) {
        throw new Error(`Tebex HTTP error: ${response.status}`);
    }

    return response.json();
}

function addUniqueCustomers(
    payments: TebexPayment[] | undefined,
    uniqueCustomers: Set<string>
) {
    if (!payments) {
        return;
    }

    for (const payment of payments) {
        const playerId = payment.player?.id;
        const email = payment.email?.trim().toLowerCase();

        if (playerId !== undefined && playerId !== null) {
            uniqueCustomers.add(`player:${playerId}`);
            continue;
        }

        if (email) {
            uniqueCustomers.add(`email:${email}`);
        }
    }
}

export async function GET() {
    if (!TEBEX_SECRET) {
        return NextResponse.json(
            { error: "Missing TEBEX_SECRET" },
            { status: 500 }
        );
    }

    try {
        const firstPage = await fetchPaymentsPage(1);

        const totalSales = Number(firstPage.total || 0);
        const lastPage = Number(firstPage.last_page || 1);

        const uniqueCustomers = new Set<string>();
        addUniqueCustomers(firstPage.data, uniqueCustomers);

        if (lastPage > 1) {
            const remainingPages = await Promise.all(
                Array.from({ length: lastPage - 1 }, (_, index) =>
                fetchPaymentsPage(index + 2)
                )
            );

            for (const page of remainingPages) {
                addUniqueCustomers(page.data, uniqueCustomers);
            }
        }

        const payload: TebexStatsResponse = {
            totalSales,
            totalCustomers: uniqueCustomers.size,
        };

        return NextResponse.json(payload, {
            status: 200,
            headers: {
                "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
            },
        });
    } catch (error) {
        const message =
        error instanceof Error ? error.message : "Unknown Tebex error";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}