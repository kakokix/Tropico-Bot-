// =============================================================================
//   0x — BOT DE GESTION DU SERVEUR NAOYA
//   Fichier unique. Deuxième fichier nécessaire : package.json
// =============================================================================
//
//  DÉPLOIEMENT (depuis un téléphone)
//
//  1) https://discord.com/developers/applications → New Application → nom "0x"
//     · Bot → Reset Token → copie le token
//     · Bot → ACTIVE : Server Members Intent + Message Content Intent + Presence Intent
//     · General Information → copie l'Application ID
//
//  2) GitHub → nouveau repo privé → Add file → crée "package.json" puis "index.js"
//
//  3) railway.app → Deploy from GitHub repo → Variables :
//        DISCORD_TOKEN = ton token
//        CLIENT_ID     = ton Application ID
//        GUILD_ID      = ID du serveur Naoya (commandes immédiates)
//     Settings → Builder → Railpack
//
//  4) Postgres OBLIGATOIRE pour un serveur de cette taille :
//     + New → Database → PostgreSQL, puis dans le bot :
//        DATABASE_URL = ${{Postgres.DATABASE_URL}}
//
//  5) Invitation (remplace TON_APPLICATION_ID) — Administrateur recommandé
//     car l'anti-nuke a besoin des logs d'audit :
//     https://discord.com/oauth2/authorize?client_id=TON_APPLICATION_ID&scope=bot+applications.commands&permissions=8
//     Puis Paramètres du serveur → Rôles → mets le rôle de 0x TOUT EN HAUT.
//
//  6) Première configuration dans Discord :
//        /logs scan            → indexe les salons
//        /logs map             → vérifie où part chaque type de log
//        /config staff role:@Staff
//        /config alcatraz role:@Alcatraz
//        /ticket panel
//        /config view
//
//  DÉTECTION AUTOMATIQUE : le bot reconnaît tes salons par leur nom
//  (logs-msgs, bannissements, expulsions, logs-vocaux, automod, logs-raid,
//  compteur-tickets, se-confesser, niveaux, absences, Tickets Staff, etc.).
//  Rien à configurer salon par salon. `/logs set` sert à forcer une exception.
// =============================================================================

