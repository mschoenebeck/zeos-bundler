
self.addEventListener("install", listener => {
  console.log("WORKER: install event in progress.");
});
self.addEventListener("activate", listener => {
  console.log('WORKER: activate event in progress.');
});
self.addEventListener("fetch", async listener => {
  const request = listener.request;
  const url = (new URL(request.url));
  console.log("Intercepted call to ", url.pathname);

  if (url.pathname == "/") {
    // Don't intercept hits to the homepage
    return;
  }

  const params = new URLSearchParams(url.search);
  const info = {
    url: request.url,
    method: request.method,
    path: url.pathname,
    params: Array.from(params.entries())
  };

  //let requestDecodedData = Object.values(resources).filter(value => value.path === url.pathname)[0]

  console.info(`!-WORKER from uri (${request.url}): Fetching from filepath for ${url.pathname} using LLER (Lazy Loaded Encoded Resources)`);
  listener.respondWith((async () => {
    // Try to get the response from a cache.
    // If we didn't find a match in the cache, use the network.
    let request = fetch(listener.request);
    let buffer = await (await fetch(listener.request)).body.getReader().read().then((value) => {return value.value});

    const base64 = btoa(buffer.reduce((data, byte) => data + String.fromCharCode(byte), ''));
    const originalBuffer = atob(base64);


    console.log("For: " + listener.request.url  + " " + originalBuffer.length + " " + buffer.length + " original base64: " + base64);
    return request;
  })());
});
