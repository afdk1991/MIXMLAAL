/**
 * E2E测试
 * 版本: v1.0.0.0
 * 说明: 端到端测试，测试完整的用户流程
 */

const { test, expect } = require('@playwright/test');

test.describe('MIXMLAAL应用端到端测试', () => {
  test('首页加载测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await expect(page).toHaveTitle('MIXMLAAL');
    await expect(page.locator('.hero-title')).toContainText('让本地生活更简单');
  });

  test('登录流程测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=登录');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('http://localhost:3000');
    await expect(page.locator('.user-menu')).toBeVisible();
  });

  test('购物车流程测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=商城');
    await page.click('.product-card:first-child');
    await page.click('button:has-text("加入购物车")');
    await page.click('text=购物车');
    await expect(page.locator('.cart-item')).toBeVisible();
  });

  test('订单流程测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=登录');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.click('text=商城');
    await page.click('.product-card:first-child');
    await page.click('button:has-text("加入购物车")');
    await page.click('text=购物车');
    await page.click('button:has-text("去结算")');
    await page.click('button:has-text("提交订单")');
    
    await expect(page).toHaveURL(/\/order\/[a-zA-Z0-9]+/);
  });

  test('外卖服务测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=外卖');
    await expect(page.locator('.merchant-card')).toBeVisible();
    await page.click('.merchant-card:first-child');
    await expect(page.locator('.menu-item')).toBeVisible();
  });

  test('打车服务测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=打车');
    await expect(page.locator('.ride-form')).toBeVisible();
    await page.fill('input[name="start"]', '北京市朝阳区');
    await page.fill('input[name="end"]', '北京市海淀区');
    await page.click('button:has-text("叫车")');
    await expect(page.locator('.driver-list')).toBeVisible();
  });

  test('跑腿服务测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=跑腿');
    await expect(page.locator('.errand-form')).toBeVisible();
    await page.fill('input[name="pickup"]', '北京市朝阳区');
    await page.fill('input[name="dropoff"]', '北京市海淀区');
    await page.click('button:has-text("下单")');
    await expect(page.locator('.errand-confirmation')).toBeVisible();
  });

  test('个人中心测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=登录');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.click('.user-menu');
    await page.click('text=个人中心');
    await expect(page.locator('.profile-form')).toBeVisible();
  });

  test('优惠券测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=登录');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.click('text=优惠券');
    await expect(page.locator('.coupon-card')).toBeVisible();
  });

  test('社交功能测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.click('text=登录');
    await page.fill('input[name="phone"]', '13800138000');
    await page.fill('input[name="password"]', '123456');
    await page.click('button[type="submit"]');
    
    await page.click('text=社交');
    await expect(page.locator('.post-card')).toBeVisible();
  });
});