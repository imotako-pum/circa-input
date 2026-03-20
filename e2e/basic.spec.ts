import { expect, test } from "@playwright/test";

test.describe("circa-input E2E", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("page loads and <circa-input> is visible", async ({ page }) => {
    const circaInput = page.locator("circa-input").first();
    await expect(circaInput).toBeVisible();
  });

  test("click sets a value and fires change event", async ({ page }) => {
    const circaInput = page.locator("#basic circa-input").first();
    await expect(circaInput).toBeVisible();

    // Listen for the change event
    const changePromise = circaInput.evaluate((el) => {
      return new Promise<{ value: number | null }>((resolve) => {
        el.addEventListener(
          "change",
          (e) => {
            resolve((e as CustomEvent).detail);
          },
          { once: true },
        );
      });
    });

    // Click on the track area (middle of the element)
    const box = await circaInput.boundingBox();
    if (!box) throw new Error("circa-input not found");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    const detail = await changePromise;
    expect(detail.value).not.toBeNull();
    expect(typeof detail.value).toBe("number");
  });

  test("drag changes the value", async ({ page }) => {
    const circaInput = page.locator("#basic circa-input").first();
    const box = await circaInput.boundingBox();
    if (!box) throw new Error("circa-input not found");

    // Click to set initial value
    await page.mouse.click(box.x + box.width * 0.3, box.y + box.height / 2);

    // Get value after click
    const valueAfterClick = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );

    // Find the value thumb and drag it horizontally
    const thumb = circaInput.locator("[part='value']");
    const thumbBox = await thumb.boundingBox();
    if (!thumbBox) throw new Error("thumb not found");

    await page.mouse.move(
      thumbBox.x + thumbBox.width / 2,
      thumbBox.y + thumbBox.height / 2,
    );
    await page.mouse.down();
    await page.mouse.move(
      thumbBox.x + thumbBox.width / 2 + 80,
      thumbBox.y + thumbBox.height / 2,
      { steps: 5 },
    );
    await page.mouse.up();

    const valueAfterDrag = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );

    expect(valueAfterDrag).not.toBe(valueAfterClick);
  });

  test("keyboard arrow keys change the value", async ({ page }) => {
    const circaInput = page.locator("#basic circa-input").first();
    const box = await circaInput.boundingBox();
    if (!box) throw new Error("circa-input not found");

    // Click to set initial value
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    const valueBefore = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );

    // Focus the value thumb and press ArrowRight
    const thumb = circaInput.locator("[part='value']");
    await thumb.focus();
    await page.keyboard.press("ArrowRight");

    const valueAfter = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );

    expect(valueAfter).toBeGreaterThan(valueBefore);

    // Press Home to go to min
    await page.keyboard.press("Home");
    const valueAtHome = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );
    expect(valueAtHome).toBe(0);

    // Press End to go to max
    await page.keyboard.press("End");
    const valueAtEnd = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number } }).circaValue
          .value,
    );
    expect(valueAtEnd).toBe(100);
  });

  test("Shift+Arrow keys change margin", async ({ page }) => {
    const circaInput = page.locator("#basic circa-input").first();
    const box = await circaInput.boundingBox();
    if (!box) throw new Error("circa-input not found");

    // Click to set initial value
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);

    const marginBefore = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { marginLow: number | null } })
          .circaValue.marginLow,
    );
    // initialMargin auto-applies a default margin on first value set
    expect(marginBefore).toBeGreaterThanOrEqual(0);

    // Focus and press Shift+ArrowRight to expand margin
    const thumb = circaInput.locator("[part='value']");
    await thumb.focus();
    await page.keyboard.press("Shift+ArrowRight");

    const marginAfter = await circaInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { marginLow: number } }).circaValue
          .marginLow,
    );
    expect(marginAfter).toBeGreaterThan(marginBefore ?? 0);
  });

  test("form submission includes JSON in FormData", async ({ page }) => {
    // Scroll to the form section
    await page.locator("#form").scrollIntoViewIfNeeded();

    const formInput = page.locator("#form-input");
    await expect(formInput).toBeVisible();

    // Set the value programmatically via keyboard to avoid Shadow DOM click issues
    // Focus the value thumb inside Shadow DOM and use Home then ArrowRight
    const thumb = formInput.locator("[part='value']");
    await thumb.focus();
    await page.keyboard.press("End"); // Sets value to max (21)

    // Verify the value was set
    const value = await formInput.evaluate(
      (el) =>
        (el as HTMLElement & { circaValue: { value: number | null } })
          .circaValue.value,
    );
    expect(value).not.toBeNull();

    // Check FormData contains the JSON
    const formData = await page.evaluate(() => {
      const form = document.getElementById("demo-form") as HTMLFormElement;
      const fd = new FormData(form);
      return fd.get("delivery_time") as string;
    });

    expect(formData).not.toBeNull();
    const parsed = JSON.parse(formData);
    expect(parsed).toHaveProperty("value");
    expect(parsed).toHaveProperty("marginLow");
    expect(parsed).toHaveProperty("marginHigh");
    expect(parsed).toHaveProperty("distribution");
  });
});
