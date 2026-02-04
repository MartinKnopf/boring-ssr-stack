#!/usr/bin/env node

/**
 * @fileoverview Small helper to run a single Node test file with an optional test name filter. Supports fuzzy search to quickly find test files by name.
 *
 * Usage:
 *   node scripts/test.js <path-or-pattern> ["test name pattern"]
 *
 * Environment:
 *   COVERAGE=true   Enable Node.js test coverage reporting
 */

import { spawnSync } from 'node:child_process'
import { existsSync, globSync } from 'node:fs'
import { basename, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Check if a string contains glob syntax
 * @param {string} str
 */
function hasGlobSyntax(str) {
  return /[*?[\]{]/.test(str)
}

/**
 * Get the repository root directory (where package.json lives)
 */
function getRepoRoot() {
  const __dirname = dirname(fileURLToPath(import.meta.url))
  return resolve(__dirname, '..')
}

/**
 * Find all test files in the repository
 */
function findAllTestFiles() {
  const root = getRepoRoot()
  const patterns = ['**/test/**/*.spec.js']

  const files = []
  for (const pattern of patterns) {
    const matches = globSync(pattern, { cwd: root })
    files.push(...matches.map((f) => resolve(root, f)))
  }

  return files.sort()
}

/**
 * Fuzzy match: check if all characters from query appear in order in the file path
 * Returns { matches: boolean, score: number } where higher score = tighter match
 * Score is calculated as queryLength / span (1.0 = perfect, chars adjacent)
 * @param {string} filePath
 * @param {string} query
 */
function matchesQuery(filePath, query) {
  const pathLower = filePath.toLowerCase()
  const queryLower = query.toLowerCase()

  let queryIndex = 0
  let firstPos = -1
  let lastPos = -1

  for (let i = 0; i < pathLower.length && queryIndex < queryLower.length; i++) {
    if (pathLower[i] === queryLower[queryIndex]) {
      if (firstPos === -1) {
        firstPos = i
      }
      lastPos = i
      queryIndex++
    }
  }

  const matches = queryIndex === queryLower.length
  if (!matches) {
    return { matches: false, score: 0 }
  }

  const span = lastPos - firstPos + 1
  const score = queryLower.length / span

  return { matches: true, score }
}

/**
 * Calculate simple similarity score for suggestions
 * Uses character overlap between query and filename
 * @param {string} filePath
 * @param {string} query
 */
function getSimilarityScore(filePath, query) {
  const filename = basename(filePath, '.spec.js').toLowerCase()
  const queryLower = query.toLowerCase()

  // Count matching characters in order
  let score = 0
  let queryIndex = 0
  for (const char of filename) {
    if (queryIndex < queryLower.length && char === queryLower[queryIndex]) {
      score++
      queryIndex++
    }
  }

  return score
}

/**
 * Get similar files for suggestions when no matches found
 * @param {string[]} files
 * @param {string} query
 * @param {number} [maxSuggestions]
 */
function getSuggestions(files, query, maxSuggestions = 5) {
  return files
    .map((f) => ({ path: f, score: getSimilarityScore(f, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxSuggestions)
    .map((item) => item.path)
}

/**
 * Resolve file path argument to actual test file(s)
 * Returns { file: string, alternatives: string[], isGlob: boolean } or throws error
 * @param {string} arg
 */
function resolveTestFile(arg) {
  // Case 1: Glob syntax - return as-is for node --test to handle
  if (hasGlobSyntax(arg)) {
    return { file: arg, alternatives: [], isGlob: true }
  }

  // Case 2: Existing file - run it directly
  if (existsSync(arg)) {
    return { file: arg, alternatives: [], isGlob: false }
  }

  // Case 3: Fuzzy search
  const allFiles = findAllTestFiles()
  const matchResults = allFiles
    .map((f) => ({ file: f, ...matchesQuery(f, arg) }))
    .filter((result) => result.matches)
    .sort((a, b) => b.score - a.score) // Sort by score descending (best match first)

  if (matchResults.length === 0) {
    // No matches - provide suggestions
    const suggestions = getSuggestions(allFiles, arg)
    const error = /** @type {Error & { suggestions?: string[] }} */ (new Error(`No test files found matching "${arg}"`))
    error.suggestions = suggestions
    throw error
  }

  if (matchResults.length === 1) {
    // Exactly one match
    return { file: matchResults[0].file, alternatives: [], isGlob: false }
  }

  // Multiple matches - use best scored match, list others
  return {
    file: matchResults[0].file,
    alternatives: matchResults.slice(1).map((r) => r.file),
    isGlob: false,
  }
}

const [, , fileArg, testNamePattern] = process.argv

// Show help
if (!fileArg || fileArg === '--help' || fileArg === '-h') {
  console.log(`
Usage: node scripts/testjs <path-or-pattern> ["test name pattern"]

Arguments:
  <path-or-pattern>     File path, glob pattern, or search term
  ["test name pattern"] Optional: filter tests by name

Examples:
  node scripts/test.js apps/api/test/int/releases.spec.js # Specific file
  node scripts/test.js "apps/**/int/*.spec.js"            # All test files in this glob path
  node scripts/test.js some-test                          # Fuzzy search specific test file

Environment:
  COVERAGE=true   Enable Node.js test coverage reporting
`)
  process.exit(fileArg ? 0 : 1)
}

// Resolve the file argument
let filePath
try {
  const result = resolveTestFile(fileArg)
  filePath = result.file

  if (!result.isGlob) {
    // Print which file was selected
    console.log(`\x1b[36m> Running: ${filePath}\x1b[0m`)

    if (result.alternatives.length > 0) {
      console.log(`\x1b[33m> Other matches (${result.alternatives.length}):\x1b[0m`)
      for (const alt of result.alternatives.slice(0, 10)) {
        console.log(`  - ${alt}`)
      }
      if (result.alternatives.length > 10) {
        console.log(`  ... and ${result.alternatives.length - 10} more`)
      }
      console.log()
    }
  }
} catch (error) {
  const err = /** @type {Error & { suggestions?: string[] }} */ (error)
  console.error(`\x1b[31mError: ${err.message}\x1b[0m`)
  if (err.suggestions && err.suggestions.length > 0) {
    console.error('\nDid you mean one of these?')
    for (const suggestion of err.suggestions) {
      console.error(`  - ${suggestion}`)
    }
  }
  process.exit(1)
}

process.env.NODE_ENV ||= 'development'
process.env.LOG_LEVEL ||= 'error'

const nodeArgs = ['--test']

if (process.env.COVERAGE === 'true') {
  nodeArgs.push('--experimental-test-coverage')
}

if (testNamePattern) {
  nodeArgs.push(`--test-name-pattern=${testNamePattern}`)
}

nodeArgs.push('--test-reporter=spec')

nodeArgs.push(filePath)

const result = spawnSync('node', nodeArgs, { stdio: 'inherit' })

// propagate the child process exit code; default to 1 on null to signal failure
process.exit(result.status ?? 1)
