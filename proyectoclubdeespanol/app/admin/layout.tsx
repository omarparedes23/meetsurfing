// Admin layout: standalone shell without the public Navbar/Footer.
// Auth guard is handled inside each admin page.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
