import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  return (
    <footer className="border-t border-border/60 bg-secondary/30 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-10 grid gap-8 md:grid-cols-4 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-brand">
              <span className="text-sm font-black text-brand-foreground">S</span>
            </div>
            <span className="font-extrabold">Simba Supermarket</span>
          </div>
          <p className="text-muted-foreground">{t("footer.tagline")}</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.shop")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/products" className="hover:text-primary">{t("footer.shop.cats")}</Link></li>
            <li><Link to="/products" search={{ sort: "popular" } as never} className="hover:text-primary">{t("footer.shop.best")}</Link></li>
            <li><Link to="/" className="hover:text-primary">{t("footer.shop.new")}</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.company")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><a href="https://www.google.com/maps/search/?api=1&query=Simba+Supermarket+Kigali+Rwanda" target="_blank" rel="noreferrer" className="hover:text-primary">{t("footer.company.about")}</a></li>
            <li><a href="mailto:hello@simba.rw" className="hover:text-primary">{t("footer.company.contact")}</a></li>
            <li><a href="mailto:careers@simba.rw" className="hover:text-primary">{t("footer.company.careers")}</a></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">{t("footer.help")}</h4>
          <ul className="space-y-2 text-muted-foreground">
            <li><Link to="/checkout" className="hover:text-primary">{t("footer.help.delivery")}</Link></li>
            <li><Link to="/cart" className="hover:text-primary">{t("footer.help.returns")}</Link></li>
            <li><Link to="/checkout" className="hover:text-primary">{t("footer.help.payment")}</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Simba Supermarket. {t("footer.rights")}
      </div>
    </footer>
  );
}
