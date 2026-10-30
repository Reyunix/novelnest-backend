import {
  providerGateway,
  type createProviderGateway,
} from "../providerGateway";
import { integerEnv } from "@/shared/config/limits";
import { AppError } from "@/utils/http/errorResponses";
import {
  BookDetailDtoSchema,
  BookDetailDto,
  BooksSearchItemDto,
  BooksSearchResponseDto,
  BooksSearchResponseDtoSchema,
} from "../../books.dto";
import { SearchBookQuery } from "../../books.schema";
import {
  GoogleBooksApiResponse,
  GoogleBooksApiResponseSchema,
  GoogleBooksVolumeItem,
  GoogleBooksVolumeItemSchema,
} from "./googleBooks.api.schema";
import { BooksAdapter } from "../books.adapter";

import { descriptionToText, safeBookUrl } from "./description";

const API_KEY_GOOGLE = process.env.API_KEY_GOOGLE;
const API_BASE_URL_GOOGLE = process.env.API_BASE_URL_GOOGLE;
const API_VOLUME_FIELDS_GOOGLE = process.env.API_VOLUME_FIELDS_GOOGLE;

const normalizeTerm = (term: string): string =>
  term.trim().replace(/\s+/g, " ");

const buildGoogleQuery = (query: SearchBookQuery): string => {
  const terms: string[] = [];

  if (query.all) terms.push(normalizeTerm(query.all));
  if (query.title) terms.push(`intitle:${normalizeTerm(query.title)}`);
  if (query.author) terms.push(`inauthor:${normalizeTerm(query.author)}`);
  if (query.subject) terms.push(`subject:${normalizeTerm(query.subject)}`);
  if (query.isbn) terms.push(`isbn:${normalizeTerm(query.isbn)}`);

  return terms.join(" ");
};

const mapGoogleItemToDto = (
  item: GoogleBooksVolumeItem,
): BooksSearchItemDto => {
  const info = item.volumeInfo;

  return {
    providerBookId: item.id,
    title: info?.title ?? "Untitled",
    authors: info?.authors ?? [],
    publisher: info?.publisher ?? null,
    publishedDate: info?.publishedDate ?? null,
    pageCount: info?.pageCount ?? null,
    categories: info?.categories ?? [],
    maturityRating: info?.maturityRating ?? null,
    thumbnail:
      info?.imageLinks?.thumbnail ?? info?.imageLinks?.smallThumbnail ?? null,
    canonicalVolumeLink: info?.canonicalVolumeLink ?? null,
    description: info?.description ?? null,
    language: info?.language ?? null,
  };
};

const mapGoogleResponseToDto = (
  response: GoogleBooksApiResponse,
  query: SearchBookQuery,
): BooksSearchResponseDto => {
  return {
    provider: "google",
    totalItems: response.totalItems ?? 0,
    page: query.page,
    limit: query.limit,
    items: (response.items ?? []).map(mapGoogleItemToDto),
  };
};

