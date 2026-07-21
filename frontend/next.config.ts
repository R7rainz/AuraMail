import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The API base URL is read from NEXT_PUBLIC_API_URL where it is used, so it
  // needs no mapping here. A bare `API_URL` entry used to sit in this block
  // defaulting to port 3001; nothing referenced it, and during a deploy it
  // reads like the setting you are supposed to change.
};

export default nextConfig;
