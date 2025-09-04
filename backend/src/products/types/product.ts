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
    name: z.string(),
    slug: z.string(),
    permalink: z.string(),
    date_created: z.string(), // WooCommerce returns string dates, not ISO datetime objects
    date_created_gmt: z.string(),
    date_modified: z.string(),
    date_modified_gmt: z.string(),
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
    description: z.string(),
    short_description: z.string(),
    sku: z.string(),
    price: z.string(),
    regular_price: z.string(),
    sale_price: z.string(),
    date_on_sale_from: z.string().nullable(),
    date_on_sale_from_gmt: z.string().nullable(),
    date_on_sale_to: z.string().nullable(),
    date_on_sale_to_gmt: z.string().nullable(),
    price_html: z.string(),
    on_sale: z.boolean(),
    purchasable: z.boolean(),
    total_sales: z.number().int(),
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
    external_url: z.string(),
    button_text: z.string(),
    tax_status: z.enum(["taxable", "shipping", "none"]).default("taxable"),
    tax_class: z.string(),
    manage_stock: z.boolean().default(false),
    stock_quantity: z.number().int().nullable(),
    stock_status: z
      .enum(["instock", "outofstock", "onbackorder"])
      .default("instock"),
    backorders: z.enum(["no", "notify", "yes"]).default("no"),
    backorders_allowed: z.boolean(),
    backordered: z.boolean(),
    low_stock_amount: z.number().nullable(), // This field was missing from your schema
    sold_individually: z.boolean().default(false),
    weight: z.string(),
    dimensions: z.object({
      length: z.string(),
      width: z.string(),
      height: z.string(),
    }),
    shipping_required: z.boolean(),
    shipping_taxable: z.boolean(),
    shipping_class: z.string(),
    shipping_class_id: z.number().int(),
    reviews_allowed: z.boolean().default(true),
    average_rating: z.string(),
    rating_count: z.number().int(),
    related_ids: z.array(z.number().int()),
    upsell_ids: z.array(z.number().int()),
    cross_sell_ids: z.array(z.number().int()),
    parent_id: z.number().int(),
    purchase_note: z.string(),
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
        date_created: z.string(), // Changed from z.iso.datetime()
        date_created_gmt: z.string(),
        date_modified: z.string(),
        date_modified_gmt: z.string(),
        src: z.string(),
        name: z.string(),
        alt: z.string(),
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
    menu_order: z.number().int(),
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
