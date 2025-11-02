import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
<<<<<<< HEAD
=======
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
<<<<<<< HEAD
        protocol: 'https' ,
=======
        protocol: 'https',
>>>>>>> cb4c034c204ea3197443d50d39cc11865d10f9d0
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