import {
  ActionRowBuilder,
  ActivityType,
  AuditLogEvent,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  Client,
  EmbedBuilder,
  Events,
  GatewayIntentBits,
  MessageFlags,
  ModalBuilder,
  Partials,
  PermissionFlagsBits,
  REST,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js";
import { createServer } from "node:http";
import pg from "pg";


/* ========================================================================== */
/*                   1 — CONSTANTES ET DETECTION DES SALONS                   */
/* ========================================================================== */

// core.js — constantes, résolution automatique des salons, helpers.


const COLORS = {
  primary: 0x5865f2,
  success: 0x57f287,
  warning: 0xfee75c,
  danger: 0xed4245,
  neutral: 0x2b2d31,
  gold: 0xf1c40f,
  purple: 0x9b59b6,
};

/** Normalise un nom de salon : enlève emojis, accents, séparateurs. */
function norm(name = "") {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ========================================================================== */
/*        ROUTES DE LOGS — adaptées à l'arborescence du serveur Naoya         */
/* ========================================================================== */
// Chaque clé = un type d'événement. La liste = les noms de salons candidats,
// par ordre de préférence. Le premier trouvé sur le serveur est utilisé.

const LOG_ROUTES = {
  messageDelete: ["logs-msgs", "poubelle", "logs-moderation"],
  messageEdit: ["logs-msgs", "logs-moderation"],
  messageLink: ["messages-avec-liens", "logs-antipub", "automod"],
  messagePurge: ["logs-msgs", "logs-moderation"],
  embedDelete: ["supp-msg-embed", "logs-msgs"],

  automod: ["automod", "logs-moderation"],
  antipub: ["logs-antipub", "automod"],
  spam: ["spam", "sapm", "automod"],
  toxic: ["toxic-messages", "automod"],

  sanction: ["logs-sanctions", "sanctions", "logs-moderation"],
  ban: ["bannissements", "logs-sanctions", "sanctions"],
  kick: ["expulsions", "logs-sanctions", "sanctions"],
  timeout: ["timeout-membres", "mutes", "logs-sanctions"],
  warn: ["avertissements", "infos-averts", "logs-sanctions"],
  jail: ["chat-alcatraz", "logs-sanctions"],

  memberJoin: ["logs-raid", "logs-leave", "logs-msgs"],
  memberLeave: ["logs-leave"],
  memberUpdate: ["logs-stalk", "maj-roles"],
  memberRoles: ["add-remove-roles", "logs-roles", "maj-roles"],
  rolesRemoved: ["suppr-de-roles-membres", "add-remove-roles", "logs-roles"],

  voice: ["logs-vocaux", "logs-voice", "vocal"],
  voiceDisconnect: ["deconnexions-voc", "logs-vocaux", "logs-voice"],
  voiceMove: ["deplacement-membres", "logs-vocaux", "logs-voice"],
  voiceMute: ["mise-en-sourdine", "logs-vocaux", "logs-voice"],

  roleCreate: ["creation-de-roles", "roles", "logs-roles"],
  roleDelete: ["suppr-roles", "roles", "logs-roles"],
  roleUpdate: ["maj-roles", "roles", "logs-roles"],

  channelCreate: ["creation-de-salons", "salons"],
  channelDelete: ["suppr-salons", "salons"],
  channelUpdate: ["maj-salons", "salons"],
  permissions: ["logs-ajout-permissions", "maj-salons"],

  guildUpdate: ["maj-serveur"],
  webhook: ["webhooks"],
  botAdd: ["ajout-de-bots"],
  thread: ["fils"],
  invite: ["invitations"],

  ticket: ["logs-tickets"],
  raid: ["logs-raid"],
  antinuke: ["logs-anti-down", "logs-anti-ban", "logs-raid"],
  coins: ["logs-coins"],
  confession: ["confessions-logs"],
  giveaway: ["preuves", "logs-tickets"],
};

/** Salons fonctionnels (le bot y publie ou y écoute). */
const FUNC_CHANNELS = {
  ticketPanel: ["tickets"],
  ticketCounter: ["compteur-tickets"],
  confessionPost: ["se-confesser"],
  levelUp: ["niveaux"],
  absences: ["absences"],
  partenariats: ["partenariats"],
  boutique: ["boutique-coins"],
  drops: ["drop-colis"],
  sondages: ["sondages"],
  staffChat: ["chat-staff", "chat-gestion", "chat-admin"],
};

/** Types de tickets → catégories existantes du serveur. */
const TICKET_TYPES = [
  { id: "staff", label: "Question / aide staff", emoji: "🛡️", categories: ["tickets-staff"] },
  { id: "abus", label: "Signaler un abus", emoji: "🚨", categories: ["tickets-abus"] },
  { id: "animation", label: "Animation / événement", emoji: "🎉", categories: ["tickets-animation"] },
  { id: "coins", label: "Espace coins", emoji: "🪙", categories: ["tickets-coins"] },
  { id: "partenariat", label: "Partenariat", emoji: "🤝", categories: ["tickets-partenariats"] },
  { id: "couronne", label: "Owners (couronne)", emoji: "👑", categories: ["tickets-couronne"] },
];

/** Compteurs vocaux : détectés sur le motif "Nom : nombre". */
const COUNTERS = [
  { key: "members", test: /membres\s*:/i, template: "💎 • Membres : {n}" },
  { key: "online", test: /connect[eé]s\s*:/i, template: "🍋 • Connectés : {n}" },
  { key: "voice", test: /vocal\s*:/i, template: "🎧 • Vocal : {n}" },
];

/* ========================================================================== */
/*                          RÉSOLUTION DES SALONS                             */
/* ========================================================================== */

const index = new Map(); // guildId -> { channels: Map, categories: Map }

function buildIndex(guild) {
  const channels = new Map();
  const categories = new Map();
  for (const ch of guild.channels.cache.values()) {
    const key = norm(ch.name);
    if (ch.type === ChannelType.GuildCategory) {
      if (!categories.has(key)) categories.set(key, ch);
    } else if (!channels.has(key)) {
      channels.set(key, ch);
    }
  }
  index.set(guild.id, { channels, categories });
  return { channels: channels.size, categories: categories.size };
}

function findChannel(guild, names) {
  const entry = index.get(guild.id) ?? (buildIndex(guild), index.get(guild.id));
  for (const name of names) {
    const ch = entry.channels.get(name);
    if (ch) return ch;
  }
  return null;
}

function findCategory(guild, names) {
  const entry = index.get(guild.id) ?? (buildIndex(guild), index.get(guild.id));
  for (const name of names) {
    const c = entry.categories.get(name);
    if (c) return c;
  }
  return null;
}

function resolveLogChannel(guild, routeKey, config) {
  const override = config?.logOverrides?.[routeKey];
  if (override) {
    const ch = guild.channels.cache.get(override);
    if (ch) return ch;
  }
  return findChannel(guild, LOG_ROUTES[routeKey] ?? []);
}

function resolveFuncChannel(guild, key, config) {
  const override = config?.funcOverrides?.[key];
  if (override) {
    const ch = guild.channels.cache.get(override);
    if (ch) return ch;
  }
  return findChannel(guild, FUNC_CHANNELS[key] ?? []);
}

/* ========================================================================== */
/*                                  HELPERS                                   */
/* ========================================================================== */

function embed({ title, description, color = COLORS.primary, fields = [], footer, thumb, image } = {}) {
  const e = new EmbedBuilder().setColor(color).setTimestamp();
  if (title) e.setTitle(title.slice(0, 256));
  if (description) e.setDescription(description.slice(0, 4000));
  if (fields.length) e.addFields(fields.slice(0, 25).map((f) => ({ ...f, value: String(f.value).slice(0, 1024) || "—" })));
  if (footer) e.setFooter({ text: footer.slice(0, 2048) });
  if (thumb) e.setThumbnail(thumb);
  if (image) e.setImage(image);
  return e;
}

function ts(date, style = "R") {
  return `<t:${Math.floor(new Date(date).getTime() / 1000)}:${style}>`;
}

function parseDuration(input) {
  if (!input) return null;
  const m = String(input).trim().match(/^(\d+)\s*(s|m|min|h|d|j|w|sem)$/i);
  if (!m) return null;
  const f = { s: 1e3, m: 6e4, min: 6e4, h: 36e5, d: 864e5, j: 864e5, w: 6048e5, sem: 6048e5 };
  return Number(m[1]) * f[m[2].toLowerCase()];
}

function formatDuration(ms) {
  const units = [["j", 864e5], ["h", 36e5], ["min", 6e4], ["s", 1e3]];
  const parts = [];
  let rest = ms;
  for (const [label, size] of units) {
    const n = Math.floor(rest / size);
    if (n > 0) { parts.push(`${n}${label}`); rest -= n * size; }
  }
  return parts.slice(0, 2).join(" ") || "0s";
}

function num(n) {
  return new Intl.NumberFormat("fr-FR").format(n);
}

function hierarchyCheck(interaction, target) {
  if (!target) return null;
  if (target.id === interaction.guild.ownerId) return "Impossible : cette personne est propriétaire du serveur.";
  if (target.id === interaction.user.id) return "Tu ne peux pas te cibler toi-même.";
  if (target.id === interaction.client.user.id) return "Je ne vais pas me sanctionner moi-même.";
  if (
    interaction.member.id !== interaction.guild.ownerId &&
    target.roles.highest.position >= interaction.member.roles.highest.position
  ) return "Impossible : cette personne a un rôle supérieur ou égal au tien.";
  if (target.roles.highest.position >= interaction.guild.members.me.roles.highest.position)
    return "Impossible : mon rôle est trop bas. Remonte le rôle du bot dans les paramètres du serveur.";
  return null;
}

async function tryDm(user, guildName, action, reason, duration) {
  return user.send({
    embeds: [embed({
      title: `Sanction — ${guildName}`,
      color: COLORS.danger,
      fields: [
        { name: "Action", value: action, inline: true },
        ...(duration ? [{ name: "Durée", value: duration, inline: true }] : []),
        { name: "Raison", value: reason || "Non précisée" },
      ],
    })],
  }).catch(() => null);
}

function canSend(channel) {
  if (!channel?.guild) return false;
  const me = channel.guild.members.me;
  return channel.permissionsFor(me)?.has([PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.EmbedLinks]) ?? false;
}

const EPH = { flags: MessageFlags.Ephemeral };

/* ========================================================================== */
/*                    2 — STOCKAGE (POSTGRESQL / MEMOIRE)                     */
/* ========================================================================== */

// db.js — PostgreSQL avec repli mémoire.


const { Pool } = pg;

const DEFAULT_CONFIG = {
  logsEnabled: true,
  logOverrides: {},
  funcOverrides: {},

  autoroleId: null,
  welcomeChannelId: null,
  welcomeMessage: "Bienvenue {user} sur **{server}** — tu es le/la {count}ᵉ membre.",
  staffRoleId: null,
  jailRoleId: null,
  trapVoiceId: null,
  trapAction: "off", // off | kick | ban

  levelsEnabled: true,
  levelRewards: {}, // { "10": "roleId" }

  automod: {
    enabled: true,
    antiInvite: true,
    antiLink: false,
    antiSpam: true,
    spamThreshold: 6,
    spamWindowMs: 7000,
    spamTimeoutMinutes: 10,
    maxMentions: 6,
    capsPercent: 80,
    maxEmojis: 0,
    bannedWords: [],
    ignoredChannels: [],
    exemptRoles: [],
    warnOnDelete: true,
  },

  antiraid: {
    enabled: true,
    joinThreshold: 8,
    joinWindowMs: 10_000,
    minAccountAgeDays: 3,
    onRaid: "lockdown", // lockdown | kick | off
    lockdownMinutes: 15,
  },

  antinuke: {
    enabled: true,
    whitelist: [],
    channelDeleteMax: 3,
    roleDeleteMax: 3,
    banMax: 5,
    kickMax: 5,
    windowMs: 20_000,
    punishment: "strip", // strip | ban | alert
  },

  economy: {
    enabled: true,
    currency: "🪙",
    dailyAmount: 250,
    workMin: 40,
    workMax: 180,
    workCooldownMs: 30 * 60_000,
    dropChance: 0,
    shop: [],
  },
};

let pool = null;
let ready = false;

const mem = {
  config: new Map(),
  sanctions: [],
  levels: new Map(),
  economy: new Map(),
  giveaways: [],
  entries: [],
  tickets: [],
  jail: new Map(),
  absences: [],
};
let seq = 1;

const usingDatabase = () => ready;

function merge(base, patch) {
  const out = Array.isArray(base) ? [...base] : { ...base };
  for (const [k, v] of Object.entries(patch ?? {})) {
    if (v && typeof v === "object" && !Array.isArray(v) && base?.[k] && typeof base[k] === "object" && !Array.isArray(base[k])) out[k] = merge(base[k], v);
    else out[k] = v;
  }
  return out;
}

async function initDatabase() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[db] DATABASE_URL absent → mode mémoire (données perdues au redémarrage).");
    return false;
  }
  const needSsl = /sslmode=require/i.test(url) || process.env.PGSSL === "true";
  try {
    pool = new Pool({ connectionString: url, ssl: needSsl ? { rejectUnauthorized: false } : false, max: 8, idleTimeoutMillis: 30_000 });
    const q = (sql) => pool.query(sql);
    await q(`CREATE TABLE IF NOT EXISTS guild_config (guild_id TEXT PRIMARY KEY, data JSONB NOT NULL DEFAULT '{}'::jsonb)`);
    await q(`CREATE TABLE IF NOT EXISTS sanctions (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, user_id TEXT NOT NULL, moderator_id TEXT NOT NULL,
      type TEXT NOT NULL, reason TEXT NOT NULL, duration_ms BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await q(`CREATE INDEX IF NOT EXISTS sanctions_lookup ON sanctions (guild_id, user_id, type)`);
    await q(`CREATE TABLE IF NOT EXISTS levels (guild_id TEXT, user_id TEXT, xp INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS economy (
      guild_id TEXT, user_id TEXT, coins BIGINT NOT NULL DEFAULT 0,
      last_daily TIMESTAMPTZ, last_work TIMESTAMPTZ, streak INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS giveaways (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, message_id TEXT,
      prize TEXT NOT NULL, winners INTEGER NOT NULL DEFAULT 1, host_id TEXT NOT NULL,
      required_role TEXT, ends_at TIMESTAMPTZ NOT NULL, ended BOOLEAN NOT NULL DEFAULT FALSE)`);
    await q(`CREATE TABLE IF NOT EXISTS giveaway_entries (giveaway_id INTEGER, user_id TEXT, PRIMARY KEY (giveaway_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, user_id TEXT NOT NULL,
      kind TEXT NOT NULL, opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ, closed_by TEXT)`);
    await q(`CREATE TABLE IF NOT EXISTS jail (guild_id TEXT, user_id TEXT, roles JSONB NOT NULL DEFAULT '[]'::jsonb,
      until TIMESTAMPTZ, reason TEXT, PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS absences (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, user_id TEXT NOT NULL, reason TEXT NOT NULL,
      until TIMESTAMPTZ, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    pool.on("error", (e) => console.error("[db] pool:", e.message));
    ready = true;
    console.log("[db] PostgreSQL connecté, tables prêtes.");
    return true;
  } catch (e) {
    console.error("[db] connexion impossible → mode mémoire :", e.message);
    pool = null; ready = false;
    return false;
  }
}

const q = async (sql, params = []) => {
  try { return await pool.query(sql, params); }
  catch (e) { console.error("[db]", e.message); return { rows: [], rowCount: 0 }; }
};

/* --------------------------------- CONFIG --------------------------------- */
const cache = new Map();

async function getConfig(guildId) {
  if (cache.has(guildId)) return cache.get(guildId);
  let data = {};
  if (ready) data = (await q("SELECT data FROM guild_config WHERE guild_id=$1", [guildId])).rows[0]?.data ?? {};
  else data = mem.config.get(guildId) ?? {};
  const cfg = merge(DEFAULT_CONFIG, data);
  cache.set(guildId, cfg);
  return cfg;
}

async function updateConfig(guildId, patch) {
  const next = merge(await getConfig(guildId), patch);
  cache.set(guildId, next);
  if (ready) await q(`INSERT INTO guild_config (guild_id,data) VALUES ($1,$2::jsonb)
    ON CONFLICT (guild_id) DO UPDATE SET data=$2::jsonb`, [guildId, JSON.stringify(next)]);
  else mem.config.set(guildId, next);
  return next;
}

/* -------------------------------- SANCTIONS -------------------------------- */
async function addSanction(guildId, userId, modId, type, reason, durationMs = null) {
  if (ready) await q(`INSERT INTO sanctions (guild_id,user_id,moderator_id,type,reason,duration_ms) VALUES ($1,$2,$3,$4,$5,$6)`,
    [guildId, userId, modId, type, reason, durationMs]);
  else mem.sanctions.push({ id: seq++, guild_id: guildId, user_id: userId, moderator_id: modId, type, reason, duration_ms: durationMs, created_at: new Date() });
  return countSanctions(guildId, userId, type);
}

async function countSanctions(guildId, userId, type = null) {
  if (ready) {
    const r = await q(`SELECT COUNT(*)::int c FROM sanctions WHERE guild_id=$1 AND user_id=$2 ${type ? "AND type=$3" : ""}`,
      type ? [guildId, userId, type] : [guildId, userId]);
    return r.rows[0]?.c ?? 0;
  }
  return mem.sanctions.filter((s) => s.guild_id === guildId && s.user_id === userId && (!type || s.type === type)).length;
}

async function listSanctions(guildId, userId, type = null, limit = 20) {
  if (ready) {
    const r = await q(`SELECT * FROM sanctions WHERE guild_id=$1 AND user_id=$2 ${type ? "AND type=$3" : ""} ORDER BY id DESC LIMIT ${limit}`,
      type ? [guildId, userId, type] : [guildId, userId]);
    return r.rows;
  }
  return mem.sanctions.filter((s) => s.guild_id === guildId && s.user_id === userId && (!type || s.type === type)).sort((a, b) => b.id - a.id).slice(0, limit);
}

async function deleteSanction(guildId, id) {
  if (ready) return (await q("DELETE FROM sanctions WHERE guild_id=$1 AND id=$2", [guildId, id])).rowCount > 0;
  const n = mem.sanctions.length;
  mem.sanctions = mem.sanctions.filter((s) => !(s.guild_id === guildId && s.id === id));
  return n !== mem.sanctions.length;
}

async function clearSanctions(guildId, userId, type = null) {
  if (ready) return (await q(`DELETE FROM sanctions WHERE guild_id=$1 AND user_id=$2 ${type ? "AND type=$3" : ""}`,
    type ? [guildId, userId, type] : [guildId, userId])).rowCount;
  const n = mem.sanctions.length;
  mem.sanctions = mem.sanctions.filter((s) => !(s.guild_id === guildId && s.user_id === userId && (!type || s.type === type)));
  return n - mem.sanctions.length;
}

/* --------------------------------- NIVEAUX -------------------------------- */
const levelFromXp = (xp) => Math.floor(0.1 * Math.sqrt(xp));
const xpForLevel = (lvl) => Math.ceil((lvl / 0.1) ** 2);

async function addXp(guildId, userId, amount) {
  let xp;
  if (ready) {
    const r = await q(`INSERT INTO levels (guild_id,user_id,xp) VALUES ($1,$2,$3)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET xp=levels.xp+$3 RETURNING xp`, [guildId, userId, amount]);
    if (!r.rows[0]) return null;
    xp = r.rows[0].xp;
  } else {
    const k = `${guildId}:${userId}`;
    xp = (mem.levels.get(k) ?? 0) + amount;
    mem.levels.set(k, xp);
  }
  const level = levelFromXp(xp);
  return { xp, level, leveledUp: level > levelFromXp(xp - amount) };
}

async function getUserLevel(guildId, userId) {
  if (ready) {
    const r = await q(`SELECT xp,(SELECT COUNT(*)+1 FROM levels l2 WHERE l2.guild_id=$1 AND l2.xp>l1.xp) rank
      FROM levels l1 WHERE guild_id=$1 AND user_id=$2`, [guildId, userId]);
    if (!r.rows[0]) return { xp: 0, level: 0, rank: null };
    return { xp: r.rows[0].xp, level: levelFromXp(r.rows[0].xp), rank: Number(r.rows[0].rank) };
  }
  const xp = mem.levels.get(`${guildId}:${userId}`) ?? 0;
  const higher = [...mem.levels.entries()].filter(([k, v]) => k.startsWith(`${guildId}:`) && v > xp).length;
  return { xp, level: levelFromXp(xp), rank: xp ? higher + 1 : null };
}

async function topLevels(guildId, limit = 10) {
  if (ready) return (await q("SELECT user_id,xp FROM levels WHERE guild_id=$1 ORDER BY xp DESC LIMIT $2", [guildId, limit]))
    .rows.map((r) => ({ userId: r.user_id, xp: r.xp, level: levelFromXp(r.xp) }));
  return [...mem.levels.entries()].filter(([k]) => k.startsWith(`${guildId}:`)).sort((a, b) => b[1] - a[1]).slice(0, limit)
    .map(([k, xp]) => ({ userId: k.split(":")[1], xp, level: levelFromXp(xp) }));
}

/* -------------------------------- ÉCONOMIE -------------------------------- */
async function getWallet(guildId, userId) {
  if (ready) {
    const r = await q("SELECT * FROM economy WHERE guild_id=$1 AND user_id=$2", [guildId, userId]);
    return r.rows[0] ? { coins: Number(r.rows[0].coins), lastDaily: r.rows[0].last_daily, lastWork: r.rows[0].last_work, streak: r.rows[0].streak }
      : { coins: 0, lastDaily: null, lastWork: null, streak: 0 };
  }
  return mem.economy.get(`${guildId}:${userId}`) ?? { coins: 0, lastDaily: null, lastWork: null, streak: 0 };
}

async function addCoins(guildId, userId, amount) {
  if (ready) {
    const r = await q(`INSERT INTO economy (guild_id,user_id,coins) VALUES ($1,$2,$3)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET coins=GREATEST(0, economy.coins+$3) RETURNING coins`, [guildId, userId, amount]);
    return Number(r.rows[0]?.coins ?? 0);
  }
  const k = `${guildId}:${userId}`;
  const w = mem.economy.get(k) ?? { coins: 0, lastDaily: null, lastWork: null, streak: 0 };
  w.coins = Math.max(0, w.coins + amount);
  mem.economy.set(k, w);
  return w.coins;
}

async function stampEconomy(guildId, userId, field, value, streak = null) {
  const col = field === "daily" ? "last_daily" : "last_work";
  if (ready) await q(`INSERT INTO economy (guild_id,user_id,${col},streak) VALUES ($1,$2,$3,$4)
    ON CONFLICT (guild_id,user_id) DO UPDATE SET ${col}=$3${streak !== null ? ", streak=$4" : ""}`, [guildId, userId, value, streak ?? 0]);
  else {
    const k = `${guildId}:${userId}`;
    const w = mem.economy.get(k) ?? { coins: 0, lastDaily: null, lastWork: null, streak: 0 };
    if (field === "daily") { w.lastDaily = value; if (streak !== null) w.streak = streak; } else w.lastWork = value;
    mem.economy.set(k, w);
  }
}

async function topCoins(guildId, limit = 10) {
  if (ready) return (await q("SELECT user_id,coins FROM economy WHERE guild_id=$1 ORDER BY coins DESC LIMIT $2", [guildId, limit]))
    .rows.map((r) => ({ userId: r.user_id, coins: Number(r.coins) }));
  return [...mem.economy.entries()].filter(([k]) => k.startsWith(`${guildId}:`)).sort((a, b) => b[1].coins - a[1].coins)
    .slice(0, limit).map(([k, w]) => ({ userId: k.split(":")[1], coins: w.coins }));
}

/* -------------------------------- GIVEAWAYS ------------------------------- */
async function createGiveaway(g) {
  if (ready) {
    const r = await q(`INSERT INTO giveaways (guild_id,channel_id,prize,winners,host_id,required_role,ends_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`, [g.guildId, g.channelId, g.prize, g.winners, g.hostId, g.requiredRole, g.endsAt]);
    return r.rows[0]?.id;
  }
  const id = seq++;
  mem.giveaways.push({ id, guild_id: g.guildId, channel_id: g.channelId, message_id: null, prize: g.prize, winners: g.winners, host_id: g.hostId, required_role: g.requiredRole, ends_at: g.endsAt, ended: false });
  return id;
}

async function setGiveawayMessage(id, messageId) {
  if (ready) await q("UPDATE giveaways SET message_id=$2 WHERE id=$1", [id, messageId]);
  else { const g = mem.giveaways.find((x) => x.id === id); if (g) g.message_id = messageId; }
}

async function getGiveaway(id) {
  if (ready) return (await q("SELECT * FROM giveaways WHERE id=$1", [id])).rows[0] ?? null;
  return mem.giveaways.find((g) => g.id === id) ?? null;
}

async function dueGiveaways() {
  if (ready) return (await q("SELECT * FROM giveaways WHERE ended=FALSE AND ends_at<=NOW()")).rows;
  return mem.giveaways.filter((g) => !g.ended && new Date(g.ends_at) <= new Date());
}

async function endGiveaway(id) {
  if (ready) await q("UPDATE giveaways SET ended=TRUE WHERE id=$1", [id]);
  else { const g = mem.giveaways.find((x) => x.id === id); if (g) g.ended = true; }
}

async function enterGiveaway(id, userId) {
  if (ready) {
    const r = await q("INSERT INTO giveaway_entries VALUES ($1,$2) ON CONFLICT DO NOTHING RETURNING user_id", [id, userId]);
    return r.rowCount > 0;
  }
  if (mem.entries.some((e) => e.giveaway_id === id && e.user_id === userId)) return false;
  mem.entries.push({ giveaway_id: id, user_id: userId });
  return true;
}

async function leaveGiveaway(id, userId) {
  if (ready) return (await q("DELETE FROM giveaway_entries WHERE giveaway_id=$1 AND user_id=$2", [id, userId])).rowCount > 0;
  const n = mem.entries.length;
  mem.entries = mem.entries.filter((e) => !(e.giveaway_id === id && e.user_id === userId));
  return n !== mem.entries.length;
}

async function giveawayEntries(id) {
  if (ready) return (await q("SELECT user_id FROM giveaway_entries WHERE giveaway_id=$1", [id])).rows.map((r) => r.user_id);
  return mem.entries.filter((e) => e.giveaway_id === id).map((e) => e.user_id);
}

/* --------------------------------- TICKETS -------------------------------- */
async function openTicketRow(guildId, channelId, userId, kind) {
  if (ready) return (await q(`INSERT INTO tickets (guild_id,channel_id,user_id,kind) VALUES ($1,$2,$3,$4) RETURNING id`,
    [guildId, channelId, userId, kind])).rows[0]?.id;
  const id = seq++;
  mem.tickets.push({ id, guild_id: guildId, channel_id: channelId, user_id: userId, kind, opened_at: new Date(), closed_at: null });
  return id;
}

async function closeTicketRow(channelId, closedBy) {
  if (ready) await q("UPDATE tickets SET closed_at=NOW(), closed_by=$2 WHERE channel_id=$1 AND closed_at IS NULL", [channelId, closedBy]);
  else { const t = mem.tickets.find((x) => x.channel_id === channelId && !x.closed_at); if (t) { t.closed_at = new Date(); t.closed_by = closedBy; } }
}

async function ticketStats(guildId) {
  if (ready) {
    const r = await q(`SELECT COUNT(*)::int total, COUNT(*) FILTER (WHERE closed_at IS NULL)::int open,
      COUNT(*) FILTER (WHERE opened_at > NOW() - INTERVAL '7 days')::int week FROM tickets WHERE guild_id=$1`, [guildId]);
    return r.rows[0] ?? { total: 0, open: 0, week: 0 };
  }
  const all = mem.tickets.filter((t) => t.guild_id === guildId);
  return { total: all.length, open: all.filter((t) => !t.closed_at).length, week: all.filter((t) => Date.now() - t.opened_at < 6048e5).length };
}

async function openTicketOf(guildId, userId, kind) {
  if (ready) return (await q("SELECT channel_id FROM tickets WHERE guild_id=$1 AND user_id=$2 AND kind=$3 AND closed_at IS NULL LIMIT 1",
    [guildId, userId, kind])).rows[0]?.channel_id ?? null;
  return mem.tickets.find((t) => t.guild_id === guildId && t.user_id === userId && t.kind === kind && !t.closed_at)?.channel_id ?? null;
}

/* --------------------------------- ALCATRAZ ------------------------------- */
async function jailUser(guildId, userId, roles, until, reason) {
  if (ready) await q(`INSERT INTO jail (guild_id,user_id,roles,until,reason) VALUES ($1,$2,$3::jsonb,$4,$5)
    ON CONFLICT (guild_id,user_id) DO UPDATE SET roles=$3::jsonb, until=$4, reason=$5`, [guildId, userId, JSON.stringify(roles), until, reason]);
  else mem.jail.set(`${guildId}:${userId}`, { roles, until, reason });
}

async function getJail(guildId, userId) {
  if (ready) return (await q("SELECT * FROM jail WHERE guild_id=$1 AND user_id=$2", [guildId, userId])).rows[0] ?? null;
  return mem.jail.get(`${guildId}:${userId}`) ?? null;
}

async function freeUser(guildId, userId) {
  if (ready) await q("DELETE FROM jail WHERE guild_id=$1 AND user_id=$2", [guildId, userId]);
  else mem.jail.delete(`${guildId}:${userId}`);
}

async function dueJail() {
  if (ready) return (await q("SELECT * FROM jail WHERE until IS NOT NULL AND until<=NOW()")).rows;
  return [...mem.jail.entries()].filter(([, v]) => v.until && new Date(v.until) <= new Date())
    .map(([k, v]) => ({ guild_id: k.split(":")[0], user_id: k.split(":")[1], ...v }));
}

/* --------------------------------- ABSENCES ------------------------------- */
async function addAbsence(guildId, userId, reason, until) {
  if (ready) await q("INSERT INTO absences (guild_id,user_id,reason,until) VALUES ($1,$2,$3,$4)", [guildId, userId, reason, until]);
  else mem.absences.push({ id: seq++, guild_id: guildId, user_id: userId, reason, until, created_at: new Date() });
}

async function listAbsences(guildId) {
  if (ready) return (await q("SELECT * FROM absences WHERE guild_id=$1 AND (until IS NULL OR until>NOW()) ORDER BY id DESC LIMIT 25", [guildId])).rows;
  return mem.absences.filter((a) => a.guild_id === guildId && (!a.until || new Date(a.until) > new Date())).slice(-25).reverse();
}

/* ========================================================================== */
/*                     3 — AUTOMOD, ANTI-RAID, ANTI-NUKE                      */
/* ========================================================================== */

// guard.js — automod, anti-raid, anti-nuke.


const INVITE_RE = /(?:discord\.(?:gg|io|me|li)|(?:discord(?:app)?)\.com\/invite)\/[a-z0-9-_]+/i;
const LINK_RE = /https?:\/\/[^\s]+/i;
const EMOJI_RE = /<a?:\w+:\d+>|\p{Extended_Pictographic}/gu;

const spamTracker = new Map();
const joinTracker = new Map();
const nukeTracker = new Map();

setInterval(() => {
  const now = Date.now();
  for (const m of [spamTracker, joinTracker, nukeTracker]) {
    for (const [k, arr] of m) {
      const fresh = arr.filter((t) => now - (t.at ?? t) < 120_000);
      if (!fresh.length) m.delete(k); else m.set(k, fresh);
    }
  }
}, 60_000).unref();

/* ================================= AUTOMOD ================================= */

function exempt(message, automod) {
  const member = message.member;
  if (!member) return true;
  if (member.permissions.has(PermissionFlagsBits.ManageMessages)) return true;
  if (automod.ignoredChannels?.includes(message.channel.id)) return true;
  if (automod.ignoredChannels?.includes(message.channel.parentId)) return true;
  if (automod.exemptRoles?.some((r) => member.roles.cache.has(r))) return true;
  return false;
}

/** @returns {{reason:string, route:string, timeoutMs?:number}|null} */
function inspectMessage(message, config) {
  const a = config.automod;
  if (!a?.enabled || !message.guild || message.author.bot) return null;
  if (exempt(message, a)) return null;

  const content = message.content ?? "";

  if (a.antiInvite && INVITE_RE.test(content))
    return { reason: "Invitation Discord", route: "antipub", timeoutMs: 10 * 60_000 };

  if (a.antiLink && LINK_RE.test(content))
    return { reason: "Lien non autorisé", route: "messageLink" };

  if (a.maxMentions > 0) {
    const n = message.mentions.users.size + message.mentions.roles.size + (message.mentions.everyone ? 5 : 0);
    if (n >= a.maxMentions) return { reason: `Mentions en masse (${n})`, route: "spam", timeoutMs: 30 * 60_000 };
  }

  if (a.capsPercent > 0 && content.length >= 15) {
    const letters = content.replace(/[^\p{L}]/gu, "");
    if (letters.length >= 12) {
      const upper = [...letters].filter((c) => c === c.toUpperCase() && c !== c.toLowerCase()).length;
      if ((upper / letters.length) * 100 >= a.capsPercent) return { reason: "Excès de majuscules", route: "automod" };
    }
  }

  if (a.maxEmojis > 0) {
    const n = (content.match(EMOJI_RE) ?? []).length;
    if (n >= a.maxEmojis) return { reason: `Excès d'émojis (${n})`, route: "automod" };
  }

  if (a.bannedWords?.length) {
    const flat = content.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
    if (a.bannedWords.some((w) => flat.includes(w.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ""))))
      return { reason: "Mot interdit", route: "toxic", timeoutMs: 10 * 60_000 };
  }

  if (a.antiSpam) {
    const key = `${message.guild.id}:${message.author.id}`;
    const now = Date.now();
    const stamps = (spamTracker.get(key) ?? []).filter((t) => now - t < a.spamWindowMs);
    stamps.push(now);
    spamTracker.set(key, stamps);
    if (stamps.length >= a.spamThreshold) {
      spamTracker.set(key, []);
      return {
        reason: `Flood (${stamps.length} msg / ${Math.round(a.spamWindowMs / 1000)}s)`,
        route: "spam",
        timeoutMs: (a.spamTimeoutMinutes ?? 10) * 60_000,
      };
    }
  }

  return null;
}

/* ================================ ANTI-RAID =============================== */

const lockdowns = new Map(); // guildId -> expiry

const isLockdown = (guildId) => (lockdowns.get(guildId) ?? 0) > Date.now();

function setLockdown(guildId, minutes) {
  lockdowns.set(guildId, Date.now() + minutes * 60_000);
}

function clearLockdown(guildId) {
  lockdowns.delete(guildId);
}

/**
 * @returns {{type:'raid'|'young', count?:number, ageDays?:number}|null}
 */
function inspectJoin(member, config) {
  const ar = config.antiraid;
  if (!ar?.enabled) return null;

  const now = Date.now();
  const key = member.guild.id;
  const stamps = (joinTracker.get(key) ?? []).filter((t) => now - t < ar.joinWindowMs);
  stamps.push(now);
  joinTracker.set(key, stamps);

  if (stamps.length >= ar.joinThreshold) {
    joinTracker.set(key, []);
    return { type: "raid", count: stamps.length };
  }

  const ageDays = (now - member.user.createdTimestamp) / 864e5;
  if (ar.minAccountAgeDays > 0 && ageDays < ar.minAccountAgeDays) {
    return { type: "young", ageDays: Math.floor(ageDays) };
  }
  return null;
}

/* ================================ ANTI-NUKE =============================== */

const AUDIT_MAP = {
  channelDelete: AuditLogEvent.ChannelDelete,
  channelCreate: AuditLogEvent.ChannelCreate,
  roleDelete: AuditLogEvent.RoleDelete,
  roleCreate: AuditLogEvent.RoleCreate,
  ban: AuditLogEvent.MemberBanAdd,
  kick: AuditLogEvent.MemberKick,
  webhook: AuditLogEvent.WebhookCreate,
  botAdd: AuditLogEvent.BotAdd,
  permissions: AuditLogEvent.ChannelOverwriteCreate,
};

/** Retrouve l'auteur d'une action via les logs d'audit. */
async function findExecutor(guild, kind, targetId = null) {
  const type = AUDIT_MAP[kind];
  if (type === undefined) return null;
  if (!guild.members.me?.permissions.has(PermissionFlagsBits.ViewAuditLog)) return null;
  try {
    const logs = await guild.fetchAuditLogs({ type, limit: 6 });
    const entry = logs.entries.find((e) => {
      if (Date.now() - e.createdTimestamp > 15_000) return false;
      if (targetId && e.target?.id && e.target.id !== targetId) return false;
      return true;
    });
    return entry?.executor ?? null;
  } catch {
    return null;
  }
}

const LIMIT_FIELD = {
  channelDelete: "channelDeleteMax",
  roleDelete: "roleDeleteMax",
  ban: "banMax",
  kick: "kickMax",
};

/**
 * Enregistre une action sensible et dit si le seuil est franchi.
 * @returns {{triggered:boolean, count:number, limit:number}}
 */
function trackNuke(guild, executorId, kind, config) {
  const an = config.antinuke;
  const limit = an[LIMIT_FIELD[kind]] ?? 4;
  const key = `${guild.id}:${executorId}:${kind}`;
  const now = Date.now();
  const stamps = (nukeTracker.get(key) ?? []).filter((t) => now - t < an.windowMs);
  stamps.push(now);
  nukeTracker.set(key, stamps);
  return { triggered: stamps.length >= limit, count: stamps.length, limit };
}

function isWhitelisted(guild, userId, config) {
  if (userId === guild.ownerId) return true;
  if (userId === guild.client.user.id) return true;
  return config.antinuke?.whitelist?.includes(userId) ?? false;
}

/** Neutralise un utilisateur : retire tous ses rôles, ou bannit. */
async function neutralize(guild, userId, config, reason) {
  const mode = config.antinuke?.punishment ?? "strip";
  if (mode === "alert") return "alerte seulement";
  const member = await guild.members.fetch(userId).catch(() => null);
  if (!member) return "membre introuvable";

  if (mode === "ban") {
    if (!member.bannable) return "bannissement impossible (rôle trop haut)";
    await member.ban({ reason }).catch(() => null);
    return "banni";
  }

  const removable = member.roles.cache.filter(
    (r) => r.id !== guild.id && r.editable && !r.managed
  );
  if (!removable.size) return "aucun rôle retirable";
  await member.roles.remove(removable, reason).catch(() => null);
  return `${removable.size} rôle(s) retiré(s)`;
}

/** Verrouille tous les salons textuels publics. */
async function lockAllChannels(guild, lock, reason) {
  let done = 0;
  const everyone = guild.roles.everyone;
  for (const ch of guild.channels.cache.values()) {
    if (ch.type !== ChannelType.GuildText) continue;
    if (!ch.manageable) continue;
    const perms = ch.permissionsFor(everyone);
    if (!perms?.has(PermissionFlagsBits.ViewChannel)) continue;
    await ch.permissionOverwrites.edit(everyone, { SendMessages: lock ? false : null }, { reason }).catch(() => null);
    done++;
    if (done % 5 === 0) await new Promise((r) => setTimeout(r, 1200));
  }
  return done;
}

/* ========================================================================== */
/*          4 — TICKETS, GIVEAWAYS, COMPTEURS, CONFESSIONS, ALCATRAZ          */
/* ========================================================================== */

// features.js — tickets, giveaways, compteurs vocaux, confessions, alcatraz.


/* ========================================================================== */
/*                            LOG CENTRALISÉ                                  */
/* ========================================================================== */

async function log(guild, routeKey, e) {
  try {
    const config = await getConfig(guild.id);
    if (!config.logsEnabled) return;
    const channel = resolveLogChannel(guild, routeKey, config);
    if (!channel || !canSend(channel)) return;
    await channel.send({ embeds: [e] });
  } catch (err) {
    console.error(`[log:${routeKey}]`, err.message);
  }
}

/* ========================================================================== */
/*                            COMPTEURS VOCAUX                                */
/* ========================================================================== */

async function updateCounters(guild) {
  const voiceCount = guild.channels.cache
    .filter((c) => c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice)
    .reduce((t, c) => t + c.members.size, 0);

  let online = 0;
  for (const m of guild.members.cache.values()) {
    if (m.presence && m.presence.status !== "offline") online++;
  }

  const values = { members: guild.memberCount, online: online || null, voice: voiceCount };

  for (const counter of COUNTERS) {
    const value = values[counter.key];
    if (value === null) continue;
    const channel = guild.channels.cache.find(
      (c) => (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice) && counter.test.test(c.name)
    );
    if (!channel || !channel.manageable) continue;
    const next = counter.template.replace("{n}", num(value));
    if (channel.name === next) continue;
    await channel.setName(next, "Compteur automatique").catch(() => null);
    await new Promise((r) => setTimeout(r, 1500));
  }
}

/* ========================================================================== */
/*                                 TICKETS                                    */
/* ========================================================================== */

function ticketPanelComponents() {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket:pick")
    .setPlaceholder("Choisis le type de ticket")
    .addOptions(TICKET_TYPES.map((t) => ({ label: t.label, value: t.id, emoji: t.emoji })));
  return [new ActionRowBuilder().addComponents(menu)];
}

async function createTicket(interaction, kindId) {
  const guild = interaction.guild;
  const config = await getConfig(guild.id);
  const kind = TICKET_TYPES.find((t) => t.id === kindId);
  if (!kind) return interaction.editReply("Type de ticket inconnu.");

  const existing = await openTicketOf(guild.id, interaction.user.id, kindId);
  if (existing && guild.channels.cache.has(existing)) {
    return interaction.editReply(`Tu as déjà un ticket **${kind.label}** ouvert : <#${existing}>`);
  }

  const category = findCategory(guild, kind.categories);
  if (!category) {
    return interaction.editReply(
      `Je ne trouve pas la catégorie pour ce type de ticket. Elle doit s'appeler **${kind.categories[0].replace(/-/g, " ")}**.`
    );
  }

  const staffRoleId = config.staffRoleId;
  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    {
      id: interaction.user.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.AttachFiles, PermissionFlagsBits.EmbedLinks],
    },
    {
      id: guild.members.me.id,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.EmbedLinks],
    },
  ];
  if (staffRoleId && guild.roles.cache.has(staffRoleId)) {
    overwrites.push({
      id: staffRoleId,
      allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages, PermissionFlagsBits.AttachFiles],
    });
  }

  const clean = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 20) || "membre";
  const channel = await guild.channels.create({
    name: `ticket-${clean}`,
    type: ChannelType.GuildText,
    parent: category.id,
    topic: `${kind.label} — ${interaction.user.tag} (${interaction.user.id})`,
    permissionOverwrites: overwrites,
    reason: `Ticket ${kind.label} ouvert par ${interaction.user.tag}`,
  }).catch((e) => { console.error("[ticket]", e.message); return null; });

  if (!channel) return interaction.editReply("Création impossible — vérifie mes permissions sur la catégorie.");

  await openTicketRow(guild.id, channel.id, interaction.user.id, kindId);

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId("ticket:claim").setLabel("Prendre en charge").setStyle(ButtonStyle.Secondary).setEmoji("✋"),
    new ButtonBuilder().setCustomId("ticket:close").setLabel("Fermer").setStyle(ButtonStyle.Danger).setEmoji("🔒"),
  );

  await channel.send({
    content: `${interaction.user}${staffRoleId ? ` <@&${staffRoleId}>` : ""}`,
    embeds: [embed({
      title: `${kind.emoji} ${kind.label}`,
      description: "Explique ta demande en détail (captures, pseudos, liens). Un membre du staff arrive.",
      color: COLORS.primary,
      footer: "Merci de rester courtois — les abus de tickets sont sanctionnés.",
    })],
    components: [row],
  }).catch(() => null);

  await interaction.editReply(`Ticket créé : ${channel}`);

  await log(guild, "ticket", embed({
    title: "Ticket ouvert",
    color: COLORS.success,
    fields: [
      { name: "Membre", value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
      { name: "Type", value: kind.label, inline: true },
      { name: "Salon", value: `${channel}`, inline: true },
    ],
  }));

  await refreshTicketCounter(guild);
}

