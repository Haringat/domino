/*
 * This file defines Domino behaviour that can be externally configured.
 * To change these settings, set the relevant global property *before*
 * you call `require("domino")`.
 */

export const isApiWritable = !global.__domino_frozen__;
