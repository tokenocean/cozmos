import { serverApi } from "$lib/api";

export async function post(request) {
  let { body, locals } = request
  try {
    const res = await serverApi.url("/login").post(body).res();

    let headers = {};
    let cookies = [res.headers.get('set-cookie').split(',').slice(0, 2).join("")];
    headers['set-cookie'] = cookies;

    let tokenExpiry = parseInt(jwt_expires_in / 1000);

    return {
      body,
      headers: {
        "set-cookie": [
          res.headers.get("set-cookie").split(",").slice(0, 2).join(""),
          cookie.serialize("token", jwt_token, {
            httpOnly: true,
            maxAge: tokenExpiry,
            sameSite: "lax",
            path: "/",
            expires: addSeconds(new Date(), tokenExpiry),
          }),
        ],
      },
    };
  } catch (e) {
    console.log(e);
    return {
      body: { message: "Login failed" },
      status: 500,
    };
  }
}
