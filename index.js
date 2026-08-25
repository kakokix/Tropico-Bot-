// =============================================================================
//   0x  —  BOT DE GESTION DU SERVEUR NAOYA
//   Fichier unique. Second fichier nécessaire : package.json
// =============================================================================
//
//   VERROU PROPRIETAIRE
//     Toute la configuration de 0x est reservee a l'identifiant
//        840997886162108416
//     Sections verrouillees : Configuration, Automod, Protection, Permissions,
//     Niveaux, Economie, Compteurs, et /logs (sauf la consultation).
//     Ni un administrateur, ni le proprietaire du serveur ne peut y toucher.
//     Le staff garde Moderation, Publications, Tickets et Giveaways selon
//     son niveau de perm.
//     Pour changer de proprietaire : variable Railway OWNER_ID.
//
//   MISE EN ROUTE : UN SEUL BOUTON
//     Tape /panel puis appuie sur "Tout installer". Il indexe les salons,
//     classe les roles staff par niveau, branche les trois compteurs vocaux,
//     cree le role Alcatraz s'il manque, repere le salon de bienvenue et
//     celui des colis, verifie les categories de tickets et les permissions,
//     puis active automod + anti-raid + anti-nuke + journaux + niveaux +
//     economie avec des reglages calibres pour un tres gros serveur.
//     "Publier les panneaux" pose ensuite les boutons pour les membres.
//     Les six interrupteurs principaux sont directement sur l'accueil.
//
//   APPUI LONG = RACCOURCIS (menus contextuels, pas de commandes en plus)
//     Sur un membre  : "Fiche de moderation", "Ses invitations"
//     Sur un message : "Supprimer et avertir", "Purger jusqu'ici"
//
//   APPUI LONG = RACCOURCIS (menus contextuels, pas de commandes en plus)
//     Sur un membre  : "Fiche de moderation", "Ses invitations"
//     Sur un message : "Supprimer et avertir", "Purger jusqu'ici"
//
//   APPUI LONG = RACCOURCIS (menus contextuels, pas de commandes en plus)
//     Sur un membre  : "Fiche de moderation", "Ses invitations"
//     Sur un message : "Supprimer et avertir", "Purger jusqu'ici"
//
//   TROIS COMMANDES, TOUT LE RESTE AU DOIGT
//     /panel   le panneau de contrôle — il ouvre sur la liste de ce qu'il
//              reste à régler, puis chaque section se pilote au bouton
//     /help    mode d'emploi, adapté à ton niveau de permission
//     /logs    routage des journaux (map / scan / set / reset / actif)
//
//   LES MEMBRES NE TAPENT AUCUNE COMMANDE
//     /panel → Publications publie des panneaux à boutons dans tes salons :
//       · Espace membre  : niveau, solde, quotidien, travail, classements,
//                          boutique, envoi de coins
//       · Tickets        : menu des 6 catégories
//       · Confessions    : bouton anonyme
//       · Menu de rôles  : rôles à cocher
//
//   INSTALLATION
//   1) discord.com/developers → Bot → ACTIVER LES TROIS INTENTS :
//        Server Members · Message Content · Presence
//        (sans Presence, le compteur "Connectés" reste vide)
//   2) GitHub : package.json + index.js
//   3) Railway : DISCORD_TOKEN · CLIENT_ID · GUILD_ID
//                DATABASE_URL = ${{Postgres.DATABASE_URL}}
//                Settings → Builder → Railpack
//   4) Invitation, Administrateur (l'anti-nuke lit les logs d'audit) :
//      discord.com/oauth2/authorize?client_id=TON_ID&scope=bot+applications.commands&permissions=8
//      Puis Paramètres du serveur → Rôles → 0x tout en haut.
//   5) Tape /panel. Il te dit tout ce qui reste à faire, dans l'ordre.
//
//   NIVEAUX DE PERMISSION (0 à 6)
//     0 Membre · 1 Helper/Animateur · 2 Modérateur · 3 Modérateur+/Juge
//     4 Gestion · 5 Administrateur · 6 Owner/Couronne
//     Panneau → Permissions → Détection automatique classe tes rôles seul.
//     Un modérateur ne peut jamais viser un niveau égal ou supérieur au sien.
//
//   COMPTEURS VOCAUX (salons verrouillés)
//     Membres   humains uniquement, bots exclus
//     Connectés humains non hors-ligne
//     Vocal     humains en vocal, lu sur les états vocaux et non sur le cache
//     Détection par le motif "Nom :" — sinon Panneau → Compteurs.
//     Discord limite les renommages à 2 par 10 min et par salon.
// =============================================================================

import {
  ActionRowBuilder,
  ApplicationCommandType,
  ContextMenuCommandBuilder,
  ActivityType,
  AuditLogEvent,
  ButtonBuilder,
  ButtonStyle,
  ChannelSelectMenuBuilder,
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
  RoleSelectMenuBuilder,
  Routes,
  SlashCommandBuilder,
  StringSelectMenuBuilder,
  TextInputBuilder,
  TextInputStyle,
  UserSelectMenuBuilder,
} from "discord.js";
import { createServer } from "node:http";
import pg from "pg";


/* ========================================================================== */
/*             1 - CONSTANTES, PROPRIETAIRE, DETECTION DES SALONS             */
/* ========================================================================== */

// core.js — constantes, résolution automatique des salons, helpers.


const BRAND = "0x • Naoya";

/**
 * Propriétaire de 0x — la SEULE personne autorisée à modifier la configuration.
 * Modifiable sans toucher au code via la variable Railway OWNER_ID.
 */
const OWNER_ID = process.env.OWNER_ID || "840997886162108416";
const isOwner = (id) => id === OWNER_ID;

const ICONS = {
  ban: "\u26D4", kick: "\uD83D\uDC62", timeout: "\uD83D\uDD07", warn: "\u26A0\uFE0F", jail: "\uD83E\uDD1A",
  ok: "\u2705", no: "\u274C", info: "\u2139\uFE0F", coin: "\uD83E\uDE99", level: "\uD83D\uDCC8",
  ticket: "\uD83C\uDFAB", gift: "\uD83C\uDF81", shield: "\uD83D\uDEE1\uFE0F", alert: "\uD83D\uDEA8",
};

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
  invites: ["invitations", "bienvenue", "welcome"],
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

function embed({ title, description, color = COLORS.primary, fields = [], footer, thumb, image, author, guild } = {}) {
  const e = new EmbedBuilder().setColor(color).setTimestamp();
  if (title) e.setTitle(title.slice(0, 256));
  if (description) e.setDescription(description.slice(0, 4000));
  if (fields.length) e.addFields(fields.slice(0, 25).map((f) => ({ ...f, value: String(f.value).slice(0, 1024) || "—" })));
  if (author) e.setAuthor(author);
  if (guild) e.setFooter({ text: footer ? `${footer} • ${BRAND}` : BRAND, iconURL: guild.iconURL({ size: 64 }) ?? undefined });
  else if (footer) e.setFooter({ text: footer.slice(0, 2048) });
  if (thumb) e.setThumbnail(thumb);
  if (image) e.setImage(image);
  return e;
}

const BAR_FULL = "▰";
const BAR_EMPTY = "▱";

/** Barre de progression compacte. */
function bar(current, total, size = 12) {
  const ratio = total > 0 ? Math.min(1, Math.max(0, current / total)) : 0;
  const filled = Math.round(ratio * size);
  return `${BAR_FULL.repeat(filled)}${BAR_EMPTY.repeat(size - filled)} \`${Math.round(ratio * 100)}%\``;
}

/** Encadré de sanction, mise en forme commune. */
function actionEmbed({ icon, action, target, moderator, reason, extra = [], color, guild }) {
  return embed({
    guild,
    color,
    author: { name: `${icon}  ${action}` },
    description: `**${target.tag ?? target.user?.tag ?? target}**\n\`${target.id ?? "—"}\``,
    fields: [
      ...extra,
      { name: "Modérateur", value: moderator ? `<@${moderator.id}>` : "—", inline: true },
      { name: "Raison", value: reason || "Non précisée" },
    ],
  });
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
/*                         2 - NIVEAUX DE PERMISSION                          */
/* ========================================================================== */

// perms.js — système de permissions par niveau (perm 0 → 6).


const PERM_LABELS = {
  7: "Propriétaire de 0x",
  0: "Membre",
  1: "Perm 1 — Helper / Animateur",
  2: "Perm 2 — Modérateur",
  3: "Perm 3 — Modérateur+ / Juge",
  4: "Perm 4 — Gestion",
  5: "Perm 5 — Administrateur",
  6: "Perm 6 — Owner / Couronne",
};

/** Niveau requis par défaut pour chaque commande (ou "commande sous-commande"). */
const DEFAULT_COMMAND_LEVELS = {
  // Niveau 0 — tout le monde
  ping: 0, help: 0, rank: 0, top: 0, coins: 0, daily: 0, work: 0, pay: 0,
  userinfo: 0, serverinfo: 0, avatar: 0, confession: 0, boutique: 0, acheter: 0,

  // Niveau 1 — helpers, animateurs
  sondage: 1, clear: 1, warn: 1, historique: 1,
  "ticket ajouter": 1, "ticket retirer": 1, "ticket renommer": 1,

  // Niveau 2 — modérateurs
  timeout: 2, untimeout: 2, kick: 2, slowmode: 2, lock: 2, unlock: 2,
  alcatraz: 2, liberer: 2, "ticket stats": 2,

  // Niveau 3 — modérateurs+ / juges
  ban: 3, unban: 3, delsanction: 3, absence: 3, absences: 3, say: 3, drop: 3,

  // Niveau 4 — gestion
  gw: 4, panel: 4, "coins-admin": 4, clearsanctions: 4, "ticket panel": 4, compteurs: 4,

  // Niveau 5 — administration
  config: 5, automod: 5, logs: 5,

  // Niveau 6 — owners uniquement
  protection: 6, lockdown: 6, perms: 6,
};

/** Motifs de noms de rôles → niveau, pour la détection automatique. */
const AUTO_PATTERNS = [
  { level: 6, re: /\b(owner|fondateur|fondatrice|couronne|proprietaire|propriétaire)\b/i },
  { level: 5, re: /\b(admin|administrateur|administratrice|direction)\b/i },
  { level: 4, re: /\b(gestion|gestionnaire|responsable|resp\b|head|manager)\b/i },
  { level: 3, re: /\b(juge|tribunal|mod[eé]rateur\+|modo\+|superviseur|community)\b/i },
  { level: 2, re: /\b(mod[eé]rateur|mod[eé]ratrice|modo|moderation|modération)\b/i },
  { level: 1, re: /\b(helper|animateur|animatrice|anim\b|staff|support|assistant)\b/i },
];

/** Niveau effectif d'un membre. */
function permLevel(member, config) {
  if (!member?.guild) return 0;
  if (isOwner(member.id)) return 7;           // au-dessus de tout, intouchable
  if (member.id === member.guild.ownerId) return 6;

  const override = config?.perms?.users?.[member.id];
  if (override !== undefined) return Number(override);

  let level = member.permissions.has(PermissionFlagsBits.Administrator) ? 5 : 0;
  const roles = config?.perms?.roles ?? {};
  for (const [roleId, lvl] of Object.entries(roles)) {
    if (member.roles.cache.has(roleId) && Number(lvl) > level) level = Number(lvl);
  }
  return level;
}

/** Niveau requis pour une commande (la sous-commande est prioritaire). */
function requiredLevel(commandName, sub, config) {
  const custom = config?.perms?.commands ?? {};
  const key = sub ? `${commandName} ${sub}` : commandName;
  if (custom[key] !== undefined) return Number(custom[key]);
  if (custom[commandName] !== undefined) return Number(custom[commandName]);
  if (DEFAULT_COMMAND_LEVELS[key] !== undefined) return DEFAULT_COMMAND_LEVELS[key];
  if (DEFAULT_COMMAND_LEVELS[commandName] !== undefined) return DEFAULT_COMMAND_LEVELS[commandName];
  return 0;
}

/** Détecte les rôles staff par leur nom et propose un tableau de perms. */
function autoDetectRoles(guild) {
  const found = [];
  for (const role of guild.roles.cache.values()) {
    if (role.id === guild.id || role.managed) continue;
    for (const p of AUTO_PATTERNS) {
      if (p.re.test(role.name)) { found.push({ role, level: p.level }); break; }
    }
  }
  // Un rôle plus haut dans la hiérarchie ne peut pas avoir un niveau plus bas
  found.sort((a, b) => b.role.position - a.role.position);
  let ceiling = 6;
  for (const f of found) { f.level = Math.min(f.level, ceiling); ceiling = f.level; }
  return found.sort((a, b) => b.level - a.level || b.role.position - a.role.position);
}

/** Vérifie qu'un modérateur peut agir sur une cible selon les perms. */
function canActOn(actorLevel, targetMember, config) {
  const targetLevel = permLevel(targetMember, config);
  return actorLevel > targetLevel;
}

/* ========================================================================== */
/*                    3 - STOCKAGE (POSTGRESQL / MEMOIRE)                     */
/* ========================================================================== */

// db.js — PostgreSQL avec repli mémoire.


const { Pool } = pg;

const DEFAULT_CONFIG = {
  logsEnabled: true,
  logOverrides: {},
  funcOverrides: {},

  // Salons compteurs forcés (sinon détection par motif "Nom :")
  counters: { members: null, online: null, voice: null },

  // Système de perms : rôle → niveau, membre → niveau, commande → niveau requis
  perms: { roles: {}, users: {}, commands: {} },

  autoroleId: null,
  trustedRoleId: null,   // rôle « Like » — accès aux réglages non destructifs
  invites: { enabled: true, channelId: null, deleteAfterMs: 120_000, baseline: {} },
  welcomeChannelId: null,
  welcomeMessage: "Bienvenue {user} sur **{server}** — tu es le/la {count}ᵉ membre.",
  staffRoleId: null,
  jailRoleId: null,
  trapVoiceId: null,
  trapAction: "off", // off | kick | ban

  levelsEnabled: true,
  levelRewards: {},

  // Récompenses vocales : monter en niveau et gagner des coins en restant en vocal
  voice: {
    enabled: true,
    xpPerMinute: 15,
    coinsPerMinute: 3,
    intervalMinutes: 5,
    minMembers: 2,        // seul dans un salon = aucun gain
    requireUnmuted: true, // casque coupé = considéré absent
    ignoredChannels: [],
  }, // { "10": "roleId" }

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
    dropChannelId: null,
    dropChance: 0,      // % de chance par message dans le salon de drops
    dropMin: 100,
    dropMax: 800,
    shop: [],           // [{ id, type, name, price, roleId, amount, hours, stock }]
    customRoles: {},    // userId -> roleId (rôles personnalisés achetés)
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
  invites: new Map(),
  boosts: new Map(),
  voiceTime: new Map(),
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
    await q(`CREATE TABLE IF NOT EXISTS voice_time (
      guild_id TEXT NOT NULL, user_id TEXT NOT NULL, minutes INTEGER NOT NULL DEFAULT 0,
      PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS boosts (
      guild_id TEXT NOT NULL, user_id TEXT NOT NULL, multiplier REAL NOT NULL DEFAULT 1,
      until TIMESTAMPTZ NOT NULL, PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS invites (
      guild_id TEXT NOT NULL, user_id TEXT NOT NULL, inviter_id TEXT, code TEXT,
      joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), left_at TIMESTAMPTZ,
      PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE INDEX IF NOT EXISTS invites_inviter ON invites (guild_id, inviter_id)`);
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

async function listActiveGiveaways(guildId, limit = 25) {
  if (ready) return (await q("SELECT * FROM giveaways WHERE guild_id=$1 AND ended=FALSE ORDER BY ends_at ASC LIMIT $2", [guildId, limit])).rows;
  return mem.giveaways.filter((g) => g.guild_id === guildId && !g.ended)
    .sort((a, b) => new Date(a.ends_at) - new Date(b.ends_at)).slice(0, limit);
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

/* ------------------------------- TEMPS VOCAL ------------------------------ */

async function addVoiceMinutes(guildId, userId, minutes) {
  if (ready) {
    await q(`INSERT INTO voice_time (guild_id,user_id,minutes) VALUES ($1,$2,$3)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET minutes = voice_time.minutes + $3`, [guildId, userId, minutes]);
    return;
  }
  const k = `${guildId}:${userId}`;
  mem.voiceTime.set(k, (mem.voiceTime.get(k) ?? 0) + minutes);
}

async function getVoiceMinutes(guildId, userId) {
  if (ready) return (await q("SELECT minutes FROM voice_time WHERE guild_id=$1 AND user_id=$2", [guildId, userId])).rows[0]?.minutes ?? 0;
  return mem.voiceTime.get(`${guildId}:${userId}`) ?? 0;
}

async function topVoice(guildId, limit = 10) {
  if (ready) return (await q("SELECT user_id, minutes FROM voice_time WHERE guild_id=$1 ORDER BY minutes DESC LIMIT $2", [guildId, limit]))
    .rows.map((r) => ({ userId: r.user_id, minutes: r.minutes }));
  return [...mem.voiceTime.entries()].filter(([k]) => k.startsWith(`${guildId}:`))
    .sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, minutes]) => ({ userId: k.split(":")[1], minutes }));
}

/* --------------------------- MULTIPLICATEURS D'XP -------------------------- */

async function setBoost(guildId, userId, multiplier, until) {
  if (ready) await q(`INSERT INTO boosts (guild_id,user_id,multiplier,until) VALUES ($1,$2,$3,$4)
    ON CONFLICT (guild_id,user_id) DO UPDATE SET multiplier=$3, until=$4`, [guildId, userId, multiplier, until]);
  else mem.boosts.set(`${guildId}:${userId}`, { multiplier, until });
}

/** @returns {{multiplier:number, until:Date}|null} */
async function getBoost(guildId, userId) {
  if (ready) {
    const r = await q("SELECT multiplier, until FROM boosts WHERE guild_id=$1 AND user_id=$2 AND until>NOW()", [guildId, userId]);
    return r.rows[0] ? { multiplier: Number(r.rows[0].multiplier), until: r.rows[0].until } : null;
  }
  const b = mem.boosts.get(`${guildId}:${userId}`);
  return b && new Date(b.until) > new Date() ? b : null;
}

/** Supprime la sanction la plus récente d'un type donné. @returns {boolean} */
async function deleteLatestSanction(guildId, userId, type) {
  if (ready) {
    const r = await q(`DELETE FROM sanctions WHERE id = (
      SELECT id FROM sanctions WHERE guild_id=$1 AND user_id=$2 AND type=$3 ORDER BY id DESC LIMIT 1)`,
      [guildId, userId, type]);
    return r.rowCount > 0;
  }
  const list = mem.sanctions.filter((s) => s.guild_id === guildId && s.user_id === userId && s.type === type);
  if (!list.length) return false;
  const last = list.sort((a, b) => b.id - a.id)[0];
  mem.sanctions = mem.sanctions.filter((s) => s.id !== last.id);
  return true;
}

/* ------------------------------- INVITATIONS ------------------------------ */

/** Enregistre l'arrivée et renvoie le total d'invités actifs du parrain. */
async function recordInvite(guildId, userId, inviterId, code) {
  if (ready) {
    await q(`INSERT INTO invites (guild_id,user_id,inviter_id,code,joined_at,left_at)
      VALUES ($1,$2,$3,$4,NOW(),NULL)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET inviter_id=$3, code=$4, joined_at=NOW(), left_at=NULL`,
      [guildId, userId, inviterId, code]);
  } else {
    mem.invites.set(`${guildId}:${userId}`, { inviter_id: inviterId, code, joined_at: new Date(), left_at: null });
  }
  return inviterCount(guildId, inviterId);
}

async function markInviteLeft(guildId, userId) {
  if (ready) {
    const r = await q("UPDATE invites SET left_at=NOW() WHERE guild_id=$1 AND user_id=$2 AND left_at IS NULL RETURNING inviter_id", [guildId, userId]);
    return r.rows[0]?.inviter_id ?? null;
  }
  const rec = mem.invites.get(`${guildId}:${userId}`);
  if (!rec || rec.left_at) return null;
  rec.left_at = new Date();
  return rec.inviter_id;
}

async function inviterCount(guildId, inviterId) {
  if (!inviterId) return 0;
  if (ready) {
    const r = await q("SELECT COUNT(*)::int c FROM invites WHERE guild_id=$1 AND inviter_id=$2 AND left_at IS NULL", [guildId, inviterId]);
    return r.rows[0]?.c ?? 0;
  }
  return [...mem.invites.entries()].filter(([k, v]) => k.startsWith(`${guildId}:`) && v.inviter_id === inviterId && !v.left_at).length;
}

async function inviterStats(guildId, inviterId) {
  if (ready) {
    const r = await q(`SELECT COUNT(*) FILTER (WHERE left_at IS NULL)::int active,
      COUNT(*)::int total FROM invites WHERE guild_id=$1 AND inviter_id=$2`, [guildId, inviterId]);
    return r.rows[0] ?? { active: 0, total: 0 };
  }
  const all = [...mem.invites.entries()].filter(([k, v]) => k.startsWith(`${guildId}:`) && v.inviter_id === inviterId);
  return { active: all.filter(([, v]) => !v.left_at).length, total: all.length };
}

async function getInviter(guildId, userId) {
  if (ready) return (await q("SELECT inviter_id, code, joined_at FROM invites WHERE guild_id=$1 AND user_id=$2", [guildId, userId])).rows[0] ?? null;
  return mem.invites.get(`${guildId}:${userId}`) ?? null;
}

async function topInviters(guildId, limit = 10) {
  if (ready) {
    const r = await q(`SELECT inviter_id, COUNT(*) FILTER (WHERE left_at IS NULL)::int active, COUNT(*)::int total
      FROM invites WHERE guild_id=$1 AND inviter_id IS NOT NULL
      GROUP BY inviter_id ORDER BY active DESC, total DESC LIMIT $2`, [guildId, limit]);
    return r.rows.map((x) => ({ userId: x.inviter_id, active: x.active, total: x.total }));
  }
  const agg = new Map();
  for (const [k, v] of mem.invites) {
    if (!k.startsWith(`${guildId}:`) || !v.inviter_id) continue;
    const cur = agg.get(v.inviter_id) ?? { active: 0, total: 0 };
    cur.total++; if (!v.left_at) cur.active++;
    agg.set(v.inviter_id, cur);
  }
  return [...agg.entries()].map(([userId, v]) => ({ userId, ...v }))
    .sort((a, b) => b.active - a.active || b.total - a.total).slice(0, limit);
}

async function resetInvites(guildId) {
  if (ready) return (await q("DELETE FROM invites WHERE guild_id=$1", [guildId])).rowCount;
  let n = 0;
  for (const k of [...mem.invites.keys()]) if (k.startsWith(`${guildId}:`)) { mem.invites.delete(k); n++; }
  return n;
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
/*                     4 - AUTOMOD, ANTI-RAID, ANTI-NUKE                      */
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
  if (isOwner(member.id)) return true;
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
  if (isOwner(userId)) return true;
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
/*                           5 - DROITS DES SALONS                            */
/* ========================================================================== */

// channels.js — qui peut voir, écrire et parler, salon par salon.


/* ========================================================================== */
/*                            CATALOGUE DES DROITS                            */
/* ========================================================================== */

const TEXTUAL = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildForum];
const VOCAL = [ChannelType.GuildVoice, ChannelType.GuildStageVoice];

/** Droits pilotables, avec le type de salon auquel ils s'appliquent. */
const PERMS = {
  view:    { label: "Voir",        emoji: "👁️", flag: PermissionFlagsBits.ViewChannel,          scope: "all" },
  send:    { label: "Écrire",      emoji: "💬", flag: PermissionFlagsBits.SendMessages,         scope: "text" },
  react:   { label: "Réagir",      emoji: "😀", flag: PermissionFlagsBits.AddReactions,         scope: "text" },
  files:   { label: "Fichiers",    emoji: "📎", flag: PermissionFlagsBits.AttachFiles,          scope: "text" },
  links:   { label: "Liens",       emoji: "🔗", flag: PermissionFlagsBits.EmbedLinks,           scope: "text" },
  threads: { label: "Fils",        emoji: "🧵", flag: PermissionFlagsBits.CreatePublicThreads,  scope: "text" },
  connect: { label: "Rejoindre",   emoji: "🎧", flag: PermissionFlagsBits.Connect,              scope: "voice" },
  speak:   { label: "Parler",      emoji: "🎙️", flag: PermissionFlagsBits.Speak,                scope: "voice" },
  video:   { label: "Caméra",      emoji: "📹", flag: PermissionFlagsBits.Stream,               scope: "voice" },
};

function isCategory(ch) { return ch?.type === ChannelType.GuildCategory; }
function isVoice(ch) { return VOCAL.includes(ch?.type); }
function isText(ch) { return TEXTUAL.includes(ch?.type); }

/** Droits pertinents pour ce salon. */
function permsFor(channel) {
  return Object.entries(PERMS).filter(([, p]) => {
    if (p.scope === "all") return true;
    if (isCategory(channel)) return true;          // une catégorie porte les deux
    if (p.scope === "text") return isText(channel);
    return isVoice(channel);
  });
}

/* ========================================================================== */
/*                          LECTURE ET ÉCRITURE                               */
/* ========================================================================== */

/** @returns {"allow"|"deny"|"inherit"} */
function stateOf(channel, targetId, key) {
  const ow = channel.permissionOverwrites?.cache?.get(targetId);
  if (!ow) return "inherit";
  const flag = PERMS[key].flag;
  if (ow.allow?.has(flag)) return "allow";
  if (ow.deny?.has(flag)) return "deny";
  return "inherit";
}

const STATE_ICON = { allow: "✅", deny: "⛔", inherit: "⬜" };
const STATE_WORD = { allow: "autorisé", deny: "refusé", inherit: "hérité" };

const NEXT = { inherit: "allow", allow: "deny", deny: "inherit" };
const VALUE = { allow: true, deny: false, inherit: null };

/**
 * Fait tourner un droit : hérité → autorisé → refusé → hérité.
 * @returns {Promise<{state:string, error?:string}>}
 */
async function cyclePerm(channel, targetId, key, reason) {
  const current = stateOf(channel, targetId, key);
  const next = NEXT[current];
  const permName = Object.entries(PermissionFlagsBits).find(([, v]) => v === PERMS[key].flag)?.[0];
  if (!permName) return { state: current, error: "Droit inconnu." };
  try {
    await channel.permissionOverwrites.edit(targetId, { [permName]: VALUE[next] }, { reason });
    return { state: next };
  } catch (e) {
    return { state: current, error: e.message.slice(0, 150) };
  }
}

/** Force un droit à une valeur précise (utilisé par les raccourcis). */
async function setPerm(channel, targetId, key, value, reason) {
  const permName = Object.entries(PermissionFlagsBits).find(([, v]) => v === PERMS[key].flag)?.[0];
  if (!permName) return false;
  return channel.permissionOverwrites.edit(targetId, { [permName]: value }, { reason })
    .then(() => true).catch(() => false);
}

/* ========================================================================== */
/*                                RACCOURCIS                                  */
/* ========================================================================== */

/** Verrouille : plus personne n'écrit ni ne parle, mais tout le monde voit. */
async function lockChannel(channel, lock, reason) {
  const everyone = channel.guild.roles.everyone.id;
  const keys = isVoice(channel) || isCategory(channel) ? ["speak", "send"] : ["send"];
  let done = 0;
  for (const k of keys) {
    if (await setPerm(channel, everyone, k, lock ? false : null, reason)) done++;
  }
  return done > 0;
}

/** Masque totalement le salon. */
async function hideChannel(channel, hide, reason) {
  return setPerm(channel, channel.guild.roles.everyone.id, "view", hide ? false : null, reason);
}

/** Lecture seule : visible, mais ni écriture, ni réaction, ni fichier, ni fil. */
async function readOnly(channel, reason) {
  const everyone = channel.guild.roles.everyone.id;
  for (const k of ["send", "react", "files", "threads"]) await setPerm(channel, everyone, k, false, reason);
  return setPerm(channel, everyone, "view", null, reason);
}

/** Efface la règle de @everyone : le salon revient au réglage de sa catégorie. */
async function resetEveryone(channel, reason) {
  return channel.permissionOverwrites.delete(channel.guild.roles.everyone.id, reason)
    .then(() => true).catch(() => false);
}

/** Applique la même règle à tous les salons d'une catégorie. */
async function applyToCategory(category, targetId, key, value, reason) {
  const children = category.guild.channels.cache.filter((c) => c.parentId === category.id);
  let done = 0;
  for (const ch of children.values()) {
    if (!ch.manageable) continue;
    if (PERMS[key].scope === "text" && !isText(ch)) continue;
    if (PERMS[key].scope === "voice" && !isVoice(ch)) continue;
    if (await setPerm(ch, targetId, key, value, reason)) done++;
    if (done % 5 === 0) await new Promise((r) => setTimeout(r, 1000));
  }
  return done;
}

/** Rend un membre muet dans ce salon précis (ou lui rend la parole). */
async function muteMemberHere(channel, userId, mute, reason) {
  const keys = isVoice(channel) ? ["speak"] : ["send"];
  let ok = true;
  for (const k of keys) ok = (await setPerm(channel, userId, k, mute ? false : null, reason)) && ok;
  return ok;
}

/* ========================================================================== */
/*                                  RÉSUMÉ                                    */
/* ========================================================================== */

/** Ligne d'état lisible pour @everyone. */
function summarize(channel) {
  const everyone = channel.guild.roles.everyone.id;
  return permsFor(channel)
    .map(([key, p]) => `${STATE_ICON[stateOf(channel, everyone, key)]} ${p.emoji} ${p.label}`)
    .join("  ·  ");
}

/** Salons du serveur actuellement verrouillés ou masqués. */
function auditChannels(guild) {
  const everyone = guild.roles.everyone.id;
  const locked = [];
  const hidden = [];
  for (const ch of guild.channels.cache.values()) {
    if (isCategory(ch)) continue;
    const ow = ch.permissionOverwrites?.cache?.get(everyone);
    if (!ow) continue;
    if (ow.deny?.has(PermissionFlagsBits.ViewChannel)) hidden.push(ch);
    else if (ow.deny?.has(PermissionFlagsBits.SendMessages) || ow.deny?.has(PermissionFlagsBits.Speak)) locked.push(ch);
  }
  return { locked, hidden };
}

/* ========================================================================== */
/*            6 - TICKETS, GIVEAWAYS, COMPTEURS, PANNEAUX PUBLICS             */
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

/**
 * Met à jour les salons compteurs (vocaux verrouillés).
 *  - Membres   : humains uniquement, bots exclus
 *  - Connectés : humains non hors-ligne
 *  - Vocal     : humains actuellement en vocal, tous salons confondus
 * Les valeurs indisponibles ne sont jamais écrites (on ne remplace pas par 0).
 */
async function computeCounts(guild) {
  // Bots : fiables en cache (peu nombreux, reçus au démarrage).
  const cachedBots = guild.members.cache.filter((m) => m.user.bot).size;
  const members = Math.max(0, guild.memberCount - cachedBots);

  // Vocal : on lit les états vocaux, PAS channel.members (qui dépend du cache membres).
  let voice = 0;
  for (const vs of guild.voiceStates.cache.values()) {
    if (!vs.channelId) continue;
    const m = guild.members.cache.get(vs.id);
    if (m?.user?.bot) continue;
    voice++;
  }

  // Connectés : nécessite l'intent Presence + le cache membres.
  let online = null;
  const cacheRatio = guild.memberCount > 0 ? guild.members.cache.size / guild.memberCount : 0;
  if (cacheRatio > 0.5) {
    let n = 0;
    for (const m of guild.members.cache.values()) {
      if (m.user.bot) continue;
      if (m.presence && m.presence.status !== "offline") n++;
    }
    online = n > 0 ? n : null; // 0 = presences non reçues → on n'écrit rien
  }

  return { members, online, voice, cacheRatio };
}

