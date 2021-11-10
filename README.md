# ipip for deno

# Example

```js
import { IPDB } from "https://deno.land/x/ipip_ipdb_deno/mod.ts";

const ipdb = new IPDB("./dbFIlePath.ipdb");
ip.find("1.1.1.1");
/**
 * output:
 * 	{
 *    country_name: "CLOUDFLARE.COM",
 *    region_name: "CLOUDFLARE.COM",
 *    city_name: "",
 *    owner_domain: "apnic.net",
 *    isp_domain: "",
 *    latitude: "",
 *    longitude: "",
 *    timezone: "",
 *    utc_offset: "",
 *    china_admin_code: "",
 *    idd_code: "",
 *    country_code: "",
 *    continent_code: "",
 *    idc: "IDC",
 *    base_station: "",
 *    country_code3: "",
 *    european_union: "0",
 *    currency_code: "",
 *    currency_name: "",
 *    anycast: "ANYCAST"
 *  }
 */
```