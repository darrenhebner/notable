import {keys} from 'idb-keyval';
import {html} from '../arvo';

export function create() {
  const today = new Date().setHours(0, 0, 0, 0);

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/notes/${today}`,
    },
  });
}

export function load() {
  return {
    notes: keys().then((val) => val),
  };
}

export default function({notes}: ReturnType<typeof load>) {
  return html`
    <header class="home-header">
      <h1>Notable</h1>
      <form action="?action=create" method="post">
        <button type="submit">✎ Write</button>
      </form>
    </header>

    ${Notes(notes)}
  `;
}

async function Notes(notes: ReturnType<typeof load>['notes']) {
  const resolved = await notes;
  console.log(resolved);
  if (resolved.length === 0) {
    return html`
      <p>
        You haven't written anything yet. ☺
      </p>
    `;
  }

  return html`
    <ul>
      ${resolved
        .reverse()
        .map(
          (note) => `
            <li>
              <a href="/notes/${note}"
                >${new Date(Number(note)).toLocaleDateString(undefined, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}</a
              >
            </li>
          `
        )
        .join('')}
    </ul>
  `;
}
