import ky from "ky";

const API_BASE_URL="https://riskprofs.com/wc/v3"

ky.get(API_BASE_URL, {
  headers:{
    "Authorization": `Basic ${Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64')}` 
  }
})

function api(consumerKey?:string, consumerSecret?:string):WooCommerceRestApi | Error{ 
  try{
    return new WooCommerceRestApi({
      consumerKey: consumerKey!,
      consumerSecret: consumerSecret!,
      url: "https://riskprofs.com",
      version: "wc/v3"
    });
  } catch(e:any){
    return e
  }
}

export function getApi(consumerKey?:string, consumerSecret?:string):WooCommerceRestApi{
  const result = api(consumerKey, consumerSecret);

  if (result instanceof Error) {
    throw result
  }

  return result
}