async function refreshTicketCounter(guild) {
  const config = await getConfig(guild.id);
  const channel = resolveFuncChannel(guild, "ticketCounter", config);
  if (!channel || !canSend(channel)) return;
  const s = await ticketStats(guild.id);
  const body = embed({
    title: "Compteur de tickets",
    color: COLORS.primary,
    fields: [
      { name: "Ouverts", value: `${s.open}`, inline: true },
      { name: "7 derniers jours", value: `${s.week}`, inline: true },
      { name: "Total", value: `${s.total}`, inline: true },
    ],
  });
  const recent = await channel.messages.fetch({ limit: 10 }).catch(() => null);
  const mine = recent?.find((m) => m.author.id === guild.members.me.id && m.embeds[0]?.title === "Compteur de tickets");
  if (mine) await mine.edit({ embeds: [body] }).catch(() => null);
  else await channel.send({ embeds: [body] }).catch(() => null);
}

async function closeTicket(interaction) {
  const channel = interaction.channel;
  await closeTicketRow(channel.id, interaction.user.id);

  const messages = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  const transcript = messages
    ? [...messages.values()].reverse()
        .map((m) => `[${new Date(m.createdTimestamp).toLocaleString("fr-FR")}] ${m.author.tag}: ${m.content || "(pièce jointe / embed)"}`)
        .join("\n").slice(0, 1_900_000)
    : "";

  await log(interaction.guild, "ticket", embed({
    title: "Ticket fermé",
    color: COLORS.danger,
    fields: [
      { name: "Salon", value: channel.name, inline: true },
      { name: "Fermé par", value: interaction.user.tag, inline: true },
      { name: "Sujet", value: channel.topic ?? "—" },
    ],
  }));

  if (transcript) {
    const config = await getConfig(interaction.guild.id);
    const logCh = resolveLogChannel(interaction.guild, "ticket", config);
    if (logCh && canSend(logCh)) {
      await logCh.send({
        files: [{ attachment: Buffer.from(transcript, "utf8"), name: `${channel.name}.txt` }],
      }).catch(() => null);
    }
  }

  await refreshTicketCounter(interaction.guild);
  setTimeout(() => channel.delete("Ticket fermé").catch(() => null), 5000);
}

/* ========================================================================== */
/*                                GIVEAWAYS                                   */
/* ========================================================================== */

function giveawayComponents(id, count) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`gw:join:${id}`).setLabel(`Participer (${count})`).setStyle(ButtonStyle.Success).setEmoji("🎉"),
    new ButtonBuilder().setCustomId(`gw:leave:${id}`).setLabel("Retirer").setStyle(ButtonStyle.Secondary),
  )];
}

function giveawayEmbed(g, count) {
  return embed({
    title: `🎉 ${g.prize}`,
    color: COLORS.gold,
    description: [
      `Fin : ${ts(g.ends_at)} (${ts(g.ends_at, "f")})`,
      `Gagnant(s) : **${g.winners}**`,
      g.required_role ? `Rôle requis : <@&${g.required_role}>` : null,
      `Organisé par <@${g.host_id}>`,
    ].filter(Boolean).join("\n"),
    footer: `${count} participant(s) · id ${g.id}`,
  });
}

async function handleGiveawayButton(interaction, action, id) {
  const g = await getGiveaway(Number(id));
  if (!g || g.ended) return interaction.reply({ content: "Ce giveaway est terminé.", ...EPH });

  if (action === "leave") {
    const removed = await leaveGiveaway(g.id, interaction.user.id);
    await refreshGiveaway(interaction.client, g);
    return interaction.reply({ content: removed ? "Participation retirée." : "Tu ne participais pas.", ...EPH });
  }

  if (g.required_role && !interaction.member.roles.cache.has(g.required_role)) {
    return interaction.reply({ content: `Il te faut le rôle <@&${g.required_role}> pour participer.`, ...EPH });
  }

  const added = await enterGiveaway(g.id, interaction.user.id);
  await refreshGiveaway(interaction.client, g);
  return interaction.reply({ content: added ? "Participation enregistrée. Bonne chance." : "Tu participes déjà.", ...EPH });
}

async function refreshGiveaway(client, g) {
  if (!g.message_id) return;
  const channel = await client.channels.fetch(g.channel_id).catch(() => null);
  if (!channel) return;
  const message = await channel.messages.fetch(g.message_id).catch(() => null);
  if (!message) return;
  const count = (await giveawayEntries(g.id)).length;
  await message.edit({ embeds: [giveawayEmbed(g, count)], components: giveawayComponents(g.id, count) }).catch(() => null);
}

async function drawGiveaway(client, g, rerollCount = null) {
  const entries = await giveawayEntries(g.id);
  const channel = await client.channels.fetch(g.channel_id).catch(() => null);
  const winners = [];
  const pool = [...entries];
  const want = rerollCount ?? g.winners;

  while (winners.length < want && pool.length) {
    winners.push(...pool.splice(Math.floor(Math.random() * pool.length), 1));
  }

  if (!rerollCount) {
    await endGiveaway(g.id);
    if (g.message_id && channel) {
      const message = await channel.messages.fetch(g.message_id).catch(() => null);
      if (message) {
        await message.edit({
          embeds: [embed({
            title: `🎉 ${g.prize}`,
            color: COLORS.neutral,
            description: winners.length ? `Terminé — gagnant(s) : ${winners.map((w) => `<@${w}>`).join(", ")}` : "Terminé — aucun participant.",
            footer: `${entries.length} participant(s) · id ${g.id}`,
          })],
          components: [],
        }).catch(() => null);
      }
    }
  }

  if (channel && canSend(channel)) {
    await channel.send({
      content: winners.length
        ? `${winners.map((w) => `<@${w}>`).join(" ")} — vous gagnez **${g.prize}** !`
        : `Aucun participant pour **${g.prize}**.`,
    }).catch(() => null);
  }

  return winners;
}

async function tickGiveaways(client) {
  const due = await dueGiveaways();
  for (const g of due) {
    await drawGiveaway(client, g).catch((e) => console.error("[gw]", e.message));
  }
}

async function postGiveaway(client, id, channel) {
  const g = await getGiveaway(id);
  const message = await channel.send({ embeds: [giveawayEmbed(g, 0)], components: giveawayComponents(id, 0) });
  await setGiveawayMessage(id, message.id);
  return message;
}

/* ========================================================================== */
/*                                CONFESSIONS                                 */
/* ========================================================================== */

let confessionCount = 0;

async function postConfession(interaction, text) {
  const config = await getConfig(interaction.guild.id);
  const channel = resolveFuncChannel(interaction.guild, "confessionPost", config);
  if (!channel || !canSend(channel)) {
    return interaction.reply({ content: "Le salon de confessions est introuvable ou je n'y ai pas accès.", ...EPH });
  }

  confessionCount++;
  await channel.send({
    embeds: [embed({
      title: `Confession #${confessionCount}`,
      description: text,
      color: COLORS.purple,
      footer: "Anonyme — /confession pour envoyer la tienne",
    })],
  });

  await log(interaction.guild, "confession", embed({
    title: `Confession #${confessionCount}`,
    color: COLORS.purple,
    fields: [
      { name: "Auteur", value: `${interaction.user.tag} (\`${interaction.user.id}\`)`, inline: true },
      { name: "Salon", value: `${channel}`, inline: true },
      { name: "Contenu", value: text },
    ],
  }));

  return interaction.reply({ content: "Confession publiée anonymement.", ...EPH });
}

/* ========================================================================== */
/*                                 ALCATRAZ                                   */
/* ========================================================================== */

