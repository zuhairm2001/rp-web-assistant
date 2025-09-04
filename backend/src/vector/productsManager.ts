//In this file we are going to upsert products into the vector database
// and manage updating old payloads based on the cron job updates
// all payloads should have matching ids with the product id in the sqlite database as well as
// generated product id based on woocommerce
//
// We will also have a collection here and have a function to update the document search as well
