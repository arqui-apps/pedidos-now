export const metadata = {
  title: 'Chats Service',
  description: 'Servicio de chats con Next.js y Prisma',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body style={{ fontFamily: 'Arial, sans-serif', padding: '24px' }}>
        {children}
      </body>
    </html>
  );
}