async function sendToJail(guild, member, moderator, reason, durationMs) {
  const config = await getConfig(guild.id);
  let roleId = config.jailRoleId;
  let role = roleId ? guild.roles.cache.get(roleId) : null;

  if (!role) {
    role = guild.roles.cache.find((r) => /alcatraz|prison|prisonnier|jail/i.test(r.name));
  }
  if (!role) return { ok: false, error: "Aucun rôle Alcatraz trouvé. Crée un rôle « Alcatraz » puis fais `/config alcatraz role:@Alcatraz`." };
  if (role.position >= guild.members.me.roles.highest.position) return { ok: false, error: "Le rôle Alcatraz est au-dessus du mien." };

  const saved = member.roles.cache.filter((r) => r.id !== guild.id && r.editable && !r.managed).map((r) => r.id);
  await jailUser(guild.id, member.id, saved, durationMs ? new Date(Date.now() + durationMs) : null, reason);

  await member.roles.set([role.id], `Alcatraz — ${moderator.tag} — ${reason}`).catch(() => null);
  await addSanction(guild.id, member.id, moderator.id, "alcatraz", reason, durationMs);

  await log(guild, "jail", embed({
    title: "Envoyé en Alcatraz",
    color: COLORS.danger,
    fields: [
      { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
      { name: "Durée", value: durationMs ? formatDuration(durationMs) : "Indéterminée", inline: true },
      { name: "Modérateur", value: moderator.tag, inline: true },
      { name: "Raison", value: reason },
      { name: "Rôles retirés", value: `${saved.length}`, inline: true },
    ],
  }));

  return { ok: true, roles: saved.length };
}

async function releaseFromJail(guild, member, by = "Automatique") {
  const record = await getJail(guild.id, member.id);
  if (!record) return { ok: false, error: "Ce membre n'est pas en Alcatraz." };

  const roles = Array.isArray(record.roles) ? record.roles : [];
  const valid = roles.filter((id) => {
    const r = guild.roles.cache.get(id);
    return r && r.editable && !r.managed;
  });

  await member.roles.set(valid, `Libération Alcatraz — ${by}`).catch(() => null);
  await freeUser(guild.id, member.id);

  await log(guild, "jail", embed({
    title: "Libéré d'Alcatraz",
    color: COLORS.success,
    fields: [
      { name: "Membre", value: `${member.user.tag}`, inline: true },
      { name: "Par", value: String(by), inline: true },
      { name: "Rôles restaurés", value: `${valid.length}`, inline: true },
    ],
  }));

  return { ok: true, restored: valid.length };
}

/* ========================================================================== */
/*                            5 — COMMANDES SLASH                             */
/* ========================================================================== */

// commands.js — toutes les commandes slash de 0x.


const POLL = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];

const commands = [];
const def = (data, execute) => commands.push({ data, execute });

