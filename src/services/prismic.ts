import * as prismic from '@prismicio/client';
import { HttpRequestLike } from '@prismicio/client';
import { enableAutoPreviews } from '@prismicio/next';

export interface PrismicConfig {
  req?: HttpRequestLike;
}

export function getPrismicClient(config: PrismicConfig): prismic.Client {
  const client = prismic.createClient("https://ignitenewsrm.prismic.io/api/v2");

  enableAutoPreviews({
    client,
    req: config.req,
  })

  return client;
}
