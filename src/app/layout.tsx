import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import { SnackbarProvider } from "@/components/ui/snackbar";
import { THEME_INIT_SCRIPT } from "@/lib/theme";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  weight: ["400", "500", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: "Vaultline", template: "%s - Vaultline" },
  description: "Watch and buy videos on Vaultline.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f0f" },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // data-theme is set by the init script before paint.
    <html lang="en" className={roboto.variable} suppressHydrationWarning>
      <head>
        {/* Static script (no user input): applies the saved theme without a flash. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="antialiased">
        <SnackbarProvider>{children}</SnackbarProvider>
      </body>
    </html>
  );
}