/* ========================================================================== */
/*                                MODÉRATION                                  */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("ban").setDescription("Bannit un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .addIntegerOption((o) => o.setName("purge").setDescription("Supprimer ses messages des N derniers jours").setMinValue(0).setMaxValue(7))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const reason = i.options.getString("raison") ?? "Non précisée";
    const days = i.options.getInteger("purge") ?? 0;
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (member) {
      const p = hierarchyCheck(i, member);
      if (p) return i.reply({ content: p, ...EPH });
      if (!member.bannable) return i.reply({ content: "Je ne peux pas bannir ce membre.", ...EPH });
      await tryDm(user, i.guild.name, "Bannissement", reason);
    }
    await i.guild.bans.create(user.id, { reason: `${i.user.tag} — ${reason}`, deleteMessageSeconds: days * 86400 });
    await addSanction(i.guild.id, user.id, i.user.id, "ban", reason);
    await i.reply({ embeds: [embed({ title: "Membre banni", color: COLORS.danger, description: `**${user.tag}** a été banni.`, fields: [{ name: "Raison", value: reason }] })] });
    await log(i.guild, "ban", embed({ title: "Bannissement", color: COLORS.danger, fields: [
      { name: "Membre", value: `${user.tag} (\`${user.id}\`)`, inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true },
      { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("unban").setDescription("Révoque un bannissement")
  .addStringOption((o) => o.setName("identifiant").setDescription("ID de l'utilisateur").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers.toString()),
  async (i) => {
    const id = i.options.getString("identifiant").replace(/\D/g, "");
    const reason = i.options.getString("raison") ?? "Non précisée";
    const ban = await i.guild.bans.fetch(id).catch(() => null);
    if (!ban) return i.reply({ content: "Aucun bannissement pour cet identifiant.", ...EPH });
    await i.guild.bans.remove(id, `${i.user.tag} — ${reason}`);
    await i.reply({ content: `**${ban.user.tag}** a été débanni.`, ...EPH });
    await log(i.guild, "ban", embed({ title: "Débannissement", color: COLORS.success, fields: [
      { name: "Membre", value: `${ban.user.tag} (\`${id}\`)`, inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true },
      { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("kick").setDescription("Expulse un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const reason = i.options.getString("raison") ?? "Non précisée";
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ content: "Ce membre n'est pas sur le serveur.", ...EPH });
    const p = hierarchyCheck(i, member);
    if (p) return i.reply({ content: p, ...EPH });
    if (!member.kickable) return i.reply({ content: "Je ne peux pas expulser ce membre.", ...EPH });
    await tryDm(user, i.guild.name, "Expulsion", reason);
    await member.kick(`${i.user.tag} — ${reason}`);
    await addSanction(i.guild.id, user.id, i.user.id, "kick", reason);
    await i.reply({ embeds: [embed({ title: "Membre expulsé", color: COLORS.warning, description: `**${user.tag}** a été expulsé.`, fields: [{ name: "Raison", value: reason }] })] });
    await log(i.guild, "kick", embed({ title: "Expulsion", color: COLORS.warning, fields: [
      { name: "Membre", value: `${user.tag} (\`${user.id}\`)`, inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true },
      { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("timeout").setDescription("Réduit un membre au silence")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("duree").setDescription("Ex. 30s, 10m, 2h, 7d (max 28d)").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const ms = parseDuration(i.options.getString("duree"));
    const reason = i.options.getString("raison") ?? "Non précisée";
    if (!ms || ms < 5000 || ms > 28 * 864e5) return i.reply({ content: "Durée invalide. Format : `30s`, `10m`, `2h`, `7d` (max 28d).", ...EPH });
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ content: "Ce membre n'est pas sur le serveur.", ...EPH });
    const p = hierarchyCheck(i, member);
    if (p) return i.reply({ content: p, ...EPH });
    if (!member.moderatable) return i.reply({ content: "Je ne peux pas sanctionner ce membre.", ...EPH });
    await member.timeout(ms, `${i.user.tag} — ${reason}`);
    await addSanction(i.guild.id, user.id, i.user.id, "timeout", reason, ms);
    await tryDm(user, i.guild.name, "Réduction au silence", reason, formatDuration(ms));
    await i.reply({ embeds: [embed({ title: "Membre réduit au silence", color: COLORS.warning, description: `**${user.tag}** est muet pendant ${formatDuration(ms)}.`, fields: [{ name: "Raison", value: reason }] })] });
    await log(i.guild, "timeout", embed({ title: "Timeout", color: COLORS.warning, fields: [
      { name: "Membre", value: `${user.tag} (\`${user.id}\`)`, inline: true },
      { name: "Durée", value: formatDuration(ms), inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true },
      { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("untimeout").setDescription("Rend la parole à un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ content: "Membre introuvable.", ...EPH });
    await member.timeout(null, i.user.tag);
    await i.reply({ content: `**${user.tag}** peut de nouveau parler.`, ...EPH });
    await log(i.guild, "timeout", embed({ title: "Timeout levé", color: COLORS.success, fields: [
      { name: "Membre", value: user.tag, inline: true }, { name: "Modérateur", value: i.user.tag, inline: true }] }));
  });

def(new SlashCommandBuilder().setName("warn").setDescription("Avertit un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const reason = i.options.getString("raison");
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (member) { const p = hierarchyCheck(i, member); if (p) return i.reply({ content: p, ...EPH }); }
    const total = await addSanction(i.guild.id, user.id, i.user.id, "warn", reason);
    await tryDm(user, i.guild.name, "Avertissement", reason);
    await i.reply({ embeds: [embed({ title: "Avertissement enregistré", color: COLORS.warning,
      description: `**${user.tag}** cumule **${total}** avertissement(s).`, fields: [{ name: "Raison", value: reason }] })] });
    await log(i.guild, "warn", embed({ title: "Avertissement", color: COLORS.warning, fields: [
      { name: "Membre", value: `${user.tag} (\`${user.id}\`)`, inline: true },
      { name: "Total", value: `${total}`, inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true },
      { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("historique").setDescription("Historique complet des sanctions d'un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("type").setDescription("Filtrer")
    .addChoices({ name: "avertissements", value: "warn" }, { name: "timeouts", value: "timeout" },
      { name: "expulsions", value: "kick" }, { name: "bannissements", value: "ban" }, { name: "alcatraz", value: "alcatraz" }))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const type = i.options.getString("type");
    const rows = await listSanctions(i.guild.id, user.id, type, 20);
    if (!rows.length) return i.reply({ content: `Aucune sanction enregistrée pour **${user.tag}**.`, ...EPH });
    const labels = { warn: "Avertissement", timeout: "Timeout", kick: "Expulsion", ban: "Bannissement", alcatraz: "Alcatraz" };
    const body = rows.map((r) => `\`#${r.id}\` **${labels[r.type] ?? r.type}** — ${r.reason}\npar <@${r.moderator_id}> · ${ts(r.created_at)}`).join("\n\n");
    await i.reply({ embeds: [embed({ title: `Historique de ${user.tag} (${rows.length})`, color: COLORS.warning, description: body })], ...EPH });
  });

def(new SlashCommandBuilder().setName("delsanction").setDescription("Supprime une sanction par son numéro")
  .addIntegerOption((o) => o.setName("identifiant").setDescription("Numéro affiché par /historique").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const id = i.options.getInteger("identifiant");
    const ok = await deleteSanction(i.guild.id, id);
    await i.reply({ content: ok ? `Sanction \`#${id}\` supprimée.` : `Aucune sanction \`#${id}\`.`, ...EPH });
  });

def(new SlashCommandBuilder().setName("clearsanctions").setDescription("Efface toutes les sanctions d'un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const n = await clearSanctions(i.guild.id, user.id);
    await i.reply({ content: `${n} sanction(s) effacée(s) pour **${user.tag}**.`, ...EPH });
  });

def(new SlashCommandBuilder().setName("clear").setDescription("Supprime des messages récents")
  .addIntegerOption((o) => o.setName("nombre").setDescription("1 à 100").setRequired(true).setMinValue(1).setMaxValue(100))
  .addUserOption((o) => o.setName("membre").setDescription("Ne supprimer que ses messages"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString()),
  async (i) => {
    const amount = i.options.getInteger("nombre");
    const target = i.options.getUser("membre");
    await i.deferReply(EPH);
    const fetched = await i.channel.messages.fetch({ limit: 100 });
    const cutoff = Date.now() - 13.5 * 864e5;
    let pool = [...fetched.values()].filter((m) => m.createdTimestamp > cutoff && !m.pinned);
    if (target) pool = pool.filter((m) => m.author.id === target.id);
    const toDelete = pool.slice(0, amount);
    if (!toDelete.length) return i.editReply("Aucun message supprimable (les messages de plus de 14 jours et les épinglés sont ignorés).");
    const deleted = await i.channel.bulkDelete(toDelete, true);
    await i.editReply(`${deleted.size} message(s) supprimé(s).`);
    await log(i.guild, "messagePurge", embed({ title: "Purge", color: COLORS.neutral, fields: [
      { name: "Salon", value: `${i.channel}`, inline: true }, { name: "Quantité", value: `${deleted.size}`, inline: true },
      { name: "Modérateur", value: i.user.tag, inline: true }, ...(target ? [{ name: "Cible", value: target.tag, inline: true }] : [])] }));
  });

def(new SlashCommandBuilder().setName("slowmode").setDescription("Règle le mode lent du salon")
  .addIntegerOption((o) => o.setName("secondes").setDescription("0 pour désactiver").setRequired(true).setMinValue(0).setMaxValue(21600))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels.toString()),
  async (i) => {
    const s = i.options.getInteger("secondes");
    await i.channel.setRateLimitPerUser(s, i.user.tag);
    await i.reply({ content: s ? `Mode lent : ${s}s.` : "Mode lent désactivé.", ...EPH });
  });

def(new SlashCommandBuilder().setName("lock").setDescription("Verrouille ce salon")
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels.toString()),
  async (i) => {
    const reason = i.options.getString("raison") ?? "Non précisée";
    await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, { SendMessages: false });
    await i.reply({ embeds: [embed({ title: "Salon verrouillé", color: COLORS.danger, description: `Par ${i.user}.`, fields: [{ name: "Raison", value: reason }] })] });
  });

def(new SlashCommandBuilder().setName("unlock").setDescription("Déverrouille ce salon")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels.toString()),
  async (i) => {
    await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, { SendMessages: null });
    await i.reply({ embeds: [embed({ title: "Salon déverrouillé", color: COLORS.success })] });
  });

def(new SlashCommandBuilder().setName("lockdown").setDescription("Verrouille ou déverrouille TOUT le serveur (anti-raid)")
  .addStringOption((o) => o.setName("action").setDescription("Activer ou lever").setRequired(true)
    .addChoices({ name: "activer", value: "on" }, { name: "lever", value: "off" }))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator.toString()),
  async (i) => {
    const on = i.options.getString("action") === "on";
    const reason = i.options.getString("raison") ?? "Lockdown manuel";
    await i.deferReply();
    const n = await lockAllChannels(i.guild, on, `${i.user.tag} — ${reason}`);
    if (on) setLockdown(i.guild.id, 60); else clearLockdown(i.guild.id);
    await i.editReply({ embeds: [embed({ title: on ? "Serveur verrouillé" : "Serveur déverrouillé",
      color: on ? COLORS.danger : COLORS.success, description: `${n} salon(s) traité(s).`, fields: [{ name: "Raison", value: reason }] })] });
    await log(i.guild, "raid", embed({ title: on ? "Lockdown activé" : "Lockdown levé", color: on ? COLORS.danger : COLORS.success,
      fields: [{ name: "Par", value: i.user.tag, inline: true }, { name: "Salons", value: `${n}`, inline: true }, { name: "Raison", value: reason }] }));
  });

/* --------------------------------- ALCATRAZ ------------------------------- */

def(new SlashCommandBuilder().setName("alcatraz").setDescription("Envoie un membre en Alcatraz (retire tous ses rôles)")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison").setRequired(true))
  .addStringOption((o) => o.setName("duree").setDescription("Ex. 2h, 7d — vide = indéterminée"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const reason = i.options.getString("raison");
    const ms = parseDuration(i.options.getString("duree"));
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ content: "Membre introuvable.", ...EPH });
    const p = hierarchyCheck(i, member);
    if (p) return i.reply({ content: p, ...EPH });
    await i.deferReply();
    const r = await sendToJail(i.guild, member, i.user, reason, ms);
    if (!r.ok) return i.editReply(r.error);
    await tryDm(user, i.guild.name, "Alcatraz", reason, ms ? formatDuration(ms) : "Indéterminée");
    await i.editReply({ embeds: [embed({ title: "Alcatraz", color: COLORS.danger,
      description: `**${user.tag}** est enfermé. ${r.roles} rôle(s) mis de côté, restaurés à la libération.`,
      fields: [{ name: "Durée", value: ms ? formatDuration(ms) : "Indéterminée", inline: true }, { name: "Raison", value: reason }] })] });
  });

def(new SlashCommandBuilder().setName("liberer").setDescription("Libère un membre d'Alcatraz et restaure ses rôles")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const member = await i.guild.members.fetch(user.id).catch(() => null);
    if (!member) return i.reply({ content: "Membre introuvable.", ...EPH });
    await i.deferReply();
    const r = await releaseFromJail(i.guild, member, i.user.tag);
    await i.editReply(r.ok ? `**${user.tag}** est libéré. ${r.restored} rôle(s) restauré(s).` : r.error);
  });

/* ========================================================================== */
/*                                  TICKETS                                   */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("ticket").setDescription("Gestion des tickets")
  .addSubcommand((s) => s.setName("panel").setDescription("Publie le panneau de tickets")
    .addChannelOption((o) => o.setName("salon").setDescription("Salon cible (défaut : #tickets)").addChannelTypes(ChannelType.GuildText)))
  .addSubcommand((s) => s.setName("ajouter").setDescription("Ajoute un membre au ticket actuel")
    .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true)))
  .addSubcommand((s) => s.setName("retirer").setDescription("Retire un membre du ticket actuel")
    .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true)))
  .addSubcommand((s) => s.setName("renommer").setDescription("Renomme le ticket actuel")
    .addStringOption((o) => o.setName("nom").setDescription("Nouveau nom").setRequired(true)))
  .addSubcommand((s) => s.setName("stats").setDescription("Statistiques des tickets")),
  async (i) => {
    const sub = i.options.getSubcommand();
    const config = await getConfig(i.guild.id);

    if (sub === "panel") {
      if (!i.memberPermissions.has(PermissionFlagsBits.ManageGuild))
        return i.reply({ content: "Réservé aux gestionnaires du serveur.", ...EPH });
      const channel = i.options.getChannel("salon") ?? resolveFuncChannel(i.guild, "ticketPanel", config) ?? i.channel;
      const found = TICKET_TYPES.filter((t) => !!i.guild.channels.cache.find((c) => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes(t.categories[0].split("-")[1])));
      await channel.send({
        embeds: [embed({ title: "🎫 Centre d'aide — Naoya", color: COLORS.primary,
          description: "Choisis le type de ticket dans le menu ci-dessous. Un salon privé sera créé avec le staff concerné.\n\nLes tickets ouverts sans raison valable sont sanctionnés." })],
        components: ticketPanelComponents(),
      });
      return i.reply({ content: `Panneau publié dans ${channel}. Catégories détectées : ${found.length}/${TICKET_TYPES.length}.`, ...EPH });
    }

    const isTicket = /^ticket-/.test(i.channel.name);
    if (!isTicket && sub !== "stats") return i.reply({ content: "Cette commande s'utilise dans un salon de ticket.", ...EPH });

    if (sub === "ajouter") {
      const u = i.options.getUser("membre");
      await i.channel.permissionOverwrites.edit(u.id, { ViewChannel: true, SendMessages: true, ReadMessageHistory: true });
      return i.reply(`${u} a été ajouté au ticket.`);
    }
    if (sub === "retirer") {
      const u = i.options.getUser("membre");
      await i.channel.permissionOverwrites.delete(u.id).catch(() => null);
      return i.reply({ content: `${u.tag} a été retiré du ticket.`, ...EPH });
    }
    if (sub === "renommer") {
      const name = i.options.getString("nom").toLowerCase().replace(/[^a-z0-9-]/g, "-").slice(0, 90);
      await i.channel.setName(name);
      return i.reply({ content: `Ticket renommé en \`${name}\`.`, ...EPH });
    }
    if (sub === "stats") {
      const s = await ticketStats(i.guild.id);
      return i.reply({ embeds: [embed({ title: "Tickets", fields: [
        { name: "Ouverts", value: `${s.open}`, inline: true },
        { name: "7 jours", value: `${s.week}`, inline: true },
        { name: "Total", value: `${s.total}`, inline: true }] })], ...EPH });
    }
  });

/* ========================================================================== */
/*                                 GIVEAWAYS                                  */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("gw").setDescription("Giveaways")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents.toString())
  .addSubcommand((s) => s.setName("start").setDescription("Lance un giveaway")
    .addStringOption((o) => o.setName("prix").setDescription("Ce qui est à gagner").setRequired(true))
    .addStringOption((o) => o.setName("duree").setDescription("Ex. 30m, 6h, 2d").setRequired(true))
    .addIntegerOption((o) => o.setName("gagnants").setDescription("Nombre de gagnants").setMinValue(1).setMaxValue(20))
    .addRoleOption((o) => o.setName("role_requis").setDescription("Rôle obligatoire pour participer"))
    .addChannelOption((o) => o.setName("salon").setDescription("Salon du giveaway").addChannelTypes(ChannelType.GuildText)))
  .addSubcommand((s) => s.setName("end").setDescription("Termine un giveaway immédiatement")
    .addIntegerOption((o) => o.setName("id").setDescription("Identifiant du giveaway").setRequired(true)))
  .addSubcommand((s) => s.setName("reroll").setDescription("Retire un ou plusieurs gagnants")
    .addIntegerOption((o) => o.setName("id").setDescription("Identifiant").setRequired(true))
    .addIntegerOption((o) => o.setName("gagnants").setDescription("Combien").setMinValue(1).setMaxValue(20))),
  async (i) => {
    const sub = i.options.getSubcommand();

    if (sub === "start") {
      const prize = i.options.getString("prix");
      const ms = parseDuration(i.options.getString("duree"));
      if (!ms || ms < 60_000) return i.reply({ content: "Durée invalide (minimum 1 minute). Format : `30m`, `6h`, `2d`.", ...EPH });
      const winners = i.options.getInteger("gagnants") ?? 1;
      const role = i.options.getRole("role_requis");
      const channel = i.options.getChannel("salon") ?? i.channel;
      if (!canSend(channel)) return i.reply({ content: `Je ne peux pas écrire dans ${channel}.`, ...EPH });
      const id = await createGiveaway({ guildId: i.guild.id, channelId: channel.id, prize, winners,
        hostId: i.user.id, requiredRole: role?.id ?? null, endsAt: new Date(Date.now() + ms) });
      await postGiveaway(i.client, id, channel);
      return i.reply({ content: `Giveaway \`#${id}\` lancé dans ${channel}, fin dans ${formatDuration(ms)}.`, ...EPH });
    }

    const id = i.options.getInteger("id");
    const g = await getGiveaway(id);
    if (!g || g.guild_id !== i.guild.id) return i.reply({ content: "Giveaway introuvable.", ...EPH });

    if (sub === "end") {
      if (g.ended) return i.reply({ content: "Ce giveaway est déjà terminé.", ...EPH });
      await i.deferReply(EPH);
      const w = await drawGiveaway(i.client, g);
      return i.editReply(w.length ? `Terminé. Gagnant(s) : ${w.map((x) => `<@${x}>`).join(", ")}` : "Terminé, aucun participant.");
    }

    if (sub === "reroll") {
      await i.deferReply(EPH);
      const w = await drawGiveaway(i.client, g, i.options.getInteger("gagnants") ?? 1);
      return i.editReply(w.length ? `Nouveau tirage : ${w.map((x) => `<@${x}>`).join(", ")}` : "Aucun participant.");
    }
  });

/* ========================================================================== */
/*                                  ÉCONOMIE                                  */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("coins").setDescription("Ton solde de coins")
  .addUserOption((o) => o.setName("membre").setDescription("Voir le solde de quelqu'un")),
  async (i) => {
    const config = await getConfig(i.guild.id);
    if (!config.economy.enabled) return i.reply({ content: "L'économie est désactivée.", ...EPH });
    const user = i.options.getUser("membre") ?? i.user;
    const w = await getWallet(i.guild.id, user.id);
    await i.reply({ embeds: [embed({ title: `Solde de ${user.username}`,
      description: `## ${config.economy.currency} ${num(w.coins)}`,
      color: COLORS.gold, footer: w.streak ? `Série quotidienne : ${w.streak} jour(s)` : undefined })
      .setThumbnail(user.displayAvatarURL({ size: 128 }))] });
  });

def(new SlashCommandBuilder().setName("daily").setDescription("Récupère ta récompense quotidienne"),
  async (i) => {
    const config = await getConfig(i.guild.id);
    if (!config.economy.enabled) return i.reply({ content: "L'économie est désactivée.", ...EPH });
    const w = await getWallet(i.guild.id, i.user.id);
    const now = Date.now();
    const last = w.lastDaily ? new Date(w.lastDaily).getTime() : 0;
    if (now - last < 20 * 36e5) {
      return i.reply({ content: `Déjà récupéré. Reviens ${ts(last + 24 * 36e5)}.`, ...EPH });
    }
    const streak = now - last < 48 * 36e5 ? (w.streak ?? 0) + 1 : 1;
    const bonus = Math.min(streak, 10) * 25;
    const gain = config.economy.dailyAmount + bonus;
    const total = await addCoins(i.guild.id, i.user.id, gain);
    await stampEconomy(i.guild.id, i.user.id, "daily", new Date(), streak);
    await i.reply({ embeds: [embed({ title: "Récompense quotidienne", color: COLORS.gold,
      description: `Tu reçois **${config.economy.currency} ${num(gain)}**${bonus ? ` (dont ${num(bonus)} de série)` : ""}.\nNouveau solde : **${num(total)}**`,
      footer: `Série : ${streak} jour(s)` })] });
  });

def(new SlashCommandBuilder().setName("work").setDescription("Travaille pour gagner des coins"),
  async (i) => {
    const config = await getConfig(i.guild.id);
    if (!config.economy.enabled) return i.reply({ content: "L'économie est désactivée.", ...EPH });
    const w = await getWallet(i.guild.id, i.user.id);
    const last = w.lastWork ? new Date(w.lastWork).getTime() : 0;
    if (Date.now() - last < config.economy.workCooldownMs)
      return i.reply({ content: `Repose-toi un peu. Prochain travail ${ts(last + config.economy.workCooldownMs)}.`, ...EPH });
    const gain = config.economy.workMin + Math.floor(Math.random() * (config.economy.workMax - config.economy.workMin + 1));
    const total = await addCoins(i.guild.id, i.user.id, gain);
    await stampEconomy(i.guild.id, i.user.id, "work", new Date());
    const jobs = ["as modéré le chat", "as rangé les salons vocaux", "as animé un event", "as aidé un nouveau", "as trié les tickets"];
    await i.reply({ embeds: [embed({ title: "Travail terminé", color: COLORS.success,
      description: `Tu ${jobs[Math.floor(Math.random() * jobs.length)]} et gagnes **${config.economy.currency} ${num(gain)}**.\nSolde : **${num(total)}**` })] });
  });

def(new SlashCommandBuilder().setName("pay").setDescription("Donne des coins à un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Bénéficiaire").setRequired(true))
  .addIntegerOption((o) => o.setName("montant").setDescription("Combien").setRequired(true).setMinValue(1)),
  async (i) => {
    const config = await getConfig(i.guild.id);
    if (!config.economy.enabled) return i.reply({ content: "L'économie est désactivée.", ...EPH });
    const user = i.options.getUser("membre");
    const amount = i.options.getInteger("montant");
    if (user.id === i.user.id) return i.reply({ content: "Tu ne peux pas te payer toi-même.", ...EPH });
    if (user.bot) return i.reply({ content: "Les bots n'ont pas de portefeuille.", ...EPH });
    const w = await getWallet(i.guild.id, i.user.id);
    if (w.coins < amount) return i.reply({ content: `Solde insuffisant (${num(w.coins)}).`, ...EPH });
    await addCoins(i.guild.id, i.user.id, -amount);
    await addCoins(i.guild.id, user.id, amount);
    await i.reply(`${i.user} a envoyé **${config.economy.currency} ${num(amount)}** à ${user}.`);
    await log(i.guild, "coins", embed({ title: "Transfert de coins", color: COLORS.gold, fields: [
      { name: "De", value: i.user.tag, inline: true }, { name: "Vers", value: user.tag, inline: true },
      { name: "Montant", value: num(amount), inline: true }] }));
  });

def(new SlashCommandBuilder().setName("coins-admin").setDescription("Ajoute ou retire des coins")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))
  .addIntegerOption((o) => o.setName("montant").setDescription("Négatif pour retirer").setRequired(true))
  .addStringOption((o) => o.setName("raison").setDescription("Raison"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString()),
  async (i) => {
    const user = i.options.getUser("membre");
    const amount = i.options.getInteger("montant");
    const reason = i.options.getString("raison") ?? "Non précisée";
    const total = await addCoins(i.guild.id, user.id, amount);
    await i.reply({ content: `${amount >= 0 ? "+" : ""}${num(amount)} pour **${user.tag}**. Nouveau solde : ${num(total)}.`, ...EPH });
    await log(i.guild, "coins", embed({ title: "Ajustement de coins", color: COLORS.gold, fields: [
      { name: "Membre", value: user.tag, inline: true }, { name: "Montant", value: `${amount >= 0 ? "+" : ""}${num(amount)}`, inline: true },
      { name: "Par", value: i.user.tag, inline: true }, { name: "Raison", value: reason }] }));
  });

def(new SlashCommandBuilder().setName("top").setDescription("Classements du serveur")
  .addStringOption((o) => o.setName("categorie").setDescription("Quel classement").setRequired(true)
    .addChoices({ name: "niveaux", value: "xp" }, { name: "coins", value: "coins" }))
  .addIntegerOption((o) => o.setName("taille").setDescription("1 à 25").setMinValue(1).setMaxValue(25)),
  async (i) => {
    const cat = i.options.getString("categorie");
    const limit = i.options.getInteger("taille") ?? 10;
    const config = await getConfig(i.guild.id);
    const medals = ["🥇", "🥈", "🥉"];
    if (cat === "xp") {
      const rows = await topLevels(i.guild.id, limit);
      if (!rows.length) return i.reply({ content: "Personne n'a encore d'XP.", ...EPH });
      return i.reply({ embeds: [embed({ title: `Classement XP — ${i.guild.name}`,
        description: rows.map((r, n) => `${medals[n] ?? `**${n + 1}.**`} <@${r.userId}> — niveau **${r.level}** · ${num(r.xp)} XP`).join("\n") })] });
    }
    const rows = await topCoins(i.guild.id, limit);
    if (!rows.length) return i.reply({ content: "Personne n'a encore de coins.", ...EPH });
    return i.reply({ embeds: [embed({ title: `Classement coins — ${i.guild.name}`, color: COLORS.gold,
      description: rows.map((r, n) => `${medals[n] ?? `**${n + 1}.**`} <@${r.userId}> — ${config.economy.currency} **${num(r.coins)}**`).join("\n") })] });
  });

/* ========================================================================== */
/*                                  NIVEAUX                                   */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("rank").setDescription("Ton niveau et ton XP")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre")),
  async (i) => {
    const user = i.options.getUser("membre") ?? i.user;
    const { xp, level, rank } = await getUserLevel(i.guild.id, user.id);
    if (!xp) return i.reply({ content: `**${user.username}** n'a pas encore d'XP.`, ...EPH });
    const cur = xpForLevel(level), next = xpForLevel(level + 1);
    const p = Math.round(((xp - cur) / (next - cur)) * 20);
    await i.reply({ embeds: [embed({ title: `Niveau de ${user.username}`,
      description: `\`${"█".repeat(Math.max(0, p))}${"░".repeat(Math.max(0, 20 - p))}\`\n**${num(xp - cur)} / ${num(next - cur)}** XP vers le niveau ${level + 1}`,
      fields: [{ name: "Niveau", value: `${level}`, inline: true }, { name: "XP total", value: num(xp), inline: true },
        { name: "Classement", value: rank ? `#${rank}` : "—", inline: true }] })
      .setThumbnail(user.displayAvatarURL({ size: 128 }))] });
  });

/* ========================================================================== */
/*                                   STAFF                                    */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("absence").setDescription("Déclare une absence staff")
  .addStringOption((o) => o.setName("raison").setDescription("Motif").setRequired(true))
  .addStringOption((o) => o.setName("duree").setDescription("Ex. 3d, 2sem"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const reason = i.options.getString("raison");
    const ms = parseDuration(i.options.getString("duree"));
    const until = ms ? new Date(Date.now() + ms) : null;
    await addAbsence(i.guild.id, i.user.id, reason, until);
    const config = await getConfig(i.guild.id);
    const channel = resolveFuncChannel(i.guild, "absences", config);
    const e = embed({ title: "Absence déclarée", color: COLORS.neutral, fields: [
      { name: "Membre", value: `${i.user}`, inline: true },
      { name: "Retour", value: until ? ts(until) : "Non précisé", inline: true },
      { name: "Raison", value: reason }] });
    if (channel && canSend(channel)) await channel.send({ embeds: [e] });
    await i.reply({ content: channel ? `Absence enregistrée et publiée dans ${channel}.` : "Absence enregistrée.", ...EPH });
  });

def(new SlashCommandBuilder().setName("absences").setDescription("Liste les absences staff en cours")
  .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers.toString()),
  async (i) => {
    const rows = await listAbsences(i.guild.id);
    if (!rows.length) return i.reply({ content: "Aucune absence en cours.", ...EPH });
    await i.reply({ embeds: [embed({ title: `Absences en cours (${rows.length})`,
      description: rows.map((a) => `<@${a.user_id}> — ${a.reason}${a.until ? ` · retour ${ts(a.until)}` : ""}`).join("\n") })], ...EPH });
  });

def(new SlashCommandBuilder().setName("confession").setDescription("Envoie une confession anonyme"),
  async (i) => {
    const modal = new ModalBuilder().setCustomId("confession:modal").setTitle("Confession anonyme")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("text").setLabel("Ta confession").setStyle(TextInputStyle.Paragraph)
          .setMinLength(5).setMaxLength(1500).setRequired(true)));
    await i.showModal(modal);
  });

/* ========================================================================== */
/*                               UTILITAIRES                                  */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("ping").setDescription("État du bot"),
  async (i, { client }) => {
    const t = Date.now();
    await i.reply({ content: "…", ...EPH });
    await i.editReply({ content: null, embeds: [embed({ title: "0x — état", fields: [
      { name: "Aller-retour", value: `${Date.now() - t} ms`, inline: true },
      { name: "WebSocket", value: `${Math.round(client.ws.ping)} ms`, inline: true },
      { name: "Mémoire", value: `${Math.round(process.memoryUsage().rss / 1048576)} Mo`, inline: true },
      { name: "Base de données", value: usingDatabase() ? "PostgreSQL" : "Mémoire (non persistant)", inline: true },
      { name: "En ligne depuis", value: ts(Date.now() - client.uptime), inline: true },
      { name: "Lockdown", value: isLockdown(i.guild.id) ? "Actif" : "Inactif", inline: true }] })] });
  });

def(new SlashCommandBuilder().setName("userinfo").setDescription("Informations sur un membre")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre")),
  async (i) => {
    const user = i.options.getUser("membre") ?? i.user;
    const m = await i.guild.members.fetch(user.id).catch(() => null);
    const warns = await countSanctions(i.guild.id, user.id, "warn");
    const roles = m ? m.roles.cache.filter((r) => r.id !== i.guild.id).sort((a, b) => b.position - a.position)
      .map((r) => r.toString()).slice(0, 12).join(" ") || "Aucun" : "Aucun";
    await i.reply({ embeds: [embed({ title: user.tag, color: m?.displayColor || COLORS.primary, fields: [
      { name: "Identifiant", value: `\`${user.id}\``, inline: true },
      { name: "Compte créé", value: ts(user.createdAt), inline: true },
      ...(m ? [{ name: "A rejoint", value: ts(m.joinedAt), inline: true }] : []),
      ...(m?.communicationDisabledUntil && m.communicationDisabledUntil > new Date()
        ? [{ name: "Muet jusqu'à", value: ts(m.communicationDisabledUntil), inline: true }] : []),
      { name: "Avertissements", value: `${warns}`, inline: true },
      { name: `Rôles (${m ? m.roles.cache.size - 1 : 0})`, value: roles }] })
      .setThumbnail(user.displayAvatarURL({ size: 256 }))] });
  });

def(new SlashCommandBuilder().setName("serverinfo").setDescription("Statistiques du serveur"),
  async (i) => {
    const g = i.guild;
    const voice = g.channels.cache.filter((c) => c.type === ChannelType.GuildVoice).reduce((t, c) => t + c.members.size, 0);
    await i.reply({ embeds: [embed({ title: g.name, fields: [
      { name: "Membres", value: num(g.memberCount), inline: true },
      { name: "En vocal", value: `${voice}`, inline: true },
      { name: "Boosts", value: `${g.premiumSubscriptionCount ?? 0} (niveau ${g.premiumTier})`, inline: true },
      { name: "Salons", value: `${g.channels.cache.size}`, inline: true },
      { name: "Rôles", value: `${g.roles.cache.size}`, inline: true },
      { name: "Émojis", value: `${g.emojis.cache.size}`, inline: true },
      { name: "Créé le", value: ts(g.createdAt), inline: true },
      { name: "Propriétaire", value: `<@${g.ownerId}>`, inline: true },
      { name: "Vérification", value: `${g.verificationLevel}`, inline: true }] })
      .setThumbnail(g.iconURL({ size: 256 }))] });
  });

def(new SlashCommandBuilder().setName("avatar").setDescription("Avatar en grand")
  .addUserOption((o) => o.setName("membre").setDescription("Le membre")),
  async (i) => {
    const u = i.options.getUser("membre") ?? i.user;
    await i.reply({ embeds: [embed({ title: `Avatar de ${u.username}` }).setImage(u.displayAvatarURL({ size: 1024 }))] });
  });

def(new SlashCommandBuilder().setName("sondage").setDescription("Crée un sondage")
  .addStringOption((o) => o.setName("question").setDescription("La question").setRequired(true))
  .addStringOption((o) => o.setName("options").setDescription("Choix séparés par des virgules (2 à 10)").setRequired(true))
  .addChannelOption((o) => o.setName("salon").setDescription("Salon cible").addChannelTypes(ChannelType.GuildText))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString()),
  async (i) => {
    const q = i.options.getString("question");
    const opts = i.options.getString("options").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);
    if (opts.length < 2) return i.reply({ content: "Il faut au moins 2 choix séparés par des virgules.", ...EPH });
    const channel = i.options.getChannel("salon") ?? i.channel;
    const msg = await channel.send({ embeds: [embed({ title: q,
      description: opts.map((o, n) => `${POLL[n]} ${o}`).join("\n\n"), footer: `Sondage de ${i.user.tag}` })] });
    for (let n = 0; n < opts.length; n++) await msg.react(POLL[n]).catch(() => null);
    await i.reply({ content: `Sondage publié dans ${channel}.`, ...EPH });
  });

