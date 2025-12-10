import { test, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * End-to-end tests for the Redpatch web application.
 * Tests the complete flow of uploading an image, processing it, and viewing results.
 *
 * Note: Tests that require the Python backend (preview generation, processing)
 * are skipped by default. Set REDPATCH_BACKEND=true to run them.
 */

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Use a test image from the redpatch repo
const TEST_IMAGE_PATH = path.resolve(__dirname, '../fixtures/test-leaf.jpg')

// Check if backend tests should run
const BACKEND_AVAILABLE = process.env.REDPATCH_BACKEND === 'true'

/**
 * Helper function to upload a file via Uppy dashboard.
 * Adds the file, clicks upload, and waits for completion.
 */
async function uploadFile(page: Page, filePath: string | string[]) {
  // Listen for console errors and network failures
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.log('Browser console error:', msg.text())
    }
  })

  page.on('requestfailed', (request) => {
    console.log('Request failed:', request.url(), request.failure()?.errorText)
  })

  const fileInput = page.locator('.uppy-Dashboard-input').first()
  await fileInput.setInputFiles(filePath)

  // Click the upload button to start the upload
  const uploadButton = page.locator('button:has-text("Upload")')
  await expect(uploadButton).toBeVisible({ timeout: 5000 })
  await uploadButton.click()

  // Wait for upload to complete - the "Move on" button becomes enabled
  // Also check for error state
  const moveOnButton = page.locator('button:has-text("Move on")')
  const errorHeading = page.locator('.uppy-Dashboard-innerWrap h1:has-text("Error")')

  // Wait for either success or error, with longer timeout
  await Promise.race([
    expect(moveOnButton).toBeEnabled({ timeout: 30000 }),
    errorHeading.waitFor({ state: 'visible', timeout: 30000 }).then(async () => {
      // If error appears, try to get details
      const errorButton = page.locator('button:has-text("Show error details")')
      if (await errorButton.isVisible()) {
        await errorButton.click()
        await page.waitForTimeout(500)
        const errorText = await page.locator('.uppy-Informer').textContent()
        throw new Error(`Upload failed with error: ${errorText}`)
      }
      throw new Error('Upload failed - Error state detected')
    })
  ])
}

/**
 * Helper function to upload and proceed past the upload step.
 */
async function uploadAndProceed(page: Page, filePath: string | string[] = TEST_IMAGE_PATH) {
  await uploadFile(page, filePath)
  await page.locator('button:has-text("Move on")').click()
}

/**
 * Helper function to navigate through upload to sliders.
 * Requires Python backend for preview generation.
 */
async function navigateToSliders(page: Page) {
  await uploadAndProceed(page)
  // Wait for sliders to appear (may show "generate the previews" first)
  await expect(page.locator('text=Select the HSV values')).toBeVisible({ timeout: 120000 })
}

