import { getLastFeatured } from "$queries/artworks";

export async function post({ locals }) {
  let { q } = locals;

  try {
    let { featured } = await q(getLastFeatured);

    return {
      body: {
        featured,
      }
    };
  } catch (e) {
    console.log(e);
    return {
      body: {},
      status: 500,
    };
  }
}
