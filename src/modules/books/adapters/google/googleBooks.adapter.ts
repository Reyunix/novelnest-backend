import { AppError } from "@/utils/http/errorResponses";
import {
  BooksSearchItemDto,
  BooksSearchResponseDto,
  BooksSearchResponseDtoSchema,
} from "../../books.dto";
import { SearchBookQuery } from "../../books.schema";
import {
  GoogleBooksApiResponse,
  GoogleBooksApiResponseSchema,
  GoogleBooksVolumeItem,
} from "./googleBooks.api.schema";
import { BooksAdapter } from "../books.adapter";

const API_KEY_GOOGLE = process.env.API_KEY_GOOGLE;
const API_BASE_URL_GOOGLE = process.env.API_BASE_URL_GOOGLE;
const API_VOLUME_FIELDS_GOOGLE = process.env.API_VOLUME_FIELDS_GOOGLE;

const normalizeTerm = (term: string): string => term.trim().replace(/\s+/g, " ");

const buildGoogleQuery = (query: SearchBookQuery): string => {
  const terms: string[] = [];

  if (query.q) terms.push(normalizeTerm(query.q));
  if (query.title) terms.push(`intitle:${normalizeTerm(query.title)}`);
  if (query.author) terms.push(`inauthor:${normalizeTerm(query.author)}`);
  if (query.subject) terms.push(`subject:${normalizeTerm(query.subject)}`);
  if (query.isbn) terms.push(`isbn:${normalizeTerm(query.isbn)}`);

  return terms.join(" ");
};

const mapGoogleItemToDto = (item: GoogleBooksVolumeItem): BooksSearchItemDto => {
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
    thumbnail: info?.imageLinks?.thumbnail ?? info?.imageLinks?.smallThumbnail ?? null,
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
  public async search(query: SearchBookQuery): Promise<BooksSearchResponseDto> {
    const url = this.buildSearchUrl(query);
    const response = await fetch(url);

    if (!response.ok) {
      throw new AppError("EXTERNAL_API_ERROR");
    }

    const rawData: unknown = await response.json();
    const parsedData = GoogleBooksApiResponseSchema.safeParse(rawData);

    if (!parsedData.success) {
      throw new AppError("EXTERNAL_API_ERROR");
    }

    const dto = mapGoogleResponseToDto(parsedData.data, query);
    const parsedDto = BooksSearchResponseDtoSchema.safeParse(dto);

    if (!parsedDto.success) {
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
    console.log("Constructed Google Books API URL:", url.toString());
    return url.toString();
  }
}