def(new SlashCommandBuilder().setName("say").setDescription("Fait parler le bot")
  .addStringOption((o) => o.setName("message").setDescription("Le texte (\\n pour un saut de ligne)").setRequired(true))
  .addChannelOption((o) => o.setName("salon").setDescription("Salon cible").addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement))
  .addBooleanOption((o) => o.setName("embed").setDescription("Envoyer en encadré"))
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages.toString()),
  async (i) => {
    const text = i.options.getString("message").replaceAll("\\n", "\n");
    const channel = i.options.getChannel("salon") ?? i.channel;
    const asEmbed = i.options.getBoolean("embed") ?? false;
    await channel.send(asEmbed ? { embeds: [embed({ description: text })] } : { content: text });
    await i.reply({ content: `Envoyé dans ${channel}.`, ...EPH });
  });

def(new SlashCommandBuilder().setName("panel").setDescription("Publie un panneau de rôles")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles.toString())
  .addSubcommand((s) => {
    s.setName("roles").setDescription("Menu de rôles à cocher")
      .addStringOption((o) => o.setName("titre").setDescription("Titre du menu").setRequired(true));
    for (let n = 1; n <= 8; n++) s.addRoleOption((o) => o.setName(`role${n}`).setDescription(`Rôle ${n}`).setRequired(n === 1));
    s.addChannelOption((o) => o.setName("salon").setDescription("Salon cible").addChannelTypes(ChannelType.GuildText));
    return s;
  }),
  async (i) => {
    const roles = [];
    for (let n = 1; n <= 8; n++) { const r = i.options.getRole(`role${n}`); if (r) roles.push(r); }
    const top = i.guild.members.me.roles.highest.position;
    const bad = roles.filter((r) => r.position >= top || r.managed);
    if (bad.length) return i.reply({ content: `Je ne peux pas gérer : ${bad.join(", ")} (au-dessus de mon rôle, ou géré par une intégration).`, ...EPH });
    const channel = i.options.getChannel("salon") ?? i.channel;
    const menu = new StringSelectMenuBuilder().setCustomId("rolemenu").setPlaceholder("Choisis tes rôles")
      .setMinValues(0).setMaxValues(roles.length)
      .addOptions(roles.map((r) => ({ label: r.name.slice(0, 100), value: r.id })));
    await channel.send({ embeds: [embed({ title: i.options.getString("titre"),
      description: "Sélectionne les rôles que tu veux. Désélectionne pour les retirer." })],
      components: [new ActionRowBuilder().addComponents(menu)] });
    await i.reply({ content: `Menu publié dans ${channel}.`, ...EPH });
  });

/* ========================================================================== */
/*                              CONFIGURATION                                 */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("logs").setDescription("Gestion des salons de logs")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand((s) => s.setName("map").setDescription("Montre quel salon reçoit quel type de log"))
  .addSubcommand((s) => s.setName("set").setDescription("Force un type de log vers un salon précis")
    .addStringOption((o) => o.setName("type").setDescription("Type de log").setRequired(true).setAutocomplete(true))
    .addChannelOption((o) => o.setName("salon").setDescription("Salon").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand((s) => s.setName("reset").setDescription("Revient à la détection automatique"))
  .addSubcommand((s) => s.setName("actif").setDescription("Active ou coupe tous les logs")
    .addBooleanOption((o) => o.setName("valeur").setDescription("Activer ?").setRequired(true)))
  .addSubcommand((s) => s.setName("scan").setDescription("Relance la détection des salons")),
  async (i) => {
    const sub = i.options.getSubcommand();
    const config = await getConfig(i.guild.id);

    if (sub === "map") {
      const keys = Object.keys(LOG_ROUTES);
      const lines = keys.map((k) => {
        const ch = resolveLogChannel(i.guild, k, config);
        const forced = config.logOverrides?.[k] ? " *" : "";
        return `\`${k}\`${forced} → ${ch ? `<#${ch.id}>` : "❌ non trouvé"}`;
      });
      const half = Math.ceil(lines.length / 2);
      await i.reply({ embeds: [embed({ title: "Routage des logs",
        description: "`*` = forcé manuellement. Les autres sont détectés par nom de salon.",
        fields: [
          { name: "Événements", value: lines.slice(0, half).join("\n"), inline: true },
          { name: "\u200b", value: lines.slice(half).join("\n"), inline: true },
        ] })], ...EPH });
      return;
    }

    if (sub === "set") {
      const type = i.options.getString("type");
      if (!LOG_ROUTES[type]) return i.reply({ content: "Type inconnu. Utilise l'autocomplétion.", ...EPH });
      await updateConfig(i.guild.id, { logOverrides: { ...config.logOverrides, [type]: i.options.getChannel("salon").id } });
      return i.reply({ content: `\`${type}\` envoyé vers ${i.options.getChannel("salon")}.`, ...EPH });
    }

    if (sub === "reset") {
      await updateConfig(i.guild.id, { logOverrides: {} });
      return i.reply({ content: "Retour à la détection automatique par nom de salon.", ...EPH });
    }

    if (sub === "actif") {
      const v = i.options.getBoolean("valeur");
      await updateConfig(i.guild.id, { logsEnabled: v });
      return i.reply({ content: `Logs ${v ? "activés" : "coupés"}.`, ...EPH });
    }

    if (sub === "scan") {
      const r = buildIndex(i.guild);
      const found = Object.keys(LOG_ROUTES).filter((k) => resolveLogChannel(i.guild, k, config)).length;
      return i.reply({ content: `Scan terminé : ${r.channels} salons, ${r.categories} catégories indexés. ${found}/${Object.keys(LOG_ROUTES).length} types de logs routés.`, ...EPH });
    }
  });

def(new SlashCommandBuilder().setName("config").setDescription("Configuration de 0x")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand((s) => s.setName("view").setDescription("Affiche la configuration"))
  .addSubcommand((s) => s.setName("staff").setDescription("Rôle staff (accès aux tickets)")
    .addRoleOption((o) => o.setName("role").setDescription("Le rôle").setRequired(true)))
  .addSubcommand((s) => s.setName("alcatraz").setDescription("Rôle prison")
    .addRoleOption((o) => o.setName("role").setDescription("Le rôle").setRequired(true)))
  .addSubcommand((s) => s.setName("autorole").setDescription("Rôle donné à l'arrivée")
    .addRoleOption((o) => o.setName("role").setDescription("Le rôle").setRequired(true)))
  .addSubcommand((s) => s.setName("bienvenue").setDescription("Message d'accueil")
    .addChannelOption((o) => o.setName("salon").setDescription("Salon").addChannelTypes(ChannelType.GuildText).setRequired(true))
    .addStringOption((o) => o.setName("message").setDescription("Variables : {user} {tag} {server} {count}")))
  .addSubcommand((s) => s.setName("niveaux").setDescription("Système d'XP")
    .addBooleanOption((o) => o.setName("actif").setDescription("Activer ?").setRequired(true))
    .addChannelOption((o) => o.setName("salon").setDescription("Salon des annonces").addChannelTypes(ChannelType.GuildText)))
  .addSubcommand((s) => s.setName("recompense").setDescription("Rôle offert à un niveau")
    .addIntegerOption((o) => o.setName("niveau").setDescription("Niveau requis").setRequired(true).setMinValue(1).setMaxValue(200))
    .addRoleOption((o) => o.setName("role").setDescription("Rôle à donner").setRequired(true)))
  .addSubcommand((s) => s.setName("economie").setDescription("Paramètres des coins")
    .addBooleanOption((o) => o.setName("actif").setDescription("Activer ?"))
    .addStringOption((o) => o.setName("symbole").setDescription("Emoji de la monnaie"))
    .addIntegerOption((o) => o.setName("quotidien").setDescription("Montant du /daily").setMinValue(0).setMaxValue(100000)))
  .addSubcommand((s) => s.setName("piege-vocal").setDescription("Salon vocal piège (JOIN=BAN)")
    .addChannelOption((o) => o.setName("salon").setDescription("Le vocal").addChannelTypes(ChannelType.GuildVoice).setRequired(true))
    .addStringOption((o) => o.setName("action").setDescription("Que faire").setRequired(true)
      .addChoices({ name: "désactivé", value: "off" }, { name: "expulser", value: "kick" }, { name: "bannir", value: "ban" })))
  .addSubcommand((s) => s.setName("reset").setDescription("Remet la configuration à zéro")),
  async (i) => {
    const sub = i.options.getSubcommand();
    const g = i.guild.id;
    const c = await getConfig(g);
    const show = (id, kind = "channel") => (id ? (kind === "role" ? `<@&${id}>` : `<#${id}>`) : "—");

    if (sub === "view") {
      const routed = Object.keys(LOG_ROUTES).filter((k) => resolveLogChannel(i.guild, k, c)).length;
      return i.reply({ embeds: [embed({ title: "Configuration de 0x", fields: [
        { name: "Rôle staff", value: show(c.staffRoleId, "role"), inline: true },
        { name: "Rôle Alcatraz", value: show(c.jailRoleId, "role"), inline: true },
        { name: "Autorole", value: show(c.autoroleId, "role"), inline: true },
        { name: "Bienvenue", value: show(c.welcomeChannelId), inline: true },
        { name: "Niveaux", value: c.levelsEnabled ? "Activés" : "Coupés", inline: true },
        { name: "Économie", value: c.economy.enabled ? `Activée (${c.economy.currency})` : "Coupée", inline: true },
        { name: "Logs", value: c.logsEnabled ? `Actifs — ${routed}/${Object.keys(LOG_ROUTES).length} routés` : "Coupés", inline: true },
        { name: "Piège vocal", value: c.trapVoiceId ? `${show(c.trapVoiceId)} → ${c.trapAction}` : "—", inline: true },
        { name: "Stockage", value: usingDatabase() ? "PostgreSQL" : "Mémoire", inline: true },
        { name: "Automod", value: c.automod.enabled
          ? `invit ${c.automod.antiInvite ? "on" : "off"} · liens ${c.automod.antiLink ? "on" : "off"} · flood ${c.automod.antiSpam ? `${c.automod.spamThreshold}/${Math.round(c.automod.spamWindowMs / 1000)}s` : "off"} · mentions ${c.automod.maxMentions || "∞"} · majuscules ${c.automod.capsPercent || "off"} · mots ${c.automod.bannedWords.length}`
          : "Coupé" },
        { name: "Anti-raid", value: c.antiraid.enabled
          ? `${c.antiraid.joinThreshold} arrivées / ${Math.round(c.antiraid.joinWindowMs / 1000)}s · comptes < ${c.antiraid.minAccountAgeDays}j signalés · réaction : ${c.antiraid.onRaid}`
          : "Coupé" },
        { name: "Anti-nuke", value: c.antinuke.enabled
          ? `salons ${c.antinuke.channelDeleteMax} · rôles ${c.antinuke.roleDeleteMax} · bans ${c.antinuke.banMax} / ${Math.round(c.antinuke.windowMs / 1000)}s · sanction : ${c.antinuke.punishment} · ${c.antinuke.whitelist.length} en liste blanche`
          : "Coupé" },
      ] })], ...EPH });
    }

    if (sub === "staff") { const r = i.options.getRole("role"); await updateConfig(g, { staffRoleId: r.id }); return i.reply({ content: `Rôle staff : ${r}.`, ...EPH }); }
    if (sub === "alcatraz") { const r = i.options.getRole("role"); await updateConfig(g, { jailRoleId: r.id }); return i.reply({ content: `Rôle Alcatraz : ${r}.`, ...EPH }); }
    if (sub === "autorole") {
      const r = i.options.getRole("role");
      if (r.position >= i.guild.members.me.roles.highest.position) return i.reply({ content: "Ce rôle est au-dessus du mien.", ...EPH });
      await updateConfig(g, { autoroleId: r.id });
      return i.reply({ content: `Autorole : ${r}.`, ...EPH });
    }
    if (sub === "bienvenue") {
      const ch = i.options.getChannel("salon"); const msg = i.options.getString("message");
      await updateConfig(g, { welcomeChannelId: ch.id, ...(msg ? { welcomeMessage: msg } : {}) });
      return i.reply({ content: `Accueil activé dans ${ch}.`, ...EPH });
    }
    if (sub === "niveaux") {
      const on = i.options.getBoolean("actif"); const ch = i.options.getChannel("salon");
      await updateConfig(g, { levelsEnabled: on, ...(ch ? { funcOverrides: { ...c.funcOverrides, levelUp: ch.id } } : {}) });
      return i.reply({ content: `Niveaux ${on ? "activés" : "coupés"}.`, ...EPH });
    }
    if (sub === "recompense") {
      const lvl = i.options.getInteger("niveau"); const r = i.options.getRole("role");
      if (r.position >= i.guild.members.me.roles.highest.position) return i.reply({ content: "Ce rôle est au-dessus du mien.", ...EPH });
      await updateConfig(g, { levelRewards: { ...c.levelRewards, [lvl]: r.id } });
      return i.reply({ content: `${r} sera donné au niveau ${lvl}.`, ...EPH });
    }
    if (sub === "economie") {
      const patch = {};
      const on = i.options.getBoolean("actif"); if (on !== null) patch.enabled = on;
      const sym = i.options.getString("symbole"); if (sym) patch.currency = sym.slice(0, 8);
      const d = i.options.getInteger("quotidien"); if (d !== null) patch.dailyAmount = d;
      if (!Object.keys(patch).length) return i.reply({ content: "Aucun paramètre fourni.", ...EPH });
      await updateConfig(g, { economy: patch });
      return i.reply({ content: "Économie mise à jour.", ...EPH });
    }
    if (sub === "piege-vocal") {
      const ch = i.options.getChannel("salon"); const action = i.options.getString("action");
      await updateConfig(g, { trapVoiceId: action === "off" ? null : ch.id, trapAction: action });
      return i.reply({ content: action === "off" ? "Piège vocal désactivé."
        : `⚠️ Toute personne rejoignant ${ch} sera **${action === "ban" ? "bannie" : "expulsée"}** automatiquement (le staff est exempté).`, ...EPH });
    }
    if (sub === "reset") { await updateConfig(g, structuredClone(DEFAULT_CONFIG)); return i.reply({ content: "Configuration remise à zéro.", ...EPH }); }
  });

def(new SlashCommandBuilder().setName("automod").setDescription("Filtres automatiques")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString())
  .addSubcommand((s) => s.setName("parametres").setDescription("Règle les filtres")
    .addBooleanOption((o) => o.setName("actif").setDescription("Automod global"))
    .addBooleanOption((o) => o.setName("anti_invitation").setDescription("Bloquer les invitations Discord"))
    .addBooleanOption((o) => o.setName("anti_lien").setDescription("Bloquer tous les liens"))
    .addBooleanOption((o) => o.setName("anti_spam").setDescription("Bloquer le flood"))
    .addIntegerOption((o) => o.setName("seuil_spam").setDescription("Messages avant sanction").setMinValue(3).setMaxValue(20))
    .addIntegerOption((o) => o.setName("fenetre_spam").setDescription("Fenêtre en secondes").setMinValue(3).setMaxValue(60))
    .addIntegerOption((o) => o.setName("max_mentions").setDescription("0 = illimité").setMinValue(0).setMaxValue(30))
    .addIntegerOption((o) => o.setName("majuscules").setDescription("% toléré, 0 = off").setMinValue(0).setMaxValue(100))
    .addIntegerOption((o) => o.setName("max_emojis").setDescription("0 = illimité").setMinValue(0).setMaxValue(50)))
  .addSubcommand((s) => s.setName("mot").setDescription("Liste des mots interdits")
    .addStringOption((o) => o.setName("action").setDescription("Action").setRequired(true)
      .addChoices({ name: "ajouter", value: "add" }, { name: "retirer", value: "remove" }, { name: "lister", value: "list" }))
    .addStringOption((o) => o.setName("mot").setDescription("Le mot (ou plusieurs séparés par des virgules)")))
  .addSubcommand((s) => s.setName("exemption").setDescription("Rôle exempté d'automod")
    .addRoleOption((o) => o.setName("role").setDescription("Le rôle").setRequired(true)))
  .addSubcommand((s) => s.setName("ignorer").setDescription("Salon ou catégorie ignoré")
    .addChannelOption((o) => o.setName("salon").setDescription("Salon ou catégorie").setRequired(true))),
  async (i) => {
    const sub = i.options.getSubcommand();
    const g = i.guild.id;
    const c = await getConfig(g);

    if (sub === "parametres") {
      const patch = {};
      const bools = { actif: "enabled", anti_invitation: "antiInvite", anti_lien: "antiLink", anti_spam: "antiSpam" };
      for (const [opt, key] of Object.entries(bools)) { const v = i.options.getBoolean(opt); if (v !== null) patch[key] = v; }
      const ints = { seuil_spam: "spamThreshold", max_mentions: "maxMentions", majuscules: "capsPercent", max_emojis: "maxEmojis" };
      for (const [opt, key] of Object.entries(ints)) { const v = i.options.getInteger(opt); if (v !== null) patch[key] = v; }
      const w = i.options.getInteger("fenetre_spam"); if (w !== null) patch.spamWindowMs = w * 1000;
      if (!Object.keys(patch).length) return i.reply({ content: "Aucun paramètre fourni. `/config view` pour voir l'état.", ...EPH });
      await updateConfig(g, { automod: patch });
      return i.reply({ content: "Automod mis à jour.", ...EPH });
    }

    if (sub === "mot") {
      const action = i.options.getString("action");
      const list = [...c.automod.bannedWords];
      if (action === "list")
        return i.reply({ content: list.length ? `${list.length} mot(s) :\n||${list.join(", ")}||` : "Aucun mot interdit.", ...EPH });
      const raw = i.options.getString("mot");
      if (!raw) return i.reply({ content: "Précise le mot avec l'option `mot`.", ...EPH });
      const words = raw.toLowerCase().split(",").map((w) => w.trim()).filter(Boolean);
      let n = 0;
      for (const w of words) {
        if (action === "add") { if (!list.includes(w)) { list.push(w); n++; } }
        else { const idx = list.indexOf(w); if (idx !== -1) { list.splice(idx, 1); n++; } }
      }
      await updateConfig(g, { automod: { bannedWords: list } });
      return i.reply({ content: `${n} mot(s) ${action === "add" ? "ajouté(s)" : "retiré(s)"}. Total : ${list.length}.`, ...EPH });
    }

    if (sub === "exemption") {
      const r = i.options.getRole("role");
      const list = [...c.automod.exemptRoles];
      const idx = list.indexOf(r.id);
      idx === -1 ? list.push(r.id) : list.splice(idx, 1);
      await updateConfig(g, { automod: { exemptRoles: list } });
      return i.reply({ content: `${r} ${idx === -1 ? "est exempté" : "n'est plus exempté"}.`, ...EPH });
    }

    if (sub === "ignorer") {
      const ch = i.options.getChannel("salon");
      const list = [...c.automod.ignoredChannels];
      const idx = list.indexOf(ch.id);
      idx === -1 ? list.push(ch.id) : list.splice(idx, 1);
      await updateConfig(g, { automod: { ignoredChannels: list } });
      return i.reply({ content: `${ch} ${idx === -1 ? "est ignoré" : "n'est plus ignoré"} par l'automod.`, ...EPH });
    }
  });

