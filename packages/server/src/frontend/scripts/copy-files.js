/**
 * @fileoverview Copies files matching glob patterns to a destination directory.
 */

import fs from 'fs'
import path from 'path'
import { minimatch } from 'minimatch'

const usage = `Usage: node copy-files.js [options] <pattern1> [pattern2 ...] <output-dir>

Copies files matching glob patterns to the output directory, preserving relative paths.

Options:
  -w, --watch    Watch for changes and copy files automatically
  -h, --help     Show this help message

Examples:
  node copy-files.js "src/**/*.svg" "dist"
  node copy-files.js "src/**/*.svg" "src/**/*.png" "dist"
  node copy-files.js -w "src/**/*.svg" "dist"`

let args = process.argv.slice(2)

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  console.log(usage)
  process.exit(args.includes('-h') || args.includes('--help') ? 0 : 1)
}

// Extract watch flag
const watchMode = args.includes('-w') || args.includes('--watch')
args = args.filter((arg) => arg !== '-w' && arg !== '--watch')

if (args.length < 2) {
  console.error('Error: At least one input pattern and an output directory are required.\n')
  console.log(usage)
  process.exit(1)
}

const outputDir = path.resolve(args[args.length - 1])
const patterns = args.slice(0, -1).map((pattern) => path.resolve(pattern))

/**
 * Normalize path separators to forward slashes for consistent regex matching
 * @param {string} filePath
 */
const normalizePath = (filePath) => filePath.split(path.sep).join('/')

/**
 * Check if a string contains glob characters
 */
const hasGlobChars = /[*?[\]]/

/**
 * Find the base directory before any glob characters
 * @param {string} pattern
 */
const findGlobBase = (pattern) => {
  const normalized = normalizePath(pattern)
  const match = normalized.match(/[*?[\]]/)
  if (!match?.index) {
    return path.dirname(pattern)
  }
  const base = normalized.slice(0, match.index)
  const lastSlash = base.lastIndexOf('/')
  return path.resolve(lastSlash >= 0 ? base.slice(0, lastSlash) : '.')
}

/**
 * Recursively find all files in a directory
 * @param {string} dir
 * @param {string} pattern
 * @param {string} baseDir
 * @returns {Promise<Array<{ absolute: string, relative: string }>>}
 */
const findFiles = async (dir, pattern, baseDir) => {
  /** @type {Array<{ absolute: string, relative: string }>} */
  const results = []

  const entries = await fs.promises.readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    const normalizedPath = normalizePath(fullPath)

    if (entry.isDirectory()) {
      const subdirResults = await findFiles(fullPath, pattern, baseDir)
      results.push(...subdirResults)
    } else if (entry.isFile() && minimatch(normalizedPath, pattern, { dot: true })) {
      const relativePath = path.relative(baseDir, fullPath)
      results.push({ absolute: fullPath, relative: relativePath })
    }
  }

  return results
}

/**
 * Copy files to output directory
 * @param {Array<{ absolute: string, relative: string }>} files
 * @param {string} output
 */
const copyFiles = async (files, output) => {
  for (const file of files) {
    const destPath = path.join(output, file.relative)
    const destDir = path.dirname(destPath)

    await fs.promises.mkdir(destDir, { recursive: true })
    await fs.promises.copyFile(file.absolute, destPath)
  }
}

/**
 * Process a single glob pattern
 * @param {string} pattern
 */
const processPattern = async (pattern) => {
  const isGlob = hasGlobChars.test(pattern)

  if (!isGlob) {
    // If not a glob, treat as a single file
    const stat = await fs.promises.stat(pattern).catch(() => null)
    if (stat?.isFile()) {
      return [{ absolute: pattern, relative: path.basename(pattern) }]
    }
    console.warn(`Warning: Pattern "${pattern}" matches no files`)
    return []
  }

  const baseDir = findGlobBase(pattern)
  const normalizedPattern = normalizePath(pattern)

  // Check if base directory exists
  const baseStat = await fs.promises.stat(baseDir).catch(() => null)
  if (!baseStat?.isDirectory()) {
    console.warn(`Warning: Base directory "${baseDir}" does not exist for pattern "${pattern}"`)
    return []
  }

  return findFiles(baseDir, normalizedPattern, baseDir)
}

/**
 * Process all patterns and copy files
 */
const processAllPatterns = async () => {
  const start = Date.now()

  /** @type {Array<{ absolute: string, relative: string }>} */
  const allFiles = []

  for (const pattern of patterns) {
    const files = await processPattern(pattern)
    allFiles.push(...files)
  }

  if (allFiles.length === 0) {
    console.error('Error: No files matched the specified patterns')
    process.exit(1)
  }

  await copyFiles(allFiles, outputDir)

  const seconds = ((Date.now() - start) / 1000).toFixed(2)
  const fileCount = allFiles.length
  const fileLabel = fileCount === 1 ? 'file' : 'files'
  console.log(`[copy-files] Copied ${fileCount} ${fileLabel} to ${outputDir} (${seconds}s)`)
}

/**
 * Set up file watchers for all patterns
 */
const setupWatchers = async () => {
  const watchedDirs = new Set()

  /** @type {Map<string, { pattern: string, baseDir: string }>} */
  const patternData = new Map()

  // Prepare pattern data and collect unique base directories
  for (const pattern of patterns) {
    const isGlob = hasGlobChars.test(pattern)
    if (isGlob) {
      const baseDir = findGlobBase(pattern)
      const normalizedPattern = normalizePath(pattern)
      patternData.set(pattern, { pattern: normalizedPattern, baseDir })
      watchedDirs.add(baseDir)
    }
  }

  if (watchedDirs.size === 0) {
    console.log('[copy-files] No glob patterns to watch, exiting watch mode')
    return
  }

  /** @type {NodeJS.Timeout | null} */
  let debounceTimer = null

  const handleFileChange = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(async () => {
      try {
        await processAllPatterns()
      } catch (error) {
        console.error('[copy-files] Error during file copy:', error)
      }
    }, 100)
  }

  // Set up watchers for each unique base directory
  for (const dir of watchedDirs) {
    const stat = await fs.promises.stat(dir).catch(() => null)
    if (stat?.isDirectory()) {
      fs.watch(dir, { recursive: true }, handleFileChange)
      console.log(`[copy-files] Watching ${dir}`)
    }
  }

  console.log('[copy-files] Watch mode active. Press Ctrl+C to stop.')
}

/**
 * Main function
 */
const main = async () => {
  await processAllPatterns()

  if (watchMode) {
    await setupWatchers()
  }
}

main().catch((error) => {
  console.error('[copy-files] Failed:', error)
  process.exit(1)
})
