import { Component } from "react";
import i18n from "../../i18n";
import { Button } from "../ui/Button";

export class AppErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error) {
    if (typeof console !== "undefined") {
      console.error("App render failed", error);
    }
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_center,_#ffffff_0%,_#f8fafc_55%,_#e5e7eb_100%)] px-4 py-10">
        <section className="w-full max-w-xl rounded-lg border border-gray-200 bg-white/95 p-8 shadow-sm backdrop-blur-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[--color-warning]">
            {i18n.t("common:errorBoundary.eyebrow")}
          </p>
          <h1 className="mt-3 font-display text-3xl font-semibold text-[--color-text]">
            {i18n.t("common:errorBoundary.title")}
          </h1>
          <p className="mt-3 text-sm leading-7 text-[--color-text-muted]">
            {i18n.t("common:errorBoundary.body")}
          </p>
          <div className="mt-6">
            <Button
              aria-label={i18n.t("common:errorBoundary.reload")}
              onClick={() => window.location.reload()}
              tone="secondary"
            >
              {i18n.t("common:errorBoundary.reload")}
            </Button>
          </div>
        </section>
      </main>
    );
  }
}
