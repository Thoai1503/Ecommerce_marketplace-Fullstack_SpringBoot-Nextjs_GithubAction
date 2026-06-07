import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {
    root: __dirname,
  },
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        port: "", // để trống
        pathname: "/**", // cho phép mọi path
      },
      // Nếu bạn dùng thêm domain khác (ví dụ Cloudinary sau này)
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "thumbs.dreamstime.com", pathname: "/**" },
      { protocol: "https", hostname: "img.freepik.com", pathname: "/**" },
      { protocol: "https", hostname: "content.abt.com", pathname: "/**" },
      { protocol: "https", hostname: "m.media-amazon.com", pathname: "/**" },
      { protocol: "https", hostname: "c8.alamy.com", pathname: "/**" },
      { protocol: "https", hostname: "via.placeholder.com", pathname: "/**" },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dizx3mbgw/**", // cụ thể hơn cho res.cloudinary.com/dizx3mbgw
      },
      {
        protocol: "https",
        hostname: "salt.tikicdn.com",
        pathname: "/ts/tikimsp/**", // cụ thể hơn cho salt.tikicdn.com/ts/tikimsp
      },
      {
        protocol: "https",
        hostname: "salt.tikicdn.com",
        pathname: "/cache/**", // cụ thể hơn cho salt.tikicdn.com/cache
      },

      {
        protocol: "http",
        hostname: "res.cloudinary.com",
        pathname: "/dizx3mbgw/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dizx3mbgw/**",
      },
      {
        protocol: "https",
        hostname: "www.shutterstock.com",
        port: "",
        pathname: "/**", // cho phép mọi path
      },
      {
        protocol: "https",
        hostname: "image.shutterstock.com",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "thumb*.shutterstock.com", // wildcard cho thumb1, thumb2,...
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ak.picdn.net",
        port: "",
        pathname: "/shutterstock/**", // cụ thể hơn cho ak.picdn
      },
    ],
  },
};

export default nextConfig;
