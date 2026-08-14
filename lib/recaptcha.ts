import "server-only";

export async function verificarRecaptcha(token: string, ip: string | null): Promise<boolean> {
  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret || !token) return false;

  const params = new URLSearchParams({ secret, response: token });
  if (ip) params.set("remoteip", ip);

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });
    const data = await res.json();
    return data.success === true;
  } catch {
    return false;
  }
}
