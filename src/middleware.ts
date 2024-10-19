import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/site",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, request) => {
  const { nextUrl: url, headers } = request;
  const { pathname, searchParams } = url;

  if (pathname === "/" || pathname === "/site") {
    return NextResponse.rewrite(new URL(`/site`, request.url));
  }
  // Check if it's a public route, otherwise protect
  // if (!isPublicRoute(request)) auth().protect();

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