const lastCounterValue = new Map();

async function updateCounters(guild, force = false) {
  const config = await getConfig(guild.id);
  const counts = await computeCounts(guild);
  const report = [];

  for (const counter of COUNTERS) {
    const value = counts[counter.key];
    if (value === null || value === undefined) {
      report.push({ key: counter.key, status: "indisponible" });
      continue;
    }

    // Salon forcé via /config compteur, sinon détection par motif "Nom :"
    const forced = config.counters?.[counter.key];
    let channel = forced ? guild.channels.cache.get(forced) : null;
    if (!channel) {
      channel = guild.channels.cache.find(
        (c) => (c.type === ChannelType.GuildVoice || c.type === ChannelType.GuildStageVoice) && counter.test.test(c.name)
      );
    }
    if (!channel) { report.push({ key: counter.key, value, status: "salon introuvable" }); continue; }
    if (!channel.manageable) { report.push({ key: counter.key, value, status: "permission manquante" }); continue; }

    const next = counter.template.replace("{n}", num(value));
    if (channel.name === next) { report.push({ key: counter.key, value, status: "à jour" }); continue; }

    const memoKey = `${guild.id}:${counter.key}`;
    if (!force && lastCounterValue.get(memoKey) === value) { report.push({ key: counter.key, value, status: "inchangé" }); continue; }

    const ok = await channel.setName(next, "Compteur 0x").then(() => true).catch((e) => {
      report.push({ key: counter.key, value, status: `échec : ${e.message.slice(0, 60)}` });
      return false;
    });
    if (ok) { lastCounterValue.set(memoKey, value); report.push({ key: counter.key, value, status: "mis à jour" }); }
    await new Promise((r) => setTimeout(r, 2000));
  }

  return { counts, report };
}

/* ========================================================================== */
/*                          BOUTIQUE ET DROPS DE COINS                        */
/* ========================================================================== */

const activeDrops = new Map(); // messageId -> { amount, claimed }

function dropComponents(id) {
  return [new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(`drop:claim:${id}`).setLabel("Récupérer").setStyle(ButtonStyle.Success).setEmoji("📦")
  )];
}

async function launchDrop(guild, channel, amount) {
  if (!channel || !canSend(channel)) return null;
  const config = await getConfig(guild.id);
  const id = Math.random().toString(36).slice(2, 10);
  const message = await channel.send({
    embeds: [embed({
      guild,
      author: { name: "📦  Colis lâché" },
      description: `Un colis de **${config.economy.currency} ${num(amount)}** vient de tomber.\nPremier arrivé, premier servi.`,
      color: COLORS.gold,
    })],
    components: dropComponents(id),
  }).catch(() => null);
  if (!message) return null;
  activeDrops.set(id, { amount, claimed: false, guildId: guild.id });
  setTimeout(() => {
    const d = activeDrops.get(id);
    if (d && !d.claimed) {
      activeDrops.delete(id);
      message.edit({
        embeds: [embed({ guild, author: { name: "📦  Colis perdu" }, description: "Personne n'a été assez rapide.", color: COLORS.neutral })],
        components: [],
      }).catch(() => null);
    }
  }, 120_000);
  return message;
}

async function claimDrop(interaction, id) {
  const drop = activeDrops.get(id);
  if (!drop || drop.claimed) return interaction.reply({ content: "Ce colis a déjà été récupéré.", ...EPH });
  drop.claimed = true;
  activeDrops.delete(id);

  const config = await getConfig(interaction.guild.id);
  const total = await addCoins(interaction.guild.id, interaction.user.id, drop.amount);

  await interaction.update({
    embeds: [embed({
      guild: interaction.guild,
      author: { name: "📦  Colis récupéré" },
      description: `${interaction.user} empoche **${config.economy.currency} ${num(drop.amount)}**.`,
      color: COLORS.success,
    })],
    components: [],
  }).catch(() => null);

  await log(interaction.guild, "coins", embed({
    guild: interaction.guild,
    author: { name: "🪙  Colis récupéré" },
    color: COLORS.gold,
    fields: [
      { name: "Membre", value: interaction.user.tag, inline: true },
      { name: "Montant", value: num(drop.amount), inline: true },
      { name: "Nouveau solde", value: num(total), inline: true },
    ],
  }));
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


const pbtn = (id, label, style = ButtonStyle.Secondary, emoji) => {
  const b = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  if (emoji) b.setEmoji(emoji);
  return b;
};

/* ========================================================================== */
/*                              PANNEAUX PUBLICS                              */
/* ========================================================================== */

function memberPanel(guild) {
  return {
    embeds: [embed({ guild, author: { name: "🧭  Espace membre" }, color: COLORS.primary,
      description: "Tout ce que tu peux faire ici, sans taper une seule commande.",
      fields: [
        { name: `${ICONS.level} Niveau`, value: "Ta progression XP", inline: true },
        { name: `${ICONS.coin} Solde`, value: "Tes coins", inline: true },
        { name: "🎁 Quotidien", value: "Une fois par jour", inline: true },
        { name: "💼 Travail", value: "Toutes les 30 min", inline: true },
        { name: "🏆 Classement", value: "Top XP et coins", inline: true },
        { name: "🛒 Boutique", value: "Rôles à acheter", inline: true },
        { name: "🔗 Invitations", value: "Tes filleuls", inline: true },
        { name: "🔊 Vocal", value: "XP et coins en parlant", inline: true },
      ] })],
    components: [
      new ActionRowBuilder().addComponents(
        pbtn("pub:rank", "Mon niveau", ButtonStyle.Primary, "📈"),
        pbtn("pub:coins", "Mon solde", ButtonStyle.Primary, "🪙"),
        pbtn("pub:daily", "Quotidien", ButtonStyle.Success, "🎁"),
        pbtn("pub:work", "Travailler", ButtonStyle.Success, "💼"),
      ),
      new ActionRowBuilder().addComponents(
        pbtn("pub:top:xp", "Top XP", ButtonStyle.Secondary, "🏆"),
        pbtn("pub:top:coins", "Top coins", ButtonStyle.Secondary, "💰"),
        pbtn("pub:shop", "Boutique", ButtonStyle.Secondary, "🛒"),
        pbtn("pub:pay", "Envoyer des coins", ButtonStyle.Secondary, "🤝"),
      ),
      new ActionRowBuilder().addComponents(
        pbtn("pub:invites", "Mes invitations", ButtonStyle.Primary, "🔗"),
        pbtn("pub:top:invites", "Top invitations", ButtonStyle.Secondary, "🏅"),
        pbtn("pub:top:voice", "Top vocal", ButtonStyle.Secondary, "🔊"),
      ),
    ],
  };
}

function confessionPanel(guild) {
  return {
    embeds: [embed({ guild, author: { name: "🕵️  Confessions anonymes" }, color: COLORS.purple,
      description: "Ton message est publié sans ton nom. Les modérateurs conservent une trace pour éviter les abus." })],
    components: [new ActionRowBuilder().addComponents(pbtn("pub:confess", "Écrire une confession", ButtonStyle.Primary, "✍️"))],
  };
}

/* ========================================================================== */
/*                          7 - RECOMPENSES VOCALES                           */
/* ========================================================================== */

// voice.js — récompenses vocales : XP et coins gagnés en restant en vocal.


/** Un membre est-il éligible aux gains vocaux ? */
function isEligible(voiceState, member, guild, v) {
  if (!voiceState.channelId) return false;
  if (member?.user?.bot) return false;
  if (guild.afkChannelId && voiceState.channelId === guild.afkChannelId) return false;
  if (v.ignoredChannels?.includes(voiceState.channelId)) return false;
  if (v.requireUnmuted && (voiceState.selfDeaf || voiceState.deaf)) return false;
  if (v.requireUnmuted && voiceState.selfMute && voiceState.selfDeaf) return false;
  return true;
}

/**
 * Distribue les gains à tout le monde en vocal.
 * Appelé toutes les `intervalMinutes` minutes.
 * @returns {Promise<{rewarded:number, levelUps:Array}>}
 */
async function tickVoiceRewards(guild) {
  const config = await getConfig(guild.id);
  const v = config.voice;
  if (!v?.enabled) return { rewarded: 0, levelUps: [] };

  // Regroupement par salon : on exige un minimum de participants
  const byChannel = new Map();
  for (const vs of guild.voiceStates.cache.values()) {
    const member = guild.members.cache.get(vs.id);
    if (!isEligible(vs, member, guild, v)) continue;
    if (!byChannel.has(vs.channelId)) byChannel.set(vs.channelId, []);
    byChannel.get(vs.channelId).push({ vs, member });
  }

  const minutes = Math.max(1, v.intervalMinutes ?? 5);
  const baseXp = Math.round((v.xpPerMinute ?? 15) * minutes);
  const baseCoins = Math.round((v.coinsPerMinute ?? 3) * minutes);
  const levelUps = [];
  let rewarded = 0;

  for (const group of byChannel.values()) {
    if (group.length < (v.minMembers ?? 2)) continue;

    for (const { member } of group) {
      if (!member) continue;
      let xp = baseXp;
      const boost = await getBoost(guild.id, member.id);
      if (boost) xp = Math.round(xp * boost.multiplier);

      const result = await addXp(guild.id, member.id, xp);
      if (baseCoins > 0 && config.economy?.enabled) await addCoins(guild.id, member.id, baseCoins);
      await addVoiceMinutes(guild.id, member.id, minutes);
      rewarded++;

      if (result?.leveledUp) levelUps.push({ member, level: result.level });
    }
  }

  // Annonces de montée de niveau
  if (levelUps.length) {
    const target = resolveFuncChannel(guild, "levelUp", config);
    if (target && canSend(target)) {
      for (const up of levelUps.slice(0, 10)) {
        const reward = config.levelRewards?.[String(up.level)];
        if (reward) await up.member.roles.add(reward, `Niveau ${up.level} (vocal)`).catch(() => null);
        await target.send(`🔊 ${up.member} passe **niveau ${up.level}** en vocal${reward ? ` et débloque <@&${reward}>` : ""} !`).catch(() => null);
      }
    }
  }

  return { rewarded, levelUps };
}

/** Résumé lisible des réglages vocaux. */
function voiceSummary(config) {
  const v = config.voice ?? {};
  if (!v.enabled) return "🔴 coupé";
  const perTick = Math.round((v.xpPerMinute ?? 15) * (v.intervalMinutes ?? 5));
  const coinsTick = Math.round((v.coinsPerMinute ?? 3) * (v.intervalMinutes ?? 5));
  return `🟢 **${perTick} XP** et **${coinsTick} coins** toutes les ${v.intervalMinutes ?? 5} min\n`
    + `Minimum ${v.minMembers ?? 2} personne(s) dans le salon`
    + (v.requireUnmuted ? " · casque coupé = pas de gain" : "");
}

/* ========================================================================== */
/*                    8 - INVITATIONS ET ROLE DE CONFIANCE                    */
/* ========================================================================== */

// invites.js — suivi des invitations et rôle de confiance « Like ».


/* ========================================================================== */
/*                          CACHE DES INVITATIONS                             */
/* ========================================================================== */

// guildId -> Map(code -> { uses, inviterId })
const inviteCache = new Map();

async function cacheInvites(guild) {
  if (!guild.members.me?.permissions.has(PermissionFlagsBits.ManageGuild)) {
    console.warn(`[invites] ${guild.name} : permission « Gérer le serveur » manquante, suivi impossible`);
    return 0;
  }
  const invites = await guild.invites?.fetch().catch(() => null);
  if (!invites) return 0;
  const map = new Map();
  for (const inv of invites.values()) map.set(inv.code, { uses: inv.uses ?? 0, inviterId: inv.inviter?.id ?? null });
  // URL personnalisée (discord.gg/Naoya)
  const vanity = await guild.fetchVanityData?.().catch(() => null);
  if (vanity?.code) map.set(vanity.code, { uses: vanity.uses ?? 0, inviterId: null, vanity: true });
  inviteCache.set(guild.id, map);
  return map.size;
}

function noteInviteCreate(invite) {
  const map = inviteCache.get(invite.guild?.id);
  if (map) map.set(invite.code, { uses: invite.uses ?? 0, inviterId: invite.inviter?.id ?? null });
}

function noteInviteDelete(invite) {
  inviteCache.get(invite.guild?.id)?.delete(invite.code);
}

/**
 * Compare l'état actuel au cache pour retrouver l'invitation utilisée.
 * @returns {{code:string, inviterId:string|null, vanity?:boolean}|null}
 */
async function resolveUsedInvite(guild) {
  const before = inviteCache.get(guild.id) ?? new Map();
  const invites = await guild.invites?.fetch().catch(() => null);
  if (!invites) return null;

  const after = new Map();
  for (const inv of invites.values()) after.set(inv.code, { uses: inv.uses ?? 0, inviterId: inv.inviter?.id ?? null });
  const vanity = await guild.fetchVanityData?.().catch(() => null);
  if (vanity?.code) after.set(vanity.code, { uses: vanity.uses ?? 0, inviterId: null, vanity: true });

  let used = null;
  for (const [code, now] of after) {
    const prev = before.get(code);
    if (prev && now.uses > prev.uses) { used = { code, inviterId: now.inviterId, vanity: now.vanity }; break; }
  }
  // Invitation à usage unique consommée puis supprimée par Discord
  if (!used) {
    for (const [code, prev] of before) {
      if (!after.has(code) && !prev.vanity) { used = { code, inviterId: prev.inviterId }; break; }
    }
  }

  inviteCache.set(guild.id, after);
  return used;
}

/* ========================================================================== */
/*                       ANNONCE D'ARRIVÉE PAR INVITATION                     */
/* ========================================================================== */

/** Ajoute le report initial issu des compteurs Discord. */
function withBaseline(config, userId, n) {
  return n + Number(config?.invites?.baseline?.[userId] ?? 0);
}

/**
 * Recale le classement sur les compteurs réels des liens Discord.
 * Utile une seule fois, au démarrage du suivi sur un serveur déjà ancien.
 */
async function recalibrate(guild) {
  const invites = await guild.invites?.fetch().catch(() => null);
  if (!invites) return { ok: false, error: "Lecture des invitations impossible — permission « Gérer le serveur » manquante." };

  const uses = new Map();
  for (const inv of invites.values()) {
    if (!inv.inviter) continue;
    uses.set(inv.inviter.id, (uses.get(inv.inviter.id) ?? 0) + (inv.uses ?? 0));
  }

  const already = new Map((await topInviters(guild.id, 500)).map((x) => [x.userId, x.active]));
  const baseline = {};
  for (const [uid, total] of uses) {
    const diff = total - (already.get(uid) ?? 0);
    if (diff > 0) baseline[uid] = diff;
  }

  await updateConfig(guild.id, { invites: { baseline } });
  return { ok: true, people: Object.keys(baseline).length, total: [...uses.values()].reduce((a, b) => a + b, 0) };
}

const ORDINAL = (n) => (n === 1 ? "1ʳᵉ" : `${n}ᵉ`);

/** Traite une arrivée : attribue l'invitation, annonce, programme la suppression. */
async function handleInviteJoin(member) {
  const guild = member.guild;
  const config = await getConfig(guild.id);
  if (!config.invites?.enabled) return null;

  const used = await resolveUsedInvite(guild);
  const inviterId = used?.inviterId ?? null;
  const raw = await recordInvite(guild.id, member.id, inviterId, used?.code ?? null);
  const total = withBaseline(config, inviterId, raw);

  const channel = config.invites.channelId
    ? guild.channels.cache.get(config.invites.channelId)
    : resolveFuncChannel(guild, "invites", config)
      ?? (config.welcomeChannelId ? guild.channels.cache.get(config.welcomeChannelId) : null);

  if (!channel || !canSend(channel)) return { inviterId, total, posted: false };

  let description;
  if (inviterId) {
    description = `${member} a été invité(e) par <@${inviterId}>\nC'est son **${ORDINAL(total)} invité**.`;
  } else if (used?.vanity) {
    description = `${member} est arrivé(e) par le lien personnalisé du serveur.`;
  } else {
    description = `${member} est arrivé(e) — invitation inconnue.`;
  }

  const message = await channel.send({
    embeds: [embed({
      guild,
      color: inviterId ? COLORS.success : COLORS.neutral,
      author: { name: "🔗  Nouvelle arrivée" },
      description,
      footer: `Ce message disparaît dans ${Math.round((config.invites.deleteAfterMs ?? 120_000) / 60_000)} min`,
    })],
  }).catch(() => null);

  if (message) {
    setTimeout(() => message.delete().catch(() => null), config.invites.deleteAfterMs ?? 120_000);
  }

  return { inviterId, total, posted: !!message };
}

/** Départ : l'invitation ne compte plus. */
async function handleInviteLeave(member) {
  return markInviteLeft(member.guild.id, member.id);
}

/* ========================================================================== */
/*                        RÔLE DE CONFIANCE « LIKE »                          */
/* ========================================================================== */

/**
 * Le rôle « Like me » donne accès aux réglages non destructifs.
 * La recherche tolère emojis, accents, tirets et casse :
 * « Like me », « 🩷 • Like Me », « like-me », « LIKEME » sont tous reconnus.
 */
function findLikeRole(guild) {
  const roles = [...guild.roles.cache.values()].filter((r) => r.id !== guild.id && !r.managed);
  const flat = (r) => norm(r.name).replace(/-/g, "");

  return roles.find((r) => norm(r.name) === "like-me")
    ?? roles.find((r) => flat(r) === "likeme")
    ?? roles.find((r) => flat(r).includes("likeme"))
    ?? roles.find((r) => norm(r.name) === "like")
    ?? null;
}

/**
 * Repère le rôle de confiance et lui donne le niveau 5.
 * Un rôle choisi à la main dans le panneau n'est jamais écrasé tant qu'il existe.
 */
async function syncTrustedRole(guild, { force = false } = {}) {
  const config = await getConfig(guild.id);

  // Choix manuel toujours valide : on le garde
  if (!force && config.trustedRoleId && guild.roles.cache.has(config.trustedRoleId)) {
    const role = guild.roles.cache.get(config.trustedRoleId);
    const current = Number(config.perms.roles?.[role.id] ?? 0);
    if (current < 5) {
      await updateConfig(guild.id, { perms: { roles: { ...config.perms.roles, [role.id]: 5 } } });
      return { found: true, role, changed: true, manual: true };
    }
    return { found: true, role, changed: false, manual: true };
  }

  const role = findLikeRole(guild);
  if (!role) {
    if (config.trustedRoleId) await updateConfig(guild.id, { trustedRoleId: null });
    return { found: false };
  }

  const roles = { ...config.perms.roles };
  if (!roles[role.id] || Number(roles[role.id]) < 5) roles[role.id] = 5;
  const changed = config.trustedRoleId !== role.id || roles[role.id] !== config.perms.roles?.[role.id];
  await updateConfig(guild.id, { trustedRoleId: role.id, perms: { roles } });
  return { found: true, role, changed };
}

/** A-t-on accès aux sections « safe » ? */
function isTrusted(member, config) {
  if (!member) return false;
  if (isOwner(member.id)) return true;
  return !!config?.trustedRoleId && member.roles.cache.has(config.trustedRoleId);
}

/* ========================================================================== */
/*                      9 - ACTIONS ET TYPES D ARTICLES                       */
/* ========================================================================== */

// actions.js — la logique métier, appelable depuis n'importe quelle interface.
// Chaque fonction renvoie { ok, title, text, color } prêt à afficher.


const ok = (title, text, color = COLORS.success) => ({ ok: true, title, text, color });
const no = (text) => ({ ok: false, title: "Impossible", text, color: COLORS.danger });

/** Vérifie hiérarchie Discord + niveau de perm avant toute sanction. */
function checkTarget(guild, actor, target, config) {
  if (!target) return "Membre introuvable sur le serveur.";
  if (target.id === actor.id) return "Tu ne peux pas te cibler toi-même.";
  if (isOwner(target.id)) return "C'est le propriétaire de 0x — il ne peut pas être ciblé.";
  if (target.id === guild.ownerId) return "C'est le propriétaire du serveur.";
  if (target.id === guild.members.me.id) return "Je ne vais pas me sanctionner moi-même.";

  const actorLevel = permLevel(actor, config);
  const targetLevel = permLevel(target, config);
  if (actorLevel <= targetLevel)
    return `**${target.user.tag}** est de niveau ${targetLevel}, toi ${actorLevel}. Il faut un niveau strictement supérieur.`;

  if (target.roles.highest.position >= guild.members.me.roles.highest.position)
    return "Mon rôle est trop bas. Remonte le rôle de 0x au-dessus dans les paramètres du serveur.";
  return null;
}

/* ================================ SANCTIONS =============================== */

async function actionWarn(guild, target, moderator, reason) {
  const total = await addSanction(guild.id, target.id, moderator.id, "warn", reason);
  await tryDm(target.user, guild.name, "Avertissement", reason);
  await log(guild, "warn", embed({
    guild, color: COLORS.warning, author: { name: `${ICONS.warn}  Avertissement` },
    description: `**${target.user.tag}**\n\`${target.id}\``,
    fields: [
      { name: "Total", value: `${total}`, inline: true },
      { name: "Modérateur", value: `<@${moderator.id}>`, inline: true },
      { name: "Raison", value: reason },
    ],
  }));
  return ok("Avertissement enregistré", `**${target.user.tag}** cumule **${total}** avertissement(s).`, COLORS.warning);
}

async function actionTimeout(guild, target, moderator, ms, reason) {
  if (!ms || ms < 5000 || ms > 28 * 864e5) return no("Durée invalide. Exemples : `30s`, `10m`, `2h`, `7d` (max 28j).");
  if (!target.moderatable) return no("Je ne peux pas réduire ce membre au silence.");
  await target.timeout(ms, `${moderator.tag} — ${reason}`);
  await addSanction(guild.id, target.id, moderator.id, "timeout", reason, ms);
  await tryDm(target.user, guild.name, "Réduction au silence", reason, formatDuration(ms));
  await log(guild, "timeout", embed({
    guild, color: COLORS.warning, author: { name: `${ICONS.timeout}  Timeout` },
    description: `**${target.user.tag}**\n\`${target.id}\``,
    fields: [
      { name: "Durée", value: formatDuration(ms), inline: true },
      { name: "Modérateur", value: `<@${moderator.id}>`, inline: true },
      { name: "Raison", value: reason },
    ],
  }));
  return ok("Membre réduit au silence", `**${target.user.tag}** est muet pendant ${formatDuration(ms)}.`, COLORS.warning);
}

async function actionUntimeout(guild, target, moderator) {
  await target.timeout(null, moderator.tag);
  await log(guild, "timeout", embed({
    guild, color: COLORS.success, author: { name: `${ICONS.ok}  Timeout levé` },
    fields: [{ name: "Membre", value: target.user.tag, inline: true }, { name: "Par", value: `<@${moderator.id}>`, inline: true }],
  }));
  return ok("Timeout levé", `**${target.user.tag}** peut de nouveau parler.`);
}

async function actionKick(guild, target, moderator, reason) {
  if (!target.kickable) return no("Je ne peux pas expulser ce membre.");
  await tryDm(target.user, guild.name, "Expulsion", reason);
  await target.kick(`${moderator.tag} — ${reason}`);
  await addSanction(guild.id, target.id, moderator.id, "kick", reason);
  await log(guild, "kick", embed({
    guild, color: COLORS.warning, author: { name: `${ICONS.kick}  Expulsion` },
    description: `**${target.user.tag}**\n\`${target.id}\``,
    fields: [{ name: "Modérateur", value: `<@${moderator.id}>`, inline: true }, { name: "Raison", value: reason }],
  }));
  return ok("Membre expulsé", `**${target.user.tag}** a été expulsé.`, COLORS.warning);
}

async function actionBan(guild, target, moderator, reason, purgeDays = 0) {
  if (!target.bannable) return no("Je ne peux pas bannir ce membre.");
  await tryDm(target.user, guild.name, "Bannissement", reason);
  await guild.bans.create(target.id, { reason: `${moderator.tag} — ${reason}`, deleteMessageSeconds: purgeDays * 86400 });
  await addSanction(guild.id, target.id, moderator.id, "ban", reason);
  await log(guild, "ban", embed({
    guild, color: COLORS.danger, author: { name: `${ICONS.ban}  Bannissement` },
    description: `**${target.user.tag}**\n\`${target.id}\``,
    fields: [{ name: "Modérateur", value: `<@${moderator.id}>`, inline: true }, { name: "Raison", value: reason }],
  }));
  return ok("Membre banni", `**${target.user.tag}** a été banni.`, COLORS.danger);
}

async function actionUnban(guild, userId, moderator, reason) {
  const ban = await guild.bans.fetch(userId).catch(() => null);
  if (!ban) return no("Aucun bannissement pour cet identifiant.");
  await guild.bans.remove(userId, `${moderator.tag} — ${reason}`);
  await log(guild, "ban", embed({
    guild, color: COLORS.success, author: { name: `${ICONS.ok}  Débannissement` },
    fields: [{ name: "Membre", value: `${ban.user.tag} (\`${userId}\`)`, inline: true }, { name: "Par", value: `<@${moderator.id}>`, inline: true }],
  }));
  return ok("Débanni", `**${ban.user.tag}** peut revenir.`);
}

async function actionJail(guild, target, moderator, reason, ms) {
  const r = await sendToJail(guild, target, moderator, reason, ms);
  if (!r.ok) return no(r.error);
  await tryDm(target.user, guild.name, "Alcatraz", reason, ms ? formatDuration(ms) : "Indéterminée");
  return ok("Envoyé en Alcatraz",
    `**${target.user.tag}** est enfermé pour ${ms ? formatDuration(ms) : "une durée indéterminée"}.\n${r.roles} rôle(s) mis de côté, restaurés à la libération.`,
    COLORS.danger);
}

async function actionFree(guild, target, moderator) {
  const r = await releaseFromJail(guild, target, moderator.tag);
  return r.ok ? ok("Libéré", `**${target.user.tag}** retrouve ses ${r.restored} rôle(s).`) : no(r.error);
}

async function actionHistory(guild, target) {
  const rows = await listSanctions(guild.id, target.id, null, 15);
  if (!rows.length) return { ok: true, title: "Casier vierge", text: `Aucune sanction pour **${target.user.tag}**.`, color: COLORS.success };
  const labels = { warn: `${ICONS.warn} Avertissement`, timeout: `${ICONS.timeout} Timeout`, kick: `${ICONS.kick} Expulsion`, ban: `${ICONS.ban} Bannissement`, alcatraz: `${ICONS.jail} Alcatraz` };
  return {
    ok: true, color: COLORS.warning,
    title: `Historique de ${target.user.tag}`,
    text: rows.map((r) => `\`#${r.id}\` ${labels[r.type] ?? r.type} — ${r.reason}\n<@${r.moderator_id}> · <t:${Math.floor(new Date(r.created_at).getTime() / 1000)}:R>`).join("\n\n"),
  };
}

async function actionClearSanctions(guild, target) {
  const n = await clearSanctions(guild.id, target.id);
  return ok("Casier effacé", `${n} sanction(s) supprimée(s) pour **${target.user.tag}**.`);
}

async function actionDeleteSanction(guild, id) {
  const done = await deleteSanction(guild.id, id);
  return done ? ok("Sanction supprimée", `La sanction \`#${id}\` a été retirée du casier.`) : no(`Aucune sanction \`#${id}\`.`);
}

/* ================================= PURGE ================================== */

async function actionPurge(channel, amount, targetId, moderator) {
  const fetched = await channel.messages.fetch({ limit: 100 }).catch(() => null);
  if (!fetched) return no("Lecture des messages impossible dans ce salon.");
  const cutoff = Date.now() - 13.5 * 864e5;
  let pool = [...fetched.values()].filter((m) => m.createdTimestamp > cutoff && !m.pinned);
  if (targetId) pool = pool.filter((m) => m.author.id === targetId);
  const slice = pool.slice(0, amount);
  if (!slice.length) return no("Aucun message supprimable (plus de 14 jours ou épinglé).");
  const deleted = await channel.bulkDelete(slice, true);
  await log(channel.guild, "messagePurge", embed({
    guild: channel.guild, color: COLORS.neutral, author: { name: "🧹  Purge" },
    fields: [
      { name: "Salon", value: `${channel}`, inline: true },
      { name: "Messages", value: `${deleted.size}`, inline: true },
      { name: "Par", value: `<@${moderator.id}>`, inline: true },
    ],
  }));
  return ok("Purge effectuée", `${deleted.size} message(s) supprimé(s).`);
}

/* ================================ ÉCONOMIE ================================ */

async function actionDaily(guild, user) {
  const config = await getConfig(guild.id);
  if (!config.economy.enabled) return no("L'économie est désactivée.");
  const w = await getWallet(guild.id, user.id);
  const now = Date.now();
  const last = w.lastDaily ? new Date(w.lastDaily).getTime() : 0;
  if (now - last < 20 * 36e5)
    return no(`Déjà récupéré. Reviens <t:${Math.floor((last + 24 * 36e5) / 1000)}:R>.`);
  const streak = now - last < 48 * 36e5 ? (w.streak ?? 0) + 1 : 1;
  const bonus = Math.min(streak, 10) * 25;
  const gain = config.economy.dailyAmount + bonus;
  const total = await addCoins(guild.id, user.id, gain);
  await stampEconomy(guild.id, user.id, "daily", new Date(), streak);
  return ok("Récompense quotidienne",
    `Tu reçois **${config.economy.currency} ${num(gain)}**${bonus ? ` (dont ${num(bonus)} de série)` : ""}.\nSolde : **${num(total)}** · série de ${streak} jour(s).`,
    COLORS.gold);
}

const JOBS = ["as modéré le chat", "as rangé les vocaux", "as animé un event", "as aidé un nouveau", "as trié les tickets", "as tenu la boutique"];

async function actionWork(guild, user) {
  const config = await getConfig(guild.id);
  if (!config.economy.enabled) return no("L'économie est désactivée.");
  const w = await getWallet(guild.id, user.id);
  const last = w.lastWork ? new Date(w.lastWork).getTime() : 0;
  if (Date.now() - last < config.economy.workCooldownMs)
    return no(`Repose-toi. Prochain travail <t:${Math.floor((last + config.economy.workCooldownMs) / 1000)}:R>.`);
  const gain = config.economy.workMin + Math.floor(Math.random() * (config.economy.workMax - config.economy.workMin + 1));
  const total = await addCoins(guild.id, user.id, gain);
  await stampEconomy(guild.id, user.id, "work", new Date());
  return ok("Travail terminé",
    `Tu ${JOBS[Math.floor(Math.random() * JOBS.length)]} et gagnes **${config.economy.currency} ${num(gain)}**.\nSolde : **${num(total)}**.`,
    COLORS.success);
}

/** Catalogue des types d'articles vendables. */
const ITEM_TYPES = {
  role:       { label: "Rôle du serveur", emoji: "🎭", needsRole: true,  desc: "Donne un rôle existant" },
  customrole: { label: "Rôle personnalisé", emoji: "✨", needsRole: false, desc: "L'acheteur choisit son nom et sa couleur" },
  xp:         { label: "XP", emoji: "📈", needsRole: false, desc: "Crédite directement de l'XP" },
  multiplier: { label: "Multiplicateur d'XP", emoji: "🚀", needsRole: false, desc: "Double l'XP pendant N heures" },
  pardon:     { label: "Pardon", emoji: "🕊️", needsRole: false, desc: "Efface le dernier avertissement" },
};

async function actionBuy(guild, member, itemId, extra = {}) {
  const config = await getConfig(guild.id);
  if (!config.economy.enabled) return no("L'économie est désactivée.");
  const item = config.economy.shop.find((x) => x.id === itemId);
  if (!item) return no("Article introuvable.");
  if (item.stock !== null && item.stock !== undefined && item.stock <= 0) return no("Rupture de stock.");

  const w = await getWallet(guild.id, member.id);
  if (w.coins < item.price) return no(`Il te manque ${config.economy.currency} **${num(item.price - w.coins)}**.`);

  const type = item.type ?? "role";
  let detail = "";

  /* ------------------------------ rôle simple ----------------------------- */
  if (type === "role") {
    const role = guild.roles.cache.get(item.roleId);
    if (!role) return no("Le rôle lié à cet article n'existe plus. Préviens un gestionnaire.");
    if (member.roles.cache.has(role.id)) return no("Tu possèdes déjà cet article.");
    if (role.position >= guild.members.me.roles.highest.position) return no("Je ne peux pas attribuer ce rôle (il est au-dessus du mien).");
    await member.roles.add(role.id, `Boutique : ${item.name}`).catch(() => null);
    detail = `Tu obtiens ${role}.`;
  }

  /* ---------------------------- rôle personnalisé ------------------------- */
  else if (type === "customrole") {
    const name = (extra.name ?? "").trim().slice(0, 60);
    if (!name) return no("Il faut un nom pour ton rôle personnalisé.");
    const color = /^#?[0-9a-f]{6}$/i.test(extra.color ?? "") ? Number.parseInt(extra.color.replace("#", ""), 16) : null;
    const existingId = config.economy.customRoles?.[member.id];
    let role = existingId ? guild.roles.cache.get(existingId) : null;

    if (role) {
      await role.edit({ name, ...(color !== null ? { color } : {}) }, `Boutique : ${item.name}`).catch(() => null);
      detail = `Ton rôle ${role} a été renommé.`;
    } else {
      if (guild.roles.cache.size >= 245) return no("Le serveur est proche de la limite de 250 rôles.");
      role = await guild.roles.create({ name, ...(color !== null ? { color } : {}), reason: `Boutique : ${member.user.tag}` }).catch(() => null);
      if (!role) return no("Création du rôle impossible — vérifie ma permission « Gérer les rôles ».");
      await member.roles.add(role.id).catch(() => null);
      await updateConfig(guild.id, { economy: { customRoles: { ...(config.economy.customRoles ?? {}), [member.id]: role.id } } });
      detail = `Ton rôle ${role} vient d'être créé rien que pour toi.`;
    }
  }

  /* ---------------------------------- XP ---------------------------------- */
  else if (type === "xp") {
    const amount = Number(item.amount) || 1000;
    const r = await addXp(guild.id, member.id, amount);
    detail = `**${num(amount)} XP** crédités — tu es niveau **${r?.level ?? "?"}**.`;
  }

  /* --------------------------- multiplicateur d'XP ------------------------ */
  else if (type === "multiplier") {
    const mult = Number(item.amount) || 2;
    const hours = Number(item.hours) || 24;
    const current = await getBoost(guild.id, member.id);
    const base = current && new Date(current.until) > new Date() ? new Date(current.until).getTime() : Date.now();
    const until = new Date(base + hours * 36e5);
    await setBoost(guild.id, member.id, mult, until);
    detail = `XP **×${mult}** jusqu'au <t:${Math.floor(until.getTime() / 1000)}:f>.`;
  }

  /* -------------------------------- pardon -------------------------------- */
  else if (type === "pardon") {
    const removed = await deleteLatestSanction(guild.id, member.id, "warn");
    if (!removed) return no("Tu n'as aucun avertissement à effacer.");
    const left = await countSanctions(guild.id, member.id, "warn");
    detail = `Ton dernier avertissement est effacé — il t'en reste **${left}**.`;
  }

  else return no("Type d'article inconnu.");

  await addCoins(guild.id, member.id, -item.price);
  if (item.stock !== null && item.stock !== undefined) {
    await updateConfig(guild.id, { economy: { shop: config.economy.shop.map((x) => (x.id === item.id ? { ...x, stock: x.stock - 1 } : x)) } });
  }

  await log(guild, "coins", embed({
    guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Achat boutique` },
    fields: [
      { name: "Membre", value: member.user.tag, inline: true },
      { name: "Article", value: `${ITEM_TYPES[type]?.emoji ?? ""} ${item.name}`, inline: true },
      { name: "Prix", value: num(item.price), inline: true },
    ],
  }));

  return ok("Achat validé", `**${item.name}** pour ${config.economy.currency} ${num(item.price)}.\n${detail}`, COLORS.gold);
}

async function actionPay(guild, from, toUser, amount) {
  const config = await getConfig(guild.id);
  if (!config.economy.enabled) return no("L'économie est désactivée.");
  if (toUser.id === from.id) return no("Tu ne peux pas te payer toi-même.");
  if (toUser.bot) return no("Les bots n'ont pas de portefeuille.");
  const w = await getWallet(guild.id, from.id);
  if (w.coins < amount) return no(`Solde insuffisant (${num(w.coins)}).`);
  await addCoins(guild.id, from.id, -amount);
  await addCoins(guild.id, toUser.id, amount);
  await log(guild, "coins", embed({
    guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Transfert` },
    fields: [
      { name: "De", value: from.tag ?? from.user?.tag ?? `<@${from.id}>`, inline: true },
      { name: "Vers", value: toUser.tag, inline: true },
      { name: "Montant", value: num(amount), inline: true },
    ],
  }));
  return ok("Transfert effectué", `**${config.economy.currency} ${num(amount)}** envoyés à ${toUser}.`, COLORS.gold);
}

