import { test, expect } from '@playwright/test';
import { campusDateTime } from '../../src/domain/rides.js';
import { createSeed } from '../../src/data/seed.js';

async function fillRide(page) {
  const { date } = campusDateTime(Date.now() + 2 * 86400000);
  await page.getByLabel('Leaving from').fill('Batroun');
  await page.getByLabel('Date', { exact: true }).fill(date);
  await page.getByLabel('Departs').fill('08:30');
  await page.getByLabel('Seats going spare').fill('4');
  await page.getByLabel('Price a seat').fill('3.50');
}

test('create, persist, and edit a ride; validate real errors', async ({ page }, testInfo) => {
  const runtimeErrors = [];
  page.on('pageerror', error => runtimeErrors.push(error.message));
  await page.goto('/post');
  await expect(page.getByRole('heading', { name: 'Post a ride' })).toBeVisible();
  await page.screenshot({ path: testInfo.outputPath('post.png'), fullPage: true });
  await page.getByRole('button', { name: 'Post the ride', exact: true }).click();
  await expect(page.getByText('Say where you are leaving from.')).toBeVisible();
  await expect(page.getByLabel('Leaving from')).toBeFocused();
  await fillRide(page);
  await page.getByLabel('Seats going spare').fill('6');
  await page.getByRole('button', { name: 'Post the ride', exact: true }).click();
  await expect(page.getByText('Your car seats 5 passengers. Enter 5 or fewer.')).toBeVisible();
  await page.getByLabel('Seats going spare').fill('4');
  await page.getByRole('button', { name: 'Post the ride', exact: true }).click();
  await expect(page).toHaveURL('/my-rides/driving');
  await expect(page.getByRole('list', { name: 'Rides you are driving' }).getByRole('listitem')).toHaveCount(3);
  await page.reload();
  const row = page.getByRole('listitem').filter({ hasText: 'Batroun' });
  await expect(row).toContainText('$3.50 a seat');
  await row.getByRole('link', { name: 'Edit', exact: true }).click();
  await expect(page.getByLabel('Leaving from')).toHaveValue('Batroun');
  await page.getByLabel('Price a seat').fill('2');
  await page.getByRole('button', { name: 'Save changes' }).click();
  await expect(page.getByRole('listitem').filter({ hasText: 'Batroun' })).toContainText('$2 a seat');
  await expect(page.locator('body')).not.toContainText('Design reference');
  expect(runtimeErrors).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('driving.png'), fullPage: true });
});

