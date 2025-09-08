import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";
import { eq, inArray } from "drizzle-orm";
import { products } from "../../../db/schema";
import { getProducts, getProductCount } from "../../utils/woocommerce";
import { ProductSchema } from "../../types/product";

// Initialize database connection
const sqlite = new Database("rp-assistant.db");
const db = drizzle({ client: sqlite });

// Type for categories as stored in JSON
interface CategoryJson {
  id: number;
  name: string;
  slug: string;
}

interface DbProduct {
  shopId: number;
  name: string;
  price: number;
  link: string;
  categories: string;
  downloadable: number;
}

/**
 * Helper function to convert WooCommerce categories to JSON string
 */
function categoriesToJson(
  categories: Array<{ id: number; name: string; slug: string }>,
): string {
  return JSON.stringify(
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      slug: cat.slug,
    })),
  );
}

/**
 * Helper function to parse JSON string back to categories array
 */
function categoriesFromJson(jsonString: string | null): CategoryJson[] {
  if (!jsonString) return [];
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.error("Error parsing categories JSON:", error);
    return [];
  }
}

/**
 * Helper function to convert WooCommerce categories to single category string
 * (Fallback for when we need just one category name)
 */
function getFirstCategoryName(
  categories: Array<{ id: number; name: string; slug: string }>,
): string {
  return categories.length > 0 ? categories[0].name : "Uncategorized";
}

/**
 * Check if two products have different categories
 */
function categoriesHaveChanged(
  dbCategories: string | null,
  wooCategories: ProductSchema["categories"],
): boolean {
  const dbCats = categoriesFromJson(dbCategories);

  // Compare lengths first
  if (dbCats.length !== wooCategories.length) return true;

  // Sort both arrays by ID for comparison
  const dbCatsSorted = dbCats.sort((a, b) => a.id - b.id);
  const wooCatsSorted = [...wooCategories].sort((a, b) => a.id - b.id);

  // Compare each category
  for (let i = 0; i < dbCatsSorted.length; i++) {
    const dbCat = dbCatsSorted[i];
    const wooCat = wooCatsSorted[i];

    if (
      dbCat.id !== wooCat.id ||
      dbCat.name !== wooCat.name ||
      dbCat.slug !== wooCat.slug
    ) {
      return true;
    }
  }

  return false;
}

/**
 * Pull all products from WooCommerce API with pagination
 */
export async function pullProducts(): Promise<ProductSchema[]> {
  try {
    console.log("🚀 Starting to pull all products from WooCommerce...");

    // First, get the total count to show progress
    const totalCount = await getProductCount();
    console.log(`📊 Total products in WooCommerce: ${totalCount}`);

    // Now fetch all products with pagination
    const validatedProducts = await getProducts();

    console.log(
      `✅ Successfully pulled ${validatedProducts.length}/${totalCount} products from WooCommerce`,
    );

    if (validatedProducts.length !== totalCount) {
      console.warn(
        `⚠️ Product count mismatch: fetched ${validatedProducts.length}, expected ${totalCount}`,
      );
    }

    return validatedProducts;
  } catch (error) {
    console.error("❌ Error pulling products from WooCommerce:", error);
    throw error;
  }
}

/**
 * Get all products currently in the database
 */
async function getDatabaseProducts(): Promise<DbProduct[]> {
  try {
    const dbProducts = await db.select().from(products);
    console.log(`📂 Found ${dbProducts.length} products in database`);
    return dbProducts.map((product) => ({
      ...product,
      categories: product.categories ?? "Uncategorized",
      downloadable: product.downloadable ?? 0,
    }));
  } catch (error) {
    console.error("Error fetching products from database:", error);
    throw error;
  }
}

/**
 * Convert WooCommerce product to database format
 */
function mapWooCommerceToDbProduct(
  wooProduct: ProductSchema,
): Omit<DbProduct, "shopId"> & { shopId: number } {
  const price =
    parseFloat(wooProduct.price || wooProduct.regular_price || "0") * 100;

  return {
    shopId: wooProduct.id,
    name: wooProduct.name,
    price: Math.round(price),
    link: wooProduct.permalink,
    categories: categoriesToJson(wooProduct.categories),
    downloadable: wooProduct.downloadable ? 1 : 0,
  };
}

