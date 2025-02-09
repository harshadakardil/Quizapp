{
    "framework"; "nextjs",
    "buildCommand"; "cd apps/frontend && npm install && npm run build",
    "outputDirectory"; "apps/frontend/.next",
    "rewrites"; [
      {
        "source": "/api/:path*",
        "destination": "/api/:path*"
      }
    ]
  }