test('unsaved changes guard handles cancel, keyboard, and browser back', async ({ page }) => {
  await page.goto('/my-rides/driving');
  await page.getByRole('link', { name: 'Post a ride', exact: true }).last().click();
  await page.getByLabel('Leaving from').fill('Unsaved trip');
  await page.getByRole('button', { name: 'Cancel', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Leave without posting?' });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Keep editing' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(page.getByLabel('Leaving from')).toHaveValue('Unsaved trip');
  await page.goBack();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Discard', exact: true }).click();
  await expect(page).toHaveURL('/my-rides/driving');
  await expect(page.getByRole('listitem').filter({ hasText: 'Unsaved trip' })).toHaveCount(0);
});

test('reviewing a two-seat request fills the car and blocks overbooking', async ({ page }) => {
  await page.goto('/my-rides/driving');
  await page.getByRole('link', { name: 'Review 2 requests' }).click();
  await page.getByRole('button', { name: "Accept Owen Nammour's request" }).click();
  await expect(page.getByText('Full', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: "Accept Fatme Akar's request" })).toBeDisabled();
  await expect(page.getByText('This request needs 1 seat, but only 0 remain.')).toBeVisible();
  await page.getByRole('button', { name: "Decline Fatme Akar's request" }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Decline request' }).click();
  await expect(page.getByText('You are all caught up.', { exact: false })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Full', { exact: true })).toBeVisible();
});

test('cancellation confirms and updates the dashboard', async ({ page }) => {
  await page.goto('/rides/morning-trip');
  await page.getByRole('button', { name: 'Cancel ride', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Keep ride' }).click();
  await expect(page).toHaveURL('/rides/morning-trip');
  await page.getByRole('button', { name: 'Cancel ride', exact: true }).click();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancel ride', exact: true }).click();
  await expect(page).toHaveURL('/my-rides/driving');
  await expect(page.getByRole('list', { name: 'Rides you are driving' }).getByRole('listitem')).toHaveCount(1);
});

test('empty and error states are reachable without changing saved data', async ({ page }) => {
  await page.goto('/my-rides/driving?demo=empty');
  await expect(page.getByRole('heading', { name: 'You have not posted a ride yet' })).toBeVisible();
  await page.getByRole('link', { name: 'Post a ride', exact: true }).last().click();
  await fillRide(page);
  await page.getByRole('button', { name: 'Post the ride', exact: true }).click();
  await expect(page.getByRole('list', { name: 'Rides you are driving' }).getByRole('listitem')).toHaveCount(1);
  await page.goto('/my-rides/driving?demo=error');
  await expect(page.getByRole('alert')).toBeVisible();
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(page.getByRole('list', { name: 'Rides you are driving' }).getByRole('listitem')).toHaveCount(2);
});

test('mobile navigation opens and closes accessibly', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'Mobile-only navigation');
  await page.goto('/my-rides/driving');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const navigation = page.getByRole('navigation', { name: 'Mobile navigation' });
  await expect(navigation).toBeVisible();
  await navigation.getByRole('link', { name: 'Post a ride' }).click();
  await expect(page.getByRole('heading', { name: 'Post a ride' })).toBeVisible();
  await expect(navigation).not.toBeVisible();
});

test('departed rides close request review without changing stored requests', async ({ page }) => {
  const rides = createSeed();
  rides[0].departureAt = new Date(Date.now() - 3600000).toISOString();
  await page.addInitScript(rides => localStorage.setItem('darb.rides.v1', JSON.stringify(rides)), rides);
  await page.goto('/my-rides/driving');
  const row = page.getByRole('list', { name: 'Rides you are driving' }).getByRole('listitem').first();
  await expect(row.getByText('Departed', { exact: true })).toBeVisible();
  await expect(row.getByRole('link', { name: /Review/ })).toHaveCount(0);
  await row.getByRole('link', { name: 'View ride' }).click();
  await expect(page.getByRole('heading', { name: 'Request review closed' })).toBeVisible();
  await expect(page.getByText('This ride has departed. Seat requests can no longer be accepted or declined.')).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Accept|Decline) / })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('darb.rides.v1')))).toEqual(rides);
});

test('departure closes an open decline dialog and updates Driving without a reload', async ({ page }) => {
  const now = Date.now();
  const rides = createSeed(now);
  rides[0].departureAt = new Date(now + 60000).toISOString();
  await page.clock.install({ time: now });
  await page.addInitScript(rides => localStorage.setItem('darb.rides.v1', JSON.stringify(rides)), rides);
  await page.goto('/rides/morning-trip');
  await page.getByRole('button', { name: "Decline Fatme Akar's request" }).click();
  await expect(page.getByRole('dialog', { name: 'Decline this request?' })).toBeVisible();
  await page.clock.fastForward(60000);
  await expect(page.getByRole('dialog', { name: 'Decline this request?' })).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Request review closed' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^(Accept|Decline) / })).toHaveCount(0);
  await page.getByRole('link', { name: '← My rides' }).click();
  await expect(page.getByText('Departed', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review 2 requests' })).toHaveCount(0);
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('darb.rides.v1')))).toEqual(rides);
});

test('Driving replaces request review when departure passes while the dashboard stays open', async ({ page }) => {
  const now = Date.now();
  const rides = createSeed(now);
  rides[0].departureAt = new Date(now + 60000).toISOString();
  await page.clock.install({ time: now });
  await page.addInitScript(rides => localStorage.setItem('darb.rides.v1', JSON.stringify(rides)), rides);
  await page.goto('/my-rides/driving');
  await expect(page.getByRole('link', { name: 'Review 2 requests' })).toBeVisible();
  await page.clock.fastForward(60000);
  await expect(page.getByText('Departed', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review 2 requests' })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'View ride' })).toBeVisible();
});
