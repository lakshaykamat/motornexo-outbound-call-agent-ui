import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login"];
const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_DATA === "true";

function isPublic(pathname: string) {
  return PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
}

// Prefer an internal hostname for server-to-server session checks; fall back to
// the public URL when the gateway is only reachable on the public origin.
function sessionBase(): string {
  return (
    process.env.API_URL_INTERNAL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    ""
  );
}

async function validateSession(token: string): Promise<boolean> {
  const base = sessionBase();
  if (!base) return false;
  try {
    const res = await fetch(`${base}/auth/session`, {
      headers: { Cookie: `token=${token}` },
      cache: "no-store",
    });
    return res.status === 200;
  } catch {
    return false;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (MOCK_MODE) {
    if (isPublic(pathname)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("token")?.value;

  if (isPublic(pathname)) {
    if (token && (await validateSession(token))) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (!(await validateSession(token))) {
    const res = NextResponse.redirect(new URL("/login", request.url));
    // Match the cookie attributes the gateway sets so the browser actually drops it.
    res.cookies.set("token", "", { path: "/", maxAge: 0 });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|favicon|assets).*)"],
};
