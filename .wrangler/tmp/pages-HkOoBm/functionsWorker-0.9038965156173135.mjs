var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../.wrangler/tmp/bundle-hCDQeE/checked-fetch.js
var urls = /* @__PURE__ */ new Set();
function checkURL(request, init) {
  const url = request instanceof URL ? request : new URL(
    (typeof request === "string" ? new Request(request, init) : request).url
  );
  if (url.port && url.port !== "443" && url.protocol === "https:") {
    if (!urls.has(url.toString())) {
      urls.add(url.toString());
      console.warn(
        `WARNING: known issue with \`fetch()\` requests to custom HTTPS ports in published Workers:
 - ${url.toString()} - the custom port will be ignored when the Worker is published using the \`wrangler deploy\` command.
`
      );
    }
  }
}
__name(checkURL, "checkURL");
globalThis.fetch = new Proxy(globalThis.fetch, {
  apply(target, thisArg, argArray) {
    const [request, init] = argArray;
    checkURL(request, init);
    return Reflect.apply(target, thisArg, argArray);
  }
});

// api/templates/[slug]/demos.ts
var send = /* @__PURE__ */ __name((d, s = 200) => new Response(JSON.stringify(d), { status: s, headers: { "content-type": "application/json" } }), "send");
var onRequestGet = /* @__PURE__ */ __name(async ({ env, params, request }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send({ error: "D1 binding 'DB' missing" }, 500);
    const slug = String(params?.slug || "");
    const url = new URL(request.url);
    const limitRaw = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), 200);
    const { results } = await DB.prepare(
      "SELECT id, payload, result, created_at FROM demos WHERE template_slug=?1 ORDER BY id DESC LIMIT ?2"
    ).bind(slug, limit).all();
    return send(results ?? []);
  } catch (e) {
    return send({ error: "Unhandled error (GET demos)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestGet");
var onRequestPost = /* @__PURE__ */ __name(async ({ env, params, request }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send({ error: "D1 binding 'DB' missing" }, 500);
    const templateSlug = String(params?.slug || "");
    const exists = await DB.prepare("SELECT 1 FROM templates WHERE slug=?1").bind(templateSlug).first();
    if (!exists) return send({ error: "Template not found" }, 404);
    let body;
    try {
      body = await request.json();
    } catch {
      body = null;
    }
    const clientEmail = typeof body?.client_email === "string" && body.client_email.trim() || "anon@local";
    let expiresAt;
    if (typeof body?.expires_at === "string" && body.expires_at.trim()) {
      expiresAt = body.expires_at.trim();
    } else {
      const d = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      expiresAt = d.toISOString();
    }
    const payload = body ? JSON.stringify(body) : "{}";
    const res = await DB.prepare(
      "INSERT INTO demos (template_slug, client_email, expires_at, payload, result, created_at) VALUES (?1, ?2, ?3, ?4, NULL, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
    ).bind(templateSlug, clientEmail, expiresAt, payload).run();
    return send({ ok: true, template_slug: templateSlug, demo_id: res.meta.last_row_id }, 201);
  } catch (e) {
    return send({ error: "Unhandled error (POST demo)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestPost");

// api/templates/[slug].ts
var send2 = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json" } }), "send");
var onRequestGet2 = /* @__PURE__ */ __name(async ({ env, params }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send2({ error: "D1 binding 'DB' missing" }, 500);
    const slug = String(params?.slug || "");
    const row = await DB.prepare(
      "SELECT slug, title, body, meta, project_name, subdomain, status, created_at, updated_at FROM templates WHERE slug=?1"
    ).bind(slug).first();
    return row ? send2(row) : send2({ error: "Not found" }, 404);
  } catch (e) {
    return send2({ error: "Unhandled error (GET one)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestGet");
var onRequestPatch = /* @__PURE__ */ __name(async ({ env, params, request }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send2({ error: "D1 binding 'DB' missing" }, 500);
    const slug = String(params?.slug || "");
    let body;
    try {
      body = await request.json();
    } catch {
      return send2({ error: "Invalid JSON" }, 400);
    }
    const fields = [];
    const binds = [];
    if (typeof body.title === "string") {
      fields.push("title=?" + (fields.length + 1));
      binds.push(body.title.trim());
    }
    if (typeof body.body === "string" || body.body === null) {
      fields.push("body=?" + (fields.length + 1));
      binds.push(body.body ?? null);
    }
    if (body.meta !== void 0) {
      fields.push("meta=?" + (fields.length + 1));
      binds.push(body.meta === null ? null : JSON.stringify(body.meta));
    }
    if (typeof body.project_name === "string") {
      fields.push("project_name=?" + (fields.length + 1));
      binds.push(body.project_name.trim());
    }
    if (typeof body.subdomain === "string") {
      fields.push("subdomain=?" + (fields.length + 1));
      binds.push(body.subdomain.trim());
    }
    if (typeof body.status === "string") {
      fields.push("status=?" + (fields.length + 1));
      binds.push(body.status.trim());
    }
    fields.push("updated_at=?" + (fields.length + 1));
    binds.push((/* @__PURE__ */ new Date()).toISOString());
    if (!fields.length) return send2({ error: "No updatable fields" }, 400);
    const sql = "UPDATE templates SET " + fields.join(", ") + " WHERE slug=?" + (fields.length + 1);
    binds.push(slug);
    const res = await DB.prepare(sql).bind(...binds).run();
    if (res.meta.changes === 0) return send2({ error: "Not found" }, 404);
    return send2({ ok: true });
  } catch (e) {
    return send2({ error: "Unhandled error (PATCH)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestPatch");

// api/ping.ts
var CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type"
};
var onRequestOptions = /* @__PURE__ */ __name(async () => new Response(null, { status: 204, headers: CORS }), "onRequestOptions");
var onRequestGet3 = /* @__PURE__ */ __name(async () => {
  const body = JSON.stringify({ ok: true, version: "v3" });
  const headers = {
    "content-type": "application/json",
    ...CORS,
    "x-func-version": "v3"
  };
  return new Response(body, { status: 200, headers });
}, "onRequestGet");

// api/templates/index.ts
var send3 = /* @__PURE__ */ __name((data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json", "X-Func-Version": "v3" }
}), "send");
var onRequestGet4 = /* @__PURE__ */ __name(async ({ env, request }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send3({ version: "v3", error: "D1 binding 'DB' missing" }, 500);
    const url = new URL(request.url);
    const limitRaw = parseInt(url.searchParams.get("limit") || "50", 10);
    const limit = Number.isNaN(limitRaw) ? 50 : Math.min(Math.max(limitRaw, 1), 200);
    const q = url.searchParams.get("q");
    let stmt;
    if (q) {
      stmt = DB.prepare(
        "SELECT slug, title, created_at FROM templates WHERE title LIKE ?1 ORDER BY created_at DESC LIMIT ?2"
      ).bind("%" + q + "%", limit);
    } else {
      stmt = DB.prepare(
        "SELECT slug, title, created_at FROM templates ORDER BY created_at DESC LIMIT ?1"
      ).bind(limit);
    }
    const { results } = await stmt.all();
    return send3({ version: "v3", results: results ?? [] });
  } catch (e) {
    return send3({ version: "v3", error: "Unhandled error (GET)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestGet");
var onRequestPost2 = /* @__PURE__ */ __name(async ({ env, request }) => {
  try {
    const DB = env?.DB;
    if (!DB) return send3({ version: "v3", error: "D1 binding 'DB' missing" }, 500);
    let body;
    try {
      body = await request.json();
    } catch {
      return send3({ version: "v3", error: "Invalid JSON" }, 400);
    }
    const title = typeof body?.title === "string" ? body.title.trim() : "";
    if (!title) return send3({ version: "v3", error: "Missing field: title" }, 400);
    const slug = typeof body.slug === "string" && body.slug.trim() || crypto.randomUUID();
    const projectName = typeof body.project_name === "string" && body.project_name.trim() || slug;
    const subdomain = typeof body.subdomain === "string" && body.subdomain.trim() || slug;
    const content = typeof body.body === "string" ? body.body : null;
    const meta = body?.meta !== void 0 ? JSON.stringify(body.meta) : null;
    try {
      await DB.prepare(
        "INSERT INTO templates (slug, title, project_name, subdomain, body, meta, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, strftime('%Y-%m-%dT%H:%M:%fZ','now'))"
      ).bind(slug, title, projectName, subdomain, content, meta).run();
    } catch (err) {
      return send3({ version: "v3", error: "DB error (INSERT)", detail: String(err?.message || err) }, 500);
    }
    return send3({ version: "v3", ok: true, slug }, 201);
  } catch (e) {
    return send3({ version: "v3", error: "Unhandled error (POST)", detail: String(e?.message || e) }, 500);
  }
}, "onRequestPost");

// admin/_debug.ts
var onRequest = /* @__PURE__ */ __name(async ({ request }) => {
  const email = request.headers.get("CF-Access-Authenticated-User-Email") || "n/a";
  const hasJWT = request.headers.get("CF-Access-Jwt-Assertion") ? "present" : "absent";
  return new Response(JSON.stringify({ email, jwt: hasJWT }, null, 2), {
    headers: { "content-type": "application/json" }
  });
}, "onRequest");

// admin/login.ts
var onRequest2 = /* @__PURE__ */ __name(async ({ request, env }) => {
  const url = new URL(request.url);
  const team = (env.CF_ACCESS_TEAM_DOMAIN || "").replace(/\/$/, "");
  const aud = env.CF_ACCESS_AUD || "";
  if (!team || !aud) {
    return new Response("Missing CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD", { status: 500 });
  }
  const redirectURL = new URL("/admin/", url.origin).toString();
  const loginURL = `${team}/cdn-cgi/access/login?redirect_url=${encodeURIComponent(redirectURL)}&aud=${encodeURIComponent(aud)}`;
  return new Response(null, { status: 302, headers: { Location: loginURL } });
}, "onRequest");

// admin/logout.ts
var onRequest3 = /* @__PURE__ */ __name(async ({ env }) => {
  const team = (env.CF_ACCESS_TEAM_DOMAIN || "").replace(/\/$/, "");
  const url = team ? `${team}/cdn-cgi/access/logout` : "/";
  return new Response(null, { status: 302, headers: { Location: url } });
}, "onRequest");

// health.ts
var onRequestGet5 = /* @__PURE__ */ __name(async () => new Response("ok", { status: 200, headers: { "content-type": "text/plain" } }), "onRequestGet");

// _middleware.ts
var CORS2 = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PATCH,OPTIONS",
  "access-control-allow-headers": "content-type"
};
function withCors(res, extra = {}) {
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS2)) headers.set(k, v);
  for (const [k, v] of Object.entries(extra)) headers.set(k, v);
  return new Response(res.body, { status: res.status, headers });
}
__name(withCors, "withCors");
var onRequest4 = /* @__PURE__ */ __name(async ({ request, next }) => {
  const url = new URL(request.url);
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS2 });
  }
  if (url.pathname.startsWith("/admin")) {
    if (url.pathname.startsWith("/admin/login") || url.pathname.startsWith("/admin/logout") || url.pathname.startsWith("/admin/_debug")) {
      const res3 = await next();
      return withCors(res3, { "x-func-version": "v3" });
    }
    const hasHeader = !!request.headers.get("CF-Access-Jwt-Assertion");
    const hasCookie = (request.headers.get("Cookie") || "").includes("CF_Authorization=");
    if (!hasHeader && !hasCookie) {
      return withCors(
        new Response(null, { status: 302, headers: { Location: "/admin/login" } })
      );
    }
    const res2 = await next();
    return withCors(res2, { "x-func-version": "v3" });
  }
  const res = await next();
  return withCors(res, { "x-func-version": "v3" });
}, "onRequest");

// ../.wrangler/tmp/pages-HkOoBm/functionsRoutes-0.023326469254466575.mjs
var routes = [
  {
    routePath: "/api/templates/:slug/demos",
    mountPath: "/api/templates/:slug",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet]
  },
  {
    routePath: "/api/templates/:slug/demos",
    mountPath: "/api/templates/:slug",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost]
  },
  {
    routePath: "/api/templates/:slug",
    mountPath: "/api/templates",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet2]
  },
  {
    routePath: "/api/templates/:slug",
    mountPath: "/api/templates",
    method: "PATCH",
    middlewares: [],
    modules: [onRequestPatch]
  },
  {
    routePath: "/api/ping",
    mountPath: "/api",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet3]
  },
  {
    routePath: "/api/ping",
    mountPath: "/api",
    method: "OPTIONS",
    middlewares: [],
    modules: [onRequestOptions]
  },
  {
    routePath: "/api/templates",
    mountPath: "/api/templates",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet4]
  },
  {
    routePath: "/api/templates",
    mountPath: "/api/templates",
    method: "POST",
    middlewares: [],
    modules: [onRequestPost2]
  },
  {
    routePath: "/admin/_debug",
    mountPath: "/admin",
    method: "",
    middlewares: [],
    modules: [onRequest]
  },
  {
    routePath: "/admin/login",
    mountPath: "/admin",
    method: "",
    middlewares: [],
    modules: [onRequest2]
  },
  {
    routePath: "/admin/logout",
    mountPath: "/admin",
    method: "",
    middlewares: [],
    modules: [onRequest3]
  },
  {
    routePath: "/health",
    mountPath: "/",
    method: "GET",
    middlewares: [],
    modules: [onRequestGet5]
  },
  {
    routePath: "/",
    mountPath: "/",
    method: "",
    middlewares: [onRequest4],
    modules: []
  }
];

// ../node_modules/path-to-regexp/dist.es2015/index.js
function lexer(str) {
  var tokens = [];
  var i = 0;
  while (i < str.length) {
    var char = str[i];
    if (char === "*" || char === "+" || char === "?") {
      tokens.push({ type: "MODIFIER", index: i, value: str[i++] });
      continue;
    }
    if (char === "\\") {
      tokens.push({ type: "ESCAPED_CHAR", index: i++, value: str[i++] });
      continue;
    }
    if (char === "{") {
      tokens.push({ type: "OPEN", index: i, value: str[i++] });
      continue;
    }
    if (char === "}") {
      tokens.push({ type: "CLOSE", index: i, value: str[i++] });
      continue;
    }
    if (char === ":") {
      var name = "";
      var j = i + 1;
      while (j < str.length) {
        var code = str.charCodeAt(j);
        if (
          // `0-9`
          code >= 48 && code <= 57 || // `A-Z`
          code >= 65 && code <= 90 || // `a-z`
          code >= 97 && code <= 122 || // `_`
          code === 95
        ) {
          name += str[j++];
          continue;
        }
        break;
      }
      if (!name)
        throw new TypeError("Missing parameter name at ".concat(i));
      tokens.push({ type: "NAME", index: i, value: name });
      i = j;
      continue;
    }
    if (char === "(") {
      var count = 1;
      var pattern = "";
      var j = i + 1;
      if (str[j] === "?") {
        throw new TypeError('Pattern cannot start with "?" at '.concat(j));
      }
      while (j < str.length) {
        if (str[j] === "\\") {
          pattern += str[j++] + str[j++];
          continue;
        }
        if (str[j] === ")") {
          count--;
          if (count === 0) {
            j++;
            break;
          }
        } else if (str[j] === "(") {
          count++;
          if (str[j + 1] !== "?") {
            throw new TypeError("Capturing groups are not allowed at ".concat(j));
          }
        }
        pattern += str[j++];
      }
      if (count)
        throw new TypeError("Unbalanced pattern at ".concat(i));
      if (!pattern)
        throw new TypeError("Missing pattern at ".concat(i));
      tokens.push({ type: "PATTERN", index: i, value: pattern });
      i = j;
      continue;
    }
    tokens.push({ type: "CHAR", index: i, value: str[i++] });
  }
  tokens.push({ type: "END", index: i, value: "" });
  return tokens;
}
__name(lexer, "lexer");
function parse(str, options) {
  if (options === void 0) {
    options = {};
  }
  var tokens = lexer(str);
  var _a = options.prefixes, prefixes = _a === void 0 ? "./" : _a, _b = options.delimiter, delimiter = _b === void 0 ? "/#?" : _b;
  var result = [];
  var key = 0;
  var i = 0;
  var path = "";
  var tryConsume = /* @__PURE__ */ __name(function(type) {
    if (i < tokens.length && tokens[i].type === type)
      return tokens[i++].value;
  }, "tryConsume");
  var mustConsume = /* @__PURE__ */ __name(function(type) {
    var value2 = tryConsume(type);
    if (value2 !== void 0)
      return value2;
    var _a2 = tokens[i], nextType = _a2.type, index = _a2.index;
    throw new TypeError("Unexpected ".concat(nextType, " at ").concat(index, ", expected ").concat(type));
  }, "mustConsume");
  var consumeText = /* @__PURE__ */ __name(function() {
    var result2 = "";
    var value2;
    while (value2 = tryConsume("CHAR") || tryConsume("ESCAPED_CHAR")) {
      result2 += value2;
    }
    return result2;
  }, "consumeText");
  var isSafe = /* @__PURE__ */ __name(function(value2) {
    for (var _i = 0, delimiter_1 = delimiter; _i < delimiter_1.length; _i++) {
      var char2 = delimiter_1[_i];
      if (value2.indexOf(char2) > -1)
        return true;
    }
    return false;
  }, "isSafe");
  var safePattern = /* @__PURE__ */ __name(function(prefix2) {
    var prev = result[result.length - 1];
    var prevText = prefix2 || (prev && typeof prev === "string" ? prev : "");
    if (prev && !prevText) {
      throw new TypeError('Must have text between two parameters, missing text after "'.concat(prev.name, '"'));
    }
    if (!prevText || isSafe(prevText))
      return "[^".concat(escapeString(delimiter), "]+?");
    return "(?:(?!".concat(escapeString(prevText), ")[^").concat(escapeString(delimiter), "])+?");
  }, "safePattern");
  while (i < tokens.length) {
    var char = tryConsume("CHAR");
    var name = tryConsume("NAME");
    var pattern = tryConsume("PATTERN");
    if (name || pattern) {
      var prefix = char || "";
      if (prefixes.indexOf(prefix) === -1) {
        path += prefix;
        prefix = "";
      }
      if (path) {
        result.push(path);
        path = "";
      }
      result.push({
        name: name || key++,
        prefix,
        suffix: "",
        pattern: pattern || safePattern(prefix),
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    var value = char || tryConsume("ESCAPED_CHAR");
    if (value) {
      path += value;
      continue;
    }
    if (path) {
      result.push(path);
      path = "";
    }
    var open = tryConsume("OPEN");
    if (open) {
      var prefix = consumeText();
      var name_1 = tryConsume("NAME") || "";
      var pattern_1 = tryConsume("PATTERN") || "";
      var suffix = consumeText();
      mustConsume("CLOSE");
      result.push({
        name: name_1 || (pattern_1 ? key++ : ""),
        pattern: name_1 && !pattern_1 ? safePattern(prefix) : pattern_1,
        prefix,
        suffix,
        modifier: tryConsume("MODIFIER") || ""
      });
      continue;
    }
    mustConsume("END");
  }
  return result;
}
__name(parse, "parse");
function match(str, options) {
  var keys = [];
  var re = pathToRegexp(str, keys, options);
  return regexpToFunction(re, keys, options);
}
__name(match, "match");
function regexpToFunction(re, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.decode, decode = _a === void 0 ? function(x) {
    return x;
  } : _a;
  return function(pathname) {
    var m = re.exec(pathname);
    if (!m)
      return false;
    var path = m[0], index = m.index;
    var params = /* @__PURE__ */ Object.create(null);
    var _loop_1 = /* @__PURE__ */ __name(function(i2) {
      if (m[i2] === void 0)
        return "continue";
      var key = keys[i2 - 1];
      if (key.modifier === "*" || key.modifier === "+") {
        params[key.name] = m[i2].split(key.prefix + key.suffix).map(function(value) {
          return decode(value, key);
        });
      } else {
        params[key.name] = decode(m[i2], key);
      }
    }, "_loop_1");
    for (var i = 1; i < m.length; i++) {
      _loop_1(i);
    }
    return { path, index, params };
  };
}
__name(regexpToFunction, "regexpToFunction");
function escapeString(str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, "\\$1");
}
__name(escapeString, "escapeString");
function flags(options) {
  return options && options.sensitive ? "" : "i";
}
__name(flags, "flags");
function regexpToRegexp(path, keys) {
  if (!keys)
    return path;
  var groupsRegex = /\((?:\?<(.*?)>)?(?!\?)/g;
  var index = 0;
  var execResult = groupsRegex.exec(path.source);
  while (execResult) {
    keys.push({
      // Use parenthesized substring match if available, index otherwise
      name: execResult[1] || index++,
      prefix: "",
      suffix: "",
      modifier: "",
      pattern: ""
    });
    execResult = groupsRegex.exec(path.source);
  }
  return path;
}
__name(regexpToRegexp, "regexpToRegexp");
function arrayToRegexp(paths, keys, options) {
  var parts = paths.map(function(path) {
    return pathToRegexp(path, keys, options).source;
  });
  return new RegExp("(?:".concat(parts.join("|"), ")"), flags(options));
}
__name(arrayToRegexp, "arrayToRegexp");
function stringToRegexp(path, keys, options) {
  return tokensToRegexp(parse(path, options), keys, options);
}
__name(stringToRegexp, "stringToRegexp");
function tokensToRegexp(tokens, keys, options) {
  if (options === void 0) {
    options = {};
  }
  var _a = options.strict, strict = _a === void 0 ? false : _a, _b = options.start, start = _b === void 0 ? true : _b, _c = options.end, end = _c === void 0 ? true : _c, _d = options.encode, encode = _d === void 0 ? function(x) {
    return x;
  } : _d, _e = options.delimiter, delimiter = _e === void 0 ? "/#?" : _e, _f = options.endsWith, endsWith = _f === void 0 ? "" : _f;
  var endsWithRe = "[".concat(escapeString(endsWith), "]|$");
  var delimiterRe = "[".concat(escapeString(delimiter), "]");
  var route = start ? "^" : "";
  for (var _i = 0, tokens_1 = tokens; _i < tokens_1.length; _i++) {
    var token = tokens_1[_i];
    if (typeof token === "string") {
      route += escapeString(encode(token));
    } else {
      var prefix = escapeString(encode(token.prefix));
      var suffix = escapeString(encode(token.suffix));
      if (token.pattern) {
        if (keys)
          keys.push(token);
        if (prefix || suffix) {
          if (token.modifier === "+" || token.modifier === "*") {
            var mod = token.modifier === "*" ? "?" : "";
            route += "(?:".concat(prefix, "((?:").concat(token.pattern, ")(?:").concat(suffix).concat(prefix, "(?:").concat(token.pattern, "))*)").concat(suffix, ")").concat(mod);
          } else {
            route += "(?:".concat(prefix, "(").concat(token.pattern, ")").concat(suffix, ")").concat(token.modifier);
          }
        } else {
          if (token.modifier === "+" || token.modifier === "*") {
            throw new TypeError('Can not repeat "'.concat(token.name, '" without a prefix and suffix'));
          }
          route += "(".concat(token.pattern, ")").concat(token.modifier);
        }
      } else {
        route += "(?:".concat(prefix).concat(suffix, ")").concat(token.modifier);
      }
    }
  }
  if (end) {
    if (!strict)
      route += "".concat(delimiterRe, "?");
    route += !options.endsWith ? "$" : "(?=".concat(endsWithRe, ")");
  } else {
    var endToken = tokens[tokens.length - 1];
    var isEndDelimited = typeof endToken === "string" ? delimiterRe.indexOf(endToken[endToken.length - 1]) > -1 : endToken === void 0;
    if (!strict) {
      route += "(?:".concat(delimiterRe, "(?=").concat(endsWithRe, "))?");
    }
    if (!isEndDelimited) {
      route += "(?=".concat(delimiterRe, "|").concat(endsWithRe, ")");
    }
  }
  return new RegExp(route, flags(options));
}
__name(tokensToRegexp, "tokensToRegexp");
function pathToRegexp(path, keys, options) {
  if (path instanceof RegExp)
    return regexpToRegexp(path, keys);
  if (Array.isArray(path))
    return arrayToRegexp(path, keys, options);
  return stringToRegexp(path, keys, options);
}
__name(pathToRegexp, "pathToRegexp");

// ../node_modules/wrangler/templates/pages-template-worker.ts
var escapeRegex = /[.+?^${}()|[\]\\]/g;
function* executeRequest(request) {
  const requestPath = new URL(request.url).pathname;
  for (const route of [...routes].reverse()) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult) {
      for (const handler of route.middlewares.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: mountMatchResult.path
        };
      }
    }
  }
  for (const route of routes) {
    if (route.method && route.method !== request.method) {
      continue;
    }
    const routeMatcher = match(route.routePath.replace(escapeRegex, "\\$&"), {
      end: true
    });
    const mountMatcher = match(route.mountPath.replace(escapeRegex, "\\$&"), {
      end: false
    });
    const matchResult = routeMatcher(requestPath);
    const mountMatchResult = mountMatcher(requestPath);
    if (matchResult && mountMatchResult && route.modules.length) {
      for (const handler of route.modules.flat()) {
        yield {
          handler,
          params: matchResult.params,
          path: matchResult.path
        };
      }
      break;
    }
  }
}
__name(executeRequest, "executeRequest");
var pages_template_worker_default = {
  async fetch(originalRequest, env, workerContext) {
    let request = originalRequest;
    const handlerIterator = executeRequest(request);
    let data = {};
    let isFailOpen = false;
    const next = /* @__PURE__ */ __name(async (input, init) => {
      if (input !== void 0) {
        let url = input;
        if (typeof input === "string") {
          url = new URL(input, request.url).toString();
        }
        request = new Request(url, init);
      }
      const result = handlerIterator.next();
      if (result.done === false) {
        const { handler, params, path } = result.value;
        const context = {
          request: new Request(request.clone()),
          functionPath: path,
          next,
          params,
          get data() {
            return data;
          },
          set data(value) {
            if (typeof value !== "object" || value === null) {
              throw new Error("context.data must be an object");
            }
            data = value;
          },
          env,
          waitUntil: workerContext.waitUntil.bind(workerContext),
          passThroughOnException: /* @__PURE__ */ __name(() => {
            isFailOpen = true;
          }, "passThroughOnException")
        };
        const response = await handler(context);
        if (!(response instanceof Response)) {
          throw new Error("Your Pages function should return a Response");
        }
        return cloneResponse(response);
      } else if ("ASSETS") {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      } else {
        const response = await fetch(request);
        return cloneResponse(response);
      }
    }, "next");
    try {
      return await next();
    } catch (error) {
      if (isFailOpen) {
        const response = await env["ASSETS"].fetch(request);
        return cloneResponse(response);
      }
      throw error;
    }
  }
};
var cloneResponse = /* @__PURE__ */ __name((response) => (
  // https://fetch.spec.whatwg.org/#null-body-status
  new Response(
    [101, 204, 205, 304].includes(response.status) ? null : response.body,
    response
  )
), "cloneResponse");

// ../node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    return Response.json(error, {
      status: 500,
      headers: { "MF-Experimental-Error-Stack": "true" }
    });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// ../.wrangler/tmp/bundle-hCDQeE/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = pages_template_worker_default;

// ../node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// ../.wrangler/tmp/bundle-hCDQeE/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=functionsWorker-0.9038965156173135.mjs.map
