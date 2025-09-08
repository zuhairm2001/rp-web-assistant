import z from "zod";

export const DummyProduct = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  permalink: z.string(),
  date_created: z.string(), // Change from z.iso.datetime() to z.string()
});

// More flexible Product schema that matches the actual WooCommerce API response
export const Product = z
  .object({
    id: z.number().int(),
    name: z.string().default(""),
    slug: z.string().default(""),
    permalink: z.string().default(""),
    date_created: z.string().nullable().or(z.literal("")).default(""), // WooCommerce can return null for some products
    date_created_gmt: z.string().nullable().or(z.literal("")).default(""),
    date_modified: z.string().nullable().or(z.literal("")).default(""),
    date_modified_gmt: z.string().nullable().or(z.literal("")).default(""),
    type: z
      .enum(["simple", "grouped", "external", "variable"])
      .default("simple"),
    status: z
      .enum(["draft", "pending", "private", "publish"])
      .default("publish"),
    featured: z.boolean().default(false),
    catalog_visibility: z
      .enum(["visible", "catalog", "search", "hidden"])
      .default("visible"),
    description: z.string().default(""),
    short_description: z.string().default(""),
    sku: z.string().default(""),
    price: z.string().default("0"),
    regular_price: z.string().default("0"),
    sale_price: z.string().default(""),
    date_on_sale_from: z.string().nullable(),
    date_on_sale_from_gmt: z.string().nullable(),
    date_on_sale_to: z.string().nullable(),
    date_on_sale_to_gmt: z.string().nullable(),
    price_html: z.string().default(""),
    on_sale: z.boolean().default(false),
    purchasable: z.boolean().default(false),
    total_sales: z.number().int().default(0),
    virtual: z.boolean().default(false),
    downloadable: z.boolean().default(false),
    downloads: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        file: z.string(),
      }),
    ),
    download_limit: z.number().int().default(-1),
    download_expiry: z.number().int().default(-1),
    external_url: z.string().default(""),
    button_text: z.string().default(""),
    tax_status: z.enum(["taxable", "shipping", "none"]).default("taxable"),
    tax_class: z.string().default(""),
    manage_stock: z.boolean().default(false),
    stock_quantity: z.number().int().nullable(),
    stock_status: z
      .enum(["instock", "outofstock", "onbackorder"])
      .default("instock"),
    backorders: z.enum(["no", "notify", "yes"]).default("no"),
    backorders_allowed: z.boolean().default(false),
    backordered: z.boolean().default(false),
    low_stock_amount: z.number().nullable(), // This field was missing from your schema
    sold_individually: z.boolean().default(false),
    weight: z.string().default(""),
    dimensions: z.object({
      length: z.string().default(""),
      width: z.string().default(""),
      height: z.string().default(""),
    }),
    shipping_required: z.boolean().default(false),
    shipping_taxable: z.boolean().default(false),
    shipping_class: z.string().default(""),
    shipping_class_id: z.number().int().default(0),
    reviews_allowed: z.boolean().default(true),
    average_rating: z.string().default("0"),
    rating_count: z.number().int().default(0),
    related_ids: z.array(z.number().int()),
    upsell_ids: z.array(z.number().int()),
    cross_sell_ids: z.array(z.number().int()),
    parent_id: z.number().int().default(0),
    purchase_note: z.string().default(""),
    categories: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        slug: z.string(),
      }),
    ),
    brands: z.array(z.any()).optional(), // This field exists in the API response but wasn't in your schema
    tags: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        slug: z.string(),
      }),
    ),
    images: z.array(
      z.object({
        id: z.number().int(),
        date_created: z.string().nullable().or(z.literal("")).default(""), // Changed from z.iso.datetime()
        date_created_gmt: z.string().nullable().or(z.literal("")).default(""),
        date_modified: z.string().nullable().or(z.literal("")).default(""),
        date_modified_gmt: z.string().nullable().or(z.literal("")).default(""),
        src: z.string(),
        name: z.string(),
        alt: z.string().default(""),
      }),
    ),
    attributes: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        position: z.number().int(),
        visible: z.boolean().default(false),
        variation: z.boolean().default(false),
        options: z.array(z.string()),
      }),
    ),
    default_attributes: z.array(
      z.object({
        id: z.number().int(),
        name: z.string(),
        option: z.string(),
      }),
    ),
    variations: z.array(z.number().int()),
    grouped_products: z.array(z.number().int()),
    menu_order: z.number().int().default(0),
    meta_data: z.array(
      z.object({
        id: z.number().int(),
        key: z.string(),
        value: z.any(), // Value can be any type
      }),
    ),
    has_options: z.boolean().optional(),
    post_password: z.string().optional(),
    global_unique_id: z.string().optional(),
  })
  // Use .passthrough() to allow additional fields that we don't care about
  .passthrough();

export const ProductArray = z.array(Product);
export type ProductSchema = z.infer<typeof Product>;
