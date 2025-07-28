#!/bin/bash
# SPDX-License-Identifier: MIT
# SPDX-FileCopyrightText: Copyright 2025 OpenQL Project

# Development server fix script for ENOENT buildManifest errors

echo "🔧 Fixing Next.js development server issues..."

# Kill any existing Next.js processes
echo "🔪 Killing existing Next.js processes..."
pkill -f "next dev" || true

# Clean build cache
echo "🧹 Cleaning build cache..."
rm -rf .next
rm -rf node_modules/.cache

# Clear npm cache if needed
echo "🗑️  Clearing npm cache..."
npm cache clean --force

echo "✅ Cleanup complete! Starting development server..."
npm run dev