test.describe('Image Upload Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('homepage loads with upload form', async ({ page }) => {
    // Check page title/heading
    await expect(page.locator('text=Redpatch is a tool')).toBeVisible()

    // Check for Uppy dashboard container
    await expect(page.locator('.uppy-Dashboard')).toBeVisible()

    // Check for scale card checkbox
    await expect(page.locator('input[type="checkbox"]')).toBeVisible()

    // Check for "Move on" button (should be disabled initially)
    const moveOnButton = page.locator('button:has-text("Move on")')
    await expect(moveOnButton).toBeVisible()
    await expect(moveOnButton).toBeDisabled()
  })

  test('scale card checkbox can be toggled', async ({ page }) => {
    const checkbox = page.locator('input[type="checkbox"]')
    await expect(checkbox).not.toBeChecked()

    await checkbox.check()
    await expect(checkbox).toBeChecked()

    await checkbox.uncheck()
    await expect(checkbox).not.toBeChecked()
  })

  test('can upload an image and proceed', async ({ page }) => {
    // Wait for Uppy to be ready
    await expect(page.locator('.uppy-Dashboard')).toBeVisible()

    // Upload and proceed
    await uploadAndProceed(page)

    // Should transition to generating previews or sliders
    await expect(
      page.locator('text=generate the previews').or(page.locator('text=Select the HSV values'))
    ).toBeVisible({ timeout: 10000 })
  })

  // This test requires the Python backend for full processing
  test('complete flow: upload, configure, process, view results', async ({ page }) => {
    test.skip(!BACKEND_AVAILABLE, 'Requires Python backend for preview generation')

    // Step 1: Upload image
    await expect(page.locator('.uppy-Dashboard')).toBeVisible()
    await uploadAndProceed(page)

    // Step 2: Wait for preview generation
    const previewsOrSliders = page
      .locator('text=generate the previews')
      .or(page.locator('text=Select the HSV values'))
    await expect(previewsOrSliders).toBeVisible({ timeout: 10000 })

    // If showing "generate the previews", wait for it to complete
    const generatingText = page.locator('text=generate the previews')
    if (await generatingText.isVisible()) {
      await expect(page.locator('text=Select the HSV values')).toBeVisible({ timeout: 120000 })
    }

    // Step 3: Sliders page - verify HSV controls are present
    await expect(page.locator('.original-image')).toBeVisible()
    await expect(page.locator('.filtered-image').first()).toBeVisible()

    // Verify step navigation buttons exist
    await expect(page.locator('button:has-text("<")')).toBeVisible()
    await expect(page.locator('button:has-text(">")')).toBeVisible()

    // Verify "Process all images" button exists
    const processButton = page.locator('button:has-text("Process all images")')
    await expect(processButton).toBeVisible()

    // Step 4: Start processing
    await processButton.click()

    // Wait for processing to complete
    const processingOrResults = page
      .locator('text=Processing')
      .or(page.locator('.title:has-text("Results")'))
    await expect(processingOrResults).toBeVisible({ timeout: 10000 })

    // Step 5: Wait for results
    await expect(page.locator('.title:has-text("Results")')).toBeVisible({ timeout: 180000 })

    // Verify results page has download links
    await expect(page.locator('a[download]').first()).toBeVisible()
  })
})

test.describe('Image Selection (multiple images)', () => {
  test('shows image picker when multiple images uploaded', async ({ page }) => {
    await page.goto('/')

    // Upload multiple images
    await uploadAndProceed(page, [TEST_IMAGE_PATH, TEST_IMAGE_PATH])

    // Should show image picker since we uploaded multiple files
    // (This depends on the app logic - may go straight to preview if auto-selected)
    const pickerOrPreviews = page
      .locator('text=Select an image')
      .or(page.locator('text=generate the previews'))
      .or(page.locator('text=Select the HSV values'))
    await expect(pickerOrPreviews).toBeVisible({ timeout: 10000 })
  })
})

