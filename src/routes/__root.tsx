import { Outlet, createRootRoute, Link } from "@tanstack/react-router";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider, getStoredLang, translate } from "@/lib/i18n";
import { CurrencyProvider } from "@/lib/currency";
import { CartProvider } from "@/lib/cart";
import { AuthProvider } from "@/lib/auth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  const lang = getStoredLang();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-extrabold text-gradient-brand">404</h1>
        <h2 className="mt-4 text-xl font-semibold">{translate(lang, "notFound.title")}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{translate(lang, "notFound.body")}</p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-full gradient-brand px-5 py-2.5 text-sm font-semibold text-brand-foreground"
          >
            {translate(lang, "notFound.back")}
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => {
    const lang = getStoredLang();

    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { title: translate(lang, "meta.siteTitle") },
        {
          name: "description",
          content: translate(lang, "meta.siteDescription"),
        },
        { property: "og:title", content: translate(lang, "meta.siteTitle") },
        {
          property: "og:description",
          content: translate(lang, "meta.siteDescription"),
        },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: translate(lang, "meta.siteTitle") },
        {
          name: "twitter:description",
          content: translate(lang, "meta.siteDescription"),
        },
        {
          property: "og:image",
          content:
            "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b5644517-2072-4efb-b28f-1e5b6de355e5/id-preview-9ba03a05--8df771c7-753a-47a6-8b36-e6c8083a242d.lovable.app-1776759013624.png",
        },
        {
          name: "twitter:image",
          content:
            "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b5644517-2072-4efb-b28f-1e5b6de355e5/id-preview-9ba03a05--8df771c7-753a-47a6-8b36-e6c8083a242d.lovable.app-1776759013624.png",
        },
      ],
    };
  },
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <ThemeProvider>
      <I18nProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <div className="flex min-h-screen flex-col">
                <Header />
                <main className="flex-1">
                  <Outlet />
                </main>
                <Footer />
              </div>
              <Toaster richColors position="top-center" />
            </CartProvider>
          </AuthProvider>
        </CurrencyProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}
