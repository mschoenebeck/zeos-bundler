self.addEventListener('fetch', listener => {
  var request = listener.request;
  var url = (new URL(request.url));
  console.log('Intercepted call to ', url.pathname);
});