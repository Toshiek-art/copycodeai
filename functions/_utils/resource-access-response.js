function buildLockedAccessPath(requestPath, resourceLabel = 'guide') {
  const searchParams = new URLSearchParams({
    returnTo: requestPath,
    resource: resourceLabel
  });

  return `/guides/access-link-unavailable/?${searchParams.toString()}`;
}

export function createAccessLockedResponse(requestPath, resourceLabel = 'guide') {
  return new Response(null, {
    status: 303,
    headers: {
      Location: buildLockedAccessPath(requestPath, resourceLabel),
      'Cache-Control': 'no-store'
    }
  });
}