/**
 * Delete products from the database that no longer exist in WooCommerce
 */
export async function deleteProducts(
  wooProducts: ProductSchema[],
): Promise<void> {
  try {
    const dbProducts = await getDatabaseProducts();
    const wooProductIds = new Set(wooProducts.map((p) => p.id));
    const productsToDelete = dbProducts.filter(
      (dbProduct) => !wooProductIds.has(dbProduct.shopId),
    );

    if (productsToDelete.length === 0) {
      console.log("🗑️ No products to delete");
      return;
    }

    const idsToDelete = productsToDelete.map((p) => p.shopId);
    await db.delete(products).where(inArray(products.shopId, idsToDelete));

    console.log(`🗑️ Deleted ${productsToDelete.length} products from database`);
  } catch (error) {
    console.error("Error deleting products:", error);
    throw error;
  }
}

/**
 * Insert new products that don't exist in the database
 */
export async function insertProducts(
  wooProducts: ProductSchema[],
): Promise<void> {
  try {
    const dbProducts = await getDatabaseProducts();
    const existingIds = new Set(dbProducts.map((p) => p.shopId));
    const newProducts = wooProducts
      .filter((wooProduct) => !existingIds.has(wooProduct.id))
      .map(mapWooCommerceToDbProduct);

    if (newProducts.length === 0) {
      console.log("➕ No new products to insert");
      return;
    }

    // Insert in batches to avoid potential issues with large inserts
    const batchSize = 50;
    let insertedCount = 0;

    for (let i = 0; i < newProducts.length; i += batchSize) {
      const batch = newProducts.slice(i, i + batchSize);
      await db.insert(products).values(batch);
      insertedCount += batch.length;
      console.log(
        `➕ Inserted batch: ${insertedCount}/${newProducts.length} products`,
      );
    }

    console.log(`✅ Successfully inserted ${newProducts.length} new products`);
  } catch (error) {
    console.error("Error inserting products:", error);
    throw error;
  }
}

/**
 * Update existing products that have changed
 */
async function updateProducts(wooProducts: ProductSchema[]): Promise<void> {
  try {
    const dbProducts = await getDatabaseProducts();
    const dbProductsMap = new Map(dbProducts.map((p) => [p.shopId, p]));

    let updateCount = 0;

    for (const wooProduct of wooProducts) {
      const existingProduct = dbProductsMap.get(wooProduct.id);
      if (!existingProduct) continue;

      const mappedProduct = mapWooCommerceToDbProduct(wooProduct);

      const hasChanged =
        existingProduct.name !== mappedProduct.name ||
        existingProduct.price !== mappedProduct.price ||
        existingProduct.link !== mappedProduct.link ||
        categoriesHaveChanged(
          existingProduct.categories,
          wooProduct.categories,
        ) ||
        existingProduct.downloadable !== mappedProduct.downloadable;

      if (hasChanged) {
        await db
          .update(products)
          .set({
            name: mappedProduct.name,
            price: mappedProduct.price,
            link: mappedProduct.link,
            categories: mappedProduct.categories,
            downloadable: mappedProduct.downloadable,
          })
          .where(eq(products.shopId, wooProduct.id));

        updateCount++;

        // Log progress for large updates
        if (updateCount % 10 === 0) {
          console.log(`🔄 Updated ${updateCount} products...`);
        }
      }
    }

    console.log(`🔄 Updated ${updateCount} products`);
  } catch (error) {
    console.error("Error updating products:", error);
    throw error;
  }
}

/**
 * Main sync function that orchestrates the entire synchronization process
 */
export async function syncProducts(): Promise<void> {
  try {
    const startTime = Date.now();
    console.log("🔄 Starting comprehensive product synchronization...");

    // 1. Pull all products from WooCommerce (with pagination)
    const wooProducts = await pullProducts();

    // 2. Delete products that no longer exist in WooCommerce
    await deleteProducts(wooProducts);

    // 3. Insert new products
    await insertProducts(wooProducts);

    // 4. Update existing products that have changed
    await updateProducts(wooProducts);

    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);

    console.log(
      `✅ Product synchronization completed successfully in ${duration}s`,
    );
  } catch (error) {
    console.error("❌ Error during product synchronization:", error);
    throw error;
  }
}

