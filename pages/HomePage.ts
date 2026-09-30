import { type Locator, type Page, expect } from '@playwright/test';

export class HomePage {
  readonly page: Page;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;
  readonly sortDropdown: Locator;
  readonly productLinks: Locator;
  readonly nextPageLink: Locator;
  readonly productPrices: Locator;
  readonly productName: Locator;
  readonly addToCartButton: Locator;
  readonly cartRemoveButton: Locator;
  readonly cartToast: Locator;
  private readonly savedProductPaths: Record<string, string>;

  constructor(page: Page) {
    this.page = page;
    this.cartLink = page.locator('[data-test="nav-cart"]');
    this.cartBadge = page.locator('[data-test="cart-quantity"]');
    this.sortDropdown = page.locator('[data-test="sort"]');
    this.productLinks = page.locator('a[data-test^="product-"]');
    this.nextPageLink = page.locator('[data-test="pagination-next"]');
    this.productPrices = page.locator('[data-test="product-price"]');
    this.productName = page.locator('[data-test="product-name"]');
    this.addToCartButton = page.locator('[data-test="add-to-cart"]');
    this.cartRemoveButton = page.locator('a.btn.btn-danger');
    this.cartToast = page.locator('[role="alert"]', { hasText: 'Product added to shopping cart.', });
    this.savedProductPaths = {
      'Combination Pliers': '/product/01M37PSYMDEQSQQ80XC0SVCY9H',
      'Pliers': '/product/01M37PSYMVCWS329HHH5N4A15T',
      'Bolt Cutters': '/product/01M37PSYMYX0TZEN6VT5WF15Q3',
    };
  }
  async goto(path = '/'): Promise<void> {
    await this.page.goto(`https://practicesoftwaretesting.com${path}`);
  }
  async open(): Promise<void> {
    await this.goto();
  }
  async getProductNames(): Promise<string[]> {
    return await this.productLinks.allTextContents();
  }
  async getVisiblePrices(): Promise<string[]> {
    return await this.productPrices.allTextContents();
  }
  async sortBy(optionValue: string): Promise<void> {
    await this.sortDropdown.selectOption(optionValue);
  }
  async getCartCount(): Promise<number> {
    const cartLocator = this.cartBadge;
    const cartText = (await cartLocator.textContent().catch(() => '')) ?? '';
    const match = cartText.match(/\d+/);
    return match ? Number(match[0]) : 0;
  }
  async addItemToCart(productName: string): Promise<void> {
    const savedProductPath = this.savedProductPaths[productName];
    if (savedProductPath) {
      await this.goto(savedProductPath);
      await this.addCurrentProductToCart(productName);
      return;
    }
    const productLocator = await this.findProductLink(productName);
    if ((await productLocator.count()) === 0) {
      throw new Error(`Product not found: ${productName}`);
    }
    await productLocator.waitFor();
    await expect(productLocator).toBeVisible();
    await productLocator.click();
    await this.addCurrentProductToCart(productName);
  }
  private async findProductLink(productName: string): Promise<Locator> {
    const escapedName = productName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const productPattern = new RegExp(escapedName, 'i');
    for (let pageNumber = 0; pageNumber < 10; pageNumber += 1) {
      const productLink = this.productLinks.filter({ hasText: productPattern }).first();
      if ((await productLink.count()) > 0) {
        return productLink;
      }
      if ((await this.nextPageLink.count()) === 0 || !(await this.nextPageLink.isEnabled())) {
        break;
      }
      await this.nextPageLink.click();
      await this.page.waitForLoadState('networkidle');
    }
    return this.productLinks.filter({ hasText: productPattern }).first();
  }
  private async addCurrentProductToCart(productName: string): Promise<void> {
    const productTitle = this.productName.first();
    await productTitle.waitFor();
    await expect(productTitle).toContainText(productName);
    const addToCartButton = this.addToCartButton.first();
    await addToCartButton.waitFor();
    await addToCartButton.click();
    await this.cartToast.waitFor();
  }
  async removeItemFromCart(): Promise<void> {
    await this.page.waitForTimeout(5000);
    await this.cartLink.click();
    await this.page.locator('[data-test="product-title"]').first().waitFor();
    const removeButton = this.cartRemoveButton.first();
    if ((await removeButton.count()) === 0) {
      throw new Error('The cart page does not expose a remove-item control.');
    }
    const cartCountBeforeRemoval = await this.getCartCount();
    await removeButton.click();
    await expect
      .poll(() => this.getCartCount())
      .toBe(cartCountBeforeRemoval - 1);
  }
}
