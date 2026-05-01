import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import logoImage from "@/assets/logo1.png";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="mt-20 border-t border-primary/10 bg-[linear-gradient(180deg,color-mix(in_oklab,var(--secondary)_75%,white),white)]">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm md:grid-cols-[1.2fr_0.9fr_0.9fr_0.9fr]">
        <div>
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-primary/12 bg-white p-1.5 shadow-sm">
              <img src={logoImage} alt="Simba Supermarket" className="h-full w-full object-contain" />
            </div>
            <div>
              <div className="display-brand text-2xl leading-none text-primary">Simba</div>
              <div className="text-[11px] font-black uppercase tracking-[0.24em] text-muted-foreground">
                Supermarket Rwanda
              </div>
            </div>
          </div>

          <p className="max-w-sm text-muted-foreground">{t("footer.tagline")}</p>

          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div>3336+H2C, KN 4 Ave, Kigali</div>
            <div>+250 788 307 200</div>
            <div>info@simbasupermarket.rw</div>
            <div>Open daily: 07:00am - 11:00pm</div>
          </div>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.shop")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/products" className="hover:text-primary">
                {t("footer.shop.cats")}
              </Link>
            </li>
            <li>
              <Link
                to="/products"
                search={{ sort: "popular" } as never}
                className="hover:text-primary"
              >
                {t("footer.shop.best")}
              </Link>
            </li>
            <li>
              <Link to="/" className="hover:text-primary">
                {t("footer.shop.new")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.company")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-primary">
                {t("footer.company.about")}
              </Link>
            </li>
            <li>
              <a href="mailto:info@simbasupermarket.rw" className="hover:text-primary">
                {t("footer.company.contact")}
              </a>
            </li>
            <li>
              <a
                href="https://simbasupermarket.rw/"
                target="_blank"
                rel="noreferrer"
                className="hover:text-primary"
              >
                {t("footer.company.careers")}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold">{t("footer.help")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li>
              <Link to="/checkout" className="hover:text-primary">
                {t("footer.help.delivery")}
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-primary">
                {t("footer.help.returns")}
              </Link>
            </li>
            <li>
              <Link to="/checkout" className="hover:text-primary">
                {t("footer.help.payment")}
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        Simba Supermarket {new Date().getFullYear()} | {t("footer.rights")}
      </div>
    </footer>
  );
}
