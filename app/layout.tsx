//app/layout.tsx
import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta name="description" content="Katkot - Your ultimate social media platform for sharing moments and connecting with friends." />
                <meta name="keywords" content="Katkot, social media, share, connect, friends, moments, photos, videos" />
                <meta property="og:title" content="Katkot - Connect and Share" />
                <meta property="og:description" content="Katkot - Your ultimate social media platform for sharing moments and connecting with friends." />
                <meta property="og:image" content="/public/logo1.png" /> {/* Replace with your actual logo path */}
                <meta property="og:url" content="https://www.katkot.com" /> {/* Replace with your actual website URL */}
                <meta property="og:type" content="website" />
                <link rel="shortcut icon" href="../static/favico.png"  />
                <title>Katkot</title>
            </head>
            <body>{children}</body>
        </html>
    );
}