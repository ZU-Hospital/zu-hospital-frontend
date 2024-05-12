import createMiddleware from "next-intl/middleware";
import { type NextRequest, NextResponse } from "next/server";
import { defaultLocale } from "./next.locales";
import { homeRegex, isAuthPath } from "./lib/routes";
import { accessTokenCookie } from "./lib/cookies.server";

const intlMiddleware = createMiddleware({
	locales: ["en", "ar"],
	defaultLocale: defaultLocale.code,
	localePrefix: "as-needed",
});

export default function middleware(req: NextRequest) {
	const accessToken = accessTokenCookie.get();
	const pathname = req.nextUrl.pathname;

	if (!accessToken && !isAuthPath(pathname)) {
		if (homeRegex.test(pathname)) {
			return NextResponse.redirect(new URL("/login", req.url));
		}
	}

	if (homeRegex.test(pathname)) {
		return NextResponse.redirect(new URL("/dashboard", req.url));
	}

	return intlMiddleware(req);
}

export const config = {
	// Skip all paths that should not be internationalized
	matcher: ["/((?!api|_next|.*\\..*).*)"],
};
