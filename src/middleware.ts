import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { locales, defaultLocale } from "./i18n/config";

// Middleware de next-intl
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always", // Siempre agregar locale en URLs
});

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Skip middleware for API routes
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // 1. Ejecutar middleware de i18n
  const response = intlMiddleware(request);

  // 2. Crear cliente de Supabase con configuración de cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            // Configurar cookies con tiempo de expiración de 2 horas
            const cookieOptions = {
              ...options,
              maxAge: 7200, // 2 horas en segundos
              httpOnly: true,
              secure: process.env.NODE_ENV === "production",
              sameSite: "lax" as const,
            };
            response.cookies.set(name, value, cookieOptions);
          });
        },
      },
    },
  );

  // 3. Verificar autenticación
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Proteger rutas privadas
  const segments = pathname.split("/").filter(Boolean);
  const locale = locales.includes(segments[0] as any)
    ? segments[0]
    : defaultLocale;
  const pathWithoutLocale =
    "/" +
    segments.slice(locales.includes(segments[0] as any) ? 1 : 0).join("/");

  const protectedPaths = ["/projects/new", "/my-projects", "/edit", "/roadmap"];
  const isProtectedPath = protectedPaths.some((path) =>
    pathWithoutLocale.includes(path),
  );

  if (!user && isProtectedPath) {
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/login`;
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