export class GoogleBooksAdapter implements BooksAdapter {
  constructor(
    private readonly gateway: ReturnType<
      typeof createProviderGateway
    > = providerGateway,
  ) {}
  public getById(providerBookId: string): Promise<BookDetailDto> {
    return this.gateway.load(
      `google:detail:${providerBookId}`,
      integerEnv("PROVIDER_DETAIL_TTL_MS", 21600000),
      (signal) => this.fetchById(providerBookId, signal),
    );
  }
  public search(query: SearchBookQuery): Promise<BooksSearchResponseDto> {
    const normalized = Object.fromEntries(
      Object.entries(query)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, value]) => [
          key,
          typeof value === "string" ? normalizeTerm(value) : value,
        ]),
    ) as SearchBookQuery;
    return this.gateway.load(
      `google:search:${JSON.stringify(normalized)}`,
      integerEnv("PROVIDER_SEARCH_TTL_MS", 300000),
      (signal) => this.fetchSearch(normalized, signal),
    );
  }
  private async fetchById(
    providerBookId: string,
    signal: AbortSignal,
  ): Promise<BookDetailDto> {
    const base =
      API_BASE_URL_GOOGLE ?? "https://www.googleapis.com/books/v1/volumes";
    const url = new URL(base);
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/${encodeURIComponent(providerBookId)}`;
    url.search = "";
    url.hash = "";
    if (API_KEY_GOOGLE) url.searchParams.set("key", API_KEY_GOOGLE);
    let response: Response;
    try {
      response = await fetch(url, { signal });
    } catch {
      throw new AppError("EXTERNAL_API_ERROR");
    }
    if (response.status === 404) throw new AppError("BOOK_NOT_FOUND");
    if (!response.ok) throw new AppError("EXTERNAL_API_ERROR");
    const parsed = GoogleBooksVolumeItemSchema.safeParse(
      await response.json().catch(() => null),
    );
    if (!parsed.success || parsed.data.id !== providerBookId)
      throw new AppError("EXTERNAL_API_ERROR");
    const item = parsed.data;
    const info = item.volumeInfo;
    return BookDetailDtoSchema.parse({
      ...mapGoogleItemToDto(item),
      title: info?.title?.trim() || "Sin título",
      authors: (info?.authors ?? [])
        .map((author) => author.trim())
        .filter(Boolean),
      publisher: info?.publisher?.trim() || null,
      publishedDate: info?.publishedDate?.trim() || null,
      categories: (info?.categories ?? [])
        .map((category) => category.trim())
        .filter(Boolean),
      maturityRating: info?.maturityRating?.trim() || null,
      language: info?.language?.trim() || null,
      provider: "google",
      subtitle: info?.subtitle || null,
      thumbnail: safeBookUrl(
        info?.imageLinks?.large ??
          info?.imageLinks?.medium ??
          info?.imageLinks?.thumbnail ??
          info?.imageLinks?.smallThumbnail,
      ),
      canonicalVolumeLink: safeBookUrl(info?.canonicalVolumeLink),
      description: descriptionToText(info?.description),
      previewLink: safeBookUrl(info?.previewLink),
      industryIdentifiers: (info?.industryIdentifiers ?? []).filter(
        (entry) => entry.type && entry.identifier,
      ),
      externalRating:
        info?.averageRating != null
          ? { average: info.averageRating, count: info.ratingsCount ?? null }
          : null,
    });
  }

  private async fetchSearch(
    query: SearchBookQuery,
    signal: AbortSignal,
  ): Promise<BooksSearchResponseDto> {
    const url = this.buildSearchUrl(query);
    let response: Response;
    try {
      response = await fetch(url, { signal });
    } catch {
      throw new AppError("EXTERNAL_API_ERROR");
    }

    if (!response.ok) {
      console.error(
        `Google Books API error: ${response.status} ${response.statusText}`,
      );
      throw new AppError("EXTERNAL_API_ERROR");
    }

    const rawData: unknown = await response.json().catch(() => null);
    const parsedData = GoogleBooksApiResponseSchema.safeParse(rawData);

    if (!parsedData.success) {
      console.error(
        "Failed to parse Google Books API response:",
        parsedData.error,
      );
      throw new AppError("EXTERNAL_API_ERROR");
    }

    const dto = mapGoogleResponseToDto(parsedData.data, query);
    const parsedDto = BooksSearchResponseDtoSchema.safeParse(dto);

    if (!parsedDto.success) {
      console.error(
        "Failed to validate BooksSearchResponseDto:",
        parsedDto.error,
      );
      throw new AppError("INTERNAL_SERVER_ERROR");
    }

    return parsedDto.data;
  }

  private buildSearchUrl(query: SearchBookQuery): string {
    const baseUrl =
      API_BASE_URL_GOOGLE ?? "https://www.googleapis.com/books/v1/volumes";
    const url = new URL(baseUrl);
    const startIndex = (query.page - 1) * query.limit;

    url.searchParams.set("q", buildGoogleQuery(query));
    url.searchParams.set("startIndex", String(startIndex));
    url.searchParams.set("maxResults", String(query.limit));
    url.searchParams.set("printType", query.printType);
    url.searchParams.set("orderBy", query.sortBy);

    if (API_VOLUME_FIELDS_GOOGLE) {
      url.searchParams.set("fields", API_VOLUME_FIELDS_GOOGLE);
    }

    if (query.availability) {
      url.searchParams.set("filter", query.availability);
    }

    if (query.download) {
      url.searchParams.set("download", query.download);
    }

    if (query.projection) {
      url.searchParams.set("projection", query.projection);
    }

    if (API_KEY_GOOGLE) {
      url.searchParams.set("key", API_KEY_GOOGLE);
    }
    return url.toString();
  }
}
