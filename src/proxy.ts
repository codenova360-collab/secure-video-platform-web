import { type NextRequest, NextResponse } from "next/server";

/**
 * Sends signed-out visitors from account, library, and checkout pages to sign-in (UX only — the
 * API is the authority and rejects requests without a valid session).
 */
export function proxy(request: NextRequest) {
  if (!request.cookies.has("svp_session")) {
    const login = new URL("/login", request.url);
    // Keep the query (e.g. the payment reference on /checkout/callback).
    login.searchParams.set(
      "next",
      request.nextUrl.pathname + request.nextUrl.search,
    );
    return NextResponse.redirect(login);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/library/:path*", "/checkout/:path*"],
};
