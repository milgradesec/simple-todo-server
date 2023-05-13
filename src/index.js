export default {
  async fetch(request) {
    const { pathname } = new URL(request.url);
    if (pathname.startsWith("/login") && (request.method == "POST")) {
      const { username, password } = await request.json();

      if (username === "admin" && password === "password123") {
        const responseBody = { message: "OK", token: "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb" };
        const responseInit = {
          status: 200,
          headers: {
            "Content-Type": "application/json"
          }
        };
        return new Response(JSON.stringify(responseBody), responseInit);
      } else {
        const responseBody = { message: "Invalid username or password" };
        const responseInit = {
          status: 401,
          headers: {
            "Content-Type": "application/json"
          }
        };
        return new Response(JSON.stringify(responseBody), responseInit);
      }
    }

    const authHeader = request.headers.get("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const responseBody = { message: "Bearer token missing or invalid" };
      const responseInit = {
        status: 401,
        headers: {
          "Content-Type": "application/json"
        }
      };
      return new Response(JSON.stringify(responseBody), responseInit);
    }

    const token = authHeader.split(" ")[1];

    if (token == "w9Z8RLiftZztnd2ygnt5SRHpcaahL3zPBFLS7MTJYb") {
      const responseBody = { message: "Authenticated successfully" };
      const responseInit = {
        status: 200,
        headers: {
          "Content-Type": "application/json"
        }
      };
      return new Response(JSON.stringify(responseBody), responseInit);
    }

    const responseBody = { message: "Invalid Authentication" };
    const responseInit = {
      status: 401,
      headers: {
        "Content-Type": "application/json"
      }
    };
    return new Response(JSON.stringify(responseBody), responseInit);
  },
};