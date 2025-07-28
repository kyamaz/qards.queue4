// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright 2025 OpenQL Project
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix for ENOENT buildManifest.js.tmp errors during development
  experimental: {
    // Disable build cache optimizations that can cause file conflicts
    turbotrace: {
      logLevel: 'error'
    }
  },
  // Ensure stable file generation during hot reloads
  generateBuildId: async () => {
    // Use a more stable build ID in development
    return process.env.NODE_ENV === 'development' 
      ? 'development-build'
      : null;
  }
};

export default nextConfig;
