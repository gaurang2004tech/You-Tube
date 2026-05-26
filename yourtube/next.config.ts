import type { NextConfig } from "next";

import path from 'path';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // @ts-ignore - Turbopack root config is recognized at top level in this version
  turbopack: {
    root: path.resolve(__dirname, '../'),
  },
};

export default nextConfig;
