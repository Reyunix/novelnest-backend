import { afterEach, describe, expect, test } from "bun:test";
import { GoogleBooksAdapter } from "../src/modules/books/adapters/google/googleBooks.adapter";
import {
  descriptionToText,
  safeBookUrl,
} from "../src/modules/books/adapters/google/description";
import {
  bookParamsSchema,
  reviewInputSchema,
} from "../src/modules/books/community.schema";

const originalFetch = globalThis.fetch;
afterEach(() => {
  globalThis.fetch = originalFetch;
});
const replaceFetch = (
  fn: (url: string | URL | Request, init?: RequestInit) => Promise<Response>,
) => {
  globalThis.fetch = fn as typeof fetch;
};

describe("book details and review contracts", () => {
  test("description decoding preserves paragraphs and removes executable content", () => {
    expect(
      descriptionToText(
        "<p>Uno &amp; dos</p><p><b>Tres</b><br>Cuatro</p><script>alert(1)</script><style>body{}</style>",
      ),
    ).toBe("Uno & dos\n\nTres\nCuatro");
    expect(descriptionToText("  ")).toBeNull();
    expect(safeBookUrl("javascript:alert(1)")).toBeNull();
    expect(safeBookUrl("http://books.google.com/test")).toBe(
      "https://books.google.com/test",
    );
  });
  test("reviews allow text, rating or both but reject empty, impersonation and invalid scores", () => {
    for (const value of [
      { rating: 5 },
      { text: "  Una reseña  " },
      { rating: 1, text: "Libro" },
    ])
      expect(reviewInputSchema.safeParse(value).success).toBe(true);
    for (const value of [
      {},
      { text: "  " },
      { rating: 0 },
      { rating: 5.5 },
      { text: "a".repeat(5001) },
      { rating: 3, userId: 9 },
    ])
      expect(reviewInputSchema.safeParse(value).success).toBe(false);
    expect(reviewInputSchema.parse({ text: " Reseña " })).toEqual({
      rating: null,
      text: "Reseña",
    });
    expect(
      bookParamsSchema.safeParse({ provider: "other", providerBookId: "book" })
        .success,
    ).toBe(false);
    expect(
      bookParamsSchema.safeParse({
        provider: "google",
        providerBookId: "../escape",
      }).success,
    ).toBe(false);
  });
  test("detail adapter fetches by ID without search projection and normalizes optional data", async () => {
    let requested: URL | undefined;
    replaceFetch(async (url) => {
      requested = new URL(String(url));
      return Response.json({
        id: "test_ID",
        volumeInfo: {
          title: "Libro",
          publishedDate: "2001",
          description: "<p>Texto</p>",
          averageRating: 4.5,
          ratingsCount: 8,
          previewLink: "javascript:bad",
        },
      });
    });
    const book = await new GoogleBooksAdapter().getById("test_ID");
    expect(requested?.pathname.endsWith("/test_ID")).toBe(true);
    expect(requested?.searchParams.has("fields")).toBe(false);
    expect(book).toMatchObject({
      provider: "google",
      description: "Texto",
      publishedDate: "2001",
      externalRating: { average: 4.5, count: 8 },
      previewLink: null,
      authors: [],
      industryIdentifiers: [],
    });
  });
  test("detail adapter distinguishes missing volumes, provider downtime and malformed payloads", async () => {
    const adapter = new GoogleBooksAdapter();
    replaceFetch(async () => new Response(null, { status: 404 }));
    await expect(adapter.getById("missing")).rejects.toMatchObject({
      errorCode: "BOOK_NOT_FOUND",
      statusCode: 404,
    });
    replaceFetch(async () => new Response(null, { status: 503 }));
    await expect(adapter.getById("book")).rejects.toMatchObject({
      errorCode: "EXTERNAL_API_ERROR",
    });
    replaceFetch(async () => Response.json({ id: "wrong" }));
    await expect(adapter.getById("book")).rejects.toMatchObject({
      errorCode: "EXTERNAL_API_ERROR",
    });
    replaceFetch(async () => {
      throw new TypeError("offline");
    });
    await expect(adapter.getById("book")).rejects.toMatchObject({
      errorCode: "EXTERNAL_API_ERROR",
    });
  });
});

test("unknown backend routes return a generic envelope without echoing the URL", async () => {
  const { default: Fastify } = await import("fastify");
  const { errorHandlerPlugin } = await import("../src/plugins/errorHandler");
  const app = Fastify();
  app.register(errorHandlerPlugin);
  try {
    const response = await app.inject({
      method: "GET",
      url: "/private/route?token=do-not-echo",
    });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toEqual({
      success: false,
      errorCode: "ROUTE_NOT_FOUND",
      message: "Recurso no disponible",
    });
    expect(response.body).not.toContain("/private");
    expect(response.body).not.toContain("do-not-echo");
  } finally {
    await app.close();
  }
});
