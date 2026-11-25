"""Google and GitHub sign-in: swap the authorization code the frontend received for the provider's access
token, then read who the person is. Each function returns the same profile shape:

    {"provider": "google" | "github", "provider_user_id": str, "email": str, "full_name": str}

Only a verified email is accepted, because the email decides which Eval Space account the person gets.
"""

import httpx

from config import get_settings

GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token"
GOOGLE_USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo"
GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token"
GITHUB_API_URL = "https://api.github.com"

_TIMEOUT = httpx.Timeout(10.0)


class SSONotConfigured(Exception):
    """The provider's client id, secret or redirect URI isn't set."""


class SSOError(Exception):
    """The provider refused the code, or the account can't be used (for example, no verified email)."""


class SSOProviderUnavailable(Exception):
    """The provider couldn't be reached or answered with an unexpected error."""


async def _post(client: httpx.AsyncClient, url: str, **kwargs) -> httpx.Response:
    try:
        return await client.post(url, **kwargs)
    except httpx.HTTPError as exc:
        raise SSOProviderUnavailable from exc


async def _get_json(client: httpx.AsyncClient, url: str, token: str, **headers):
    try:
        res = await client.get(url, headers={"Authorization": f"Bearer {token}", **headers})
    except httpx.HTTPError as exc:
        raise SSOProviderUnavailable from exc
    if res.status_code != 200:
        raise SSOProviderUnavailable(f"{url} answered {res.status_code}")
    return res.json()


async def fetch_google_profile(code: str) -> dict:
    s = get_settings()
    if not (s.google_client_id and s.google_client_secret and s.google_redirect_uri):
        raise SSONotConfigured

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        res = await _post(
            client,
            GOOGLE_TOKEN_URL,
            data={
                "code": code,
                "client_id": s.google_client_id,
                "client_secret": s.google_client_secret,
                "redirect_uri": s.google_redirect_uri,
                "grant_type": "authorization_code",
            },
        )
        if res.status_code == 400:  # invalid, expired or already used code
            raise SSOError("Google didn't accept the sign-in code. Try signing in again.")
        if res.status_code != 200:
            raise SSOProviderUnavailable(f"Google token endpoint answered {res.status_code}")
        access_token = res.json()["access_token"]

        info = await _get_json(client, GOOGLE_USERINFO_URL, access_token)

    if not info.get("email") or not info.get("email_verified"):
        raise SSOError("Your Google account has no verified email address.")
    return {
        "provider": "google",
        "provider_user_id": info["sub"],
        "email": info["email"],
        "full_name": info.get("name") or info["email"].split("@")[0],
    }


async def fetch_github_profile(code: str) -> dict:
    s = get_settings()
    if not (s.github_client_id and s.github_client_secret and s.github_redirect_uri):
        raise SSONotConfigured

    async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
        res = await _post(
            client,
            GITHUB_TOKEN_URL,
            headers={"Accept": "application/json"},
            data={
                "code": code,
                "client_id": s.github_client_id,
                "client_secret": s.github_client_secret,
                "redirect_uri": s.github_redirect_uri,
            },
        )
        if res.status_code != 200:
            raise SSOProviderUnavailable(f"GitHub token endpoint answered {res.status_code}")
        body = res.json()
        if "access_token" not in body:  # GitHub reports a bad code as 200 with an "error" field
            raise SSOError("GitHub didn't accept the sign-in code. Try signing in again.")
        access_token = body["access_token"]

        api = {"Accept": "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28"}
        user = await _get_json(client, f"{GITHUB_API_URL}/user", access_token, **api)
        # needs the user:email scope; the profile's own email field is often empty or unverified
        emails = await _get_json(client, f"{GITHUB_API_URL}/user/emails", access_token, **api)

    primary = next((e for e in emails if e.get("primary") and e.get("verified")), None)
    if primary is None:
        raise SSOError("Your GitHub account has no verified primary email address.")
    return {
        "provider": "github",
        "provider_user_id": str(user["id"]),
        "email": primary["email"],
        "full_name": user.get("name") or user["login"],
    }
