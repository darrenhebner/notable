export async function renderToString(app: AsyncGenerator<string>) {
  let result = '';

  for await (let value of app) {
    result += value;
  }

  return result;
}

const encoder = new TextEncoder();

export function renderToStream(app: AsyncGenerator<string>) {
  return new ReadableStream({
    async pull(controller) {
      const {done, value} = await app.next();

      if (done) {
        controller.close();
      }

      controller.enqueue(encoder.encode(value));
    },
  });
}

async function* run(iterator): AsyncGenerator<string> {
  for await (const item of iterator) {
    if (typeof item === 'string') {
      yield item;
    } else {
      yield* run(item);
    }
  }
}

export function html(
  strings: TemplateStringsArray,
  ...values: ArvoComponent[]
) {
  const zippedTemplate = strings
    .flatMap((string, i) => [string, values[i]])
    .filter(Boolean);

  return run(zippedTemplate);
}

export function createResource(fetcher) {
  const result = fetcher();

  return {
    read() {
      return result;
    },
  };
}

export type ArvoComponent =
  | Promise<AsyncGenerator<string>>
  | AsyncGenerator<string>
  | AsyncGenerator<string>[]
  | Promise<string>
  | string;
