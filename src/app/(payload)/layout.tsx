/**
 * Payload Layout — root layout untuk admin panel.
 * WAJIB memakai RootLayout dari Payload agar seluruh context provider admin
 * (config, theme, dll) terpasang di sisi client. Jangan diganti <html> manual.
 */

import type { ServerFunctionClient } from "payload";
import config from "@payload-config";
import "@payloadcms/next/css";
import { RootLayout, handleServerFunctions } from "@payloadcms/next/layouts";
import React from "react";

import { importMap } from "./admin/importMap.js";
import "./custom.css"; // override brand persona (setelah CSS Payload)

type Args = {
  children: React.ReactNode;
};

const serverFunction: ServerFunctionClient = async function (args) {
  "use server";
  return handleServerFunctions({
    ...args,
    config,
    importMap,
  });
};

const Layout = ({ children }: Args) => (
  <RootLayout config={config} importMap={importMap} serverFunction={serverFunction}>
    {children}
  </RootLayout>
);

export default Layout;
