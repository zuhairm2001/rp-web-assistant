import { fetch } from "bun";
import { ProductArray, ProductSchema } from "../types/product";

const BASEURL = `https://riskprofs.com/wp-json/wc/v3`;
const KEY = Bun.env.WOOCOMMERCE_API_KEY;
const SECRET = Bun.env.WOOCOMMERCE_API_SECRET;

/**
 * Debug function to identify problematic fields in products
 */
function debugProductIssues(products: any[]): void {
  const issues: any = {};

  products.forEach((product, index) => {
    // Check for null date fields
    if (product.date_created === null) {
      issues[`product_${index}_date_created`] = "null date_created";
    }
    if (product.date_created_gmt === null) {
      issues[`product_${index}_date_created_gmt`] = "null date_created_gmt";
    }

    // Check for missing required fields
    if (!product.name) {
      issues[`product_${index}_name`] = "missing or empty name";
    }
    if (!product.permalink) {
      issues[`product_${index}_permalink`] = "missing or empty permalink";
    }
  });

  if (Object.keys(issues).length > 0) {
    console.log("⚠️ Product validation issues found:", issues);
  }
}

/**
 * Get all products from WooCommerce with pagination support
 */
export const getProducts = async (): Promise<ProductSchema[]> => {
  const allProducts: ProductSchema[] = [];
  let page = 1;
  const perPage = 100; // Maximum allowed by WooCommerce API
  let hasMorePages = true;

  const authHeader = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

  while (hasMorePages) {
    try {
      console.log(`Fetching products page ${page}...`);

      const response = await fetch(
        `${BASEURL}/products?page=${page}&per_page=${perPage}&status=any&orderby=id&order=asc`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 400 && page > 1) {
          // Often means we've reached beyond the last page
          console.log(`Reached end of products at page ${page}`);
          break;
        }
        const errorText = await response.text();
        console.error(`HTTP ${response.status} Error:`, errorText);
        throw new Error(
          `HTTP error! status: ${response.status}, message: ${errorText}`,
        );
      }

      const rawPageProducts = await response.json();

      // Preprocess products to handle edge cases
      const pageProducts = rawPageProducts.map((product: any) => ({
        ...product,
        // Handle null date fields specifically
        date_created:
          product.date_created === null ? "" : product.date_created || "",
        date_created_gmt:
          product.date_created_gmt === null
            ? ""
            : product.date_created_gmt || "",
        date_modified:
          product.date_modified === null ? "" : product.date_modified || "",
        date_modified_gmt:
          product.date_modified_gmt === null
            ? ""
            : product.date_modified_gmt || "",
        // Ensure required fields have default values
        name: product.name || "",
        slug: product.slug || "",
        permalink: product.permalink || "",
        description: product.description || "",
        short_description: product.short_description || "",
        sku: product.sku || "",
        price: product.price || "0",
        regular_price: product.regular_price || "0",
        sale_price: product.sale_price || "",
        price_html: product.price_html || "",
        external_url: product.external_url || "",
        button_text: product.button_text || "",
        tax_class: product.tax_class || "",
        weight: product.weight || "",
        shipping_class: product.shipping_class || "",
        average_rating: product.average_rating || "0",
        purchase_note: product.purchase_note || "",
        // Handle boolean fields
        on_sale: product.on_sale || false,
        purchasable: product.purchasable || false,
        backorders_allowed: product.backorders_allowed || false,
        backordered: product.backordered || false,
        shipping_required: product.shipping_required || false,
        shipping_taxable: product.shipping_taxable || false,
        // Handle numeric fields
        total_sales: product.total_sales || 0,
        shipping_class_id: product.shipping_class_id || 0,
        rating_count: product.rating_count || 0,
        parent_id: product.parent_id || 0,
        menu_order: product.menu_order || 0,
        // Ensure arrays exist
        categories: product.categories || [],
        tags: product.tags || [],
        images: (product.images || []).map((img: any) => ({
          ...img,
          alt: img.alt || "",
          date_created: img.date_created === null ? "" : img.date_created || "",
          date_created_gmt:
            img.date_created_gmt === null ? "" : img.date_created_gmt || "",
          date_modified:
            img.date_modified === null ? "" : img.date_modified || "",
          date_modified_gmt:
            img.date_modified_gmt === null ? "" : img.date_modified_gmt || "",
        })),
        attributes: product.attributes || [],
        default_attributes: product.default_attributes || [],
        variations: product.variations || [],
        grouped_products: product.grouped_products || [],
        downloads: product.downloads || [],
        related_ids: product.related_ids || [],
        upsell_ids: product.upsell_ids || [],
        cross_sell_ids: product.cross_sell_ids || [],
        meta_data: product.meta_data || [],
        // Ensure dimensions object exists
        dimensions: {
          length: product.dimensions?.length || "",
          width: product.dimensions?.width || "",
          height: product.dimensions?.height || "",
        },
      }));

      // Log sample product structure for debugging
      if (page === 1 && pageProducts.length > 0) {
        console.log(
          "Sample preprocessed product structure:",
          JSON.stringify(pageProducts[0], null, 2),
        );
      }

      // Debug issues before validation
      debugProductIssues(pageProducts);

      // Validate the products using your schema
      try {
        const validatedProducts = ProductArray.parse(pageProducts);

        if (validatedProducts.length === 0) {
          console.log(`No more products found at page ${page}`);
          hasMorePages = false;
        } else {
          allProducts.push(...validatedProducts);
          console.log(
            `Fetched ${validatedProducts.length} products from page ${page} (total so far: ${allProducts.length})`,
          );

          // If we got fewer products than requested, we're likely on the last page
          if (validatedProducts.length < perPage) {
            hasMorePages = false;
          } else {
            page++;
          }
        }
      } catch (zodError) {
        console.error(`❌ Zod validation error on page ${page}:`);
        if (zodError instanceof Error && "issues" in zodError) {
          const zodErr = zodError as any;
          zodErr.issues?.forEach((issue: any) => {
            console.error(
              `  - Path: ${issue.path.join(".")}, Expected: ${issue.expected}, Got: ${issue.received}, Message: ${issue.message}`,
            );
          });
        }
        console.error("First 2 products that failed validation:");
        console.error(JSON.stringify(pageProducts.slice(0, 2), null, 2));
        throw zodError;
      }

      // Add a small delay to be respectful to the API
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching page ${page}:`, error);

      // If it's a 400 error and we're past page 1, might be end of results
      if (error instanceof Error && error.message.includes("400") && page > 1) {
        console.log(`Assuming end of results due to 400 error at page ${page}`);
        break;
      }

      // For other errors, throw them
      throw error;
    }
  }

  console.log(
    `✅ Successfully fetched ${allProducts.length} total products from ${page - 1} pages`,
  );
  return allProducts;
};

/**
 * Get products by specific status with pagination
 */
export const getProductsByStatus = async (
  status: "draft" | "pending" | "private" | "publish" | "any" = "publish",
): Promise<ProductSchema[]> => {
  const allProducts: ProductSchema[] = [];
  let page = 1;
  const perPage = 100;
  let hasMorePages = true;

  const authHeader = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

  while (hasMorePages) {
    try {
      console.log(`Fetching ${status} products page ${page}...`);

      const response = await fetch(
        `${BASEURL}/products?page=${page}&per_page=${perPage}&status=${status}&orderby=id&order=asc`,
        {
          headers: {
            Authorization: authHeader,
          },
        },
      );

      if (!response.ok) {
        if (response.status === 400 && page > 1) {
          break;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const pageProducts = await response.json();
      const validatedProducts = ProductArray.parse(pageProducts);

      if (validatedProducts.length === 0) {
        hasMorePages = false;
      } else {
        allProducts.push(...validatedProducts);
        console.log(
          `Fetched ${validatedProducts.length} ${status} products from page ${page}`,
        );

        if (validatedProducts.length < perPage) {
          hasMorePages = false;
        } else {
          page++;
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch (error) {
      console.error(`Error fetching ${status} products page ${page}:`, error);
      if (error instanceof Error && error.message.includes("400") && page > 1) {
        break;
      }
      throw error;
    }
  }

  console.log(
    `✅ Successfully fetched ${allProducts.length} ${status} products`,
  );
  return allProducts;
};

/**
 * Get a single page of products (for testing or specific use cases)
 */
export const getProductsPage = async (
  page: number = 1,
  perPage: number = 100,
): Promise<ProductSchema[]> => {
  const authHeader = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

  const response = await fetch(
    `${BASEURL}/products?page=${page}&per_page=${perPage}&status=any&orderby=id&order=asc`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${await response.text()}`,
    );
  }

  const pageProducts = await response.json();
  return ProductArray.parse(pageProducts);
};

