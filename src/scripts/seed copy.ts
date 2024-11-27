import {
  createApiKeysWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createProductTagsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/core-flows";
import { ContainerRegistrationKeys, Modules } from "@medusajs/framework/utils";
import type { Logger } from "@medusajs/types";
import type { RemoteLink } from "@medusajs/modules-sdk";
import type {
  ExecArgs,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  IStoreModuleService,
} from "@medusajs/types";
import { seedProducts } from "./seed/products";
import type { IPaymentModuleService } from "@medusajs/framework/types";
import { createCollectionsWorkflow } from "@medusajs/medusa/core-flows";
// import { neon } from "@neondatabase/serverless";

export default async function seedDemoData({ container }: ExecArgs) {
  const logger: Logger = container.resolve(ContainerRegistrationKeys.LOGGER);
  const remoteLink = container.resolve<RemoteLink>(
    ContainerRegistrationKeys.REMOTE_LINK
  );
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    Modules.FULFILLMENT
  );
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(Modules.SALES_CHANNEL);
  const storeModuleService: IStoreModuleService = container.resolve(
    Modules.STORE
  );

  const paymentModuleService: IPaymentModuleService = container.resolve(
    Modules.PAYMENT
  );

  const europeanCountries = [
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
  const allCountries = [...europeanCountries];

  logger.info("Seeding shop data...");

  const [store] = await storeModuleService.listStores();
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "Main Sales Channel",
  });

  if (!defaultSalesChannel.length) {
    // create the default sales channel
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "Main Sales Channel",
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
  logger.info("Seeding region data...");

  const { result: regionResult } = await createRegionsWorkflow(container).run({
    input: {
      regions: [
        {
          name: "Europe",
          currency_code: "eur",
          countries: europeanCountries,
          payment_providers: ["pp_stripe_stripe"],
        },
      ],
    },
  });
  const euRegion = regionResult[0];
  logger.info("Finished seeding regions.");

  logger.info("Seeding tax regions...");

  await createTaxRegionsWorkflow(container).run({
    input: allCountries.map((country_code) => ({
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
          name: "Vienna location",
          address: {
            city: "Vienna",
            country_code: "AT",
            address_1: "Somewhere",
            postal_code: "1111",
          },
        },
      ],
    },
  });
  const europeanStockLocation = stockLocationResult[0];
  // const americanStockLocation = stockLocationResult[0];

  await remoteLink.create([
    {
      [Modules.STOCK_LOCATION]: {
        stock_location_id: europeanStockLocation.id,
      },
      [Modules.FULFILLMENT]: {
        fulfillment_provider_id: "manual_manual",
      },
    },
  ]);

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

  const europeanFulfillmentSet =
    await fulfillmentModuleService.createFulfillmentSets({
      name: "European delivery",
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
          name: "Belgium",
          geo_zones: [
            {
              country_code: "be",
              type: "country",
            },
          ],
        },
        {
          name: "Bulgaria",
          geo_zones: [
            {
              country_code: "bg",
              type: "country",
            },
          ],
        },
        {
          name: "Croatia",
          geo_zones: [
            {
              country_code: "hr",
              type: "country",
            },
          ],
        },
        {
          name: "Cyprus",
          geo_zones: [
            {
              country_code: "cy",
              type: "country",
            },
          ],
        },
        {
          name: "Czech Republic",
          geo_zones: [
            {
              country_code: "cz",
              type: "country",
            },
          ],
        },
        {
          name: "Denmark",
          geo_zones: [
            {
              country_code: "dk",
              type: "country",
            },
          ],
        },
        {
          name: "Estonia",
          geo_zones: [
            {
              country_code: "ee",
              type: "country",
            },
          ],
        },
        {
          name: "Finland",
          geo_zones: [
            {
              country_code: "fi",
              type: "country",
            },
          ],
        },
        {
          name: "France",
          geo_zones: [
            {
              country_code: "fr",
              type: "country",
            },
          ],
        },
        {
          name: "Germany",
          geo_zones: [
            {
              country_code: "de",
              type: "country",
            },
          ],
        },
        {
          name: "Greece",
          geo_zones: [
            {
              country_code: "gr",
              type: "country",
            },
          ],
        },
        {
          name: "Hungary",
          geo_zones: [
            {
              country_code: "hu",
              type: "country",
            },
          ],
        },
        {
          name: "Ireland",
          geo_zones: [
            {
              country_code: "ie",
              type: "country",
            },
          ],
        },
        {
          name: "Italy",
          geo_zones: [
            {
              country_code: "it",
              type: "country",
            },
          ],
        },
        {
          name: "Latvia",
          geo_zones: [
            {
              country_code: "lv",
              type: "country",
            },
          ],
        },
        {
          name: "Lithuania",
          geo_zones: [
            {
              country_code: "lt",
              type: "country",
            },
          ],
        },

        {
          name: "Luxembourg",
          geo_zones: [
            {
              country_code: "lu",
              type: "country",
            },
          ],
        },
        {
          name: "Malta",
          geo_zones: [
            {
              country_code: "mt",
              type: "country",
            },
          ],
        },
        {
          name: "Netherlands",
          geo_zones: [
            {
              country_code: "nl",
              type: "country",
            },
          ],
        },
        {
          name: "Poland",
          geo_zones: [
            {
              country_code: "pl",
              type: "country",
            },
          ],
        },
        {
          name: "Portugal",
          geo_zones: [
            {
              country_code: "pt",
              type: "country",
            },
          ],
        },
        {
          name: "Romania",
          geo_zones: [
            {
              country_code: "ro",
              type: "country",
            },
          ],
        },
        {
          name: "Slovakia",
          geo_zones: [
            {
              country_code: "sk",
              type: "country",
            },
          ],
        },
        {
          name: "Slovenia",
          geo_zones: [
            {
              country_code: "si",
              type: "country",
            },
          ],
        },
        {
          name: "Spain",
          geo_zones: [
            {
              country_code: "es",
              type: "country",
            },
          ],
        },
        {
          name: "Sweden",
          geo_zones: [
            {
              country_code: "sw",
              type: "country",
            },
          ],
        },
      ],
    });

  await remoteLink.create({
    [Modules.STOCK_LOCATION]: {
      stock_location_id: europeanStockLocation.id,
    },
    [Modules.FULFILLMENT]: {
      fulfillment_set_id: europeanFulfillmentSet.id,
    },
  });

  // const northAmericanFulfillmentSet =
  //   await fulfillmentModuleService.createFulfillmentSets({
  //     name: "North American delivery",
  //     type: "shipping",
  //     service_zones: [
  //       {
  //         name: "United States",
  //         geo_zones: [
  //           {
  //             country_code: "us",
  //             type: "country",
  //           },
  //         ],
  //       },
  //       {
  //         name: "Canada",
  //         geo_zones: [
  //           {
  //             country_code: "ca",
  //             type: "country",
  //           },
  //         ],
  //       },
  //     ],
  //   });

  // await remoteLink.create({
  //   [Modules.STOCK_LOCATION]: {
  //     stock_location_id: europeanStockLocation.id,
  //   },
  //   [Modules.FULFILLMENT]: {
  //     fulfillment_set_id: northAmericanFulfillmentSet.id,
  //   },
  // });

  // now some collections
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
      ],
    },
  });

  await createShippingOptionsWorkflow(container).run({
    input: [
      // {
      //   name: "Standard Shipping",
      //   price_type: "flat",
      //   provider_id: "manual_manual",
      //   service_zone_id: northAmericanFulfillmentSet.service_zones[0].id,
      //   shipping_profile_id: shippingProfile.id,
      //   type: {
      //     label: "Standard",
      //     description: "Ship in 2-3 days.",
      //     code: "standard",
      //   },
      //   prices: [
      //     {
      //       currency_code: "usd",
      //       amount: 6,
      //     },
      //     {
      //       currency_code: "cad",
      //       amount: 5,
      //     },
      //     {
      //       region_id: usRegion.id,
      //       amount: 6,
      //     },
      //     {
      //       region_id: caRegion.id,
      //       amount: 5,
      //     },
      //   ],
      //   rules: [
      //     {
      //       attribute: "enabled_in_store",
      //       value: '"true"',
      //       operator: "eq",
      //     },
      //     {
      //       attribute: "is_return",
      //       value: "false",
      //       operator: "eq",
      //     },
      //   ],
      // },
      // {
      //   name: "Express Shipping",
      //   price_type: "flat",
      //   provider_id: "manual_manual",
      //   service_zone_id: northAmericanFulfillmentSet.service_zones[0].id,
      //   shipping_profile_id: shippingProfile.id,
      //   type: {
      //     label: "Express",
      //     description: "This is gonna go out in 24h.",
      //     code: "express",
      //   },
      //   prices: [
      //     {
      //       currency_code: "usd",
      //       amount: 12,
      //     },
      //     {
      //       currency_code: "cad",
      //       amount: 10,
      //     },
      //     {
      //       region_id: usRegion.id,
      //       amount: 12,
      //     },
      //     {
      //       region_id: caRegion.id,
      //       amount: 10,
      //     },
      //   ],
      //   rules: [
      //     {
      //       attribute: "enabled_in_store",
      //       value: '"true"',
      //       operator: "eq",
      //     },
      //     {
      //       attribute: "is_return",
      //       value: "false",
      //       operator: "eq",
      //     },
      //   ],
      // },

      {
        name: "Standard Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: europeanFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Standard",
          description: "Ship in 2-3 days.",
          code: "standard",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 9.9,
          },
          {
            region_id: euRegion.id,
            amount: 9.9,
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
        name: "Express Shipping",
        price_type: "flat",
        provider_id: "manual_manual",
        service_zone_id: europeanFulfillmentSet.service_zones[0].id,
        shipping_profile_id: shippingProfile.id,
        type: {
          label: "Express",
          description: "Ship in 24 hours.",
          code: "express",
        },
        prices: [
          {
            currency_code: "eur",
            amount: 15,
          },
          {
            region_id: euRegion.id,
            amount: 15,
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
      id: europeanStockLocation.id,
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
          title: "Storefront",
          type: "publishable",
          created_by: "3methxan@gmail.com",
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
      ],
    },
  });

  await createProductsWorkflow(container).run({
    input: {
      products: seedProducts({
        collections: collectionsResult,
        tags: productTagsResult,
        categories: categoryResult,
        sales_channels: [{ id: defaultSalesChannel[0].id }],
      }),
    },
  });

  logger.info("Finished seeding product data.");
}