// Tests that require Python backend for preview generation
test.describe('Slider Controls', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!BACKEND_AVAILABLE, 'Requires Python backend for preview generation')
    await page.goto('/')
    await navigateToSliders(page)
  })

  test('can navigate between filter steps', async ({ page }) => {
    // Should start at step 1 (Leaf Area)
    await expect(page.locator('text=Leaf Area')).toBeVisible()

    // Navigate to step 2
    await page.locator('button:has-text(">")').click()
    await expect(page.locator('text=Healthy Area')).toBeVisible()

    // Navigate to step 3
    await page.locator('button:has-text(">")').click()
    await expect(page.locator('text=Lesion Area')).toBeVisible()

    // Navigate back
    await page.locator('button:has-text("<")').click()
    await expect(page.locator('text=Healthy Area')).toBeVisible()
  })

  test('can download config file', async ({ page }) => {
    const downloadLink = page.locator('a:has-text("Download config")')
    await expect(downloadLink).toBeVisible()
    await expect(downloadLink).toHaveAttribute('href', /config\.yaml$/)
  })

  test('config upload button exists', async ({ page }) => {
    await expect(page.locator('span.file-label:has-text("Upload config")')).toBeVisible()
    await expect(page.locator('input[type="file"].file-input')).toBeAttached()
  })

  test('preview images are loaded and displayed correctly', async ({ page }) => {
    // Track failed requests for image URLs
    const failedRequests: string[] = []
    page.on('requestfailed', (request) => {
      if (request.url().includes('/api/uploads/')) {
        failedRequests.push(request.url())
      }
    })

    // Get the original image element (always visible)
    const originalImage = page.locator('.original-image')
    await expect(originalImage).toBeVisible()

    // Verify the image src is set and uses the API uploads path
    const originalSrc = await originalImage.getAttribute('src')
    expect(originalSrc).toBeTruthy()
    expect(originalSrc).toContain('/api/uploads/')
    expect(originalSrc).toContain('.jpeg')

    // Verify the image actually loaded (naturalWidth > 0 indicates successful load)
    const originalLoaded = await originalImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0
    })
    expect(originalLoaded).toBe(true)

    // Step 1: Leaf Area - verify visible filtered image
    await expect(page.locator('text=Leaf Area')).toBeVisible()
    const leafImage = page.locator('img[alt="Leaf area filter"]')
    await expect(leafImage).toBeVisible()
    const leafSrc = await leafImage.getAttribute('src')
    expect(leafSrc).toContain('/api/uploads/')
    expect(leafSrc).toContain('_leaf_area.jpeg')
    const leafLoaded = await leafImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0
    })
    expect(leafLoaded).toBe(true)

    // Step 2: Navigate to Healthy Area
    await page.locator('button:has-text(">")').click()
    await expect(page.locator('text=Healthy Area')).toBeVisible()
    const healthyImage = page.locator('img[alt="Healthy area filter"]')
    await expect(healthyImage).toBeVisible()
    const healthySrc = await healthyImage.getAttribute('src')
    expect(healthySrc).toContain('/api/uploads/')
    expect(healthySrc).toContain('_healthy_area.jpeg')
    const healthyLoaded = await healthyImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0
    })
    expect(healthyLoaded).toBe(true)

    // Step 3: Navigate to Lesion Area
    await page.locator('button:has-text(">")').click()
    await expect(page.locator('text=Lesion Area')).toBeVisible()
    const lesionImage = page.locator('img[alt="Lesion area filter"]')
    await expect(lesionImage).toBeVisible()
    const lesionSrc = await lesionImage.getAttribute('src')
    expect(lesionSrc).toContain('/api/uploads/')
    expect(lesionSrc).toContain('_lesion_area.jpeg')
    const lesionLoaded = await lesionImage.evaluate((img: HTMLImageElement) => {
      return img.complete && img.naturalWidth > 0
    })
    expect(lesionLoaded).toBe(true)

    // Ensure no image requests failed (no 404 errors)
    expect(failedRequests).toHaveLength(0)
  })
})

// Test that requires Python backend for preview generation
test.describe('Scale Card Flow', () => {
  test('scale card checkbox enables scale input in sliders', async ({ page }) => {
    test.skip(!BACKEND_AVAILABLE, 'Requires Python backend for preview generation')

    await page.goto('/')

    // Check the scale card checkbox
    await page.locator('input[type="checkbox"]').check()

    // Upload and proceed
    await uploadAndProceed(page)

    // Wait for sliders
    await expect(page.locator('text=Select the HSV values')).toBeVisible({ timeout: 120000 })

    // Navigate to step 4 (Scale Card)
    await page.locator('button:has-text(">")').click() // Step 2
    await page.locator('button:has-text(">")').click() // Step 3
    await page.locator('button:has-text(">")').click() // Step 4

    // Should see scale card controls and scale CM input
    await expect(page.locator('p:has-text("Scale Card")')).toBeVisible()
    await expect(page.locator('text=Scale size (cm)')).toBeVisible()
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })
})

test.describe('Session Resumption', () => {
  test('can resume session via URL hash', async ({ page }) => {
    // Start a new session
    await page.goto('/')

    // Upload and proceed
    await uploadAndProceed(page)

    // Wait for the hash to be set
    await page.waitForFunction(() => window.location.hash.length > 1)

    // Get the current URL with hash
    const urlWithHash = page.url()
    expect(urlWithHash).toContain('#')

    // Navigate away and back
    await page.goto('/faq')
    await page.goto(urlWithHash)

    // Should resume the session (not show upload form)
    await expect(page.locator('.uppy-Dashboard')).not.toBeVisible({ timeout: 5000 })
  })
})
