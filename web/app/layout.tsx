import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "FormBot Studio | Human Imitation Engine",
    description: "Automate forms with smart persona-driven AI",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="antialiased">
                {children}
            </body>
        </html>
    );
}
