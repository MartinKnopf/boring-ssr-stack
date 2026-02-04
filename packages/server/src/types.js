/**
 * @import { FastifyRequest } from 'fastify'
 */

/**
 * @typedef {Object} AuthUser
 * @property {string} id
 * @property {string} username
 */

/**
 * @typedef {FastifyRequest & { user: AuthUser, body?: Object, query?: { brand?: string} }} CicdRequest
 */
