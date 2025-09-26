//app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <link rel="shortcut icon" href="../static/favico.png"  />
                <title>Katkot</title>
            </head>
            <body>{children}</body>
        </html>
    );
}