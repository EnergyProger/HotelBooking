import { test, expect } from "@playwright/test";
import path from "path";

const FRONTEND_URL = "http://localhost:5173/";

test.beforeEach(async ({ page }) => {
  await page.goto(FRONTEND_URL);

  await page.getByRole("link", { name: "Sign In" }).click();

  await expect(page.getByRole("heading", { name: "Sign In" })).toBeVisible();

  await page.locator("[name=email]").fill("test@gmail.com");
  await page.locator("[name=password]").fill("password123");

  await page.getByRole("button", { name: "Login" }).click();

  await expect(page.getByText("Sign in Successful!")).toBeVisible();
});

test("should allow user to add a hotel", async ({ page }) => {
  await page.goto(`${FRONTEND_URL}add-hotel`);

  await page.locator('[name="name"]').fill("Test Hotel");
  await page.locator('[name="city"]').fill("Test City");
  await page.locator('[name="country"]').fill("Test Country");
  await page
    .locator('[name="description"]')
    .fill("This is a description for the Test Hotel");
  await page.locator('[name="pricePerNight"]').fill("100");
  await page.selectOption('select[name="starRating"]', "3");

  await page.getByText("Budget").click();

  await page.getByLabel("Free Wifi").check();
  await page.getByLabel("Parking").check();

  await page.locator('[name="adultCount"]').fill("2");
  await page.locator('[name="childCount"]').fill("1");

  await page.setInputFiles('[name="imageFiles"]', [
    path.join(__dirname, "files", "hotel1_1.jpg"),
    path.join(__dirname, "files", "hotel1_2.jpg"),
  ]);

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel Saved!")).toBeVisible();
});

test("should display hotels", async ({ page }) => {
  await page.goto(`${FRONTEND_URL}my-hotels`);

  await expect(
    page.getByRole("heading", { name: "Test Hotel" }).first()
  ).toBeVisible();
  await expect(
    page.getByText("This is a description for the Test Hotel").first()
  ).toBeVisible();
  await expect(page.getByText("Test City, Test Country").first()).toBeVisible();
  await expect(page.getByText("Budget").first()).toBeVisible();
  await expect(page.getByText("$100 per night").first()).toBeVisible();
  await expect(page.getByText("2 adults, 1 children").first()).toBeVisible();
  await expect(page.getByText("3 Star Rating").first()).toBeVisible();

  await expect(
    page.getByRole("link", { name: "View Details" }).first()
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Hotel" })).toBeVisible();
});

test("should edit hotel", async ({ page }) => {
  await page.goto(`${FRONTEND_URL}my-hotels`);

  await page.getByRole("link", { name: "View Details" }).first().click();

  await page.waitForSelector('[name="name"]', { state: "attached" });

  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel");
  await page.locator('[name="name"]').fill("Test Hotel Updated");

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel Updated!")).toBeVisible();

  await page.reload();

  await expect(page.locator('[name="name"]')).toHaveValue("Test Hotel Updated");
  await page.locator('[name="name"]').fill("Test Hotel");

  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Hotel Updated!")).toBeVisible();
});
