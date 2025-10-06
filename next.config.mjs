/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            {
        protocol: 'https',
        hostname: 'sbejgtziknyxaylugffc.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
        ],
    },
};

export default nextConfig;
