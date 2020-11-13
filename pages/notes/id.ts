import {set, get, del} from 'idb-keyval';
import {html} from '../../arvo';

export async function save({request, params}) {
  const formData = await request.formData();
  await set(params.id, formData.get('content'));

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/`,
    },
  });
}

export async function destroy({params}) {
  await del(params.id);

  return new Response(null, {
    status: 303,
    headers: {
      Location: `/`,
    },
  });
}

export function load({params}) {
  return {
    title: new Date(Number(params.id)).toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    content: get(params.id).then((val: string | null) => val ?? ''),
  };
}

export default function({title, content}: ReturnType<typeof load>) {
  return html`
    <nav>
      <a href="/">← All notes</a>
    </nav>

    <header>
      <h2>${title}</h2>
      <button type="submit" form="composer" formaction="?action=destroy">
        ✕ Delete
      </button>
      <button type="submit" form="composer">✔ Save</button>
    </header>

    <form id="composer" action="?action=save" method="post" class="composer">
      <textarea
        ${content.then((val) => (val.length === 0 ? 'autofocus' : ''))}
        name="content"
        placeholder="Write something notable…"
      >
${content}</textarea
      >
    </form>
  `;
}
