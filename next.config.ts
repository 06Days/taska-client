import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  
  

};
module.exports = {
  reactStrictImport: true,
  // turbopack(config, {isServer}){
  //   if(!isServer){
  //     config.resolve.alias['bootstrap'] = require.resolve('bootstrap');
  //   }
  //   return config;
  // }
}

export default nextConfig;