async function actionGrantCoins(guild, target, amount, moderator, reason) {
  const total = await addCoins(guild.id, target.id, amount);
  await log(guild, "coins", embed({
    guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Ajustement` },
    fields: [
      { name: "Membre", value: target.user?.tag ?? target.tag, inline: true },
      { name: "Montant", value: `${amount >= 0 ? "+" : ""}${num(amount)}`, inline: true },
      { name: "Par", value: `<@${moderator.id}>`, inline: true },
      { name: "Raison", value: reason || "Non précisée" },
    ],
  }));
  return ok("Solde ajusté", `${amount >= 0 ? "+" : ""}${num(amount)} — nouveau solde : **${num(total)}**.`, COLORS.gold);
}

/* ========================================================================== */
/*                 10 - ESPACE COINS : REGLEMENT ET PANNEAUX                  */
/* ========================================================================== */

// coinsspace.js — remplissage complet de la catégorie ESPACE COINS.


const b = (id, label, style = ButtonStyle.Secondary, emoji) => {
  const x = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  if (emoji) x.setEmoji(emoji);
  return x;
};

/* ========================================================================== */
/*                          PANNEAUX DE L'ESPACE COINS                        */
/* ========================================================================== */

function shopPanel(guild, config) {
  return {
    embeds: [embed({
      guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Boutique` },
      description: [
        `Dépense tes ${config.economy.currency} contre du concret.`,
        "",
        "**🕊️ Pardon** — efface ton dernier avertissement",
        "**📈 XP** — crédité immédiatement sur ton niveau",
        "**🚀 Boost** — multiplie l'XP gagné pendant plusieurs heures",
        "**✨ Rôle personnalisé** — ton nom, ta couleur, à toi seul",
        "**🎭 Rôles du serveur** — les rôles mis en vente par le staff",
      ].join("\n"),
      footer: "Le stock et les prix évoluent — reviens régulièrement",
    })],
    components: [new ActionRowBuilder().addComponents(
      b("pub:shop", "Ouvrir la boutique", ButtonStyle.Success, "🛒"),
      b("pub:coins", "Mon solde", ButtonStyle.Primary, "🪙"),
    )],
  };
}

function rewardPanel(guild, config) {
  const e = config.economy;
  return {
    embeds: [embed({
      guild, color: COLORS.success, author: { name: "🎁  Tes récompenses" },
      description: "Récupère ce que tu as gagné. Tout est gratuit, il suffit de revenir.",
      fields: [
        { name: "🎁 Quotidien", value: `${e.currency} ${num(e.dailyAmount)} par jour\n+25 par jour de série, jusqu'à +250`, inline: true },
        { name: "💼 Travail", value: `${e.currency} ${num(e.workMin)}–${num(e.workMax)}\ntoutes les ${Math.round(e.workCooldownMs / 60000)} min`, inline: true },
        { name: "📦 Colis", value: "Tombent au hasard\nPremier arrivé, premier servi", inline: true },
      ],
      footer: "Oublier un jour casse ta série : reviens toutes les 24 h",
    })],
    components: [new ActionRowBuilder().addComponents(
      b("pub:daily", "Quotidien", ButtonStyle.Success, "🎁"),
      b("pub:work", "Travailler", ButtonStyle.Success, "💼"),
      b("pub:coins", "Mon solde", ButtonStyle.Primary, "🪙"),
      b("pub:top:coins", "Classement", ButtonStyle.Secondary, "🏆"),
    )],
  };
}

function rulesEmbed(guild, config) {
  const c = config.economy.currency;
  return embed({
    guild, color: COLORS.gold, author: { name: "📜  Règlement de l'espace coins" },
    description: [
      `Les ${c} coins sont la monnaie du serveur. Ils s'obtiennent en participant, et se dépensent en boutique.`,
      "Participer ici vaut acceptation de ces règles.",
    ].join("\n"),
    fields: [
      {
        name: "1 · Un compte par personne",
        value: "Les comptes multiples, alternatifs ou partagés sont interdits. Tout gain obtenu ainsi est retiré et le compte principal est sanctionné.",
      },
      {
        name: "2 · Pas de triche au gain",
        value: "Flood pour l'XP, macros, bots d'auto-clic, salons vocaux tenus micro coupé pour farmer : solde remis à zéro et exclusion de l'espace coins.",
      },
      {
        name: "3 · Les échanges sont à vos risques",
        value: `Les transferts entre membres sont autorisés et définitifs. Le staff ne rembourse **aucun** ${c} envoyé par erreur, ni aucune arnaque entre membres.`,
      },
      {
        name: "4 · Aucune valeur réelle",
        value: "Les coins ne s'achètent ni ne se revendent contre de l'argent, du Nitro, des Robux ou quoi que ce soit d'extérieur au serveur. Toute proposition de ce type est signalée.",
      },
      {
        name: "5 · Les achats sont fermes",
        value: "Un article acheté n'est ni remboursé ni échangé. Vérifiez avant de valider. Un rôle personnalisé retiré pour non-respect du règlement n'est pas remboursé.",
      },
      {
        name: "6 · Rôles personnalisés",
        value: "Nom et couleur doivent respecter le règlement du serveur : pas d'insulte, pas d'usurpation d'un membre du staff, pas de contenu choquant. Le staff peut renommer ou supprimer sans préavis.",
      },
      {
        name: "7 · Le staff a le dernier mot",
        value: "Les prix, gains et stocks peuvent changer à tout moment. En cas d'abus, le staff peut ajuster ou remettre à zéro un solde. Les décisions se contestent en ticket, jamais en salon public.",
      },
    ],
    footer: "Un doute ? Ouvre un ticket dans le centre d'aide",
  });
}

function howToPlayEmbed(guild, config) {
  const c = config.economy.currency;
  const e = config.economy;
  return embed({
    guild, color: COLORS.primary, author: { name: "💡  Comment gagner des coins" },
    description: `Cinq façons de remplir ta bourse. Aucune ne demande de payer quoi que ce soit.`,
    fields: [
      {
        name: "💬 Parler dans le chat",
        value: "15 à 25 XP par message, une fois par minute maximum. L'XP fait monter ton niveau, et les niveaux débloquent des rôles.",
      },
      {
        name: "🔊 Rester en vocal",
        value: voiceSummary(config) + "\nLe plus rentable du serveur : tu gagnes sans rien faire, tant que tu es accompagné.",
      },
      {
        name: "🎁 La récompense quotidienne",
        value: `${c} ${num(e.dailyAmount)} par jour, plus un bonus de série qui grimpe jusqu'à +250. Reviens tous les jours sans en sauter un.`,
      },
      {
        name: "💼 Le travail",
        value: `${c} ${num(e.workMin)} à ${num(e.workMax)}, toutes les ${Math.round(e.workCooldownMs / 60000)} minutes. Le geste le plus rentable si tu es actif.`,
      },
      {
        name: "📦 Les colis",
        value: "Des colis tombent au hasard dans le salon dédié. Le premier à appuyer sur le bouton rafle tout.",
      },
      {
        name: "🛒 Et après ?",
        value: "Direction la boutique : pardon d'avertissement, XP, multiplicateurs, rôle personnalisé à ton nom.",
      },
    ],
    footer: "Ton solde et ton niveau te suivent partout sur le serveur",
  });
}

/* ========================================================================== */
/*                              INSTALLATION                                  */
/* ========================================================================== */

const TARGETS = {
  rules: ["reglement-coins", "regles-coins"],
  howto: ["comment-jouer"],
  shop: ["boutique-coins"],
  rewards: ["recompense", "recompenses"],
  drops: ["drop-colis"],
  commands: ["cmds-coins", "commandes-coins"],
  access: ["acces-coins"],
};

/**
 * Remplit toute la catégorie ESPACE COINS et branche les réglages.
 * Remplace ses propres messages s'ils existent déjà (pas de doublon).
 */
async function setupCoinsSpace(guild, memberPanelFactory) {
  const config = await getConfig(guild.id);
  const report = [];
  const patch = { economy: {} };

  /** Modifie notre message existant, sinon en poste un nouveau. */
  const publishOrEdit = async (channel, payload) => {
    let mine = null;
    try {
      const recent = await channel.messages.fetch({ limit: 20 });
      const list = typeof recent?.find === "function" ? recent : [...(recent?.values?.() ?? [])];
      mine = list.find((m) => m.author?.id === guild.members.me.id && m.embeds?.length);
    } catch { mine = null; }
    if (mine) return mine.edit(payload).catch(() => channel.send(payload).catch(() => null));
    return channel.send(payload).catch(() => null);
  };

  const publish = async (key, payload, label) => {
    const channel = findChannel(guild, TARGETS[key]);
    if (!channel) { report.push({ ok: false, label, detail: `Salon introuvable (${TARGETS[key][0]})` }); return null; }
    if (!canSend(channel)) { report.push({ ok: false, label, detail: `Je ne peux pas écrire dans ${channel}` }); return null; }

    await publishOrEdit(channel, payload);
    report.push({ ok: true, label, detail: `${channel}` });
    return channel;
  };

  await publish("rules", { embeds: [rulesEmbed(guild, config)] }, "Règlement");
  await publish("howto", { embeds: [howToPlayEmbed(guild, config)] }, "Guide « comment jouer »");
  await publish("shop", shopPanel(guild, config), "Panneau boutique");
  await publish("rewards", rewardPanel(guild, config), "Panneau récompenses");
  if (memberPanelFactory) await publish("commands", memberPanelFactory(guild), "Panneau membre complet");

  const dropCh = findChannel(guild, TARGETS.drops);
  if (dropCh && canSend(dropCh)) {
    patch.economy.dropChannelId = dropCh.id;
    if (!config.economy.dropChance) patch.economy.dropChance = 4;
    report.push({ ok: true, label: "Colis automatiques", detail: `${dropCh} · 4 % de chance par message` });
  } else {
    report.push({ ok: false, label: "Colis automatiques", detail: "Salon drop-colis introuvable" });
  }

  const accessCh = findChannel(guild, TARGETS.access);
  const coinRole = guild.roles.cache.find((r) => /coins?/i.test(r.name) && !r.managed && r.id !== guild.id);
  if (accessCh && canSend(accessCh) && coinRole) {
    await publishOrEdit(accessCh, {
      embeds: [embed({ guild, color: COLORS.gold, author: { name: "🎰  Rejoindre l'espace coins" },
        description: `Choisis ${coinRole} dans le menu pour accéder à tous les salons de l'espace coins. Reviens ici pour le retirer.` })],
      components: [new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder().setCustomId("rolemenu")
          .setPlaceholder("Rejoindre / quitter l'espace coins").setMinValues(0).setMaxValues(1)
          .addOptions([{ label: coinRole.name.slice(0, 100), value: coinRole.id }]))],
    });
    report.push({ ok: true, label: "Accès à l'espace", detail: `${accessCh} → ${coinRole}` });
  } else {
    report.push({ ok: false, label: "Accès à l'espace",
      detail: coinRole ? "Salon accès-coins introuvable" : "Aucun rôle contenant « coins » — crée-le puis relance" });
  }

  if (Object.keys(patch.economy).length) await updateConfig(guild.id, patch);

  return { report, ok: report.filter((r) => r.ok).length, ko: report.filter((r) => !r.ok).length };
}

/* ========================================================================== */
/*                       11 - INSTALLATION AUTOMATIQUE                        */
/* ========================================================================== */

// setup.js — installation automatique. Un bouton, tout est branché.


/** Réglages appliqués par défaut — calibrés pour un très gros serveur. */
const RECOMMENDED = {
  logsEnabled: true,
  levelsEnabled: true,
  automod: {
    enabled: true, antiInvite: true, antiLink: false, antiSpam: true,
    spamThreshold: 6, spamWindowMs: 7000, spamTimeoutMinutes: 10,
    maxMentions: 6, capsPercent: 80, maxEmojis: 0, warnOnDelete: true,
  },
  antiraid: {
    enabled: true, joinThreshold: 10, joinWindowMs: 10_000,
    minAccountAgeDays: 3, onRaid: "lockdown", lockdownMinutes: 15,
  },
  antinuke: {
    enabled: true, channelDeleteMax: 3, roleDeleteMax: 3, banMax: 5, kickMax: 5,
    windowMs: 20_000, punishment: "strip",
  },
  economy: {
    enabled: true, currency: "🪙", dailyAmount: 250,
    workMin: 40, workMax: 180, workCooldownMs: 30 * 60_000,
    dropMin: 100, dropMax: 800, dropChance: 0,
  },
};

/** Noms de salons cherchés pour les fonctions optionnelles. */
const WELCOME_NAMES = ["bienvenue", "welcome", "arrivees", "arrivée", "arrivees-membres", "annonces", "chat"];

const step = (ok, label, detail) => ({ ok, label, detail });

/**
 * Configure tout ce qui peut l'être automatiquement.
 * @returns {Promise<{steps: Array, applied: number, missing: number}>}
 */
async function autoSetup(guild, user) {
  const steps = [];
  const patch = structuredClone(RECOMMENDED);
  const me = guild.members.me;

  /* 1 — index des salons ------------------------------------------------- */
  const idx = buildIndex(guild);
  const routed = Object.keys(LOG_ROUTES).filter((k) => findChannel(guild, LOG_ROUTES[k])).length;
  steps.push(step(routed > 0, "Salons indexés",
    `${idx.channels} salons, ${idx.categories} catégories — ${routed}/${Object.keys(LOG_ROUTES).length} types de journaux routés`));

  /* 2 — niveaux de permission -------------------------------------------- */
  const detected = autoDetectRoles(guild);
  if (detected.length) {
    patch.perms = { roles: Object.fromEntries(detected.map((d) => [d.role.id, d.level])) };
    steps.push(step(true, "Rôles staff classés",
      detected.map((d) => `\`${d.level}\` ${d.role}`).join(" · ")));
  } else {
    steps.push(step(false, "Rôles staff non reconnus",
      "Aucun nom de rôle du type Admin, Gestion, Modérateur, Animateur — à classer à la main dans Permissions"));
  }

  /* 3 — rôle staff pour les tickets --------------------------------------- */
  const entryStaff = [...detected].filter((d) => d.level >= 1).sort((a, b) => a.level - b.level)[0];
  if (entryStaff) {
    patch.staffRoleId = entryStaff.role.id;
    steps.push(step(true, "Rôle staff des tickets", `${entryStaff.role} verra les tickets ouverts`));
  } else {
    steps.push(step(false, "Rôle staff des tickets", "À définir dans Configuration — sans lui personne ne voit les tickets"));
  }

  /* 3b — rôle de confiance « Like » ---------------------------------------- */
  const trusted = await syncTrustedRole(guild).catch(() => ({ found: false }));
  if (trusted.found) {
    patch.trustedRoleId = trusted.role.id;
    patch.perms = patch.perms ?? {};
    patch.perms.roles = { ...(patch.perms.roles ?? {}), [trusted.role.id]: Math.max(5, Number(patch.perms.roles?.[trusted.role.id] ?? 0)) };
    steps.push(step(true, "Rôle de confiance « Like me »",
      `${trusted.role} — accès à la boutique, aux niveaux, aux compteurs, à l'automod et à la modération complète`));
  } else {
    steps.push(step(false, "Rôle de confiance « Like me »",
      "Aucun rôle nommé « Like me » — crée-le, ou désigne-le dans Configuration → Rôles clés"));
  }

  /* 4 — rôle Alcatraz ------------------------------------------------------ */
  let jail = guild.roles.cache.find((r) => /alcatraz|prison|prisonnier|jail/i.test(r.name) && !r.managed);
  if (!jail && me.permissions.has(PermissionFlagsBits.ManageRoles)) {
    jail = await guild.roles.create({
      name: "🤚 Alcatraz", color: 0x2b2d31, permissions: [],
      reason: `Installation automatique de 0x par ${user.tag}`,
    }).catch(() => null);
    if (jail) steps.push(step(true, "Rôle Alcatraz créé", `${jail} — pense à lui retirer l'accès aux salons publics`));
  }
  if (jail) {
    patch.jailRoleId = jail.id;
    if (!steps.some((s) => s.label === "Rôle Alcatraz créé")) steps.push(step(true, "Rôle Alcatraz trouvé", `${jail}`));
  } else {
    steps.push(step(false, "Rôle Alcatraz", "Création impossible — donne-moi la permission Gérer les rôles"));
  }

  /* 5 — compteurs vocaux --------------------------------------------------- */
  const counters = {};
  const foundCounters = [];
  for (const c of COUNTERS) {
    const ch = guild.channels.cache.find(
      (x) => (x.type === ChannelType.GuildVoice || x.type === ChannelType.GuildStageVoice) && c.test.test(x.name));
    if (ch) { counters[c.key] = ch.id; foundCounters.push(`${c.key} → ${ch.name}`); }
  }
  patch.counters = counters;
  steps.push(step(foundCounters.length === COUNTERS.length,
    `Compteurs vocaux (${foundCounters.length}/${COUNTERS.length})`,
    foundCounters.length ? foundCounters.join(" · ") : "Aucun salon vocal au format « Nom : nombre »"));

  /* 6 — salons fonctionnels ------------------------------------------------ */
  const funcFound = Object.keys(FUNC_CHANNELS).filter((k) => findChannel(guild, FUNC_CHANNELS[k]));
  steps.push(step(funcFound.length >= 6, `Salons fonctionnels (${funcFound.length}/${Object.keys(FUNC_CHANNELS).length})`,
    funcFound.length ? funcFound.join(", ") : "Aucun détecté"));

  /* 7 — salon d'accueil ---------------------------------------------------- */
  const welcome = findChannel(guild, WELCOME_NAMES);
  if (welcome && canSend(welcome)) {
    patch.welcomeChannelId = welcome.id;
    steps.push(step(true, "Salon de bienvenue", `${welcome}`));
  } else {
    steps.push(step(false, "Salon de bienvenue", "Aucun salon nommé bienvenue/welcome — à définir dans Configuration"));
  }

  /* 8 — salon des colis ---------------------------------------------------- */
  const drops = findChannel(guild, FUNC_CHANNELS.drops);
  if (drops) { patch.economy.dropChannelId = drops.id; steps.push(step(true, "Salon des colis", `${drops}`)); }

  /* 8b — invitations ------------------------------------------------------- */
  const inviteCh = findChannel(guild, FUNC_CHANNELS.invites);
  const cached = await cacheInvites(guild).catch(() => 0);
  if (inviteCh) patch.invites = { enabled: true, channelId: inviteCh.id, deleteAfterMs: 120_000 };
  steps.push(step(!!inviteCh && cached > 0, "Suivi des invitations",
    inviteCh ? `Annonces dans ${inviteCh} · ${cached} lien(s) en cache · suppression après 2 min`
      : "Aucun salon #invitations — les annonces iront dans le salon de bienvenue"));

  /* 8c — boutique de départ ------------------------------------------------ */
  const cfgNow = await getConfig(guild.id);
  if (!cfgNow.economy.shop?.length) {
    patch.economy.shop = [
      { id: "pardon-pardon", type: "pardon", name: "Pardon", price: 5000, roleId: null, amount: null, hours: null, stock: null },
      { id: "xp-1000-xp", type: "xp", name: "1 000 XP", price: 1500, roleId: null, amount: 1000, hours: null, stock: null },
      { id: "xp-5000-xp", type: "xp", name: "5 000 XP", price: 6000, roleId: null, amount: 5000, hours: null, stock: null },
      { id: "multiplier-boost-x2-24h", type: "multiplier", name: "Boost XP ×2 (24 h)", price: 3000, roleId: null, amount: 2, hours: 24, stock: null },
      { id: "multiplier-boost-x3-6h", type: "multiplier", name: "Boost XP ×3 (6 h)", price: 4000, roleId: null, amount: 3, hours: 6, stock: null },
      { id: "customrole-role-personnalise", type: "customrole", name: "Rôle personnalisé", price: 25000, roleId: null, amount: null, hours: null, stock: 100 },
    ];
    steps.push(step(true, "Boutique garnie",
      "6 articles de départ : Pardon, 1 000 XP, 5 000 XP, boosts ×2 et ×3, rôle personnalisé — aucun ne dépend d'un rôle existant"));
  } else {
    steps.push(step(true, "Boutique", `${cfgNow.economy.shop.length} article(s) déjà en place, rien de touché`));
  }

  /* 8d — espace coins ------------------------------------------------------- */
  await updateConfig(guild.id, patch);   // la boutique doit exister avant d'écrire les panneaux
  const space = await setupCoinsSpace(guild, memberPanel).catch(() => null);
  if (space) {
    steps.push(step(space.ko === 0, `Espace coins (${space.ok}/${space.ok + space.ko})`,
      space.report.filter((r) => r.ok).map((r) => r.label).join(", ") || "aucun salon rempli"));
  }

  /* 9 — catégories de tickets ---------------------------------------------- */
  const cats = TICKET_TYPES.filter((t) => findCategory(guild, t.categories));
  steps.push(step(cats.length === TICKET_TYPES.length, `Catégories de tickets (${cats.length}/${TICKET_TYPES.length})`,
    cats.length === TICKET_TYPES.length ? "Toutes trouvées"
      : `Manquantes : ${TICKET_TYPES.filter((t) => !cats.includes(t)).map((t) => t.label).join(", ")}`));

  /* 10 — permissions du bot ------------------------------------------------ */
  const missingPerms = [];
  if (!me.permissions.has(PermissionFlagsBits.ViewAuditLog)) missingPerms.push("Voir les logs d'audit");
  if (!me.permissions.has(PermissionFlagsBits.ManageRoles)) missingPerms.push("Gérer les rôles");
  if (!me.permissions.has(PermissionFlagsBits.ManageChannels)) missingPerms.push("Gérer les salons");
  if (!me.permissions.has(PermissionFlagsBits.BanMembers)) missingPerms.push("Bannir");
  if (!me.permissions.has(PermissionFlagsBits.ModerateMembers)) missingPerms.push("Réduire au silence");
  if (!me.permissions.has(PermissionFlagsBits.ManageGuild)) missingPerms.push("Gérer le serveur (suivi des invitations)");
  steps.push(step(missingPerms.length === 0, "Permissions du bot",
    missingPerms.length ? `Manquantes : ${missingPerms.join(", ")} — réinvite-moi en Administrateur` : "Toutes présentes"));

  /* 11 — enregistrement ---------------------------------------------------- */
  await updateConfig(guild.id, patch);
  steps.push(step(true, "Protections activées",
    "Automod, anti-raid, anti-nuke, journaux, niveaux et économie sont en marche avec les réglages recommandés"));

  /* 12 — mise à jour immédiate --------------------------------------------- */
  await updateCounters(guild, true).catch(() => null);
  await refreshTicketCounter(guild).catch(() => null);

  return {
    steps,
    applied: steps.filter((s) => s.ok).length,
    missing: steps.filter((s) => !s.ok).length,
  };
}

/** Publie d'un coup tous les panneaux publics dans les salons détectés. */
async function publishAll(guild) {
  const config = await getConfig(guild.id);
  const done = [];

  const ticketCh = findChannel(guild, FUNC_CHANNELS.ticketPanel);
  if (ticketCh && canSend(ticketCh)) {
    await ticketCh.send({
      embeds: [embed({ guild, author: { name: `${ICONS.ticket}  Centre d'aide` }, color: COLORS.primary,
        description: "Choisis le type de ticket dans le menu. Un salon privé sera créé avec le staff concerné.\n\nLes ouvertures abusives sont sanctionnées." })],
      components: ticketPanelComponents(),
    }).catch(() => null);
    done.push(`Tickets → ${ticketCh}`);
  }

  const confessCh = findChannel(guild, FUNC_CHANNELS.confessionPost);
  if (confessCh && canSend(confessCh)) {
    await confessCh.send(confessionPanel(guild)).catch(() => null);
    done.push(`Confessions → ${confessCh}`);
  }

  const memberCh = findChannel(guild, ["commandes", "cmds", "bot", "chat"]);
  if (memberCh && canSend(memberCh)) {
    await memberCh.send(memberPanel(guild)).catch(() => null);
    done.push(`Espace membre → ${memberCh}`);
  }

  return done;
}

/** Résumé visuel d'une installation. */
function setupReport(guild, result) {
  return embed({
    guild,
    color: result.missing === 0 ? COLORS.success : COLORS.warning,
    author: { name: "⚡  Installation automatique" },
    description: [
      result.missing === 0
        ? `### ${ICONS.ok} Tout est branché`
        : `### ${result.applied} étape(s) réussie(s), ${result.missing} à finir à la main`,
      "",
      ...result.steps.map((s) => `${s.ok ? "✅" : "⚠️"} **${s.label}**\n └ ${s.detail}`),
    ].join("\n").slice(0, 4000),
    footer: "Relance l'installation quand tu changes ton serveur — rien n'est écrasé inutilement",
  });
}

/* ========================================================================== */
/*             12 - PANNEAU, MENUS CONTEXTUELS, PANNEAUX PUBLICS              */
/* ========================================================================== */

// panel.js — l'interface complète. Tout réglage du bot est atteignable ici.


/* ========================================================================== */
/*                                  SECTIONS                                  */
/* ========================================================================== */

