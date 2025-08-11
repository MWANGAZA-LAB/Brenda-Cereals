import { NextResponse } from 'next/server';
// List of supported locales
const locales = ['en', 'sw'];
const defaultLocale = 'en';
function getLocale(request) {
    // Check if there is any supported locale in the pathname
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = locales.every((locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`);
    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        // Try to get locale from Accept-Language header
        const acceptLanguage = request.headers.get('Accept-Language');
        let locale = defaultLocale;
        if (acceptLanguage) {
            // Simple locale detection from Accept-Language header
            if (acceptLanguage.includes('sw')) {
                locale = 'sw';
            }
        }
        return locale;
    }
    // Return existing locale from pathname
    const locale = locales.find((locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`);
    return locale || defaultLocale;
}
export function middleware(request) {
    // Check if there is any supported locale in the pathname
    const pathname = request.nextUrl.pathname;
    const pathnameIsMissingLocale = locales.every((locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`);
    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request);
        // Redirect to the same URL with the locale prefix
        return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url));
    }
    return NextResponse.next();
}
export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
};
