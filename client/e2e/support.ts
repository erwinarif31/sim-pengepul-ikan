import { expect, type APIRequestContext, type Page } from "@playwright/test";

export const users = {
  admin: { id: "admin", password: "admin123" },
  owner: { id: "owner1", password: "owner123" },
  owner2: { id: "owner2", password: "owner223" },
  worker: { id: "worker1", password: "worker123" },
} as const;

export async function login(page: Page, user: keyof typeof users = "admin") {
  await page.goto("/login");
  await page.getByLabel("ID pengguna").fill(users[user].id);
  await page.getByLabel("Password").fill(users[user].password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page).toHaveURL(/\/$/);
}

export async function apiToken(request: APIRequestContext, user: keyof typeof users) {
  const response = await request.post("/api/users/login", { data: users[user] });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).data.token as string;
}

export function apiFailures(page: Page) {
  const failures: string[] = [];
  page.on("response", (response) => {
    if (response.url().includes("/api/") && response.status() >= 400) {
      failures.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });
  page.on("pageerror", (error) => failures.push(`pageerror ${error.message}`));
  return failures;
}

export async function confirmNextDialog(page: Page) {
  page.once("dialog", (dialog) => dialog.accept());
}

export async function firstDetailUrl(page: Page, prefix: string) {
  const link = page.locator(`a[href^="${prefix}"]:not([href="${prefix}"])`).last();
  await expect(link).toBeVisible();
  return await link.getAttribute("href");
}
