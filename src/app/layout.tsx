import type { Metadata } from "next";

import { Amiri, Aref_Ruqaa, Inter, Marcellus } from "next/font/google";

import { GlobalCelestialLayer } from "@/components/common/GlobalCelestialLayer";
import { AppChrome } from "@/components/layout/AppChrome";
import { TabLifecycleProvider } from "@/components/providers/TabLifecycleProvider";

import { ThemeProvider } from "@/components/providers/theme-provider";

import { TooltipProvider } from "@/components/ui/tooltip";

import "./globals.css";



const inter = Inter({

  subsets: ["latin"],

  variable: "--font-inter",

  display: "swap",

});



const marcellus = Marcellus({

  subsets: ["latin"],

  weight: "400",

  variable: "--font-marcellus",

  display: "swap",

});



const arefRuqaa = Aref_Ruqaa({

  subsets: ["arabic", "latin"],

  weight: ["400", "700"],

  variable: "--font-aref",

  display: "swap",

});

const amiri = Amiri({
  subsets: ["arabic", "latin"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});



export const metadata: Metadata = {

  title: "Nawā | نَوَاة — The Celestial Scribe",

  description:

    "Reclaim shattered Arabic roots from the stars. Weave patterns in the Sanctum and test your syntax in the Crucible.",

};



export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {

  return (

    <html lang="en" suppressHydrationWarning>

      <body

        className={`${inter.variable} ${marcellus.variable} ${arefRuqaa.variable} ${amiri.variable} font-sans min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0B0F19] to-black text-slate-100 antialiased`}

      >

        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>

          <TabLifecycleProvider>

          <TooltipProvider delayDuration={200}>

            <GlobalCelestialLayer />

            <div className="relative z-10 flex min-h-screen w-full flex-col">
              <AppChrome>
                <div className="game-stage">{children}</div>
              </AppChrome>
            </div>

          </TooltipProvider>

          </TabLifecycleProvider>

        </ThemeProvider>

      </body>

    </html>

  );

}

