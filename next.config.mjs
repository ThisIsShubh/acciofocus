/** @type {import('next').NextConfig} */
const nextConfig = {
    allowedDevOrigins: [
    'http://192.168.56.1',
    'https://192.168.56.1',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://127.0.0.1:3000',
  ],
};

export default nextConfig;