def(new SlashCommandBuilder().setName("protection").setDescription("Anti-raid et anti-nuke")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator.toString())
  .addSubcommand((s) => s.setName("antiraid").setDescription("Paramètres anti-raid")
    .addBooleanOption((o) => o.setName("actif").setDescription("Activer ?"))
    .addIntegerOption((o) => o.setName("seuil").setDescription("Arrivées simultanées déclenchant l'alerte").setMinValue(3).setMaxValue(50))
    .addIntegerOption((o) => o.setName("fenetre").setDescription("Fenêtre en secondes").setMinValue(5).setMaxValue(120))
    .addIntegerOption((o) => o.setName("age_min").setDescription("Âge minimum du compte en jours (0 = off)").setMinValue(0).setMaxValue(90))
    .addStringOption((o) => o.setName("reaction").setDescription("Que faire en cas de raid")
      .addChoices({ name: "verrouiller le serveur", value: "lockdown" }, { name: "expulser les arrivants", value: "kick" }, { name: "alerter seulement", value: "off" })))
  .addSubcommand((s) => s.setName("antinuke").setDescription("Paramètres anti-nuke")
    .addBooleanOption((o) => o.setName("actif").setDescription("Activer ?"))
    .addIntegerOption((o) => o.setName("suppr_salons").setDescription("Salons supprimés max").setMinValue(1).setMaxValue(20))
    .addIntegerOption((o) => o.setName("suppr_roles").setDescription("Rôles supprimés max").setMinValue(1).setMaxValue(20))
    .addIntegerOption((o) => o.setName("bans").setDescription("Bannissements max").setMinValue(1).setMaxValue(30))
    .addIntegerOption((o) => o.setName("fenetre").setDescription("Fenêtre en secondes").setMinValue(5).setMaxValue(120))
    .addStringOption((o) => o.setName("sanction").setDescription("Réaction")
      .addChoices({ name: "retirer tous les rôles", value: "strip" }, { name: "bannir", value: "ban" }, { name: "alerter seulement", value: "alert" })))
  .addSubcommand((s) => s.setName("whitelist").setDescription("Ajoute/retire quelqu'un de la liste blanche anti-nuke")
    .addUserOption((o) => o.setName("membre").setDescription("Le membre").setRequired(true))),
  async (i) => {
    const sub = i.options.getSubcommand();
    const g = i.guild.id;
    const c = await getConfig(g);

    if (sub === "antiraid") {
      const patch = {};
      const on = i.options.getBoolean("actif"); if (on !== null) patch.enabled = on;
      const seuil = i.options.getInteger("seuil"); if (seuil !== null) patch.joinThreshold = seuil;
      const f = i.options.getInteger("fenetre"); if (f !== null) patch.joinWindowMs = f * 1000;
      const age = i.options.getInteger("age_min"); if (age !== null) patch.minAccountAgeDays = age;
      const r = i.options.getString("reaction"); if (r) patch.onRaid = r;
      if (!Object.keys(patch).length) return i.reply({ content: "Aucun paramètre fourni.", ...EPH });
      await updateConfig(g, { antiraid: patch });
      return i.reply({ content: "Anti-raid mis à jour.", ...EPH });
    }

    if (sub === "antinuke") {
      const patch = {};
      const on = i.options.getBoolean("actif"); if (on !== null) patch.enabled = on;
      const cd = i.options.getInteger("suppr_salons"); if (cd !== null) patch.channelDeleteMax = cd;
      const rd = i.options.getInteger("suppr_roles"); if (rd !== null) patch.roleDeleteMax = rd;
      const b = i.options.getInteger("bans"); if (b !== null) patch.banMax = b;
      const f = i.options.getInteger("fenetre"); if (f !== null) patch.windowMs = f * 1000;
      const p = i.options.getString("sanction"); if (p) patch.punishment = p;
      if (!Object.keys(patch).length) return i.reply({ content: "Aucun paramètre fourni.", ...EPH });
      await updateConfig(g, { antinuke: patch });
      return i.reply({ content: "Anti-nuke mis à jour.", ...EPH });
    }

    if (sub === "whitelist") {
      const u = i.options.getUser("membre");
      const list = [...c.antinuke.whitelist];
      const idx = list.indexOf(u.id);
      idx === -1 ? list.push(u.id) : list.splice(idx, 1);
      await updateConfig(g, { antinuke: { whitelist: list } });
      return i.reply({ content: `**${u.tag}** ${idx === -1 ? "est en liste blanche" : "n'est plus en liste blanche"} anti-nuke.`, ...EPH });
    }
  });

def(new SlashCommandBuilder().setName("compteurs").setDescription("Force la mise à jour des compteurs vocaux")
  .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild.toString()),
  async (i) => {
    await i.deferReply(EPH);
    await updateCounters(i.guild);
    await i.editReply("Compteurs mis à jour. (Discord limite les renommages à 2 par 10 minutes et par salon.)");
  });

def(new SlashCommandBuilder().setName("help").setDescription("Toutes les commandes de 0x"),
  async (i) => {
    await i.reply({ embeds: [embed({ title: "0x — commandes", color: COLORS.primary, fields: [
      { name: "Modération", value: "`/ban` `/unban` `/kick` `/timeout` `/untimeout` `/warn` `/historique` `/delsanction` `/clearsanctions` `/clear` `/slowmode` `/lock` `/unlock`" },
      { name: "Protection", value: "`/lockdown` `/alcatraz` `/liberer` `/protection antiraid` `/protection antinuke` `/protection whitelist` `/automod`" },
      { name: "Tickets", value: "`/ticket panel` `/ticket ajouter` `/ticket retirer` `/ticket renommer` `/ticket stats`" },
      { name: "Communauté", value: "`/rank` `/top` `/coins` `/daily` `/work` `/pay` `/gw start` `/sondage` `/confession`" },
      { name: "Staff", value: "`/absence` `/absences` `/say` `/panel roles` `/coins-admin`" },
      { name: "Administration", value: "`/config view` `/logs map` `/logs set` `/logs scan` `/compteurs`" },
    ], footer: "Les commandes staff ne sont visibles que par les rôles autorisés." })], ...EPH });
  });

/* ------------------------------ AUTOCOMPLÉTION ---------------------------- */

async function handleAutocomplete(interaction) {
  if (interaction.commandName !== "logs") return;
  const focused = interaction.options.getFocused().toLowerCase();
  const choices = Object.keys(LOG_ROUTES)
    .filter((k) => k.toLowerCase().includes(focused))
    .slice(0, 25)
    .map((k) => ({ name: k, value: k }));
  await interaction.respond(choices).catch(() => null);
}

/* ========================================================================== */
/*                     6 — CLIENT, EVENEMENTS, DEMARRAGE                      */
/* ========================================================================== */

// index.js — client, événements, démarrage.


const TOKEN = process.env.DISCORD_TOKEN;
const CLIENT_ID = process.env.CLIENT_ID;
const GUILD_ID = process.env.GUILD_ID || null;

if (!TOKEN || !CLIENT_ID) {
  console.error("DISCORD_TOKEN et CLIENT_ID sont obligatoires (variables Railway).");
  process.exit(1);
}

const commandMap = new Map(commands.map((c) => [c.data.name, c]));

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildModeration,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildPresences,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildWebhooks,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember, Partials.User],
  allowedMentions: { parse: ["users", "roles"], repliedUser: false },
});

/* ============================== DÉPLOIEMENT =============================== */

async function deployCommands() {
  const rest = new REST({ version: "10" }).setToken(TOKEN);
  const body = commands.map((c) => c.data.toJSON());
  try {
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
      console.log(`[slash] ${body.length} commandes déployées sur ${GUILD_ID} (immédiat).`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
      console.log(`[slash] ${body.length} commandes déployées globalement (jusqu'à 1h de propagation).`);
    }
  } catch (e) {
    console.error("[slash] échec:", e.message);
  }
}

/* ================================= READY ================================== */

client.once(Events.ClientReady, async (c) => {
  console.log(`[0x] connecté : ${c.user.tag}`);
  await deployCommands();

  for (const guild of c.guilds.cache.values()) {
    const r = buildIndex(guild);
    console.log(`[index] ${guild.name} : ${r.channels} salons, ${r.categories} catégories`);
    try { await guild.members.fetch(); console.log(`[cache] ${guild.memberCount} membres en cache`); }
    catch { console.warn("[cache] fetch des membres impossible (intent manquant ?)"); }
    await updateCounters(guild).catch(() => null);
    await refreshTicketCounter(guild).catch(() => null);
  }

  const presence = () => {
    const total = c.guilds.cache.reduce((t, g) => t + g.memberCount, 0);
    c.user.setPresence({ activities: [{ name: `${num(total)} membres · /help`, type: ActivityType.Watching }], status: "online" });
  };
  presence();
  setInterval(presence, 10 * 60_000).unref();

  // Compteurs vocaux : 10 min (Discord limite les renommages à 2 / 10 min / salon)
  setInterval(() => { for (const g of c.guilds.cache.values()) updateCounters(g).catch(() => null); }, 10 * 60_000).unref();

  // Giveaways
  setInterval(() => tickGiveaways(c).catch(() => null), 20_000).unref();

  // Libérations automatiques d'Alcatraz
  setInterval(async () => {
    for (const row of await dueJail()) {
      const guild = c.guilds.cache.get(row.guild_id);
      if (!guild) continue;
      const member = await guild.members.fetch(row.user_id).catch(() => null);
      if (member) await releaseFromJail(guild, member, "Fin de peine").catch(() => null);
    }
  }, 60_000).unref();
});

/* ============================== INTERACTIONS ============================== */

client.on(Events.InteractionCreate, async (i) => {
  try {
    if (i.isAutocomplete()) return handleAutocomplete(i);

    if (i.isChatInputCommand()) {
      if (!i.inGuild()) return i.reply({ content: "Commande utilisable uniquement sur un serveur.", ...EPH });
      const cmd = commandMap.get(i.commandName);
      if (!cmd) return;
      return cmd.execute(i, { client });
    }

    if (i.isStringSelectMenu()) {
      if (i.customId === "ticket:pick") {
        await i.deferReply(EPH);
        return createTicket(i, i.values[0]);
      }
      if (i.customId === "rolemenu") return handleRoleMenu(i);
      return;
    }

    if (i.isButton()) {
      const [ns, action, arg] = i.customId.split(":");
      if (ns === "ticket") {
        if (action === "close") {
          if (!i.channel.name.startsWith("ticket-")) return;
          await i.reply({ content: "Fermeture dans 5 secondes…" });
          return closeTicket(i);
        }
        if (action === "claim") {
          await i.reply({ content: `${i.user} prend ce ticket en charge.` });
          return i.channel.setName(`✅-${i.channel.name}`.slice(0, 90)).catch(() => null);
        }
      }
      if (ns === "gw") return handleGiveawayButton(i, action, arg);
      return;
    }

    if (i.isModalSubmit() && i.customId === "confession:modal") {
      return postConfession(i, i.fields.getTextInputValue("text"));
    }
  } catch (err) {
    console.error("[interaction]", i.commandName ?? i.customId, err);
    const payload = { content: "Erreur pendant l'exécution. Vérifie mes permissions puis réessaie.", ...EPH };
    if (i.deferred || i.replied) await i.followUp(payload).catch(() => null);
    else await i.reply(payload).catch(() => null);
  }
});

async function handleRoleMenu(i) {
  await i.deferReply(EPH);
  const all = i.component.options.map((o) => o.value);
  const chosen = i.values;
  const top = i.guild.members.me.roles.highest.position;
  const added = [], removed = [];

  for (const id of all) {
    const role = i.guild.roles.cache.get(id);
    if (!role || role.position >= top || role.managed) continue;
    if (chosen.includes(id) && !i.member.roles.cache.has(id)) { await i.member.roles.add(id).catch(() => null); added.push(role.name); }
    else if (!chosen.includes(id) && i.member.roles.cache.has(id)) { await i.member.roles.remove(id).catch(() => null); removed.push(role.name); }
  }

  const lines = [];
  if (added.length) lines.push(`Ajouté : ${added.join(", ")}`);
  if (removed.length) lines.push(`Retiré : ${removed.join(", ")}`);
  await i.editReply(lines.join("\n") || "Aucun changement.");
}

/* ========================== ARRIVÉES ET DÉPARTS =========================== */

function fill(template, member) {
  return template
    .replaceAll("{user}", `<@${member.id}>`)
    .replaceAll("{tag}", member.user.tag)
    .replaceAll("{server}", member.guild.name)
    .replaceAll("{count}", num(member.guild.memberCount));
}

