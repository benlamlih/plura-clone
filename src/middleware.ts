import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/api/uploadthing",
  "/agency/sign-in(.*)",
  "/agency/sign-up(.*)",
]);

export default clerkMiddleware((auth, request) => {
  const { nextUrl: url, headers } = request;
  const { pathname, searchParams } = url;
  const hostname = headers.get("host");

  const pathWithSearchParams = `${pathname}${searchParams ? `?${searchParams}` : ""}`;

  // Check if it's a public route, otherwise protect
  if (!isPublicRoute(request)) auth().protect();

  // Handle custom subdomain
  const customSubdomain = hostname
    ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
    .filter(Boolean)[0];

  if (customSubdomain) {
    return NextResponse.rewrite(
      new URL(`/${customSubdomain}${pathWithSearchParams}`, request.url),
    );
  }

  // Redirect for sign-in/sign-up routes
  if (pathname === "/sign-in" || pathname === "/sign-up") {
    return NextResponse.redirect(new URL(`/agency/sign-in`, request.url));
  }

  // Rewrite for root or site
  if (
    pathname === "/" ||
    (pathname === "/site" && url.host === process.env.NEXT_PUBLIC_DOMAIN)
  ) {
    return NextResponse.rewrite(new URL(`/site`, request.url));
  }

  // Rewrite for agency or subaccount routes
  if (pathname.startsWith("/agency") || pathname.startsWith("/subaccount")) {
    return NextResponse.rewrite(
      new URL(`${pathWithSearchParams}`, request.url),
    );
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
