import './globals.css';

export const metadata = {
  title: 'Signature Injection Engine',
  description: 'PDF signature injection prototype',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
