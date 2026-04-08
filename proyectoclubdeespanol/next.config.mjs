/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'img.lavdg.com', // 👈 ¡Añade esto para tu foto de prueba!
      },      
    ],
  },
}

export default nextConfig