client.on(Events.GuildMemberAdd, async (member) => {
  const config = await getConfig(member.guild.id);

  const verdict = inspectJoin(member, config);

  if (verdict?.type === "raid") {
    const mode = config.antiraid.onRaid;
    await log(member.guild, "raid", embed({
      title: "⚠️ Vague d'arrivées détectée",
      color: COLORS.danger,
      description: `**${verdict.count}** arrivées en moins de ${Math.round(config.antiraid.joinWindowMs / 1000)}s.`,
      fields: [{ name: "Réaction", value: mode === "lockdown" ? `Verrouillage ${config.antiraid.lockdownMinutes} min` : mode === "kick" ? "Expulsion des arrivants" : "Alerte seulement" }],
    }));
    if (mode === "lockdown") {
      setLockdown(member.guild.id, config.antiraid.lockdownMinutes);
      await lockAllChannels(member.guild, true, "Anti-raid automatique").catch(() => null);
      setTimeout(() => lockAllChannels(member.guild, false, "Fin du lockdown anti-raid").catch(() => null),
        config.antiraid.lockdownMinutes * 60_000);
    }
  }

  if (verdict?.type === "young" || (isLockdown(member.guild.id) && config.antiraid.onRaid === "kick")) {
    await log(member.guild, "raid", embed({
      title: "Compte récent",
      color: COLORS.warning,
      fields: [
        { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
        { name: "Âge du compte", value: `${verdict?.ageDays ?? 0} jour(s)`, inline: true },
        { name: "Créé", value: ts(member.user.createdAt), inline: true },
      ],
    }));
    if (isLockdown(member.guild.id) && config.antiraid.onRaid === "kick" && member.kickable) {
      await member.kick("Anti-raid : arrivée pendant un raid").catch(() => null);
      return;
    }
  }

  if (config.autoroleId) await member.roles.add(config.autoroleId, "Autorole").catch(() => null);

  if (config.welcomeChannelId) {
    const ch = member.guild.channels.cache.get(config.welcomeChannelId);
    if (ch && canSend(ch)) {
      await ch.send({ embeds: [embed({ description: fill(config.welcomeMessage, member), color: COLORS.success })
        .setThumbnail(member.user.displayAvatarURL({ size: 128 }))] }).catch(() => null);
    }
  }

  await log(member.guild, "memberJoin", embed({
    title: "Arrivée",
    color: COLORS.success,
    fields: [
      { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
      { name: "Compte créé", value: ts(member.user.createdAt), inline: true },
      { name: "Total", value: num(member.guild.memberCount), inline: true },
    ],
  }));
});

client.on(Events.GuildMemberRemove, async (member) => {
  const kicker = await findExecutor(member.guild, "kick", member.id);
  if (kicker && !isWhitelisted(member.guild, kicker.id, await getConfig(member.guild.id))) {
    const config = await getConfig(member.guild.id);
    if (config.antinuke.enabled) {
      const t = trackNuke(member.guild, kicker.id, "kick", config);
      if (t.triggered) await punishNuke(member.guild, kicker, "expulsions en masse", t, config);
    }
  }

  await log(member.guild, "memberLeave", embed({
    title: kicker ? "Expulsion" : "Départ",
    color: kicker ? COLORS.warning : COLORS.neutral,
    fields: [
      { name: "Membre", value: `${member.user?.tag ?? "Inconnu"} (\`${member.id}\`)`, inline: true },
      { name: "Arrivé", value: member.joinedAt ? ts(member.joinedAt) : "—", inline: true },
      ...(kicker ? [{ name: "Par", value: kicker.tag, inline: true }] : []),
      { name: "Total", value: num(member.guild.memberCount), inline: true },
    ],
  }));
});

client.on(Events.GuildMemberUpdate, async (before, after) => {
  const addedRoles = after.roles.cache.filter((r) => !before.roles.cache.has(r.id));
  const removedRoles = before.roles.cache.filter((r) => !after.roles.cache.has(r.id));

  if (addedRoles.size || removedRoles.size) {
    await log(after.guild, addedRoles.size ? "memberRoles" : "rolesRemoved", embed({
      title: "Rôles modifiés",
      color: addedRoles.size ? COLORS.success : COLORS.warning,
      fields: [
        { name: "Membre", value: `${after.user.tag} (\`${after.id}\`)`, inline: true },
        ...(addedRoles.size ? [{ name: "Ajoutés", value: addedRoles.map((r) => r.toString()).join(" ") }] : []),
        ...(removedRoles.size ? [{ name: "Retirés", value: removedRoles.map((r) => r.toString()).join(" ") }] : []),
      ],
    }));
  }

  if (before.nickname !== after.nickname) {
    await log(after.guild, "memberUpdate", embed({
      title: "Pseudo modifié",
      color: COLORS.neutral,
      fields: [
        { name: "Membre", value: `${after.user.tag}`, inline: true },
        { name: "Avant", value: before.nickname ?? "—", inline: true },
        { name: "Après", value: after.nickname ?? "—", inline: true },
      ],
    }));
  }
});

/* ========================= MESSAGES : AUTOMOD + XP ======================== */

const xpCooldown = new Map();

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  const config = await getConfig(message.guild.id);

  const verdict = inspectMessage(message, config);
  if (verdict) {
    await message.delete().catch(() => null);

    if (verdict.timeoutMs && message.member?.moderatable) {
      await message.member.timeout(verdict.timeoutMs, `Automod : ${verdict.reason}`).catch(() => null);
      await addSanction(message.guild.id, message.author.id, client.user.id, "timeout", `Automod : ${verdict.reason}`, verdict.timeoutMs);
    }

    if (config.automod.warnOnDelete && canSend(message.channel)) {
      const notice = await message.channel.send(`${message.author}, message supprimé — ${verdict.reason.toLowerCase()}.`).catch(() => null);
      if (notice) setTimeout(() => notice.delete().catch(() => null), 6000);
    }

    await log(message.guild, verdict.route, embed({
      title: "Automod",
      color: COLORS.warning,
      fields: [
        { name: "Membre", value: `${message.author.tag} (\`${message.author.id}\`)`, inline: true },
        { name: "Salon", value: `${message.channel}`, inline: true },
        { name: "Motif", value: verdict.reason, inline: true },
        ...(verdict.timeoutMs ? [{ name: "Timeout", value: formatDuration(verdict.timeoutMs), inline: true }] : []),
        { name: "Contenu", value: (message.content || "—").slice(0, 1000) },
      ],
    }));
    return;
  }

  if (!config.levelsEnabled) return;
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  if (now - (xpCooldown.get(key) ?? 0) < 60_000) return;
  xpCooldown.set(key, now);

  const result = await addXp(message.guild.id, message.author.id, 15 + Math.floor(Math.random() * 11));
  if (!result?.leveledUp) return;

  const reward = config.levelRewards?.[String(result.level)];
  if (reward) await message.member?.roles.add(reward, `Niveau ${result.level}`).catch(() => null);

  const target = resolveFuncChannel(message.guild, "levelUp", config) ?? message.channel;
  if (canSend(target)) {
    await target.send(`${message.author} passe **niveau ${result.level}**${reward ? ` et débloque <@&${reward}>` : ""} !`).catch(() => null);
  }
});

client.on(Events.MessageDelete, async (message) => {
  if (!message.guild || message.author?.bot) return;
  if (!message.content && !message.attachments?.size) return;
  await log(message.guild, "messageDelete", embed({
    title: "Message supprimé",
    color: COLORS.danger,
    fields: [
      { name: "Auteur", value: message.author ? `${message.author.tag} (\`${message.author.id}\`)` : "Inconnu", inline: true },
      { name: "Salon", value: `${message.channel}`, inline: true },
      { name: "Contenu", value: (message.content || "*aucun texte*").slice(0, 1000) },
      ...(message.attachments?.size ? [{ name: "Pièces jointes", value: `${message.attachments.size}`, inline: true }] : []),
    ],
  }));
});

client.on(Events.MessageBulkDelete, async (messages) => {
  const first = messages.first();
  if (!first?.guild) return;
  await log(first.guild, "messagePurge", embed({
    title: "Suppression groupée",
    color: COLORS.danger,
    fields: [
      { name: "Salon", value: `${first.channel}`, inline: true },
      { name: "Messages", value: `${messages.size}`, inline: true },
    ],
  }));
});

client.on(Events.MessageUpdate, async (before, after) => {
  if (!after.guild || after.author?.bot) return;
  if (before.content === after.content) return;
  await log(after.guild, "messageEdit", embed({
    title: "Message modifié",
    color: COLORS.warning,
    fields: [
      { name: "Auteur", value: after.author?.tag ?? "Inconnu", inline: true },
      { name: "Salon", value: `${after.channel}`, inline: true },
      { name: "Avant", value: (before.content || "*inconnu*").slice(0, 500) },
      { name: "Après", value: (after.content || "—").slice(0, 500) },
      { name: "Lien", value: `[Aller au message](${after.url})` },
    ],
  }));
});

/* ================================= VOCAL ================================== */

client.on(Events.VoiceStateUpdate, async (before, after) => {
  const guild = after.guild ?? before.guild;
  const member = after.member ?? before.member;
  if (!guild || !member) return;
  const config = await getConfig(guild.id);

  // Piège vocal (JOIN = sanction)
  if (config.trapVoiceId && config.trapAction !== "off" && after.channelId === config.trapVoiceId && before.channelId !== after.channelId) {
    const staff = member.permissions.has(PermissionFlagsBits.ManageMessages) || member.id === guild.ownerId;
    if (!staff) {
      await member.voice.disconnect("Piège vocal").catch(() => null);
      const action = config.trapAction;
      if (action === "ban" && member.bannable) await member.ban({ reason: "Piège vocal — accès interdit" }).catch(() => null);
      else if (action === "kick" && member.kickable) await member.kick("Piège vocal — accès interdit").catch(() => null);
      await addSanction(guild.id, member.id, client.user.id, action, "Piège vocal");
      await log(guild, "sanction", embed({
        title: "Piège vocal déclenché",
        color: COLORS.danger,
        fields: [
          { name: "Membre", value: `${member.user.tag} (\`${member.id}\`)`, inline: true },
          { name: "Action", value: action === "ban" ? "Banni" : "Expulsé", inline: true },
        ],
      }));
      return;
    }
  }

  if (!before.channelId && after.channelId) {
    await log(guild, "voice", embed({ title: "Connexion vocale", color: COLORS.success, fields: [
      { name: "Membre", value: member.user.tag, inline: true }, { name: "Salon", value: `${after.channel}`, inline: true }] }));
  } else if (before.channelId && !after.channelId) {
    await log(guild, "voiceDisconnect", embed({ title: "Déconnexion vocale", color: COLORS.neutral, fields: [
      { name: "Membre", value: member.user.tag, inline: true }, { name: "Salon", value: `${before.channel}`, inline: true }] }));
  } else if (before.channelId !== after.channelId) {
    await log(guild, "voiceMove", embed({ title: "Déplacement vocal", color: COLORS.primary, fields: [
      { name: "Membre", value: member.user.tag, inline: true },
      { name: "De", value: `${before.channel}`, inline: true },
      { name: "Vers", value: `${after.channel}`, inline: true }] }));
  } else if (before.serverMute !== after.serverMute || before.serverDeaf !== after.serverDeaf) {
    await log(guild, "voiceMute", embed({ title: "Sourdine serveur", color: COLORS.warning, fields: [
      { name: "Membre", value: member.user.tag, inline: true },
      { name: "Micro", value: after.serverMute ? "coupé" : "rendu", inline: true },
      { name: "Casque", value: after.serverDeaf ? "coupé" : "rendu", inline: true }] }));
  }
});

/* ========================= ANTI-NUKE : STRUCTURE ========================== */

async function punishNuke(guild, executor, what, tracking, config) {
  const outcome = await neutralize(guild, executor.id, config, `Anti-nuke : ${what}`);
  await log(guild, "antinuke", embed({
    title: "🚨 ANTI-NUKE DÉCLENCHÉ",
    color: COLORS.danger,
    description: `**${executor.tag}** (\`${executor.id}\`) — ${what}`,
    fields: [
      { name: "Détecté", value: `${tracking.count} actions (seuil ${tracking.limit})`, inline: true },
      { name: "Sanction appliquée", value: outcome, inline: true },
    ],
  }));
}

async function guardStructure(guild, kind, targetId, label) {
  const config = await getConfig(guild.id);
  if (!config.antinuke.enabled) return;
  const executor = await findExecutor(guild, kind, targetId);
  if (!executor || isWhitelisted(guild, executor.id, config)) return { executor };
  if (!["channelDelete", "roleDelete", "ban", "kick"].includes(kind)) return { executor };
  const t = trackNuke(guild, executor.id, kind, config);
  if (t.triggered) await punishNuke(guild, executor, label, t, config);
  return { executor };
}

client.on(Events.ChannelCreate, async (channel) => {
  if (!channel.guild) return;
  buildIndex(channel.guild);
  const r = await guardStructure(channel.guild, "channelCreate", channel.id, "créations de salons");
  await log(channel.guild, "channelCreate", embed({ title: "Salon créé", color: COLORS.success, fields: [
    { name: "Salon", value: `${channel} (\`${channel.name}\`)`, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.ChannelDelete, async (channel) => {
  if (!channel.guild) return;
  buildIndex(channel.guild);
  const r = await guardStructure(channel.guild, "channelDelete", channel.id, "suppressions de salons");
  await log(channel.guild, "channelDelete", embed({ title: "Salon supprimé", color: COLORS.danger, fields: [
    { name: "Salon", value: `\`${channel.name}\``, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.ChannelUpdate, async (before, after) => {
  if (!after.guild) return;
  if (before.name !== after.name) buildIndex(after.guild);
  const changes = [];
  if (before.name !== after.name) changes.push({ name: "Nom", value: `${before.name} → ${after.name}` });
  if (before.topic !== after.topic) changes.push({ name: "Sujet", value: `${(before.topic ?? "—").slice(0, 200)} → ${(after.topic ?? "—").slice(0, 200)}` });
  if (before.rateLimitPerUser !== after.rateLimitPerUser) changes.push({ name: "Mode lent", value: `${before.rateLimitPerUser}s → ${after.rateLimitPerUser}s` });
  if (before.permissionOverwrites?.cache.size !== after.permissionOverwrites?.cache.size) {
    await log(after.guild, "permissions", embed({ title: "Permissions modifiées", color: COLORS.warning, fields: [
      { name: "Salon", value: `${after}`, inline: true },
      { name: "Règles", value: `${before.permissionOverwrites.cache.size} → ${after.permissionOverwrites.cache.size}`, inline: true }] }));
  }
  if (!changes.length) return;
  await log(after.guild, "channelUpdate", embed({ title: "Salon modifié", color: COLORS.warning,
    fields: [{ name: "Salon", value: `${after}`, inline: true }, ...changes] }));
});

client.on(Events.GuildRoleCreate, async (role) => {
  const r = await guardStructure(role.guild, "roleCreate", role.id, "créations de rôles");
  await log(role.guild, "roleCreate", embed({ title: "Rôle créé", color: COLORS.success, fields: [
    { name: "Rôle", value: `${role} (\`${role.name}\`)`, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.GuildRoleDelete, async (role) => {
  const r = await guardStructure(role.guild, "roleDelete", role.id, "suppressions de rôles");
  await log(role.guild, "roleDelete", embed({ title: "Rôle supprimé", color: COLORS.danger, fields: [
    { name: "Rôle", value: `\`${role.name}\``, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.GuildRoleUpdate, async (before, after) => {
  const changes = [];
  if (before.name !== after.name) changes.push({ name: "Nom", value: `${before.name} → ${after.name}` });
  if (before.color !== after.color) changes.push({ name: "Couleur", value: `${before.hexColor} → ${after.hexColor}` });
  if (before.permissions.bitfield !== after.permissions.bitfield) {
    const gained = after.permissions.toArray().filter((p) => !before.permissions.has(p));
    const lost = before.permissions.toArray().filter((p) => !after.permissions.has(p));
    if (gained.length) changes.push({ name: "Permissions gagnées", value: gained.join(", ").slice(0, 900) });
    if (lost.length) changes.push({ name: "Permissions perdues", value: lost.join(", ").slice(0, 900) });
  }
  if (!changes.length) return;
  await log(after.guild, "roleUpdate", embed({ title: "Rôle modifié", color: COLORS.warning,
    fields: [{ name: "Rôle", value: `${after}`, inline: true }, ...changes] }));
});

client.on(Events.GuildBanAdd, async (ban) => {
  const r = await guardStructure(ban.guild, "ban", ban.user.id, "bannissements en masse");
  await log(ban.guild, "ban", embed({ title: "Bannissement", color: COLORS.danger, fields: [
    { name: "Membre", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true },
    { name: "Raison", value: ban.reason ?? "Non précisée" }] }));
});

client.on(Events.GuildBanRemove, async (ban) => {
  await log(ban.guild, "ban", embed({ title: "Débannissement", color: COLORS.success,
    fields: [{ name: "Membre", value: `${ban.user.tag} (\`${ban.user.id}\`)`, inline: true }] }));
});

client.on(Events.GuildUpdate, async (before, after) => {
  const changes = [];
  if (before.name !== after.name) changes.push({ name: "Nom", value: `${before.name} → ${after.name}` });
  if (before.icon !== after.icon) changes.push({ name: "Icône", value: "modifiée" });
  if (before.vanityURLCode !== after.vanityURLCode) changes.push({ name: "URL personnalisée", value: `${before.vanityURLCode ?? "—"} → ${after.vanityURLCode ?? "—"}` });
  if (before.verificationLevel !== after.verificationLevel) changes.push({ name: "Vérification", value: `${before.verificationLevel} → ${after.verificationLevel}` });
  if (!changes.length) return;
  await log(after, "guildUpdate", embed({ title: "Serveur modifié", color: COLORS.warning, fields: changes }));
});

client.on(Events.WebhooksUpdate, async (channel) => {
  const executor = await findExecutor(channel.guild, "webhook");
  await log(channel.guild, "webhook", embed({ title: "Webhook modifié", color: COLORS.warning, fields: [
    { name: "Salon", value: `${channel}`, inline: true },
    { name: "Par", value: executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.ThreadCreate, async (thread) => {
  await log(thread.guild, "thread", embed({ title: "Fil créé", color: COLORS.success, fields: [
    { name: "Fil", value: `${thread}`, inline: true },
    { name: "Salon parent", value: `${thread.parent}`, inline: true }] }));
});

client.on(Events.ThreadDelete, async (thread) => {
  await log(thread.guild, "thread", embed({ title: "Fil supprimé", color: COLORS.danger,
    fields: [{ name: "Fil", value: `\`${thread.name}\``, inline: true }] }));
});

client.on(Events.InviteCreate, async (invite) => {
  await log(invite.guild, "invite", embed({ title: "Invitation créée", color: COLORS.primary, fields: [
    { name: "Code", value: `\`${invite.code}\``, inline: true },
    { name: "Par", value: invite.inviter?.tag ?? "Inconnu", inline: true },
    { name: "Salon", value: `${invite.channel}`, inline: true },
    { name: "Expiration", value: invite.expiresAt ? ts(invite.expiresAt) : "Jamais", inline: true },
    { name: "Utilisations max", value: invite.maxUses ? `${invite.maxUses}` : "Illimité", inline: true }] }));
});

client.on(Events.GuildCreate, (guild) => { buildIndex(guild); });

/* =============================== ROBUSTESSE =============================== */

process.on("unhandledRejection", (e) => console.error("[unhandledRejection]", e));
process.on("uncaughtException", (e) => console.error("[uncaughtException]", e));
for (const sig of ["SIGINT", "SIGTERM"]) {
  process.on(sig, () => { console.log(`[0x] arrêt (${sig})`); client.destroy(); process.exit(0); });
}

if (process.env.PORT) {
  createServer((_, res) => {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: client.isReady() ? "ok" : "starting", guilds: client.guilds.cache.size }));
  }).listen(process.env.PORT, () => console.log(`[http] santé sur ${process.env.PORT}`));
}

await initDatabase();
await client.login(TOKEN);
