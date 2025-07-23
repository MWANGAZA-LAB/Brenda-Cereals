import type { NextConfig } from "next";

const { i18n } = require('./next-i18next.config');

const nextConfig: NextConfig = {
  i18n,
  /* config options here */
};

module.exports = nextConfig;