const SECTIONS = [
  // trusted : accessible au rôle « Like » et au propriétaire de 0x
  // ownerOnly : propriétaire de 0x uniquement
  { id: "mod", label: "Modération", emoji: "🛡️", level: 1, desc: "Sanctionner, purger, mode lent, casiers" },
  { id: "staff", label: "Équipe", emoji: "🗓️", level: 1, desc: "Absences, effectif, état du serveur" },
  { id: "invites", label: "Invitations", emoji: "🔗", level: 1, desc: "Classement, parrain d'un membre, réglages" },
  { id: "publish", label: "Publications", emoji: "📢", level: 3, desc: "Panneaux, rôles, annonces, sondages" },
  { id: "tickets", label: "Tickets", emoji: "🎫", level: 4, desc: "Panneau, statistiques, compteur" },
  { id: "gw", label: "Giveaways", emoji: "🎁", level: 4, desc: "Lancer, terminer, retirer au sort" },
  { id: "counters", label: "Compteurs", emoji: "📊", level: 4, desc: "Membres, connectés, vocal", trusted: true },
  { id: "eco", label: "Économie", emoji: "🪙", level: 4, desc: "Coins, boutique, colis", trusted: true },
  { id: "levels", label: "Niveaux", emoji: "📈", level: 4, desc: "XP, récompenses, annonces", trusted: true },
  { id: "voice", label: "Vocal", emoji: "🔊", level: 4, desc: "XP et coins gagnés en vocal", trusted: true },
  { id: "channels", label: "Droits des salons", emoji: "🔐", level: 4, desc: "Qui peut voir, écrire et parler où", trusted: true },
  { id: "automod", label: "Automod", emoji: "🤖", level: 5, desc: "Filtres de messages", trusted: true },
  { id: "logs", label: "Journaux", emoji: "🗂️", level: 5, desc: "Routage de chaque type de log", ownerOnly: true },
  { id: "config", label: "Configuration", emoji: "⚙️", level: 5, desc: "Rôles, accueil, salons, piège vocal", ownerOnly: true },
  { id: "protect", label: "Protection", emoji: "🚨", level: 6, desc: "Anti-raid, anti-nuke, lockdown", ownerOnly: true },
  { id: "perms", label: "Permissions", emoji: "🔐", level: 6, desc: "Niveaux des rôles et des sections", ownerOnly: true },
];

const sectionLevel = (s, config) => Number(config?.perms?.sections?.[s.id] ?? s.level);

function canOpen(section, member, config) {
  if (!section) return false;
  if (section.ownerOnly && !isOwner(member.id)) return false;
  if (section.trusted && !isTrusted(member, config)) return false;
  return permLevel(member, config) >= sectionLevel(section, config);
}

/** Refus lisible selon le type de verrou. */
function denyView(guild, section, config) {
  const trustedName = config?.trustedRoleId ? `<@&${config.trustedRoleId}>` : "**Like me**";
  return {
    embeds: [embed({ guild, color: COLORS.danger, author: { name: "🔒  Section verrouillée" },
      description: section.ownerOnly
        ? `**${section.emoji} ${section.label}** touche au cœur de 0x.\nSeul <@${OWNER_ID}> peut y accéder.`
        : `**${section.emoji} ${section.label}** est réservée au rôle ${trustedName} et à <@${OWNER_ID}>.`,
      footer: section.ownerOnly ? "Verrou par identifiant" : "Verrou par rôle de confiance" })],
    components: [backRow()],
  };
}

const btn = (id, label, style = ButtonStyle.Secondary, emoji) => {
  const b = new ButtonBuilder().setCustomId(id).setLabel(label).setStyle(style);
  if (emoji) b.setEmoji(emoji);
  return b;
};
const row = (...c) => new ActionRowBuilder().addComponents(...c);
const backRow = (to = "p:home") => row(btn(to, "Retour", ButtonStyle.Secondary, "◀️"));
const onOff = (v) => (v ? "🟢 activé" : "🔴 coupé");
const dot = (v) => (v ? "🟢" : "🔴");


async function respond(i, payload) {
  try {
    if (i.isModalSubmit() && !i.isFromMessage()) return await i.reply({ ...payload, ...EPH });
    if (i.replied || i.deferred) return await i.editReply(payload);
    return await i.update(payload);
  } catch {
    return i.followUp({ ...payload, ...EPH }).catch(() => null);
  }
}

async function feedback(i, result, sectionId, page) {
  const view = await buildSection(sectionId ?? "home", i, await getConfig(i.guildId), page);
  const banner = embed({ guild: i.guild, color: result.color ?? COLORS.success,
    author: { name: `${result.ok === false ? ICONS.no : ICONS.ok}  ${result.title ?? "Terminé"}` },
    description: result.text });
  return respond(i, { embeds: [banner, ...view.embeds], components: view.components });
}

function modal(id, title, fields) {
  const m = new ModalBuilder().setCustomId(id).setTitle(title.slice(0, 45));
  for (const f of fields.slice(0, 5)) {
    const input = new TextInputBuilder().setCustomId(f.id).setLabel(f.label.slice(0, 45))
      .setStyle(f.long ? TextInputStyle.Paragraph : TextInputStyle.Short).setRequired(f.required ?? false);
    if (f.value !== undefined && f.value !== null) input.setValue(String(f.value).slice(0, 4000));
    if (f.placeholder) input.setPlaceholder(f.placeholder.slice(0, 100));
    if (f.max) input.setMaxLength(f.max);
    m.addComponents(row(input));
  }
  return m;
}

/** Modale d'ajout d'article, adaptée au type. */
function itemModal(type, roleId) {
  const fields = [
    { id: "name", label: "Nom affiché en boutique", required: true, max: 60 },
    { id: "price", label: "Prix en coins", required: true, max: 10 },
  ];
  if (type === "xp") fields.push({ id: "amount", label: "XP crédités", required: true, value: "1000", max: 8 });
  if (type === "multiplier") {
    fields.push({ id: "amount", label: "Multiplicateur (2 = double)", required: true, value: "2", max: 4 });
    fields.push({ id: "hours", label: "Durée en heures", required: true, value: "24", max: 4 });
  }
  fields.push({ id: "stock", label: "Stock (vide = illimité)", max: 6 });
  return modal(`pm:eco:additem:${type}_${roleId}`, `Article — ${ITEM_TYPES[type]?.label ?? type}`, fields);
}

const REASON = { id: "reason", label: "Raison", required: true, max: 400 };
const DURATION = { id: "duration", label: "Durée (30s, 10m, 2h, 7d)", placeholder: "vide = indéterminée", max: 12 };
const LEVEL_OPTIONS = [0, 1, 2, 3, 4, 5, 6].map((l) => ({ label: PERM_LABELS[l], value: String(l) }));

/* ========================================================================== */
/*                                 DIAGNOSTIC                                 */
/* ========================================================================== */

async function diagnose(guild, config) {
  const items = [];
  const push = (ok, label, hint) => items.push({ ok, label, hint });

  push(usingDatabase(), "Base de données PostgreSQL",
    "Railway → + New → PostgreSQL, puis variable DATABASE_URL — sinon tout est perdu au redémarrage");
  const routed = Object.keys(LOG_ROUTES).filter((k) => resolveLogChannel(guild, k, config)).length;
  push(routed >= Object.keys(LOG_ROUTES).length * 0.8, `Journaux routés (${routed}/${Object.keys(LOG_ROUTES).length})`,
    "Section Journaux → Rescanner, puis force les manquants");
  push(Object.keys(config.perms.roles).length > 0, "Niveaux de permission attribués", "Bouton Tout installer");
  push(!!config.staffRoleId, "Rôle staff défini", "Configuration → Rôles");
  push(!!config.jailRoleId, "Rôle Alcatraz défini", "Configuration → Rôles");
  const cats = TICKET_TYPES.filter((t) => findCategory(guild, t.categories)).length;
  push(cats === TICKET_TYPES.length, `Catégories de tickets (${cats}/${TICKET_TYPES.length})`,
    "Nomme-les Tickets Staff, Tickets Abus, Tickets Animation, Tickets Coins, Tickets Partenariats, Tickets Couronne");
  const counts = await computeCounts(guild);
  push(counts.online !== null, "Intent Presence", "Portail développeur → Bot → Presence Intent");
  push(counts.cacheRatio > 0.5, `Cache des membres (${Math.round(counts.cacheRatio * 100)}%)`,
    "Portail développeur → Bot → Server Members Intent");
  const me = guild.members.me;
  push(me.permissions.has(PermissionFlagsBits.ViewAuditLog), "Logs d'audit", "Nécessaires à l'anti-nuke");
  push(me.permissions.has(PermissionFlagsBits.Administrator), "Rôle de 0x tout en haut",
    "Paramètres du serveur → Rôles → remonte 0x");
  return items;
}

/* ========================================================================== */
/*                                   ACCUEIL                                  */
/* ========================================================================== */

