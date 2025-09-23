import { onRequestGet as __api_templates__slug__demos_ts_onRequestGet } from "/home/tosiek/copycodeai/functions/api/templates/[slug]/demos.ts"
import { onRequestPost as __api_templates__slug__demos_ts_onRequestPost } from "/home/tosiek/copycodeai/functions/api/templates/[slug]/demos.ts"
import { onRequestGet as __api_templates__slug__ts_onRequestGet } from "/home/tosiek/copycodeai/functions/api/templates/[slug].ts"
import { onRequestPatch as __api_templates__slug__ts_onRequestPatch } from "/home/tosiek/copycodeai/functions/api/templates/[slug].ts"
import { onRequestGet as __api_ping_ts_onRequestGet } from "/home/tosiek/copycodeai/functions/api/ping.ts"
import { onRequestOptions as __api_ping_ts_onRequestOptions } from "/home/tosiek/copycodeai/functions/api/ping.ts"
import { onRequestPost as __api_send_email_ts_onRequestPost } from "/home/tosiek/copycodeai/functions/api/send-email.ts"
import { onRequestGet as __api_templates_index_ts_onRequestGet } from "/home/tosiek/copycodeai/functions/api/templates/index.ts"
import { onRequestPost as __api_templates_index_ts_onRequestPost } from "/home/tosiek/copycodeai/functions/api/templates/index.ts"
import { onRequest as __admin__debug_ts_onRequest } from "/home/tosiek/copycodeai/functions/admin/_debug.ts"
import { onRequest as __admin_login_ts_onRequest } from "/home/tosiek/copycodeai/functions/admin/login.ts"
import { onRequest as __admin_logout_ts_onRequest } from "/home/tosiek/copycodeai/functions/admin/logout.ts"
import { onRequestGet as __health_ts_onRequestGet } from "/home/tosiek/copycodeai/functions/health.ts"
import { onRequestGet as ____path___ts_onRequestGet } from "/home/tosiek/copycodeai/functions/[[path]].ts"
import { onRequest as ___middleware_ts_onRequest } from "/home/tosiek/copycodeai/functions/_middleware.ts"

export const routes = [
    {
      routePath: "/api/templates/:slug/demos",
      mountPath: "/api/templates/:slug",
      method: "GET",
      middlewares: [],
      modules: [__api_templates__slug__demos_ts_onRequestGet],
    },
  {
      routePath: "/api/templates/:slug/demos",
      mountPath: "/api/templates/:slug",
      method: "POST",
      middlewares: [],
      modules: [__api_templates__slug__demos_ts_onRequestPost],
    },
  {
      routePath: "/api/templates/:slug",
      mountPath: "/api/templates",
      method: "GET",
      middlewares: [],
      modules: [__api_templates__slug__ts_onRequestGet],
    },
  {
      routePath: "/api/templates/:slug",
      mountPath: "/api/templates",
      method: "PATCH",
      middlewares: [],
      modules: [__api_templates__slug__ts_onRequestPatch],
    },
  {
      routePath: "/api/ping",
      mountPath: "/api",
      method: "GET",
      middlewares: [],
      modules: [__api_ping_ts_onRequestGet],
    },
  {
      routePath: "/api/ping",
      mountPath: "/api",
      method: "OPTIONS",
      middlewares: [],
      modules: [__api_ping_ts_onRequestOptions],
    },
  {
      routePath: "/api/send-email",
      mountPath: "/api",
      method: "POST",
      middlewares: [],
      modules: [__api_send_email_ts_onRequestPost],
    },
  {
      routePath: "/api/templates",
      mountPath: "/api/templates",
      method: "GET",
      middlewares: [],
      modules: [__api_templates_index_ts_onRequestGet],
    },
  {
      routePath: "/api/templates",
      mountPath: "/api/templates",
      method: "POST",
      middlewares: [],
      modules: [__api_templates_index_ts_onRequestPost],
    },
  {
      routePath: "/admin/_debug",
      mountPath: "/admin",
      method: "",
      middlewares: [],
      modules: [__admin__debug_ts_onRequest],
    },
  {
      routePath: "/admin/login",
      mountPath: "/admin",
      method: "",
      middlewares: [],
      modules: [__admin_login_ts_onRequest],
    },
  {
      routePath: "/admin/logout",
      mountPath: "/admin",
      method: "",
      middlewares: [],
      modules: [__admin_logout_ts_onRequest],
    },
  {
      routePath: "/health",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [__health_ts_onRequestGet],
    },
  {
      routePath: "/:path*",
      mountPath: "/",
      method: "GET",
      middlewares: [],
      modules: [____path___ts_onRequestGet],
    },
  {
      routePath: "/",
      mountPath: "/",
      method: "",
      middlewares: [___middleware_ts_onRequest],
      modules: [],
    },
  ]