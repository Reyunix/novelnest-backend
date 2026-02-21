import { z } from "zod";


const EpubSchema = z.object({
    "isAvailable": z.boolean().optional(),
});
export type Epub = z.infer<typeof EpubSchema>;

const PdfSchema = z.object({
    "isAvailable": z.boolean().optional(),
    "acsTokenLink": z.string().optional(),
});
export type Pdf = z.infer<typeof PdfSchema>;

const SaleInfoListPriceSchema = z.object({
    "amount": z.number().optional(),
    "currencyCode": z.string().optional(),
});
export type SaleInfoListPrice = z.infer<typeof SaleInfoListPriceSchema>;

const OfferListPriceSchema = z.object({
    "amountInMicros": z.number().optional(),
    "currencyCode": z.string().optional(),
});
export type OfferListPrice = z.infer<typeof OfferListPriceSchema>;

const SearchInfoSchema = z.object({
    "textSnippet": z.string().optional(),
});
export type SearchInfo = z.infer<typeof SearchInfoSchema>;

const ImageLinksSchema = z.object({
    "smallThumbnail": z.string().optional(),
    "thumbnail": z.string().optional(),
});
export type ImageLinks = z.infer<typeof ImageLinksSchema>;

const IndustryIdentifierSchema = z.object({
    "type": z.string().optional(),
    "identifier": z.string().optional(),
});
export type IndustryIdentifier = z.infer<typeof IndustryIdentifierSchema>;

const PanelizationSummarySchema = z.object({
    "containsEpubBubbles": z.boolean().optional(),
    "containsImageBubbles": z.boolean().optional(),
});
export type PanelizationSummary = z.infer<typeof PanelizationSummarySchema>;

const ReadingModesSchema = z.object({
    "text": z.boolean().optional(),
    "image": z.boolean().optional(),
});
export type ReadingModes = z.infer<typeof ReadingModesSchema>;

const AccessInfoSchema = z.object({
    "country": z.string().optional(),
    "viewability": z.string().optional(),
    "embeddable": z.boolean().optional(),
    "publicDomain": z.boolean().optional(),
    "textToSpeechPermission": z.string().optional(),
    "epub": EpubSchema.optional(),
    "pdf": PdfSchema.optional(),
    "webReaderLink": z.string().optional(),
    "accessViewStatus": z.string().optional(),
    "quoteSharingAllowed": z.boolean().optional(),
});
export type AccessInfo = z.infer<typeof AccessInfoSchema>;

const OfferSchema = z.object({
    "finskyOfferType": z.number().optional(),
    "listPrice": OfferListPriceSchema.optional(),
    "retailPrice": OfferListPriceSchema.optional(),
});
export type Offer = z.infer<typeof OfferSchema>;

const VolumeInfoSchema = z.object({
    "title": z.string().optional(),
    "authors": z.array(z.string()).optional(),
    "publisher": z.string().optional(),
    "industryIdentifiers": z.array(IndustryIdentifierSchema).optional(),
    "publishedDate": z.date().optional(),
    "readingModes": ReadingModesSchema.optional(),
    "pageCount": z.number().optional(),
    "printType": z.string().optional(),
    "categories": z.array(z.string()).optional(),
    "maturityRating": z.string().optional(),
    "allowAnonLogging": z.boolean().optional(),
    "contentVersion": z.string().optional(),
    "panelizationSummary": PanelizationSummarySchema.optional(),
    "imageLinks": ImageLinksSchema.optional(),
    "language": z.string().optional(),
    "previewLink": z.string().optional(),
    "infoLink": z.string().optional(),
    "canonicalVolumeLink": z.string().optional(),
});
export type VolumeInfo = z.infer<typeof VolumeInfoSchema>;

const SaleInfoSchema = z.object({
    "country": z.string().optional(),
    "saleability": z.string().optional(),
    "isEbook": z.boolean().optional(),
    "listPrice": SaleInfoListPriceSchema.optional(),
    "retailPrice": SaleInfoListPriceSchema.optional(),
    "buyLink": z.string().optional(),
    "offers": z.array(OfferSchema).optional(),
});
export type SaleInfo = z.infer<typeof SaleInfoSchema>;

const ItemSchema = z.object({
    "kind": z.string().optional(),
    "id": z.string().optional(),
    "etag": z.string().optional(),
    "selfLink": z.string().optional(),
    "volumeInfo": VolumeInfoSchema.optional(),
    "saleInfo": SaleInfoSchema.optional(),
    "accessInfo": AccessInfoSchema.optional(),
    "searchInfo": SearchInfoSchema.optional(),
});
export type Item = z.infer<typeof ItemSchema>;

const ApiResponseSchema = z.object({
    "kind": z.string().optional(),
    "totalItems": z.number().optional(),
    "items": z.array(ItemSchema).optional(),
});
export type ApiResponse = z.infer<typeof ApiResponseSchema>;