async function homeView(i, config) {
  const level = permLevel(i.member, config);
  const owner = isOwner(i.user.id);
  const checks = owner ? await diagnose(i.guild, config) : [];
  const counts = await computeCounts(i.guild);
  const problems = checks.filter((c) => !c.ok);

  const etat = [
    `${dot(config.automod.enabled)} Automod`, `${dot(config.antiraid.enabled)} Anti-raid`,
    `${dot(config.antinuke.enabled)} Anti-nuke`, `${dot(config.logsEnabled)} Journaux`,
    `${dot(config.levelsEnabled)} Niveaux`, `${dot(config.economy.enabled)} Économie`,
  ].join("  ·  ");

  const main = embed({
    guild: i.guild,
    author: { name: "0x  —  panneau de contrôle" },
    color: !owner ? COLORS.primary : problems.length ? COLORS.warning : COLORS.success,
    description: [
      `**${i.guild.name}** · ${num(counts.members)} membres · ${counts.voice} en vocal`,
      `Ton niveau : **${PERM_LABELS[level]}**`, "", etat, "",
      !owner ? `### ${ICONS.info} Sections opérationnelles`
        : problems.length ? `### ${ICONS.alert} ${problems.length} point(s) à régler`
        : `### ${ICONS.ok} Tout est en place`,
      ...(!owner ? ["Les réglages de 0x sont verrouillés. Tu as accès aux sections de travail ci-dessous."]
        : problems.length ? ["Appuie sur **Tout installer** — il règle presque tout seul.", "",
            ...problems.slice(0, 6).map((p) => `🔴 **${p.label}**\n └ ${p.hint}`)]
        : ["Aucune action requise."]),
    ].join("\n"),
  });

  const allowed = SECTIONS.filter((s) => canOpen(s, i.member, config));
  const components = [];

  if (owner) {
    components.push(row(
      btn("p:setup:run", "Tout installer", ButtonStyle.Success, "⚡"),
      btn("p:setup:publish", "Publier les panneaux", ButtonStyle.Primary, "📢"),
      btn("p:setup:defaults", "Réglages recommandés", ButtonStyle.Secondary, "🎚️"),
      btn("p:home", "Rafraîchir", ButtonStyle.Secondary, "🔄"),
    ));
    components.push(row(
      btn("p:sw:automod", "Automod", config.automod.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
      btn("p:sw:antiraid", "Anti-raid", config.antiraid.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
      btn("p:sw:antinuke", "Anti-nuke", config.antinuke.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
      btn("p:sw:logs", "Journaux", config.logsEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
      btn("p:sw:levels", "Niveaux", config.levelsEnabled ? ButtonStyle.Success : ButtonStyle.Danger),
    ));
  }

  components.push(row(new StringSelectMenuBuilder().setCustomId("p:go")
    .setPlaceholder(allowed.length ? "Ouvrir une section…" : "Aucune section accessible à ton niveau")
    .setDisabled(!allowed.length)
    .addOptions(allowed.length
      ? allowed.map((s) => ({ label: s.label, value: s.id, emoji: s.emoji, description: s.desc.slice(0, 100) }))
      : [{ label: "—", value: "none" }])));

  return { embeds: [main], components };
}

/* ========================================================================== */
/*                            CONSTRUCTION DES VUES                           */
/* ========================================================================== */

async function buildSection(id, i, config, page = null) {
  const guild = i.guild;
  const level = permLevel(i.member, config);
  const section = SECTIONS.find((s) => s.id === id);

  if (id !== "home" && section) {
    if (section.ownerOnly && !isOwner(i.user.id)) return denyView(guild, section, config);
    if (section.trusted && !isTrusted(i.member, config)) return denyView(guild, section, config);
    if (level < sectionLevel(section, config)) {
      return { embeds: [embed({ guild, color: COLORS.danger, author: { name: `${ICONS.no}  Accès refusé` },
        description: `Cette section demande **${PERM_LABELS[sectionLevel(section, config)]}**.` })], components: [backRow()] };
    }
  }

  if (id === "home") return homeView(i, config);

  /* ------------------------------ MODÉRATION ----------------------------- */
  if (id === "mod") {
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.shield}  Modération` }, color: COLORS.primary,
        description: "Choisis un membre pour ouvrir sa fiche complète, ou agis directement sur un salon.",
        footer: "Tu ne peux agir que sur un niveau de perm inférieur au tien" })],
      components: [
        row(new UserSelectMenuBuilder().setCustomId("p:mod:pick").setPlaceholder("Sélectionne un membre…")),
        row(
          btn("p:mod:purge", "Purger ici", ButtonStyle.Danger, "🧹"),
          btn("p:mod:purgeother", "Purger ailleurs", ButtonStyle.Danger, "🧹"),
          btn("p:mod:slow", "Mode lent", ButtonStyle.Secondary, "🐌"),
          btn("p:mod:lock", "Verrouiller ce salon", ButtonStyle.Secondary, "🔒"),
          btn("p:mod:unban", "Débannir un ID", ButtonStyle.Secondary, "♻️"),
        ),
        backRow(),
      ],
    };
  }

  /* -------------------------------- ÉQUIPE ------------------------------- */
  if (id === "staff") {
    const abs = await listAbsences(guild.id);
    const counts = await computeCounts(guild);
    const staffRole = config.staffRoleId ? guild.roles.cache.get(config.staffRoleId) : null;
    return {
      embeds: [embed({ guild, author: { name: "🗓️  Équipe" }, color: COLORS.primary,
        fields: [
          { name: "Membres", value: num(counts.members), inline: true },
          { name: "Connectés", value: counts.online === null ? "n/d" : num(counts.online), inline: true },
          { name: "En vocal", value: `${counts.voice}`, inline: true },
          { name: "Salons", value: `${guild.channels.cache.size}`, inline: true },
          { name: "Rôles", value: `${guild.roles.cache.size}`, inline: true },
          { name: "Rôle staff", value: staffRole ? `${staffRole}` : "_non défini_", inline: true },
          { name: `Absences en cours (${abs.length})`,
            value: abs.length ? abs.map((a) => `<@${a.user_id}> — ${a.reason}${a.until ? ` · retour ${ts(a.until)}` : ""}`).join("\n").slice(0, 1000) : "_aucune_" },
        ] })],
      components: [row(
        btn("p:staff:absence", "Déclarer une absence", ButtonStyle.Primary, "🛌"),
        btn("p:staff", "Actualiser", ButtonStyle.Secondary, "🔄"),
        btn("p:home", "Retour", ButtonStyle.Secondary, "◀️"))],
    };
  }

  /* ---------------------------- CONFIGURATION ---------------------------- */
  if (id === "config") {
    const show = (v, kind = "role") => (v ? (kind === "role" ? `<@&${v}>` : `<#${v}>`) : "_non défini_");

    if (page === "roles") return {
      embeds: [embed({ guild, author: { name: "⚙️  Rôles clés" }, color: COLORS.primary, fields: [
        { name: "Rôle staff", value: show(config.staffRoleId), inline: true },
        { name: "Rôle Alcatraz", value: show(config.jailRoleId), inline: true },
        { name: "Autorole", value: show(config.autoroleId), inline: true },
        { name: "Rôle de confiance", value: show(config.trustedRoleId), inline: true },
      ], footer: "Le rôle de confiance (« Like me ») ouvre Compteurs, Économie, Niveaux et Automod" })],
      components: [
        row(new RoleSelectMenuBuilder().setCustomId("p:config:staff").setPlaceholder("Rôle staff (accès aux tickets)")),
        row(new RoleSelectMenuBuilder().setCustomId("p:config:jail").setPlaceholder("Rôle Alcatraz (prison)")),
        row(new RoleSelectMenuBuilder().setCustomId("p:config:autorole").setPlaceholder("Autorole donné à l'arrivée")),
        row(new RoleSelectMenuBuilder().setCustomId("p:config:trusted").setPlaceholder("Rôle de confiance (« Like me »)")),
        backRow("p:config"),
      ],
    };

    if (page === "welcome") return {
      embeds: [embed({ guild, author: { name: "👋  Arrivées et départs" }, color: COLORS.primary, fields: [
        { name: "Salon d'accueil", value: show(config.welcomeChannelId, "ch"), inline: true },
        { name: "Salon des départs", value: show(config.goodbyeChannelId, "ch"), inline: true },
        { name: "Message d'accueil", value: `\`${config.welcomeMessage}\`` },
        { name: "Message de départ", value: `\`${config.goodbyeMessage}\`` },
      ], footer: "Variables : {user} {tag} {server} {count}" })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:config:welcome").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon de bienvenue")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:config:goodbye").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon des départs")),
        row(btn("p:config:msgw", "Texte d'accueil", ButtonStyle.Primary, "✏️"),
            btn("p:config:msgg", "Texte de départ", ButtonStyle.Primary, "✏️"),
            btn("p:config:clearw", "Couper l'accueil", ButtonStyle.Danger, "🗑️")),
        backRow("p:config"),
      ],
    };

    if (page === "chans") {
      const lines = Object.keys(FUNC_CHANNELS).map((k) => {
        const ch = resolveFuncChannel(guild, k, config);
        return `${ch ? "✅" : "🔴"} \`${k}\`${config.funcOverrides?.[k] ? "*" : ""} → ${ch ? `<#${ch.id}>` : "_non trouvé_"}`;
      });
      return {
        embeds: [embed({ guild, author: { name: "📂  Salons fonctionnels" }, color: COLORS.primary,
          description: lines.join("\n"), footer: "`*` = forcé manuellement. Sinon détecté par nom." })],
        components: [
          row(new StringSelectMenuBuilder().setCustomId("p:config:funcpick").setPlaceholder("Forcer un salon fonctionnel…")
            .addOptions(Object.keys(FUNC_CHANNELS).map((k) => ({ label: k, value: k })))),
          row(btn("p:config:funcreset", "Tout remettre en auto", ButtonStyle.Danger, "🔄")),
          backRow("p:config"),
        ],
      };
    }

    if (page === "trap") return {
      embeds: [embed({ guild, author: { name: "🪤  Piège vocal" }, color: COLORS.danger,
        description: "Un salon vocal interdit : quiconque le rejoint est expulsé du vocal puis sanctionné. Le staff et le propriétaire de 0x sont exemptés.",
        fields: [
          { name: "Salon piégé", value: config.trapVoiceId ? `<#${config.trapVoiceId}>` : "_aucun_", inline: true },
          { name: "Sanction", value: config.trapAction === "ban" ? "Bannissement" : config.trapAction === "kick" ? "Expulsion" : "Désactivé", inline: true },
        ] })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:config:trapch").setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Salon vocal piégé")),
        row(new StringSelectMenuBuilder().setCustomId("p:config:trapact").setPlaceholder("Que faire à celui qui entre ?")
          .addOptions([{ label: "Désactivé", value: "off" }, { label: "Expulser du serveur", value: "kick" }, { label: "Bannir", value: "ban" }])),
        backRow("p:config"),
      ],
    };

    if (page === "danger") return {
      embeds: [embed({ guild, author: { name: "🔥  Zone rouge" }, color: COLORS.danger,
        description: "**Réinitialiser** efface tous les réglages de 0x sur ce serveur : rôles clés, perms, automod, protections, boutique, forçages de salons.\n\nLes données des membres (XP, coins, sanctions, tickets) ne sont pas touchées." })],
      components: [row(btn("p:config:reset", "Réinitialiser la configuration", ButtonStyle.Danger, "⚠️"), btn("p:config", "Annuler", ButtonStyle.Secondary, "◀️"))],
    };

    return {
      embeds: [embed({ guild, author: { name: "⚙️  Configuration" }, color: COLORS.primary, fields: [
        { name: "Rôles clés", value: `${dot(config.staffRoleId)} staff · ${dot(config.jailRoleId)} Alcatraz · ${dot(config.autoroleId)} autorole`, inline: true },
        { name: "Arrivées / départs", value: `${dot(config.welcomeChannelId)} accueil · ${dot(config.goodbyeChannelId)} départs`, inline: true },
        { name: "Piège vocal", value: config.trapAction !== "off" && config.trapVoiceId ? `🟢 ${config.trapAction}` : "🔴 coupé", inline: true },
      ] })],
      components: [
        row(btn("p:config:page:roles", "Rôles clés", ButtonStyle.Primary, "🎭"),
            btn("p:config:page:welcome", "Arrivées / départs", ButtonStyle.Primary, "👋"),
            btn("p:config:page:chans", "Salons fonctionnels", ButtonStyle.Primary, "📂")),
        row(btn("p:config:page:trap", "Piège vocal", ButtonStyle.Secondary, "🪤"),
            btn("p:config:page:danger", "Zone rouge", ButtonStyle.Danger, "🔥")),
        backRow(),
      ],
    };
  }

  /* ------------------------------- JOURNAUX ------------------------------ */
  if (id === "logs") {
    const keys = Object.keys(LOG_ROUTES);
    const lines = keys.map((k) => {
      const ch = resolveLogChannel(guild, k, config);
      return `${ch ? "✅" : "🔴"} \`${k}\`${config.logOverrides?.[k] ? "*" : ""}`;
    });
    const found = keys.filter((k) => resolveLogChannel(guild, k, config)).length;
    const third = Math.ceil(lines.length / 3);
    const half = Math.ceil(keys.length / 2);
    return {
      embeds: [embed({ guild, author: { name: "🗂️  Journaux" }, color: found === keys.length ? COLORS.success : COLORS.warning,
        description: `**${found}/${keys.length}** types routés · journalisation ${onOff(config.logsEnabled)}\n\`*\` = forcé manuellement`,
        fields: [
          { name: "\u200b", value: lines.slice(0, third).join("\n"), inline: true },
          { name: "\u200b", value: lines.slice(third, third * 2).join("\n"), inline: true },
          { name: "\u200b", value: lines.slice(third * 2).join("\n"), inline: true },
        ], footer: "Un type non trouvé est simplement ignoré — rien ne casse" })],
      components: [
        row(new StringSelectMenuBuilder().setCustomId("p:logs:pick").setPlaceholder("Forcer un type de journal (A → M)…")
          .addOptions(keys.slice(0, half).map((k) => ({ label: k, value: k,
            description: (resolveLogChannel(guild, k, config)?.name ?? "non routé").slice(0, 100) })))),
        row(new StringSelectMenuBuilder().setCustomId("p:logs:pick2").setPlaceholder("Forcer un type de journal (M → Z)…")
          .addOptions(keys.slice(half).map((k) => ({ label: k, value: k,
            description: (resolveLogChannel(guild, k, config)?.name ?? "non routé").slice(0, 100) })))),
        row(btn("p:logs:scan", "Rescanner les salons", ButtonStyle.Primary, "🔄"),
            btn("p:logs:toggle", config.logsEnabled ? "Couper les journaux" : "Activer les journaux", config.logsEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
            btn("p:logs:reset", "Tout remettre en auto", ButtonStyle.Secondary, "♻️")),
        backRow(),
      ],
    };
  }

  /* -------------------------------- AUTOMOD ------------------------------ */
  if (id === "automod") {
    const a = config.automod;
    return {
      embeds: [embed({ guild, author: { name: "🤖  Automod" }, color: a.enabled ? COLORS.success : COLORS.neutral,
        description: `État général : **${onOff(a.enabled)}**`,
        fields: [
          { name: "Invitations", value: onOff(a.antiInvite), inline: true },
          { name: "Liens", value: onOff(a.antiLink), inline: true },
          { name: "Flood", value: a.antiSpam ? `🟢 ${a.spamThreshold}/${Math.round(a.spamWindowMs / 1000)}s → ${a.spamTimeoutMinutes}min` : "🔴 coupé", inline: true },
          { name: "Mentions max", value: a.maxMentions ? `${a.maxMentions}` : "illimité", inline: true },
          { name: "Majuscules", value: a.capsPercent ? `${a.capsPercent}%` : "coupé", inline: true },
          { name: "Émojis max", value: a.maxEmojis ? `${a.maxEmojis}` : "illimité", inline: true },
          { name: "Mots interdits", value: `${a.bannedWords.length}`, inline: true },
          { name: "Prévenir en salon", value: onOff(a.warnOnDelete), inline: true },
          { name: "Rôles exemptés", value: a.exemptRoles.length ? a.exemptRoles.map((r) => `<@&${r}>`).join(" ").slice(0, 1000) : "_aucun_" },
          { name: "Salons ignorés", value: a.ignoredChannels.length ? a.ignoredChannels.map((c) => `<#${c}>`).join(" ").slice(0, 1000) : "_aucun_" },
        ] })],
      components: [
        row(
          btn("p:automod:t:enabled", "Automod", a.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
          btn("p:automod:t:antiInvite", "Invitations", a.antiInvite ? ButtonStyle.Success : ButtonStyle.Danger),
          btn("p:automod:t:antiLink", "Liens", a.antiLink ? ButtonStyle.Success : ButtonStyle.Danger),
          btn("p:automod:t:antiSpam", "Flood", a.antiSpam ? ButtonStyle.Success : ButtonStyle.Danger),
          btn("p:automod:t:warnOnDelete", "Prévenir", a.warnOnDelete ? ButtonStyle.Success : ButtonStyle.Danger),
        ),
        row(btn("p:automod:seuils", "Régler les seuils", ButtonStyle.Primary, "🎚️"),
            btn("p:automod:mots", "Mots interdits", ButtonStyle.Primary, "🚫")),
        row(new RoleSelectMenuBuilder().setCustomId("p:automod:exempt").setPlaceholder("Ajouter/retirer un rôle exempté")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:automod:ignore")
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildCategory).setPlaceholder("Ajouter/retirer un salon ignoré")),
        backRow(),
      ],
    };
  }

  /* ------------------------------ PROTECTION ----------------------------- */
  if (id === "protect") {
    const { antiraid: ar, antinuke: an } = config;
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.alert}  Protection` }, color: COLORS.danger, fields: [
        { name: "Anti-raid", value: ar.enabled
          ? `🟢 ${ar.joinThreshold} arrivées / ${Math.round(ar.joinWindowMs / 1000)}s\nComptes < ${ar.minAccountAgeDays}j signalés\nRéaction : **${ar.onRaid}** (${ar.lockdownMinutes} min)` : "🔴 coupé", inline: true },
        { name: "Anti-nuke", value: an.enabled
          ? `🟢 salons ${an.channelDeleteMax} · rôles ${an.roleDeleteMax}\nbans ${an.banMax} · kicks ${an.kickMax}\nFenêtre ${Math.round(an.windowMs / 1000)}s · **${an.punishment}**` : "🔴 coupé", inline: true },
        { name: "Lockdown", value: isLockdown(guild.id) ? "🔒 **actif**" : "🔓 inactif", inline: true },
        { name: "Liste blanche anti-nuke", value: an.whitelist.length ? an.whitelist.map((u) => `<@${u}>`).join(" ").slice(0, 1000) : "_vide_" },
      ] })],
      components: [
        row(btn("p:protect:t:antiraid", "Anti-raid", ar.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
            btn("p:protect:t:antinuke", "Anti-nuke", an.enabled ? ButtonStyle.Success : ButtonStyle.Danger),
            btn("p:protect:lock:on", "Verrouiller tout", ButtonStyle.Danger, "🔒"),
            btn("p:protect:lock:off", "Déverrouiller", ButtonStyle.Success, "🔓")),
        row(btn("p:protect:raidcfg", "Réglages anti-raid", ButtonStyle.Primary, "🎚️"),
            btn("p:protect:nukecfg", "Réglages anti-nuke", ButtonStyle.Primary, "🎚️")),
        row(new UserSelectMenuBuilder().setCustomId("p:protect:wl").setPlaceholder("Ajouter/retirer de la liste blanche")),
        backRow(),
      ],
    };
  }

  /* ----------------------------- PERMISSIONS ----------------------------- */
  if (id === "perms") {
    if (page === "sections") {
      return {
        embeds: [embed({ guild, author: { name: "🔐  Niveau requis par section" }, color: COLORS.gold,
          description: SECTIONS.map((s) => `${s.emoji} **${s.label}** — ${PERM_LABELS[sectionLevel(s, config)]}${config.perms.sections?.[s.id] !== undefined ? " *" : ""}${s.ownerOnly ? " 🔒" : ""}`).join("\n"),
          footer: "🔒 = propriétaire uniquement, quel que soit le niveau · * = modifié" })],
        components: [
          row(new StringSelectMenuBuilder().setCustomId("p:perms:secpick").setPlaceholder("Changer le niveau d'une section…")
            .addOptions(SECTIONS.map((s) => ({ label: s.label, value: s.id, emoji: s.emoji,
              description: PERM_LABELS[sectionLevel(s, config)].slice(0, 100) })))),
          row(btn("p:perms:secreset", "Remettre les niveaux d'origine", ButtonStyle.Danger, "♻️")),
          backRow("p:perms"),
        ],
      };
    }
    const byLevel = {};
    for (const [rid, lvl] of Object.entries(config.perms.roles)) {
      const role = guild.roles.cache.get(rid);
      if (role) (byLevel[lvl] ??= []).push(role.toString());
    }
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.shield}  Permissions` }, color: COLORS.gold,
        description: [6, 5, 4, 3, 2, 1].map((l) => `**${PERM_LABELS[l]}**\n${byLevel[l]?.join(" ") ?? "_aucun rôle_"}`).join("\n\n"),
        fields: Object.keys(config.perms.users).length
          ? [{ name: "Forçages individuels", value: Object.entries(config.perms.users).map(([u, l]) => `\`${l}\` <@${u}>`).join("\n").slice(0, 1000) }] : [],
        footer: "Le propriétaire du serveur est niveau 6 · celui de 0x est niveau 7" })],
      components: [
        row(btn("p:perms:auto", "Détection automatique", ButtonStyle.Primary, "🪄"),
            btn("p:perms:page:sections", "Niveau des sections", ButtonStyle.Secondary, "📋"),
            btn("p:perms:reset", "Réinitialiser", ButtonStyle.Danger, "🗑️")),
        row(new RoleSelectMenuBuilder().setCustomId("p:perms:role").setPlaceholder("Classer un rôle…")),
        row(new RoleSelectMenuBuilder().setCustomId("p:perms:preview").setPlaceholder("Voir ce qu'un rôle peut ouvrir…")),
        row(new UserSelectMenuBuilder().setCustomId("p:perms:user").setPlaceholder("Forcer le niveau d'une personne…")),
        backRow(),
      ],
    };
  }

  /* -------------------------------- TICKETS ------------------------------ */
  if (id === "tickets") {
    const s = await ticketStats(guild.id);
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.ticket}  Tickets` }, color: COLORS.primary,
        description: TICKET_TYPES.map((t) => `${findCategory(guild, t.categories) ? "✅" : "🔴"} ${t.emoji} ${t.label}`).join("\n"),
        fields: [
          { name: "Ouverts", value: `${s.open}`, inline: true },
          { name: "7 jours", value: `${s.week}`, inline: true },
          { name: "Total", value: `${s.total}`, inline: true },
          { name: "Rôle staff", value: config.staffRoleId ? `<@&${config.staffRoleId}>` : "_à définir dans Configuration_" },
        ] })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:tickets:publish").setChannelTypes(ChannelType.GuildText)
          .setPlaceholder("Publier le panneau de tickets dans…")),
        row(btn("p:tickets:refresh", "Actualiser le compteur", ButtonStyle.Primary, "🔄"),
            btn("p:home", "Retour", ButtonStyle.Secondary, "◀️")),
      ],
    };
  }

  /* ------------------------------- COMPTEURS ----------------------------- */
  if (id === "counters") {
    const { counts, report } = await updateCounters(guild, false);
    const labels = { members: "Membres (bots exclus)", online: "Connectés", voice: "En vocal" };
    return {
      embeds: [embed({ guild, author: { name: "📊  Compteurs vocaux" }, color: COLORS.primary,
        description: report.map((r) => `${["mis à jour", "à jour", "inchangé"].includes(r.status) ? "✅" : "⚠️"} **${labels[r.key]}** — ${r.value ?? "—"}\n └ _${r.status}_`).join("\n"),
        fields: [
          { name: "Cache membres", value: `${num(guild.members.cache.size)} / ${num(guild.memberCount)}`, inline: true },
          { name: "États vocaux", value: `${guild.voiceStates.cache.size}`, inline: true },
          { name: "Presence", value: counts.online === null ? "🔴 intent manquant" : "🟢 disponible", inline: true },
        ], footer: "Discord limite les renommages à 2 par 10 min et par salon" })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:counters:set:members").setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Salon du compteur Membres")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:counters:set:online").setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Salon du compteur Connectés")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:counters:set:voice").setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Salon du compteur Vocal")),
        row(btn("p:counters:force", "Forcer la mise à jour", ButtonStyle.Primary, "🔄"),
            btn("p:counters:clear", "Tout délier", ButtonStyle.Danger, "🔗"),
            btn("p:home", "Retour", ButtonStyle.Secondary, "◀️")),
      ],
    };
  }

  /* -------------------------------- NIVEAUX ------------------------------ */
  if (id === "levels") {
    const rewards = Object.entries(config.levelRewards).sort((a, b) => a[0] - b[0]);
    const comps = [
      row(btn("p:levels:t", config.levelsEnabled ? "Couper les niveaux" : "Activer les niveaux",
        config.levelsEnabled ? ButtonStyle.Danger : ButtonStyle.Success),
        btn("p:home", "Retour", ButtonStyle.Secondary, "◀️")),
      row(new RoleSelectMenuBuilder().setCustomId("p:levels:reward").setPlaceholder("Ajouter une récompense : choisis le rôle…")),
      row(new ChannelSelectMenuBuilder().setCustomId("p:levels:channel").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon des annonces de niveau")),
    ];
    if (rewards.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:levels:delreward")
      .setPlaceholder("Retirer une récompense…")
      .addOptions(rewards.slice(0, 25).map(([lvl, rid]) => ({ label: `Niveau ${lvl}`, value: String(lvl),
        description: (guild.roles.cache.get(rid)?.name ?? rid).slice(0, 100) })))));
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.level}  Niveaux` }, color: COLORS.primary,
        description: `Système d'XP : **${onOff(config.levelsEnabled)}**\nAnnonces : ${resolveFuncChannel(guild, "levelUp", config) ?? "_salon du message_"}`,
        fields: [{ name: "Récompenses", value: rewards.length ? rewards.map(([l, r]) => `Niveau **${l}** → <@&${r}>`).join("\n") : "_aucune_" }],
        footer: "15 à 25 XP par message, une fois par minute" })],
      components: comps,
    };
  }

  /* ---------------------------- DROITS DES SALONS ------------------------ */
  if (id === "channels") {
    // Fiche d'un salon : p:channels:page:<channelId>
    if (page && guild.channels.cache.has(page)) {
      const ch = guild.channels.cache.get(page);
      const everyone = guild.id;
      const list = permsFor(ch);
      const kind = isCategory(ch) ? "Catégorie" : isVoice(ch) ? "Salon vocal" : "Salon textuel";

      const permRows = [];
      for (let n = 0; n < list.length; n += 5) {
        permRows.push(row(...list.slice(n, n + 5).map(([key, p]) => {
          const st = stateOf(ch, everyone, key);
          return btn(`p:channels:cycle:${ch.id}_${everyone}_${key}`, `${p.label}`,
            st === "allow" ? ButtonStyle.Success : st === "deny" ? ButtonStyle.Danger : ButtonStyle.Secondary, p.emoji);
        })));
      }

      return {
        embeds: [embed({ guild, author: { name: `🔐  ${ch.name}` }, color: COLORS.primary,
          description: `${kind}${ch.parent ? ` · dans **${ch.parent.name}**` : ""}\n\n**@everyone :**\n${summarize(ch)}`,
          fields: [
            ...(isText(ch) && !isCategory(ch) ? [{ name: "Mode lent", value: ch.rateLimitPerUser ? `${ch.rateLimitPerUser} s` : "aucun", inline: true }] : []),
            { name: "Règles particulières", value: `${ch.permissionOverwrites?.cache?.size ?? 0} (rôles et membres)`, inline: true },
            { name: "Légende", value: "✅ autorisé · ⛔ refusé · ⬜ hérité de la catégorie" },
          ],
          footer: "Appuie sur un droit pour le faire tourner : hérité → autorisé → refusé" })],
        components: [
          ...permRows.slice(0, 2),
          row(new RoleSelectMenuBuilder().setCustomId(`p:channels:role:${ch.id}`).setPlaceholder("Régler un rôle en particulier…")),
          row(new UserSelectMenuBuilder().setCustomId(`p:channels:member:${ch.id}`).setPlaceholder("Rendre un membre muet ici…")),
          row(
            btn(`p:channels:lock:${ch.id}`, "Verrouiller", ButtonStyle.Danger, "🔒"),
            btn(`p:channels:unlock:${ch.id}`, "Déverrouiller", ButtonStyle.Success, "🔓"),
            btn(`p:channels:ro:${ch.id}`, "Lecture seule", ButtonStyle.Secondary, "📖"),
            btn(`p:channels:reset:${ch.id}`, "Réinitialiser", ButtonStyle.Secondary, "♻️"),
            btn("p:channels", "Retour", ButtonStyle.Secondary, "◀️"),
          ),
        ],
      };
    }

    const audit = auditChannels(guild);
    return {
      embeds: [embed({ guild, author: { name: "🔐  Droits des salons" }, color: COLORS.primary,
        description: "Choisis un salon ou une catégorie pour décider qui peut le voir, y écrire et y parler.",
        fields: [
          { name: `🔒 Verrouillés (${audit.locked.length})`,
            value: audit.locked.length ? audit.locked.slice(0, 15).map((c) => `${c}`).join(" ").slice(0, 1000) : "_aucun_" },
          { name: `🙈 Masqués à @everyone (${audit.hidden.length})`,
            value: audit.hidden.length ? audit.hidden.slice(0, 15).map((c) => `${c}`).join(" ").slice(0, 1000) : "_aucun_" },
        ],
        footer: "Régler une catégorie permet ensuite de l'appliquer à tous ses salons" })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:channels:pick")
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildVoice, ChannelType.GuildAnnouncement,
            ChannelType.GuildForum, ChannelType.GuildStageVoice, ChannelType.GuildCategory)
          .setPlaceholder("Choisis un salon ou une catégorie…")),
        row(btn("p:channels:all:lock", "Tout verrouiller", ButtonStyle.Danger, "🔒"),
            btn("p:channels:all:unlock", "Tout déverrouiller", ButtonStyle.Success, "🔓"),
            btn("p:channels", "Actualiser", ButtonStyle.Secondary, "🔄")),
        backRow(),
      ],
    };
  }

  /* --------------------------------- VOCAL ------------------------------- */
  if (id === "voice") {
    const v = config.voice ?? {};
    const top = await topVoice(guild.id, 8);
    const live = guild.voiceStates.cache.filter((x) => x.channelId).size;
    const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
    const medals = ["🥇", "🥈", "🥉"];
    return {
      embeds: [embed({ guild, author: { name: "🔊  Récompenses vocales" }, color: v.enabled ? COLORS.success : COLORS.neutral,
        description: voiceSummary(config),
        fields: [
          { name: "En vocal maintenant", value: `${live}`, inline: true },
          { name: "Salons ignorés", value: v.ignoredChannels?.length ? v.ignoredChannels.map((c) => `<#${c}>`).join(" ").slice(0, 900) : "_aucun_", inline: true },
          { name: "Salon AFK", value: guild.afkChannelId ? `<#${guild.afkChannelId}> — jamais récompensé` : "_non défini_", inline: true },
          { name: "Top temps vocal", value: top.length
            ? top.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — ${fmt(x.minutes)}`).join("\n") : "_personne pour l'instant_" },
        ],
        footer: "Seul dans un salon : aucun gain. Casque coupé : aucun gain." })],
      components: [
        row(btn("p:voice:t", v.enabled ? "Couper les gains vocaux" : "Activer les gains vocaux",
              v.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            btn("p:voice:cfg", "Régler les gains", ButtonStyle.Primary, "🎚️"),
            btn("p:voice:tick", "Distribuer maintenant", ButtonStyle.Secondary, "⚡")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:voice:ignore")
          .setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Ajouter/retirer un salon ignoré")),
        backRow(),
      ],
    };
  }

  /* -------------------------------- ÉCONOMIE ----------------------------- */
  if (id === "eco") {
    const e = config.economy;
    const comps = [
      row(btn("p:eco:t", e.enabled ? "Couper l'économie" : "Activer l'économie", e.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        btn("p:eco:montants", "Montants", ButtonStyle.Primary, "🎚️"),
        btn("p:eco:drop", "Lâcher un colis", ButtonStyle.Primary, "📦"),
        btn("p:eco:space", "Remplir l'espace coins", ButtonStyle.Success, "🏛️")),
      row(new StringSelectMenuBuilder().setCustomId("p:eco:addtype").setPlaceholder("Ajouter un article : quel type ?")
        .addOptions(Object.entries(ITEM_TYPES).map(([k, v]) => ({ label: v.label, value: k, emoji: v.emoji, description: v.desc.slice(0, 100) })))),
      row(new ChannelSelectMenuBuilder().setCustomId("p:eco:dropch").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon des colis automatiques")),
    ];
    if (e.shop.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:eco:del")
      .setPlaceholder("Retirer un article…")
      .addOptions(e.shop.slice(0, 25).map((x) => ({ label: x.name.slice(0, 100), value: x.id,
        emoji: ITEM_TYPES[x.type ?? "role"]?.emoji, description: `${num(x.price)} coins` })))));
    comps.push(backRow());
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.coin}  Économie` }, color: COLORS.gold,
        description: `État : **${onOff(e.enabled)}** · monnaie ${e.currency}`,
        fields: [
          { name: "Quotidien", value: num(e.dailyAmount), inline: true },
          { name: "Travail", value: `${num(e.workMin)}–${num(e.workMax)} / ${Math.round(e.workCooldownMs / 60000)}min`, inline: true },
          { name: "Colis", value: e.dropChannelId ? `<#${e.dropChannelId}> · ${e.dropChance}% · ${num(e.dropMin)}–${num(e.dropMax)}` : "_manuel_", inline: true },
          { name: `Boutique (${e.shop.length})`, value: e.shop.length ? e.shop.map((x) => {
            const ty = ITEM_TYPES[x.type ?? "role"];
            const what = (x.type ?? "role") === "role" ? ` → <@&${x.roleId}>`
              : x.type === "xp" ? ` → ${num(x.amount ?? 0)} XP`
              : x.type === "multiplier" ? ` → ×${x.amount ?? 2} pendant ${x.hours ?? 24}h` : "";
            return `${ty?.emoji ?? ""} **${x.name}** — ${e.currency} ${num(x.price)}${what}${x.stock != null ? ` · stock ${x.stock}` : ""}`;
          }).join("\n").slice(0, 1000) : "_vide — ajoute des articles ci-dessous_" },
        ] })],
      components: comps,
    };
  }

  /* ------------------------------- GIVEAWAYS ----------------------------- */
  if (id === "gw") {
    const active = await listActiveGiveaways(guild.id);
    const comps = [row(btn("p:gw:new", "Lancer un giveaway", ButtonStyle.Success, "🎁"),
      btn("p:home", "Retour", ButtonStyle.Secondary, "◀️"))];
    if (active.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:gw:pick")
      .setPlaceholder("Agir sur un giveaway en cours…")
      .addOptions(active.slice(0, 25).map((g) => ({ label: g.prize.slice(0, 100), value: String(g.id),
        description: `fin ${new Date(g.ends_at).toLocaleString("fr-FR")}`.slice(0, 100) })))));
    return {
      embeds: [embed({ guild, author: { name: `${ICONS.gift}  Giveaways` }, color: COLORS.gold,
        description: active.length
          ? active.map((g) => `\`#${g.id}\` **${g.prize}** — ${g.winners} gagnant(s), <#${g.channel_id}>, fin ${ts(g.ends_at)}${g.required_role ? ` · <@&${g.required_role}>` : ""}`).join("\n")
          : "_Aucun giveaway en cours._" })],
      components: comps,
    };
  }

  /* ------------------------------ INVITATIONS ---------------------------- */
  if (id === "invites") {
    const top = (await topInviters(guild.id, 25))
      .map((x) => ({ ...x, active: withBaseline(config, x.userId, x.active), total: withBaseline(config, x.userId, x.total) }))
      .sort((a, b) => b.active - a.active).slice(0, 10);
    const inv = config.invites ?? {};
    const medals = ["🥇", "🥈", "🥉"];
    const chan = inv.channelId ? `<#${inv.channelId}>` : (resolveFuncChannel(guild, "invites", config) ?? "_aucun_");
    const trusted = isTrusted(i.member, config);

    const comps = [row(
      btn("p:invites:who", "Qui a invité qui ?", ButtonStyle.Primary, "🔍"),
      btn("p:invites:me", "Mes invitations", ButtonStyle.Secondary, "👤"),
      btn("p:invites", "Actualiser", ButtonStyle.Secondary, "🔄"),
    )];
    if (trusted) {
      comps.push(row(
        btn("p:invites:t", inv.enabled ? "Couper le suivi" : "Activer le suivi", inv.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        btn("p:invites:delay", "Délai de suppression", ButtonStyle.Primary, "⏱️"),
        btn("p:invites:recal", "Recaler sur les liens Discord", ButtonStyle.Primary, "🎯"),
        btn("p:invites:reset", "Remettre le classement à zéro", ButtonStyle.Danger, "🗑️"),
      ));
      comps.push(row(new ChannelSelectMenuBuilder().setCustomId("p:invites:chan")
        .setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon des annonces d'invitation")));
    }
    comps.push(backRow());

    return {
      embeds: [embed({ guild, author: { name: "🔗  Invitations" }, color: COLORS.primary,
        description: top.length
          ? top.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — **${x.active}** actif(s)${x.total !== x.active ? ` · ${x.total} au total` : ""}`).join("\n")
          : "_Personne n'a encore d'invitation enregistrée._",
        fields: [
          { name: "Suivi", value: onOff(inv.enabled), inline: true },
          { name: "Salon d'annonce", value: String(chan), inline: true },
          { name: "Suppression après", value: `${Math.round((inv.deleteAfterMs ?? 120000) / 60000)} min`, inline: true },
        ],
        footer: "Un invité qui quitte le serveur ne compte plus" })],
      components: comps,
    };
  }

  /* ------------------------------ PUBLICATIONS --------------------------- */
  if (id === "publish") {
    return {
      embeds: [embed({ guild, author: { name: "📢  Publications" }, color: COLORS.primary,
        description: ["**Espace membre** — niveau, solde, quotidien, travail, classements, boutique",
          "**Tickets** — menu des 6 catégories", "**Confessions** — bouton anonyme",
          "**Menu de rôles** — rôles à cocher", "", "Chaque publication demande ensuite le salon cible."].join("\n") })],
      components: [
        row(btn("p:setup:publish", "Tout publier automatiquement", ButtonStyle.Success, "⚡")),
        row(btn("p:publish:pick:member", "Espace membre", ButtonStyle.Primary, "🧭"),
            btn("p:publish:pick:ticket", "Tickets", ButtonStyle.Primary, "🎫"),
            btn("p:publish:pick:confess", "Confessions", ButtonStyle.Primary, "🕵️")),
        row(btn("p:publish:pick:roles", "Menu de rôles", ButtonStyle.Secondary, "🎭"),
            btn("p:publish:pick:say", "Annonce", ButtonStyle.Secondary, "📣"),
            btn("p:publish:pick:poll", "Sondage", ButtonStyle.Secondary, "📊")),
        backRow(),
      ],
    };
  }

  return homeView(i, config);
}

/** Fiche des droits d'un rôle sur un salon. */
function roleView(guild, ch, roleId, label) {
  const list = permsFor(ch);
  const rows = [];
  for (let n = 0; n < list.length; n += 5) {
    rows.push(row(...list.slice(n, n + 5).map(([key, p]) => {
      const st = stateOf(ch, roleId, key);
      return btn(`p:channels:rcycle:${ch.id}_${roleId}_${key}`, p.label,
        st === "allow" ? ButtonStyle.Success : st === "deny" ? ButtonStyle.Danger : ButtonStyle.Secondary, p.emoji);
    })));
  }
  return {
    embeds: [embed({ guild, author: { name: `🔐  ${ch.name} — droits du rôle` }, color: COLORS.primary,
      description: `${label}\n\n${list.map(([key, p]) => `${STATE_ICON[stateOf(ch, roleId, key)]} ${p.emoji} **${p.label}** — ${STATE_WORD[stateOf(ch, roleId, key)]}`).join("\n")}`,
      footer: "Hérité = le rôle suit la catégorie et les permissions globales" })],
    components: [
      ...rows.slice(0, 3),
      row(btn(`p:channels:rclear:${ch.id}_${roleId}`, "Supprimer la règle", ButtonStyle.Danger, "🗑️"),
          btn(`p:channels:page:${ch.id}`, "Retour au salon", ButtonStyle.Secondary, "◀️")),
    ],
  };
}

/* ========================================================================== */
/*                            FICHE D'UN MEMBRE                               */
/* ========================================================================== */

async function showMemberCard(i, userId, config) {
  const member = await i.guild.members.fetch(userId).catch(() => null);
  if (!member) return feedback(i, { ok: false, title: "Introuvable", text: "Ce membre n'est pas sur le serveur.", color: COLORS.danger }, "mod");

  const warns = await countSanctions(i.guild.id, userId, "warn");
  const all = await countSanctions(i.guild.id, userId);
  const lvl = await getUserLevel(i.guild.id, userId);
  const wallet = await getWallet(i.guild.id, userId);
  const muted = member.communicationDisabledUntil && member.communicationDisabledUntil > new Date();

  const card = embed({
    guild: i.guild, author: { name: `${ICONS.shield}  ${member.user.tag}` },
    color: muted ? COLORS.warning : COLORS.primary,
    description: `\`${member.id}\` · **${PERM_LABELS[permLevel(member, config)]}**${muted ? `\n${ICONS.timeout} Muet jusqu'à ${ts(member.communicationDisabledUntil)}` : ""}`,
    fields: [
      { name: "Avertissements", value: `${warns}`, inline: true },
      { name: "Sanctions totales", value: `${all}`, inline: true },
      { name: "Compte créé", value: ts(member.user.createdAt), inline: true },
      { name: "A rejoint", value: member.joinedAt ? ts(member.joinedAt) : "—", inline: true },
      { name: "Niveau", value: `${lvl.level} · ${num(lvl.xp)} XP`, inline: true },
      { name: "Coins", value: num(wallet.coins), inline: true },
      { name: "Rôles", value: member.roles.cache.filter((r) => r.id !== i.guild.id).sort((a, b) => b.position - a.position).map((r) => r.toString()).slice(0, 10).join(" ") || "_aucun_" },
    ],
  }).setThumbnail(member.user.displayAvatarURL({ size: 256 }));

  return respond(i, {
    embeds: [card],
    components: [
      row(btn(`p:mod:warn:${userId}`, "Avertir", ButtonStyle.Secondary, "⚠️"),
          btn(`p:mod:timeout:${userId}`, "Timeout", ButtonStyle.Secondary, "🔇"),
          btn(`p:mod:untimeout:${userId}`, "Rendre la parole", ButtonStyle.Secondary, "🔊"),
          btn(`p:mod:kick:${userId}`, "Expulser", ButtonStyle.Danger, "👢"),
          btn(`p:mod:ban:${userId}`, "Bannir", ButtonStyle.Danger, "⛔")),
      row(btn(`p:mod:jail:${userId}`, "Alcatraz", ButtonStyle.Danger, "🤚"),
          btn(`p:mod:free:${userId}`, "Libérer", ButtonStyle.Success, "🕊️"),
          btn(`p:mod:hist:${userId}`, "Casier", ButtonStyle.Primary, "📋"),
          btn(`p:mod:clear:${userId}`, "Effacer casier", ButtonStyle.Secondary, "🧽"),
          btn(`p:mod:coins:${userId}`, "Coins", ButtonStyle.Secondary, "🪙")),
      row(btn(`p:mod:role:${userId}`, "Gérer ses rôles", ButtonStyle.Secondary, "🎭"),
          btn(`p:mod:mutehere:${userId}`, "Muet dans ce salon", ButtonStyle.Secondary, "🔇"),
          btn("p:mod", "Autre membre", ButtonStyle.Secondary, "🔁"),
          btn("p:home", "Accueil", ButtonStyle.Secondary, "🏠")),
    ],
  });
}

/* ========================================================================== */
/*                                  ROUTEUR                                   */
/* ========================================================================== */

async function handlePanel(i) {
  const id = i.customId;
  if (!id?.startsWith("p:") && !id?.startsWith("pm:") && !id?.startsWith("pub:")) return false;

  const config = await getConfig(i.guildId);
  const level = permLevel(i.member, config);
  const parts = id.split(":");

  if (parts[0] === "pub") return handlePublic(i, parts, config);
  if (parts[0] === "pm") return handleModal(i, parts, config, level);

  if (id === "p:home") return respond(i, await buildSection("home", i, config));
  if (id === "p:go") return respond(i, await buildSection(i.values[0], i, config));

  /* -------- installation, interrupteurs : propriétaire uniquement -------- */
  if (parts[1] === "setup" || parts[1] === "sw") {
    if (!isOwner(i.user.id)) return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: "🔒  Verrouillé" }, description: `Seul <@${OWNER_ID}> peut modifier la configuration de 0x.` })],
      components: [backRow()] });

    if (parts[1] === "sw") {
      const key = parts[2];
      if (key === "logs") await updateConfig(i.guildId, { logsEnabled: !config.logsEnabled });
      else if (key === "levels") await updateConfig(i.guildId, { levelsEnabled: !config.levelsEnabled });
      else await updateConfig(i.guildId, { [key]: { enabled: !config[key].enabled } });
      return respond(i, await buildSection("home", i, await getConfig(i.guildId)));
    }
    if (parts[2] === "run") {
      await i.deferUpdate();
      const result = await autoSetup(i.guild, i.user);
      const view = await buildSection("home", i, await getConfig(i.guildId));
      return respond(i, { embeds: [setupReport(i.guild, result)], components: view.components });
    }
    if (parts[2] === "publish") {
      await i.deferUpdate();
      const done = await publishAll(i.guild);
      return feedback(i, done.length ? { ok: true, title: `${done.length} panneau(x) publié(s)`, text: done.join("\n") }
        : { ok: false, title: "Rien publié", text: "Aucun salon cible trouvé. Passe par Publications.", color: COLORS.warning });
    }
    if (parts[2] === "defaults") {
      await updateConfig(i.guildId, structuredClone(RECOMMENDED));
      return feedback(i, { ok: true, title: "Réglages recommandés appliqués",
        text: "Automod, anti-raid, anti-nuke, journaux, niveaux et économie sont calibrés pour un serveur de ta taille." });
    }
  }

  const section = parts[1];
  const action = parts[2];
  const arg = parts[3];
  const sec = SECTIONS.find((s) => s.id === section);
  if (sec?.ownerOnly && !isOwner(i.user.id)) return respond(i, denyView(i.guild, sec, config));
  if (sec?.trusted && !isTrusted(i.member, config)) return respond(i, denyView(i.guild, sec, config));
  if (level < sectionLevel(sec ?? { level: 6 }, config)) {
    return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Accès refusé` },
      description: `Cette section demande **${PERM_LABELS[sectionLevel(sec ?? { level: 6 }, config)]}**.` })], components: [backRow()] });
  }

  if (action === "page") return respond(i, await buildSection(section, i, config, arg));

  /* ------------------------------ MODÉRATION ----------------------------- */
  if (section === "mod") {
    if (action === "pick") return showMemberCard(i, i.values[0], config);
    if (action === "card") return showMemberCard(i, arg, config);

    if (action === "purge") return i.showModal(modal(`pm:mod:purge:${i.channelId}`, "Purger ce salon",
      [{ id: "amount", label: "Nombre de messages (1-100)", required: true, max: 3 },
       { id: "user", label: "Limiter à un identifiant (optionnel)", max: 25 }]));

    if (action === "purgeother") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🧹  Purger un autre salon" }, description: "Choisis le salon à nettoyer." })],
      components: [row(new ChannelSelectMenuBuilder().setCustomId("p:mod:purgech").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon à purger…")), backRow("p:mod")] });

    if (action === "purgech") return i.showModal(modal(`pm:mod:purge:${i.values[0]}`, "Purger le salon",
      [{ id: "amount", label: "Nombre de messages (1-100)", required: true, max: 3 },
       { id: "user", label: "Limiter à un identifiant (optionnel)", max: 25 }]));

    if (action === "slow") return i.showModal(modal(`pm:mod:slow:${i.channelId}`, "Mode lent",
      [{ id: "seconds", label: "Secondes entre messages (0 = couper)", required: true, value: `${i.channel.rateLimitPerUser ?? 0}`, max: 5 }]));

    if (action === "unban") return i.showModal(modal("pm:mod:unban", "Débannir",
      [{ id: "userid", label: "Identifiant de l'utilisateur", required: true, max: 25 }, REASON]));

    if (action === "lock") {
      const locked = i.channel.permissionOverwrites.cache.get(i.guild.id)?.deny.has(PermissionFlagsBits.SendMessages);
      await i.channel.permissionOverwrites.edit(i.guild.roles.everyone, { SendMessages: locked ? null : false });
      return feedback(i, { ok: true, title: locked ? "Salon déverrouillé" : "Salon verrouillé",
        text: `${i.channel} — ${locked ? "les membres peuvent réécrire" : "plus personne ne peut écrire"}.`,
        color: locked ? COLORS.success : COLORS.danger }, "mod");
    }

    if (action === "role") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🎭  Rôles du membre" }, description: `<@${arg}> — ajoute ou retire un rôle.` })],
      components: [row(new RoleSelectMenuBuilder().setCustomId(`p:mod:rolepick:${arg}`).setPlaceholder("Rôle à basculer…")),
        row(btn(`p:mod:card:${arg}`, "Retour à la fiche", ButtonStyle.Secondary, "◀️"))] });

    if (action === "mutehere") {
      const ch = i.channel;
      if (!ch?.manageable) return feedback(i, { ok: false, title: "Salon non modifiable",
        text: "Je n'ai pas la main sur ce salon.", color: COLORS.danger }, "mod");
      const key = isVoice(ch) ? "speak" : "send";
      const muted = stateOf(ch, arg, key) === "deny";
      await muteMemberHere(ch, arg, !muted, `Panneau 0x — ${i.user.tag}`);
      return feedback(i, { ok: true, title: muted ? "Parole rendue" : "Réduit au silence ici",
        text: `<@${arg}> ${muted ? "peut de nouveau écrire" : "ne peut plus écrire"} dans ${ch}.`,
        color: muted ? COLORS.success : COLORS.warning }, "mod");
    }

    if (action === "rolepick") {
      const member = await i.guild.members.fetch(arg).catch(() => null);
      const role = i.guild.roles.cache.get(i.values[0]);
      if (!member || !role) return feedback(i, { ok: false, title: "Introuvable", text: "Membre ou rôle absent.", color: COLORS.danger }, "mod");
      if (role.position >= i.guild.members.me.roles.highest.position || role.managed)
        return feedback(i, { ok: false, title: "Rôle inutilisable", text: `${role} est au-dessus du mien ou géré par une intégration.`, color: COLORS.danger }, "mod");
      const had = member.roles.cache.has(role.id);
      await (had ? member.roles.remove(role.id, i.user.tag) : member.roles.add(role.id, i.user.tag)).catch(() => null);
      return feedback(i, { ok: true, title: had ? "Rôle retiré" : "Rôle ajouté", text: `${role} — **${member.user.tag}**` }, "mod");
    }

    const gate = { warn: 1, hist: 1, timeout: 2, untimeout: 2, kick: 2, jail: 2, free: 2, role: 2, rolepick: 2, ban: 3, clear: 4, coins: 4, delsanc: 4 };
    if (gate[action] !== undefined && level < gate[action])
      return feedback(i, { ok: false, title: "Niveau insuffisant", text: `Cette action demande **${PERM_LABELS[gate[action]]}**.`, color: COLORS.danger }, "mod");

    const target = await i.guild.members.fetch(arg).catch(() => null);
    if (["warn", "timeout", "kick", "ban", "jail", "coins", "clear"].includes(action)) {
      if (!target) return feedback(i, { ok: false, title: "Introuvable", text: "Ce membre a quitté le serveur.", color: COLORS.danger }, "mod");
      const problem = checkTarget(i.guild, i.member, target, config);
      if (problem) return feedback(i, { ok: false, title: "Action refusée", text: problem, color: COLORS.danger }, "mod");
    }

    if (action === "warn") return i.showModal(modal(`pm:mod:warn:${arg}`, "Avertir", [REASON]));
    if (action === "timeout") return i.showModal(modal(`pm:mod:timeout:${arg}`, "Réduire au silence",
      [{ ...DURATION, required: true, placeholder: "10m" }, REASON]));
    if (action === "kick") return i.showModal(modal(`pm:mod:kick:${arg}`, "Expulser", [REASON]));
    if (action === "ban") return i.showModal(modal(`pm:mod:ban:${arg}`, "Bannir",
      [REASON, { id: "purge", label: "Purger ses messages (0-7 jours)", placeholder: "0", max: 1 }]));
    if (action === "jail") return i.showModal(modal(`pm:mod:jail:${arg}`, "Envoyer en Alcatraz", [REASON, DURATION]));
    if (action === "coins") return i.showModal(modal(`pm:mod:coins:${arg}`, "Ajuster les coins",
      [{ id: "amount", label: "Montant (négatif pour retirer)", required: true, max: 10 }, { id: "reason", label: "Raison", max: 200 }]));

    if (action === "untimeout") return feedback(i, await actionUntimeout(i.guild, target, i.user), "mod");
    if (action === "free") return feedback(i, await actionFree(i.guild, target, i.user), "mod");
    if (action === "clear") return feedback(i, await actionClearSanctions(i.guild, target), "mod");
    if (action === "delsanc") return feedback(i, await actionDeleteSanction(i.guild, Number(i.values[0])), "mod");

    if (action === "hist") {
      const t2 = target ?? { id: arg, user: { tag: arg } };
      const h = await actionHistory(i.guild, t2);
      const rows2 = await listSanctions(i.guild.id, arg, null, 25);
      const comps = [];
      if (rows2.length && level >= 4) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:mod:delsanc")
        .setPlaceholder("Supprimer une sanction précise…")
        .addOptions(rows2.slice(0, 25).map((r) => ({ label: `#${r.id} · ${r.type}`, value: String(r.id),
          description: r.reason.slice(0, 100) })))));
      comps.push(row(btn(`p:mod:card:${arg}`, "Retour à la fiche", ButtonStyle.Secondary, "◀️")));
      return respond(i, { embeds: [embed({ guild: i.guild, color: h.color, author: { name: `📋  ${h.title}` }, description: h.text })], components: comps });
    }
  }

  /* -------------------------------- ÉQUIPE ------------------------------- */
  if (section === "staff") {
    if (action === "absence") return i.showModal(modal("pm:staff:absence", "Déclarer une absence",
      [{ id: "reason", label: "Motif", required: true, max: 300 },
       { id: "duration", label: "Durée (3d, 2sem) — vide = indéterminée", max: 12 }]));
    return respond(i, await buildSection("staff", i, config));
  }

  /* ---------------------------- CONFIGURATION ---------------------------- */
  if (section === "config") {
    const set = async (patch, title, text) => { await updateConfig(i.guildId, patch); return feedback(i, { ok: true, title, text }, "config", page(i)); };
    function page(x) { return x._page ?? null; }

    if (action === "staff") { await updateConfig(i.guildId, { staffRoleId: i.values[0] }); return feedback(i, { ok: true, title: "Rôle staff défini", text: `<@&${i.values[0]}> voit désormais les tickets.` }, "config", "roles"); }
    if (action === "jail") { await updateConfig(i.guildId, { jailRoleId: i.values[0] }); return feedback(i, { ok: true, title: "Rôle Alcatraz défini", text: `<@&${i.values[0]}>` }, "config", "roles"); }
    if (action === "autorole") {
      const role = i.guild.roles.cache.get(i.values[0]);
      if (role.position >= i.guild.members.me.roles.highest.position)
        return feedback(i, { ok: false, title: "Rôle trop haut", text: "Ce rôle est au-dessus du mien.", color: COLORS.danger }, "config", "roles");
      await updateConfig(i.guildId, { autoroleId: role.id });
      return feedback(i, { ok: true, title: "Autorole défini", text: `${role} sera donné à chaque arrivée.` }, "config", "roles");
    }
    if (action === "trusted") {
      const rid = i.values[0];
      await updateConfig(i.guildId, { trustedRoleId: rid, perms: { roles: { ...config.perms.roles, [rid]: Math.max(5, Number(config.perms.roles?.[rid] ?? 0)) } } });
      return feedback(i, { ok: true, title: "Rôle de confiance défini",
        text: `<@&${rid}> accède maintenant aux Compteurs, à l'Économie, aux Niveaux et à l'Automod, et passe niveau 5.` }, "config", "roles");
    }
    if (action === "welcome") { await updateConfig(i.guildId, { welcomeChannelId: i.values[0] }); return feedback(i, { ok: true, title: "Salon d'accueil", text: `<#${i.values[0]}>` }, "config", "welcome"); }
    if (action === "goodbye") { await updateConfig(i.guildId, { goodbyeChannelId: i.values[0] }); return feedback(i, { ok: true, title: "Salon des départs", text: `<#${i.values[0]}>` }, "config", "welcome"); }
    if (action === "clearw") { await updateConfig(i.guildId, { welcomeChannelId: null, goodbyeChannelId: null }); return feedback(i, { ok: true, title: "Messages coupés", text: "Plus aucun message d'arrivée ni de départ." }, "config", "welcome"); }
    if (action === "msgw") return i.showModal(modal("pm:config:msgw", "Message d'accueil",
      [{ id: "text", label: "{user} {tag} {server} {count}", required: true, long: true, value: config.welcomeMessage, max: 500 }]));
    if (action === "msgg") return i.showModal(modal("pm:config:msgg", "Message de départ",
      [{ id: "text", label: "{user} {tag} {server} {count}", required: true, long: true, value: config.goodbyeMessage, max: 500 }]));

    if (action === "funcpick") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "📂  Forcer un salon" }, description: `Fonction : \`${i.values[0]}\`` })],
      components: [row(new ChannelSelectMenuBuilder().setCustomId(`p:config:funcset:${i.values[0]}`)
        .setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon cible…")), backRow("p:config:page:chans")] });
    if (action === "funcset") { await updateConfig(i.guildId, { funcOverrides: { ...config.funcOverrides, [arg]: i.values[0] } });
      return feedback(i, { ok: true, title: "Salon forcé", text: `\`${arg}\` → <#${i.values[0]}>` }, "config", "chans"); }
    if (action === "funcreset") { await updateConfig(i.guildId, { funcOverrides: {} }); return feedback(i, { ok: true, title: "Retour en automatique", text: "Les salons fonctionnels sont de nouveau détectés par leur nom." }, "config", "chans"); }

    if (action === "trapch") { await updateConfig(i.guildId, { trapVoiceId: i.values[0] }); return feedback(i, { ok: true, title: "Salon piégé", text: `<#${i.values[0]}> — choisis maintenant la sanction.` , color: COLORS.warning }, "config", "trap"); }
    if (action === "trapact") { const a = i.values[0]; await updateConfig(i.guildId, { trapAction: a, ...(a === "off" ? { trapVoiceId: null } : {}) });
      return feedback(i, { ok: true, title: a === "off" ? "Piège désactivé" : "Piège armé",
        text: a === "off" ? "Le salon n'est plus piégé." : `Toute personne entrant sera **${a === "ban" ? "bannie" : "expulsée"}**.`,
        color: a === "off" ? COLORS.success : COLORS.danger }, "config", "trap"); }

    if (action === "reset") { await updateConfig(i.guildId, structuredClone(DEFAULT_CONFIG)); return feedback(i, { ok: true, title: "Configuration réinitialisée", text: "Tous les réglages sont revenus à leur valeur d'origine." }, "config"); }
  }

  /* ------------------------------- JOURNAUX ------------------------------ */
  if (section === "logs") {
    if (action === "pick" || action === "pick2") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🗂️  Forcer un journal" }, description: `Type : \`${i.values[0]}\`\nActuellement : ${resolveLogChannel(i.guild, i.values[0], config) ?? "_non routé_"}` })],
      components: [row(new ChannelSelectMenuBuilder().setCustomId(`p:logs:set:${i.values[0]}`)
        .setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon cible…")), backRow("p:logs")] });
    if (action === "set") { await updateConfig(i.guildId, { logOverrides: { ...config.logOverrides, [arg]: i.values[0] } });
      return feedback(i, { ok: true, title: "Journal routé", text: `\`${arg}\` → <#${i.values[0]}>` }, "logs"); }
    if (action === "reset") { await updateConfig(i.guildId, { logOverrides: {} }); return feedback(i, { ok: true, title: "Retour en automatique", text: "Détection par nom de salon rétablie." }, "logs"); }
    if (action === "toggle") { await updateConfig(i.guildId, { logsEnabled: !config.logsEnabled }); return respond(i, await buildSection("logs", i, await getConfig(i.guildId))); }
    if (action === "scan") { const r = buildIndex(i.guild); return feedback(i, { ok: true, title: "Scan terminé", text: `${r.channels} salons et ${r.categories} catégories indexés.` }, "logs"); }
  }

  /* -------------------------------- AUTOMOD ------------------------------ */
  if (section === "automod") {
    if (action === "t") { await updateConfig(i.guildId, { automod: { [arg]: !config.automod[arg] } });
      return respond(i, await buildSection("automod", i, await getConfig(i.guildId))); }
    if (action === "seuils") { const a = config.automod;
      return i.showModal(modal("pm:automod:seuils", "Seuils de l'automod", [
        { id: "spam", label: "Flood : messages/secondes/minutes", value: `${a.spamThreshold}/${Math.round(a.spamWindowMs / 1000)}/${a.spamTimeoutMinutes}`, max: 12 },
        { id: "mentions", label: "Mentions max (0 = illimité)", value: `${a.maxMentions}`, max: 3 },
        { id: "caps", label: "Majuscules % (0 = coupé)", value: `${a.capsPercent}`, max: 3 },
        { id: "emojis", label: "Émojis max (0 = illimité)", value: `${a.maxEmojis}`, max: 3 },
      ])); }
    if (action === "mots") return i.showModal(modal("pm:automod:mots", "Mots interdits",
      [{ id: "words", label: "Séparés par des virgules", long: true, value: config.automod.bannedWords.join(", "), max: 2000 }]));
    if (action === "exempt" || action === "ignore") {
      const key = action === "exempt" ? "exemptRoles" : "ignoredChannels";
      const list = [...config.automod[key]]; const v = i.values[0];
      const idx = list.indexOf(v); idx === -1 ? list.push(v) : list.splice(idx, 1);
      await updateConfig(i.guildId, { automod: { [key]: list } });
      return respond(i, await buildSection("automod", i, await getConfig(i.guildId)));
    }
  }

  /* ------------------------------ PROTECTION ----------------------------- */
  if (section === "protect") {
    if (action === "t") { await updateConfig(i.guildId, { [arg]: { enabled: !config[arg].enabled } });
      return respond(i, await buildSection("protect", i, await getConfig(i.guildId))); }
    if (action === "lock") {
      const on = arg === "on";
      await i.deferUpdate();
      const n = await lockAllChannels(i.guild, on, `Panneau — ${i.user.tag}`);
      on ? setLockdown(i.guildId, 60) : clearLockdown(i.guildId);
      await log(i.guild, "raid", embed({ guild: i.guild, color: on ? COLORS.danger : COLORS.success,
        author: { name: on ? "🔒  Lockdown activé" : "🔓  Lockdown levé" },
        fields: [{ name: "Par", value: i.user.tag, inline: true }, { name: "Salons", value: `${n}`, inline: true }] }));
      return feedback(i, { ok: true, title: on ? "Serveur verrouillé" : "Serveur déverrouillé", text: `${n} salon(s) traité(s).`, color: on ? COLORS.danger : COLORS.success }, "protect");
    }
    if (action === "raidcfg") { const ar = config.antiraid;
      return i.showModal(modal("pm:protect:raid", "Réglages anti-raid", [
        { id: "threshold", label: "Arrivées déclenchant l'alerte", value: `${ar.joinThreshold}`, max: 3 },
        { id: "window", label: "Fenêtre (secondes)", value: `${Math.round(ar.joinWindowMs / 1000)}`, max: 4 },
        { id: "age", label: "Âge minimum du compte (jours, 0=off)", value: `${ar.minAccountAgeDays}`, max: 3 },
        { id: "mode", label: "Réaction : lockdown / kick / off", value: ar.onRaid, max: 10 },
        { id: "lockmin", label: "Durée du lockdown (minutes)", value: `${ar.lockdownMinutes}`, max: 4 },
      ])); }
    if (action === "nukecfg") { const an = config.antinuke;
      return i.showModal(modal("pm:protect:nuke", "Réglages anti-nuke", [
        { id: "chan", label: "Suppressions de salons max", value: `${an.channelDeleteMax}`, max: 3 },
        { id: "role", label: "Suppressions de rôles max", value: `${an.roleDeleteMax}`, max: 3 },
        { id: "bankick", label: "Bans max / kicks max", value: `${an.banMax}/${an.kickMax}`, max: 8 },
        { id: "window", label: "Fenêtre (secondes)", value: `${Math.round(an.windowMs / 1000)}`, max: 4 },
        { id: "mode", label: "Sanction : strip / ban / alert", value: an.punishment, max: 10 },
      ])); }
    if (action === "wl") {
      const list = [...config.antinuke.whitelist]; const v = i.values[0];
      const idx = list.indexOf(v); idx === -1 ? list.push(v) : list.splice(idx, 1);
      await updateConfig(i.guildId, { antinuke: { whitelist: list } });
      return feedback(i, { ok: true, title: idx === -1 ? "Ajouté à la liste blanche" : "Retiré de la liste blanche",
        text: `<@${v}> ${idx === -1 ? "ne déclenchera plus" : "déclenchera de nouveau"} l'anti-nuke.` }, "protect");
    }
  }

  /* ------------------------------ PERMISSIONS ---------------------------- */
  if (section === "perms") {
    if (action === "auto") {
      const found = autoDetectRoles(i.guild);
      if (!found.length) return feedback(i, { ok: false, title: "Rien détecté", text: "Classe les rôles à la main avec le menu ci-dessous.", color: COLORS.warning }, "perms");
      const roles = { ...config.perms.roles };
      for (const f of found) roles[f.role.id] = f.level;
      await updateConfig(i.guildId, { perms: { roles } });
      return feedback(i, { ok: true, title: `${found.length} rôle(s) classés`, text: found.map((f) => `\`${f.level}\` ${f.role}`).join("\n") }, "perms");
    }
    if (action === "reset") { await updateConfig(i.guildId, { perms: { roles: {}, users: {}, commands: {}, sections: {} } });
      return feedback(i, { ok: true, title: "Perms réinitialisées", text: "Rôles, forçages et niveaux de section remis à zéro." }, "perms"); }
    if (action === "secreset") { await updateConfig(i.guildId, { perms: { sections: {} } });
      return feedback(i, { ok: true, title: "Niveaux d'origine rétablis", text: "Chaque section retrouve son niveau par défaut." }, "perms", "sections"); }
    if (action === "secpick") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🔐  Niveau de la section" }, description: `Section : **${SECTIONS.find((s) => s.id === i.values[0])?.label}**` })],
      components: [row(new StringSelectMenuBuilder().setCustomId(`p:perms:seclvl:${i.values[0]}`).setPlaceholder("Niveau requis…").addOptions(LEVEL_OPTIONS)),
        backRow("p:perms:page:sections")] });
    if (action === "seclvl") { await updateConfig(i.guildId, { perms: { sections: { ...config.perms.sections, [arg]: Number(i.values[0]) } } });
      return feedback(i, { ok: true, title: "Niveau modifié", text: `**${SECTIONS.find((s) => s.id === arg)?.label}** demande maintenant **${PERM_LABELS[i.values[0]]}**.` }, "perms", "sections"); }
    if (action === "preview") {
      const rid = i.values[0];
      const role = i.guild.roles.cache.get(rid);
      const lvl = Number(config.perms.roles?.[rid] ?? 0);
      const fake = { id: "preview", guild: i.guild, roles: { cache: { has: (x) => x === rid } }, permissions: { has: () => false } };
      const lines = SECTIONS.map((s) => {
        const need = sectionLevel(s, config);
        let why = "";
        if (s.ownerOnly) why = "🔒 propriétaire de 0x";
        else if (s.trusted && !isTrusted(fake, config)) why = `🔒 rôle ${config.trustedRoleId ? `<@&${config.trustedRoleId}>` : "Like me"}`;
        else if (lvl < need) why = `⬆️ demande ${PERM_LABELS[need]}`;
        return `${why ? "🔴" : "✅"} ${s.emoji} **${s.label}**${why ? ` — ${why}` : ""}`;
      });
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: "👁️  Accès du rôle" },
        color: COLORS.primary, description: `${role} — **${PERM_LABELS[lvl]}**\n\n${lines.join("\n")}`,
        footer: "Monte le niveau du rôle, ou baisse celui d'une section" })],
        components: [row(btn("p:perms:page:sections", "Changer le niveau d'une section", ButtonStyle.Primary, "📋"),
          btn("p:perms", "Retour", ButtonStyle.Secondary, "◀️"))] });
    }
    if (action === "role" || action === "user") {
      const targetId = i.values[0];
      if (action === "user" && isOwner(targetId))
        return feedback(i, { ok: false, title: "Impossible", text: `<@${OWNER_ID}> est propriétaire de 0x : son niveau ne se modifie pas.`, color: COLORS.danger }, "perms");
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `${ICONS.shield}  Niveau à attribuer` },
        description: action === "role" ? `Rôle : <@&${targetId}>` : `Membre : <@${targetId}>`, footer: "Niveau 0 = retirer du système" })],
        components: [row(new StringSelectMenuBuilder().setCustomId(`p:perms:lvl:${action}_${targetId}`).setPlaceholder("Choisis le niveau…").addOptions(LEVEL_OPTIONS)),
          row(btn("p:perms", "Annuler", ButtonStyle.Secondary, "◀️"))] });
    }
    if (action === "lvl") {
      const [kind, targetId] = arg.split("_");
      const lvl = Number(i.values[0]);
      const key = kind === "role" ? "roles" : "users";
      const map = { ...config.perms[key] };
      if (lvl === 0) delete map[targetId]; else map[targetId] = lvl;
      await updateConfig(i.guildId, { perms: { [key]: map } });
      return feedback(i, { ok: true, title: "Niveau attribué",
        text: `${kind === "role" ? `<@&${targetId}>` : `<@${targetId}>`} → **${PERM_LABELS[lvl]}**` }, "perms");
    }
  }

  /* ------------------------------ INVITATIONS ---------------------------- */
  if (section === "invites") {
    const trusted = isTrusted(i.member, config);

    if (action === "me") {
      const raw = await inviterStats(i.guildId, i.user.id);
      const s = { active: withBaseline(config, i.user.id, raw.active), total: withBaseline(config, i.user.id, raw.total) };
      const parrain = await getInviter(i.guildId, i.user.id);
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `🔗  Invitations de ${i.user.username}` },
        color: COLORS.primary,
        description: `## ${s.active} invité(s) actif(s)`,
        fields: [
          { name: "Total historique", value: `${s.total}`, inline: true },
          { name: "Partis depuis", value: `${s.total - s.active}`, inline: true },
          { name: "Toi, invité(e) par", value: parrain?.inviter_id ? `<@${parrain.inviter_id}>` : "_inconnu_", inline: true },
        ] })], components: [row(btn("p:invites", "Retour", ButtonStyle.Secondary, "◀️"))] });
    }

    if (action === "who") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🔍  Qui a invité qui ?" }, description: "Choisis un membre pour voir son parrain et ses filleuls." })],
      components: [row(new UserSelectMenuBuilder().setCustomId("p:invites:whopick").setPlaceholder("Sélectionne un membre…")), backRow("p:invites")] });

    if (action === "whopick") {
      const uid = i.values[0];
      const rawS = await inviterStats(i.guildId, uid);
      const s = { active: withBaseline(config, uid, rawS.active), total: withBaseline(config, uid, rawS.total) };
      const parrain = await getInviter(i.guildId, uid);
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: "🔍  Fiche invitation" },
        description: `<@${uid}>`,
        fields: [
          { name: "Invité par", value: parrain?.inviter_id ? `<@${parrain.inviter_id}>` : "_inconnu_", inline: true },
          { name: "Arrivé", value: parrain?.joined_at ? ts(parrain.joined_at) : "—", inline: true },
          { name: "Code utilisé", value: parrain?.code ? `\`${parrain.code}\`` : "—", inline: true },
          { name: "Ses invités actifs", value: `${s.active}`, inline: true },
          { name: "Son total", value: `${s.total}`, inline: true },
        ] })], components: [row(btn("p:invites:who", "Un autre", ButtonStyle.Secondary, "🔁"), btn("p:invites", "Retour", ButtonStyle.Secondary, "◀️"))] });
    }

    if (!trusted) return respond(i, denyView(i.guild, sec, config));

    if (action === "t") { await updateConfig(i.guildId, { invites: { enabled: !config.invites.enabled } });
      return respond(i, await buildSection("invites", i, await getConfig(i.guildId))); }
    if (action === "chan") { await updateConfig(i.guildId, { invites: { channelId: i.values[0] } });
      return feedback(i, { ok: true, title: "Salon défini", text: `Les annonces d'invitation iront dans <#${i.values[0]}>.` }, "invites"); }
    if (action === "delay") return i.showModal(modal("pm:invites:delay", "Suppression automatique",
      [{ id: "minutes", label: "Minutes avant suppression (0 = garder)", required: true, value: `${Math.round((config.invites.deleteAfterMs ?? 120000) / 60000)}`, max: 4 }]));
    if (action === "recal") {
      await i.deferUpdate();
      const r = await recalibrate(i.guild);
      return feedback(i, r.ok
        ? { ok: true, title: "Classement recalé", text: `${r.people} personne(s) recréditée(s) — ${num(r.total)} utilisation(s) de liens reprises depuis Discord.` }
        : { ok: false, title: "Recalage impossible", text: r.error, color: COLORS.danger }, "invites");
    }
    if (action === "reset") { await updateConfig(i.guildId, { invites: { baseline: {} } }); const n = await resetInvites(i.guildId);
      return feedback(i, { ok: true, title: "Classement remis à zéro", text: `${n} enregistrement(s) effacé(s).` }, "invites"); }
  }

  /* -------------------------------- TICKETS ------------------------------ */
  if (section === "tickets") {
    if (action === "publish") {
      const ch = i.guild.channels.cache.get(i.values[0]);
      if (!canSend(ch)) return feedback(i, { ok: false, title: "Salon inaccessible", text: `Je ne peux pas écrire dans ${ch}.`, color: COLORS.danger }, "tickets");
      await ch.send({ embeds: [embed({ guild: i.guild, author: { name: `${ICONS.ticket}  Centre d'aide` }, color: COLORS.primary,
        description: "Choisis le type de ticket dans le menu. Un salon privé sera créé avec le staff concerné.\n\nLes ouvertures abusives sont sanctionnées." })],
        components: ticketPanelComponents() });
      return feedback(i, { ok: true, title: "Panneau publié", text: `Le menu est en ligne dans ${ch}.` }, "tickets");
    }
    if (action === "refresh") { await refreshTicketCounter(i.guild); return feedback(i, { ok: true, title: "Compteur actualisé", text: "Le salon compteur-tickets est à jour." }, "tickets"); }
  }

  /* ------------------------------- COMPTEURS ----------------------------- */
  if (section === "counters") {
    if (action === "set") { await updateConfig(i.guildId, { counters: { ...config.counters, [arg]: i.values[0] } });
      return feedback(i, { ok: true, title: "Compteur rattaché", text: `**${arg}** → <#${i.values[0]}>` }, "counters"); }
    if (action === "clear") { await updateConfig(i.guildId, { counters: { members: null, online: null, voice: null } });
      return feedback(i, { ok: true, title: "Compteurs déliés", text: "Retour à la détection par le motif « Nom : nombre »." }, "counters"); }
    if (action === "force") { await i.deferUpdate(); await updateCounters(i.guild, true); return respond(i, await buildSection("counters", i, config)); }
  }

  /* -------------------------------- NIVEAUX ------------------------------ */
  if (section === "levels") {
    if (action === "t") { await updateConfig(i.guildId, { levelsEnabled: !config.levelsEnabled }); return respond(i, await buildSection("levels", i, await getConfig(i.guildId))); }
    if (action === "channel") { await updateConfig(i.guildId, { funcOverrides: { ...config.funcOverrides, levelUp: i.values[0] } });
      return feedback(i, { ok: true, title: "Salon défini", text: `Les montées de niveau iront dans <#${i.values[0]}>.` }, "levels"); }
    if (action === "reward") return i.showModal(modal(`pm:levels:reward:${i.values[0]}`, "Récompense de niveau",
      [{ id: "level", label: "À quel niveau donner ce rôle ?", required: true, placeholder: "10", max: 3 }]));
    if (action === "delreward") { const r = { ...config.levelRewards }; delete r[i.values[0]];
      await updateConfig(i.guildId, { levelRewards: r });
      return feedback(i, { ok: true, title: "Récompense retirée", text: `Plus rien n'est donné au niveau ${i.values[0]}.` }, "levels"); }
  }

  /* ---------------------------- DROITS DES SALONS ------------------------ */
  if (section === "channels") {
    const reason = `Panneau 0x — ${i.user.tag}`;
    const back = (chId) => buildSection("channels", i, config, chId);

    if (action === "pick") return respond(i, await back(i.values[0]));

    if (action === "all") {
      await i.deferUpdate();
      const on = arg === "lock";
      const n = await lockAllChannels(i.guild, on, reason);
      if (on) setLockdown(i.guildId, 60); else clearLockdown(i.guildId);
      return feedback(i, { ok: true, title: on ? "Serveur verrouillé" : "Serveur déverrouillé",
        text: `${n} salon(s) traité(s).`, color: on ? COLORS.danger : COLORS.success }, "channels");
    }

    const ch = i.guild.channels.cache.get(arg?.split("_")[0]);
    if (!ch) return feedback(i, { ok: false, title: "Salon introuvable", text: "Il a peut-être été supprimé.", color: COLORS.danger }, "channels");
    if (!ch.manageable) return feedback(i, { ok: false, title: "Salon non modifiable",
      text: `Je n'ai pas la main sur ${ch}. Vérifie ma permission « Gérer les salons » et la position de mon rôle.`, color: COLORS.danger }, "channels");

    if (action === "cycle") {
      const [chId, targetId, key] = arg.split("_");
      const r = await cyclePerm(ch, targetId, key, reason);
      if (r.error) return feedback(i, { ok: false, title: "Modification refusée", text: r.error, color: COLORS.danger }, "channels", chId);
      await log(i.guild, "permissions", embed({ guild: i.guild, color: COLORS.warning,
        author: { name: "🔐  Droit modifié" },
        fields: [
          { name: "Salon", value: `${ch}`, inline: true },
          { name: "Cible", value: targetId === i.guildId ? "@everyone" : `<@&${targetId}>`, inline: true },
          { name: "Droit", value: `${PERMS[key].label} → **${STATE_WORD[r.state]}**`, inline: true },
          { name: "Par", value: i.user.tag, inline: true },
        ] }));
      if (isCategory(ch)) {
        return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.success,
          author: { name: `${STATE_ICON[r.state]}  ${PERMS[key].label} — ${STATE_WORD[r.state]}` },
          description: `Réglé sur la catégorie **${ch.name}**.\nVeux-tu l'appliquer aussi à tous ses salons ?` })],
          components: [row(
            btn(`p:channels:cascade:${chId}_${targetId}_${key}_${r.state}`, "Appliquer à toute la catégorie", ButtonStyle.Primary, "⤵️"),
            btn(`p:channels:page:${chId}`, "Non, revenir", ButtonStyle.Secondary, "◀️"))] });
      }
      return respond(i, await back(chId));
    }

    if (action === "cascade") {
      const [chId, targetId, key, state] = arg.split("_");
      await i.deferUpdate();
      const value = state === "allow" ? true : state === "deny" ? false : null;
      const n = await applyToCategory(ch, targetId, key, value, reason);
      return feedback(i, { ok: true, title: "Appliqué à la catégorie",
        text: `**${PERMS[key].label}** → ${STATE_WORD[state]} sur ${n} salon(s) de **${ch.name}**.` }, "channels", chId);
    }

    if (["lock", "unlock", "ro", "reset"].includes(action)) {
      const chId = arg;
      let title, text;
      if (action === "lock") { await lockChannel(ch, true, reason); title = "Salon verrouillé"; text = `Plus personne n'écrit ni ne parle dans ${ch}.`; }
      if (action === "unlock") { await lockChannel(ch, false, reason); title = "Salon déverrouillé"; text = `${ch} est rouvert.`; }
      if (action === "ro") { await readOnly(ch, reason); title = "Lecture seule"; text = `${ch} reste visible, mais silencieux.`; }
      if (action === "reset") { await resetEveryone(ch, reason); title = "Permissions réinitialisées"; text = `${ch} suit de nouveau sa catégorie.`; }
      await log(i.guild, "permissions", embed({ guild: i.guild, color: COLORS.warning,
        author: { name: `🔐  ${title}` },
        fields: [{ name: "Salon", value: `${ch}`, inline: true }, { name: "Par", value: i.user.tag, inline: true }] }));
      return feedback(i, { ok: true, title, text, color: action === "unlock" || action === "reset" ? COLORS.success : COLORS.danger }, "channels", chId);
    }

    if (action === "role") {
      const roleId = i.values[0];
      return respond(i, roleView(i.guild, ch, roleId, `<@&${roleId}>`));
    }

    if (action === "rcycle") {
      const [chId, roleId, key] = arg.split("_");
      const r = await cyclePerm(ch, roleId, key, reason);
      if (r.error) return feedback(i, { ok: false, title: "Modification refusée", text: r.error, color: COLORS.danger }, "channels", chId);
      return respond(i, roleView(i.guild, ch, roleId, `<@&${roleId}>`));
    }

    if (action === "rclear") {
      const [chId, roleId] = arg.split("_");
      await ch.permissionOverwrites.delete(roleId, reason).catch(() => null);
      return feedback(i, { ok: true, title: "Règle supprimée", text: `<@&${roleId}> n'a plus de règle particulière dans ${ch}.` }, "channels", chId);
    }

    if (action === "member") {
      const uid = i.values[0];
      const key = isVoice(ch) ? "speak" : "send";
      const muted = stateOf(ch, uid, key) === "deny";
      await muteMemberHere(ch, uid, !muted, reason);
      await log(i.guild, "permissions", embed({ guild: i.guild, color: muted ? COLORS.success : COLORS.warning,
        author: { name: muted ? "🔊  Parole rendue" : "🔇  Muet dans un salon" },
        fields: [
          { name: "Membre", value: `<@${uid}>`, inline: true },
          { name: "Salon", value: `${ch}`, inline: true },
          { name: "Par", value: i.user.tag, inline: true },
        ] }));
      return feedback(i, { ok: true, title: muted ? "Parole rendue" : "Membre réduit au silence ici",
        text: `<@${uid}> ${muted ? "peut de nouveau" : "ne peut plus"} ${isVoice(ch) ? "parler" : "écrire"} dans ${ch}.`,
        color: muted ? COLORS.success : COLORS.warning }, "channels", ch.id);
    }
  }

  /* --------------------------------- VOCAL ------------------------------- */
  if (section === "voice") {
    if (action === "t") { await updateConfig(i.guildId, { voice: { enabled: !config.voice.enabled } });
      return respond(i, await buildSection("voice", i, await getConfig(i.guildId))); }
    if (action === "cfg") { const v = config.voice;
      return i.showModal(modal("pm:voice:cfg", "Gains vocaux", [
        { id: "xp", label: "XP par minute", required: true, value: `${v.xpPerMinute}`, max: 5 },
        { id: "coins", label: "Coins par minute", required: true, value: `${v.coinsPerMinute}`, max: 5 },
        { id: "interval", label: "Distribution toutes les N minutes", required: true, value: `${v.intervalMinutes}`, max: 3 },
        { id: "minmembers", label: "Minimum de personnes dans le salon", required: true, value: `${v.minMembers}`, max: 2 },
        { id: "unmuted", label: "Casque coupé = pas de gain (oui/non)", value: v.requireUnmuted ? "oui" : "non", max: 3 },
      ])); }
    if (action === "ignore") {
      const list = [...(config.voice.ignoredChannels ?? [])]; const val = i.values[0];
      const idx = list.indexOf(val); idx === -1 ? list.push(val) : list.splice(idx, 1);
      await updateConfig(i.guildId, { voice: { ignoredChannels: list } });
      return respond(i, await buildSection("voice", i, await getConfig(i.guildId)));
    }
    if (action === "tick") {
      await i.deferUpdate();
      const r = await tickVoiceRewards(i.guild);
      return feedback(i, { ok: true, title: "Distribution effectuée",
        text: r.rewarded ? `${r.rewarded} personne(s) récompensée(s)${r.levelUps.length ? ` · ${r.levelUps.length} montée(s) de niveau` : ""}.`
          : "Personne d'éligible : salons vides, membres seuls ou casque coupé." }, "voice");
    }
  }

  /* -------------------------------- ÉCONOMIE ----------------------------- */
  if (section === "eco") {
    if (action === "t") { await updateConfig(i.guildId, { economy: { enabled: !config.economy.enabled } }); return respond(i, await buildSection("eco", i, await getConfig(i.guildId))); }
    if (action === "montants") { const e = config.economy;
      return i.showModal(modal("pm:eco:montants", "Montants de l'économie", [
        { id: "currency", label: "Symbole de la monnaie", value: e.currency, max: 8 },
        { id: "daily", label: "Récompense quotidienne", value: `${e.dailyAmount}`, max: 8 },
        { id: "work", label: "Travail : min-max-minutes", value: `${e.workMin}-${e.workMax}-${Math.round(e.workCooldownMs / 60000)}`, max: 20 },
        { id: "drop", label: "Colis : min-max", value: `${e.dropMin}-${e.dropMax}`, max: 16 },
        { id: "chance", label: "Chance de colis par message (%)", value: `${e.dropChance}`, max: 3 },
      ])); }
    if (action === "addtype") {
      const type = i.values[0];
      if (ITEM_TYPES[type]?.needsRole) return respond(i, { embeds: [embed({ guild: i.guild,
        author: { name: `${ITEM_TYPES[type].emoji}  ${ITEM_TYPES[type].label}` }, description: "Quel rôle sera offert à l'achat ?" })],
        components: [row(new RoleSelectMenuBuilder().setCustomId(`p:eco:additem:${type}`).setPlaceholder("Rôle offert…")), backRow("p:eco")] });
      return i.showModal(itemModal(type, "none"));
    }
    if (action === "additem") return i.showModal(itemModal(arg, i.values[0]));
    if (action === "del") { await updateConfig(i.guildId, { economy: { shop: config.economy.shop.filter((x) => x.id !== i.values[0]) } });
      return feedback(i, { ok: true, title: "Article retiré", text: "La boutique est à jour." }, "eco"); }
    if (action === "space") {
      await i.deferUpdate();
      const r = await setupCoinsSpace(i.guild, memberPanel);
      return respond(i, { embeds: [embed({ guild: i.guild, color: r.ko === 0 ? COLORS.success : COLORS.warning,
        author: { name: "🏛️  Espace coins configuré" },
        description: r.report.map((x) => `${x.ok ? "✅" : "⚠️"} **${x.label}**\n └ ${x.detail}`).join("\n"),
        footer: `${r.ok} réussite(s) · ${r.ko} à corriger — relançable sans créer de doublon` })],
        components: (await buildSection("eco", i, await getConfig(i.guildId))).components });
    }
    if (action === "dropch") { await updateConfig(i.guildId, { economy: { dropChannelId: i.values[0] } });
      return feedback(i, { ok: true, title: "Salon des colis", text: `Les colis tomberont dans <#${i.values[0]}>.` }, "eco"); }
    if (action === "drop") {
      const e = config.economy;
      const ch = e.dropChannelId ? i.guild.channels.cache.get(e.dropChannelId) : resolveFuncChannel(i.guild, "drops", config) ?? i.channel;
      const amount = e.dropMin + Math.floor(Math.random() * (e.dropMax - e.dropMin + 1));
      const msg = await launchDrop(i.guild, ch, amount);
      return feedback(i, msg ? { ok: true, title: "Colis lâché", text: `${num(amount)} coins à récupérer dans ${ch}.`, color: COLORS.gold }
        : { ok: false, title: "Échec", text: `Impossible d'écrire dans ${ch}.`, color: COLORS.danger }, "eco");
    }
  }

  /* ------------------------------- GIVEAWAYS ----------------------------- */
  if (section === "gw") {
    if (action === "new") return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `${ICONS.gift}  Nouveau giveaway` },
      description: "Dans quel salon le publier ?" })],
      components: [row(new ChannelSelectMenuBuilder().setCustomId("p:gw:ch").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon du giveaway…")), backRow("p:gw")] });
    if (action === "ch") return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `${ICONS.gift}  Rôle requis ?` },
      description: `Salon : <#${i.values[0]}>\n\nChoisis un rôle obligatoire, ou continue sans condition.` })],
      components: [row(new RoleSelectMenuBuilder().setCustomId(`p:gw:role:${i.values[0]}`).setPlaceholder("Rôle requis (facultatif)…")),
        row(btn(`p:gw:norole:${i.values[0]}`, "Ouvert à tous", ButtonStyle.Success, "🌍"), btn("p:gw", "Annuler", ButtonStyle.Secondary, "◀️"))] });
    if (action === "role") return i.showModal(modal(`pm:gw:new:${arg}_${i.values[0]}`, "Nouveau giveaway", [
      { id: "prize", label: "Ce qui est à gagner", required: true, max: 200 },
      { id: "duration", label: "Durée (30m, 6h, 2d)", required: true, max: 10 },
      { id: "winners", label: "Nombre de gagnants", value: "1", max: 2 }]));
    if (action === "norole") return i.showModal(modal(`pm:gw:new:${arg}_none`, "Nouveau giveaway", [
      { id: "prize", label: "Ce qui est à gagner", required: true, max: 200 },
      { id: "duration", label: "Durée (30m, 6h, 2d)", required: true, max: 10 },
      { id: "winners", label: "Nombre de gagnants", value: "1", max: 2 }]));
    if (action === "pick") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: `${ICONS.gift}  Giveaway #${i.values[0]}` }, description: "Que veux-tu faire ?" })],
      components: [row(btn(`p:gw:end:${i.values[0]}`, "Terminer maintenant", ButtonStyle.Danger, "🏁"),
        btn(`p:gw:reroll:${i.values[0]}`, "Retirer au sort", ButtonStyle.Primary, "🎲"),
        btn("p:gw", "Retour", ButtonStyle.Secondary, "◀️"))] });
    if (action === "end" || action === "reroll") {
      const g = await getGiveaway(Number(arg));
      if (!g) return feedback(i, { ok: false, title: "Introuvable", text: "Ce giveaway n'existe plus.", color: COLORS.danger }, "gw");
      await i.deferUpdate();
      const w = await drawGiveaway(i.client, g, action === "reroll" ? 1 : null);
      return feedback(i, { ok: true, title: action === "reroll" ? "Nouveau tirage" : "Giveaway terminé",
        text: w.length ? `Gagnant(s) : ${w.map((x) => `<@${x}>`).join(", ")}` : "Aucun participant.", color: COLORS.gold }, "gw");
    }
  }

  /* ------------------------------ PUBLICATIONS --------------------------- */
  if (section === "publish") {
    if (action === "pick") {
      const labels = { member: "Espace membre", ticket: "Tickets", confess: "Confessions", roles: "Menu de rôles", say: "Annonce", poll: "Sondage" };
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `📢  ${labels[arg]}` }, description: "Dans quel salon ?" })],
        components: [row(new ChannelSelectMenuBuilder().setCustomId(`p:publish:go:${arg}`)
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
          .setMinValues(1).setMaxValues(10)
          .setPlaceholder("Choisis un ou plusieurs salons…")), backRow("p:publish")] });
    }
    if (action === "go") {
      const targets = i.values.map((id) => i.guild.channels.cache.get(id)).filter(Boolean);
      const usable = targets.filter((c) => canSend(c));
      if (!usable.length) return feedback(i, { ok: false, title: "Salons inaccessibles",
        text: `Je ne peux écrire dans aucun des salons choisis.`, color: COLORS.danger }, "publish");
      const chId = i.values.join("+");
      if (arg === "roles") return i.showModal(modal(`pm:publish:roles:${chId}`, "Menu de rôles", [
        { id: "title", label: "Titre du menu", required: true, max: 100 },
        { id: "roles", label: "Rôles : mentions ou IDs, séparés par ,", required: true, long: true, max: 500 }]));
      if (arg === "say") return i.showModal(modal(`pm:publish:say:${chId}`, "Annonce", [
        { id: "text", label: "Texte", required: true, long: true, max: 3000 },
        { id: "title", label: "Titre (vide = message simple)", max: 100 }]));
      if (arg === "poll") return i.showModal(modal(`pm:publish:poll:${chId}`, "Sondage", [
        { id: "question", label: "Question", required: true, max: 200 },
        { id: "options", label: "Choix séparés par des virgules", required: true, long: true, max: 500 }]));
      for (const ch of usable) {
        if (arg === "member") await ch.send(memberPanel(i.guild)).catch(() => null);
        else if (arg === "confess") await ch.send(confessionPanel(i.guild)).catch(() => null);
        else await ch.send({ embeds: [embed({ guild: i.guild, author: { name: `${ICONS.ticket}  Centre d'aide` },
          description: "Choisis le type de ticket dans le menu ci-dessous." })], components: ticketPanelComponents() }).catch(() => null);
      }
      const skipped = targets.length - usable.length;
      return feedback(i, { ok: true, title: `Publié dans ${usable.length} salon(s)`,
        text: usable.map((c) => `${c}`).join(" ") + (skipped ? `\n\n⚠️ ${skipped} salon(s) ignoré(s) — je n'y ai pas accès.` : "") }, "publish");
    }
  }

  return respond(i, await buildSection(section, i, config));
}

