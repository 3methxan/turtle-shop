import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createInventoryLevelsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTagsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  getProductsStep,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows";
import { ExecArgs } from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  Modules,
  ProductStatus,
} from "@medusajs/framework/utils";
// eventuell change back to seedDemoData//
export default async function seedInitialData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink = container.resolve(ContainerRegistrationKeys.REMOTE_LINK);
  const query = container.resolve(ContainerRegistrationKeys.QUERY);
  const fulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService = container.resolve(Modules.STORE);

  const countries = [
    "at",
    "be",
    "bg",
    "hr",
    "cy",
    "cz",
    "dk",
    "ee",
    "fi",
    "fr",
    "de",
    "gr",
    "hu",
    "ie",
    "it",
    "lv",
    "lt",
    "lu",
    "mt",
    "nl",
    "pl",
    "pt",
    "ro",
    "sk",
    "si",
    "es",
    "se",
  ];
  // ## shop data
  logger.info("Seeding shop data...");

  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Carbon Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // ### create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Carbon Sales Channel",
          },
        ],
      },
    });
    defaultSalesChannel = salesChannelResult;
  }

  await updateStoresWorkflow(container).run({
    input: {
      selector: { id: store.id },
      update: {
        supported_currencies: [
          {
            currency_code: "eur",
            is_default: true,
          },
        ],
        default_sales_channel_id: defaultSalesChannel[0].id,
      },
    },
  });
  // ### regions
  logger.info("Seeding region data.. .");

  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries,
          payment_providers: ["pp_system_default"],
        },
      ],
    },
  });
  const region = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");

  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
    })),
  });
  logger.info("Finished seeding tax regions.");

  logger.info("Seeding stock location data...");

  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
    input: {
      locations: [
        {
          name: "Vienna Supersecret Warehouse",
          address: {
            city: "Vienna",
            country_code: "AT",
            address_1: "",
          },
        },
      ],
    },
  });
  const stockLocation = stockLocationResult[0];

  //const europeanStockLocation = stockLocationResult[0];
  //const americanStockLocation = stockLocationResult[0];

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_provider_id: "manual_manual",
    },
  });

  // ### prerequisite to shipping

  logger.info("Seeding fulfillment data...");
  const { result: shippingProfileResult } =
    await createShippingProfilesWorkflow(container).run({
      input: {
        data: [
          {
            name: "Default",
            type: "default",
          },
        ],
      },
    });
  const shippingProfile = shippingProfileResult[0];

  const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
    name: "European Prodution delivery",
    type: "shipping",
    service_zones: [
      {
        name: "Austria",
        geo_zones: [
          {
            country_code: "at",
            type: "country",
          },
        ],
      },
      {
        name: "Germany and Luxemburg",
        geo_zones: [
          {
            country_code: "de",
            type: "country",
          },
          {
            country_code: "lu",
            type: "country",
          },
        ],
      },
      {
        name: "Switzerland and Liechtenstein",
        geo_zones: [
          {
            country_code: "ch",
            type: "country",
          },
          {
            country_code: "li",
            type: "country",
          },
        ],
      },
      {
        name: "EU remaining",
        geo_zones: [
          {
            country_code: "be",
            type: "country",
          },
          {
            country_code: "bg",
            type: "country",
          },
          {
            country_code: "hr",
            type: "country",
          },
          {
            country_code: "cy",
            type: "country",
          },
          {
            country_code: "cz",
            type: "country",
          },
          {
            country_code: "dk",
            type: "country",
          },
          {
            country_code: "ee",
            type: "country",
          },
          {
            country_code: "fi",
            type: "country",
          },
          {
            country_code: "fr",
            type: "country",
          },
          {
            country_code: "gr",
            type: "country",
          },
          {
            country_code: "hu",
            type: "country",
          },
          {
            country_code: "ie",
            type: "country",
          },
          {
            country_code: "it",
            type: "country",
          },
          {
            country_code: "lv",
            type: "country",
          },
          {
            country_code: "lt",
            type: "country",
          },
          {
            country_code: "mt",
            type: "country",
          },
          {
            country_code: "nl",
            type: "country",
          },
          {
            country_code: "pl",
            type: "country",
          },
          {
            country_code: "pt",
            type: "country",
          },
          {
            country_code: "ro",
            type: "country",
          },
          {
            country_code: "sk",
            type: "country",
          },
          {
            country_code: "si",
            type: "country",
          },
          {
            country_code: "es",
            type: "country",
          },
          {
            country_code: "sw",
            type: "country",
          },
          {
            country_code: "is",
            type: "country",
          },
          {
            country_code: "no",
            type: "country",
          },
        ],
      },
    ],
  });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: stockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: fulfillmentSet.id,
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      {
        name: "Standard Shipping AT",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Shipping of your Goodie",
          code: "standard",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 4.9,
          },
          {
            region_id: region.id,
            amount: 4.9,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Standard Shipping DE LU",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[1].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Shipping of your Goodie",
          code: "express",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 7,
          },
          {
            region_id: region.id,
            amount: 7,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Standard Shipping CH LI",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[2].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Shipping of your Goodie",
          code: "standard",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 22,
          },
          {
            region_id: region.id,
            amount: 22,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
      {
        name: "Standard Shipping CH",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: fulfillmentSet.service_zones[3].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Shipping of your Goodie",
          code: "express",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 12,
          },
          {
            region_id: region.id,
            amount: 12,
          },
        ],
        rules: [
          {
            attribute: "enabled_in_store",
            value: '"true"',
            operator: "eq",
          },
          {
            attribute: "is_return",
            value: "false",
            operator: "eq",
          },
        ],
      },
    ],
  });
  logger.info("Finished seeding fulfillment data.");

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocation.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding stock location data.");

  logger.info("Seeding publishable API key data...");
  const { result: publishableApiKeyResult } = await createApiKeysWorkflow(
    container
  ).run({
    input: {
      api_keys: [
        {
          title: "Webshop",
          type: "publishable",
          created_by: "3methxan",
        },
      ],
    },
  });
  const publishableApiKey = publishableApiKeyResult[0];

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  });
  logger.info("Finished seeding publishable API key data.");

  logger.info("Seeding product data...");

  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
    input: {
      product_categories: [
        {
          name: "Apparel",
          is_active: true,
        },
        {
          name: "Shirts",
          is_active: true,
        },
        {
          name: "Hoodies",
          is_active: true,
        },
        {
          name: "Socks",
          is_active: true,
        },
        {
          name: "Merch",
          is_active: true,
        },
      ],
    },
  });

  const { result: productTagsResult } = await createProductTagsWorkflow(
    container
  ).run({
    input: {
      product_tags: [
        {
          value: "Best Sellers",
        },
        {
          value: "Only 10 Ever Produced",
        },
        {
          value: "Rare edition - XS",
        },
        {
          value: "Up to XXXXL",
        },
        {
          value: "Misprints",
        },
      ],
    },
  });

  const { result: collectionsResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: "EXFISCH",
          handle: "exfisch",
        },
        {
          title: "FLORESC",
          handle: "floresc",
        },
        {
          title: "TROOPER",
          handle: "trooper",
        },
        {
          title: "FINGER",
          handle: "finger",
        },
        {
          title: "SIX F",
          handle: "six_f",
        },
        {
          title: "FUUYOU",
          handle: "fuuyuo",
        },
        {
          title: "BLANK",
          handle: "blank",
        },
        {
          title: "misprints",
          handle: "misprints",
        },
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "EXFISCH Hoodie",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Apparel").id,
            categoryResult.find((cat) => cat.name === "Hoodies").id,
          ],
          description:
            "Nothing says Happy Holidays better, than this subtle referece to whats killing our planet.",
          handle: "exfisch-hoodie",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "assets/media/EXFISCH-HOODIE-BLACK_white.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
            },
            {
              title: "Color",
              values: ["Black"],
            },
          ],
          variants: [
            {
              title: "Hoodie EXFISCH / S / Black",
              sku: "EXFISCH-H-BLACK-S",
              options: {
                Size: "S",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / M / Black",
              sku: "EXFISCH-H-BLACK-M",
              options: {
                Size: "M",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / L / Black",
              sku: "EXFISCH-H-BLACK-L",
              options: {
                Size: "L",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / XL / Black",
              sku: "EXFISCH-H-BLACK-XL",
              options: {
                Size: "XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / 2XL / Black",
              sku: "EXFISCH-H-BLACK-2XL",
              options: {
                Size: "2XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / 3XL / Black",
              sku: "EXFISCH-H-BLACK-3XL",
              options: {
                Size: "3XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / 4XL / Black",
              sku: "EXFISCH-H-BLACK-4XL",
              options: {
                Size: "4XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie EXFISCH / 5XL / Black",
              sku: "EXFISCH-H-BLACK-5XL",
              options: {
                Size: "5XL",
                Color: "Black",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },

        {
          title: "FUUYOU Hoodie",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Apparel").id,
            categoryResult.find((cat) => cat.name === "Hoodies").id,
          ],

          description: "Incredible hoodie. You need one for sure.",
          handle: "fuuyou-hoodie",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "assets/media/FU-HOODIE-WHITE_black.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
            },
            {
              title: "Color",
              values: ["White"],
            },
          ],
          variants: [
            {
              title: "Hoodie FUUYOU / S / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "S",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / M / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "M",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / L / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "L",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / XL / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / 2XL / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "2XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / 3XL / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "3XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / 4XL / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "4XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Hoodie FUUYOU / 5XL / White",
              sku: "FUUYOU-H-BLACK-S",
              options: {
                Size: "5XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 120.0,
                  currency_code: "eur",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },

        {
          title: "TROOPER Shirt",
          category_ids: [
            categoryResult.find((cat) => cat.name === "Apparel").id,
            categoryResult.find((cat) => cat.name === "Shirts").id,
          ],

          description: "Incredible Shirt. You need one for sure.",
          handle: "trooper-shirt",
          weight: 400,
          status: ProductStatus.PUBLISHED,
          images: [
            {
              url: "assets/media/TROOPER-SHIRT-WHITE_black.png",
            },
          ],
          options: [
            {
              title: "Size",
              values: ["S", "M", "L", "XL", "2XL", "3XL", "4XL", "5XL"],
            },
            {
              title: "Color",
              values: ["White"],
            },
          ],
          variants: [
            {
              title: "Shirt TROOPER / S / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "S",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / M / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "M",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / L / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "L",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / XL / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / 2XL / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "2XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / 3XL / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "3XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / 4XL / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "4XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
            {
              title: "Shirt TROOPER / 5XL / White",
              sku: "TROOPER-H-BLACK-S",
              options: {
                Size: "5XL",
                Color: "White",
              },
              prices: [
                {
                  amount: 70.0,
                  currency_code: "eur",
                },
              ],
            },
          ],
          sales_channels: [
            {
              id: defaultSalesChannel[0].id,
            },
          ],
        },
      ],
    },
  });
  logger.info("Finished seeding product data.");

  logger.info("Seeding inventory levels.");

  const { data: inventoryItems } = await query.graph({
    entity: "inventory_item",
    fields: ["id"],
  });

  const inventoryLevels = [];
  for (const inventoryItem of inventoryItems) {
    const inventoryLevel = {
      location_id: stockLocation.id,
      stocked_quantity: 14,
      inventory_item_id: inventoryItem.id,
    };
    inventoryLevels.push(inventoryLevel);
  }

  await createInventoryLevelsWorkflow(container).run({
    input: {
      inventory_levels: inventoryLevels,
    },
  });

  logger.info("Finished seeding inventory levels data.");
}
