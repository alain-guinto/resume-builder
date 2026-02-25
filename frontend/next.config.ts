import type { NextConfig } from "next";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

const nextConfig: NextConfig = {
  // Proxy API, auth, and Flask-rendered pages to backend
  async rewrites() {
    return [
      { source: "/api/:path*", destination: `${apiUrl}/api/:path*` },
      { source: "/auth/:path*", destination: `${apiUrl}/auth/:path*` },
      { source: "/login", destination: `${apiUrl}/login` },
      { source: "/dashboard", destination: `${apiUrl}/dashboard` },
      { source: "/upload", destination: `${apiUrl}/upload` },
      { source: "/upload/select-source", destination: `${apiUrl}/upload/select-source` },
      { source: "/editor", destination: `${apiUrl}/editor` },
      { source: "/editor/blank", destination: `${apiUrl}/editor/blank` },
      { source: "/editor/with-data", destination: `${apiUrl}/editor/with-data` },
      { source: "/template-editor", destination: `${apiUrl}/template-editor` },
      { source: "/templates", destination: `${apiUrl}/templates` },
    ];
  },
};

export default nextConfig;