/* ========================================================================== */
/*                          TRAITEMENT DES MODALES                            */
/* ========================================================================== */

async function handleModal(i, parts, config, level) {
  const [, section, action, arg] = parts;
  const sec = SECTIONS.find((s) => s.id === section);
  if (sec?.ownerOnly && !isOwner(i.user.id)) return respond(i, denyView(i.guild, sec, config));
  if (sec?.trusted && !isTrusted(i.member, config)) return respond(i, denyView(i.guild, sec, config));
  const f = (id) => i.fields.getTextInputValue(id)?.trim() ?? "";
  const int = (id) => { const n = parseInt(f(id), 10); return Number.isFinite(n) ? n : null; };

  /* ---------------------------------- MOD -------------------------------- */
  if (section === "mod") {
    if (action === "purge") {
      const ch = i.guild.channels.cache.get(arg) ?? i.channel;
      return feedback(i, await actionPurge(ch, Math.min(100, Math.max(1, int("amount") ?? 0)), f("user").replace(/\D/g, "") || null, i.user), "mod");
    }
    if (action === "slow") {
      const ch = i.guild.channels.cache.get(arg) ?? i.channel;
      const s = Math.max(0, Math.min(21600, int("seconds") ?? 0));
      await ch.setRateLimitPerUser(s, i.user.tag).catch(() => null);
      return feedback(i, { ok: true, title: s ? "Mode lent activé" : "Mode lent coupé", text: `${ch} — ${s ? `${s} seconde(s) entre chaque message` : "plus de limite"}.` }, "mod");
    }
    if (action === "unban") return feedback(i, await actionUnban(i.guild, f("userid").replace(/\D/g, ""), i.user, f("reason") || "Non précisée"), "mod");

    const target = await i.guild.members.fetch(arg).catch(() => null);
    if (!target) return feedback(i, { ok: false, title: "Introuvable", text: "Ce membre a quitté le serveur.", color: COLORS.danger }, "mod");
    const problem = checkTarget(i.guild, i.member, target, config);
    if (problem) return feedback(i, { ok: false, title: "Action refusée", text: problem, color: COLORS.danger }, "mod");
    const reason = f("reason") || "Non précisée";

    if (action === "warn") return feedback(i, await actionWarn(i.guild, target, i.user, reason), "mod");
    if (action === "timeout") return feedback(i, await actionTimeout(i.guild, target, i.user, parseDuration(f("duration")), reason), "mod");
    if (action === "kick") return feedback(i, await actionKick(i.guild, target, i.user, reason), "mod");
    if (action === "ban") return feedback(i, await actionBan(i.guild, target, i.user, reason, Math.min(7, Math.max(0, int("purge") ?? 0))), "mod");
    if (action === "jail") return feedback(i, await actionJail(i.guild, target, i.user, reason, parseDuration(f("duration"))), "mod");
    if (action === "coins") {
      const amount = int("amount");
      if (amount === null) return feedback(i, { ok: false, title: "Montant invalide", text: "Entre un nombre entier.", color: COLORS.danger }, "mod");
      return feedback(i, await actionGrantCoins(i.guild, target, amount, i.user, f("reason")), "mod");
    }
  }

  /* --------------------------------- STAFF ------------------------------- */
  if (section === "staff" && action === "absence") {
    const ms = parseDuration(f("duration"));
    const until = ms ? new Date(Date.now() + ms) : null;
    await addAbsence(i.guildId, i.user.id, f("reason"), until);
    const ch = resolveFuncChannel(i.guild, "absences", config);
    const e = embed({ guild: i.guild, color: COLORS.neutral, author: { name: "🛌  Absence déclarée" },
      fields: [{ name: "Membre", value: `${i.user}`, inline: true },
        { name: "Retour", value: until ? ts(until) : "Non précisé", inline: true },
        { name: "Motif", value: f("reason") }] });
    if (ch && canSend(ch)) await ch.send({ embeds: [e] }).catch(() => null);
    return feedback(i, { ok: true, title: "Absence enregistrée", text: ch ? `Publiée dans ${ch}.` : "Aucun salon #absences trouvé — enregistrée quand même." }, "staff");
  }

  /* -------------------------------- CONFIG ------------------------------- */
  if (section === "config") {
    if (action === "msgw") { await updateConfig(i.guildId, { welcomeMessage: f("text") }); return feedback(i, { ok: true, title: "Message d'accueil enregistré", text: f("text") }, "config", "welcome"); }
    if (action === "msgg") { await updateConfig(i.guildId, { goodbyeMessage: f("text") }); return feedback(i, { ok: true, title: "Message de départ enregistré", text: f("text") }, "config", "welcome"); }
  }

  /* -------------------------------- AUTOMOD ------------------------------ */
  if (section === "automod") {
    if (action === "seuils") {
      const [thr, win, mins] = f("spam").split("/").map((x) => parseInt(x, 10));
      const patch = {};
      if (Number.isFinite(thr) && thr >= 3) patch.spamThreshold = Math.min(30, thr);
      if (Number.isFinite(win) && win >= 3) patch.spamWindowMs = Math.min(120, win) * 1000;
      if (Number.isFinite(mins) && mins >= 1) patch.spamTimeoutMinutes = Math.min(1440, mins);
      const m = int("mentions"); if (m !== null) patch.maxMentions = Math.min(30, Math.max(0, m));
      const c = int("caps"); if (c !== null) patch.capsPercent = Math.min(100, Math.max(0, c));
      const e = int("emojis"); if (e !== null) patch.maxEmojis = Math.min(50, Math.max(0, e));
      await updateConfig(i.guildId, { automod: patch });
      return feedback(i, { ok: true, title: "Seuils enregistrés", text: "L'automod applique déjà les nouvelles valeurs." }, "automod");
    }
    if (action === "mots") {
      const words = [...new Set(f("words").split(",").map((w) => w.trim().toLowerCase()).filter(Boolean))];
      await updateConfig(i.guildId, { automod: { bannedWords: words } });
      return feedback(i, { ok: true, title: "Liste enregistrée", text: `${words.length} mot(s) interdit(s).` }, "automod");
    }
  }

  /* ------------------------------- PROTECT ------------------------------- */
  if (section === "protect") {
    if (action === "raid") {
      const patch = {};
      const t = int("threshold"); if (t !== null) patch.joinThreshold = Math.max(3, Math.min(50, t));
      const w = int("window"); if (w !== null) patch.joinWindowMs = Math.max(5, Math.min(120, w)) * 1000;
      const a = int("age"); if (a !== null) patch.minAccountAgeDays = Math.max(0, Math.min(90, a));
      const l = int("lockmin"); if (l !== null) patch.lockdownMinutes = Math.max(1, Math.min(1440, l));
      const m = f("mode").toLowerCase(); if (["lockdown", "kick", "off"].includes(m)) patch.onRaid = m;
      await updateConfig(i.guildId, { antiraid: patch });
      return feedback(i, { ok: true, title: "Anti-raid enregistré", text: "Les nouveaux seuils sont actifs." }, "protect");
    }
    if (action === "nuke") {
      const patch = {};
      const c = int("chan"); if (c !== null) patch.channelDeleteMax = Math.max(1, Math.min(20, c));
      const r = int("role"); if (r !== null) patch.roleDeleteMax = Math.max(1, Math.min(20, r));
      const [b, k] = f("bankick").split("/").map((x) => parseInt(x, 10));
      if (Number.isFinite(b)) patch.banMax = Math.max(1, Math.min(30, b));
      if (Number.isFinite(k)) patch.kickMax = Math.max(1, Math.min(30, k));
      const w = int("window"); if (w !== null) patch.windowMs = Math.max(5, Math.min(120, w)) * 1000;
      const m = f("mode").toLowerCase(); if (["strip", "ban", "alert"].includes(m)) patch.punishment = m;
      await updateConfig(i.guildId, { antinuke: patch });
      return feedback(i, { ok: true, title: "Anti-nuke enregistré", text: "Les nouveaux seuils sont actifs." }, "protect");
    }
  }

  /* -------------------------------- NIVEAUX ------------------------------ */
  if (section === "levels" && action === "reward") {
    const lvl = int("level");
    if (lvl === null || lvl < 1) return feedback(i, { ok: false, title: "Niveau invalide", text: "Entre un nombre supérieur à 0.", color: COLORS.danger }, "levels");
    await updateConfig(i.guildId, { levelRewards: { ...config.levelRewards, [lvl]: arg } });
    return feedback(i, { ok: true, title: "Récompense enregistrée", text: `<@&${arg}> sera donné au niveau **${lvl}**.` }, "levels");
  }

  /* ---------------------------- DROITS DES SALONS ------------------------ */
  if (section === "channels") {
    const reason = `Panneau 0x — ${i.user.tag}`;
    const back = (chId) => buildSection("channels", i, config, chId);

    if (action === "pick") return respond(i, await back(i.values[0]));

    if (action === "all") {
      await i.deferUpdate();
      const on = arg === "lock";
      const n = await lockAllChannels(i.guild, on, reason);
      if (on) setLockdown(i.guildId, 60); else clearLockdown(i.guildId);
      return feedback(i, { ok: true, title: on ? "Serveur verrouillé" : "Serveur déverrouillé",
        text: `${n} salon(s) traité(s).`, color: on ? COLORS.danger : COLORS.success }, "channels");
    }

    const ch = i.guild.channels.cache.get(arg?.split("_")[0]);
    if (!ch) return feedback(i, { ok: false, title: "Salon introuvable", text: "Il a peut-être été supprimé.", color: COLORS.danger }, "channels");
    if (!ch.manageable) return feedback(i, { ok: false, title: "Salon non modifiable",
      text: `Je n'ai pas la main sur ${ch}. Vérifie ma permission « Gérer les salons » et la position de mon rôle.`, color: COLORS.danger }, "channels");

    if (action === "cycle") {
      const [chId, targetId, key] = arg.split("_");
      const r = await cyclePerm(ch, targetId, key, reason);
      if (r.error) return feedback(i, { ok: false, title: "Modification refusée", text: r.error, color: COLORS.danger }, "channels", chId);
      await log(i.guild, "permissions", embed({ guild: i.guild, color: COLORS.warning,
        author: { name: "🔐  Droit modifié" },
        fields: [
          { name: "Salon", value: `${ch}`, inline: true },
          { name: "Cible", value: targetId === i.guildId ? "@everyone" : `<@&${targetId}>`, inline: true },
          { name: "Droit", value: `${PERMS[key].label} → **${STATE_WORD[r.state]}**`, inline: true },
          { name: "Par", value: i.user.tag, inline: true },
        ] }));
      if (isCategory(ch)) {
        return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.success,
          author: { name: `${STATE_ICON[r.state]}  ${PERMS[key].label} — ${STATE_WORD[r.state]}` },
          description: `Réglé sur la catégorie **${ch.name}**.\nVeux-tu l'appliquer aussi à tous ses salons ?` })],
          components: [row(
            btn(`p:channels:cascade:${chId}_${targetId}_${key}_${r.state}`, "Appliquer à toute la catégorie", ButtonStyle.Primary, "⤵️"),
            btn(`p:channels:page:${chId}`, "Non, revenir", ButtonStyle.Secondary, "◀️"))] });
      }
      return respond(i, await back(chId));
    }

    if (action === "cascade") {
      const [chId, targetId, key, state] = arg.split("_");
      await i.deferUpdate();
      const value = state === "allow" ? true : state === "deny" ? false : null;
      const n = await applyToCategory(ch, targetId, key, value, reason);
      return feedback(i, { ok: true, title: "Appliqué à la catégorie",
        text: `**${PERMS[key].label}** → ${STATE_WORD[state]} sur ${n} salon(s) de **${ch.name}**.` }, "channels", chId);
    }

    if (["lock", "unlock", "ro", "reset"].includes(action)) {
      const chId = arg;
      let title, text;
      if (action === "lock") { await lockChannel(ch, true, reason); title = "Salon verrouillé"; text = `Plus personne n'écrit ni ne parle dans ${ch}.`; }
      if (action === "unlock") { await lockChannel(ch, false, reason); title = "Salon déverrouillé"; text = `${ch} est rouvert.`; }
      if (action === "ro") { await readOnly(ch, reason); title = "Lecture seule"; text = `${ch} reste visible, mais silencieux.`; }
      if (action === "reset") { await resetEveryone(ch, reason); title = "Permissions réinitialisées"; text = `${ch} suit de nouveau sa catégorie.`; }
      await log(i.guild, "permissions", embed({ guild: i.guild, color: COLORS.warning,
        author: { name: `🔐  ${title}` },
        fields: [{ name: "Salon", value: `${ch}`, inline: true }, { name: "Par", value: i.user.tag, inline: true }] }));
      return feedback(i, { ok: true, title, text, color: action === "unlock" || action === "reset" ? COLORS.success : COLORS.danger }, "channels", chId);
    }

    if (action === "role") {
      const roleId = i.values[0];
      return respond(i, roleView(i.guild, ch, roleId, `<@&${roleId}>`));
    }

    if (action === "rcycle") {
      const [chId, roleId, key] = arg.split("_");
      const r = await cyclePerm(ch, roleId, key, reason);
      if (r.error) return feedback(i, { ok: false, title: "Modification refusée", text: r.error, color: COLORS.danger }, "channels", chId);
      return respond(i, roleView(i.guild, ch, roleId, `<@&${roleId}>`));
    }

    if (action === "rclear") {
      const [chId, roleId] = arg.split("_");
      await ch.permissionOverwrites.delete(roleId, reason).catch(() => null);
      return feedback(i, { ok: true, title: "Règle supprimée", text: `<@&${roleId}> n'a plus de règle particulière dans ${ch}.` }, "channels", chId);
    }

    if (action === "member") {
      const uid = i.values[0];
      const key = isVoice(ch) ? "speak" : "send";
      const muted = stateOf(ch, uid, key) === "deny";
      await muteMemberHere(ch, uid, !muted, reason);
      await log(i.guild, "permissions", embed({ guild: i.guild, color: muted ? COLORS.success : COLORS.warning,
        author: { name: muted ? "🔊  Parole rendue" : "🔇  Muet dans un salon" },
        fields: [
          { name: "Membre", value: `<@${uid}>`, inline: true },
          { name: "Salon", value: `${ch}`, inline: true },
          { name: "Par", value: i.user.tag, inline: true },
        ] }));
      return feedback(i, { ok: true, title: muted ? "Parole rendue" : "Membre réduit au silence ici",
        text: `<@${uid}> ${muted ? "peut de nouveau" : "ne peut plus"} ${isVoice(ch) ? "parler" : "écrire"} dans ${ch}.`,
        color: muted ? COLORS.success : COLORS.warning }, "channels", ch.id);
    }
  }

  /* --------------------------------- VOCAL ------------------------------- */
  if (section === "voice") {
    if (action === "t") { await updateConfig(i.guildId, { voice: { enabled: !config.voice.enabled } });
      return respond(i, await buildSection("voice", i, await getConfig(i.guildId))); }
    if (action === "cfg") { const v = config.voice;
      return i.showModal(modal("pm:voice:cfg", "Gains vocaux", [
        { id: "xp", label: "XP par minute", required: true, value: `${v.xpPerMinute}`, max: 5 },
        { id: "coins", label: "Coins par minute", required: true, value: `${v.coinsPerMinute}`, max: 5 },
        { id: "interval", label: "Distribution toutes les N minutes", required: true, value: `${v.intervalMinutes}`, max: 3 },
        { id: "minmembers", label: "Minimum de personnes dans le salon", required: true, value: `${v.minMembers}`, max: 2 },
        { id: "unmuted", label: "Casque coupé = pas de gain (oui/non)", value: v.requireUnmuted ? "oui" : "non", max: 3 },
      ])); }
    if (action === "ignore") {
      const list = [...(config.voice.ignoredChannels ?? [])]; const val = i.values[0];
      const idx = list.indexOf(val); idx === -1 ? list.push(val) : list.splice(idx, 1);
      await updateConfig(i.guildId, { voice: { ignoredChannels: list } });
      return respond(i, await buildSection("voice", i, await getConfig(i.guildId)));
    }
    if (action === "tick") {
      await i.deferUpdate();
      const r = await tickVoiceRewards(i.guild);
      return feedback(i, { ok: true, title: "Distribution effectuée",
        text: r.rewarded ? `${r.rewarded} personne(s) récompensée(s)${r.levelUps.length ? ` · ${r.levelUps.length} montée(s) de niveau` : ""}.`
          : "Personne d'éligible : salons vides, membres seuls ou casque coupé." }, "voice");
    }
  }

  /* -------------------------------- ÉCONOMIE ----------------------------- */
  if (section === "voice" && action === "cfg") {
    const patch = {};
    const xp = int("xp"); if (xp !== null) patch.xpPerMinute = Math.max(0, Math.min(500, xp));
    const co = int("coins"); if (co !== null) patch.coinsPerMinute = Math.max(0, Math.min(500, co));
    const iv = int("interval"); if (iv !== null) patch.intervalMinutes = Math.max(1, Math.min(60, iv));
    const mm = int("minmembers"); if (mm !== null) patch.minMembers = Math.max(1, Math.min(20, mm));
    const um = f("unmuted").toLowerCase();
    if (um) patch.requireUnmuted = ["oui", "o", "yes", "true", "1"].includes(um);
    await updateConfig(i.guildId, { voice: patch });
    return feedback(i, { ok: true, title: "Gains vocaux enregistrés",
      text: voiceSummary(await getConfig(i.guildId)) }, "voice");
  }

  if (section === "eco") {
    if (action === "montants") {
      const patch = {};
      const cur = f("currency"); if (cur) patch.currency = cur.slice(0, 8);
      const d = int("daily"); if (d !== null) patch.dailyAmount = Math.max(0, d);
      const [wmin, wmax, wcd] = f("work").split("-").map((x) => parseInt(x, 10));
      if (Number.isFinite(wmin) && Number.isFinite(wmax) && wmin <= wmax) { patch.workMin = wmin; patch.workMax = wmax; }
      if (Number.isFinite(wcd) && wcd >= 1) patch.workCooldownMs = Math.min(1440, wcd) * 60_000;
      const [dmin, dmax] = f("drop").split("-").map((x) => parseInt(x, 10));
      if (Number.isFinite(dmin) && Number.isFinite(dmax) && dmin <= dmax) { patch.dropMin = dmin; patch.dropMax = dmax; }
      const ch = int("chance"); if (ch !== null) patch.dropChance = Math.max(0, Math.min(100, ch));
      await updateConfig(i.guildId, { economy: patch });
      return feedback(i, { ok: true, title: "Montants enregistrés", text: "L'économie utilise déjà les nouvelles valeurs.", color: COLORS.gold }, "eco");
    }
    if (action === "additem") {
      const [type, roleId] = arg.split("_");
      const name = f("name"); const price = int("price");
      if (!name || price === null || price < 1)
        return feedback(i, { ok: false, title: "Article invalide", text: "Il faut un nom et un prix positif.", color: COLORS.danger }, "eco");

      if (ITEM_TYPES[type]?.needsRole) {
        const role = i.guild.roles.cache.get(roleId);
        if (!role || role.position >= i.guild.members.me.roles.highest.position)
          return feedback(i, { ok: false, title: "Rôle inutilisable", text: "Ce rôle est au-dessus du mien ou n'existe plus.", color: COLORS.danger }, "eco");
      }

      const item = {
        id: `${type}-${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}` || `a${Date.now()}`,
        type, name, price,
        roleId: ITEM_TYPES[type]?.needsRole ? roleId : null,
        amount: int("amount"), hours: int("hours"), stock: int("stock"),
      };
      await updateConfig(i.guildId, { economy: { shop: [...config.economy.shop, item] } });
      return feedback(i, { ok: true, title: "Article ajouté",
        text: `${ITEM_TYPES[type]?.emoji ?? ""} **${name}** — ${num(price)} coins`, color: COLORS.gold }, "eco");
    }
  }

  /* ------------------------------- GIVEAWAYS ----------------------------- */
  if (section === "gw" && action === "new") {
    const [chId, roleId] = arg.split("_");
    const ms = parseDuration(f("duration"));
    if (!ms || ms < 60_000) return feedback(i, { ok: false, title: "Durée invalide", text: "Minimum 1 minute. Exemples : `30m`, `6h`, `2d`.", color: COLORS.danger }, "gw");
    const ch = i.guild.channels.cache.get(chId) ?? i.channel;
    const gid = await createGiveaway({ guildId: i.guildId, channelId: ch.id, prize: f("prize"),
      winners: Math.max(1, Math.min(20, int("winners") ?? 1)), hostId: i.user.id,
      requiredRole: roleId === "none" ? null : roleId, endsAt: new Date(Date.now() + ms) });
    await postGiveaway(i.client, gid, ch);
    return feedback(i, { ok: true, title: "Giveaway lancé",
      text: `\`#${gid}\` **${f("prize")}** dans ${ch}, fin dans ${formatDuration(ms)}${roleId !== "none" ? ` · <@&${roleId}> requis` : ""}.`, color: COLORS.gold }, "gw");
  }

  /* ------------------------------ PUBLICATIONS --------------------------- */
  if (section === "publish") {
    const chans = String(arg ?? "").split("+").map((id) => i.guild.channels.cache.get(id)).filter((c) => c && canSend(c));
    if (!chans.length) chans.push(i.channel);
    const ch = chans[0];
    const spread = (label) => ({ ok: true, title: `${label} dans ${chans.length} salon(s)`, text: chans.map((c) => `${c}`).join(" ") });
    if (action === "roles") {
      const ids = f("roles").match(/\d{15,25}/g) ?? [];
      const roles = ids.map((x) => i.guild.roles.cache.get(x)).filter(Boolean).slice(0, 20);
      if (!roles.length) return feedback(i, { ok: false, title: "Aucun rôle valide", text: "Mentionne les rôles ou colle leurs identifiants.", color: COLORS.danger }, "publish");
      const top = i.guild.members.me.roles.highest.position;
      const bad = roles.filter((r) => r.position >= top || r.managed);
      if (bad.length) return feedback(i, { ok: false, title: "Rôles inutilisables", text: `Je ne peux pas gérer ${bad.join(", ")}.`, color: COLORS.danger }, "publish");
      for (const c of chans) await c.send({ embeds: [embed({ guild: i.guild, author: { name: `🎭  ${f("title")}` },
        description: "Sélectionne les rôles que tu veux. Désélectionne pour les retirer." })],
        components: [row(new StringSelectMenuBuilder().setCustomId("rolemenu").setPlaceholder("Choisis tes rôles")
          .setMinValues(0).setMaxValues(roles.length).addOptions(roles.map((r) => ({ label: r.name.slice(0, 100), value: r.id }))))] }).catch(() => null);
      return feedback(i, spread(`Menu de ${roles.length} rôle(s) publié`), "publish");
    }
    if (action === "say") {
      const title = f("title"); const text = f("text").replaceAll("\\n", "\n");
      for (const c of chans) await c.send(title
        ? { embeds: [embed({ guild: i.guild, author: { name: `📣  ${title}` }, description: text })] }
        : { content: text }).catch(() => null);
      return feedback(i, spread("Annonce publiée"), "publish");
    }
    if (action === "poll") {
      const POLL = ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣", "🔟"];
      const opts = f("options").split(",").map((s) => s.trim()).filter(Boolean).slice(0, 10);
      if (opts.length < 2) return feedback(i, { ok: false, title: "Sondage invalide", text: "Il faut au moins 2 choix.", color: COLORS.danger }, "publish");
      for (const c of chans) {
        const msg = await c.send({ embeds: [embed({ guild: i.guild, author: { name: `📊  ${f("question")}` },
          description: opts.map((o, n) => `${POLL[n]} ${o}`).join("\n\n"), footer: `Lancé par ${i.user.tag}` })] }).catch(() => null);
        if (msg) for (let n = 0; n < opts.length; n++) await msg.react(POLL[n]).catch(() => null);
      }
      return feedback(i, spread(`Sondage à ${opts.length} choix publié`), "publish");
    }
  }

  if (section === "invites" && action === "delay") {
    const m = int("minutes");
    if (m === null || m < 0) return feedback(i, { ok: false, title: "Valeur invalide", text: "Entre un nombre de minutes.", color: COLORS.danger }, "invites");
    await updateConfig(i.guildId, { invites: { deleteAfterMs: Math.min(1440, m) * 60_000 } });
    return feedback(i, { ok: true, title: "Délai enregistré",
      text: m === 0 ? "Les annonces ne seront plus supprimées." : `Suppression après ${m} minute(s).` }, "invites");
  }

  /* ---------------------------- PANNEAUX PUBLICS ------------------------- */
  if (section === "pub") {
    if (action === "buyrole") {
      const r = await actionBuy(i.guild, i.member, arg, { name: f("name"), color: f("color") });
      return i.reply({ embeds: [embed({ guild: i.guild, color: r.color,
        author: { name: `${r.ok ? ICONS.ok : ICONS.no}  ${r.title}` }, description: r.text })], ...EPH });
    }
    if (action === "confess") return postConfession(i, f("text"));
    if (action === "pay") {
      const to = await i.client.users.fetch(f("user").replace(/\D/g, "")).catch(() => null);
      const amount = int("amount");
      if (!to) return i.reply({ content: "Membre introuvable. Colle son identifiant.", ...EPH });
      if (amount === null || amount < 1) return i.reply({ content: "Montant invalide.", ...EPH });
      const r = await actionPay(i.guild, i.user, to, amount);
      return i.reply({ embeds: [embed({ guild: i.guild, color: r.color,
        author: { name: `${r.ok ? ICONS.ok : ICONS.no}  ${r.title}` }, description: r.text })], ...EPH });
    }
  }

  return respond(i, await buildSection("home", i, config));
}

