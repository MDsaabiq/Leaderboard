import "./globals.css";

export const metadata = {
  title: "Tech Fest Gaming Zone Leaderboard",
  description: "Live leaderboard for Drone Arena, VR, and Robot Soccer"
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
