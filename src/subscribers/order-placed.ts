import type {
    SubscriberArgs,
    SubscriberConfig,
  } from "@medusajs/framework"
  import { sendOrderConfirmWorkflow } from "../workflows/send-order-confirm"
  
  export default async function orderPlacedHandler({
    event: { data },
    container,
  }: SubscriberArgs<{ id: string }>) {
    await sendOrderConfirmWorkflow(container)
      .run({
        input: {
          id: data.id
        }
      })
  }
  
  export const config: SubscriberConfig = {
    event: "order.placed",
  }