/* ========================================================================== */
/*                           MENUS CONTEXTUELS                                */
/* ========================================================================== */

async function handleContextMenu(i) {
  const config = await getConfig(i.guildId);
  const level = permLevel(i.member, config);
  const deny = (need) => i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
    author: { name: `${ICONS.no}  Accès refusé` },
    description: `Cette action demande **${PERM_LABELS[need]}**.\nTon niveau : **${PERM_LABELS[level]}**.` })], ...EPH });

  if (i.commandName === "Fiche de modération") {
    if (level < 1) return deny(1);
    await i.deferReply(EPH);
    i.replied = true;
    return showMemberCard(i, i.targetId, config);
  }

  if (i.commandName === "Ses invitations") {
    const raw = await inviterStats(i.guildId, i.targetId);
    const s = { active: withBaseline(config, i.targetId, raw.active), total: withBaseline(config, i.targetId, raw.total) };
    const parrain = await getInviter(i.guildId, i.targetId);
    return i.reply({ embeds: [embed({ guild: i.guild, author: { name: "🔗  Invitations" },
      description: `<@${i.targetId}>`,
      fields: [
        { name: "Invités actifs", value: `${s.active}`, inline: true },
        { name: "Total", value: `${s.total}`, inline: true },
        { name: "Invité(e) par", value: parrain?.inviter_id ? `<@${parrain.inviter_id}>` : "_inconnu_", inline: true },
      ] })], ...EPH });
  }

  if (i.commandName === "Supprimer et avertir") {
    if (level < 1) return deny(1);
    const msg = i.targetMessage;
    const author = msg.author;
    if (author.bot) return i.reply({ content: "Ce message vient d'un bot.", ...EPH });
    const target = await i.guild.members.fetch(author.id).catch(() => null);
    if (!target) return i.reply({ content: "L'auteur a quitté le serveur.", ...EPH });
    const problem = checkTarget(i.guild, i.member, target, config);
    if (problem) return i.reply({ content: problem, ...EPH });
    await msg.delete().catch(() => null);
    return i.showModal(modal(`pm:mod:warn:${author.id}`, `Avertir ${author.username}`.slice(0, 45), [REASON]));
  }

  if (i.commandName === "Purger jusqu'ici") {
    if (level < 1) return deny(1);
    await i.deferReply(EPH);
    const fetched = await i.channel.messages.fetch({ limit: 100 }).catch(() => null);
    if (!fetched) return i.editReply("Lecture impossible dans ce salon.");
    const cutoff = Date.now() - 13.5 * 864e5;
    const slice = [...fetched.values()].filter((m) =>
      m.createdTimestamp >= i.targetMessage.createdTimestamp && m.createdTimestamp > cutoff && !m.pinned);
    if (!slice.length) return i.editReply("Rien à supprimer (messages trop anciens ou épinglés).");
    const del = await i.channel.bulkDelete(slice, true).catch(() => null);
    await log(i.guild, "messagePurge", embed({ guild: i.guild, color: COLORS.neutral, author: { name: "🧹  Purge jusqu'à un message" },
      fields: [{ name: "Salon", value: `${i.channel}`, inline: true },
        { name: "Messages", value: `${del?.size ?? 0}`, inline: true },
        { name: "Par", value: i.user.tag, inline: true }] }));
    return i.editReply(`${del?.size ?? 0} message(s) supprimé(s) à partir de celui-ci.`);
  }
}