/**
 * Get statistics about the sync operation
 */
export async function getSyncStatsBasic(): Promise<{
  databaseCount: number;
  wooCommerceCount: number;
  lastSyncTime: Date;
}> {
  try {
    const [dbProducts, wooProducts] = await Promise.all([
      getDatabaseProducts(),
      pullProducts(),
    ]);

    return {
      databaseCount: dbProducts.length,
      wooCommerceCount: wooProducts.length,
      lastSyncTime: new Date(),
    };
  } catch (error) {
    console.error("Error getting sync stats:", error);
    throw error;
  }
}

/**
 * Get products with parsed categories for API responses
 */
export async function getProductsWithCategories() {
  try {
    const dbProducts = await getDatabaseProducts();

    return dbProducts.map((product) => ({
      ...product,
      categories: categoriesFromJson(product.categories),
    }));
  } catch (error) {
    console.error("Error getting products with categories:", error);
    throw error;
  }
}

/**
 * Search products by category name
 */
export async function getProductsByCategory(categoryName: string) {
  try {
    const dbProducts = await getDatabaseProducts();

    return dbProducts
      .map((product) => ({
        ...product,
        categories: categoriesFromJson(product.categories),
      }))
      .filter((product) =>
        product.categories.some((cat) =>
          cat.name.toLowerCase().includes(categoryName.toLowerCase()),
        ),
      );
  } catch (error) {
    console.error("Error searching products by category:", error);
    throw error;
  }
}

/**
 * Get all unique categories from products
 */
export async function getAllCategories(): Promise<CategoryJson[]> {
  try {
    const dbProducts = await getDatabaseProducts();
    const categoryMap = new Map<number, CategoryJson>();

    dbProducts.forEach((product) => {
      const categories = categoriesFromJson(product.categories);
      categories.forEach((cat) => {
        categoryMap.set(cat.id, cat);
      });
    });

    return Array.from(categoryMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  } catch (error) {
    console.error("Error getting all categories:", error);
    throw error;
  }
}

/**
 * Get statistics about the sync operation
 */
export async function getSyncStats(): Promise<{
  databaseCount: number;
  wooCommerceCount: number;
  categoryCount: number;
  lastSyncTime: Date;
}> {
  try {
    const [dbProducts, wooProducts, allCategories] = await Promise.all([
      getDatabaseProducts(),
      pullProducts(),
      getAllCategories(),
    ]);

    return {
      databaseCount: dbProducts.length,
      wooCommerceCount: wooProducts.length,
      categoryCount: allCategories.length,
      lastSyncTime: new Date(),
    };
  } catch (error) {
    console.error("Error getting sync stats:", error);
    throw error;
  }
}

/**
 * Debug function to test raw product fetching
 */
export async function testRawProductFetch(): Promise<void> {
  try {
    console.log("🧪 Testing raw product fetch for diagnosis...");

    // Import the raw product function
    const { getRawProducts } = await import("../../utils/woocommerce");

    // Fetch just a few products without validation
    const rawProducts = await getRawProducts(1, 5);

    console.log("✅ Raw fetch successful!");
    console.log(`📊 Found ${rawProducts.length} products`);

    // Check for problematic fields
    rawProducts.forEach((product: any, index: number) => {
      console.log(`Product ${index + 1} (ID: ${product.id}):`);
      console.log(`  - name: ${product.name}`);
      console.log(`  - date_created: ${product.date_created}`);
      console.log(`  - date_created_gmt: ${product.date_created_gmt}`);
      console.log(
        `  - categories: ${product.categories?.length || 0} categories`,
      );
    });
  } catch (error) {
    console.error("❌ Raw product fetch failed:", error);
    throw error;
  }
}

// If running this file directly for testing
if (import.meta.main) {
  console.log("🚀 Running product manager test...");
  testRawProductFetch()
    .then(() => {
      console.log("✅ Test completed");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
      process.exit(1);
    });
}