/**
 * Get total count of products without fetching all data
 */
export const getProductCount = async (): Promise<number> => {
  const authHeader = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

  // Fetch just one product to get the total count from headers
  const response = await fetch(`${BASEURL}/products?page=1&per_page=1`, {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  // WooCommerce includes total count in the X-WP-Total header
  const totalHeader = response.headers.get("X-WP-Total");
  return totalHeader ? parseInt(totalHeader, 10) : 0;
};

/**
 * Debug function to fetch raw product data without validation
 */
export const getRawProducts = async (
  page: number = 1,
  perPage: number = 10,
): Promise<any> => {
  const authHeader = `Basic ${Buffer.from(`${KEY}:${SECRET}`).toString("base64")}`;

  console.log(`🔍 Fetching raw products from page ${page}...`);

  const response = await fetch(
    `${BASEURL}/products?page=${page}&per_page=${perPage}&status=any&orderby=id&order=asc`,
    {
      headers: {
        Authorization: authHeader,
      },
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`,
    );
  }

  const rawProducts = await response.json();

  console.log(`📊 Retrieved ${rawProducts.length} raw products`);
  console.log(
    "🔬 First product structure:",
    JSON.stringify(rawProducts[0], null, 2),
  );

  // Check for null date fields specifically
  rawProducts.forEach((product: any, index: number) => {
    if (product.date_created === null) {
      console.log(
        `⚠️ Product ${index} (ID: ${product.id}) has null date_created`,
      );
    }
    if (product.date_created_gmt === null) {
      console.log(
        `⚠️ Product ${index} (ID: ${product.id}) has null date_created_gmt`,
      );
    }
  });

  return rawProducts;
};

// Remove the console.log from the module level to avoid running during import
// If you want to test, uncomment the line below:
// console.log(await ProductArray.parseAsync(await getProducts()));