/* ========================================================================== */
/*                       BOUTONS DES PANNEAUX PUBLICS                         */
/* ========================================================================== */

async function handlePublic(i, parts, config) {
  const [, action, arg] = parts;
  const reply = (payload) => i.reply({ ...payload, ...EPH });
  const card = (r) => reply({ embeds: [embed({ guild: i.guild, color: r.color,
    author: { name: `${r.ok === false ? ICONS.no : ICONS.ok}  ${r.title}` }, description: r.text })] });

  if (action === "rank") {
    const vmin = await getVoiceMinutes(i.guildId, i.user.id);
    const { xp, level, rank } = await getUserLevel(i.guildId, i.user.id);
    if (!xp) return reply({ content: "Tu n'as pas encore d'XP. Participe au chat." });
    const cur = xpForLevel(level), next = xpForLevel(level + 1);
    return reply({ embeds: [embed({ guild: i.guild, author: { name: `${ICONS.level}  Niveau de ${i.user.username}` },
      description: `## Niveau ${level}\n${bar(xp - cur, next - cur)}\n**${num(xp - cur)} / ${num(next - cur)}** XP vers le niveau ${level + 1}`,
      fields: [{ name: "XP total", value: num(xp), inline: true },
        { name: "Classement", value: rank ? `#${rank}` : "—", inline: true },
        { name: "Temps vocal", value: vmin >= 60 ? `${Math.floor(vmin / 60)} h ${vmin % 60} min` : `${vmin} min`, inline: true }] })
      .setThumbnail(i.user.displayAvatarURL({ size: 128 }))] });
  }
  if (action === "coins") {
    const w = await getWallet(i.guildId, i.user.id);
    return reply({ embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Ton solde` },
      description: `## ${config.economy.currency} ${num(w.coins)}`, footer: w.streak ? `Série quotidienne : ${w.streak} jour(s)` : undefined })] });
  }
  if (action === "daily") return card(await actionDaily(i.guild, i.user));
  if (action === "work") return card(await actionWork(i.guild, i.user));
  if (action === "invites") {
    const rawS = await inviterStats(i.guildId, i.user.id);
    const s = { active: withBaseline(config, i.user.id, rawS.active), total: withBaseline(config, i.user.id, rawS.total) };
    const parrain = await getInviter(i.guildId, i.user.id);
    return reply({ embeds: [embed({ guild: i.guild, author: { name: `🔗  Tes invitations` }, color: COLORS.primary,
      description: `## ${s.active} invité(s) actif(s)`,
      fields: [
        { name: "Total historique", value: `${s.total}`, inline: true },
        { name: "Partis depuis", value: `${s.total - s.active}`, inline: true },
        { name: "Invité(e) par", value: parrain?.inviter_id ? `<@${parrain.inviter_id}>` : "_inconnu_", inline: true },
      ] })] });
  }

  if (action === "top") {
    const medals = ["🥇", "🥈", "🥉"];
    if (arg === "voice") {
      const r = await topVoice(i.guildId, 10);
      if (!r.length) return reply({ content: "Aucun temps vocal enregistré pour l'instant." });
      const fmt = (m) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60} min` : `${m} min`);
      return reply({ embeds: [embed({ guild: i.guild, author: { name: "🔊  Top temps vocal" },
        description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — ${fmt(x.minutes)}`).join("\n") })] });
    }
    if (arg === "invites") {
      const r = (await topInviters(i.guildId, 25))
        .map((x) => ({ ...x, active: withBaseline(config, x.userId, x.active) }))
        .sort((a, b) => b.active - a.active).slice(0, 10);
      if (!r.length) return reply({ content: "Aucune invitation enregistrée pour l'instant." });
      return reply({ embeds: [embed({ guild: i.guild, author: { name: "🔗  Top invitations" },
        description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — **${x.active}** invité(s)`).join("\n") })] });
    }
    if (arg === "coins") {
      const r = await topCoins(i.guildId, 10);
      if (!r.length) return reply({ content: "Personne n'a encore de coins." });
      return reply({ embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "💰  Top coins" },
        description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — ${config.economy.currency} **${num(x.coins)}**`).join("\n") })] });
    }
    const r = await topLevels(i.guildId, 10);
    if (!r.length) return reply({ content: "Personne n'a encore d'XP." });
    return reply({ embeds: [embed({ guild: i.guild, author: { name: "🏆  Top niveaux" },
      description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — niveau **${x.level}** · ${num(x.xp)} XP`).join("\n") })] });
  }
  if (action === "shop") {
    const shop = config.economy.shop;
    if (!shop.length) return reply({ content: "La boutique est vide pour le moment." });
    const w = await getWallet(i.guildId, i.user.id);
    return reply({ embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "🛒  Boutique" },
      description: shop.map((x) => {
        const ty = ITEM_TYPES[x.type ?? "role"];
        const what = (x.type ?? "role") === "role" ? `<@&${x.roleId}>`
          : x.type === "xp" ? `${num(x.amount ?? 0)} XP immédiats`
          : x.type === "multiplier" ? `XP ×${x.amount ?? 2} pendant ${x.hours ?? 24} h`
          : x.type === "pardon" ? "Efface ton dernier avertissement"
          : "Ton propre rôle, nom et couleur au choix";
        return `${w.coins >= x.price ? "🟢" : "🔴"} ${ty?.emoji ?? ""} **${x.name}** — ${config.economy.currency} ${num(x.price)}\n${what}`;
      }).join("\n\n"),
      footer: `Ton solde : ${num(w.coins)}` })],
      components: [row(new StringSelectMenuBuilder().setCustomId("pub:buy").setPlaceholder("Acheter un article…")
        .addOptions(shop.slice(0, 25).map((x) => ({ label: x.name.slice(0, 100), value: x.id,
          emoji: ITEM_TYPES[x.type ?? "role"]?.emoji,
          description: `${num(x.price)} coins${x.stock != null ? ` · stock ${x.stock}` : ""}`.slice(0, 100) }))))] });
  }
  if (action === "buy") {
    const item = config.economy.shop.find((x) => x.id === i.values[0]);
    if (item?.type === "customrole") return i.showModal(modal(`pm:pub:buyrole:${item.id}`, "Ton rôle personnalisé",
      [{ id: "name", label: "Nom du rôle", required: true, max: 60 },
       { id: "color", label: "Couleur hexadécimale (ex. #ff5aa2)", max: 7 }]));
    return card(await actionBuy(i.guild, i.member, i.values[0]));
  }
  if (action === "pay") return i.showModal(modal("pm:pub:pay", "Envoyer des coins",
    [{ id: "user", label: "Identifiant du destinataire", required: true, max: 25 },
     { id: "amount", label: "Montant", required: true, max: 10 }]));
  if (action === "confess") return i.showModal(modal("pm:pub:confess", "Confession anonyme",
    [{ id: "text", label: "Ta confession", required: true, long: true, max: 1500 }]));

  return false;
}

/* ========================================================================== */
/*                    13 - COMMANDES ET MENUS CONTEXTUELS                     */
/* ========================================================================== */

// commands.js — trois commandes seulement. Tout le reste passe par /panel.


const commands = [];
const def = (data, execute) => commands.push({ data, execute });

/* ========================================================================== */
/*                                  /panel                                    */
/* ========================================================================== */

def(new SlashCommandBuilder()
  .setName("panel")
  .setDescription("Ouvre le panneau de contrôle de 0x")
  .setDefaultMemberPermissions(null),
  async (i) => {
    const config = await getConfig(i.guildId);
    const level = permLevel(i.member, config);

    if (level < 1 && !isOwner(i.user.id)) {
      return i.reply({ embeds: [embed({
        guild: i.guild,
        color: COLORS.neutral,
        author: { name: `${ICONS.info}  Panneau réservé au staff` },
        description: "Tu es **Membre**. Les fonctions qui te concernent (niveau, coins, quotidien, boutique, tickets, confessions) sont sur les panneaux publiés dans les salons du serveur.",
        footer: "Un responsable peut les publier via /panel → Publications",
      })], ...EPH });
    }

    const view = await buildSection("home", i, config);
    await i.reply({ ...view, ...EPH });
  });

/* ========================================================================== */
/*                                   /help                                    */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("help").setDescription("Comment fonctionne 0x"),
  async (i, { client }) => {
    const config = await getConfig(i.guildId);
    const level = permLevel(i.member, config);
    const counts = await computeCounts(i.guild);
    const owner = isOwner(i.user.id);
    const allowed = SECTIONS.filter((s) => (!s.ownerOnly || owner) && level >= s.level);
    const ownerLocked = SECTIONS.filter((s) => s.ownerOnly && !owner);

    const fields = [
      {
        name: "⚡  Mise en route",
        value: "Ouvre **`/panel`** et appuie sur **Tout installer**. Il détecte tes salons, classe tes rôles staff, branche les compteurs, crée le rôle Alcatraz et active les protections. Puis **Publier les panneaux** pose les boutons pour les membres.",
      },
      {
        name: "🧭  Trois commandes, c'est tout",
        value: "**`/panel`** — le panneau de contrôle, tout se règle au bouton\n**`/help`** — cette page\n**`/logs map`** — où part chaque type de journal",
      },
      {
        name: "👥  Pour les membres",
        value: "Aucune commande à taper. Les panneaux publiés dans les salons donnent accès au niveau, au solde, au quotidien, au travail, aux classements, à la boutique, aux tickets et aux confessions.",
      },
    ];

    if (allowed.length) {
      fields.push({
        name: `🔑  Tes sections dans /panel (${allowed.length}/${SECTIONS.length})`,
        value: allowed.map((s) => `${s.emoji} **${s.label}** — ${s.desc}`).join("\n"),
      });
    }

    if (ownerLocked.length) {
      fields.push({
        name: "🔒  Réservé au propriétaire de 0x",
        value: `${ownerLocked.map((s) => `${s.emoji} ${s.label}`).join(" · ")}\n\nToute la configuration est verrouillée sur <@${OWNER_ID}>. Ni un administrateur ni le propriétaire du serveur ne peut y toucher.`,
      });
    }
    const levelLocked = SECTIONS.filter((s) => !s.ownerOnly && level < s.level);
    if (levelLocked.length) {
      fields.push({
        name: "⬆️  Verrouillé à ton niveau",
        value: levelLocked.map((s) => `${s.emoji} ${s.label} — demande ${PERM_LABELS[s.level]}`).join("\n"),
      });
    }

    fields.push({
      name: "⚙️  Ce que 0x fait tout seul",
      value: [
        "Automod (invitations, liens, flood, mentions, majuscules, mots interdits)",
        "Anti-raid et anti-nuke avec identification par les logs d'audit",
        "Journalisation vers tes salons, détectés par leur nom",
        "Compteurs Membres / Connectés / Vocal",
        "Accueil, autorole, XP, colis de coins, fins de giveaway, libérations d'Alcatraz",
      ].map((x) => `• ${x}`).join("\n"),
    });

    await i.reply({ embeds: [embed({
      guild: i.guild,
      author: { name: "0x  —  mode d'emploi" },
      color: COLORS.primary,
      description: `Ton niveau : **${PERM_LABELS[level]}**\n${num(counts.members)} membres · ${counts.voice} en vocal · latence ${Math.round(client.ws.ping)} ms · ${usingDatabase() ? "PostgreSQL" : "⚠️ mémoire volatile"}`,
      fields,
      footer: "Commence par /panel — il liste ce qu'il reste à régler",
    })], ...EPH });
  });

/* ========================================================================== */
/*                                   /logs                                    */
/* ========================================================================== */

def(new SlashCommandBuilder().setName("logs").setDescription("Journalisation : où part quoi")
  .setDefaultMemberPermissions(null)
  .addSubcommand((s) => s.setName("map").setDescription("Montre quel salon reçoit quel type de log"))
  .addSubcommand((s) => s.setName("scan").setDescription("Relance la détection des salons"))
  .addSubcommand((s) => s.setName("set").setDescription("Force un type de log vers un salon précis")
    .addStringOption((o) => o.setName("type").setDescription("Type de log").setRequired(true).setAutocomplete(true))
    .addChannelOption((o) => o.setName("salon").setDescription("Salon").addChannelTypes(ChannelType.GuildText).setRequired(true)))
  .addSubcommand((s) => s.setName("reset").setDescription("Revient à la détection automatique"))
  .addSubcommand((s) => s.setName("actif").setDescription("Active ou coupe tous les logs")
    .addBooleanOption((o) => o.setName("valeur").setDescription("Activer ?").setRequired(true))),
  async (i) => {
    const config = await getConfig(i.guildId);
    const sub = i.options.getSubcommand();

    // "map" est en lecture seule : ouvert au staff. Le reste modifie le bot.
    if (sub !== "map" && !isOwner(i.user.id)) {
      return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
        author: { name: "🔒  Verrouillé" },
        description: `Modifier le routage des journaux change la configuration de 0x.\nSeul <@${OWNER_ID}> peut le faire.`,
        footer: "Tu peux consulter le routage avec /logs map" })], ...EPH });
    }
    if (sub === "map" && permLevel(i.member, config) < 4) {
      return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
        author: { name: `${ICONS.no}  Accès refusé` },
        description: `La consultation des journaux demande **${PERM_LABELS[4]}**.` })], ...EPH });
    }
    const keys = Object.keys(LOG_ROUTES);

    if (sub === "map") {
      const lines = keys.map((k) => {
        const ch = resolveLogChannel(i.guild, k, config);
        return `${ch ? "✅" : "🔴"} \`${k}\`${config.logOverrides?.[k] ? "*" : ""} → ${ch ? `<#${ch.id}>` : "_non trouvé_"}`;
      });
      const half = Math.ceil(lines.length / 2);
      const found = keys.filter((k) => resolveLogChannel(i.guild, k, config)).length;
      return i.reply({ embeds: [embed({
        guild: i.guild,
        author: { name: "🗂️  Routage des journaux" },
        color: found === keys.length ? COLORS.success : COLORS.warning,
        description: `**${found}/${keys.length}** types routés · \`*\` = forcé manuellement`,
        fields: [
          { name: "\u200b", value: lines.slice(0, half).join("\n"), inline: true },
          { name: "\u200b", value: lines.slice(half).join("\n"), inline: true },
        ],
        footer: "Les non trouvés sont simplement ignorés — rien ne casse",
      })], ...EPH });
    }

    if (sub === "scan") {
      const r = buildIndex(i.guild);
      const found = keys.filter((k) => resolveLogChannel(i.guild, k, config)).length;
      return i.reply({ content: `Indexé : **${r.channels}** salons et **${r.categories}** catégories. **${found}/${keys.length}** types de logs routés.`, ...EPH });
    }

    if (sub === "set") {
      const type = i.options.getString("type");
      if (!LOG_ROUTES[type]) return i.reply({ content: "Type inconnu — utilise l'autocomplétion.", ...EPH });
      const ch = i.options.getChannel("salon");
      await updateConfig(i.guildId, { logOverrides: { ...config.logOverrides, [type]: ch.id } });
      return i.reply({ content: `\`${type}\` sera envoyé dans ${ch}.`, ...EPH });
    }

    if (sub === "reset") {
      await updateConfig(i.guildId, { logOverrides: {} });
      return i.reply({ content: "Retour à la détection automatique par nom de salon.", ...EPH });
    }

    if (sub === "actif") {
      const v = i.options.getBoolean("valeur");
      await updateConfig(i.guildId, { logsEnabled: v });
      return i.reply({ content: `Journalisation ${v ? "activée" : "coupée"}.`, ...EPH });
    }
  });

/* ------------------------------ AUTOCOMPLÉTION ---------------------------- */

async function handleAutocomplete(interaction) {
  if (interaction.commandName !== "logs") return;
  const focused = interaction.options.getFocused().toLowerCase();
  await interaction.respond(
    Object.keys(LOG_ROUTES).filter((k) => k.includes(focused)).slice(0, 25).map((k) => ({ name: k, value: k }))
  ).catch(() => null);
}

/* ========================================================================== */
/*                    MENUS CONTEXTUELS (appui long → Apps)                   */
/* ========================================================================== */
// Ils n'encombrent pas la liste des commandes : ils apparaissent en appuyant
// longuement sur un membre ou sur un message.

const contextMenus = [
  new ContextMenuCommandBuilder().setName("Fiche de modération").setType(ApplicationCommandType.User).setDefaultMemberPermissions(null),
  new ContextMenuCommandBuilder().setName("Ses invitations").setType(ApplicationCommandType.User).setDefaultMemberPermissions(null),
  new ContextMenuCommandBuilder().setName("Supprimer et avertir").setType(ApplicationCommandType.Message).setDefaultMemberPermissions(null),
  new ContextMenuCommandBuilder().setName("Purger jusqu'ici").setType(ApplicationCommandType.Message).setDefaultMemberPermissions(null),
];

/* ========================================================================== */
/*                     14 - CLIENT, EVENEMENTS, DEMARRAGE                     */
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
  const body = [...commands.map((c) => c.data.toJSON()), ...contextMenus.map((c) => c.toJSON())];
  try {
    if (GUILD_ID) {
      await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body });
      console.log(`[slash] ${commands.length} commandes + ${contextMenus.length} menus contextuels déployés sur ${GUILD_ID}.`);
    } else {
      await rest.put(Routes.applicationCommands(CLIENT_ID), { body });
      console.log(`[slash] ${commands.length} commandes + ${contextMenus.length} menus contextuels déployés globalement.`);
    }
  } catch (e) {
    console.error("[slash] échec:", e.message);
  }
}

/* ================================= READY ================================== */

client.once(Events.ClientReady, async (c) => {
  console.log(`[0x] connecté : ${c.user.tag}`);
  console.log("[0x] configuration verrouillee sur l identifiant " + OWNER_ID);
  await deployCommands();

  for (const guild of c.guilds.cache.values()) {
    const r = buildIndex(guild);
    console.log(`[index] ${guild.name} : ${r.channels} salons, ${r.categories} catégories`);
    try {
      await guild.members.fetch();
      console.log(`[cache] ${num(guild.members.cache.size)} / ${num(guild.memberCount)} membres en cache`);
    } catch (e) {
      console.warn("[cache] fetch des membres impossible :", e.message, "— active Server Members Intent");
    }
    const n = await cacheInvites(guild);
    console.log(`[invites] ${n} lien(x) mis en cache`);
    const trusted = await syncTrustedRole(guild);
    console.log(trusted.found
      ? `[like] rôle de confiance : ${trusted.role.name} (niveau 5${trusted.manual ? ", choisi à la main" : ", détecté"}${trusted.changed ? ", appliqué" : ""})`
      : "[like] aucun rôle « Like me » trouvé — désigne-le dans Configuration → Rôles clés");

    const counts = await computeCounts(guild);
    console.log(`[compteurs] humains ${num(counts.members)} · connectés ${counts.online ?? "n/d"} · vocal ${counts.voice} · états vocaux suivis ${guild.voiceStates.cache.size}`);
    if (counts.online === null) console.warn("[compteurs] Connectés indisponible → active Presence Intent dans le portail développeur");
    await updateCounters(guild, true).catch(() => null);
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

  // Récompenses vocales : on relit l'intervalle configuré à chaque minute
  const voiceTicks = new Map();
  setInterval(async () => {
    for (const g of c.guilds.cache.values()) {
      try {
        const cfg = await getConfig(g.id);
        if (!cfg.voice?.enabled) continue;
        const every = Math.max(1, cfg.voice.intervalMinutes ?? 5);
        const n = (voiceTicks.get(g.id) ?? 0) + 1;
        if (n < every) { voiceTicks.set(g.id, n); continue; }
        voiceTicks.set(g.id, 0);
        const r = await tickVoiceRewards(g);
        if (r.rewarded) console.log(`[vocal] ${g.name} : ${r.rewarded} récompensé(s)`);
      } catch (e) { console.error("[vocal]", e.message); }
    }
  }, 60_000).unref();

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

    if (i.isUserContextMenuCommand() || i.isMessageContextMenuCommand()) {
      if (!i.inGuild()) return;
      return handleContextMenu(i);
    }

    if (i.isChatInputCommand()) {
      if (!i.inGuild()) return i.reply({ content: "Commande utilisable uniquement sur un serveur.", ...EPH });
      const cmd = commandMap.get(i.commandName);
      if (!cmd) return;
      return cmd.execute(i, { client });
    }

    // Panneau de contrôle et panneaux publics
    if (i.customId?.startsWith("p:") || i.customId?.startsWith("pm:") || i.customId?.startsWith("pub:")) {
      const handled = await handlePanel(i);
      if (handled !== false) return;
    }

    if (i.isStringSelectMenu()) {
      if (i.customId === "ticket:pick") { await i.deferReply(EPH); return createTicket(i, i.values[0]); }
      if (i.customId === "rolemenu") return handleRoleMenu(i);
      return;
    }

    if (i.isButton()) {
      const [ns, action, arg] = i.customId.split(":");
      if (ns === "ticket") {
        const cfg = await getConfig(i.guildId);
        if (action === "close") {
          if (!i.channel.name.includes("ticket-")) return;
          const owner = i.channel.topic?.includes(i.user.id);
          if (!owner && permLevel(i.member, cfg) < 1)
            return i.reply({ content: "Seuls l'auteur du ticket et le staff peuvent le fermer.", ...EPH });
          await i.reply({ content: "Fermeture dans 5 secondes…" });
          return closeTicket(i);
        }
        if (action === "claim") {
          if (permLevel(i.member, cfg) < 1) return i.reply({ content: "Réservé au staff.", ...EPH });
          await i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
            author: { name: "✋  Ticket pris en charge" }, description: `${i.user} s'occupe de cette demande.` })] });
          if (i.channel.name.startsWith("✅")) return;
          return i.channel.setName(`✅-${i.channel.name}`.slice(0, 90)).catch(() => null);
        }
      }
      if (ns === "gw") return handleGiveawayButton(i, action, arg);
      if (ns === "drop" && action === "claim") return claimDrop(i, arg);
      return;
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

  await handleInviteJoin(member).catch((e) => console.error("[invites]", e.message));

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
  await handleInviteLeave(member).catch(() => null);
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

  // Colis automatiques dans le salon dédié
  if (config.economy.enabled && config.economy.dropChance > 0 && message.channel.id === config.economy.dropChannelId) {
    if (Math.random() * 100 < config.economy.dropChance) {
      const amount = config.economy.dropMin + Math.floor(Math.random() * (config.economy.dropMax - config.economy.dropMin + 1));
      launchDrop(message.guild, message.channel, amount).catch(() => null);
    }
  }

  if (!config.levelsEnabled) return;
  const key = `${message.guild.id}:${message.author.id}`;
  const now = Date.now();
  if (now - (xpCooldown.get(key) ?? 0) < 60_000) return;
  xpCooldown.set(key, now);

  let gain = 15 + Math.floor(Math.random() * 11);
  const boost = await getBoost(message.guild.id, message.author.id);
  if (boost) gain = Math.round(gain * boost.multiplier);
  const result = await addXp(message.guild.id, message.author.id, gain);
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
    const staff = isOwner(member.id) || member.permissions.has(PermissionFlagsBits.ManageMessages) || member.id === guild.ownerId;
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
  if (findLikeRole(role.guild)?.id === role.id) await syncTrustedRole(role.guild).catch(() => null);
  const r = await guardStructure(role.guild, "roleCreate", role.id, "créations de rôles");
  await log(role.guild, "roleCreate", embed({ title: "Rôle créé", color: COLORS.success, fields: [
    { name: "Rôle", value: `${role} (\`${role.name}\`)`, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.GuildRoleDelete, async (role) => {
  const cfgD = await getConfig(role.guild.id);
  if (cfgD.trustedRoleId === role.id) await syncTrustedRole(role.guild).catch(() => null);
  const r = await guardStructure(role.guild, "roleDelete", role.id, "suppressions de rôles");
  await log(role.guild, "roleDelete", embed({ title: "Rôle supprimé", color: COLORS.danger, fields: [
    { name: "Rôle", value: `\`${role.name}\``, inline: true },
    { name: "Par", value: r?.executor?.tag ?? "Inconnu", inline: true }] }));
});

client.on(Events.GuildRoleUpdate, async (before, after) => {
  if (before.name !== after.name) await syncTrustedRole(after.guild).catch(() => null);
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
  noteInviteCreate(invite);
  await log(invite.guild, "invite", embed({ title: "Invitation créée", color: COLORS.primary, fields: [
    { name: "Code", value: `\`${invite.code}\``, inline: true },
    { name: "Par", value: invite.inviter?.tag ?? "Inconnu", inline: true },
    { name: "Salon", value: `${invite.channel}`, inline: true },
    { name: "Expiration", value: invite.expiresAt ? ts(invite.expiresAt) : "Jamais", inline: true },
    { name: "Utilisations max", value: invite.maxUses ? `${invite.maxUses}` : "Illimité", inline: true }] }));
});

client.on(Events.InviteDelete, (invite) => noteInviteDelete(invite));

client.on(Events.GuildCreate, async (guild) => {
  buildIndex(guild);
  await cacheInvites(guild).catch(() => null);
  await syncTrustedRole(guild).catch(() => null);
});

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
