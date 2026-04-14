export { default } from "next-auth/middleware";

export const config = {
  // Protect all routes except /login and the NextAuth APIs themselves
  matcher: ["/((?!login|api|_next/static|_next/image|favicon.ico).*)"],
};
