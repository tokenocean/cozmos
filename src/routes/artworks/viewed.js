import { serverApi } from "$lib/api";
export async function post({ request }) {
  try {
    const body = await request.json();
    return serverApi.url("/viewed").post(body);
  } catch (e) {
    console.log(e);
    return {
      body: { message: "Problem incrementing view count" },
      status: 500,
    };
  }
}
