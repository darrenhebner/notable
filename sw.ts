import {html, renderToStream} from './arvo';
import Index, * as indexActions from './pages';
import Note, * as noteActions from './pages/notes/id';

function pathToRegex(path: string) {
  const formattedPath = path.replace(/\[(.*?)\]/g, (_, name) => {
    return `(?<${name}>\\d+)`;
  });

  return new RegExp(`^${formattedPath}$`);
}

self.addEventListener('install', (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', async (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  const {pathname, searchParams} = new URL(event.request.url);

  if (pathToRegex('/').exec(pathname)) {
    if (event.request.method === 'POST') {
      return event.respondWith(indexActions[searchParams.get('action')]());
    }

    return event.respondWith(
      new Response(
        renderToStream(App(event.request.url, Index(indexActions.load()))),
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8',
          },
        }
      )
    );
  }

  if (pathToRegex('/notes/[id]').exec(pathname)) {
    const params = pathToRegex('/notes/[id]').exec(pathname).groups;

    if (event.request.method === 'POST') {
      return event.respondWith(
        new Promise(async (resolve) => {
          const response = await noteActions[searchParams.get('action')]({
            request: event.request,
            params,
          });
          resolve(response);
        })
      );
    }

    return event.respondWith(
      new Response(
        renderToStream(
          App(
            event.request.url,
            Note(
              noteActions.load({
                request: event.request,
                params,
              })
            )
          )
        ),
        {
          headers: {
            'Content-Type': 'text/html; charset=utf-8 ',
          },
        }
      )
    );
  }
});

function App(url, children) {
  return html`
    <html>
      <head>
        <title>Notable</title>
        <link rel="stylesheet" href="/style.css" />
        <base href="${url}" />
        <meta name="viewport" content="width=device-width" />
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📝</text></svg>"
        />
      </head>

      <body>
        ${children}
      </body>
    </html>
  `;
}
