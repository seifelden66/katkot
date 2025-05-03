//app/layout.tsx
// export const metadata = {
//     title: 'Katkot',
//     description: 'A social media platform',

// };


export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <head>
                <link rel="shortcut icon" href="../static/favico.png"  />
                <title>kkkkk</title>
            </head>
            <body>{children}</body>
        </html>
    );
}