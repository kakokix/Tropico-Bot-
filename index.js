// =============================================================================
//   0x  —  BOT DE GESTION DU SERVEUR NAOYA
//   Fichier unique. Second fichier nécessaire : package.json
// =============================================================================
//
//   ROLE A TOUTES LES PERMS
//     Identifiant fixe : 1541919997268336713 (niveau 6, le plus haut sous toi).
//     Repere a chaque demarrage, meme s'il est renomme. Variable Railway
//     TRUSTED_ROLE_ID pour en changer sans toucher au code.
//
//   IMMUNITE "ADMINISTRATEUR"
//     Toute personne dont un role porte la permission Discord Administrateur
//     est INTOUCHABLE sur tout le serveur : aucune sanction, aucun automod,
//     aucun anti-nuke, aucun anti-raid, aucun piege vocal.
//     Seul le proprietaire de 0x peut passer outre.
//     Interrupteur : Panneau > Permissions > Immunite admin.
//
//   ARRIERE-SALLE (activites illegales)
//     Cinq coups a tenter. Reussi : tu gardes tout. Attrape : tu rembourses
//     LE DOUBLE de ce que tu visais, quitte a finir en dette.
//     La pression policiere monte a chaque coup et fait chuter tes chances.
//     En dette, les tables du casino et la boutique se ferment.
//
//   COMMANDES A PREFIXE
//     !ban, ?kick, *mute… Le caractere se choisit dans Panneau > Prefixe,
//     chaque commande s'ouvre, se ferme et change de niveau requis.
//     Les niveaux de perm s'appliquent comme au panneau.
//
//   BIENVENUE, PROMOTIONS, SANCTIONS ET ARRIERE-SALLE EN IMAGE
//     Carte de bienvenue a chaque arrivee, carte de montee de grade,
//     carte de sanction jointe au journal, resultat des coups illegaux.
//
//   BOUTIQUE, CLASSEMENTS ET PROFIL EN IMAGE
//     Boutique : une vignette par article, prix, et ce qui est achetable.
//     Classements : podium avec les avatars des trois premiers.
//     Profil : grade actuel, jauges vers le grade suivant, barre d'XP.
//
//   FICHE DE MODERATION EN IMAGE
//     Le menu contextuel et le panneau affichent tout sur un membre en une
//     image : avatar, rang, grade, coins, niveau, vocal, messages,
//     invitations, sanctions, dates, roles portes, alertes muet/Alcatraz.
//
//   IMAGES DU CASINO
//     Les six jeux sont dessines en PNG : roulette, machine, blackjack,
//     demineur, des, pile ou face. Avatar du joueur en en-tete.
//     Necessite @napi-rs/canvas et le fichier font.ttf a cote d'index.js.
//     Si l'un des deux manque, le casino repasse en texte sans planter.
//
//   EMOJIS DU SERVEUR
//     Discord n'interprete ":monemoji:" que quand un humain le tape.
//     Le bot traduit desormais automatiquement en <:nom:id> ou <a:nom:id>
//     dans tous les embeds : reglements, annonces, panneaux, tickets.
//
//   APPARENCE
//     La couleur d'accent du bot se choisit dans Panneau > Apparence :
//     16 teintes ou n'importe quel code #RRGGBB. Elle remplace le bleu
//     partout, sans toucher au vert de reussite ni au rouge d'erreur.
//     La meme section contient un createur d'embed : titre, corps, auteur,
//     pied de page, images, couleur, apercu avant envoi.
//
//   ECHELLE DES GRADES
//     18 grades reconnus par leur nom, de Staff (1 h / 100 msg) a Maitre
//     (220 h / 20 000 msg). Panneau > Grades > Detecter automatiquement.
//
//   MENUS DE ROLES
//     Les membres se donnent leurs roles eux-memes, par categorie :
//     couleur, genre, age, situation, notifications, centres d'interet.
//     Reconnaissance automatique par nom, roles separateurs ignores.
//     Un menu a choix unique retire l'ancien role du groupe.
//
//   TRESORERIE
//     Panneau > Tresorerie : crediter ou retirer a une personne, a tout un
//     role, ou a l'ensemble du serveur. Masse monetaire visible en direct.
//
//   CASINO
//     Six jeux aux probabilites reelles : machine a sous, blackjack complet,
//     roulette europeenne, demineur, des a cote reglable, pile ou face.
//     La maison garde 3 % : l'economie ne s'emballe pas.
//     Panneau > Economie > Casino pour les mises et l'ouverture des jeux.
//
//   GRADES
//     Echelle de roles gagnee a l'heure de vocal ET au nombre de messages.
//     Promotion automatique, ancien grade retire, annonce dans le salon des
//     niveaux. Panneau > Grades pour composer l'echelle.
//
//   COMPTEURS
//     Discord n'autorise que 2 renommages par salon toutes les 10 minutes.
//     Le bot reagit donc a l'instant tant qu'il lui reste du budget, puis
//     attend. Le panneau affiche le temps restant quand c'est le cas.
//
//   CREER TON VOCAL
//     Rejoindre le salon d'accueil cree un vocal personnel juste en dessous,
//     dans la meme categorie, sans limite de places. Le proprietaire le
//     renomme, le limite, le verrouille, le masque, autorise ou expulse
//     quelqu'un, transfere ou supprime. Il disparait quand il se vide.
//
//   VEILLE AUTOMATIQUE
//     Si l'identifiant proprietaire quitte le serveur ou en est expulse,
//     0x se met en veille TOTALE : plus aucune commande, aucun automod,
//     aucune protection, aucun journal. Reprise automatique a son retour.
//     Une verification incertaine (reseau, coupure) ne declenche jamais la
//     veille : seul un "membre inconnu" confirme par Discord la provoque.
//     Desactivable avec la variable Railway SUSPEND_WITHOUT_OWNER=false
//
//   LECTEUR AUDIO
//     Prefixe dedie « + » : +play, +skip, +leave, +queue, +pause,
//     +resume, +volume, +setup. Fonctionne aussi avec le prefixe general.
//     Une recherche par titre propose 5 resultats du catalogue Deezer et
//     laisse choisir. Deezer et Spotify ne fournissent QUE le catalogue :
//     l'audio vient toujours de YouTube ou SoundCloud.
//     Uniquement dans le CHAT D'UN SALON VOCAL, et seulement si tu es
//     connecte a ce vocal. YouTube en premier, repli sur lien direct.
//     YouTube bloque les adresses IP d'hebergeur. Deux parades :
//       YT_COOKIE       cookie d'un compte Google jetable
//       SOUNDCLOUD_ID   sinon obtenu automatiquement
//     Sans cookie, une recherche YouTube qui echoue bascule seule sur
//     SoundCloud. Les liens directs et webradios marchent toujours.
//
//   UNE ACTION A LA FOIS PAR PERSONNE
//     Deux clics simultanes permettaient d'etre paye deux fois (quotidien,
//     travail, encaissement au demineur). Chaque personne ne peut plus
//     avoir qu'une action d'argent en cours ; le verrou se libere seul.
//
//   CODE DE SECURITE
//     Toute action qui MODIFIE le bot demande un code. Naviguer reste libre.
//     Une fois saisi, il ouvre 15 minutes de modifications.
//     3 essais ratés = 10 minutes de blocage. Comparaison a duree constante.
//     Le code n'est plus ecrit en clair : seule son empreinte SHA-256
//     figure dans le fichier. Variables Railway : OWNER_CODE ou
//     OWNER_CODE_HASH, et OWNER_CODE_MINUTES pour la duree.
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
import { createHash, timingSafeEqual } from "node:crypto";
import pg from "pg";


/* ========================================================================== */
/*                1 - CONSTANTES, COULEURS, EMOJIS, DETECTION                 */
/* ========================================================================== */

// core.js — constantes, résolution automatique des salons, helpers.


const BRAND = "0x • Naoya";

/**
 * Propriétaire de 0x — la SEULE personne autorisée à modifier la configuration.
 * Modifiable sans toucher au code via la variable Railway OWNER_ID.
 */
const OWNER_ID = process.env.OWNER_ID || "840997886162108416";
const isOwner = (id) => id === OWNER_ID;

/**
 * Rôle qui détient toutes les permissions du bot (hors sections propriétaire).
 * Modifiable sans toucher au code via la variable Railway TRUSTED_ROLE_ID.
 */
const TRUSTED_ROLE_ID = process.env.TRUSTED_ROLE_ID || "1541919997268336713";

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

/**
 * Couleur d'accent choisie par le serveur. Elle remplace le bleu par défaut
 * dans tous les embeds qui ne demandent pas une couleur précise (vert de
 * réussite, rouge d'erreur…). Mise à jour à chaque lecture de configuration.
 */
const brandColors = new Map();

function setBrandColor(guildId, color) {
  if (color === null || color === undefined) brandColors.delete(guildId);
  else brandColors.set(guildId, color);
}

function brandColor(guild) {
  return brandColors.get(guild?.id) ?? COLORS.primary;
}

/** Convertit « #5865F2 », « 5865f2 » ou 5793266 en entier utilisable. */
function parseColor(input) {
  if (typeof input === "number" && Number.isFinite(input)) return Math.max(0, Math.min(0xFFFFFF, Math.round(input)));
  const s = String(input ?? "").trim().replace(/^#/, "");
  if (/^[0-9a-f]{6}$/i.test(s)) return parseInt(s, 16);
  if (/^[0-9a-f]{3}$/i.test(s)) return parseInt(s.split("").map((c) => c + c).join(""), 16);
  if (/^\d+$/.test(s)) { const n = Number(s); if (n >= 0 && n <= 0xFFFFFF) return n; }
  return null;
}

const hexOf = (n) => "#" + Number(n ?? 0).toString(16).padStart(6, "0").toUpperCase();

/**
 * Discord n'interprète « :monemoji: » que quand un humain le tape.
 * Un bot doit écrire la forme complète : <:nom:id>, ou <a:nom:id> si le
 * dessin est animé. Sans ça, le texte reste tel quel à l'écran — c'est
 * exactement ce qui arrivait aux règlements écrits depuis le panneau.
 */
function resolveEmojis(guild, text) {
  if (!guild || typeof text !== "string" || !text.includes(":")) return text;
  return text.replace(/(?<!<a?):([a-zA-Z0-9_]{2,32}):/g, (brut, nom) => {
    const e = guild.emojis?.cache?.find((x) => x.name === nom)
      ?? guild.emojis?.cache?.find((x) => x.name?.toLowerCase() === nom.toLowerCase());
    return e ? `<${e.animated ? "a" : ""}:${e.name}:${e.id}>` : brut;
  });
}

/**
 * Normalise un emoji saisi à la main : unicode, « :nom: », « <:nom:id> »
 * ou un identifiant seul. Renvoie ce que Discord accepte sur un bouton,
 * ou null si rien ne correspond.
 */
function resolveEmojiRef(guild, input) {
  const s = String(input ?? "").trim();
  if (!s) return null;
  const complet = s.match(/^<(a?):([a-zA-Z0-9_]+):(\d+)>$/);
  if (complet) return { id: complet[3], name: complet[2], animated: complet[1] === "a" };
  const court = s.match(/^:?([a-zA-Z0-9_]{2,32}):?$/);
  if (court && guild) {
    const e = guild.emojis?.cache?.find((x) => x.name?.toLowerCase() === court[1].toLowerCase());
    if (e) return { id: e.id, name: e.name, animated: e.animated };
  }
  if (/^\d{15,25}$/.test(s) && guild) {
    const e = guild.emojis?.cache?.get(s);
    if (e) return { id: e.id, name: e.name, animated: e.animated };
  }
  // Emoji unicode : on le laisse tel quel
  if (/\p{Extended_Pictographic}/u.test(s)) return s;
  return null;
}

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
  // Ordre calqué sur le routage que tu as choisi à la main : la détection
  // automatique retombe exactement sur les mêmes salons, sans rien reforcer.
  messageDelete: ["logs-messages", "logs-mod"],
  messageEdit: ["logs-messages", "logs-mod"],
  messageLink: ["logs-messages", "auto-mod"],
  messagePurge: ["logs-messages", "logs-mod"],
  embedDelete: ["logs-messages"],

  automod: ["auto-mod", "logs-mod"],
  antipub: ["logs-mod", "auto-mod"],
  spam: ["logs-mod", "auto-mod"],
  toxic: ["logs-mod", "auto-mod"],

  sanction: ["logs-mod", "sanctions"],
  ban: ["logs-mod", "sanctions"],
  kick: ["logs-mod", "sanctions"],
  timeout: ["logs-mod", "sanctions"],
  warn: ["logs-mod", "avertissements", "sanctions"],
  jail: ["logs-mod", "jugement"],

  memberJoin: ["member-log", "arriver", "logs-mod"],
  memberLeave: ["member-log", "logs-mod"],
  memberUpdate: ["member-log", "logs-edit-role"],
  memberRoles: ["member-log", "logs-role", "logs-edit-role"],
  rolesRemoved: ["logs-edit-role", "logs-role", "member-log"],

  voice: ["voice-log"],
  voiceDisconnect: ["voice-log"],
  voiceMove: ["voice-log"],
  voiceMute: ["voice-log"],

  roleCreate: ["logs-edit-role", "logs-role"],
  roleDelete: ["logs-role", "logs-edit-role"],
  roleUpdate: ["logs-role", "logs-edit-role"],

  channelCreate: ["logs-channel", "logs-mod"],
  channelDelete: ["logs-channel", "ne-jamais-delete", "logs-mod"],
  channelUpdate: ["logs-channel", "logs-mod"],
  permissions: ["logs-bot", "logs-edit-role"],

  guildUpdate: ["logs-bot", "logs-mod"],
  webhook: ["logs-bot", "logs-mod"],
  botAdd: ["logs-bot", "logs-mod"],
  thread: ["logs-bot", "logs-messages"],
  invite: ["invitations", "logs-mod"],

  ticket: ["tickets", "logs-mod"],
  raid: ["logs-urgence", "ne-jamais-delete", "logs-mod"],
  antinuke: ["logs-urgence", "ne-jamais-delete", "a-ne-jamais-supr"],
  coins: ["logs-coins", "logs-db-coins-save"],
  giveaway: ["logs-giveaway", "proof", "logs-mod"],
};

/** Salons fonctionnels (le bot y publie ou y écoute). */
const FUNC_CHANNELS = {
  ticketPanel: ["ticket"],
  ticketCounter: ["compteur-tickets", "tickets"],
  levelUp: ["niveaux", "coins", "commandes"],
  absences: ["absences", "absences-ads"],
  partenariats: ["partenariats", "annonce"],
  boutique: ["coins"],
  casino: ["casino", "coins"],
  roleMenus: ["role", "roles", "choix-des-roles", "auto-role"],
  drops: ["coins"],
  tempVoiceHub: ["creer-ton-vocal", "cree-ton-vocal", "creer-un-vocal", "creer-son-vocal"],
  sondages: ["sondage", "sondages"],
  staffChat: ["chat-staff", "chat-gestions", "cmds-staff"],
  invites: ["invitations", "arriver"],
  memberPanel: ["commandes", "cmds-staff"],
  recompense: ["recompense", "recompenses"],
  coinsRules: ["coins"],
  coinsHowTo: ["coins"],
  coinsAccess: ["acces-coins", "roles"],
};

/** Types de tickets → catégories existantes du serveur. */
const TICKET_TYPES = [
  { id: "couronne", label: "Ticket Couronne", emoji: "👑",
    desc: "Réservé aux demandes qui remontent directement à la direction",
    categories: ["tickets-couronne", "couronne"], createName: "👑 Tickets Couronne" },

  { id: "staff", label: "Gestion Staff", emoji: "🛡️",
    desc: "Candidature, absence, question interne à l'équipe",
    categories: ["tickets-gestion-staff", "gestion-staff"], createName: "🛡️ Gestion Staff" },

  { id: "abus", label: "Gestion Abus", emoji: "⚖️",
    desc: "Signaler un membre, un staff, ou contester une sanction",
    categories: ["tickets-gestion-abus", "gestion-abus"], createName: "⚖️ Gestion Abus" },

  { id: "community", label: "Community", emoji: "💬",
    desc: "Partenariat, événement, idée, question générale",
    categories: ["tickets-community", "community"], createName: "💬 Tickets Community" },
];

/** Compteurs vocaux : détectés sur le motif "Nom : nombre". */
const COUNTERS = [
  { key: "members", test: /membres\s*:/i, template: "💎 • Membres : {n}" },
  { key: "online", test: /(en\s*ligne|connect[eé]s)\s*:/i, template: "💎 • En ligne: {n}" },
  { key: "voice", test: /(^|[^a-z])vocal\s*:/i, template: "🎧 • Vocal : {n}" },
];

/**
 * Renomme un compteur en ne touchant QU'AU NOMBRE.
 * « 💎 • En ligne: 12 » et « 💎 • Membres : 15 » gardent leur mise en forme,
 * quels que soient les emojis, les séparateurs et les espaces choisis.
 * @returns {string|null} le nouveau nom, ou null si le motat est introuvable
 */
function renameWithCount(name, value) {
  const formatted = new Intl.NumberFormat("fr-FR").format(value);
  if (/:[^:]*$/.test(name)) {
    return name.replace(/:(\s*)[\d\s.,\u202f']*$/, (_, sp) => `:${sp || " "}${formatted}`);
  }
  return null;
}

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

/** Tous les salons dont le nom correspond — sert à détecter les ambiguïtés. */
function findCandidates(guild, names) {
  const wanted = new Set(names);
  const out = [];
  for (const ch of guild.channels.cache.values()) {
    if (ch.type === ChannelType.GuildCategory) continue;
    if (wanted.has(norm(ch.name))) out.push(ch);
  }
  return out;
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

function embed({ title, description, color, fields = [], footer, thumb, image, author, guild } = {}) {
  // Sans couleur demandée — ou avec le bleu par défaut — on prend celle du serveur.
  const teinte = (color === undefined || color === COLORS.primary) ? brandColor(guild) : color;
  const e = new EmbedBuilder().setColor(teinte).setTimestamp();
  const em = (s) => resolveEmojis(guild, s);
  if (title) e.setTitle(em(title).slice(0, 256));
  if (description) e.setDescription(em(description).slice(0, 4000));
  if (fields.length) e.addFields(fields.slice(0, 25).map((f) => ({
    ...f, name: em(String(f.name)).slice(0, 256), value: em(String(f.value)).slice(0, 1024) || "—" })));
  if (author) e.setAuthor({ ...author, name: em(author.name ?? "").slice(0, 256) });
  if (guild) e.setFooter({ text: (footer ? `${footer} • ${BRAND}` : BRAND).slice(0, 2048), iconURL: guild.iconURL({ size: 64 }) ?? undefined });
  else if (footer) e.setFooter({ text: footer.slice(0, 2048) });
  if (thumb) e.setThumbnail(thumb);
  e.thumb = (url) => (url ? e.setThumbnail(url) : e);   // ignore une URL absente
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
/*                   2 - NIVEAUX DE PERMISSION ET IMMUNITE                    */
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
  userinfo: 0, serverinfo: 0, avatar: 0, boutique: 0, acheter: 0,

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

/**
 * Immunité totale accordée à la permission Discord « Administrateur ».
 * Elle protège des sanctions, de l'automod, de l'anti-nuke, de l'anti-raid
 * et du piège vocal. Désactivable dans Panneau → Permissions.
 */
function hasAdminImmunity(member, config) {
  if (!member?.permissions) return false;
  if (config?.adminImmunity === false) return false;
  return member.permissions.has(PermissionFlagsBits.Administrator);
}

/** Niveau effectif d'un membre. */
function permLevel(member, config) {
  if (!member?.guild) return 0;
  if (isOwner(member.id)) return 7;           // au-dessus de tout, intouchable
  if (member.id === member.guild.ownerId) return 6;

  const override = config?.perms?.users?.[member.id];
  if (override !== undefined) return Number(override);

  // La permission Discord « Administrateur » ne donne AUCUN niveau.
  // Sans cela, tout administrateur serait automatiquement intouchable et
  // échapperait aux sanctions comme à l'anti-nuke. Seuls les rôles et les
  // forçages déclarés dans le panneau comptent.
  let level = 0;
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
/*                    3 - SECURITE : CODE ET SERIALISATION                    */
/* ========================================================================== */

// verrou.js — code de sécurité et sérialisation des actions sensibles.


//
// Naviguer dans le panneau reste libre. Dès qu'une action écrit quelque
// chose, le code est demandé. Une fois saisi, il ouvre une fenêtre de
// quelques minutes pour éviter de le retaper à chaque clic.

/**
 * Le code se règle sur Railway avec la variable OWNER_CODE.
 * La valeur inscrite ici n'est qu'un repli : si ton dépôt GitHub est
 * public, n'importe qui peut la lire. Mets-la en variable d'environnement.
 */
/**
 * Le code n'est plus écrit en clair : seule son empreinte figure ici.
 * Même avec le fichier sous les yeux, on ne peut pas le lire.
 *
 *   OWNER_CODE       — code en clair (Railway le garde privé)
 *   OWNER_CODE_HASH  — ou directement une empreinte SHA-256
 */
const EMPREINTE_PAR_DEFAUT = "5f38fb3b83e481aa02ac8489cf425f09b5c505da135f6e46db466017215d70f1";

function empreinte(texte) {
  return createHash("sha256").update(String(texte), "utf8").digest("hex");
}

const EMPREINTE = process.env.OWNER_CODE_HASH
  ?? (process.env.OWNER_CODE ? empreinte(process.env.OWNER_CODE) : EMPREINTE_PAR_DEFAUT);

const DUREE_MIN = Number(process.env.OWNER_CODE_MINUTES ?? 15);
const ESSAIS_MAX = 3;
const BLOCAGE_MIN = 10;

const ouverts = new Map();   // "guild:user" -> instant d'expiration
const essais = new Map();    // "guild:user" -> { n, bloqueJusqua }

const cleVerrou = (g, u) => `${g}:${u}`;

/* ========================================================================== */
/*                          OUVERTURE ET FERMETURE                            */
/* ========================================================================== */

function estOuvert(guildId, userId) {
  const fin = ouverts.get(cleVerrou(guildId, userId));
  if (!fin) return false;
  if (Date.now() > fin) { ouverts.delete(cleVerrou(guildId, userId)); return false; }
  return true;
}

/** Minutes restantes avant re-verrouillage, arrondies au supérieur. */
function tempsRestant(guildId, userId) {
  const fin = ouverts.get(cleVerrou(guildId, userId));
  if (!fin) return 0;
  return Math.max(0, Math.ceil((fin - Date.now()) / 60_000));
}

function ouvrir(guildId, userId, minutes = DUREE_MIN) {
  ouverts.set(cleVerrou(guildId, userId), Date.now() + minutes * 60_000);
  essais.delete(cleVerrou(guildId, userId));
  return minutes;
}

function fermer(guildId, userId) {
  ouverts.delete(cleVerrou(guildId, userId));
}

/* ========================================================================== */
/*                              VÉRIFICATION                                  */
/* ========================================================================== */

/** Comparaison à durée constante : le temps de réponse ne trahit rien. */
function memeChaine(a, b) {
  const x = Buffer.from(String(a ?? ""), "utf8");
  const y = Buffer.from(String(b ?? ""), "utf8");
  if (x.length !== y.length) return false;
  return timingSafeEqual(x, y);
}

/**
 * @returns {{ok:boolean, restants?:number, bloqueMin?:number, minutes?:number}}
 */
function verifier(guildId, userId, saisi) {
  const k = cleVerrou(guildId, userId);
  const e = essais.get(k) ?? { n: 0, bloqueJusqua: 0 };

  if (e.bloqueJusqua > Date.now()) {
    return { ok: false, bloqueMin: Math.ceil((e.bloqueJusqua - Date.now()) / 60_000) };
  }

  if (memeChaine(empreinte(saisi.trim()), EMPREINTE)) {
    const minutes = ouvrir(guildId, userId);
    return { ok: true, minutes };
  }

  e.n += 1;
  if (e.n >= ESSAIS_MAX) {
    e.n = 0;
    e.bloqueJusqua = Date.now() + BLOCAGE_MIN * 60_000;
    essais.set(k, e);
    return { ok: false, bloqueMin: BLOCAGE_MIN };
  }
  essais.set(k, e);
  return { ok: false, restants: ESSAIS_MAX - e.n };
}

/* ========================================================================== */
/*                        CE QUI EXIGE LE CODE                                */
/* ========================================================================== */

/** Sections dont les actions modifient le bot lui-même. */
const SECTIONS_PROTEGEES = new Set([
  "config", "logs", "protect", "perms", "prefix", "automod", "escalation",
  "eco", "money", "voice", "ranks", "dest", "tickets", "channels",
  "rolemenus", "look", "counters", "levels", "setup", "gw", "publish",
]);

/** Actions sensibles même en dehors de ces sections. */
const ACTIONS_PROTEGEES = new Set([
  "mass", "mpsel", "mpcat", "mpall", "mpprot", "mplevel", "mplvlset", "mprun",
]);

/**
 * Faut-il le code pour ce clic ?
 * La navigation reste libre : seules les actions qui écrivent sont bloquées.
 */
function exigeCode(section, action, arg) {
  if (!action) return false;                        // ouverture d'une section
  if (action === "page") return false;              // changement de page
  if (section === "home") return false;
  if (ACTIONS_PROTEGEES.has(action)) return true;
  if (section === "mod") return ACTIONS_PROTEGEES.has(action) || arg === "mass";
  return SECTIONS_PROTEGEES.has(section);
}

/** Résumé affiché sur l'accueil du panneau. */
function etatVerrou(guildId, userId) {
  return estOuvert(guildId, userId)
    ? { ouvert: true, minutes: tempsRestant(guildId, userId) }
    : { ouvert: false, minutes: 0 };
}

/* ========================================================================== */
/*                    UNE SEULE ACTION À LA FOIS                              */
/* ========================================================================== */

/**
 * Deux clics simultanés sur « encaisser » ou « quotidien » permettaient
 * d'être payé deux fois : les deux appels lisaient le solde avant que le
 * premier ne l'écrive. On sérialise donc par personne.
 *
 * Le verrou se libère tout seul au bout de 20 secondes, pour qu'une action
 * bloquée n'enferme jamais quelqu'un.
 */
const enCours = new Map();   // "guild:user" -> instant de prise

function prendreJeton(guildId, userId) {
  const k = cleVerrou(guildId, userId);
  const depuis = enCours.get(k);
  if (depuis && Date.now() - depuis < 20_000) return false;
  enCours.set(k, Date.now());
  return true;
}

function rendreJeton(guildId, userId) {
  enCours.delete(cleVerrou(guildId, userId));
}

/**
 * Exécute `action` en garantissant qu'aucune autre ne tourne en même temps
 * pour la même personne.
 */
async function serialiser(guildId, userId, action, siOccupe) {
  if (!prendreJeton(guildId, userId)) return siOccupe ? siOccupe() : null;
  try { return await action(); }
  finally { rendreJeton(guildId, userId); }
}

setInterval(() => {
  const t = Date.now();
  for (const [k, d] of enCours) if (t - d > 20_000) enCours.delete(k);
  for (const [k, fin] of ouverts) if (fin < t) ouverts.delete(k);
  for (const [k, e] of essais) if (e.bloqueJusqua && e.bloqueJusqua < t && e.n === 0) essais.delete(k);
}, 5 * 60_000).unref();

/* ========================================================================== */
/*                    4 - STOCKAGE (POSTGRESQL / MEMOIRE)                     */
/* ========================================================================== */

// db.js — PostgreSQL avec repli mémoire.


const { Pool } = pg;

const DEFAULT_CONFIG = {
  logsEnabled: true,
  logOverrides: {},
  funcOverrides: {},
  panelMessages: {},     // destId -> { channelId, messageId }

  // Salons compteurs forcés (sinon détection par motif "Nom :")
  counters: { members: null, online: null, voice: null },

  // Système de perms : rôle → niveau, membre → niveau, commande → niveau requis
  perms: { roles: {}, users: {}, commands: {} },

  autoroleId: null,
  trustedRoleId: null,   // rôle « Like me » — accès aux réglages non destructifs
  ownerSanctionLevel: 5, // niveau minimum pour sanctionner le propriétaire (0 = intouchable)
  adminImmunity: true,   // la permission Discord « Administrateur » rend intouchable
  invites: { enabled: true, channelId: null, deleteAfterMs: 120_000, baseline: {} },
  welcomeChannelId: null,
  welcomeMessage: "Bienvenue {user} sur **{server}** — tu es le/la {count}ᵉ membre.",
  staffRoleId: null,
  jailRoleId: null,
  trapVoiceId: null,
  trapAction: "off", // off | kick | ban

  levelsEnabled: true,
  levelRewards: {},

  // Grades gagnés à l'heure de vocal et au message
  ranks: {
    enabled: true,
    autoPromote: true,
    removePrevious: true,
    requireBoth: true,   // il faut les heures ET les messages
    announce: true,
    ladder: [],          // [{ roleId, name, hours, messages }]
  },

  // Escalade : le cumul d'avertissements déclenche une sanction automatique
  escalation: {
    enabled: true,
    expireDays: 60,        // 0 = les avertissements ne périment jamais
    rules: [
      { warns: 3, action: "timeout", duration: "1h" },
      { warns: 5, action: "timeout", duration: "1d" },
      { warns: 7, action: "kick" },
      { warns: 10, action: "ban" },
    ],
  },

  // Quartier illégal : gros gains, risque réel de dette
  crime: {
    enabled: true,
    heatDecayPerMin: 1,      // la pression retombe d'un point par minute
    debtBlocksCasino: true,  // en dette, plus de mise au casino ni d'achat
    maxDebt: 100_000,
  },

  brandColor: null,   // couleur d'accent du serveur (entier), null = bleu Discord
  // Lecteur audio — préfixe dédié pour ne pas encombrer les commandes texte
  musique: {
    prefixe: "+",
    volumeDefaut: 100,
    quitterVideSec: 60,
    quitterInactifSec: 300,
    proposerChoix: true,   // proposer plusieurs titres au lieu de jouer le premier
  },

  roleMenus: [],   // [{ id, title, emoji, desc, max, roleIds }]

  // Commandes à préfixe : !ban, ?kick, *mute…
  prefix: {
    enabled: true,
    char: "!",
    deleteInvocation: false,
    disabled: [],   // noms de commandes coupées
    levels: {},     // surcharges de niveau requis
  },

  // Casino
  casino: {
    enabled: true,
    minBet: 50,
    maxBet: 250_000,
    games: { slots: true, blackjack: true, roulette: true, mines: true, dice: true, flip: true },
  },

  // Rappel des tickets laissés sans réponse
  ticketReminder: { enabled: true, hours: 6 },
  ticketCategories: {},
  ticketStyle: {},        // id du type -> { label, emoji, desc } personnalisés
  ticketRoles: {},        // id du type -> identifiant du rôle qui y a accès
  purge: { level: 7, protectedChannels: [] },   // niveau 7 = propriétaire de 0x uniquement  // type de ticket -> identifiant de la catégorie créée

  // Vocaux temporaires : « Créer ton vocal »
  tempVoice: {
    enabled: true,
    hubId: null,          // salon d'accueil ; détecté par son nom si vide
    categoryId: null,     // vide = même catégorie que le salon d'accueil
    nameTemplate: "🔊 {user}",
    defaultLimit: 0,      // 0 = illimité
    keepEmptySeconds: 5,
  },

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
    exemptFromLevel: 4,   // niveau à partir duquel l'automod n'agit plus (0 = personne)
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
    casinoChannelId: null,
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
  backups: [],
  tempVoice: new Map(),
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
    await q(`ALTER TABLE levels ADD COLUMN IF NOT EXISTS messages INTEGER NOT NULL DEFAULT 0`);
    await q(`CREATE TABLE IF NOT EXISTS economy (
      guild_id TEXT, user_id TEXT, coins BIGINT NOT NULL DEFAULT 0,
      last_daily TIMESTAMPTZ, last_work TIMESTAMPTZ, streak INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (guild_id, user_id))`);
    await q(`ALTER TABLE economy ADD COLUMN IF NOT EXISTS heat INTEGER NOT NULL DEFAULT 0`);
    await q(`ALTER TABLE economy ADD COLUMN IF NOT EXISTS heat_at TIMESTAMPTZ`);
    await q(`CREATE TABLE IF NOT EXISTS giveaways (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, message_id TEXT,
      prize TEXT NOT NULL, winners INTEGER NOT NULL DEFAULT 1, host_id TEXT NOT NULL,
      required_role TEXT, ends_at TIMESTAMPTZ NOT NULL, ended BOOLEAN NOT NULL DEFAULT FALSE)`);
    await q(`CREATE TABLE IF NOT EXISTS giveaway_entries (giveaway_id INTEGER, user_id TEXT, PRIMARY KEY (giveaway_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, channel_id TEXT NOT NULL, user_id TEXT NOT NULL,
      kind TEXT NOT NULL, opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), closed_at TIMESTAMPTZ, closed_by TEXT)`);
    for (const col of ["last_activity TIMESTAMPTZ", "last_staff_at TIMESTAMPTZ", "reminded_at TIMESTAMPTZ"]) {
      await q(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS ${col}`);
    }
    await q(`CREATE TABLE IF NOT EXISTS backups (
      id SERIAL PRIMARY KEY, guild_id TEXT NOT NULL, name TEXT NOT NULL,
      data JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
    await q(`CREATE TABLE IF NOT EXISTS jail (guild_id TEXT, user_id TEXT, roles JSONB NOT NULL DEFAULT '[]'::jsonb,
      until TIMESTAMPTZ, reason TEXT, PRIMARY KEY (guild_id, user_id))`);
    await q(`CREATE TABLE IF NOT EXISTS temp_voice (
      guild_id TEXT NOT NULL, channel_id TEXT PRIMARY KEY,
      owner_id TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`);
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
  setBrandColor(guildId, cfg.brandColor ?? null);
  return cfg;
}

async function updateConfig(guildId, patch) {
  const next = merge(await getConfig(guildId), patch);
  cache.set(guildId, next);
  setBrandColor(guildId, next.brandColor ?? null);
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

/**
 * Crédite ou débite.
 * Le solde peut descendre sous zéro : c'est la dette. Elle ne doit JAMAIS
 * être effacée par un simple gain — un crédit la RÉDUIT, il ne la remet pas
 * à zéro. Chaque débit vérifie déjà le solde avant de retirer, donc le
 * plancher n'a plus lieu d'être.
 */
async function addCoins(guildId, userId, amount, allowNegative = true) {
  if (ready) {
    const expr = allowNegative ? "economy.coins+$3" : "GREATEST(0, economy.coins+$3)";
    const r = await q(`INSERT INTO economy (guild_id,user_id,coins) VALUES ($1,$2,$3)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET coins=${expr} RETURNING coins`, [guildId, userId, amount]);
    return Number(r.rows[0]?.coins ?? 0);
  }
  const k = `${guildId}:${userId}`;
  const w = mem.economy.get(k) ?? { coins: 0, lastDaily: null, lastWork: null, streak: 0, heat: 0 };
  w.coins = allowNegative ? w.coins + amount : Math.max(0, w.coins + amount);
  mem.economy.set(k, w);
  return w.coins;
}

/* -------------------------- PRESSION POLICIÈRE ---------------------------- */

async function getHeat(guildId, userId, decayPerMin = 1) {
  let heat = 0, at = null;
  if (ready) {
    const r = await q("SELECT heat, heat_at FROM economy WHERE guild_id=$1 AND user_id=$2", [guildId, userId]);
    heat = r.rows[0]?.heat ?? 0; at = r.rows[0]?.heat_at ?? null;
  } else {
    const w = mem.economy.get(`${guildId}:${userId}`);
    heat = w?.heat ?? 0; at = w?.heatAt ?? null;
  }
  if (!heat) return 0;
  const minutes = at ? (Date.now() - new Date(at).getTime()) / 60000 : 0;
  return Math.max(0, Math.round(heat - minutes * decayPerMin));
}

async function setHeat(guildId, userId, heat) {
  const v = Math.max(0, Math.min(100, Math.round(heat)));
  if (ready) {
    await q(`INSERT INTO economy (guild_id,user_id,heat,heat_at) VALUES ($1,$2,$3,NOW())
      ON CONFLICT (guild_id,user_id) DO UPDATE SET heat=$3, heat_at=NOW()`, [guildId, userId, v]);
    return v;
  }
  const k = `${guildId}:${userId}`;
  const w = mem.economy.get(k) ?? { coins: 0, lastDaily: null, lastWork: null, streak: 0 };
  w.heat = v; w.heatAt = new Date();
  mem.economy.set(k, w);
  return v;
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

/** Masse monétaire en circulation, et nombre de porteurs. */
async function coinsSummary(guildId) {
  if (ready) {
    const r = await q(`SELECT COALESCE(SUM(coins),0)::bigint total, COUNT(*)::int porteurs,
      COUNT(*) FILTER (WHERE coins < 0)::int endettes FROM economy WHERE guild_id=$1`, [guildId]);
    const x = r.rows[0] ?? {};
    return { total: Number(x.total ?? 0), porteurs: x.porteurs ?? 0, endettes: x.endettes ?? 0 };
  }
  const list = [...mem.economy.entries()].filter(([k]) => k.startsWith(`${guildId}:`)).map(([, v]) => v.coins);
  return { total: list.reduce((a, b) => a + b, 0), porteurs: list.length, endettes: list.filter((c) => c < 0).length };
}

/** Crédite plusieurs personnes d'un coup. @returns {Promise<number>} */
async function addCoinsBulk(guildId, userIds, amount, allowNegative = true) {
  let n = 0;
  for (const id of userIds) { await addCoins(guildId, id, amount, allowNegative); n++; }
  return n;
}

/** Remet un solde à la valeur voulue. */
async function setCoins(guildId, userId, value) {
  const w = await getWallet(guildId, userId);
  return addCoins(guildId, userId, value - w.coins, true);
}

async function topCoins(guildId, limit = 10) {
  if (ready) return (await q("SELECT user_id,coins FROM economy WHERE guild_id=$1 AND coins > 0 ORDER BY coins DESC LIMIT $2", [guildId, limit]))
    .rows.map((r) => ({ userId: r.user_id, coins: Number(r.coins) }));
  return [...mem.economy.entries()].filter(([k, w]) => k.startsWith(`${guildId}:`) && w.coins > 0)
    .sort((a, b) => b[1].coins - a[1].coins)
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

/** Compte les sanctions d'un type sur une fenêtre glissante (0 = tout l'historique). */
async function countRecentSanctions(guildId, userId, type, days = 0) {
  if (!days) return countSanctions(guildId, userId, type);
  if (ready) {
    const r = await q(`SELECT COUNT(*)::int c FROM sanctions
      WHERE guild_id=$1 AND user_id=$2 AND type=$3 AND created_at > NOW() - ($4 || ' days')::interval`,
      [guildId, userId, type, String(days)]);
    return r.rows[0]?.c ?? 0;
  }
  const cutoff = Date.now() - days * 864e5;
  return mem.sanctions.filter((s) => s.guild_id === guildId && s.user_id === userId
    && s.type === type && new Date(s.created_at).getTime() > cutoff).length;
}

/* ---------------------------- SUIVI DES TICKETS --------------------------- */

/** Note une activité dans un ticket ; `isStaff` marque une réponse du staff. */
async function touchTicket(channelId, isStaff) {
  if (ready) {
    await q(`UPDATE tickets SET last_activity=NOW()${isStaff ? ", last_staff_at=NOW(), reminded_at=NULL" : ""}
      WHERE channel_id=$1 AND closed_at IS NULL`, [channelId]);
    return;
  }
  const t = mem.tickets.find((x) => x.channel_id === channelId && !x.closed_at);
  if (!t) return;
  t.last_activity = new Date();
  if (isStaff) { t.last_staff_at = new Date(); t.reminded_at = null; }
}

/** Tickets ouverts sans réponse du staff depuis N heures, jamais rappelés récemment. */
async function staleTickets(guildId, hours) {
  if (ready) {
    const r = await q(`SELECT * FROM tickets WHERE guild_id=$1 AND closed_at IS NULL
      AND COALESCE(last_staff_at, opened_at) < NOW() - ($2 || ' hours')::interval
      AND (reminded_at IS NULL OR reminded_at < NOW() - ($2 || ' hours')::interval)`,
      [guildId, String(hours)]);
    return r.rows;
  }
  const cutoff = Date.now() - hours * 36e5;
  return mem.tickets.filter((t) => t.guild_id === guildId && !t.closed_at
    && new Date(t.last_staff_at ?? t.opened_at).getTime() < cutoff
    && (!t.reminded_at || new Date(t.reminded_at).getTime() < cutoff));
}

async function markTicketReminded(channelId) {
  if (ready) { await q("UPDATE tickets SET reminded_at=NOW() WHERE channel_id=$1", [channelId]); return; }
  const t = mem.tickets.find((x) => x.channel_id === channelId);
  if (t) t.reminded_at = new Date();
}

/* ------------------------------ SAUVEGARDES ------------------------------- */

async function saveBackup(guildId, name, data) {
  if (ready) {
    const r = await q("INSERT INTO backups (guild_id,name,data) VALUES ($1,$2,$3::jsonb) RETURNING id",
      [guildId, name, JSON.stringify(data)]);
    await q(`DELETE FROM backups WHERE guild_id=$1 AND id NOT IN (
      SELECT id FROM backups WHERE guild_id=$1 ORDER BY id DESC LIMIT 10)`, [guildId]);
    return r.rows[0]?.id;
  }
  const id = seq++;
  mem.backups.push({ id, guild_id: guildId, name, data, created_at: new Date() });
  mem.backups = mem.backups.filter((x) => x.guild_id !== guildId)
    .concat(mem.backups.filter((x) => x.guild_id === guildId).slice(-10));
  return id;
}

async function listBackups(guildId) {
  if (ready) return (await q("SELECT id,name,created_at FROM backups WHERE guild_id=$1 ORDER BY id DESC LIMIT 10", [guildId])).rows;
  return mem.backups.filter((x) => x.guild_id === guildId).sort((a, b) => b.id - a.id).slice(0, 10);
}

async function getBackup(guildId, id) {
  if (ready) return (await q("SELECT * FROM backups WHERE guild_id=$1 AND id=$2", [guildId, id])).rows[0] ?? null;
  return mem.backups.find((x) => x.guild_id === guildId && x.id === Number(id)) ?? null;
}

async function deleteBackup(guildId, id) {
  if (ready) return (await q("DELETE FROM backups WHERE guild_id=$1 AND id=$2", [guildId, id])).rowCount > 0;
  const n = mem.backups.length;
  mem.backups = mem.backups.filter((x) => !(x.guild_id === guildId && x.id === Number(id)));
  return n !== mem.backups.length;
}

/** Écrase entièrement la configuration (utilisé par la restauration). */
async function replaceConfig(guildId, data) {
  cache.delete(guildId);
  if (ready) await q(`INSERT INTO guild_config (guild_id,data) VALUES ($1,$2::jsonb)
    ON CONFLICT (guild_id) DO UPDATE SET data=$2::jsonb`, [guildId, JSON.stringify(data)]);
  else mem.config.set(guildId, data);
  return getConfig(guildId);
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

/* --------------------------- VOCAUX TEMPORAIRES --------------------------- */

async function registerTempVoice(guildId, channelId, ownerId) {
  if (ready) await q(`INSERT INTO temp_voice (guild_id,channel_id,owner_id) VALUES ($1,$2,$3)
    ON CONFLICT (channel_id) DO UPDATE SET owner_id=$3`, [guildId, channelId, ownerId]);
  else mem.tempVoice.set(channelId, { guild_id: guildId, channel_id: channelId, owner_id: ownerId, created_at: new Date() });
}

async function getTempVoice(channelId) {
  if (ready) return (await q("SELECT * FROM temp_voice WHERE channel_id=$1", [channelId])).rows[0] ?? null;
  return mem.tempVoice.get(channelId) ?? null;
}

async function setTempVoiceOwner(channelId, ownerId) {
  if (ready) await q("UPDATE temp_voice SET owner_id=$2 WHERE channel_id=$1", [channelId, ownerId]);
  else { const r = mem.tempVoice.get(channelId); if (r) r.owner_id = ownerId; }
}

async function dropTempVoice(channelId) {
  if (ready) await q("DELETE FROM temp_voice WHERE channel_id=$1", [channelId]);
  else mem.tempVoice.delete(channelId);
}

async function listTempVoice(guildId) {
  if (ready) return (await q("SELECT * FROM temp_voice WHERE guild_id=$1", [guildId])).rows;
  return [...mem.tempVoice.values()].filter((r) => r.guild_id === guildId);
}

/* ---------------------------- NOMBRE DE MESSAGES -------------------------- */

async function addMessageCount(guildId, userId, n = 1) {
  if (ready) {
    const r = await q(`INSERT INTO levels (guild_id,user_id,messages) VALUES ($1,$2,$3)
      ON CONFLICT (guild_id,user_id) DO UPDATE SET messages = levels.messages + $3 RETURNING messages`,
      [guildId, userId, n]);
    return r.rows[0]?.messages ?? 0;
  }
  const k = `${guildId}:${userId}`;
  const cur = (mem.messages ??= new Map());
  const v = (cur.get(k) ?? 0) + n;
  cur.set(k, v);
  return v;
}

async function getMessageCount(guildId, userId) {
  if (ready) return (await q("SELECT messages FROM levels WHERE guild_id=$1 AND user_id=$2", [guildId, userId])).rows[0]?.messages ?? 0;
  return (mem.messages ??= new Map()).get(`${guildId}:${userId}`) ?? 0;
}

async function topMessages(guildId, limit = 10) {
  if (ready) return (await q("SELECT user_id, messages FROM levels WHERE guild_id=$1 ORDER BY messages DESC LIMIT $2", [guildId, limit]))
    .rows.map((r) => ({ userId: r.user_id, messages: r.messages }));
  return [...(mem.messages ??= new Map()).entries()].filter(([k]) => k.startsWith(`${guildId}:`))
    .sort((a, b) => b[1] - a[1]).slice(0, limit).map(([k, messages]) => ({ userId: k.split(":")[1], messages }));
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
/*                   5 - VEILLE : PRESENCE DU PROPRIETAIRE                    */
/* ========================================================================== */

// owner.js — surveillance de la présence du propriétaire de 0x.
// Si l'identifiant n'est plus sur le serveur, le bot se met en veille totale
// et ne reprend qu'à son retour.


/** Interrupteur d'urgence : mettre SUSPEND_WITHOUT_OWNER=false sur Railway. */
const SUSPEND_ENABLED = (process.env.SUSPEND_WITHOUT_OWNER ?? "true").toLowerCase() !== "false";

// guildId -> { suspended: boolean, since: Date|null, lastCheck: number }
const state = new Map();

function isSuspended(guildId) {
  if (!SUSPEND_ENABLED) return false;
  return state.get(guildId)?.suspended === true;
}

function suspensionSince(guildId) {
  return state.get(guildId)?.since ?? null;
}

function anySuspended() {
  for (const s of state.values()) if (s.suspended) return true;
  return false;
}

/**
 * Le propriétaire est-il sur ce serveur ?
 * Discord renvoie le code 10007 quand le membre est réellement absent.
 * Toute autre erreur (réseau, permission, coupure) est traitée comme
 * « présent » : on ne suspend jamais un serveur sur un doute.
 * @returns {Promise<{present:boolean, certain:boolean, error?:string}>}
 */
async function checkOwnerPresence(guild) {
  try {
    const member = await guild.members.fetch({ user: OWNER_ID, force: true });
    return { present: !!member, certain: true };
  } catch (err) {
    if (err?.code === 10007 || /unknown member/i.test(err?.message ?? "")) {
      return { present: false, certain: true };
    }
    return { present: true, certain: false, error: err?.message?.slice(0, 120) };
  }
}

/**
 * Applique l'état de veille et annonce le changement.
 * @returns {Promise<{changed:boolean, suspended:boolean}>}
 */
async function applyPresence(guild, present, { announce = true } = {}) {
  if (!SUSPEND_ENABLED) return { changed: false, suspended: false };

  const previous = state.get(guild.id)?.suspended ?? false;
  const suspended = !present;
  state.set(guild.id, {
    suspended,
    since: suspended ? (previous ? state.get(guild.id).since : new Date()) : null,
    lastCheck: Date.now(),
  });

  if (previous === suspended) return { changed: false, suspended };
  if (announce) await announceChange(guild, suspended).catch(() => null);
  return { changed: true, suspended };
}

/** Prévient l'équipe, en contournant la journalisation (elle est coupée). */
async function announceChange(guild, suspended) {
  const body = suspended
    ? embed({
        guild, color: COLORS.danger, author: { name: "⏸️  0x est en veille" },
        description: [
          `Le propriétaire du bot (<@${OWNER_ID}>) n'est plus sur le serveur.`,
          "",
          "**Tout est suspendu :** modération automatique, anti-raid, anti-nuke, journaux, tickets, XP, économie, invitations, compteurs et le panneau.",
          "",
          "Le bot reprendra **automatiquement** dès son retour sur le serveur.",
        ].join("\n"),
        footer: "Autre issue : modifier la variable OWNER_ID sur Railway",
      })
    : embed({
        guild, color: COLORS.success, author: { name: `${ICONS.ok}  0x a repris` },
        description: `<@${OWNER_ID}> est de retour. Toutes les fonctions sont réactivées.`,
      });

  // On cherche un endroit visible par le staff, sans passer par log()
  const config = await getConfig(guild.id);
  const targets = [
    resolveFuncChannel(guild, "staffChat", config),
    config.logsEnabled ? guild.channels.cache.get(config.logOverrides?.antinuke) : null,
    guild.systemChannel,
  ].filter((c) => c && canSend(c));

  if (targets[0]) await targets[0].send({ embeds: [body] }).catch(() => null);
}

/** Écran affiché à quiconque tente d'utiliser le bot pendant la veille. */
function suspendedNotice(guild) {
  const since = suspensionSince(guild.id);
  return {
    embeds: [embed({
      guild, color: COLORS.danger, author: { name: "⏸️  0x est en veille" },
      description: [
        `Le propriétaire du bot (<@${OWNER_ID}>) n'est plus sur le serveur.`,
        since ? `Veille depuis ${ts(since)}.` : "",
        "",
        "Toutes les fonctions sont suspendues jusqu'à son retour.",
      ].filter(Boolean).join("\n"),
      footer: "Reprise automatique dès qu'il revient",
    })],
  };
}

/** Met à jour le statut affiché du bot. */
function refreshPresenceStatus(client) {
  if (anySuspended()) {
    client.user.setPresence({
      activities: [{ name: "en veille — propriétaire absent", type: ActivityType.Watching }],
      status: "dnd",
    });
    return true;
  }
  return false;
}

/** Contrôle complet d'un serveur, utilisé au démarrage et périodiquement. */
async function watchOwner(guild, { announce = true } = {}) {
  if (!SUSPEND_ENABLED) return { suspended: false, certain: true };
  const { present, certain, error } = await checkOwnerPresence(guild);
  if (!certain) {
    console.warn(`[veille] ${guild.name} : vérification incertaine (${error}) — le bot reste actif par sécurité`);
    return { suspended: isSuspended(guild.id), certain: false };
  }
  const r = await applyPresence(guild, present, { announce });
  return { suspended: r.suspended, certain: true, changed: r.changed };
}

/* ========================================================================== */
/*                     6 - AUTOMOD, ANTI-RAID, ANTI-NUKE                      */
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

function exempt(message, automod, config) {
  const member = message.member;
  if (!member) return true;
  if (isOwner(member.id)) return true;
  if (hasAdminImmunity(member, config)) return true;
  const floor = Number(automod.exemptFromLevel ?? 4);
  if (floor > 0 && permLevel(member, config) >= floor) return true;
  if (automod.ignoredChannels?.includes(message.channel.id)) return true;
  if (automod.ignoredChannels?.includes(message.channel.parentId)) return true;
  if (automod.exemptRoles?.some((r) => member.roles.cache.has(r))) return true;
  return false;
}

/** @returns {{reason:string, route:string, timeoutMs?:number}|null} */
function inspectMessage(message, config) {
  const a = config.automod;
  if (!a?.enabled || !message.guild || message.author.bot) return null;
  if (exempt(message, a, config)) return null;

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
  if (config.antinuke?.whitelist?.includes(userId)) return true;
  // Immunité « Administrateur » : l'anti-nuke ne vise jamais ces personnes.
  return hasAdminImmunity(guild.members.cache.get(userId), config);
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
/*                           7 - DROITS DES SALONS                            */
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
/*                      8 - DESSIN DE TOUTES LES IMAGES                       */
/* ========================================================================== */

// render.js — les jeux du casino dessinés en image.
//
// La bibliothèque de dessin est chargée à la demande : si elle manque,
// le casino continue de tourner en texte, sans planter.

let CV = null;                 // module @napi-rs/canvas
let POLICE = "sans-serif";
let PRET = false;

/** Palette commune à toutes les images. */
const P = {
  fond1: "#1a0f2e", fond2: "#0f1225", fond3: "#2a1030",
  or: "#d4af37", orClair: "#f5c518",
  rouge: "#c8102e", rougeClair: "#ff5a6e",
  vert: "#1db954", vertClair: "#3ddc84",
  noir: "#14161f", ardoise: "#2b2f42",
  panneau: "rgba(255,255,255,0.045)",
  bord: "rgba(255,255,255,0.09)",
  texte: "#ffffff", faible: "rgba(255,255,255,0.45)", tres: "rgba(255,255,255,0.22)",
  arc: ["#00d4ff", "#7b2ff7", "#ff2d95"],
};

/**
 * Charge la bibliothèque et choisit une police.
 * Pose un fichier `font.ttf` à côté d'index.js pour imposer la tienne.
 * @returns {Promise<boolean>}
 */
async function initRender() {
  if (PRET) return true;
  try {
    CV = await import("@napi-rs/canvas");
    try {
      const { existsSync } = await import("node:fs");
      for (const chemin of ["./font.ttf", "./assets/font.ttf", "/app/font.ttf"]) {
        if (existsSync(chemin)) { CV.GlobalFonts.registerFromPath(chemin, "Naoya"); break; }
      }
    } catch { /* pas de police fournie, on prendra celle du système */ }

    const dispo = CV.GlobalFonts.families.map((f) => f.family);
    POLICE = ["Naoya", "Liberation Sans", "DejaVu Sans", "FreeSans", "Arial", "Helvetica"]
      .find((f) => dispo.includes(f)) ?? "sans-serif";
    PRET = true;
    console.log(`[images] dessin activé · police « ${POLICE} »`);
    return true;
  } catch (e) {
    console.warn("[images] dessin indisponible, le casino restera en texte :", e.message);
    PRET = false;
    return false;
  }
}

const renderReady = () => PRET;

/**
 * Télécharge la photo de profil. Un échec n'empêche jamais le rendu :
 * l'image sort simplement sans l'avatar.
 */
async function chargerAvatar(url) {
  if (!PRET || !url) return null;
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 2500);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(t);
    if (!r.ok) return null;
    return await CV.loadImage(Buffer.from(await r.arrayBuffer()));
  } catch { return null; }
}

/* ========================================================================== */
/*                            OUTILS DE DESSIN                                */
/* ========================================================================== */

const f = (taille, gras = false) => `${gras ? "bold " : ""}${taille}px "${POLICE}"`;
const nb = (n) => Number(n).toLocaleString("fr-FR");

/**
 * Les polices système ne contiennent pas les emojis en couleur : dessiné tel
 * quel, un emoji sort en carré vide. On les retire de tout texte peint.
 */
const propre = (s) => String(s ?? "")
  .replace(/[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}\u{20E3}]/gu, "")
  .replace(/\s{2,}/g, " ").trim();

/** Nom lisible de chaque symbole de la machine. */
const MOT_SYMBOLE = {
  "🍒": "cerises", "🍋": "citrons", "🍊": "oranges", "🔔": "cloches",
  "💎": "diamants", "7️⃣": "sept", "🌟": "étoiles",
};

function arrondi(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Toile de fond commune : dégradé, quadrillage, filet d'en-tête. */
function scene(L, H) {
  const c = CV.createCanvas(L, H);
  const ctx = c.getContext("2d");
  const g = ctx.createLinearGradient(0, 0, L, H);
  g.addColorStop(0, P.fond1); g.addColorStop(0.5, P.fond2); g.addColorStop(1, P.fond3);
  ctx.fillStyle = g; ctx.fillRect(0, 0, L, H);
  ctx.strokeStyle = "rgba(255,255,255,0.03)"; ctx.lineWidth = 1;
  for (let x = 0; x < L; x += 28) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 28) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(L, y); ctx.stroke(); }
  return { c, ctx };
}

function entete(ctx, L, titre, joueur, mise, avatar) {
  let x = 40;
  if (avatar) {
    // Photo de profil, découpée en rond, cerclée d'or
    ctx.save();
    ctx.beginPath(); ctx.arc(72, 52, 28, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    try { ctx.drawImage(avatar, 44, 24, 56, 56); } catch { /* image illisible */ }
    ctx.restore();
    ctx.beginPath(); ctx.arc(72, 52, 28, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(212,175,55,0.75)"; ctx.lineWidth = 2.5; ctx.stroke();
    x = 116;
  }
  ctx.textAlign = "left";
  ctx.fillStyle = P.texte; ctx.font = f(27, true);
  ctx.fillText(propre(titre).split("").join(" "), x, 50);
  ctx.fillStyle = P.faible; ctx.font = f(15);
  ctx.fillText(propre(joueur), x, 74);

  if (mise !== undefined) {
    arrondi(ctx, L - 190, 28, 150, 34, 17);
    ctx.fillStyle = "rgba(212,175,55,0.16)"; ctx.fill();
    ctx.fillStyle = P.orClair; ctx.font = f(15, true); ctx.textAlign = "center";
    ctx.fillText(`MISE ${nb(mise)}`, L - 115, 50);
    ctx.textAlign = "left";
  }
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 90); ctx.lineTo(L - 40, 90); ctx.stroke();
}

/**
 * Une pièce d'or dessinée au trait : tranche, face, reflet.
 * Les polices système n'ont aucun emoji en couleur, il faut donc la peindre.
 */
function piece(ctx, cx, cy, r) {
  ctx.save();
  // tranche, légèrement décalée vers le bas
  ctx.beginPath(); ctx.arc(cx, cy + r * 0.14, r, 0, Math.PI * 2);
  ctx.fillStyle = "#a8811b"; ctx.fill();
  // face
  const g = ctx.createLinearGradient(cx - r, cy - r, cx + r, cy + r);
  g.addColorStop(0, "#ffe27a"); g.addColorStop(0.45, "#f0c02e"); g.addColorStop(1, "#c99a12");
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = g; ctx.fill();
  // liseré intérieur
  ctx.beginPath(); ctx.arc(cx, cy, r * 0.72, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(140,100,10,0.55)"; ctx.lineWidth = Math.max(1, r * 0.11); ctx.stroke();
  // reflet
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.86, Math.PI * 1.05, Math.PI * 1.5);
  ctx.strokeStyle = "rgba(255,255,255,0.75)"; ctx.lineWidth = Math.max(1, r * 0.14);
  ctx.lineCap = "round"; ctx.stroke();
  ctx.restore();
}

function pied(ctx, L, H, solde) {
  piece(ctx, 52, H - 32, 13);
  ctx.fillStyle = P.texte; ctx.font = f(17, true); ctx.textAlign = "left";
  ctx.fillText(nb(solde), 72, H - 26);
  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA CASINO", L - 30, H - 24);
  ctx.textAlign = "left";
}

/** Cadre latéral avec sa barre arc-en-ciel. */
function cadre(ctx, x, y, w, h) {
  arrondi(ctx, x, y, w, h, 20);
  ctx.fillStyle = P.panneau; ctx.fill();
  ctx.strokeStyle = P.bord; ctx.lineWidth = 1.5; ctx.stroke();
  const b = ctx.createLinearGradient(x, 0, x + w, 0);
  b.addColorStop(0, P.arc[0]); b.addColorStop(0.5, P.arc[1]); b.addColorStop(1, P.arc[2]);
  ctx.fillStyle = b; ctx.fillRect(x + 18, y, w - 36, 3);
}

/** Bloc « GAGNÉ / PERDU » avec le montant. */
function verdict(ctx, x, y, w, gagne, montant, phrase) {
  ctx.textAlign = "left";
  ctx.fillStyle = gagne ? P.vertClair : "#ff4757";
  ctx.font = f(w < 300 ? 27 : 34, true);
  ctx.fillText(gagne ? "GAGNÉ" : "PERDU", x, y);
  ctx.textAlign = "right";
  ctx.fillText(`${gagne ? "+" : "−"}${nb(Math.abs(montant))}`, x + w, y);
  ctx.textAlign = "left";
  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = `italic ${f(15)}`;
  ctx.fillText(propre(phrase), x, y + 40);
}

function etoile(ctx, cx, cy, r, couleur) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const rr = i % 2 ? r * 0.45 : r;
    ctx[i ? "lineTo" : "moveTo"](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
  }
  ctx.closePath(); ctx.fillStyle = couleur; ctx.fill();
}

/* ========================================================================== */
/*                              ROULETTE                                      */
/* ========================================================================== */

const ORDRE = [0,32,15,19,4,21,2,25,17,34,6,27,13,36,11,30,8,23,10,5,24,16,33,1,20,14,31,9,22,18,29,7,28,12,35,3,26];
const ROUGE = new Set([1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]);

function renderRoulette({ numero, pari, mise, gain, joueur, solde , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 520;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "ROULETTE", joueur, mise, avatar);

  const cx = 258, cy = 300, R = 162;
  const idx = ORDRE.indexOf(numero);
  const pas = (Math.PI * 2) / ORDRE.length;
  const rot = -Math.PI / 2 - idx * pas;

  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30;
  ctx.beginPath(); ctx.arc(cx, cy, R + 12, 0, Math.PI * 2);
  const or = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  or.addColorStop(0, P.or); or.addColorStop(0.5, "#8b6914"); or.addColorStop(1, P.or);
  ctx.fillStyle = or; ctx.fill(); ctx.restore();

  ORDRE.forEach((n, i) => {
    const a0 = rot + i * pas;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R, a0, a0 + pas); ctx.closePath();
    ctx.fillStyle = n === 0 ? P.vert : ROUGE.has(n) ? P.rouge : P.noir;
    ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.35)"; ctx.lineWidth = 1; ctx.stroke();
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(a0 + pas / 2);
    ctx.fillStyle = P.texte; ctx.font = f(17, true);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(String(n), R - 22, 0);
    ctx.restore();
  });
  ctx.textBaseline = "alphabetic";

  ctx.beginPath(); ctx.arc(cx, cy, R * 0.52, 0, Math.PI * 2);
  ctx.fillStyle = "#161a2e"; ctx.fill();
  ctx.strokeStyle = "rgba(212,175,55,0.5)"; ctx.lineWidth = 2; ctx.stroke();
  for (let i = 0; i < 8; i++) {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate((i * Math.PI) / 4);
    ctx.strokeStyle = "rgba(212,175,55,0.45)"; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(20, 0); ctx.lineTo(R * 0.52, 0); ctx.stroke(); ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 16, 0, Math.PI * 2); ctx.fillStyle = or; ctx.fill();

  const ab = -Math.PI / 2 + pas / 2;
  const bx = cx + Math.cos(ab) * (R - 34), by = cy + Math.sin(ab) * (R - 34);
  ctx.save(); ctx.shadowColor = "rgba(255,255,255,0.9)"; ctx.shadowBlur = 14;
  ctx.beginPath(); ctx.arc(bx, by, 9, 0, Math.PI * 2); ctx.fillStyle = "#fff"; ctx.fill(); ctx.restore();

  const rx = cx + Math.cos(ab) * (R + 16), ry = cy + Math.sin(ab) * (R + 16);
  ctx.beginPath(); ctx.moveTo(rx, ry); ctx.lineTo(rx - 12, ry - 22); ctx.lineTo(rx + 12, ry - 22);
  ctx.closePath(); ctx.fillStyle = P.orClair; ctx.fill();

  const px = 566, py = 92, pw = 384, ph = 362;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("VOTRE PARI", px + 28, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(32, true);
  ctx.fillText(propre(pari).toUpperCase(), px + 28, py + 82);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 28, py + 104); ctx.lineTo(px + pw - 28, py + 104); ctx.stroke();

  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("NUMÉRO SORTI", px + 28, py + 136);
  const couleur = numero === 0 ? P.vert : ROUGE.has(numero) ? P.rouge : P.ardoise;
  ctx.save(); ctx.shadowColor = couleur; ctx.shadowBlur = 26;
  ctx.beginPath(); ctx.arc(px + 76, py + 190, 42, 0, Math.PI * 2);
  ctx.fillStyle = couleur; ctx.fill(); ctx.restore();
  ctx.fillStyle = P.texte; ctx.font = f(40, true); ctx.textAlign = "center";
  ctx.fillText(String(numero), px + 76, py + 204);
  ctx.textAlign = "left";
  ctx.fillStyle = numero === 0 ? P.vert : ROUGE.has(numero) ? P.rougeClair : "#c9cee0";
  ctx.font = f(26, true);
  ctx.fillText(numero === 0 ? "VERT" : ROUGE.has(numero) ? "ROUGE" : "NOIR", px + 138, py + 184);
  const traits = numero === 0 ? "Seul le plein paie"
    : [numero % 2 ? "Impair" : "Pair", numero <= 18 ? "1-18" : "19-36",
       numero <= 12 ? "1ʳᵉ douzaine" : numero <= 24 ? "2ᵉ douzaine" : "3ᵉ douzaine"].join(" · ");
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(traits, px + 138, py + 208);

  verdict(ctx, px + 28, py + 272, pw - 56, gain > 0, gain > 0 ? gain : mise,
    gain > 0 ? "La banque s'incline…" : "La banque ramasse la mise…");
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                          MACHINE À SOUS                                    */
/* ========================================================================== */

/** Les symboles sont dessinés : aucune dépendance à une police d'emojis. */
function symbole(ctx, nom, cx, cy, t) {
  ctx.save(); ctx.translate(cx, cy);
  if (nom === "🍒") {
    ctx.strokeStyle = "#2e7d32"; ctx.lineWidth = t * 0.07; ctx.beginPath();
    ctx.moveTo(-t * 0.18, t * 0.1); ctx.quadraticCurveTo(0, -t * 0.45, t * 0.06, -t * 0.42);
    ctx.moveTo(t * 0.2, t * 0.12); ctx.quadraticCurveTo(t * 0.15, -t * 0.3, t * 0.06, -t * 0.42);
    ctx.stroke();
    ctx.fillStyle = "#e53935";
    ctx.beginPath(); ctx.arc(-t * 0.2, t * 0.24, t * 0.2, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(t * 0.22, t * 0.26, t * 0.18, 0, Math.PI * 2); ctx.fill();
  } else if (nom === "🍋") {
    ctx.fillStyle = "#fdd835"; ctx.beginPath();
    ctx.ellipse(0, 0, t * 0.42, t * 0.3, -0.25, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.beginPath();
    ctx.ellipse(-t * 0.12, -t * 0.1, t * 0.14, t * 0.07, -0.3, 0, Math.PI * 2); ctx.fill();
  } else if (nom === "🍊") {
    ctx.fillStyle = "#fb8c00"; ctx.beginPath(); ctx.arc(0, t * 0.04, t * 0.36, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#2e7d32"; ctx.beginPath();
    ctx.ellipse(t * 0.14, -t * 0.34, t * 0.16, t * 0.07, -0.5, 0, Math.PI * 2); ctx.fill();
  } else if (nom === "🔔") {
    ctx.fillStyle = P.or; ctx.beginPath();
    ctx.moveTo(-t * 0.34, t * 0.22);
    ctx.quadraticCurveTo(-t * 0.3, -t * 0.34, 0, -t * 0.36);
    ctx.quadraticCurveTo(t * 0.3, -t * 0.34, t * 0.34, t * 0.22);
    ctx.closePath(); ctx.fill();
    ctx.fillRect(-t * 0.38, t * 0.22, t * 0.76, t * 0.08);
    ctx.beginPath(); ctx.arc(0, t * 0.36, t * 0.09, 0, Math.PI * 2); ctx.fill();
  } else if (nom === "💎") {
    ctx.fillStyle = "#4dd0e1"; ctx.beginPath();
    ctx.moveTo(0, -t * 0.34); ctx.lineTo(t * 0.36, -t * 0.06);
    ctx.lineTo(0, t * 0.38); ctx.lineTo(-t * 0.36, -t * 0.06);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.55)"; ctx.lineWidth = t * 0.03;
    ctx.beginPath(); ctx.moveTo(-t * 0.36, -t * 0.06); ctx.lineTo(t * 0.36, -t * 0.06);
    ctx.moveTo(0, -t * 0.34); ctx.lineTo(0, t * 0.38); ctx.stroke();
  } else if (nom === "7️⃣") {
    ctx.fillStyle = "#ff1744"; ctx.font = f(Math.round(t * 0.95), true);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("7", 0, t * 0.03);
  } else {
    etoile(ctx, 0, 0, t * 0.42, P.orClair);
  }
  ctx.restore();
  ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
}

function renderSlots({ reels, mult, libelle, mise, gain, joueur, solde , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 520;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "MACHINE", joueur, mise, avatar);

  const bx = 60, by = 140, bw = 460, bh = 260;
  arrondi(ctx, bx, by, bw, bh, 22);
  const boitier = ctx.createLinearGradient(bx, by, bx, by + bh);
  boitier.addColorStop(0, "#241a3d"); boitier.addColorStop(1, "#150f26");
  ctx.fillStyle = boitier; ctx.fill();
  ctx.strokeStyle = P.or; ctx.lineWidth = 3; ctx.stroke();

  const gagne = gain > 0;
  const cases = 3, cw = 130, ch = 180, gap = 16;
  const dx = bx + (bw - (cases * cw + (cases - 1) * gap)) / 2;
  for (let i = 0; i < cases; i++) {
    const x = dx + i * (cw + gap), y = by + (bh - ch) / 2;
    arrondi(ctx, x, y, cw, ch, 14);
    ctx.fillStyle = "#0b0d18"; ctx.fill();
    ctx.strokeStyle = gagne ? "rgba(61,220,132,0.7)" : "rgba(255,255,255,0.12)";
    ctx.lineWidth = gagne ? 3 : 1.5; ctx.stroke();
    if (gagne) { ctx.save(); ctx.shadowColor = P.vertClair; ctx.shadowBlur = 18; ctx.stroke(); ctx.restore(); }
    symbole(ctx, reels[i], x + cw / 2, y + ch / 2, 96);
  }

  ctx.fillStyle = P.tres; ctx.font = f(13);
  ctx.textAlign = "center";
  ctx.fillText("3 étoiles ×1500   •   3 sept ×300   •   3 diamants ×125", bx + bw / 2, by + bh + 34);
  ctx.textAlign = "left";

  const px = 566, py = 92, pw = 384, ph = 362;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("RÉSULTAT", px + 28, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(30, true);
  ctx.fillText(propre(libelle).slice(0, 26), px + 28, py + 84);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 28, py + 106); ctx.lineTo(px + pw - 28, py + 106); ctx.stroke();

  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("MULTIPLICATEUR", px + 28, py + 140);
  ctx.save(); ctx.shadowColor = gagne ? P.vertClair : P.ardoise; ctx.shadowBlur = 22;
  arrondi(ctx, px + 28, py + 156, 150, 62, 14);
  ctx.fillStyle = gagne ? "rgba(61,220,132,0.15)" : "rgba(255,255,255,0.05)"; ctx.fill(); ctx.restore();
  ctx.fillStyle = gagne ? P.vertClair : P.faible; ctx.font = f(34, true);
  ctx.textAlign = "center"; ctx.fillText(`×${mult}`, px + 103, py + 198);
  ctx.textAlign = "left";

  verdict(ctx, px + 28, py + 278, pw - 56, gagne, gagne ? gain : mise,
    gagne ? "Les rouleaux te sourient…" : "Les rouleaux ne suivent pas…");
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                              BLACKJACK                                     */
/* ========================================================================== */

function carte(ctx, x, y, w, h, rang, enseigne, cachee = false) {
  arrondi(ctx, x, y, w, h, 10);
  if (cachee) {
    const d = ctx.createLinearGradient(x, y, x + w, y + h);
    d.addColorStop(0, "#3a2a6b"); d.addColorStop(1, "#1d1440");
    ctx.fillStyle = d; ctx.fill();
    ctx.strokeStyle = "rgba(212,175,55,0.6)"; ctx.lineWidth = 2; ctx.stroke();
    ctx.strokeStyle = "rgba(212,175,55,0.35)"; ctx.lineWidth = 1;
    arrondi(ctx, x + 8, y + 8, w - 16, h - 16, 6); ctx.stroke();
    etoile(ctx, x + w / 2, y + h / 2, 16, "rgba(212,175,55,0.5)");
    return;
  }
  ctx.fillStyle = "#f7f7fb"; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 1; ctx.stroke();
  const rouge = enseigne === "♥" || enseigne === "♦";
  ctx.fillStyle = rouge ? "#d32f2f" : "#15161c";
  ctx.textAlign = "left"; ctx.font = f(21, true);
  ctx.fillText(rang, x + 9, y + 27);
  ctx.font = f(19); ctx.fillText(enseigne, x + 9, y + 48);
  ctx.textAlign = "center"; ctx.font = f(40);
  ctx.fillText(enseigne, x + w / 2, y + h / 2 + 20);
}

function renderBlackjack({ joueurCartes, croupierCartes, valeurJoueur, valeurCroupier,
                                  cacher, termine, texte, mise, gain, joueur, solde , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 540;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "BLACKJACK", joueur, mise, avatar);

  const cw = 84, ch = 118;
  const rangee = (cartes, y, titre, valeur, masquer) => {
    ctx.fillStyle = P.faible; ctx.font = f(13);
    ctx.fillText(titre, 50, y - 14);
    cartes.slice(0, 6).forEach((k, i) => {
      const masque = masquer && i === 1;
      carte(ctx, 50 + i * (cw + 12), y, cw, ch, k.r, k.s, masque);
    });
    const bx = 50 + Math.min(cartes.length, 6) * (cw + 12) + 8;
    arrondi(ctx, bx, y + ch / 2 - 21, 62, 42, 12);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
    ctx.fillStyle = P.texte; ctx.font = f(22, true); ctx.textAlign = "center";
    ctx.fillText(masquer ? "?" : String(valeur), bx + 31, y + ch / 2 + 8);
    ctx.textAlign = "left";
  };

  rangee(croupierCartes, 132, "CROUPIER", valeurCroupier, cacher);
  rangee(joueurCartes, 310, "TOI", valeurJoueur, false);

  const px = 660, py = 92, pw = 290, ph = 362;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("ÉTAT", px + 24, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(21, true);
  const mots = propre(texte).split(" ");
  let ligne = "", ly = py + 78;
  for (const m of mots) {
    if ((ligne + " " + m).trim().length > 20) { ctx.fillText(ligne, px + 24, ly); ligne = m; ly += 28; }
    else ligne = (ligne + " " + m).trim();
  }
  if (ligne) ctx.fillText(ligne, px + 24, ly);

  if (termine) {
    verdict(ctx, px + 24, py + 260, pw - 48, gain > 0, gain > 0 ? gain : mise,
      gain > 0 ? "Bien joué." : gain === 0 ? "Mise rendue." : "Le croupier l'emporte.");
  } else {
    ctx.fillStyle = P.faible; ctx.font = f(15);
    ctx.fillText("Tire, reste, ou double.", px + 24, py + 268);
    ctx.fillStyle = P.tres; ctx.font = f(13);
    ctx.fillText("Le croupier tire jusqu'à 17.", px + 24, py + 292);
  }
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                              DÉMINEUR                                      */
/* ========================================================================== */

function renderMines({ bombes, ouvertes, mines, mult, mise, gain, joueur, solde, termine, saute, derniere , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 540;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "DEMINEUR", joueur, mise, avatar);

  const t = 64, gap = 8, gx = 60, gy = 128;
  for (let n = 0; n < 25; n++) {
    const x = gx + (n % 5) * (t + gap), y = gy + Math.floor(n / 5) * (t + gap);
    const ouverte = ouvertes.includes(n);
    const bombe = bombes.includes(n);
    arrondi(ctx, x, y, t, t, 12);
    if (ouverte) { ctx.fillStyle = "rgba(61,220,132,0.16)"; ctx.fill();
      ctx.strokeStyle = "rgba(61,220,132,0.6)"; ctx.lineWidth = 2; ctx.stroke();
      ctx.fillStyle = "#4dd0e1"; ctx.beginPath();
      ctx.moveTo(x + t / 2, y + t * 0.24); ctx.lineTo(x + t * 0.78, y + t * 0.48);
      ctx.lineTo(x + t / 2, y + t * 0.78); ctx.lineTo(x + t * 0.22, y + t * 0.48);
      ctx.closePath(); ctx.fill();
    } else if (termine && bombe) {
      const rate = saute && n === derniere;
      ctx.fillStyle = rate ? "rgba(255,71,87,0.3)" : "rgba(255,255,255,0.05)"; ctx.fill();
      ctx.strokeStyle = rate ? "#ff4757" : "rgba(255,255,255,0.14)"; ctx.lineWidth = rate ? 3 : 1.5; ctx.stroke();
      ctx.fillStyle = rate ? "#ff4757" : "rgba(255,255,255,0.35)";
      ctx.beginPath(); ctx.arc(x + t / 2, y + t / 2 + 3, t * 0.22, 0, Math.PI * 2); ctx.fill();
      ctx.lineWidth = 3; ctx.strokeStyle = ctx.fillStyle;
      ctx.beginPath(); ctx.moveTo(x + t / 2 + 8, y + t * 0.3); ctx.lineTo(x + t / 2 + 16, y + t * 0.18); ctx.stroke();
    } else {
      ctx.fillStyle = "rgba(120,140,255,0.10)"; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.10)"; ctx.lineWidth = 1.5; ctx.stroke();
    }
  }

  const px = 566, py = 92, pw = 384, ph = 362;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("GRILLE", px + 28, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(28, true);
  ctx.fillText(`${mines} mines · ${ouvertes.length} ouverte${ouvertes.length > 1 ? "s" : ""}`, px + 28, py + 82);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 28, py + 104); ctx.lineTo(px + pw - 28, py + 104); ctx.stroke();

  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("MULTIPLICATEUR", px + 28, py + 138);
  ctx.fillStyle = saute ? "#ff4757" : P.orClair; ctx.font = f(46, true);
  ctx.fillText(`×${mult.toFixed(2)}`, px + 28, py + 190);
  ctx.fillStyle = P.faible; ctx.font = f(15);
  ctx.fillText(`soit ${nb(Math.floor(mise * mult))} si tu encaisses`, px + 28, py + 218);

  if (termine) verdict(ctx, px + 28, py + 288, pw - 56, !saute, saute ? mise : gain,
    saute ? "Une mine de trop…" : "Encaissé au bon moment.");
  else { ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = `italic ${f(15)}`;
    ctx.fillText("Ouvre encore, ou encaisse.", px + 28, py + 296); }
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                                 DÉS                                        */
/* ========================================================================== */

function renderDice({ tirage, seuil, dessus, chance, mult, mise, gain, joueur, solde , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 460;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "DES", joueur, mise, avatar);
  const gagne = gain > 0;

  const bx = 60, bw = 460, by = 210;
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("1", bx, by + 46); ctx.textAlign = "right";
  ctx.fillText("100", bx + bw, by + 46); ctx.textAlign = "left";

  arrondi(ctx, bx, by, bw, 16, 8);
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  const coupe = bx + (bw * seuil) / 100;
  arrondi(ctx, dessus ? coupe : bx, by, dessus ? bx + bw - coupe : coupe - bx, 16, 8);
  ctx.fillStyle = "rgba(61,220,132,0.45)"; ctx.fill();

  ctx.strokeStyle = P.orClair; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(coupe, by - 12); ctx.lineTo(coupe, by + 28); ctx.stroke();
  ctx.fillStyle = P.orClair; ctx.font = f(14, true); ctx.textAlign = "center";
  ctx.fillText(String(seuil), coupe, by - 20);

  const tx = bx + (bw * (tirage - 1)) / 99;
  ctx.save(); ctx.shadowColor = gagne ? P.vertClair : "#ff4757"; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(tx, by + 8, 15, 0, Math.PI * 2);
  ctx.fillStyle = gagne ? P.vertClair : "#ff4757"; ctx.fill(); ctx.restore();
  ctx.fillStyle = P.texte; ctx.font = f(60, true);
  ctx.fillText(String(tirage), bx + bw / 2, by - 70);
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(dessus ? `plus haut que ${seuil}` : `plus bas que ${seuil}`, bx + bw / 2, by - 40);
  ctx.textAlign = "left";

  const px = 566, py = 92, pw = 384, ph = 300;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("CHANCE", px + 28, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(34, true);
  ctx.fillText(`${Math.round(chance * 100)} %`, px + 28, py + 84);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("GAIN", px + 210, py + 44);
  ctx.fillStyle = P.orClair; ctx.font = f(34, true);
  ctx.fillText(`×${mult.toFixed(2)}`, px + 210, py + 84);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 28, py + 108); ctx.lineTo(px + pw - 28, py + 108); ctx.stroke();

  verdict(ctx, px + 28, py + 190, pw - 56, gagne, gagne ? gain : mise,
    gagne ? "Le dé est de ton côté." : "Le dé en a décidé autrement.");
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                            PILE OU FACE                                    */
/* ========================================================================== */

function renderFlip({ sortie, choix, mise, gain, joueur, solde , avatar}) {
  if (!PRET) return null;
  const L = 1000, H = 440;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "PILE OU FACE", joueur, mise, avatar);
  const gagne = gain > 0;

  const cx = 270, cy = 260, R = 100;
  ctx.save(); ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 26;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
  const met = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
  met.addColorStop(0, "#f5d76e"); met.addColorStop(0.5, "#c9a227"); met.addColorStop(1, "#f5d76e");
  ctx.fillStyle = met; ctx.fill(); ctx.restore();
  ctx.beginPath(); ctx.arc(cx, cy, R - 12, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.25)"; ctx.lineWidth = 3; ctx.stroke();

  ctx.fillStyle = "#3a2a00"; ctx.textAlign = "center";
  if (sortie === "pile") {
    ctx.font = f(56, true); ctx.fillText("N", cx, cy + 20);
  } else {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 44); ctx.lineTo(cx - 34, cy - 8); ctx.lineTo(cx - 22, cy + 40);
    ctx.lineTo(cx + 22, cy + 40); ctx.lineTo(cx + 34, cy - 8);
    ctx.closePath(); ctx.fill();
  }
  ctx.fillStyle = P.texte; ctx.font = f(26, true);
  ctx.fillText(sortie === "pile" ? "PILE" : "FACE", cx, cy + R + 46);
  ctx.textAlign = "left";

  const px = 566, py = 92, pw = 384, ph = 280;
  cadre(ctx, px, py, pw, ph);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("TON CHOIX", px + 28, py + 44);
  ctx.fillStyle = P.texte; ctx.font = f(34, true);
  ctx.fillText(propre(choix).toUpperCase(), px + 28, py + 86);
  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(px + 28, py + 110); ctx.lineTo(px + pw - 28, py + 110); ctx.stroke();
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText("Gain ×1,96 — la pièce est équilibrée", px + 28, py + 140);

  verdict(ctx, px + 28, py + 200, pw - 56, gagne, gagne ? gain : mise,
    gagne ? "Bien vu." : "Raté d'un côté.");
  pied(ctx, L, H, solde);
  return c.toBuffer("image/png");
}


/* ========================================================================== */
/*                        FICHE DE MODÉRATION                                 */
/* ========================================================================== */

/** Petite tuile de statistique. */
function tuile(ctx, x, y, w, h, titre, valeur, teinte) {
  arrondi(ctx, x, y, w, h, 14);
  ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = P.bord; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = teinte ?? P.orClair; ctx.fillRect(x, y + 12, 3, h - 24);
  ctx.textAlign = "left";
  ctx.fillStyle = P.faible; ctx.font = f(12);
  ctx.fillText(propre(titre).toUpperCase(), x + 16, y + 26);
  ctx.fillStyle = P.texte; ctx.font = f(23, true);
  ctx.fillText(propre(valeur), x + 16, y + 55);
}

/** Compteur de sanction, cerclé, coloré selon la gravité. */
function jeton(ctx, cx, cy, r, n, libelle, teinte) {
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = n > 0 ? `${teinte}22` : "rgba(255,255,255,0.04)"; ctx.fill();
  ctx.strokeStyle = n > 0 ? teinte : "rgba(255,255,255,0.12)"; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = n > 0 ? teinte : P.faible; ctx.font = f(26, true);
  ctx.fillText(String(n), cx, cy + 9);
  ctx.fillStyle = P.faible; ctx.font = f(12);
  ctx.fillText(propre(libelle).toUpperCase(), cx, cy + r + 22);
  ctx.textAlign = "left";
}

/**
 * Tout ce qu'on sait d'un membre, sur une seule image.
 */
function renderMemberCard({
  pseudo, tag, identifiant, rang, immunise, muetJusqua, alcatraz,
  coins, niveau, xp, minutesVocal, messages, invitations, grade,
  avertissements, timeouts, expulsions, bannissements,
  compteCree, arriveLe, roles, rolesNoms, avatar, serveur,
}) {
  if (!PRET) return null;
  const L = 1000, H = 620;
  const { c, ctx } = scene(L, H);

  ctx.textAlign = "left";
  ctx.fillStyle = P.texte; ctx.font = f(24, true);
  ctx.fillText("F I C H E   D E   M O D É R A T I O N", 40, 48);
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(propre(serveur ?? ""), 40, 70);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 88); ctx.lineTo(L - 40, 88); ctx.stroke();

  /* ------------------------- colonne d'identité ------------------------- */
  const gx = 40, gy = 110, gw = 300, gh = 380;
  cadre(ctx, gx, gy, gw, gh);

  const ax = gx + gw / 2, ay = gy + 92;
  if (avatar) {
    ctx.save();
    ctx.beginPath(); ctx.arc(ax, ay, 58, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    try { ctx.drawImage(avatar, ax - 58, ay - 58, 116, 116); } catch { /* image illisible */ }
    ctx.restore();
  } else {
    ctx.beginPath(); ctx.arc(ax, ay, 58, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  }
  ctx.beginPath(); ctx.arc(ax, ay, 58, 0, Math.PI * 2);
  ctx.strokeStyle = muetJusqua || alcatraz ? "#ff4757" : "rgba(212,175,55,0.75)";
  ctx.lineWidth = 3; ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = P.texte; ctx.font = f(24, true);
  ctx.fillText(propre(pseudo).slice(0, 20), ax, ay + 96);
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(propre(tag).slice(0, 28), ax, ay + 118);
  ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText(String(identifiant), ax, ay + 138);

  // bandeau du niveau de permission
  const bw = gw - 60, bx2 = gx + 30, by2 = ay + 156;
  arrondi(ctx, bx2, by2, bw, 34, 17);
  ctx.fillStyle = "rgba(212,175,55,0.16)"; ctx.fill();
  ctx.fillStyle = P.orClair; ctx.font = f(15, true);
  ctx.fillText(propre(rang).toUpperCase().slice(0, 26), gx + gw / 2, by2 + 23);

  if (grade) {
    arrondi(ctx, bx2, by2 + 44, bw, 32, 16);
    ctx.fillStyle = "rgba(123,47,247,0.18)"; ctx.fill();
    ctx.fillStyle = "#c9a6ff"; ctx.font = f(14, true);
    ctx.fillText(propre(grade).slice(0, 28), gx + gw / 2, by2 + 66);
  }
  ctx.textAlign = "left";

  /* ---------------------------- alertes --------------------------------- */
  let ay2 = gy + gh + 18;
  const alerte = (txt, teinte) => {
    arrondi(ctx, gx, ay2, gw, 34, 10);
    ctx.fillStyle = `${teinte}22`; ctx.fill();
    ctx.strokeStyle = teinte; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.fillStyle = teinte; ctx.font = f(14, true);
    ctx.fillText(propre(txt).slice(0, 34), gx + 14, ay2 + 22);
    ay2 += 42;
  };
  if (alcatraz) alerte("Enfermé en Alcatraz", "#ff4757");
  if (muetJusqua) alerte(`Muet jusqu'au ${muetJusqua}`, "#ffa502");
  if (immunise) alerte("Immunisé — Administrateur", "#f5c518");

  /* --------------------------- tuiles de stats -------------------------- */
  const tx = 366, tw = 190, th = 74, tg = 12;
  const stats = [
    ["Coins", coins < 0 ? `− ${nb(-coins)}` : nb(coins), coins < 0 ? "#ff4757" : P.orClair],
    ["Niveau", `${niveau}  ·  ${nb(xp)} XP`, "#7b2ff7"],
    ["Temps vocal", minutesVocal >= 60 ? `${Math.floor(minutesVocal / 60)} h ${minutesVocal % 60} min` : `${minutesVocal} min`, "#00d4ff"],
    ["Messages", nb(messages), "#3ddc84"],
    ["Invitations", nb(invitations), "#ff2d95"],
    ["Rôles", nb(roles), "#c9cee0"],
  ];
  stats.forEach(([titre, valeur, teinte], n) => {
    const x = tx + (n % 3) * (tw + tg), y = 110 + Math.floor(n / 3) * (th + tg);
    tuile(ctx, x, y, tw, th, titre, valeur, teinte);
  });

  /* ---------------------------- sanctions ------------------------------- */
  const sx = tx, sy = 110 + 2 * (th + tg) + 14, sw = 3 * tw + 2 * tg, sh = 150;
  cadre(ctx, sx, sy, sw, sh);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("SANCTIONS", sx + 24, sy + 40);

  const jetons = [
    [avertissements, "Avertis.", "#ffa502"],
    [timeouts, "Silences", "#00d4ff"],
    [expulsions, "Expulsions", "#ff7f50"],
    [bannissements, "Bans", "#ff4757"],
  ];
  jetons.forEach(([n, lib, teinte], k) => {
    jeton(ctx, sx + 90 + k * 140, sy + 88, 30, n, lib, teinte);
  });

  /* ------------------------------ dates --------------------------------- */
  const dy = sy + sh + 16;
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("COMPTE CRÉÉ", sx + 4, dy + 16);
  ctx.fillText("A REJOINT LE", sx + 300, dy + 16);
  ctx.fillStyle = P.texte; ctx.font = f(16, true);
  ctx.fillText(propre(compteCree), sx + 4, dy + 40);
  ctx.fillText(propre(arriveLe), sx + 300, dy + 40);

  /* --------------------------- liste des rôles -------------------------- */
  if (rolesNoms?.length) {
    ctx.fillStyle = P.faible; ctx.font = f(13);
    ctx.fillText("RÔLES PORTÉS", sx + 4, dy + 76);
    let px2 = sx + 4, py2 = dy + 92;
    for (const nom of rolesNoms.slice(0, 12)) {
      const libelle = propre(nom).slice(0, 22);
      if (!libelle) continue;
      ctx.font = f(13);
      const lw = ctx.measureText(libelle).width + 22;
      if (px2 + lw > L - 40) { px2 = sx + 4; py2 += 30; }
      if (py2 > H - 46) break;
      arrondi(ctx, px2, py2, lw, 24, 12);
      ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
      ctx.strokeStyle = P.bord; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#c9cee0"; ctx.fillText(libelle, px2 + 11, py2 + 16);
      px2 += lw + 8;
    }
  }

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 24);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}


/* ========================================================================== */
/*                              BOUTIQUE                                      */
/* ========================================================================== */

/** Pictogramme dessiné pour chaque type d'article. */
function iconeArticle(ctx, type, cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  if (type === "pardon") {
    ctx.fillStyle = "#8ec7ff";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.5); ctx.quadraticCurveTo(r * 0.7, -r * 0.1, 0, r * 0.6);
    ctx.quadraticCurveTo(-r * 0.7, -r * 0.1, 0, -r * 0.5);
    ctx.closePath(); ctx.fill();
  } else if (type === "xp") {
    ctx.strokeStyle = "#7b2ff7"; ctx.lineWidth = r * 0.24; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-r * 0.55, r * 0.4); ctx.lineTo(-r * 0.15, -r * 0.1);
    ctx.lineTo(r * 0.15, r * 0.15); ctx.lineTo(r * 0.6, -r * 0.5);
    ctx.stroke();
  } else if (type === "multiplier") {
    ctx.fillStyle = "#ff7f50";
    ctx.beginPath();
    ctx.moveTo(0, -r * 0.65); ctx.lineTo(r * 0.4, r * 0.05);
    ctx.lineTo(r * 0.14, r * 0.05); ctx.lineTo(r * 0.2, r * 0.65);
    ctx.lineTo(-r * 0.4, -r * 0.05); ctx.lineTo(-r * 0.12, -r * 0.05);
    ctx.closePath(); ctx.fill();
  } else if (type === "customrole") {
    etoile(ctx, 0, 0, r * 0.62, "#ff2d95");
  } else {
    ctx.fillStyle = "#3ddc84";
    ctx.beginPath(); ctx.arc(0, -r * 0.18, r * 0.34, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(0, r * 0.55, r * 0.58, r * 0.36, 0, Math.PI, 0); ctx.fill();
  }
  ctx.restore();
}

const NOM_TYPE = { pardon: "Pardon", xp: "Expérience", multiplier: "Multiplicateur",
                   customrole: "Rôle personnalisé", role: "Rôle du serveur" };

function renderShop({ articles, solde, joueur, avatar, serveur, monnaie }) {
  if (!PRET) return null;
  const lignes = Math.ceil(Math.min(articles.length, 8) / 2) || 1;
  const L = 1000, H = 150 + lignes * 108 + 40;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "BOUTIQUE", joueur, undefined, avatar);

  // solde en haut à droite
  const bx = L - 230;
  arrondi(ctx, bx, 28, 190, 34, 17);
  ctx.fillStyle = "rgba(212,175,55,0.16)"; ctx.fill();
  piece(ctx, bx + 22, 45, 11);
  ctx.fillStyle = solde < 0 ? "#ff4757" : P.orClair; ctx.font = f(15, true);
  ctx.textAlign = "left";
  ctx.fillText(solde < 0 ? `− ${nb(-solde)}` : nb(solde), bx + 40, 51);

  if (!articles.length) {
    ctx.fillStyle = P.faible; ctx.font = f(18); ctx.textAlign = "center";
    ctx.fillText("La boutique est vide pour le moment.", L / 2, H / 2);
    ctx.textAlign = "left";
    return c.toBuffer("image/png");
  }

  const cw = 450, ch = 96, gx = 40, gy = 118, gap = 20;
  articles.slice(0, 8).forEach((a, n) => {
    const x = gx + (n % 2) * (cw + gap), y = gy + Math.floor(n / 2) * (ch + 12);
    const abordable = solde >= a.prix;

    arrondi(ctx, x, y, cw, ch, 16);
    ctx.fillStyle = abordable ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.02)"; ctx.fill();
    ctx.strokeStyle = abordable ? P.bord : "rgba(255,255,255,0.05)"; ctx.lineWidth = 1.5; ctx.stroke();

    // vignette du type
    arrondi(ctx, x + 14, y + 16, 64, 64, 14);
    ctx.fillStyle = abordable ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.03)"; ctx.fill();
    ctx.globalAlpha = abordable ? 1 : 0.4;
    iconeArticle(ctx, a.type, x + 46, y + 48, 22);
    ctx.globalAlpha = 1;

    ctx.textAlign = "left";
    ctx.fillStyle = abordable ? P.texte : "rgba(255,255,255,0.4)"; ctx.font = f(19, true);
    ctx.fillText(propre(a.nom).slice(0, 26), x + 92, y + 40);
    ctx.fillStyle = P.faible; ctx.font = f(13);
    ctx.fillText(NOM_TYPE[a.type] ?? "Article", x + 92, y + 62);

    // prix
    ctx.textAlign = "right";
    ctx.fillStyle = abordable ? P.orClair : "#8a6f2a"; ctx.font = f(21, true);
    ctx.fillText(nb(a.prix), x + cw - 20, y + 46);
    ctx.fillStyle = abordable ? "rgba(61,220,132,0.8)" : "rgba(255,71,87,0.75)"; ctx.font = f(12, true);
    ctx.fillText(abordable ? "ACHETABLE" : `IL MANQUE ${nb(a.prix - solde)}`, x + cw - 20, y + 68);
    ctx.textAlign = "left";
  });

  if (articles.length > 8) {
    ctx.fillStyle = P.tres; ctx.font = f(13); ctx.textAlign = "center";
    ctx.fillText(`… et ${articles.length - 8} autre(s) article(s) dans le menu`, L / 2, H - 26);
    ctx.textAlign = "left";
  }
  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText(`0x • ${propre(serveur ?? "")}`, L - 30, H - 20);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                             CLASSEMENT                                     */
/* ========================================================================== */

/**
 * Podium pour les trois premiers, puis les suivants en lignes.
 * `entrees` : [{ nom, valeur, avatar }]
 */
function renderLeaderboard({ titre, unite, entrees, serveur, moi }) {
  if (!PRET) return null;
  const suite = entrees.slice(3, 10);
  // 288 pour le podium, 76 avant la première ligne, 46 par ligne, 46 de pied
  const L = 1000, H = 288 + 76 + Math.max(1, suite.length) * 46 + 46;
  const { c, ctx } = scene(L, H);

  ctx.textAlign = "left";
  ctx.fillStyle = P.texte; ctx.font = f(26, true);
  ctx.fillText(propre(titre).split("").join(" "), 40, 50);
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(propre(serveur ?? ""), 40, 72);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 88); ctx.lineTo(L - 40, 88); ctx.stroke();

  const podium = [
    { i: 1, x: 500, h: 128, teinte: "#f5c518", r: 52 },
    { i: 0, x: 340, h: 96,  teinte: "#c0c6d4", r: 44 },
    { i: 2, x: 660, h: 74,  teinte: "#cd7f32", r: 44 },
  ];
  const sol = 288;
  for (const { i: idx, x, h, teinte, r } of podium) {
    const e = entrees[idx === 1 ? 0 : idx === 0 ? 1 : 2];
    if (!e) continue;
    const rang = idx === 1 ? 1 : idx === 0 ? 2 : 3;

    arrondi(ctx, x - 66, sol - h, 132, h, 10);
    const g = ctx.createLinearGradient(x, sol - h, x, sol);
    g.addColorStop(0, `${teinte}44`); g.addColorStop(1, "rgba(255,255,255,0.03)");
    ctx.fillStyle = g; ctx.fill();
    ctx.strokeStyle = `${teinte}88`; ctx.lineWidth = 1.5; ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = teinte; ctx.font = f(30, true);
    ctx.fillText(String(rang), x, sol - h / 2 + 12);

    const ay = sol - h - r - 14;
    if (e.avatar) {
      ctx.save();
      ctx.beginPath(); ctx.arc(x, ay, r, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
      try { ctx.drawImage(e.avatar, x - r, ay - r, r * 2, r * 2); } catch { /* illisible */ }
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(x, ay, r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
    }
    ctx.beginPath(); ctx.arc(x, ay, r, 0, Math.PI * 2);
    ctx.strokeStyle = teinte; ctx.lineWidth = 3.5; ctx.stroke();

    ctx.fillStyle = P.texte; ctx.font = f(16, true);
    ctx.fillText(propre(e.nom).slice(0, 16), x, sol + 26);
    ctx.fillStyle = teinte; ctx.font = f(17, true);
    ctx.fillText(`${nb(e.valeur)} ${propre(unite)}`, x, sol + 48);
  }
  ctx.textAlign = "left";

  let y = sol + 76;
  suite.forEach((e, n) => {
    const rang = n + 4;
    const moiCest = moi && e.nom === moi;
    arrondi(ctx, 40, y, L - 80, 38, 10);
    ctx.fillStyle = moiCest ? "rgba(123,47,247,0.18)" : "rgba(255,255,255,0.035)"; ctx.fill();
    if (moiCest) { ctx.strokeStyle = "#7b2ff7"; ctx.lineWidth = 1.5; ctx.stroke(); }
    ctx.fillStyle = P.faible; ctx.font = f(15, true);
    ctx.fillText(`${rang}.`, 58, y + 25);
    ctx.fillStyle = P.texte; ctx.font = f(15);
    ctx.fillText(propre(e.nom).slice(0, 34), 96, y + 25);
    ctx.textAlign = "right";
    ctx.fillStyle = P.orClair; ctx.font = f(16, true);
    ctx.fillText(`${nb(e.valeur)} ${propre(unite)}`, L - 58, y + 25);
    ctx.textAlign = "left";
    y += 46;
  });

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 20);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                          PROFIL PUBLIC                                     */
/* ========================================================================== */

/** Barre de progression avec son étiquette. */
function jauge(ctx, x, y, w, valeur, total, teinte, gauche, droite) {
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.textAlign = "left"; ctx.fillText(propre(gauche), x, y - 10);
  ctx.textAlign = "right"; ctx.fillText(propre(droite), x + w, y - 10);
  ctx.textAlign = "left";
  arrondi(ctx, x, y, w, 14, 7);
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  const part = total > 0 ? Math.max(0, Math.min(1, valeur / total)) : 0;
  if (part > 0.01) {
    arrondi(ctx, x, y, Math.max(14, w * part), 14, 7);
    ctx.fillStyle = teinte; ctx.fill();
  }
}

function renderProfile({
  pseudo, avatar, grade, gradeSuivant, heures, heuresCible, messages, messagesCible,
  coins, niveau, xp, xpNiveau, xpSuivant, rang, serveur, monnaie,
}) {
  if (!PRET) return null;
  const L = 1000, H = 480;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "PROFIL", pseudo, undefined, avatar);

  arrondi(ctx, 40, 112, 280, 150, 16);
  ctx.fillStyle = "rgba(255,255,255,0.045)"; ctx.fill();
  ctx.strokeStyle = P.bord; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.textAlign = "center";
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("GRADE ACTUEL", 180, 140);
  ctx.fillStyle = P.orClair; ctx.font = f(24, true);
  ctx.fillText(propre(grade ?? "aucun").slice(0, 20), 180, 176);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText(rang ? `${rang} au classement` : "", 180, 202);
  piece(ctx, 128, 232, 13);
  ctx.textAlign = "left";
  ctx.fillStyle = coins < 0 ? "#ff4757" : P.texte; ctx.font = f(20, true);
  ctx.fillText(coins < 0 ? `− ${nb(-coins)}` : nb(coins), 148, 239);

  const px = 350, pw = L - 350 - 40;
  arrondi(ctx, px, 112, pw, 150, 16);
  ctx.fillStyle = "rgba(255,255,255,0.045)"; ctx.fill();
  ctx.strokeStyle = P.bord; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText(gradeSuivant ? `PROCHAIN GRADE — ${propre(gradeSuivant).toUpperCase()}` : "SOMMET DE L'ÉCHELLE ATTEINT", px + 24, 140);

  if (gradeSuivant) {
    jauge(ctx, px + 24, 174, pw - 48, heures, heuresCible, "#00d4ff",
      "Temps vocal", `${Math.floor(heures)} h / ${heuresCible} h`);
    jauge(ctx, px + 24, 226, pw - 48, messages, messagesCible, "#3ddc84",
      "Messages", `${nb(messages)} / ${nb(messagesCible)}`);
  } else {
    ctx.fillStyle = P.orClair; ctx.font = f(22, true);
    ctx.fillText("Rien au-dessus.", px + 24, 200);
  }

  arrondi(ctx, 40, 288, L - 80, 120, 16);
  ctx.fillStyle = "rgba(255,255,255,0.045)"; ctx.fill();
  ctx.strokeStyle = P.bord; ctx.lineWidth = 1.5; ctx.stroke();
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText(`NIVEAU ${niveau}`, 64, 318);
  ctx.textAlign = "right";
  ctx.fillStyle = P.texte; ctx.font = f(14);
  ctx.fillText(`${nb(xp)} XP au total`, L - 64, 318);
  ctx.textAlign = "left";
  jauge(ctx, 64, 350, L - 128, xpNiveau, xpSuivant, "#7b2ff7",
    "Progression du niveau", `${nb(xpNiveau)} / ${nb(xpSuivant)} XP`);

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText(`0x • ${propre(serveur ?? "")}`, L - 30, H - 20);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}


/* ========================================================================== */
/*                              BIENVENUE                                     */
/* ========================================================================== */

function renderWelcome({ pseudo, avatar, serveur, numero, invitePar, membres }) {
  if (!PRET) return null;
  const L = 1000, H = 400;
  const { c, ctx } = scene(L, H);

  // halo derrière l'avatar
  const cx = 190, cy = 190;
  const halo = ctx.createRadialGradient(cx, cy, 20, cx, cy, 150);
  halo.addColorStop(0, "rgba(123,47,247,0.35)"); halo.addColorStop(1, "rgba(123,47,247,0)");
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, 150, 0, Math.PI * 2); ctx.fill();

  if (avatar) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    try { ctx.drawImage(avatar, cx - 88, cy - 88, 176, 176); } catch { /* illisible */ }
    ctx.restore();
  } else {
    ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  }
  const anneau = ctx.createLinearGradient(cx - 88, cy - 88, cx + 88, cy + 88);
  anneau.addColorStop(0, P.arc[0]); anneau.addColorStop(0.5, P.arc[1]); anneau.addColorStop(1, P.arc[2]);
  ctx.beginPath(); ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  ctx.strokeStyle = anneau; ctx.lineWidth = 5; ctx.stroke();

  // pastille du rang d'arrivée
  if (numero) {
    ctx.beginPath(); ctx.arc(cx + 66, cy + 66, 30, 0, Math.PI * 2);
    ctx.fillStyle = P.orClair; ctx.fill();
    ctx.fillStyle = P.fond1; ctx.font = f(numero > 999 ? 15 : 19, true);
    ctx.textAlign = "center"; ctx.fillText(`#${nb(numero)}`, cx + 66, cy + 73);
  }

  ctx.textAlign = "left";
  const tx = 340;
  ctx.fillStyle = P.faible; ctx.font = f(17);
  ctx.fillText("B I E N V E N U E   S U R", tx, 118);
  ctx.fillStyle = P.texte; ctx.font = f(42, true);
  ctx.fillText(propre(serveur).slice(0, 22), tx, 170);

  const bandeau = ctx.createLinearGradient(tx, 0, tx + 260, 0);
  bandeau.addColorStop(0, P.arc[1]); bandeau.addColorStop(1, P.arc[2]);
  ctx.fillStyle = bandeau; ctx.fillRect(tx, 186, 260, 3);

  ctx.fillStyle = P.orClair; ctx.font = f(32, true);
  ctx.fillText(propre(pseudo).slice(0, 22), tx, 240);

  ctx.fillStyle = P.faible; ctx.font = f(16);
  const lignes = [];
  if (numero) lignes.push(`${nb(numero)}ᵉ membre à nous rejoindre`);
  if (invitePar) lignes.push(`Invité par ${propre(invitePar).slice(0, 20)}`);
  if (membres) lignes.push(`${nb(membres)} personnes ici`);
  lignes.slice(0, 3).forEach((l, n) => ctx.fillText(l, tx, 278 + n * 26));

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 22);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                       MONTÉE DE GRADE OU DE NIVEAU                         */
/* ========================================================================== */

function renderPromotion({ pseudo, avatar, titre, ancien, nouveau, detail, teinte }) {
  if (!PRET) return null;
  const L = 1000, H = 320;
  const { c, ctx } = scene(L, H);
  const t = teinte ?? "#f5c518";

  const cx = 130, cy = 160;
  const halo = ctx.createRadialGradient(cx, cy, 10, cx, cy, 110);
  halo.addColorStop(0, `${t}55`); halo.addColorStop(1, `${t}00`);
  ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, 110, 0, Math.PI * 2); ctx.fill();

  if (avatar) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 66, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    try { ctx.drawImage(avatar, cx - 66, cy - 66, 132, 132); } catch { /* illisible */ }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 66, 0, Math.PI * 2);
  ctx.strokeStyle = t; ctx.lineWidth = 4; ctx.stroke();

  ctx.textAlign = "left";
  ctx.fillStyle = t; ctx.font = f(15, true);
  ctx.fillText(propre(titre).toUpperCase().split("").join(" "), 240, 96);
  ctx.fillStyle = P.texte; ctx.font = f(30, true);
  ctx.fillText(propre(pseudo).slice(0, 22), 240, 136);

  // ancien → nouveau
  const y = 190;
  if (ancien) {
    ctx.fillStyle = P.faible; ctx.font = f(20);
    const w = ctx.measureText(propre(ancien)).width;
    ctx.fillText(propre(ancien).slice(0, 18), 240, y);
    ctx.strokeStyle = P.faible; ctx.lineWidth = 2; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(252 + w, y - 7); ctx.lineTo(292 + w, y - 7);
    ctx.lineTo(282 + w, y - 15); ctx.moveTo(292 + w, y - 7); ctx.lineTo(282 + w, y + 1);
    ctx.stroke();
    ctx.fillStyle = t; ctx.font = f(26, true);
    ctx.fillText(propre(nouveau).slice(0, 20), 306 + w, y);
  } else {
    ctx.fillStyle = t; ctx.font = f(30, true);
    ctx.fillText(propre(nouveau).slice(0, 24), 240, y);
  }

  if (detail) {
    ctx.fillStyle = P.faible; ctx.font = f(16);
    ctx.fillText(propre(detail).slice(0, 60), 240, 232);
  }

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 22);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                              SANCTION                                      */
/* ========================================================================== */

const TEINTE_SANCTION = {
  warn: "#ffa502", timeout: "#00d4ff", kick: "#ff7f50",
  ban: "#ff4757", jail: "#9b59b6", unban: "#3ddc84", untimeout: "#3ddc84",
};
const NOM_SANCTION = {
  warn: "Avertissement", timeout: "Réduction au silence", kick: "Expulsion",
  ban: "Bannissement", jail: "Alcatraz", unban: "Débannissement", untimeout: "Parole rendue",
};

function renderSanction({ type, pseudo, avatar, raison, moderateur, duree, total, serveur }) {
  if (!PRET) return null;
  const L = 1000, H = 400;
  const { c, ctx } = scene(L, H);
  const t = TEINTE_SANCTION[type] ?? "#ff4757";

  // bande verticale colorée
  ctx.fillStyle = t; ctx.fillRect(0, 0, 6, H);

  ctx.textAlign = "left";
  ctx.fillStyle = t; ctx.font = f(15, true);
  ctx.fillText((NOM_SANCTION[type] ?? "Sanction").toUpperCase().split("").join(" "), 40, 52);
  ctx.fillStyle = P.faible; ctx.font = f(14);
  ctx.fillText(propre(serveur ?? ""), 40, 74);
  ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 92); ctx.lineTo(L - 40, 92); ctx.stroke();

  const cx = 118, cy = 200;
  if (avatar) {
    ctx.save();
    ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    try { ctx.drawImage(avatar, cx - 62, cy - 62, 124, 124); } catch { /* illisible */ }
    ctx.restore();
  }
  ctx.beginPath(); ctx.arc(cx, cy, 62, 0, Math.PI * 2);
  ctx.strokeStyle = t; ctx.lineWidth = 4; ctx.stroke();

  ctx.textAlign = "center";
  ctx.fillStyle = P.texte; ctx.font = f(20, true);
  ctx.fillText(propre(pseudo).slice(0, 18), cx, cy + 96);
  ctx.textAlign = "left";

  const px = 240, pw = L - 240 - 40;
  cadre(ctx, px, 120, pw, 210);

  const champ = (titre, valeur, y, grand = false) => {
    ctx.fillStyle = P.faible; ctx.font = f(12);
    ctx.fillText(propre(titre).toUpperCase(), px + 26, y);
    ctx.fillStyle = P.texte; ctx.font = f(grand ? 20 : 17, grand);
    const texte = propre(valeur) || "—";
    // repli sur deux lignes si la raison est longue
    const max = pw - 52;
    if (ctx.measureText(texte).width > max) {
      const mots = texte.split(" "); let ligne = "", ly = y + 26;
      for (const m of mots) {
        if (ctx.measureText(`${ligne} ${m}`).width > max) { ctx.fillText(ligne, px + 26, ly); ligne = m; ly += 24; }
        else ligne = ligne ? `${ligne} ${m}` : m;
        if (ly > y + 52) break;
      }
      if (ligne) ctx.fillText(ligne, px + 26, ly);
    } else ctx.fillText(texte, px + 26, y + 26);
  };

  champ("Raison", raison, 156, true);
  champ("Par", moderateur, 238);
  if (duree) {
    ctx.fillStyle = P.faible; ctx.font = f(12);
    ctx.fillText("DURÉE", px + pw / 2 + 20, 238);
    ctx.fillStyle = t; ctx.font = f(17, true);
    ctx.fillText(propre(duree), px + pw / 2 + 20, 264);
  }
  if (total !== undefined && total !== null) {
    ctx.fillStyle = P.faible; ctx.font = f(12);
    ctx.fillText("TOTAL AU CASIER", px + 26, 300);
    ctx.fillStyle = t; ctx.font = f(17, true);
    ctx.fillText(`${nb(total)} sanction${total > 1 ? "s" : ""}`, px + 26, 322);
  }

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 22);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                          ARRIÈRE-SALLE                                     */
/* ========================================================================== */

function renderCrime({ coup, reussi, gain, perte, solde, pression, chance, joueur, avatar, phrase }) {
  if (!PRET) return null;
  const L = 1000, H = 460;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "ARRIERE-SALLE", joueur, undefined, avatar);

  const px = 40, pw = 480;
  cadre(ctx, px, 112, pw, 300);
  ctx.textAlign = "left";
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("LE COUP", px + 28, 150);
  ctx.fillStyle = P.texte; ctx.font = f(30, true);
  ctx.fillText(propre(coup).slice(0, 24), px + 28, 190);

  ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.font = `italic ${f(15)}`;
  const mots = propre(phrase ?? "").split(" ");
  let ligne = "", ly = 230;
  for (const m of mots) {
    if (ctx.measureText(`${ligne} ${m}`).width > pw - 56) { ctx.fillText(ligne, px + 28, ly); ligne = m; ly += 24; }
    else ligne = ligne ? `${ligne} ${m}` : m;
    if (ly > 278) break;
  }
  if (ligne) ctx.fillText(ligne, px + 28, ly);

  // jauge de pression policière
  ctx.fillStyle = P.faible; ctx.font = f(12);
  ctx.fillText("PRESSION POLICIÈRE", px + 28, 320);
  ctx.textAlign = "right";
  ctx.fillText(`${pression}/100`, px + pw - 28, 320);
  ctx.textAlign = "left";
  arrondi(ctx, px + 28, 332, pw - 56, 14, 7);
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  const part = Math.max(0, Math.min(1, pression / 100));
  if (part > 0.01) {
    arrondi(ctx, px + 28, 332, Math.max(14, (pw - 56) * part), 14, 7);
    ctx.fillStyle = pression > 66 ? "#ff4757" : pression > 33 ? "#ffa502" : "#3ddc84"; ctx.fill();
  }
  ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText(`${Math.round(chance * 100)} % de chances de t'en sortir`, px + 28, 372);

  const qx = 566, qw = 384;
  cadre(ctx, qx, 112, qw, 300);
  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText("RÉSULTAT", qx + 28, 150);

  ctx.fillStyle = reussi ? P.vertClair : "#ff4757";
  ctx.font = f(38, true);
  ctx.fillText(reussi ? "RÉUSSI" : "ATTRAPÉ", qx + 28, 198);

  ctx.font = f(30, true);
  ctx.fillText(`${reussi ? "+" : "−"} ${nb(reussi ? gain : perte)}`, qx + 28, 250);
  if (!reussi) {
    ctx.fillStyle = P.faible; ctx.font = f(14);
    ctx.fillText(`le double de ce que tu visais (${nb(gain)})`, qx + 28, 276);
  }

  ctx.strokeStyle = "rgba(255,255,255,0.08)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(qx + 28, 300); ctx.lineTo(qx + qw - 28, 300); ctx.stroke();

  ctx.fillStyle = P.faible; ctx.font = f(13);
  ctx.fillText(solde < 0 ? "TU DOIS" : "SOLDE", qx + 28, 330);
  piece(ctx, qx + 40, 362, 13);
  ctx.fillStyle = solde < 0 ? "#ff4757" : P.texte; ctx.font = f(26, true);
  ctx.fillText(solde < 0 ? nb(-solde) : nb(solde), qx + 62, 370);

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 22);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}


/* ========================================================================== */
/*                      DEVANTURE DE L'ARRIÈRE-SALLE                          */
/* ========================================================================== */

/** Pictogramme dessiné pour chaque coup. */
function iconeCoup(ctx, id, cx, cy, r) {
  ctx.save(); ctx.translate(cx, cy);
  if (id === "pickpocket") {
    ctx.fillStyle = "#b07a4a";
    ctx.beginPath();
    ctx.moveTo(-r * 0.5, -r * 0.1);
    ctx.quadraticCurveTo(-r * 0.62, r * 0.62, 0, r * 0.62);
    ctx.quadraticCurveTo(r * 0.62, r * 0.62, r * 0.5, -r * 0.1);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#8a5a2f"; ctx.lineWidth = r * 0.14;
    ctx.beginPath(); ctx.arc(0, -r * 0.15, r * 0.34, Math.PI, 0); ctx.stroke();
  } else if (id === "trafic") {
    ctx.fillStyle = "#e8574a";
    arrondi(ctx, -r * 0.55, -r * 0.34, r * 1.1, r * 0.68, r * 0.16); ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.beginPath(); ctx.arc(0, 0, r * 0.2, 0, Math.PI * 2); ctx.fill();
  } else if (id === "cambriolage") {
    ctx.fillStyle = "#7f8ba3";
    arrondi(ctx, -r * 0.56, -r * 0.46, r * 1.12, r * 0.92, r * 0.12); ctx.fill();
    ctx.strokeStyle = "#4a5468"; ctx.lineWidth = r * 0.12;
    ctx.beginPath(); ctx.arc(r * 0.08, 0, r * 0.26, 0, Math.PI * 2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(r * 0.08, 0); ctx.lineTo(r * 0.08, -r * 0.3); ctx.stroke();
  } else if (id === "truquer") {
    ctx.strokeStyle = "#c9cee0"; ctx.lineWidth = r * 0.24; ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(-r * 0.42, r * 0.42); ctx.lineTo(r * 0.24, -r * 0.24); ctx.stroke();
    ctx.fillStyle = "#c9cee0";
    ctx.beginPath(); ctx.arc(r * 0.36, -r * 0.36, r * 0.28, 0.6, 5.2); ctx.fill();
  } else {
    ctx.fillStyle = "#3ddc84";
    ctx.beginPath();
    ctx.moveTo(-r * 0.34, -r * 0.34);
    ctx.quadraticCurveTo(-r * 0.66, r * 0.6, 0, r * 0.6);
    ctx.quadraticCurveTo(r * 0.66, r * 0.6, r * 0.34, -r * 0.34);
    ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#1a0f2e"; ctx.font = f(Math.round(r * 0.6), true);
    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText("€", 0, r * 0.18);
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#2aa565"; ctx.fillRect(-r * 0.36, -r * 0.42, r * 0.72, r * 0.1);
  }
  ctx.restore();
}

/**
 * Le hall de l'arrière-salle : les coups possibles, leurs cotes du moment,
 * la pression policière et l'état du portefeuille.
 */
function renderCrimeLobby({ coups, solde, pression, joueur, avatar, monnaie }) {
  if (!PRET) return null;
  const L = 1000, H = 200 + coups.length * 78 + 40;
  const { c, ctx } = scene(L, H);
  entete(ctx, L, "ARRIERE-SALLE", joueur, undefined, avatar);

  // état du portefeuille, en haut à droite
  const bx = L - 250;
  arrondi(ctx, bx, 28, 210, 34, 17);
  ctx.fillStyle = solde < 0 ? "rgba(255,71,87,0.18)" : "rgba(212,175,55,0.16)"; ctx.fill();
  piece(ctx, bx + 22, 45, 11);
  ctx.textAlign = "left";
  ctx.fillStyle = solde < 0 ? "#ff4757" : P.orClair; ctx.font = f(15, true);
  ctx.fillText(solde < 0 ? `dette ${nb(-solde)}` : nb(solde), bx + 40, 51);

  // jauge de pression
  ctx.fillStyle = P.faible; ctx.font = f(12);
  ctx.fillText("PRESSION POLICIÈRE", 40, 118);
  ctx.textAlign = "right";
  ctx.fillText(`${pression}/100`, 520, 118);
  ctx.textAlign = "left";
  arrondi(ctx, 40, 128, 480, 12, 6);
  ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
  const part = Math.max(0, Math.min(1, pression / 100));
  if (part > 0.01) {
    arrondi(ctx, 40, 128, Math.max(12, 480 * part), 12, 6);
    ctx.fillStyle = pression > 66 ? "#ff4757" : pression > 33 ? "#ffa502" : "#3ddc84"; ctx.fill();
  }
  ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.textAlign = "right";
  ctx.fillText("Attrapé, tu rembourses le DOUBLE de ce que tu visais", L - 40, 136);
  ctx.textAlign = "left";

  // un coup par ligne
  coups.forEach((k, n) => {
    const y = 164 + n * 78;
    arrondi(ctx, 40, y, L - 80, 66, 14);
    ctx.fillStyle = "rgba(255,255,255,0.04)"; ctx.fill();
    ctx.strokeStyle = P.bord; ctx.lineWidth = 1; ctx.stroke();

    const teinte = k.chance >= 0.55 ? "#3ddc84" : k.chance >= 0.4 ? "#ffa502" : "#ff4757";
    ctx.fillStyle = teinte; ctx.fillRect(40, y + 10, 3, 46);

    arrondi(ctx, 58, y + 13, 40, 40, 10);
    ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fill();
    iconeCoup(ctx, k.id, 78, y + 33, 15);

    ctx.fillStyle = P.texte; ctx.font = f(19, true);
    ctx.fillText(propre(k.nom).slice(0, 26), 116, y + 30);
    ctx.fillStyle = P.faible; ctx.font = f(13);
    ctx.fillText(`butin ${nb(k.min)} à ${nb(k.max)}`, 116, y + 50);

    // barre de réussite
    const jx = 470, jw = 300;
    ctx.fillStyle = P.faible; ctx.font = f(12);
    ctx.fillText("CHANCES DE T'EN SORTIR", jx, y + 24);
    arrondi(ctx, jx, y + 32, jw, 12, 6);
    ctx.fillStyle = "rgba(255,255,255,0.07)"; ctx.fill();
    arrondi(ctx, jx, y + 32, Math.max(12, jw * k.chance), 12, 6);
    ctx.fillStyle = teinte; ctx.fill();

    ctx.textAlign = "right";
    ctx.fillStyle = teinte; ctx.font = f(24, true);
    ctx.fillText(`${Math.round(k.chance * 100)} %`, L - 60, y + 42);
    ctx.textAlign = "left";
  });

  ctx.textAlign = "right"; ctx.fillStyle = P.tres; ctx.font = f(12);
  ctx.fillText("0x • NAOYA", L - 30, H - 18);
  ctx.textAlign = "left";
  return c.toBuffer("image/png");
}

/* ========================================================================== */
/*                             9 - LECTEUR AUDIO                              */
/* ========================================================================== */

// musique.js — lecteur audio : YouTube, liens directs et webradios.
//
// Tout est chargé à la demande : si les bibliothèques audio manquent,
// les commandes répondent poliment au lieu de faire tomber le bot.


let VOICE = null;   // @discordjs/voice
let PLAY = null;    // play-dl
let AUDIO_PRET = false;
let AUDIO_CAUSE = "non initialisé";
let COOKIE = false;   // un cookie YouTube est-il fourni ?
let SOUND = false;    // SoundCloud est-il utilisable ?
let SPOTIFY = false;  // les clés Spotify sont-elles fournies ?

const sourcesDispo = () => ({
  youtube: !!PLAY, cookie: COOKIE, soundcloud: SOUND, spotify: SPOTIFY, deezer: true,
});

/* ========================================================================== */
/*                      CATALOGUE : DEEZER ET SPOTIFY                         */
/* ========================================================================== */

/**
 * Deezer et Spotify ne laissent PAS diffuser leur audio : c'est verrouillé
 * côté plateforme. On s'en sert donc comme catalogue — pour trouver le titre
 * et l'artiste exacts — puis on va chercher le son sur YouTube ou SoundCloud.
 *
 * L'API publique de Deezer ne demande aucune clé et ne filtre pas les
 * hébergeurs : c'est notre moteur de recherche principal.
 */
async function chercherDeezer(requete, limite = 5) {
  try {
    const url = `https://api.deezer.com/search?q=${encodeURIComponent(requete)}&limit=${limite}`;
    const ctrl = new AbortController();
    const minuterie = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url, { signal: ctrl.signal });
    clearTimeout(minuterie);
    if (!r.ok) return [];
    const data = await r.json();
    return (data?.data ?? []).slice(0, limite).map((p) => ({
      titre: String(p.title ?? "").slice(0, 80),
      artiste: String(p.artist?.name ?? "").slice(0, 60),
      album: String(p.album?.title ?? "").slice(0, 60),
      duree: p.duration ?? null,
      pochette: p.album?.cover_medium ?? null,
    })).filter((x) => x.titre);
  } catch { return []; }
}

/** Un lien Deezer précis : on en tire le titre et l'artiste. */
async function pisteDeezer(url) {
  const id = url.match(/deezer\.com\/(?:[a-z]{2}\/)?track\/(\d+)/i)?.[1];
  if (!id) return null;
  try {
    const r = await fetch(`https://api.deezer.com/track/${id}`);
    if (!r.ok) return null;
    const p = await r.json();
    return { titre: String(p.title ?? "").slice(0, 80), artiste: String(p.artist?.name ?? "").slice(0, 60),
      duree: p.duration ?? null };
  } catch { return null; }
}

/** Un lien Spotify : nécessite SPOTIFY_ID et SPOTIFY_SECRET sur Railway. */
async function pisteSpotify(url) {
  if (!PLAY || !SPOTIFY) return null;
  try {
    if (PLAY.is_expired && PLAY.is_expired()) await PLAY.refreshToken();
    const info = await PLAY.spotify(url);
    if (info.type === "track") {
      return { titre: String(info.name ?? "").slice(0, 80),
        artiste: String(info.artists?.[0]?.name ?? "").slice(0, 60),
        duree: Math.round((info.durationInMs ?? 0) / 1000) || null };
    }
    if (info.type === "playlist" || info.type === "album") {
      const pistes = await info.all_tracks();
      return { liste: pistes.slice(0, 50).map((p) => ({
        titre: String(p.name ?? "").slice(0, 80),
        artiste: String(p.artists?.[0]?.name ?? "").slice(0, 60),
        duree: Math.round((p.durationInMs ?? 0) / 1000) || null })) };
    }
  } catch (e) { console.error("[musique] Spotify :", e.message); }
  return null;
}

/**
 * Trouve le son d'un titre.
 * - Avec cookie YouTube (YT_COOKIE) : YouTube d'abord, SoundCloud en secours.
 * - Sans cookie : SoundCloud d'abord (les IP d'hébergeur sont souvent en 429 sur YT),
 *   puis YouTube en secours.
 */
async function trouverAudio(recherche, demandePar) {
  if (!PLAY) return replSoundcloud(recherche, demandePar);

  const viaYoutube = async () => {
    try {
      const r = await PLAY.search(recherche, { limit: 1, source: { youtube: "video" } });
      if (r.length) {
        return { titre: r[0].title.slice(0, 90), url: r[0].url,
          duree: r[0].durationInSec, source: "youtube", demandePar };
      }
    } catch (e) {
      if (!estBlocageYoutube(e)) console.error("[musique] YouTube :", e?.message ?? e);
    }
    return null;
  };

  // Cookie présent → YouTube fiable en premier
  if (COOKIE) {
    return (await viaYoutube()) ?? (await replSoundcloud(recherche, demandePar));
  }

  // Pas de cookie → SoundCloud d'abord pour éviter le 429 quasi systématique
  const sc = await replSoundcloud(recherche, demandePar);
  if (sc) return sc;
  return viaYoutube();
}

/** Extensions qu'ffmpeg lit sans aucune extraction. */
const EXT_DIRECTES = /\.(mp3|m4a|aac|ogg|opus|wav|flac|webm|mp4)(\?|$)/i;

/* ========================================================================== */
/*                              DÉMARRAGE                                     */
/* ========================================================================== */

async function initMusique() {
  if (AUDIO_PRET) return true;
  try {
    // L'emplacement d'ffmpeg doit être connu AVANT le chargement de la
    // bibliothèque vocale : elle le résout et le met en cache au premier usage.
    try {
      const ff = await import("ffmpeg-static");
      const chemin = ff.default ?? ff;
      if (chemin) process.env.FFMPEG_PATH = chemin;
    } catch { /* on tentera l'ffmpeg du système */ }

    VOICE = await import("@discordjs/voice");

    try {
      PLAY = await import("play-dl");

      // YouTube bloque les adresses IP d'hébergeur. Un cookie de compte
      // fait passer la requête pour celle d'un visiteur ordinaire.
      if (process.env.YT_COOKIE) {
        try {
          await PLAY.setToken({ youtube: { cookie: process.env.YT_COOKIE } });
          COOKIE = true;
          console.log("[musique] cookie YouTube chargé");
        } catch (e) { console.warn("[musique] cookie YouTube refusé :", e.message); }
      }

      // Spotify : catalogue seulement, jamais d'audio
      if (process.env.SPOTIFY_ID && process.env.SPOTIFY_SECRET) {
        try {
          await PLAY.setToken({ spotify: {
            client_id: process.env.SPOTIFY_ID,
            client_secret: process.env.SPOTIFY_SECRET,
            refresh_token: process.env.SPOTIFY_REFRESH ?? "",
            market: "FR" } });
          SPOTIFY = true;
        } catch (e) { console.warn("[musique] Spotify refusé :", e.message); }
      }

      // SoundCloud ne filtre pas les hébergeurs : c'est notre filet de secours
      try {
        const id = process.env.SOUNDCLOUD_ID ?? await PLAY.getFreeClientID();
        if (id) { await PLAY.setToken({ soundcloud: { client_id: id } }); SOUND = true; }
      } catch (e) { console.warn("[musique] SoundCloud indisponible :", e.message); }
    } catch {
      PLAY = null;
      console.warn("[musique] play-dl absent : liens directs seulement");
    }

    AUDIO_PRET = true;
    console.log(`[musique] lecteur prêt · YouTube ${PLAY ? (COOKIE ? "avec cookie" : "sans cookie") : "indisponible"}`
      + ` · SoundCloud ${SOUND ? "disponible" : "indisponible"}`);
    try {
      const rapport = VOICE.generateDependencyReport();
      const ligne = (motif) => (rapport.match(motif)?.[0] ?? "absent").trim();
      console.log(`[musique] ffmpeg ${ligne(/- version: [^\n]+/)?.replace("- version: ", "") ?? "?"}`);
      console.log(`[musique] opus ${/opusscript: (?!not found)/.test(rapport) ? "opusscript" : "@discordjs/opus"}`
        + ` · chiffrement ${/aes-256-gcm: yes/.test(rapport) ? "natif" : "libsodium"}`);
    } catch { /* rapport indisponible, sans conséquence */ }
    return true;
  } catch (e) {
    AUDIO_CAUSE = e.message;
    console.warn("[musique] indisponible :", e.message);
    AUDIO_PRET = false;
    return false;
  }
}

const musiqueReady = () => AUDIO_PRET;
const musiqueCause = () => AUDIO_CAUSE;

/* ========================================================================== */
/*                            FILES D'ATTENTE                                 */
/* ========================================================================== */

/** guildId -> { file, joueur, connexion, courant, volume, salonTexte, minuterie } */
const files = new Map();

function fileDe(guildId) { return files.get(guildId) ?? null; }

function creerFile(guild, salonVocal, salonTexte) {
  const joueur = VOICE.createAudioPlayer({
    behaviors: { noSubscriber: VOICE.NoSubscriberBehavior.Pause },
  });

  const etat = {
    file: [], joueur, connexion: null, courant: null,
    volume: 100, salonTexte: salonTexte.id, salonVocal: salonVocal.id,
    minuterie: null, ressource: null,
    quitterVideSec: 60, quitterInactifSec: 300,
  };
  files.set(guild.id, etat);

  joueur.on(VOICE.AudioPlayerStatus.Idle, () => { suivant(guild).catch(() => null); });
  joueur.on("error", (err) => {
    console.error("[musique]", err.message);
    annoncer(guild, embed({ guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Lecture interrompue` },
      description: `**${etat.courant?.titre ?? "La piste"}** n'a pas pu être lue jusqu'au bout.\nJe passe à la suivante.` }));
    suivant(guild).catch(() => null);
  });

  return etat;
}

async function annoncer(guild, e) {
  const etat = files.get(guild.id);
  if (!etat) return;
  const ch = guild.channels.cache.get(etat.salonTexte);
  if (ch && canSend(ch)) await ch.send({ embeds: [e] }).catch(() => null);
}

/* ========================================================================== */
/*                          RÉSOLUTION D'UNE PISTE                            */
/* ========================================================================== */

const estURL = (s) => /^https?:\/\/\S+$/i.test(s);

/**
 * Transforme une demande en piste jouable.
 * Un lien direct passe tel quel ; sinon on cherche sur YouTube.
 * @returns {Promise<{titre, url, duree, source}|{erreur:string}>}
 */
async function resoudre(requete, demandePar) {
  const q = String(requete ?? "").trim();
  if (!q) return { erreur: "Donne un lien ou un titre à chercher." };

  // 1. Lien direct — le plus fiable, aucune extraction
  if (estURL(q) && EXT_DIRECTES.test(q)) {
    return { titre: decodeURIComponent(q.split("/").pop().split("?")[0]).slice(0, 90),
      url: q, duree: null, source: "direct", demandePar };
  }

  // 2. Lien Deezer : catalogue, puis on va chercher le son ailleurs
  if (estURL(q) && /deezer\.com/i.test(q)) {
    const meta = await pisteDeezer(q);
    if (!meta) return { erreur: "Ce lien Deezer n'a pas pu être lu." };
    const audio = await trouverAudio(`${meta.artiste} ${meta.titre}`, demandePar);
    if (!audio) return { erreur: `**${meta.artiste} — ${meta.titre}** est introuvable en audio.` };
    return { ...audio, titre: `${meta.artiste} — ${meta.titre}`.slice(0, 90), via: "Deezer" };
  }

  // 3. Lien Spotify : idem, catalogue seulement
  if (estURL(q) && /open\.spotify\.com/i.test(q)) {
    if (!SPOTIFY) return { erreur: "Spotify n'est pas configuré. Ajoute `SPOTIFY_ID` et `SPOTIFY_SECRET` sur Railway." };
    const meta = await pisteSpotify(q);
    if (!meta) return { erreur: "Ce lien Spotify n'a pas pu être lu." };

    if (meta.liste) {
      const pistes = [];
      for (const p of meta.liste.slice(0, 25)) {
        const a = await trouverAudio(`${p.artiste} ${p.titre}`, demandePar);
        if (a) pistes.push({ ...a, titre: `${p.artiste} — ${p.titre}`.slice(0, 90), via: "Spotify" });
      }
      if (!pistes.length) return { erreur: "Aucun titre de cette playlist n'a pu être trouvé en audio." };
      return { playlist: pistes };
    }

    const audio = await trouverAudio(`${meta.artiste} ${meta.titre}`, demandePar);
    if (!audio) return { erreur: `**${meta.artiste} — ${meta.titre}** est introuvable en audio.` };
    return { ...audio, titre: `${meta.artiste} — ${meta.titre}`.slice(0, 90), via: "Spotify" };
  }

  // 4. YouTube
  if (PLAY) {
    try {
      if (estURL(q)) {
        const type = PLAY.yt_validate(q);
        if (type === "video") {
          const info = await PLAY.video_basic_info(q);
          const d = info.video_details;
          return { titre: d.title.slice(0, 90), url: d.url, duree: d.durationInSec, source: "youtube", demandePar };
        }
        if (type === "playlist") {
          const liste = await PLAY.playlist_info(q, { incomplete: true });
          const videos = await liste.all_videos();
          if (!videos.length) return { erreur: "Cette playlist est vide ou privée." };
          return { playlist: videos.slice(0, 50).map((v) => ({
            titre: v.title.slice(0, 90), url: v.url, duree: v.durationInSec, source: "youtube", demandePar })) };
        }
      }
      // Lien SoundCloud direct
      if (estURL(q) && /soundcloud\.com/i.test(q)) {
        const info = await PLAY.soundcloud(q);
        return { titre: String(info.name ?? "SoundCloud").slice(0, 90), url: q,
          duree: Math.round((info.durationInMs ?? 0) / 1000) || null, source: "soundcloud", demandePar };
      }

      // Recherche par nom : SoundCloud d'abord sans cookie, YouTube si cookie
      const audio = await trouverAudio(q, demandePar);
      if (audio) return audio;
      return { erreur: "Aucun résultat audio pour cette recherche. Essaie un autre titre ou un lien SoundCloud / .mp3." };
    } catch (e) {
      console.error("[musique] recherche :", e?.message ?? e);
      if (estURL(q)) return { titre: q.slice(0, 90), url: q, duree: null, source: "direct", demandePar };

      const repli = await replSoundcloud(q, demandePar);
      if (repli) return repli;

      return { erreur: estBlocageYoutube(e)
        ? "YouTube bloque l'adresse de l'hébergeur. Colle un lien SoundCloud, un lien `.mp3` ou une webradio."
        : "Aucune source audio n'a répondu. Colle un lien SoundCloud ou `.mp3`." };
    }
  }

  if (estURL(q)) return { titre: q.slice(0, 90), url: q, duree: null, source: "direct", demandePar };
  return { erreur: "La recherche audio est indisponible. Colle un lien SoundCloud ou `.mp3`." };
}

/* ========================================================================== */
/*                              LECTURE                                       */
/* ========================================================================== */

/**
 * Propose plusieurs titres du catalogue Deezer, pour que la personne
 * choisisse elle-même lequel jouer.
 * @returns {Promise<Array<{titre, artiste, duree, recherche}>>}
 */
async function propositions(requete, limite = 5) {
  const r = await chercherDeezer(requete, limite);
  return r.map((p) => ({ ...p, recherche: `${p.artiste} ${p.titre}` }));
}

/** Cherche la même chose sur SoundCloud, quand YouTube se ferme. */
async function replSoundcloud(titre, demandePar) {
  if (!SOUND) return null;
  try {
    const res = await PLAY.search(titre, { limit: 1, source: { soundcloud: "tracks" } });
    if (!res.length) return null;
    const t = res[0];
    return { titre: String(t.name ?? titre).slice(0, 90), url: t.url,
      duree: Math.round((t.durationInMs ?? 0) / 1000) || null, source: "soundcloud", demandePar };
  } catch { return null; }
}

/** Le blocage anti-robot de YouTube, reconnu à son message ou code HTTP. */
function estBlocageYoutube(err) {
  const message = typeof err === "string" ? err : (err?.message ?? String(err ?? ""));
  const status = err?.statusCode ?? err?.status ?? err?.code;
  if (status === 429 || status === 403 || status === "429" || status === "403") return true;
  return /confirm you.?re not a bot|sign in to confirm|429|403|consent|too many requests|login_required|bot.?check/i.test(message);
}

async function fabriquerRessource(piste, volume) {
  const inline = volume !== 100;

  // YouTube et SoundCloud passent par play-dl (extraction du vrai flux audio)
  if (PLAY && (piste.source === "youtube" || piste.source === "soundcloud")) {
    const flux = await PLAY.stream(piste.url, { quality: 2, discordPlayerCompatibility: false });
    return VOICE.createAudioResource(flux.stream, { inputType: flux.type, inlineVolume: inline });
  }

  // Lien direct / webradio : ffmpeg s'en charge
  const { stream, type } = await VOICE.demuxProbe(await fluxHttp(piste.url)).catch(() => ({ stream: null, type: null }));
  if (stream) return VOICE.createAudioResource(stream, { inputType: type, inlineVolume: inline });
  return VOICE.createAudioResource(piste.url, { inputType: VOICE.StreamType.Arbitrary, inlineVolume: inline });
}

/** Ouvre un flux HTTP lisible, en suivant les redirections. */
async function fluxHttp(url) {
  const r = await fetch(url, { redirect: "follow" });
  if (!r.ok || !r.body) throw new Error(`HTTP ${r.status}`);
  const { Readable } = await import("node:stream");
  return Readable.fromWeb(r.body);
}

/** Passe à la piste suivante, ou programme la déconnexion. */
async function suivant(guild) {
  const etat = files.get(guild.id);
  if (!etat) return;

  const piste = etat.file.shift();
  if (!piste) {
    etat.courant = null;
    programmerDepart(guild, (etat.quitterInactifSec ?? 300) * 1000, "Plus rien à jouer");
    return;
  }

  try {
    const ressource = await fabriquerRessource(piste, etat.volume);
    if (ressource.volume) ressource.volume.setVolume(etat.volume / 100);
    etat.ressource = ressource;
    etat.courant = piste;
    etat.joueur.play(ressource);
    annulerDepart(etat);

    await annoncer(guild, embed({ guild, color: COLORS.primary,
      author: { name: "🎵  Lecture en cours" },
      description: `**${piste.titre}**`,
      fields: [
        { name: "Durée", value: piste.duree ? dureeTexte(piste.duree) : "flux continu", inline: true },
        { name: "Demandé par", value: `<@${piste.demandePar}>`, inline: true },
        { name: "En attente", value: `${etat.file.length}`, inline: true },
      ] }));
  } catch (e) {
    const detail = String(e?.message ?? e ?? "erreur inconnue").slice(0, 120);
    console.error("[musique] lecture :", detail, "source=", piste.source);

    // Une seule tentative de repli par piste (évite une boucle infinie)
    if (!piste._repliTente) {
      let repli = null;
      let label = null;

      if (piste.source === "youtube") {
        repli = await replSoundcloud(piste.titre, piste.demandePar);
        label = "SoundCloud";
      } else if (piste.source === "soundcloud" && PLAY) {
        // SoundCloud en 404 / indispo → on tente YouTube
        try {
          const r = await PLAY.search(piste.titre, { limit: 1, source: { youtube: "video" } });
          if (r.length) {
            repli = { titre: r[0].title.slice(0, 90), url: r[0].url,
              duree: r[0].durationInSec, source: "youtube", demandePar: piste.demandePar };
            label = "YouTube";
          }
        } catch (err) {
          console.error("[musique] repli YT :", err?.message ?? err);
        }
      }

      if (repli) {
        repli._repliTente = true;
        await annoncer(guild, embed({ guild, color: COLORS.warning,
          author: { name: `🔁  Repli sur ${label}` },
          description: `**${piste.titre}** inaccessible (\`${detail}\`).\nNouvelle tentative via **${label}**.` }));
        etat.file.unshift(repli);
        return suivant(guild);
      }
    }

    const bloquéYt = piste.source === "youtube" && estBlocageYoutube(e);
    await annoncer(guild, embed({ guild, color: COLORS.danger,
      author: { name: bloquéYt ? "🚫  YouTube bloque le serveur" : `${ICONS.no}  Impossible de lire` },
      description: [
        `**${piste.titre}**`,
        `\`${detail}\``,
        "",
        bloquéYt
          ? "YouTube refuse souvent les IP d'hébergeurs (Railway).\nAjoute **`YT_COOKIE`** sur Railway, ou colle un lien SoundCloud / `.mp3`."
          : "Aucune source audio n'a pu lire ce titre.\nEssaie un **autre nom**, un lien **SoundCloud**, ou un **`.mp3`**.",
      ].join("\n") }));
    return suivant(guild);
  }
}

const dureeTexte = (s) => {
  if (!s) return "—";
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), x = s % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}`
           : `${m}:${String(x).padStart(2, "0")}`;
};

/* ========================================================================== */
/*                            CONNEXION VOCALE                                */
/* ========================================================================== */

function programmerDepart(guild, delai, raison) {
  const etat = files.get(guild.id);
  if (!etat) return;
  annulerDepart(etat);
  etat.minuterie = setTimeout(() => {
    annoncer(guild, embed({ guild, color: COLORS.neutral,
      author: { name: "👋  Je quitte le vocal" }, description: raison }));
    quitter(guild.id);
  }, delai);
}

function annulerDepart(etat) {
  if (etat?.minuterie) { clearTimeout(etat.minuterie); etat.minuterie = null; }
}

async function connecter(guild, salonVocal, salonTexte) {
  let etat = files.get(guild.id);
  if (!etat) etat = creerFile(guild, salonVocal, salonTexte);

  // On reprend les réglages du serveur à chaque connexion
  try {
    const m = (await getConfig(guild.id)).musique ?? {};
    etat.quitterVideSec = m.quitterVideSec ?? 60;
    etat.quitterInactifSec = m.quitterInactifSec ?? 300;
    if (!etat.courant) etat.volume = m.volumeDefaut ?? 100;
  } catch { /* réglages par défaut */ }

  etat.salonTexte = salonTexte.id;
  etat.salonVocal = salonVocal.id;

  if (etat.connexion && etat.connexion.state.status !== VOICE.VoiceConnectionStatus.Destroyed) return etat;

  const connexion = VOICE.joinVoiceChannel({
    channelId: salonVocal.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true,
  });

  // Une coupure réseau ne doit pas tuer la session : on tente de reprendre
  connexion.on(VOICE.VoiceConnectionStatus.Disconnected, async () => {
    try {
      await Promise.race([
        VOICE.entersState(connexion, VOICE.VoiceConnectionStatus.Signalling, 5_000),
        VOICE.entersState(connexion, VOICE.VoiceConnectionStatus.Connecting, 5_000),
      ]);
    } catch { quitter(guild.id); }
  });

  connexion.subscribe(etat.joueur);
  etat.connexion = connexion;

  try { await VOICE.entersState(connexion, VOICE.VoiceConnectionStatus.Ready, 20_000); }
  catch { quitter(guild.id); throw new Error("Je n'ai pas réussi à rejoindre le vocal."); }

  return etat;
}

function quitter(guildId) {
  const etat = files.get(guildId);
  if (!etat) return false;
  annulerDepart(etat);
  try { etat.joueur.stop(true); } catch { /* déjà arrêté */ }
  try { etat.connexion?.destroy(); } catch { /* déjà détruite */ }
  files.delete(guildId);
  return true;
}

/** Le vocal s'est vidé : on part au bout d'une minute. */
function surVocalVide(guild, salonId) {
  const etat = files.get(guild.id);
  if (!etat || etat.salonVocal !== salonId) return;
  let humains = 0;
  for (const vs of guild.voiceStates.cache.values()) {
    if (vs.channelId !== salonId) continue;
    const m = guild.members.cache.get(vs.id);
    if (!m?.user?.bot) humains++;
  }
  if (humains === 0) programmerDepart(guild, (etat.quitterVideSec ?? 60) * 1000, "Le salon s'est vidé.");
  else annulerDepart(etat);
}

/* ========================================================================== */
/*                            COMMANDES                                       */
/* ========================================================================== */

/**
 * Vérifie qu'on est bien dans le chat d'un vocal, et dans le bon.
 * @returns {{ok:true, salonVocal}|{ok:false, raison:string}}
 */
function verifierSalon(message) {
  const ch = message.channel;
  if (ch?.type !== ChannelType.GuildVoice && ch?.type !== ChannelType.GuildStageVoice) {
    return { ok: false, raison: "Ces commandes ne marchent que dans le **chat d'un salon vocal**." };
  }
  const monVocal = message.member?.voice?.channelId;
  if (!monVocal) return { ok: false, raison: "Connecte-toi d'abord au vocal." };
  if (monVocal !== ch.id) return { ok: false, raison: `Tu dois être connecté à ${ch} pour piloter la musique ici.` };

  const moi = message.guild.members.me;
  if (!ch.permissionsFor(moi)?.has(PermissionFlagsBits.Connect)
      || !ch.permissionsFor(moi)?.has(PermissionFlagsBits.Speak)) {
    return { ok: false, raison: `Il me manque **Se connecter** ou **Parler** dans ${ch}.` };
  }
  return { ok: true, salonVocal: ch };
}

/** Ajoute une demande à la file et démarre si besoin. */
async function jouer(message, requete) {
  const v = verifierSalon(message);
  if (!v.ok) return { ok: false, texte: v.raison };
  if (!AUDIO_PRET) return { ok: false, texte: "Le lecteur audio n'est pas disponible sur cet hébergement." };

  const r = await resoudre(requete, message.author.id);
  if (r.erreur) return { ok: false, texte: r.erreur };

  const etat = await connecter(message.guild, v.salonVocal, message.channel);
  const pistes = r.playlist ?? [r];
  etat.file.push(...pistes);
  annulerDepart(etat);

  const enCours = etat.courant !== null;
  if (!enCours) await suivant(message.guild);

  if (r.playlist) {
    return { ok: true, titre: `${pistes.length} pistes ajoutées`,
      texte: `Playlist mise en file.\nEn attente : **${etat.file.length}**` };
  }
  if (enCours) {
    return { ok: true, titre: "Ajouté à la file",
      texte: `**${r.titre}**\nPosition : **${etat.file.length}** · ${r.source === "youtube" ? "YouTube" : "lien direct"}` };
  }
  return null;   // le message de lecture est déjà parti
}

function passer(guildId) {
  const etat = files.get(guildId);
  if (!etat?.courant) return { ok: false, texte: "Rien n'est en cours." };
  const titre = etat.courant.titre;
  etat.joueur.stop(true);        // déclenche « Idle » donc la suivante
  return { ok: true, titre: "Piste passée", texte: `**${titre}** a été passée.` };
}

function mettreEnPause(guildId, reprendre = false) {
  const etat = files.get(guildId);
  if (!etat?.courant) return { ok: false, texte: "Rien n'est en cours." };
  if (reprendre) { etat.joueur.unpause(); return { ok: true, titre: "Reprise", texte: `**${etat.courant.titre}**` }; }
  etat.joueur.mettreEnPause();
  return { ok: true, titre: "En mettreEnPause", texte: `**${etat.courant.titre}**` };
}

function reglerVolume(guildId, valeur) {
  const etat = files.get(guildId);
  if (!etat) return { ok: false, texte: "Rien n'est en cours." };
  const v = Math.max(0, Math.min(200, Math.round(valeur)));
  etat.volume = v;
  if (etat.ressource?.volume) {
    etat.ressource.volume.setVolume(v / 100);
    return { ok: true, titre: "Volume", texte: `Réglé sur **${v} %**.` };
  }
  return { ok: true, titre: "Volume",
    texte: `Réglé sur **${v} %** — il s'appliquera à la piste suivante.\n_À 100 % le son passe sans ré-encodage : c'est la meilleure qualité._` };
}

function fileEmbed(guild) {
  const etat = files.get(guild.id);
  if (!etat?.courant) {
    return embed({ guild, color: COLORS.neutral, author: { name: "🎵  File d'attente" },
      description: "Rien en cours." });
  }
  const suite = etat.file.slice(0, 10)
    .map((p, n) => `\`${n + 1}.\` ${p.titre} — ${dureeTexte(p.duree)}`).join("\n");
  return embed({ guild, color: COLORS.primary, author: { name: "🎵  File d'attente" },
    description: `**En cours :** ${etat.courant.titre}\n${dureeTexte(etat.courant.duree)} · demandé par <@${etat.courant.demandePar}>`,
    fields: [{ name: `À suivre (${etat.file.length})`, value: suite || "_rien_" }],
    footer: `Volume ${etat.volume} %` });
}


/* ========================================================================== */
/*                    CHOIX PARMI PLUSIEURS TITRES                            */
/* ========================================================================== */


/** Propositions en attente : "guild:user" -> { liste, salonVocal, salonTexte } */
const attentes = new Map();
const cleChoix = (guildId, userId) => `${guildId}:${userId}`;

setInterval(() => {
  const t = Date.now();
  for (const [k, v] of attentes) if (t - v.a > 3 * 60_000) attentes.delete(k);
}, 60_000).unref();

/** Affiche les titres trouvés et laisse la personne trancher. */
function vueChoix(guild, liste, requete) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("mus:choix")
    .setPlaceholder("Lequel veux-tu écouter ?")
    .addOptions(liste.slice(0, 5).map((p, n) => ({
      label: `${p.artiste} — ${p.titre}`.slice(0, 100),
      value: String(n),
      description: `${p.album ? p.album.slice(0, 60) + " · " : ""}${dureeTexte(p.duree)}`.slice(0, 100),
    })));

  return {
    embeds: [embed({
      guild, color: COLORS.primary, author: { name: "🎵  Plusieurs titres trouvés" },
      description: [
        `Recherche : **${String(requete).slice(0, 80)}**`,
        "",
        ...liste.slice(0, 5).map((p, n) => `\`${n + 1}.\` **${p.artiste}** — ${p.titre}  ·  ${dureeTexte(p.duree)}`),
      ].join("\n"),
      footer: "Catalogue Deezer · le son vient de YouTube ou SoundCloud",
    })],
    components: [
      new ActionRowBuilder().addComponents(menu),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mus:annuler").setLabel("Annuler")
          .setStyle(ButtonStyle.Secondary).setEmoji("✖️")),
    ],
  };
}

function memoriserChoix(guildId, userId, donnees) {
  attentes.set(cleChoix(guildId, userId), { ...donnees, a: Date.now() });
}

function reprendreChoix(guildId, userId) {
  const v = attentes.get(cleChoix(guildId, userId));
  if (v) attentes.delete(cleChoix(guildId, userId));
  return v ?? null;
}

/* ========================================================================== */
/*                          PANNEAU DU LECTEUR                                */
/* ========================================================================== */

/** Ce que montre « +setup » : l'état réel de chaque source. */
function vueReglages(guild, config) {
  const s = sourcesDispo();
  const m = config.musique ?? {};
  const etat = files.get(guild.id);

  const ligne = (ok, nom, detail) => `${ok ? "🟢" : "🔴"} **${nom}** — ${detail}`;

  return {
    embeds: [embed({
      guild, color: AUDIO_PRET ? COLORS.success : COLORS.danger,
      author: { name: "🎛️  Réglages du lecteur" },
      description: [
        ligne(AUDIO_PRET, "Moteur audio", AUDIO_PRET ? "prêt" : AUDIO_CAUSE),
        ligne(s.deezer, "Deezer", "catalogue de recherche, aucune clé requise"),
        ligne(s.youtube && s.cookie, "YouTube", s.cookie ? "cookie fourni" : "sans cookie — l'hébergeur est souvent bloqué"),
        ligne(s.soundcloud, "SoundCloud", s.soundcloud ? "disponible en repli" : "indisponible"),
        ligne(s.spotify, "Spotify", s.spotify ? "catalogue disponible" : "clés absentes — `SPOTIFY_ID` et `SPOTIFY_SECRET`"),
        "",
        "_Les liens directs et webradios marchent toujours, quoi qu'il arrive._",
      ].join("\n"),
      fields: [
        { name: "Préfixe", value: `\`${m.prefixe ?? "+"}\``, inline: true },
        { name: "Volume par défaut", value: `${m.volumeDefaut ?? 100} %`, inline: true },
        { name: "En cours", value: etat?.courant ? etat.courant.titre.slice(0, 40) : "rien", inline: true },
        { name: "Départ automatique", value:
          `${m.quitterVideSec ?? 60} s si le salon se vide · ${Math.round((m.quitterInactifSec ?? 300) / 60)} min sans musique`, inline: false },
      ],
      footer: "Seul le propriétaire peut modifier ces réglages",
    })],
    components: [
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mus:prefixe").setLabel("Changer le préfixe").setStyle(ButtonStyle.Primary).setEmoji("⌨️"),
        new ButtonBuilder().setCustomId("mus:volume").setLabel("Volume par défaut").setStyle(ButtonStyle.Primary).setEmoji("🔊"),
        new ButtonBuilder().setCustomId("mus:choixauto")
          .setLabel((config.musique?.proposerChoix ?? true) ? "Proposer plusieurs titres" : "Jouer le premier trouvé")
          .setStyle(ButtonStyle.Secondary).setEmoji("🎯"),
      ),
      new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId("mus:test").setLabel("Tester le son").setStyle(ButtonStyle.Success).setEmoji("📻"),
        new ButtonBuilder().setCustomId("mus:setup").setLabel("Actualiser").setStyle(ButtonStyle.Secondary).setEmoji("🔄"),
      ),
    ],
  };
}

/** Webradio publique utilisée par le bouton de test. */
const RADIO_TEST = "https://icecast.radiofrance.fr/fip-midfi.mp3";


/* ========================================================================== */
/*                     BOUTONS ET MENUS DU LECTEUR                            */
/* ========================================================================== */

/** Traite tout ce qui commence par « mus: ». */
async function handleMusique(i, config, estProprio) {
  const action = i.customId.split(":")[1];
  const repondre = async (p) => (i.replied || i.deferred ? i.editReply(p) : i.update(p).catch(() => i.reply({ ...p, ...EPH })));

  /* --- choix d'un titre parmi les propositions --- */
  if (action === "choix") {
    const attente = reprendreChoix(i.guildId, i.user.id);
    if (!attente) return repondre({ content: "Cette recherche a expiré, relance la commande.", embeds: [], components: [] });

    const choisi = attente.liste[Number(i.values[0])];
    if (!choisi) return repondre({ content: "Ce titre n'existe plus.", embeds: [], components: [] });

    await repondre({ embeds: [embed({ guild: i.guild, color: COLORS.primary,
      author: { name: "🔎  Recherche du son" },
      description: `**${choisi.artiste} — ${choisi.titre}**\nJe cherche l'audio…` })], components: [] });

    const audio = await trouverAudio(choisi.recherche, i.user.id);
    if (!audio) {
      return i.editReply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
        author: { name: `${ICONS.no}  Audio introuvable` },
        description: `**${choisi.artiste} — ${choisi.titre}** est au catalogue, mais je n'ai pas réussi à en récupérer le son.\nEssaie un lien direct ou SoundCloud.` })] });
    }

    audio.titre = `${choisi.artiste} — ${choisi.titre}`.slice(0, 90);
    const r = await lancerPiste(i.guild, i.member, attente.salonVocal, attente.salonTexte, audio);
    return i.editReply(r);
  }

  if (action === "annuler") {
    reprendreChoix(i.guildId, i.user.id);
    return repondre({ embeds: [embed({ guild: i.guild, color: COLORS.neutral,
      author: { name: "Recherche annulée" } })], components: [] });
  }

  /* --- panneau de réglages, propriétaire seulement --- */
  if (!estProprio) {
    return i.reply({ content: "Seul le propriétaire du bot peut modifier ces réglages.", ...EPH }).catch(() => null);
  }

  if (action === "setup") return repondre(vueReglages(i.guild, config));

  if (action === "test") {
    const v = verifierSalon({ guild: i.guild, channel: i.channel, member: i.member, author: i.user });
    if (!v.ok) return i.reply({ content: v.raison, ...EPH }).catch(() => null);
    await i.deferUpdate().catch(() => null);
    const piste = { titre: "FIP — webradio de test", url: RADIO_TEST, duree: null, source: "direct", demandePar: i.user.id };
    const r = await lancerPiste(i.guild, i.member, v.salonVocal, i.channel, piste);
    return i.followUp({ ...r, ...EPH }).catch(() => null);
  }

  return null;   // le reste est traité par le panneau appelant
}

/**
 * Met une piste en file et démarre si rien ne joue.
 * Réutilisé par la commande, le menu de choix et le bouton de test.
 */
async function lancerPiste(guild, membre, salonVocal, salonTexte, piste) {
  const etat = await connecter(guild, salonVocal, salonTexte);
  etat.file.push(piste);
  annulerDepart(etat);

  if (etat.courant) {
    return { embeds: [embed({ guild, color: COLORS.primary,
      author: { name: "➕  Ajouté à la file" },
      description: `**${piste.titre}**\nPosition : **${etat.file.length}**` })], components: [] };
  }
  await suivant(guild);
  // suivant a déjà annoncé succès ou erreur ; on ne ment pas si la lecture a échoué
  if (!etat.courant) {
    return { embeds: [embed({ guild, color: COLORS.warning,
      author: { name: "⚠️  Lecture non démarrée" },
      description: `**${piste.titre}**\nVoir le message d'erreur ci-dessus. Un cookie \`YT_COOKIE\` débloque souvent YouTube.` })], components: [] };
  }
  return { embeds: [embed({ guild, color: COLORS.success,
    author: { name: "▶️  C'est parti" }, description: `**${etat.courant.titre}**` })], components: [] };
}

/* ========================================================================== */
/*            10 - TICKETS, GIVEAWAYS, COMPTEURS, PANNEAUX PUBLICS            */
/* ========================================================================== */

// features.js — tickets, giveaways, compteurs vocaux, panneaux publics.


/* ========================================================================== */
/*                            LOG CENTRALISÉ                                  */
/* ========================================================================== */

/**
 * @param {object} [fichier] pièce jointe optionnelle, par exemple une carte
 *   de sanction dessinée. L'embed y est lié automatiquement.
 */
async function log(guild, routeKey, e, fichier = null) {
  try {
    if (isSuspended(guild.id)) return;
    const config = await getConfig(guild.id);
    if (!config.logsEnabled) return;
    const channel = resolveLogChannel(guild, routeKey, config);
    if (!channel || !canSend(channel)) return;
    if (fichier) {
      e.setImage(`attachment://${fichier.name}`);
      e.data.fields = [];
      await channel.send({ embeds: [e], files: [fichier] });
      return;
    }
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

/**
 * Discord n'autorise que DEUX renommages par salon et par tranche de 10 minutes.
 * On tient donc un budget : tant qu'il en reste, le compteur réagit à la seconde.
 */
const renameLog = new Map();   // channelId -> [horodatages]

function renameBudget(channelId) {
  const now = Date.now();
  const recent = (renameLog.get(channelId) ?? []).filter((t) => now - t < 600_000);
  renameLog.set(channelId, recent);
  return 2 - recent.length;
}

function noteRename(channelId) {
  const arr = renameLog.get(channelId) ?? [];
  arr.push(Date.now());
  renameLog.set(channelId, arr);
}

/** Quand le prochain renommage sera possible. */
function nextRenameIn(channelId) {
  const arr = (renameLog.get(channelId) ?? []).filter((t) => Date.now() - t < 600_000);
  if (arr.length < 2) return 0;
  return Math.max(0, 600_000 - (Date.now() - Math.min(...arr)));
}

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

    // On ne remplace que le nombre : emojis, séparateurs et espaces restent intacts.
    const next = renameWithCount(channel.name, value) ?? counter.template.replace("{n}", num(value));
    if (channel.name === next) { report.push({ key: counter.key, value, status: "à jour" }); continue; }

    const memoKey = `${guild.id}:${counter.key}`;
    if (!force && lastCounterValue.get(memoKey) === value) { report.push({ key: counter.key, value, status: "inchangé" }); continue; }

    if (renameBudget(channel.id) <= 0) {
      const wait = Math.ceil(nextRenameIn(channel.id) / 1000);
      report.push({ key: counter.key, value, status: `en attente ${wait}s — limite Discord de 2 renommages / 10 min` });
      continue;
    }

    // setName peut lever de façon synchrone : le try/catch est indispensable
    let ok = false;
    try {
      await channel.setName(next, "Compteur 0x");
      ok = true;
    } catch (e) {
      report.push({ key: counter.key, value, status: `échec : ${String(e.message).slice(0, 60)}` });
    }
    if (ok) { lastCounterValue.set(memoKey, value); noteRename(channel.id); report.push({ key: counter.key, value, status: "mis à jour" }); }
    await new Promise((r) => setTimeout(r, 600));
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

/** Le type, avec les retouches faites depuis le panneau. */
function ticketKind(config, id) {
  const base = TICKET_TYPES.find((t) => t.id === id);
  if (!base) return null;
  return { ...base, ...(config?.ticketStyle?.[id] ?? {}) };
}

function ticketPanelComponents(guild, config) {
  const menu = new StringSelectMenuBuilder()
    .setCustomId("ticket:pick")
    .setPlaceholder("Ouvre un ticket — choisis ta catégorie");

  for (const base of TICKET_TYPES) {
    const t = ticketKind(config, base.id);
    const option = { label: t.label.slice(0, 100), value: t.id, description: (t.desc ?? "").slice(0, 100) };
    const e = resolveEmojiRef(guild, t.emoji);
    if (e) option.emoji = e;
    menu.addOptions(option);
  }
  return [new ActionRowBuilder().addComponents(menu)];
}

/** Devanture du centre d'aide. */
function ticketPanel(guild, config) {
  const lignes = TICKET_TYPES.map((base) => {
    const t = ticketKind(config, base.id);
    return `${t.emoji}  **${t.label}**\n　${t.desc ?? ""}`;
  });
  return {
    embeds: [embed({
      guild, color: COLORS.primary, author: { name: `${ICONS.ticket}  Centre d'aide` },
      description: [
        "```",
        "  ╔═══════════════════════════════╗",
        "  ║   O U V R I R   U N   T I C K E T   ║",
        "  ╚═══════════════════════════════╝",
        "```",
        "Un salon privé s'ouvre entre toi et l'équipe concernée.",
        "Personne d'autre n'y a accès.",
        "",
        lignes.join("\n\n"),
      ].join("\n"),
      footer: "Un seul ticket ouvert à la fois · les ouvertures abusives sont sanctionnées",
    })],
    components: ticketPanelComponents(guild, config),
  };
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

  const category = await ensureTicketCategory(guild, kind, config);
  if (!category) {
    return interaction.editReply(
      "Impossible de préparer la catégorie de ce ticket. Donne-moi la permission « Gérer les salons »."
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

/**
 * Trouve la catégorie du type de ticket, ou la crée.
 * Elle est masquée à @everyone : seul le rôle staff y voit les tickets.
 */
async function ensureTicketCategory(guild, kind, config) {
  const known = config.ticketCategories?.[kind.id];
  if (known) {
    const existing = guild.channels.cache.get(known);
    if (existing) return existing;
  }

  const found = findCategory(guild, kind.categories);
  if (found) {
    await updateConfig(guild.id, { ticketCategories: { ...(config.ticketCategories ?? {}), [kind.id]: found.id } });
    return found;
  }

  if (!guild.members.me.permissions.has(PermissionFlagsBits.ManageChannels)) return null;

  const overwrites = [
    { id: guild.id, deny: [PermissionFlagsBits.ViewChannel] },
    { id: guild.members.me.id, allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels, PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory] },
  ];
  if (config.staffRoleId && guild.roles.cache.has(config.staffRoleId)) {
    overwrites.push({ id: config.staffRoleId, allow: [
      PermissionFlagsBits.ViewChannel, PermissionFlagsBits.SendMessages,
      PermissionFlagsBits.ReadMessageHistory, PermissionFlagsBits.ManageMessages] });
  }

  const created = await guild.channels.create({
    name: kind.createName ?? `Tickets ${kind.label}`,
    type: ChannelType.GuildCategory,
    permissionOverwrites: overwrites,
    reason: "Catégorie de tickets créée par 0x",
  }).catch((e) => { console.error("[tickets] création de catégorie :", e.message); return null; });

  if (created) {
    await updateConfig(guild.id, { ticketCategories: { ...(config.ticketCategories ?? {}), [kind.id]: created.id } });
  }
  return created;
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
  let mine = null;
  try {
    const recent = await channel.messages.fetch({ limit: 10 });
    const list = typeof recent?.find === "function" ? recent : [...(recent?.values?.() ?? [])];
    mine = list.find((m) => m.author?.id === guild.members.me.id && m.embeds?.length);
  } catch { mine = null; }
  if (mine) await mine.edit({ embeds: [body] }).catch(() => channel.send({ embeds: [body] }).catch(() => null));
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

/**
 * Relance les tickets laissés sans réponse du staff.
 * @returns {Promise<{reminded:number, details:Array}>}
 */
async function checkStaleTickets(guild) {
  const config = await getConfig(guild.id);
  const conf = config.ticketReminder ?? {};
  if (!conf.enabled) return { reminded: 0, details: [] };

  const hours = Math.max(1, conf.hours ?? 6);
  const stale = await staleTickets(guild.id, hours);
  if (!stale.length) return { reminded: 0, details: [] };

  const details = [];
  for (const row of stale) {
    const channel = guild.channels.cache.get(row.channel_id);
    if (!channel) { await markTicketReminded(row.channel_id); continue; }
    if (!canSend(channel)) continue;

    const since = new Date(row.last_staff_at ?? row.opened_at);
    const waited = Math.round((Date.now() - since.getTime()) / 36e5);

    await channel.send({
      content: config.staffRoleId ? `<@&${config.staffRoleId}>` : undefined,
      embeds: [embed({
        guild, color: COLORS.warning, author: { name: "⏰  Ticket sans réponse" },
        description: `Ouvert par <@${row.user_id}> · aucune réponse du staff depuis **${waited} h**.`,
        footer: "Ce rappel disparaît dès qu'un membre du staff écrit ici",
      })],
    }).catch(() => null);

    await markTicketReminded(row.channel_id);
    details.push({ channel, waited, userId: row.user_id, kind: row.kind });
  }

  // Récapitulatif pour l'équipe
  if (details.length) {
    const staff = resolveFuncChannel(guild, "staffChat", config);
    if (staff && canSend(staff)) {
      await staff.send({ embeds: [embed({
        guild, color: COLORS.warning, author: { name: `⏰  ${details.length} ticket(s) en attente` },
        description: details.slice(0, 15).map((d) => `${d.channel} — <@${d.userId}> · **${d.waited} h**`).join("\n"),
        footer: `Seuil : ${hours} h sans réponse`,
      })] }).catch(() => null);
    }
    await log(guild, "ticket", embed({
      guild, color: COLORS.warning, author: { name: "⏰  Rappel de tickets" },
      description: `${details.length} ticket(s) relancé(s) après ${hours} h sans réponse.`,
    }));
  }

  return { reminded: details.length, details };
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


const pbtn = (id, label, style = ButtonStyle.Secondary, emoji, disabled = false) => {
  const btnB = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(disabled);
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) btnB.setLabel(clean.slice(0, 80));
  if (emoji) btnB.setEmoji(emoji);
  if (!clean && !emoji) btnB.setLabel("·");
  return btnB;
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
        pbtn("cas:open", "Casino", ButtonStyle.Danger, "🎰"),
        pbtn("pub:shop", "Boutique", ButtonStyle.Secondary, "🛒"),
        pbtn("pub:pay", "Envoyer des coins", ButtonStyle.Secondary, "🤝"),
      ),
      new ActionRowBuilder().addComponents(
        pbtn("pub:grade", "Mon grade", ButtonStyle.Primary, "🎖️"),
        pbtn("pub:echelle", "Les grades", ButtonStyle.Secondary, "📜"),
        pbtn("pub:invites", "Mes invitations", ButtonStyle.Primary, "🔗"),
        pbtn("pub:top:invites", "Top invitations", ButtonStyle.Secondary, "🏅"),
        pbtn("pub:top:voice", "Top vocal", ButtonStyle.Secondary, "🔊"),
      ),
    ],
  };
}

/* ========================================================================== */
/*                  11 - ARRIERE-SALLE : ACTIVITES ILLEGALES                  */
/* ========================================================================== */

// crime.js — le quartier illégal. Réussi, tu gardes tout.
// Attrapé, tu rembourses le double de ce que tu visais — quitte à finir en dette.


const xb = (id, label, style = ButtonStyle.Secondary, emoji, disabled = false) => {
  const btnB = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(disabled);
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) btnB.setLabel(clean.slice(0, 80));
  if (emoji) btnB.setEmoji(emoji);
  if (!clean && !emoji) btnB.setLabel("·");
  return btnB;
};
const xrow = (...c) => new ActionRowBuilder().addComponents(...c);

/* ========================================================================== */
/*                              LES COUPS                                     */
/* ========================================================================== */

/**
 * `chance` est la probabilité de base de s'en sortir. La pression policière
 * la fait chuter. Comme un échec coûte le double du gain visé, un coup n'est
 * rentable en moyenne qu'au-dessus de 66 % de réussite : aucun ne l'est
 * durablement, c'est ce qui protège l'économie.
 */
const JOBS = {
  pickpocket: {
    label: "Pickpocket", emoji: "👝", chance: 0.65, min: 200, max: 900, heat: 8,
    flavor: ["Tu frôles un joueur à la table de roulette…", "Une poche mal fermée, une main rapide…"],
    caught: ["Le videur t'attrape le poignet.", "Un agent en civil te repère dans le reflet du miroir."],
  },
  trafic: {
    label: "Trafic de jetons", emoji: "🎫", chance: 0.60, min: 600, max: 2500, heat: 12,
    flavor: ["Tu revends des jetons volés en coulisses…", "Un contact t'attend près des vestiaires…"],
    caught: ["Les jetons sont marqués. La sécurité arrive.", "Ton contact était infiltré."],
  },
  truquer: {
    label: "Truquer une machine", emoji: "🔧", chance: 0.47, min: 3000, max: 12_000, heat: 20,
    flavor: ["Tu glisses un aimant derrière le rouleau…", "Un fil dénudé dans le lecteur de jetons…"],
    caught: ["La machine se bloque et hurle. Tout le monde se retourne.", "Le technicien passait justement par là."],
  },
  cambriolage: {
    label: "Cambrioler un coffre", emoji: "🧰", chance: 0.52, min: 1500, max: 6000, heat: 18,
    flavor: ["Le coffre du bureau de l'étage…", "Tu as trouvé la combinaison sur un post-it…"],
    caught: ["Le coffre était sous alarme silencieuse.", "Une caméra que tu n'avais pas vue."],
  },
  braquage: {
    label: "Braquer la caisse", emoji: "💰", chance: 0.33, min: 10_000, max: 40_000, heat: 35,
    flavor: ["La caisse centrale, en pleine nuit…", "Deux minutes, montre en main…"],
    caught: ["Les portes se verrouillent. Tu es cerné.", "La police attendait dehors depuis le début."],
  },
};

/* ========================================================================== */
/*                              TENTATIVE                                     */
/* ========================================================================== */

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/** Chance réelle, une fois la pression policière déduite. */
function realChance(job, heat) {
  return Math.max(0.05, job.chance - (heat / 100) * 0.30);
}

/**
 * Tente un coup.
 * @returns {Promise<{ok, gain, perte, solde, heat, chance, job}>}
 */
async function attempt(guild, user, jobId) {
  const config = await getConfig(guild.id);
  const job = JOBS[jobId];
  if (!job) return null;

  const decay = config.crime?.heatDecayPerMin ?? 1;
  const heat = await getHeat(guild.id, user.id, decay);
  const chance = realChance(job, heat);

  // Le butin est tiré AVANT le sort : c'est ce qu'on gagne, ou le double qu'on rembourse
  const gain = job.min + Math.floor(Math.random() * (job.max - job.min + 1));
  const reussi = Math.random() < chance;

  const newHeat = await setHeat(guild.id, user.id, heat + job.heat + (reussi ? 0 : 10));
  const delta = reussi ? gain : -gain * 2;
  const solde = await addCoins(guild.id, user.id, delta, true);

  if (!reussi) {
    await log(guild, "coins", embed({
      guild, color: COLORS.danger, author: { name: "🚔  Coup manqué" },
      fields: [
        { name: "Joueur", value: user.tag, inline: true },
        { name: "Coup", value: `${job.emoji} ${job.label}`, inline: true },
        { name: "Amende", value: num(gain * 2), inline: true },
        { name: "Solde après", value: num(solde), inline: true },
      ],
    })).catch(() => null);
  }

  return { ok: reussi, gain, perte: gain * 2, solde, heat: newHeat, chance, job };
}

/* ========================================================================== */
/*                              AFFICHAGE                                     */
/* ========================================================================== */

const heatBar = (h) => `${bar(h, 100, 10)} ${h}/100`;

/**
 * @param {object} [ctx] interaction, pour l'avatar et le pseudo affiché
 */
async function crimeLobby(guild, user, ctx = null) {
  const config = await getConfig(guild.id);
  const c = config.economy.currency;
  const w = await getWallet(guild.id, user.id);
  const heat = await getHeat(guild.id, user.id, config.crime?.heatDecayPerMin ?? 1);

  const lignes = Object.entries(JOBS).map(([id, j]) => {
    const p = Math.round(realChance(j, heat) * 100);
    return `${j.emoji} **${j.label}** — ${num(j.min)} à ${num(j.max)} ${c}\n`
      + `　risque : **${p} %** de s'en sortir · amende **×2**`;
  });

  const vue = {
    embeds: [embed({
      guild,
      color: w.coins < 0 ? COLORS.danger : COLORS.neutral,
      author: { name: "🚬  L'arrière-salle" },
      description: [
        "```",
        "   ╔═══════════════════════════╗",
        "   ║  ⚠  A R R I È R E - S A L L E ⚠  ║",
        "   ╚═══════════════════════════╝",
        "```",
        w.coins < 0
          ? `### 🚨 Tu dois **${num(-w.coins)} ${c}**\nRembourse avec le quotidien et le travail avant de remiser.`
          : `Solde : **${c} ${num(w.coins)}**`,
        "",
        ...lignes,
      ].join("\n"),
      fields: [
        { name: "🚔 Pression policière", value: heatBar(heat), inline: false },
        { name: "La règle", value: "Réussi, tu **gardes tout**. Attrapé, tu rembourses **le double** de ce que tu visais — même si ça te met en dette." },
      ],
      footer: "Chaque coup fait monter la pression · elle retombe d'un point par minute",
    })],
    components: [
      xrow(...Object.entries(JOBS).slice(0, 3).map(([id, j]) =>
        xb(`cr:go:${id}`, j.label, ButtonStyle.Danger, j.emoji))),
      xrow(...Object.entries(JOBS).slice(3).map(([id, j]) =>
        xb(`cr:go:${id}`, j.label, ButtonStyle.Danger, j.emoji))),
      xrow(xb("cr:lobby", "Actualiser", ButtonStyle.Secondary, "🔄"),
           xb("cas:open", "Retour au casino", ButtonStyle.Primary, "🎰"),
           xb("pub:work", "Travailler (légal)", ButtonStyle.Success, "💼")),
    ],
  };

  if (!renderReady()) return vue;
  try {
    const avatar = ctx?.user
      ? await chargerAvatar(ctx.user.displayAvatarURL({ extension: "png", size: 128 }))
      : null;
    const buffer = renderCrimeLobby({
      joueur: ctx?.member?.displayName ?? ctx?.user?.username ?? user.tag ?? "—",
      avatar, solde: w.coins, pression: heat, monnaie: c,
      coups: Object.entries(JOBS).map(([id, j]) => ({
        id, nom: j.label, min: j.min, max: j.max, chance: realChance(j, heat),
      })),
    });
    if (buffer) {
      const nom = `arriere-salle-${Date.now()}.png`;
      vue.embeds[0].setImage(`attachment://${nom}`);
      vue.embeds[0].data.description = undefined;
      vue.embeds[0].data.fields = [];
      return { ...vue, files: [{ attachment: buffer, name: nom }], attachments: [] };
    }
  } catch (e) { console.error("[arrière-salle]", e.message); }
  return vue;
}

function resultView(guild, user, r, currency) {
  const j = r.job;
  return {
    embeds: [embed({
      guild,
      color: r.ok ? COLORS.success : COLORS.danger,
      author: { name: r.ok ? `${j.emoji}  ${j.label} — réussi` : "🚔  Attrapé" },
      description: [
        `_${pick(r.ok ? j.flavor : j.caught)}_`,
        "",
        r.ok
          ? `### + ${currency} ${num(r.gain)}\nTu gardes tout.`
          : `### − ${currency} ${num(r.perte)}\nLe double de ce que tu visais (${num(r.gain)}).`,
        "",
        r.solde < 0
          ? `**Tu es en dette de ${currency} ${num(-r.solde)}.**`
          : `Solde : **${currency} ${num(r.solde)}**`,
      ].join("\n"),
      fields: [
        { name: "Chance qu'il te restait", value: `${Math.round(r.chance * 100)} %`, inline: true },
        { name: "🚔 Pression", value: heatBar(r.heat), inline: true },
      ],
      footer: r.solde < 0 ? "Le quotidien et le travail restent accessibles pour rembourser" : undefined,
    })],
    components: [xrow(
      xb(`cr:go:${Object.keys(JOBS).find((k) => JOBS[k] === j)}`, "Recommencer", ButtonStyle.Danger, "🔁"),
      xb("cr:lobby", "L'arrière-salle", ButtonStyle.Secondary, "🚬"),
      xb("cas:open", "Casino", ButtonStyle.Primary, "🎰"),
    )],
  };
}

/* ========================================================================== */
/*                                ROUTEUR                                     */
/* ========================================================================== */

async function handleCrime(i) {
  return serialiser(i.guildId, i.user.id, () => coup(i), () =>
    i.reply({ content: "Une action est déjà en cours, patiente une seconde.", ...EPH }).catch(() => null));
}

async function coup(i) {
  const [, action, jobId] = i.customId.split(":");
  const config = await getConfig(i.guildId);
  if (!config.economy.enabled || config.crime?.enabled === false) {
    return i.reply({ content: "L'arrière-salle est fermée.", ...EPH });
  }

  const reply = async (payload) => {
    if (i.replied || i.deferred) return i.editReply(payload);
    return i.update(payload).catch(() => i.reply({ ...payload, ...EPH }));
  };

  if (action === "lobby") return reply(await crimeLobby(i.guild, i.user, i));
  if (action === "open") return i.reply({ ...(await crimeLobby(i.guild, i.user, i)), ...EPH });

  if (action === "go") {
    const w = await getWallet(i.guildId, i.user.id);
    const maxDebt = config.crime?.maxDebt ?? 100_000;
    if (w.coins <= -maxDebt) {
      return reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
        author: { name: "🚨  Dette maximale atteinte" },
        description: `Tu dois déjà **${num(-w.coins)}**. Rembourse avant de replonger.` })],
        components: [xrow(xb("pub:work", "Travailler", ButtonStyle.Success, "💼"),
          xb("pub:daily", "Quotidien", ButtonStyle.Success, "🎁"))] });
    }
    const r = await attempt(i.guild, i.user, jobId);
    if (!r) return reply({ content: "Ce coup n'existe pas.", embeds: [], components: [] });

    const vue = resultView(i.guild, i.user, r, config.economy.currency);
    if (!renderReady()) return reply(vue);
    try {
      const avatar = await chargerAvatar(i.user.displayAvatarURL({ extension: "png", size: 128 }));
      const buffer = renderCrime({
        coup: r.job.label, reussi: r.ok, gain: r.gain, perte: r.perte, solde: r.solde,
        pression: r.heat, chance: r.chance,
        joueur: i.member?.displayName ?? i.user.username, avatar,
        phrase: vue.embeds[0].data.description.split("\n")[0].replace(/[_*]/g, ""),
      });
      if (buffer) {
        const nom = `coup-${Date.now()}.png`;
        vue.embeds[0].setImage(`attachment://${nom}`);
        vue.embeds[0].data.description = undefined;
        vue.embeds[0].data.fields = [];
        return reply({ ...vue, files: [{ attachment: buffer, name: nom }], attachments: [] });
      }
    } catch (e) { console.error("[coup]", e.message); }
    return reply(vue);
  }
}

/** Le casino et la boutique refusent les joueurs endettés. */
async function blockedByDebt(guildId, userId) {
  const config = await getConfig(guildId);
  if (config.crime?.debtBlocksCasino === false) return null;
  const w = await getWallet(guildId, userId);
  if (w.coins >= 0) return null;
  return `Tu es en dette de **${config.economy.currency} ${num(-w.coins)}**. `
    + "Rembourse avec le quotidien et le travail avant de remiser.";
}

/* ========================================================================== */
/*                                12 - CASINO                                 */
/* ========================================================================== */

// casino.js — le casino : jeux réels, probabilités et gains calculés.


const cb = (id, label, style = ButtonStyle.Secondary, emoji, disabled = false) => {
  const b = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(disabled);
  // Un bouton doit avoir un libellé OU un emoji ; un libellé vide est refusé.
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) b.setLabel(clean.slice(0, 80));
  if (emoji) b.setEmoji(emoji);
  if (!clean && !emoji) b.setLabel("·");
  return b;
};
const crow = (...c) => new ActionRowBuilder().addComponents(...c);

/* ========================================================================== */
/*                              CATALOGUE                                     */
/* ========================================================================== */

const GAMES = {
  slots:     { label: "Machine à sous", emoji: "🎰", desc: "3 rouleaux, jusqu'à ×1500" },
  blackjack: { label: "Blackjack",      emoji: "🃏", desc: "Battre le croupier sans dépasser 21" },
  roulette:  { label: "Roulette",       emoji: "🔴", desc: "Européenne, un seul zéro" },
  mines:     { label: "Démineur",       emoji: "💣", desc: "Encaisse avant la mine" },
  dice:      { label: "Dés",            emoji: "🎲", desc: "Plus haut ou plus bas, cote au choix" },
  flip:      { label: "Pile ou face",   emoji: "🪙", desc: "Le plus simple, ×1,96" },
};

/** Avantage de la maison, appliqué à tous les gains calculés. */
const EDGE = 0.03;

/* ========================================================================== */
/*                              SESSIONS                                      */
/* ========================================================================== */

const sessions = new Map();   // "guild:user" -> { game, bet, state, at }
const key = (i) => `${i.guildId}:${i.user.id}`;

function setSession(i, data) { sessions.set(key(i), { ...data, at: Date.now() }); }
function getSession(i) {
  const s = sessions.get(key(i));
  if (!s || Date.now() - s.at > 15 * 60_000) { sessions.delete(key(i)); return null; }
  return s;
}
function endSession(i) { sessions.delete(key(i)); }

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of sessions) if (now - v.at > 15 * 60_000) sessions.delete(k);
}, 5 * 60_000).unref();

/* ========================================================================== */
/*                          MISE ET RÈGLEMENT                                 */
/* ========================================================================== */

async function limits(guildId) {
  const c = await getConfig(guildId);
  const cas = c.casino ?? {};
  return { config: c, min: cas.minBet ?? 50, max: cas.maxBet ?? 250_000, enabled: cas.enabled !== false, games: cas.games ?? {} };
}

/** Retire la mise. @returns {Promise<{ok:boolean, reason?:string, solde?:number}>} */
async function takeBet(i, bet) {
  const dette = await blockedByDebt(i.guildId, i.user.id);
  if (dette) return { ok: false, reason: dette };
  const { min, max } = await limits(i.guildId);
  if (!Number.isFinite(bet) || bet < min) return { ok: false, reason: `Mise minimum : **${num(min)}**.` };
  if (bet > max) return { ok: false, reason: `Mise maximum : **${num(max)}**.` };
  const w = await getWallet(i.guildId, i.user.id);
  if (w.coins < bet) return { ok: false, reason: `Tu n'as que **${num(w.coins)}**.` };
  const solde = await addCoins(i.guildId, i.user.id, -bet);
  return { ok: true, solde };
}

/** Crédite le gain et journalise les gros coups. */
async function payout(i, bet, amount, gameLabel) {
  const solde = amount > 0 ? await addCoins(i.guildId, i.user.id, amount) : (await getWallet(i.guildId, i.user.id)).coins;
  if (amount >= bet * 20 && amount > 0) {
    await log(i.guild, "coins", embed({
      guild: i.guild, color: COLORS.gold, author: { name: "🎰  Gros gain au casino" },
      fields: [
        { name: "Joueur", value: i.user.tag, inline: true },
        { name: "Jeu", value: gameLabel, inline: true },
        { name: "Mise", value: num(bet), inline: true },
        { name: "Gain", value: num(amount), inline: true },
        { name: "Multiplicateur", value: `×${(amount / bet).toFixed(2)}`, inline: true },
      ],
    })).catch(() => null);
  }
  return solde;
}

const money = (c, n) => `${c} ${num(n)}`;

/**
 * Attache l'image du jeu au message. Si le dessin est indisponible ou
 * échoue, on renvoie le message texte tel quel : la partie continue.
 */
async function avecImage(i, payload, dessiner) {
  if (!renderReady()) return payload;
  try {
    const avatar = await chargerAvatar(i.user.displayAvatarURL?.({ extension: "png", size: 128 }));
    const buffer = dessiner(avatar);
    if (!buffer) return payload;
    const nom = `0x-${Date.now()}.png`;
    const e = payload.embeds?.[0];
    if (e?.setImage) e.setImage(`attachment://${nom}`);
    return { ...payload, files: [{ attachment: buffer, name: nom }], attachments: [] };
  } catch (err) {
    console.error("[casino] image :", err.message);
    return payload;
  }
}

/** Ce qui identifie le joueur sur l'image. */
const carteJoueur = (i) => ({ joueur: i.member?.displayName ?? i.user.username });

/** Envoie une grille de démineur avec son image. */
async function envoyerMines(i, st, currency, reply, done = false, blown = false) {
  const vue = minesView(i.guild, st, currency, done, blown);
  if (!vue._mn) return reply(vue);
  const { mult } = vue._mn;
  delete vue._mn;
  const solde = (await getWallet(i.guildId, i.user.id)).coins;
  return reply(await avecImage(i, vue, (avatar) => renderMines({
    ...carteJoueur(i), avatar,
    bombes: st.bombs, ouvertes: st.found, mines: st.mines, mult,
    mise: st.bet, gain: Math.floor(st.bet * mult), solde,
    termine: done, saute: blown, derniere: st.last ?? null,
  })));
}

/** Envoie une main de blackjack avec son image. */
async function envoyerBlackjack(i, st, currency, reply, done = false, verdict = null) {
  const vue = blackjackView(i.guild, st, currency, done, verdict);
  if (!vue._bj) return reply(vue);
  const { pv, dv } = vue._bj;
  delete vue._bj;
  // Le solde est lu avant le dessin : la fonction de rendu est synchrone.
  const solde = (await getWallet(i.guildId, i.user.id)).coins;
  return reply(await avecImage(i, vue, (avatar) => renderBlackjack({
    ...carteJoueur(i), avatar,
    joueurCartes: st.player, croupierCartes: st.dealer,
    valeurJoueur: pv, valeurCroupier: dv, cacher: !done, termine: done,
    texte: done ? (verdict?.text ?? "") : "À toi de jouer",
    mise: st.bet, gain: done ? (verdict?.win ?? 0) + st.bet : 0,
    solde,
  })));
}

/* ========================================================================== */
/*                                 HALL                                       */
/* ========================================================================== */

async function casinoLobby(guild, config, wallet) {
  const c = config.economy.currency;
  const cas = config.casino ?? {};
  const actifs = Object.entries(GAMES).filter(([id]) => cas.games?.[id] !== false);

  return {
    embeds: [embed({
      guild,
      color: COLORS.gold,
      author: { name: "🎰  Casino" },
      description: [
        "```",
        "   ╔═════════════════════════════╗",
        "   ║  ♠  ♥   C A S I N O   ♦  ♣  ║",
        "   ╚═════════════════════════════╝",
        "```",
        wallet.coins < 0
          ? `🚨 **Dette de ${money(c, -wallet.coins)}** — les tables te sont fermées.`
          : `Jetons : **${money(c, wallet.coins)}**`,
        `Mises de **${num(cas.minBet ?? 50)}** à **${num(cas.maxBet ?? 250_000)}**`,
        "",
        ...actifs.map(([, g]) => `${g.emoji} **${g.label}** — ${g.desc}`),
      ].join("\n"),
      footer: "Les gains sont calculés comme dans un vrai casino : la maison garde 3 %",
    })],
    components: [
      // Une rangée vide fait refuser le message par Discord : on n'en crée
      // que pour les jeux réellement ouverts.
      ...(actifs.length
        ? [crow(...actifs.slice(0, 3).map(([id, g]) => cb(`cas:pick:${id}`, g.label, ButtonStyle.Primary, g.emoji)))]
        : []),
      ...(actifs.length > 3
        ? [crow(...actifs.slice(3, 6).map(([id, g]) => cb(`cas:pick:${id}`, g.label, ButtonStyle.Primary, g.emoji)))]
        : []),
      crow(cb("pub:coins", "Mes jetons", ButtonStyle.Secondary, "🪙"),
           cb("pub:top:coins", "Les plus riches", ButtonStyle.Secondary, "🏆"),
           cb("cr:open", "Arrière-salle", ButtonStyle.Danger, "🚬")),
    ],
  };
}

/** Choix de la mise, commun à tous les jeux. */
function betView(guild, game, wallet, currency) {
  const g = GAMES[game];
  if (wallet.coins < 0) {
    return {
      embeds: [embed({ guild, color: COLORS.danger, author: { name: "🚨  Tables fermées" },
        description: `Tu dois **${money(currency, -wallet.coins)}**.\nRembourse avec le quotidien et le travail avant de remiser.` })],
      components: [crow(cb("pub:work", "Travailler", ButtonStyle.Success, "💼"),
        cb("pub:daily", "Quotidien", ButtonStyle.Success, "🎁"),
        cb("cas:lobby", "Retour", ButtonStyle.Secondary, "◀️"))],
    };
  }
  const presets = [100, 500, 1000, 5000].filter((v) => v <= wallet.coins);
  return {
    embeds: [embed({
      guild, color: COLORS.gold, author: { name: `${g.emoji}  ${g.label}` },
      description: `${g.desc}\n\nSolde : **${money(currency, wallet.coins)}**\n\nCombien tu mises ?`,
    })],
    components: [
      crow(
        ...presets.map((v) => cb(`cas:bet:${game}:${v}`, num(v), ButtonStyle.Secondary)),
        cb(`cas:betmodal:${game}`, "Autre", ButtonStyle.Primary, "✏️"),
      ),
      crow(
        cb(`cas:bet:${game}:${Math.max(0, Math.floor(wallet.coins / 2))}`, "Moitié", ButtonStyle.Secondary, "🪙", wallet.coins < 2),
        cb(`cas:bet:${game}:${Math.max(0, wallet.coins)}`, "Tout miser", ButtonStyle.Danger, "🔥", wallet.coins < 1),
        cb("cas:lobby", "Retour", ButtonStyle.Secondary, "◀️"),
      ),
    ],
  };
}

/* ========================================================================== */
/*                          MACHINE À SOUS                                    */
/* ========================================================================== */

// Table calibrée par simulation : retour au joueur ≈ 95 %.
// Les paires ne rendent que la mise, et seulement sur les symboles rares —
// sinon elles font exploser le retour bien au-dessus de 100 %.
const REELS = [
  { s: "🍒", w: 22, x3: 10,   pair: 0 },
  { s: "🍋", w: 20, x3: 16,   pair: 0 },
  { s: "🍊", w: 16, x3: 27,   pair: 0 },
  { s: "🔔", w: 12, x3: 40,   pair: 1 },
  { s: "💎", w: 7,  x3: 125,  pair: 1 },
  { s: "7️⃣", w: 4,  x3: 300,  pair: 1 },
  { s: "🌟", w: 1,  x3: 1500, pair: 1 },
];
const TOTAL_W = REELS.reduce((a, r) => a + r.w, 0);

function spinReel() {
  let r = Math.random() * TOTAL_W;
  for (const sym of REELS) { r -= sym.w; if (r <= 0) return sym; }
  return REELS[0];
}

/** @returns {{reels:Array, mult:number, label:string}} */
function playSlots() {
  const reels = [spinReel(), spinReel(), spinReel()];
  const [a, b, c] = reels;
  if (a.s === b.s && b.s === c.s) return { reels, mult: a.x3, label: `Trois ${a.s} !` };
  if (a.s === b.s || b.s === c.s || a.s === c.s) {
    const pair = a.s === b.s ? a : (b.s === c.s ? b : a);
    if (pair.pair) return { reels, mult: pair.pair, label: `Paire de ${pair.s} — mise rendue` };
    return { reels, mult: 0, label: `Paire de ${pair.s}, trop commune` };
  }
  return { reels, mult: 0, label: "Rien" };
}

/* ========================================================================== */
/*                              BLACKJACK                                     */
/* ========================================================================== */

const SUITS = ["♠️", "♥️", "♦️", "♣️"];
const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

function newDeck() {
  const d = [];
  for (const s of SUITS) for (const r of RANKS) d.push({ r, s });
  for (let n = d.length - 1; n > 0; n--) { const j = Math.floor(Math.random() * (n + 1)); [d[n], d[j]] = [d[j], d[n]]; }
  return d;
}

function handValue(hand) {
  let total = 0, aces = 0;
  for (const c of hand) {
    if (c.r === "A") { aces++; total += 11; }
    else if (["J", "Q", "K"].includes(c.r)) total += 10;
    else total += Number(c.r);
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

const showHand = (hand, hideSecond = false) =>
  hand.map((c, n) => (hideSecond && n === 1 ? "`??`" : `\`${c.r}${c.s}\``)).join(" ");

function blackjackView(guild, st, currency, done = false, verdict = null) {
  const pv = handValue(st.player), dv = handValue(st.dealer);
  if (renderReady()) {
    return {
      embeds: [embed({ guild, author: { name: "🃏  Blackjack" },
        color: done ? (verdict?.win > 0 ? COLORS.success : verdict?.win === 0 ? COLORS.warning : COLORS.danger) : COLORS.gold })],
      components: done
        ? [crow(cb("cas:pick:blackjack", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))]
        : [crow(
            cb("cas:bj:hit", "Tirer", ButtonStyle.Primary, "➕"),
            cb("cas:bj:stand", "Rester", ButtonStyle.Success, "✋"),
            cb("cas:bj:double", "Doubler", ButtonStyle.Danger, "✖️", st.player.length !== 2 || !st.canDouble),
          )],
      _bj: { done, verdict, pv, dv },
    };
  }
  return {
    embeds: [embed({
      guild, color: done ? (verdict?.win > 0 ? COLORS.success : verdict?.win === 0 ? COLORS.warning : COLORS.danger) : COLORS.gold,
      author: { name: "🃏  Blackjack" },
      description: [
        `**Croupier** — ${done ? dv : "?"}`,
        showHand(st.dealer, !done),
        "",
        `**Toi** — ${pv}`,
        showHand(st.player),
        "",
        done ? `### ${verdict.text}` : "",
        done && verdict.win > 0 ? `Tu remportes **${money(currency, verdict.win)}**` : "",
        done && verdict.win === 0 ? "Mise remboursée" : "",
        done && verdict.win < 0 ? `Tu perds ta mise de **${money(currency, st.bet)}**` : "",
      ].filter(Boolean).join("\n"),
      footer: done ? undefined : "Le croupier tire jusqu'à 17",
    })],
    components: done
      ? [crow(cb("cas:pick:blackjack", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))]
      : [crow(
          cb("cas:bj:hit", "Tirer", ButtonStyle.Primary, "➕"),
          cb("cas:bj:stand", "Rester", ButtonStyle.Success, "✋"),
          cb("cas:bj:double", "Doubler", ButtonStyle.Danger, "✖️", st.player.length !== 2 || !st.canDouble),
        )],
  };
}

/* ========================================================================== */
/*                              ROULETTE                                      */
/* ========================================================================== */

const RED = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

const ROULETTE_BETS = {
  rouge:    { label: "Rouge", emoji: "🔴", pays: 2, test: (n) => RED.has(n) },
  noir:     { label: "Noir", emoji: "⚫", pays: 2, test: (n) => n !== 0 && !RED.has(n) },
  pair:     { label: "Pair", emoji: "2️⃣", pays: 2, test: (n) => n !== 0 && n % 2 === 0 },
  impair:   { label: "Impair", emoji: "1️⃣", pays: 2, test: (n) => n % 2 === 1 },
  manque:   { label: "1 à 18", emoji: "🔻", pays: 2, test: (n) => n >= 1 && n <= 18 },
  passe:    { label: "19 à 36", emoji: "🔺", pays: 2, test: (n) => n >= 19 },
  douzaine1:{ label: "1ʳᵉ douzaine", emoji: "🥇", pays: 3, test: (n) => n >= 1 && n <= 12 },
  douzaine2:{ label: "2ᵉ douzaine", emoji: "🥈", pays: 3, test: (n) => n >= 13 && n <= 24 },
  douzaine3:{ label: "3ᵉ douzaine", emoji: "🥉", pays: 3, test: (n) => n >= 25 },
};

const spinRoulette = () => Math.floor(Math.random() * 37);
const numColor = (n) => (n === 0 ? "🟢" : RED.has(n) ? "🔴" : "⚫");

/* ========================================================================== */
/*                              DÉMINEUR                                      */
/* ========================================================================== */

const GRID = 25;
const comb = (n, k) => { if (k > n) return 0; let r = 1; for (let x = 0; x < k; x++) r = (r * (n - x)) / (x + 1); return r; };

/** Multiplicateur après `k` cases sûres, avec `m` mines. */
function minesMultiplier(m, k) {
  if (k === 0) return 1;
  return (1 - EDGE) * (comb(GRID, k) / comb(GRID - m, k));
}

function minesView(guild, st, currency, done = false, blown = false) {
  const mult = minesMultiplier(st.mines, st.found.length);
  if (renderReady()) {
    const rows = [];
    if (!done) {
      for (let r = 0; r < 5; r++) {
        rows.push(crow(...Array.from({ length: 5 }, (_, cIdx) => {
          const n = r * 5 + cIdx;
          const opened = st.found.includes(n);
          return cb(`cas:mn:${n}`, "", opened ? ButtonStyle.Success : ButtonStyle.Secondary,
            opened ? "💚" : "🟦", opened);
        })));
      }
    }
    return {
      embeds: [embed({ guild, author: { name: "💣  Démineur" },
        color: done ? (blown ? COLORS.danger : COLORS.success) : COLORS.gold })],
      components: done
        ? [crow(cb("cas:pick:mines", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))]
        : [...rows.slice(0, 4), crow(
            cb("cas:mn:cash", `Encaisser ${num(Math.floor(st.bet * mult))}`, ButtonStyle.Success, "💰", st.found.length === 0),
            cb("cas:lobby", "Abandonner", ButtonStyle.Danger, "🏳️"))],
      _mn: { done, blown, mult },
    };
  }
  const grid = [];
  for (let n = 0; n < GRID; n++) {
    if (st.found.includes(n)) grid.push("💚");
    else if (done && st.bombs.includes(n)) grid.push(blown && n === st.last ? "💥" : "💣");
    else grid.push(done ? "⬛" : "🟦");
  }
  const lines = [];
  for (let r = 0; r < 5; r++) lines.push(grid.slice(r * 5, r * 5 + 5).join(""));

  const rows = [];
  if (!done) {
    for (let r = 0; r < 5; r++) {
      rows.push(crow(...Array.from({ length: 5 }, (_, cIdx) => {
        const n = r * 5 + cIdx;
        const opened = st.found.includes(n);
        return cb(`cas:mn:${n}`, "\u200b", opened ? ButtonStyle.Success : ButtonStyle.Secondary,
          opened ? "💚" : "🟦", opened);
      })));
    }
  }

  return {
    embeds: [embed({
      guild, color: done ? (blown ? COLORS.danger : COLORS.success) : COLORS.gold,
      author: { name: "💣  Démineur" },
      description: [
        lines.join("\n"),
        "",
        `**${st.mines}** mines · **${st.found.length}** case(s) ouverte(s)`,
        `Multiplicateur **×${mult.toFixed(2)}** → **${money(currency, Math.floor(st.bet * mult))}**`,
        done ? (blown ? "\n### 💥 Mine ! Mise perdue." : `\n### ✅ Encaissé`) : "",
      ].join("\n"),
      footer: done ? undefined : "Ouvre une case, ou encaisse tant que tu es en vie",
    })],
    components: done
      ? [crow(cb("cas:pick:mines", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))]
      : [...rows.slice(0, 4), crow(
          cb("cas:mn:cash", `Encaisser ${num(Math.floor(st.bet * mult))}`, ButtonStyle.Success, "💰", st.found.length === 0),
          cb("cas:lobby", "Abandonner", ButtonStyle.Danger, "🏳️"))],
  };
}

/* ========================================================================== */
/*                                  DÉS                                       */
/* ========================================================================== */

/** Cote et gain pour un seuil donné. */
function diceOdds(target, over) {
  const chance = over ? (100 - target) / 100 : (target - 1) / 100;
  return { chance, mult: chance > 0 ? (1 - EDGE) / chance : 0 };
}

/* ========================================================================== */
/*                                ROUTEUR                                     */
/* ========================================================================== */

async function handleCasino(i) {
  // Deux clics simultanés permettaient d'encaisser deux fois : on sérialise.
  return serialiser(i.guildId, i.user.id, () => casino(i), () =>
    i.reply({ content: "Une action est déjà en cours, patiente une seconde.", ...EPH }).catch(() => null));
}

async function casino(i) {
  const parts = i.customId.split(":");
  const action = parts[1];
  const config = await getConfig(i.guildId);
  const currency = config.economy.currency;
  const { enabled, min, max } = await limits(i.guildId);

  if (!config.economy.enabled || !enabled) {
    return i.reply({ content: "Le casino est fermé.", ...EPH });
  }

  const reply = async (payload) => {
    if (i.replied || i.deferred) return i.editReply(payload);
    return i.update(payload).catch(() => i.reply({ ...payload, ...EPH }));
  };

  /* ------------------------------- hall -------------------------------- */
  if (action === "lobby") {
    endSession(i);
    const w = await getWallet(i.guildId, i.user.id);
    return reply(await casinoLobby(i.guild, config, w));
  }

  if (action === "open") {
    const w = await getWallet(i.guildId, i.user.id);
    return i.reply({ ...(await casinoLobby(i.guild, config, w)), ...EPH });
  }

  /* ---------------------------- choix du jeu --------------------------- */
  if (action === "pick") {
    const game = parts[2];
    if (!GAMES[game] || config.casino?.games?.[game] === false)
      return reply({ content: "Ce jeu est indisponible.", embeds: [], components: [] });
    const w = await getWallet(i.guildId, i.user.id);
    if (w.coins < min) return reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Solde insuffisant` },
      description: `Il te faut au moins **${money(currency, min)}** pour jouer.` })],
      components: [crow(cb("cas:lobby", "Retour", ButtonStyle.Secondary, "◀️"))] });
    return reply(betView(i.guild, game, w, currency));
  }

  if (action === "betmodal") {
    const game = parts[2];
    return i.showModal(new ModalBuilder().setCustomId(`casm:bet:${game}`).setTitle(`${GAMES[game].label} — mise`)
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("bet").setLabel(`Entre ta mise (${num(min)} à ${num(max)})`)
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(9))));
  }

  if (action === "bet") return startGame(i, parts[2], Number(parts[3]), reply);
  if (action === "mnstart") return startMines(i, Number(parts[2]));

  /* -------------------------- machine à sous --------------------------- */
  if (action === "sl") {
    const st = getSession(i);
    if (!st) return reply({ content: "Partie expirée.", embeds: [], components: [] });
    return startGame(i, "slots", st.bet, reply);
  }

  /* ----------------------------- blackjack ----------------------------- */
  if (action === "bj") {
    const st = getSession(i);
    if (!st || st.game !== "blackjack") return reply({ content: "Partie expirée.", embeds: [], components: [] });
    const sub = parts[2];

    if (sub === "double") {
      const take = await takeBet(i, st.bet);
      if (!take.ok) return reply({ content: take.reason, embeds: [], components: [] });
      st.bet *= 2; st.canDouble = false;
      st.player.push(st.deck.pop());
      if (handValue(st.player) > 21) return finishBlackjack(i, st, currency, reply);
      return finishBlackjack(i, st, currency, reply);
    }
    if (sub === "hit") {
      st.player.push(st.deck.pop());
      st.canDouble = false;
      if (handValue(st.player) >= 21) return finishBlackjack(i, st, currency, reply);
      setSession(i, st);
      return envoyerBlackjack(i, st, currency, reply);
    }
    if (sub === "stand") return finishBlackjack(i, st, currency, reply);
  }

  /* ----------------------------- roulette ------------------------------ */
  if (action === "rl") {
    const st = getSession(i);
    if (!st || st.game !== "roulette") return reply({ content: "Partie expirée.", embeds: [], components: [] });
    const choix = parts[2];

    let win = 0, label = "";
    const n = spinRoulette();
    if (choix === "plein") {
      const cible = st.number;
      if (n === cible) win = Math.floor(st.bet * 36);
      label = `Numéro plein **${cible}**`;
    } else {
      const b = ROULETTE_BETS[choix];
      if (b.test(n)) win = Math.floor(st.bet * b.pays);
      label = b.label;
    }
    const solde = await payout(i, st.bet, win, "Roulette");
    endSession(i);
    const vue = {
      embeds: [embed({ guild: i.guild, color: win ? COLORS.success : COLORS.danger,
        author: { name: "🔴  Roulette" },
        description: renderReady() ? undefined : [
          `## ${numColor(n)} ${n}`,
          `Pari : **${label}**`,
          "",
          win ? `### Gagné — **${money(currency, win)}**` : "### Perdu",
          `Solde : **${money(currency, solde)}**`,
        ].join("\n") })],
      components: [crow(cb("cas:pick:roulette", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))],
    };
    return reply(await avecImage(i, vue, (avatar) => renderRoulette({
      ...carteJoueur(i), avatar, numero: n, pari: label, mise: st.bet, gain: win, solde })));
  }

  if (action === "rlnum") {
    const st = getSession(i);
    if (!st) return reply({ content: "Partie expirée.", embeds: [], components: [] });
    return i.showModal(new ModalBuilder().setCustomId("casm:rlnum").setTitle("Numéro plein — ×36")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("n").setLabel("Un numéro de 0 à 36")
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2))));
  }

  /* ----------------------------- démineur ------------------------------ */
  if (action === "mn") {
    const st = getSession(i);
    if (!st || st.game !== "mines") return reply({ content: "Partie expirée.", embeds: [], components: [] });
    const sub = parts[2];

    /** Termine la partie en affichant la grille, image ou texte. */
    const fin = async (saute, complement) => {
      const view = minesView(i.guild, st, currency, true, saute);
      if (view._mn) return envoyerMines(i, st, currency, reply, true, saute);
      if (complement) view.embeds[0].data.description += complement;
      return reply(view);
    };

    if (sub === "cash") {
      const mult = minesMultiplier(st.mines, st.found.length);
      const gain = Math.floor(st.bet * mult);
      const solde = await payout(i, st.bet, gain, "Démineur");
      endSession(i);
      return fin(false, `\nGain : **${money(currency, gain)}** · solde **${money(currency, solde)}**`);
    }

    const n = Number(sub);
    if (st.found.includes(n)) return envoyerMines(i, st, currency, reply);
    if (st.bombs.includes(n)) {
      st.last = n;
      endSession(i);
      await payout(i, st.bet, 0, "Démineur");
      return fin(true);
    }
    st.found.push(n);
    if (st.found.length >= GRID - st.mines) {
      const gain = Math.floor(st.bet * minesMultiplier(st.mines, st.found.length));
      await payout(i, st.bet, gain, "Démineur");
      endSession(i);
      return fin(false, `\n### Grille entière ! **${money(currency, gain)}**`);
    }
    setSession(i, st);
    return envoyerMines(i, st, currency, reply);
  }

  /* ------------------------------- dés --------------------------------- */
  if (action === "dc") {
    const st = getSession(i);
    if (!st || st.game !== "dice") return reply({ content: "Partie expirée.", embeds: [], components: [] });
    const over = parts[2] === "over";
    const { chance, mult } = diceOdds(st.target, over);
    const roll = Math.floor(Math.random() * 100) + 1;
    const gagne = over ? roll > st.target : roll < st.target;
    const gain = gagne ? Math.floor(st.bet * mult) : 0;
    const solde = await payout(i, st.bet, gain, "Dés");
    endSession(i);
    const vueD = {
      embeds: [embed({ guild: i.guild, color: gagne ? COLORS.success : COLORS.danger,
        author: { name: "🎲  Dés" },
        description: renderReady() ? undefined : [
          `## ${roll}`,
          `Pari : **${over ? "plus haut que" : "plus bas que"} ${st.target}** · ${(chance * 100).toFixed(0)} % de chance · ×${mult.toFixed(2)}`,
          "",
          gagne ? `### Gagné — **${money(currency, gain)}**` : "### Perdu",
          `Solde : **${money(currency, solde)}**`,
        ].join("\n") })],
      components: [crow(cb("cas:pick:dice", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))],
    };
    return reply(await avecImage(i, vueD, (avatar) => renderDice({
      ...carteJoueur(i), avatar, tirage: roll, seuil: st.target, dessus: over, chance, mult, mise: st.bet, gain, solde })));
  }

  if (action === "dctarget") {
    return i.showModal(new ModalBuilder().setCustomId("casm:dctarget").setTitle("Dés — seuil")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("t").setLabel("Seuil entre 2 et 98")
          .setStyle(TextInputStyle.Short).setRequired(true).setValue("50").setMaxLength(2))));
  }

  /* -------------------------- pile ou face ----------------------------- */
  if (action === "fl") {
    const st = getSession(i);
    if (!st || st.game !== "flip") return reply({ content: "Partie expirée.", embeds: [], components: [] });
    const choix = parts[2];
    const sortie = Math.random() < 0.5 ? "pile" : "face";
    const gagne = choix === sortie;
    const gain = gagne ? Math.floor(st.bet * 1.96) : 0;
    const solde = await payout(i, st.bet, gain, "Pile ou face");
    endSession(i);
    const vueF = {
      embeds: [embed({ guild: i.guild, color: gagne ? COLORS.success : COLORS.danger,
        author: { name: "🪙  Pile ou face" },
        description: renderReady() ? undefined : [
          `## ${sortie === "pile" ? "🪙 Pile" : "👑 Face"}`,
          `Ton choix : **${choix}**`,
          "",
          gagne ? `### Gagné — **${money(currency, gain)}**` : "### Perdu",
          `Solde : **${money(currency, solde)}**`,
        ].join("\n") })],
      components: [crow(cb("cas:pick:flip", "Rejouer", ButtonStyle.Success, "🔁"), cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))],
    };
    return reply(await avecImage(i, vueF, (avatar) => renderFlip({
      ...carteJoueur(i), avatar, sortie, choix, mise: st.bet, gain, solde })));
  }
}

/* ========================================================================== */
/*                          LANCEMENT DES PARTIES                             */
/* ========================================================================== */

async function startGame(i, game, bet, reply) {
  const config = await getConfig(i.guildId);
  const currency = config.economy.currency;
  bet = Math.floor(bet);

  const take = await takeBet(i, bet);
  if (!take.ok) {
    const w = await getWallet(i.guildId, i.user.id);
    return reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Mise refusée` }, description: take.reason })],
      components: [crow(cb(`cas:pick:${game}`, "Changer de mise", ButtonStyle.Primary, "✏️"),
        cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))] });
  }

  /* ---------------------------- slots ---------------------------------- */
  if (game === "slots") {
    const r = playSlots();
    const gain = Math.floor(bet * r.mult);

    // Les rouleaux s'arrêtent un par un : c'est ce qui fait la tension
    const roue = ["🍒", "🍋", "🍊", "🔔", "💎", "7️⃣", "🌟"];
    const alea = () => roue[Math.floor(Math.random() * roue.length)];
    const cadre = (a, b2, c2) => [
      "```",
      "  ╔═══╤═══╤═══╗",
      `  ║ ${a} │ ${b2} │ ${c2} ║`,
      "  ╚═══╧═══╧═══╝",
      "```",
    ].join("\n");

    const etape = (desc, couleur) => ({
      embeds: [embed({ guild: i.guild, color: couleur, author: { name: "🎰  Machine à sous" }, description: desc })],
      components: [],
    });

    await reply(etape(cadre(alea(), alea(), alea()) + "\n*Les rouleaux tournent…*", COLORS.gold));
    await new Promise((res) => setTimeout(res, 800));
    await reply(etape(cadre(r.reels[0].s, alea(), alea()) + "\n*Premier rouleau…*", COLORS.gold));
    await new Promise((res) => setTimeout(res, 800));
    await reply(etape(cadre(r.reels[0].s, r.reels[1].s, alea()) + "\n*Deuxième rouleau…*", COLORS.gold));
    await new Promise((res) => setTimeout(res, 900));

    const solde = await payout(i, bet, gain, "Machine à sous");
    setSession(i, { game: "slots", bet });
    const vueS = {
      embeds: [embed({ guild: i.guild, color: gain ? COLORS.success : COLORS.danger,
        author: { name: "🎰  Machine à sous" },
        description: [
          "```",
          "  ╔═══╤═══╤═══╗",
          `  ║ ${r.reels[0].s} │ ${r.reels[1].s} │ ${r.reels[2].s} ║`,
          "  ╚═══╧═══╧═══╝",
          "```",
          `**${r.label}**`,
          "",
          gain ? `### Gagné — **${money(currency, gain)}** (×${r.mult})` : "### Perdu",
          `Solde : **${money(currency, solde)}**`,
        ].join("\n"),
        footer: "🌟🌟🌟 ×1500 · 7️⃣7️⃣7️⃣ ×300 · 💎💎💎 ×125 · 🔔🔔🔔 ×40 · 🍊🍊🍊 ×27" })],
      components: [crow(cb("cas:sl", `Relancer (${num(bet)})`, ButtonStyle.Success, "🔁"),
        cb("cas:pick:slots", "Changer de mise", ButtonStyle.Secondary, "✏️"),
        cb("cas:lobby", "Casino", ButtonStyle.Secondary, "🎰"))],
    };
    const motSym = MOT_SYMBOLE[r.reels[0].s] ?? "symboles";
    const libelleImage = r.mult >= 5 ? `Trois ${motSym} !`
      : r.mult > 0 ? `Paire de ${motSym}` : "Aucune combinaison";
    return reply(await avecImage(i, vueS, (avatar) => renderSlots({
      ...carteJoueur(i), avatar, reels: r.reels.map((x) => x.s), mult: r.mult,
      libelle: libelleImage, mise: bet, gain, solde })));
  }

  /* -------------------------- blackjack -------------------------------- */
  if (game === "blackjack") {
    const deck = newDeck();
    const st = { game: "blackjack", bet, deck, canDouble: true,
      player: [deck.pop(), deck.pop()], dealer: [deck.pop(), deck.pop()] };
    if (handValue(st.player) === 21) { setSession(i, st); return finishBlackjack(i, st, currency, reply, true); }
    setSession(i, st);
    return envoyerBlackjack(i, st, currency, reply);
  }

  /* --------------------------- roulette -------------------------------- */
  if (game === "roulette") {
    setSession(i, { game: "roulette", bet });
    return reply({
      embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "🔴  Roulette européenne" },
        description: [
          `Mise : **${money(currency, bet)}**`,
          "",
          "**×2** — Rouge, Noir, Pair, Impair, 1-18, 19-36",
          "**×3** — les douzaines",
          "**×36** — un numéro plein",
          "",
          "_Un seul zéro : la maison garde 2,7 %, comme au casino._",
        ].join("\n") })],
      components: [
        crow(cb("cas:rl:rouge", "Rouge", ButtonStyle.Danger, "🔴"), cb("cas:rl:noir", "Noir", ButtonStyle.Secondary, "⚫"),
             cb("cas:rl:pair", "Pair", ButtonStyle.Primary), cb("cas:rl:impair", "Impair", ButtonStyle.Primary)),
        crow(cb("cas:rl:manque", "1 à 18", ButtonStyle.Secondary), cb("cas:rl:passe", "19 à 36", ButtonStyle.Secondary),
             cb("cas:rl:douzaine1", "1-12", ButtonStyle.Secondary), cb("cas:rl:douzaine2", "13-24", ButtonStyle.Secondary),
             cb("cas:rl:douzaine3", "25-36", ButtonStyle.Secondary)),
        crow(cb("cas:rlnum", "Numéro plein ×36", ButtonStyle.Success, "🎯"), cb("cas:lobby", "Annuler", ButtonStyle.Secondary, "◀️")),
      ],
    });
  }

  /* ---------------------------- démineur ------------------------------- */
  if (game === "mines") {
    setSession(i, { game: "minesSetup", bet });
    return reply({
      embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "💣  Démineur" },
        description: [`Mise : **${money(currency, bet)}**`, "", "Combien de mines dans la grille de 25 ?",
          "Plus il y en a, plus chaque case rapporte."].join("\n"),
        fields: [1, 3, 5, 10].map((m) => ({ name: `${m} mine${m > 1 ? "s" : ""}`,
          value: `1 case : ×${minesMultiplier(m, 1).toFixed(2)}\n5 cases : ×${minesMultiplier(m, 5).toFixed(2)}`, inline: true })) })],
      components: [crow(...[1, 3, 5, 10, 15].map((m) => cb(`cas:mnstart:${m}`, `${m}`, ButtonStyle.Primary, "💣"))),
        crow(cb("cas:lobby", "Annuler", ButtonStyle.Secondary, "◀️"))],
    });
  }

  /* ------------------------------- dés --------------------------------- */
  if (game === "dice") {
    setSession(i, { game: "dice", bet, target: 50 });
    return diceView(i, 50, bet, currency, reply);
  }

  /* -------------------------- pile ou face ----------------------------- */
  if (game === "flip") {
    setSession(i, { game: "flip", bet });
    return reply({
      embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "🪙  Pile ou face" },
        description: `Mise : **${money(currency, bet)}**\nGain : **×1,96**\n\nPile ou face ?` })],
      components: [crow(cb("cas:fl:pile", "Pile", ButtonStyle.Primary, "🪙"),
        cb("cas:fl:face", "Face", ButtonStyle.Primary, "👑"),
        cb("cas:lobby", "Annuler", ButtonStyle.Secondary, "◀️"))],
    });
  }
}

function diceView(i, target, bet, currency, reply) {
  const o = diceOdds(target, true), u = diceOdds(target, false);
  return reply({
    embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "🎲  Dés" },
      description: [
        `Mise : **${money(currency, bet)}** · seuil **${target}**`,
        "",
        `🔺 **Plus haut que ${target}** — ${(o.chance * 100).toFixed(0)} % · ×${o.mult.toFixed(2)}`,
        `🔻 **Plus bas que ${target}** — ${(u.chance * 100).toFixed(0)} % · ×${u.mult.toFixed(2)}`,
        "",
        "_Un dé de 1 à 100. Change le seuil pour ajuster le risque._",
      ].join("\n") })],
    components: [
      crow(cb("cas:dc:over", `Plus haut (×${o.mult.toFixed(2)})`, ButtonStyle.Success, "🔺"),
           cb("cas:dc:under", `Plus bas (×${u.mult.toFixed(2)})`, ButtonStyle.Danger, "🔻")),
      crow(cb("cas:dctarget", "Changer le seuil", ButtonStyle.Primary, "🎚️"),
           cb("cas:lobby", "Annuler", ButtonStyle.Secondary, "◀️")),
    ],
  });
}

async function finishBlackjack(i, st, currency, reply, natural = false) {
  while (handValue(st.dealer) < 17) st.dealer.push(st.deck.pop());
  const pv = handValue(st.player), dv = handValue(st.dealer);

  let win = 0, text;
  if (pv > 21) { win = 0; text = "💥 Tu dépasses 21"; }
  else if (natural && pv === 21) { win = Math.floor(st.bet * 2.5); text = "🃏 Blackjack ! Payé 3 pour 2"; }
  else if (dv > 21) { win = st.bet * 2; text = "Le croupier dépasse — gagné"; }
  else if (pv > dv) { win = st.bet * 2; text = `${pv} contre ${dv} — gagné`; }
  else if (pv === dv) { win = st.bet; text = "Égalité — mise rendue"; }
  else { win = 0; text = `${pv} contre ${dv} — perdu`; }

  await payout(i, st.bet, win, "Blackjack");
  const solde = (await getWallet(i.guildId, i.user.id)).coins;
  endSession(i);
  const view = blackjackView(i.guild, st, currency, true, { win: win - st.bet, text });
  if (view._bj) return envoyerBlackjack(i, st, currency, reply, true, { win: win - st.bet, text });
  view.embeds[0].data.description += `\nSolde : **${money(currency, solde)}**`;
  return reply(view);
}

/* ========================================================================== */
/*                          FENÊTRES DE SAISIE                                */
/* ========================================================================== */

async function handleCasinoModal(i) {
  const parts = i.customId.split(":");
  const config = await getConfig(i.guildId);
  const currency = config.economy.currency;
  const reply = async (payload) => (i.replied || i.deferred ? i.editReply(payload) : i.update(payload).catch(() => i.reply({ ...payload, ...EPH })));

  if (parts[1] === "bet") {
    const bet = parseInt(i.fields.getTextInputValue("bet").replace(/\D/g, ""), 10);
    return startGame(i, parts[2], bet, reply);
  }

  if (parts[1] === "rlnum") {
    const st = getSession(i);
    if (!st) return i.reply({ content: "Partie expirée.", ...EPH });
    const n = parseInt(i.fields.getTextInputValue("n"), 10);
    if (!Number.isFinite(n) || n < 0 || n > 36) return i.reply({ content: "Un numéro entre 0 et 36.", ...EPH });
    st.number = n; setSession(i, st);
    i.customId = "cas:rl:plein";
    return handleCasino(i);
  }

  if (parts[1] === "dctarget") {
    const st = getSession(i);
    if (!st) return i.reply({ content: "Partie expirée.", ...EPH });
    const t = parseInt(i.fields.getTextInputValue("t"), 10);
    if (!Number.isFinite(t) || t < 2 || t > 98) return i.reply({ content: "Un seuil entre 2 et 98.", ...EPH });
    st.target = t; setSession(i, st);
    return diceView(i, t, st.bet, currency, reply);
  }
}

/** Démarrage du démineur, une fois le nombre de mines choisi. */
async function startMines(i, mines) {
  const st = getSession(i);
  if (!st) return i.update({ content: "Partie expirée.", embeds: [], components: [] }).catch(() => null);
  const config = await getConfig(i.guildId);
  const bombs = [];
  while (bombs.length < mines) {
    const n = Math.floor(Math.random() * GRID);
    if (!bombs.includes(n)) bombs.push(n);
  }
  const state = { game: "mines", bet: st.bet, mines, bombs, found: [] };
  setSession(i, state);
  const reply = async (p) => (i.replied || i.deferred ? i.editReply(p) : i.update(p).catch(() => null));
  return envoyerMines(i, state, config.economy.currency, reply).catch(() => null);
}

/* ========================================================================== */
/*                            13 - PURGE DE MASSE                             */
/* ========================================================================== */

// masspurge.js — purge de masse : plusieurs salons d'un coup, sans les supprimer.


/** Limite Discord : la suppression groupée ignore tout ce qui dépasse 14 jours. */
const MAX_AGE_MS = 13.5 * 86_400_000;
const HARD_CAP = 5000;        // plafond par salon, pour ne jamais tourner sans fin
const TIME_BUDGET_MS = 9 * 60_000;

/** Demandes en attente de confirmation : userId -> { guildId, ids, label } */
const pending = new Map();

function stashPurge(userId, data) {
  pending.set(userId, { ...data, at: Date.now() });
}
function takePurge(userId) {
  const p = pending.get(userId);
  if (!p || Date.now() - p.at > 10 * 60_000) { pending.delete(userId); return null; }
  return p;
}
function clearPurge(userId) { pending.delete(userId); }

/* ========================================================================== */
/*                            CHOIX DES SALONS                                */
/* ========================================================================== */

const PURGEABLE = [ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice];

/**
 * Sépare ce qui sera purgé de ce qui est épargné.
 * Les salons de journaux sont protégés d'office : y effacer les traces
 * de modération serait le pire effet de bord possible.
 */
function planPurge(guild, config, { scope, categoryId = null, channelIds = null }) {
  const logIds = new Set();
  for (const key of Object.keys(LOG_ROUTES)) {
    const ch = resolveLogChannel(guild, key, config);
    if (ch) logIds.add(ch.id);
  }
  const manual = new Set(config.purge?.protectedChannels ?? []);

  let candidates = [];
  if (scope === "channels") {
    candidates = (channelIds ?? []).map((id) => guild.channels.cache.get(id)).filter(Boolean);
  } else if (scope === "category") {
    candidates = [...guild.channels.cache.values()].filter((c) => c.parentId === categoryId);
  } else {
    candidates = [...guild.channels.cache.values()];
  }

  const targets = [];
  const skipped = [];
  for (const ch of candidates) {
    if (!PURGEABLE.includes(ch.type)) continue;
    if (logIds.has(ch.id)) { skipped.push({ ch, why: "journal" }); continue; }
    if (manual.has(ch.id)) { skipped.push({ ch, why: "protégé" }); continue; }
    if (!canSend(ch)) { skipped.push({ ch, why: "inaccessible" }); continue; }
    if (!ch.permissionsFor(guild.members.me)?.has(PermissionFlagsBits.ManageMessages)) {
      skipped.push({ ch, why: "permission manquante" }); continue;
    }
    targets.push(ch);
  }
  return { targets, skipped };
}

/* ========================================================================== */
/*                              EXÉCUTION                                     */
/* ========================================================================== */

/**
 * Vide les salons choisis. Rien n'est supprimé au-delà de 14 jours,
 * et les messages épinglés sont toujours conservés.
 * @returns {Promise<{deleted:number, perChannel:Array, partial:boolean}>}
 */
async function runMassPurge(guild, targets, perChannelLimit, moderator) {
  const started = Date.now();
  const perChannel = [];
  let deleted = 0;
  let partial = false;

  for (const channel of targets) {
    if (Date.now() - started > TIME_BUDGET_MS) { partial = true; break; }

    let removedHere = 0;
    const cap = perChannelLimit > 0 ? perChannelLimit : HARD_CAP;

    // On boucle par paquets de 100, la limite d'un appel groupé
    for (let pass = 0; pass < Math.ceil(cap / 100); pass++) {
      if (Date.now() - started > TIME_BUDGET_MS) { partial = true; break; }

      const fetched = await channel.messages.fetch({ limit: 100 }).catch(() => null);
      if (!fetched) break;
      const list = typeof fetched.values === "function" ? [...fetched.values()] : [];
      const cutoff = Date.now() - MAX_AGE_MS;
      const batch = list
        .filter((m) => m.createdTimestamp > cutoff && !m.pinned)
        .slice(0, Math.min(100, cap - removedHere));
      if (!batch.length) break;

      const done = await channel.bulkDelete(batch, true).catch(() => null);
      const n = done?.size ?? 0;
      removedHere += n;
      deleted += n;
      if (n < batch.length) break;   // plus rien de supprimable ici

      await new Promise((r) => setTimeout(r, 900));
    }

    if (removedHere) perChannel.push({ channel, count: removedHere });
    await new Promise((r) => setTimeout(r, 400));
  }

  await log(guild, "messagePurge", embed({
    guild, color: COLORS.danger, author: { name: "🧹  Purge de masse" },
    description: `**${num(deleted)}** message(s) supprimé(s) dans **${perChannel.length}** salon(s).`,
    fields: [
      { name: "Lancée par", value: `<@${moderator.id}>`, inline: true },
      { name: "Salons visés", value: `${targets.length}`, inline: true },
      ...(partial ? [{ name: "⚠️ Interrompue", value: "Temps maximum atteint — relance pour finir." }] : []),
      { name: "Détail", value: perChannel.slice(0, 20).map((x) => `${x.channel} — ${num(x.count)}`).join("\n").slice(0, 1000) || "—" },
    ],
  }));

  return { deleted, perChannel, partial };
}

/* ========================================================================== */
/*                                 AFFICHAGE                                  */
/* ========================================================================== */

function previewEmbed(guild, plan, label) {
  const byReason = {};
  for (const s of plan.skipped) (byReason[s.why] ??= []).push(s.ch);

  return embed({
    guild,
    color: plan.targets.length ? COLORS.danger : COLORS.warning,
    author: { name: "🧹  Purge de masse — aperçu" },
    description: [
      `Portée : **${label}**`,
      "",
      plan.targets.length
        ? `### ${plan.targets.length} salon(s) seront vidés`
        : `### ${ICONS.no} Aucun salon à purger`,
      plan.targets.slice(0, 30).map((c) => `${c}`).join(" ").slice(0, 1500),
      plan.targets.length > 30 ? `\n_… et ${plan.targets.length - 30} autre(s)_` : "",
    ].filter(Boolean).join("\n"),
    fields: Object.entries(byReason).map(([why, list]) => ({
      name: `Épargnés — ${why} (${list.length})`,
      value: list.slice(0, 15).map((c) => `${c}`).join(" ").slice(0, 1000),
    })),
    footer: "Rien au-delà de 14 jours · les messages épinglés sont conservés · les salons ne sont pas supprimés",
  });
}

/* ========================================================================== */
/*                          14 - VOCAUX TEMPORAIRES                           */
/* ========================================================================== */

// tempvoice.js — « Créer ton vocal » : salons vocaux temporaires.


const tvBtn = (id, label, style = ButtonStyle.Secondary, emoji, disabled = false) => {
  const btnB = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(disabled);
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) btnB.setLabel(clean.slice(0, 80));
  if (emoji) btnB.setEmoji(emoji);
  if (!clean && !emoji) btnB.setLabel("·");
  return btnB;
};

/* ========================================================================== */
/*                         REPÉRAGE DU SALON D'ACCUEIL                        */
/* ========================================================================== */

function resolveHub(guild, config) {
  const forced = config.tempVoice?.hubId;
  if (forced) {
    const ch = guild.channels.cache.get(forced);
    if (ch) return ch;
  }
  const byName = findChannel(guild, FUNC_CHANNELS.tempVoiceHub);
  if (byName && (byName.type === ChannelType.GuildVoice || byName.type === ChannelType.GuildStageVoice)) return byName;
  // Repli : un vocal dont le nom évoque la création
  return guild.channels.cache.find(
    (c) => c.type === ChannelType.GuildVoice && /cr[ée]e|create|\+/i.test(c.name)) ?? null;
}

/* ========================================================================== */
/*                              CRÉATION                                      */
/* ========================================================================== */

/**
 * Crée le vocal du membre et l'y déplace.
 * Le salon apparaît juste sous le salon d'accueil, dans la même catégorie.
 */
async function createTempVoice(member, hub, config) {
  const guild = member.guild;
  const tv = config.tempVoice ?? {};

  const parentId = tv.categoryId ?? hub.parentId ?? null;
  const name = (tv.nameTemplate || "🔊 {user}")
    .replaceAll("{user}", member.displayName ?? member.user.username)
    .slice(0, 100);

  const channel = await guild.channels.create({
    name,
    type: ChannelType.GuildVoice,
    parent: parentId,
    position: hub.position + 1,
    userLimit: Math.max(0, Math.min(99, Number(tv.defaultLimit ?? 0))),
    reason: `Vocal temporaire de ${member.user.tag}`,
    permissionOverwrites: [
      {
        id: member.id,
        allow: [
          PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect,
          PermissionFlagsBits.Speak, PermissionFlagsBits.Stream,
          PermissionFlagsBits.SendMessages, PermissionFlagsBits.ReadMessageHistory,
        ],
      },
      {
        id: guild.members.me.id,
        allow: [
          PermissionFlagsBits.ViewChannel, PermissionFlagsBits.Connect,
          PermissionFlagsBits.ManageChannels, PermissionFlagsBits.MoveMembers,
          PermissionFlagsBits.SendMessages,
        ],
      },
    ],
  }).catch((e) => { console.error("[vocal] création impossible :", e.message); return null; });

  if (!channel) return null;

  await member.voice.setChannel(channel).catch(() => null);
  await registerTempVoice(guild.id, channel.id, member.id);

  await channel.send(controlPanel(member, channel)).catch(() => null);
  return channel;
}

/** Panneau de commande envoyé dans le salon vocal lui-même. */
function controlPanel(member, channel) {
  return {
    content: `${member}`,
    embeds: [embed({
      guild: channel.guild,
      color: COLORS.primary,
      author: { name: "🔊  Ton salon vocal" },
      description: [
        `Tu es le propriétaire de **${channel.name}**. Il disparaîtra quand il sera vide.`,
        "",
        "Utilise les boutons ci-dessous pour le régler. Personne d'autre n'y a accès.",
      ].join("\n"),
      footer: "Si tu pars et que quelqu'un reste, il pourra le récupérer",
    })],
    components: [
      new ActionRowBuilder().addComponents(
        tvBtn("tv:rename", "Renommer", ButtonStyle.Primary, "✏️"),
        tvBtn("tv:limit", "Limite", ButtonStyle.Primary, "👥"),
        tvBtn("tv:lock", "Verrouiller", ButtonStyle.Secondary, "🔒"),
        tvBtn("tv:hide", "Masquer", ButtonStyle.Secondary, "🙈"),
        tvBtn("tv:bitrate", "Qualité", ButtonStyle.Secondary, "🎚️"),
      ),
      new ActionRowBuilder().addComponents(
        tvBtn("tv:invite", "Autoriser quelqu'un", ButtonStyle.Success, "➕"),
        tvBtn("tv:kick", "Expulser", ButtonStyle.Danger, "👢"),
        tvBtn("tv:transfer", "Transférer", ButtonStyle.Secondary, "👑"),
        tvBtn("tv:claim", "Récupérer", ButtonStyle.Secondary, "🙋"),
        tvBtn("tv:delete", "Supprimer", ButtonStyle.Danger, "🗑️"),
      ),
    ],
  };
}

/* ========================================================================== */
/*                              SUPPRESSION                                   */
/* ========================================================================== */

/** Compte les personnes réellement présentes, sans dépendre du cache membres. */
function occupants(guild, channelId) {
  let n = 0;
  for (const vs of guild.voiceStates.cache.values()) if (vs.channelId === channelId) n++;
  return n;
}

/** Supprime le salon s'il est vide. */
async function cleanupIfEmpty(guild, channelId, config) {
  const record = await getTempVoice(channelId);
  if (!record) return false;
  if (occupants(guild, channelId) > 0) return false;

  const wait = Math.max(0, Number(config?.tempVoice?.keepEmptySeconds ?? 5)) * 1000;
  setTimeout(async () => {
    if (occupants(guild, channelId) > 0) return;
    const ch = guild.channels.cache.get(channelId);
    if (ch) await ch.delete("Vocal temporaire vide").catch(() => null);
    await dropTempVoice(channelId);
  }, wait);
  return true;
}

/** Au démarrage : efface les salons temporaires restés vides après une coupure. */
async function purgeOrphans(guild) {
  const rows = await listTempVoice(guild.id);
  let removed = 0;
  for (const row of rows) {
    const ch = guild.channels.cache.get(row.channel_id);
    if (!ch) { await dropTempVoice(row.channel_id); removed++; continue; }
    if (occupants(guild, row.channel_id) === 0) {
      await ch.delete("Vocal temporaire orphelin").catch(() => null);
      await dropTempVoice(row.channel_id);
      removed++;
    }
  }
  return removed;
}

/* ========================================================================== */
/*                          BOUTONS DU PROPRIÉTAIRE                           */
/* ========================================================================== */

async function guard(i) {
  const record = await getTempVoice(i.channelId);
  if (!record) {
    await i.reply({ content: "Ce salon n'est pas un vocal temporaire.", ...EPH }).catch(() => null);
    return null;
  }
  const config = await getConfig(i.guildId);
  const isOwnerOfChannel = record.owner_id === i.user.id;
  const isStaff = permLevel(i.member, config) >= 2;
  if (!isOwnerOfChannel && !isStaff) {
    await i.reply({ content: `Seul <@${record.owner_id}> peut régler ce salon.`, ...EPH }).catch(() => null);
    return null;
  }
  return { record, config, channel: i.channel };
}

async function handleTempVoice(i) {
  const [, action] = i.customId.split(":");

  /* --- Récupération : ouverte à tous si le propriétaire est parti --- */
  if (action === "claim") {
    const record = await getTempVoice(i.channelId);
    if (!record) return i.reply({ content: "Ce salon n'est pas un vocal temporaire.", ...EPH });
    const stillHere = [...i.guild.voiceStates.cache.values()]
      .some((vs) => vs.channelId === i.channelId && vs.id === record.owner_id);
    if (stillHere) return i.reply({ content: `<@${record.owner_id}> est toujours là : le salon reste à lui.`, ...EPH });
    if (!i.member.voice?.channelId || i.member.voice.channelId !== i.channelId)
      return i.reply({ content: "Il faut être connecté dans ce salon pour le récupérer.", ...EPH });
    await setTempVoiceOwner(i.channelId, i.user.id);
    await i.channel.permissionOverwrites.edit(i.user.id, {
      ViewChannel: true, Connect: true, Speak: true, SendMessages: true,
    }).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: "👑  Salon récupéré" }, description: `${i.user} est le nouveau propriétaire.` })] });
  }

  const ctx = await guard(i);
  if (!ctx) return;
  const { channel } = ctx;
  const everyone = i.guild.roles.everyone.id;

  if (action === "rename") {
    return i.showModal(new ModalBuilder().setCustomId("tvm:rename").setTitle("Renommer le salon")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("name").setLabel("Nouveau nom")
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(90).setValue(channel.name))));
  }

  if (action === "limit") {
    return i.showModal(new ModalBuilder().setCustomId("tvm:limit").setTitle("Limite de places")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("limit").setLabel("Nombre de places (0 = illimité)")
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(2)
          .setValue(String(channel.userLimit ?? 0)))));
  }

  if (action === "bitrate") {
    return i.showModal(new ModalBuilder().setCustomId("tvm:bitrate").setTitle("Qualité audio")
      .addComponents(new ActionRowBuilder().addComponents(
        new TextInputBuilder().setCustomId("kbps").setLabel("Débit en kbps (8 à 96)")
          .setStyle(TextInputStyle.Short).setRequired(true).setMaxLength(3)
          .setValue(String(Math.round((channel.bitrate ?? 64000) / 1000))))));
  }

  if (action === "lock") {
    const locked = channel.permissionOverwrites.cache.get(everyone)?.deny.has(PermissionFlagsBits.Connect);
    await channel.permissionOverwrites.edit(everyone, { Connect: locked ? null : false }).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: locked ? COLORS.success : COLORS.warning,
      author: { name: locked ? "🔓  Salon ouvert" : "🔒  Salon verrouillé" },
      description: locked ? "N'importe qui peut de nouveau rejoindre." : "Seules les personnes déjà présentes ou autorisées peuvent rejoindre." })] });
  }

  if (action === "hide") {
    const hidden = channel.permissionOverwrites.cache.get(everyone)?.deny.has(PermissionFlagsBits.ViewChannel);
    await channel.permissionOverwrites.edit(everyone, { ViewChannel: hidden ? null : false }).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: hidden ? COLORS.success : COLORS.warning,
      author: { name: hidden ? "👀  Salon visible" : "🙈  Salon masqué" },
      description: hidden ? "Tout le monde le voit de nouveau." : "Il n'apparaît plus dans la liste des salons." })] });
  }

  if (action === "invite") {
    return i.reply({ embeds: [embed({ guild: i.guild, author: { name: "➕  Autoriser quelqu'un" },
      description: "Choisis la personne à laisser entrer, même si le salon est verrouillé." })],
      components: [new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder().setCustomId("tv:invitepick").setPlaceholder("Choisis un membre…"))], ...EPH });
  }

  if (action === "invitepick") {
    const uid = i.values[0];
    await channel.permissionOverwrites.edit(uid, { ViewChannel: true, Connect: true, Speak: true }).catch(() => null);
    return i.update({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: `${ICONS.ok}  Autorisé` }, description: `<@${uid}> peut rejoindre ce salon.` })], components: [] });
  }

  if (action === "kick") {
    return i.reply({ embeds: [embed({ guild: i.guild, author: { name: "👢  Expulser du salon" },
      description: "La personne sera déconnectée et ne pourra plus revenir." })],
      components: [new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder().setCustomId("tv:kickpick").setPlaceholder("Choisis un membre…"))], ...EPH });
  }

  if (action === "kickpick") {
    const uid = i.values[0];
    if (uid === ctx.record.owner_id) return i.update({ content: "Tu ne peux pas t'expulser toi-même.", embeds: [], components: [] });
    const target = await i.guild.members.fetch(uid).catch(() => null);
    if (target?.voice?.channelId === channel.id) await target.voice.disconnect("Expulsé du vocal temporaire").catch(() => null);
    await channel.permissionOverwrites.edit(uid, { Connect: false }).catch(() => null);
    return i.update({ embeds: [embed({ guild: i.guild, color: COLORS.warning,
      author: { name: "👢  Expulsé" }, description: `<@${uid}> ne peut plus rejoindre ce salon.` })], components: [] });
  }

  if (action === "transfer") {
    return i.reply({ embeds: [embed({ guild: i.guild, author: { name: "👑  Transférer le salon" },
      description: "La personne choisie deviendra propriétaire à ta place." })],
      components: [new ActionRowBuilder().addComponents(
        new UserSelectMenuBuilder().setCustomId("tv:transferpick").setPlaceholder("Choisis un membre…"))], ...EPH });
  }

  if (action === "transferpick") {
    const uid = i.values[0];
    await setTempVoiceOwner(channel.id, uid);
    await channel.permissionOverwrites.edit(uid, { ViewChannel: true, Connect: true, Speak: true, SendMessages: true }).catch(() => null);
    return i.update({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: "👑  Propriétaire transféré" }, description: `<@${uid}> gère désormais ce salon.` })], components: [] });
  }

  if (action === "delete") {
    await i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: "🗑️  Suppression" }, description: "Le salon disparaît dans un instant." })] }).catch(() => null);
    await dropTempVoice(channel.id);
    setTimeout(() => channel.delete("Supprimé par son propriétaire").catch(() => null), 2000);
    return;
  }
}

/** Traitement des fenêtres de saisie du propriétaire. */
async function handleTempVoiceModal(i) {
  const ctx = await guard(i);
  if (!ctx) return;
  const { channel } = ctx;
  const [, action] = i.customId.split(":");
  const value = i.fields.getTextInputValue(action === "rename" ? "name" : action === "limit" ? "limit" : "kbps").trim();

  if (action === "rename") {
    await channel.setName(value.slice(0, 90), `Renommé par ${i.user.tag}`).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: "✏️  Renommé" }, description: `Le salon s'appelle maintenant **${value.slice(0, 90)}**.` })] });
  }

  if (action === "limit") {
    const n = Math.max(0, Math.min(99, parseInt(value, 10) || 0));
    await channel.setUserLimit(n).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: "👥  Limite modifiée" },
      description: n === 0 ? "Le salon est de nouveau **illimité**." : `Le salon accepte **${n}** personne(s).` })] });
  }

  if (action === "bitrate") {
    const kbps = Math.max(8, Math.min(96, parseInt(value, 10) || 64));
    await channel.setBitrate(kbps * 1000).catch(() => null);
    return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
      author: { name: "🎚️  Qualité modifiée" }, description: `Débit réglé sur **${kbps} kbps**.` })] });
  }
}

/* ========================================================================== */
/*                          15 - RECOMPENSES VOCALES                          */
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

  // Le temps de présence est compté pour tout le monde : il sert aux grades,
  // indépendamment des conditions de récompense.
  for (const group of byChannel.values()) {
    for (const { member } of group) {
      if (member) await addVoiceMinutes(guild.id, member.id, minutes);
    }
  }

  for (const group of byChannel.values()) {
    if (group.length < (v.minMembers ?? 2)) continue;

    for (const { member } of group) {
      if (!member) continue;
      let xp = baseXp;
      const boost = await getBoost(guild.id, member.id);
      if (boost) xp = Math.round(xp * boost.multiplier);

      const result = await addXp(guild.id, member.id, xp);
      if (baseCoins > 0 && config.economy?.enabled) await addCoins(guild.id, member.id, baseCoins);
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
/*                            16 - MENUS DE ROLES                             */
/* ========================================================================== */

// rolemenus.js — panneaux de rôles à choisir soi-même, groupés par catégorie.


/* ========================================================================== */
/*                          LECTURE DES NOMS DE RÔLES                         */
/* ========================================================================== */

/** Les rôles séparateurs — barres pleines — ne sont jamais proposés. */
function isSeparator(role) {
  const n = role.name.replace(/[\s\u200B-\u200D\uFEFF]/g, "");
  return n.length > 0 && /^[▬─━—_═\-=·•|]+$/.test(n);
}

/**
 * Découpe « 🥂 ¦En Couple » en emoji + libellé.
 * Les séparateurs décoratifs (¦ | • -) sont retirés du libellé.
 */
function roleLabel(role) {
  const raw = role.name.trim();
  // Un emoji peut porter un sélecteur de variante, une teinte de peau
  // (🤏🏽) ou être une séquence liée (👨‍👩‍👧). On capture l'ensemble.
  const m = raw.match(/^(\p{Extended_Pictographic}(?:[\uFE0F\u{1F3FB}-\u{1F3FF}]|\u200D\p{Extended_Pictographic}[\uFE0F]?)*)/u);
  const emoji = m ? m[1] : null;
  let label = (m ? raw.slice(m[0].length) : raw).replace(/^[\s¦|•·\-—:]+/, "").trim();
  if (!label) label = raw;
  return { emoji, label: label.slice(0, 100) };
}

/** Nom réduit à l'essentiel, pour la reconnaissance automatique. */
/** Nom réduit à l'essentiel : sans emoji, sans ¦, sans accent, en minuscules. */
function roleKey(role) {
  return norm(roleLabel(role).label).replace(/-/g, " ").replace(/\s+/g, " ").trim();
}
const nomReduit = roleKey;

/* ========================================================================== */
/*                        CATÉGORIES RECONNUES D'OFFICE                       */
/* ========================================================================== */

/** `max: 0` = choix multiples · `max: 1` = un seul à la fois. */
const PRESET = [
  { id: "couleur", title: "Couleur du pseudo", emoji: "🎨", max: 1,
    desc: "Une seule couleur à la fois. Reprends le menu pour changer.",
    match: ["beige", "jaune", "rose", "orange", "bleu", "blanc", "marron", "rouge", "noir", "violet", "vert"] },

  { id: "genre", title: "Genre", emoji: "🚻", max: 1,
    desc: "Comment tu veux qu'on te désigne.",
    match: ["homme", "femme", "transgenre"] },

  { id: "age", title: "Tranche d'âge", emoji: "🎂", max: 1,
    desc: "Obligatoire pour accéder à certains salons.",
    match: ["13 17 ans", "13 a 17 ans", "+ 18 ans", "18 ans", "+18 ans"] },

  { id: "amour", title: "Situation", emoji: "💞", max: 1,
    desc: "Si tu as envie de le partager.",
    match: ["celibataire", "complique", "en couple"] },

  { id: "notif", title: "Notifications", emoji: "🔔", max: 0,
    desc: "Ce pour quoi tu acceptes d'être mentionné.",
    match: ["giveaways notif", "giveaway notif", "partenariat notif", "animation notif"] },

  { id: "perso", title: "Centres d'intérêt", emoji: "✨", max: 0,
    desc: "Autant que tu veux.",
    match: ["prince", "princesse", "douceur", "sportif", "mangas", "hlel", "geek", "musique", "hlou", "artiste"] },
];

/**
 * Repère les rôles du serveur correspondant à chaque catégorie.
 * L'ordre des rôles suit celui de la catégorie, pas celui du serveur.
 */
function detectGroups(guild) {
  const dispo = [...guild.roles.cache.values()]
    .filter((r) => r.id !== guild.id && !r.managed && !isSeparator(r));

  const pris = new Set();
  const groups = [];

  for (const p of PRESET) {
    const roleIds = [];
    for (const attendu of p.match) {
      const trouve = dispo.find((r) => !pris.has(r.id) && nomReduit(r) === attendu);
      if (trouve) { roleIds.push(trouve.id); pris.add(trouve.id); }
    }
    if (roleIds.length) groups.push({ id: p.id, title: p.title, emoji: p.emoji, desc: p.desc, max: p.max, roleIds });
  }
  return groups;
}

/* ========================================================================== */
/*                              AFFICHAGE                                     */
/* ========================================================================== */

const COULEURS = { couleur: 0xE91E63, genre: 0x5865F2, age: 0xFEE75C, amour: 0xEB459E, notif: 0x57F287, perso: 0x9B59B6 };

/** Bandeau d'ouverture du panneau. */
function headerMessage(guild, groups) {
  return {
    embeds: [embed({
      guild, color: COLORS.primary,
      author: { name: "🎭  Choisis tes rôles" },
      description: [
        "```",
        "  ╔═══════════════════════════════╗",
        "  ║   🎭   T E S   R Ô L E S   🎭  ║",
        "  ╚═══════════════════════════════╝",
        "```",
        "Chaque menu ci-dessous te donne le rôle choisi et retire l'ancien.",
        "Rien n'est définitif : reviens quand tu veux.",
        "",
        groups.map((g) => `${g.emoji} **${g.title}** — ${g.roleIds.length} choix${g.max === 1 ? " · un seul" : ""}`).join("\n"),
      ].join("\n"),
      footer: "Pour retirer un rôle, rouvre le menu et désélectionne-le",
    })],
    components: [],
  };
}

/** Un message par catégorie : embed + menu déroulant. */
function groupMessage(guild, group) {
  const roles = group.roleIds.map((id) => guild.roles.cache.get(id)).filter(Boolean);
  if (!roles.length) return null;

  const options = roles.slice(0, 25).map((r) => {
    const { emoji, label } = roleLabel(r);
    const o = { label: label.slice(0, 100), value: r.id };
    if (emoji) o.emoji = emoji;
    return o;
  });

  return {
    embeds: [embed({
      guild, color: COULEURS[group.id] ?? COLORS.primary,
      author: { name: `${group.emoji}  ${group.title}` },
      description: [
        group.desc ?? "",
        "",
        roles.map((r) => `${r}`).join("  "),
      ].filter(Boolean).join("\n"),
      footer: group.max === 1 ? "Un seul choix — le précédent est retiré automatiquement" : "Autant de choix que tu veux",
    })],
    components: [new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId(`rm:${group.id}`)
        .setPlaceholder(group.max === 1 ? `Choisis ${group.title.toLowerCase()}…` : `Choisis dans ${group.title.toLowerCase()}…`)
        .setMinValues(0)
        .setMaxValues(group.max === 1 ? 1 : Math.min(options.length, 25))
        .addOptions(options))],
  };
}

/* ========================================================================== */
/*                              PUBLICATION                                   */
/* ========================================================================== */

/** Retrouve notre message par sa signature, sinon en poste un nouveau. */
async function poserOuModifier(channel, payload, signature) {
  let mien = null;
  try {
    const recents = await channel.messages.fetch({ limit: 40 });
    const liste = typeof recents?.find === "function" ? recents : [...(recents?.values?.() ?? [])];
    mien = liste.find((m) => {
      if (m.author?.id !== channel.guild.members.me.id) return false;
      const e = m.embeds?.[0];
      const nom = e?.author?.name ?? e?.data?.author?.name ?? "";
      return nom === signature;
    });
  } catch { mien = null; }
  if (mien) return mien.edit(payload).then(() => mien).catch(() => channel.send(payload).catch(() => null));
  return channel.send(payload).catch(() => null);
}

/**
 * Publie le panneau complet : bandeau puis une carte par catégorie.
 * Relançable sans créer de doublon.
 */
async function publishRoleMenus(guild, channel) {
  const config = await getConfig(guild.id);
  const groups = config.roleMenus ?? [];
  if (!groups.length) return { ok: false, reason: "Aucune catégorie définie." };
  if (!canSend(channel)) return { ok: false, reason: `Je ne peux pas écrire dans ${channel}.` };

  await poserOuModifier(channel, headerMessage(guild, groups), "🎭  Choisis tes rôles");
  let posees = 0;
  for (const g of groups) {
    const payload = groupMessage(guild, g);
    if (!payload) continue;
    await poserOuModifier(channel, payload, `${g.emoji}  ${g.title}`);
    posees++;
    await new Promise((r) => setTimeout(r, 400));
  }
  return { ok: true, channel, posees };
}

/* ========================================================================== */
/*                          CHOIX D'UN MEMBRE                                 */
/* ========================================================================== */

async function handleRoleMenuSelect(i) {
  const groupId = i.customId.split(":")[1];
  const config = await getConfig(i.guildId);
  const group = (config.roleMenus ?? []).find((g) => g.id === groupId);
  if (!group) return i.reply({ content: "Ce menu n'existe plus.", ...EPH });

  const dansLeGroupe = group.roleIds.filter((id) => i.guild.roles.cache.has(id));
  const choisis = i.values ?? [];
  const aRetirer = dansLeGroupe.filter((id) => !choisis.includes(id) && i.member.roles.cache.has(id));
  const aAjouter = choisis.filter((id) => !i.member.roles.cache.has(id));

  const monRang = i.guild.members.me.roles.highest.position;
  const tropHaut = [...aAjouter, ...aRetirer].filter((id) => (i.guild.roles.cache.get(id)?.position ?? 0) >= monRang);
  if (tropHaut.length) {
    return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Rôle trop haut` },
      description: `${tropHaut.map((id) => `<@&${id}>`).join(" ")} est au-dessus du mien : je ne peux pas y toucher.\nRemonte le rôle de 0x dans les paramètres du serveur.` })], ...EPH });
  }

  if (aRetirer.length) await i.member.roles.remove(aRetirer, "Menu de rôles").catch(() => null);
  if (aAjouter.length) await i.member.roles.add(aAjouter, "Menu de rôles").catch(() => null);

  const lignes = [];
  if (aAjouter.length) lignes.push(`✅ Ajouté : ${aAjouter.map((id) => `<@&${id}>`).join(" ")}`);
  if (aRetirer.length) lignes.push(`➖ Retiré : ${aRetirer.map((id) => `<@&${id}>`).join(" ")}`);
  if (!lignes.length) lignes.push("Rien n'a changé.");

  return i.reply({ embeds: [embed({ guild: i.guild, color: COLORS.success,
    author: { name: `${group.emoji}  ${group.title}` }, description: lignes.join("\n") })], ...EPH });
}

/* ========================================================================== */
/*                                17 - GRADES                                 */
/* ========================================================================== */

// ranks.js — grades gagnés à l'heure de vocal et au message.


/* ========================================================================== */
/*                    ÉCHELLE RECONNUE AUTOMATIQUEMENT                        */
/* ========================================================================== */

/**
 * L'échelle du serveur, telle qu'elle figure dans le guide « comment rank up ».
 * Chaque entrée est repérée par le nom du rôle, emoji et « ¦ » retirés.
 */
const PRESET_LADDER = [
  { match: "staff",           hours: 1,   messages: 100 },
  { match: "staff confirme",  hours: 5,   messages: 300 },
  { match: "moderateur",      hours: 10,  messages: 700 },
  { match: "assistant",       hours: 15,  messages: 800 },
  { match: "bras droit",      hours: 20,  messages: 1000 },
  { match: "gouverneur",      hours: 25,  messages: 1500 },
  { match: "manager",         hours: 30,  messages: 2000 },
  { match: "superviseur",     hours: 40,  messages: 2500 },
  { match: "dirigeant",       hours: 45,  messages: 3500 },
  { match: "pilier",          hours: 50,  messages: 4500 },
  { match: "sommet",          hours: 65,  messages: 5500 },
  { match: "empereur",        hours: 80,  messages: 7000 },
  { match: "proprietaire",    hours: 100, messages: 8500 },
  { match: "gardien",         hours: 120, messages: 10000 },
  { match: "legende",         hours: 140, messages: 12000 },
  { match: "doyen",           hours: 160, messages: 14000 },
  { match: "templier",        hours: 180, messages: 16000 },
  { match: "maitre",          hours: 220, messages: 20000 },
];

/**
 * Compose l'échelle à partir des rôles présents sur le serveur.
 * @returns {{ladder:Array, trouves:Array, manquants:Array}}
 */
function detectLadder(guild) {
  const dispo = [...guild.roles.cache.values()]
    .filter((r) => r.id !== guild.id && !r.managed && !isSeparator(r));

  const ladder = [];
  const manquants = [];
  const pris = new Set();

  for (const p of PRESET_LADDER) {
    const role = dispo.find((r) => !pris.has(r.id) && roleKey(r) === p.match);
    if (!role) { manquants.push(p.match); continue; }
    pris.add(role.id);
    ladder.push({ roleId: role.id, name: roleLabel(role).label, hours: p.hours, messages: p.messages });
  }
  return { ladder, trouves: ladder.length, manquants };
}

/* ========================================================================== */
/*                          LECTURE DE L'ÉCHELLE                              */
/* ========================================================================== */

/** L'échelle, du grade le plus bas au plus haut. */
function ladder(config) {
  return [...(config.ranks?.ladder ?? [])].sort((a, b) => (a.hours - b.hours) || (a.messages - b.messages));
}

/** Un membre remplit-il les conditions de ce grade ? */
function meets(rank, stats, requireBoth = true) {
  const okHours = stats.hours >= Number(rank.hours ?? 0);
  const okMsgs = stats.messages >= Number(rank.messages ?? 0);
  return requireBoth ? (okHours && okMsgs) : (okHours || okMsgs);
}

/** Statistiques brutes d'un membre. */
async function memberStats(guildId, userId) {
  const minutes = await getVoiceMinutes(guildId, userId);
  const messages = await getMessageCount(guildId, userId);
  return { minutes, hours: minutes / 60, messages };
}

/** @returns {{current, next, index}} */
function situate(config, stats) {
  const list = ladder(config);
  const both = config.ranks?.requireBoth !== false;
  let index = -1;
  for (let n = 0; n < list.length; n++) if (meets(list[n], stats, both)) index = n;
  return { current: index >= 0 ? list[index] : null, next: list[index + 1] ?? null, index, list };
}

/* ========================================================================== */
/*                              PROMOTION                                     */
/* ========================================================================== */

/**
 * Attribue le grade mérité. Les grades inférieurs sont retirés si demandé,
 * pour qu'un membre ne cumule pas toute l'échelle.
 * @returns {Promise<{promoted:boolean, rank?:object, from?:object}>}
 */
async function applyRank(member, config) {
  const r = config.ranks ?? {};
  if (!r.enabled || !r.autoPromote) return { promoted: false };

  const stats = await memberStats(member.guild.id, member.id);
  const { current, list } = situate(config, stats);
  if (!current) return { promoted: false };

  const role = member.guild.roles.cache.get(current.roleId);
  if (!role) return { promoted: false, missingRole: true };
  if (member.roles.cache.has(role.id)) return { promoted: false, already: true };
  if (role.position >= member.guild.members.me.roles.highest.position) return { promoted: false, tooHigh: true };

  const previous = list
    .filter((x) => x.roleId !== current.roleId && member.roles.cache.has(x.roleId))
    .map((x) => x.roleId);

  await member.roles.add(role.id, `Grade atteint : ${current.name ?? role.name}`).catch(() => null);
  if (r.removePrevious !== false && previous.length) {
    const removable = previous.filter((id) => {
      const rr = member.guild.roles.cache.get(id);
      return rr && rr.editable && !rr.managed;
    });
    if (removable.length) await member.roles.remove(removable, "Montée de grade").catch(() => null);
  }

  return { promoted: true, rank: current, role, removed: previous.length, stats };
}

/* ========================================================================== */
/*                              AFFICHAGE                                     */
/* ========================================================================== */

const fmtH = (h) => (h >= 1 ? `${Math.floor(h)} h` : `${Math.round(h * 60)} min`);

/** Fiche de progression d'un membre. */
function progressEmbed(guild, user, config, stats) {
  const { current, next } = situate(config, stats);

  const fields = [
    { name: "🎙️ Temps vocal", value: `**${fmtH(stats.hours)}**`, inline: true },
    { name: "💬 Messages", value: `**${num(stats.messages)}**`, inline: true },
    { name: "🎖️ Grade actuel", value: current ? `<@&${current.roleId}>` : "_aucun_", inline: true },
  ];

  if (next) {
    const hNow = Math.min(stats.hours, next.hours);
    const mNow = Math.min(stats.messages, next.messages);
    fields.push({
      name: `Prochain grade — ${next.name ?? "suivant"}`,
      value: [
        `<@&${next.roleId}>`,
        "",
        `Vocal   ${bar(hNow, next.hours)}  ${fmtH(stats.hours)} / ${next.hours} h`,
        `Messages ${bar(mNow, next.messages)}  ${num(stats.messages)} / ${num(next.messages)}`,
        "",
        stats.hours >= next.hours && stats.messages >= next.messages
          ? `${ICONS.ok} Conditions remplies`
          : `Il te manque ${[
              stats.hours < next.hours ? `**${fmtH(next.hours - stats.hours)}** de vocal` : null,
              stats.messages < next.messages ? `**${num(next.messages - stats.messages)}** messages` : null,
            ].filter(Boolean).join(" et ")}`,
      ].join("\n"),
    });
  } else if (current) {
    fields.push({ name: "Sommet atteint", value: "Tu es au grade le plus élevé de l'échelle." });
  }

  return embed({
    guild,
    color: current ? COLORS.gold : COLORS.primary,
    author: { name: `🎖️  Grade de ${user.username}` },
    fields,
    footer: config.ranks?.requireBoth === false
      ? "Un seul des deux critères suffit" : "Les deux critères doivent être remplis",
  }).thumb(user.displayAvatarURL({ size: 128 }));
}

/** Tableau complet de l'échelle. */
function ladderEmbed(guild, config, stats = null) {
  const list = ladder(config);
  if (!list.length) {
    return embed({ guild, color: COLORS.warning, author: { name: "🎖️  Grades" },
      description: "_Aucun grade défini._ Ajoute-les depuis le panneau." });
  }
  const { current } = stats ? situate(config, stats) : { current: null };
  return embed({
    guild, color: COLORS.gold, author: { name: "🎖️  Échelle des grades" },
    description: [...list].reverse().map((r) => {
      const mine = current && current.roleId === r.roleId;
      return `${mine ? "➜" : "　"} <@&${r.roleId}> — **${r.hours} h** de vocal · **${num(r.messages)}** messages`;
    }).join("\n").slice(0, 4000),
    footer: `${list.length} grade(s) · progression automatique`,
  });
}

/* ========================================================================== */
/*                      18 - CREATEUR D EMBED ET PALETTE                      */
/* ========================================================================== */

// embedbuilder.js — créateur d'embed et palette de couleurs du serveur.


/* ========================================================================== */
/*                                PALETTE                                     */
/* ========================================================================== */

const PALETTE = [
  { nom: "Bleu Discord", hex: 0x5865F2, emoji: "🔵" },
  { nom: "Rouge",        hex: 0xED4245, emoji: "🔴" },
  { nom: "Vert",         hex: 0x57F287, emoji: "🟢" },
  { nom: "Jaune",        hex: 0xFEE75C, emoji: "🟡" },
  { nom: "Orange",       hex: 0xE67E22, emoji: "🟠" },
  { nom: "Violet",       hex: 0x9B59B6, emoji: "🟣" },
  { nom: "Rose",         hex: 0xEB459E, emoji: "🩷" },
  { nom: "Turquoise",    hex: 0x1ABC9C, emoji: "🩵" },
  { nom: "Or",           hex: 0xF1C40F, emoji: "🟨" },
  { nom: "Blanc",        hex: 0xFFFFFF, emoji: "⚪" },
  { nom: "Noir profond", hex: 0x2B2D31, emoji: "⚫" },
  { nom: "Bordeaux",     hex: 0x8B1538, emoji: "🟥" },
  { nom: "Marine",       hex: 0x1F3A93, emoji: "🟦" },
  { nom: "Menthe",       hex: 0x7BE7B6, emoji: "🍃" },
  { nom: "Corail",       hex: 0xFF6F61, emoji: "🪸" },
  { nom: "Lavande",      hex: 0xB39DDB, emoji: "💜" },
];

const nomDeCouleur = (n) => PALETTE.find((p) => p.hex === n)?.nom ?? hexOf(n);

/* ========================================================================== */
/*                              BROUILLONS                                    */
/* ========================================================================== */

const brouillons = new Map();   // "guild:user" -> brouillon
const cle = (i) => `${i.guildId}:${i.user.id}`;

const VIDE = () => ({
  title: "", description: "", footer: "", author: "",
  color: null, image: "", thumb: "", timestamp: true,
});

function getDraft(i) {
  if (!brouillons.has(cle(i))) brouillons.set(cle(i), VIDE());
  return brouillons.get(cle(i));
}

function setDraft(i, patch) {
  const d = { ...getDraft(i), ...patch };
  brouillons.set(cle(i), d);
  return d;
}

function resetDraft(i) { brouillons.set(cle(i), VIDE()); return getDraft(i); }

setInterval(() => { if (brouillons.size > 500) brouillons.clear(); }, 30 * 60_000).unref();

/* ========================================================================== */
/*                              RENDU                                         */
/* ========================================================================== */

/** Le brouillon a-t-il de quoi être envoyé ? */
function draftReady(d) {
  return Boolean(d.title || d.description || d.image || d.author);
}

const urlOk = (u) => !u || /^https?:\/\/\S+$/i.test(u);

/** Ce que verront les membres. */
function renderDraft(guild, d) {
  const e = new EmbedBuilder();
  e.setColor(d.color ?? COLORS.primary);
  if (d.title) e.setTitle(d.title.slice(0, 256));
  if (d.description) e.setDescription(d.description.slice(0, 4000));
  if (d.author) e.setAuthor({ name: d.author.slice(0, 256), iconURL: guild.iconURL({ size: 64 }) ?? undefined });
  if (d.footer) e.setFooter({ text: d.footer.slice(0, 2048), iconURL: guild.iconURL({ size: 64 }) ?? undefined });
  if (urlOk(d.image) && d.image) e.setImage(d.image);
  if (urlOk(d.thumb) && d.thumb) e.setThumbnail(d.thumb);
  if (d.timestamp) e.setTimestamp();
  return e;
}

/** Ce que voit celui qui compose, avec l'état de chaque champ. */
function draftSummary(guild, d) {
  const ligne = (nom, valeur, limite) => {
    if (!valeur) return `⬜ **${nom}** — vide`;
    const trop = valeur.length > limite;
    return `${trop ? "⚠️" : "✅"} **${nom}** — ${valeur.length}/${limite} caractère(s)${trop ? " · sera coupé" : ""}`;
  };
  const soucis = [];
  if (d.image && !urlOk(d.image)) soucis.push("l'adresse de l'image n'est pas une URL");
  if (d.thumb && !urlOk(d.thumb)) soucis.push("l'adresse de la miniature n'est pas une URL");

  return embed({
    guild, color: d.color ?? COLORS.primary,
    author: { name: "🎨  Créateur d'embed" },
    description: [
      ligne("Titre", d.title, 256),
      ligne("Corps du message", d.description, 4000),
      ligne("Auteur", d.author, 256),
      ligne("Pied de page", d.footer, 2048),
      `${d.image ? "✅" : "⬜"} **Grande image** ${d.image ? "" : "— vide"}`,
      `${d.thumb ? "✅" : "⬜"} **Miniature** ${d.thumb ? "" : "— vide"}`,
      `🎨 **Couleur** — ${nomDeCouleur(d.color ?? COLORS.primary)}`,
      `🕒 **Horodatage** — ${d.timestamp ? "affiché" : "masqué"}`,
      ...(soucis.length ? ["", `⚠️ ${soucis.join(" · ")}`] : []),
    ].join("\n"),
    footer: draftReady(d) ? "Aperçu juste en dessous" : "Remplis au moins le titre ou le corps",
  });
}

/** Envoie l'embed composé dans un salon. */
async function sendDraft(guild, channel, d) {
  if (!draftReady(d)) return { ok: false, reason: "Le brouillon est vide." };
  if (!canSend(channel)) return { ok: false, reason: `Je ne peux pas écrire dans ${channel}.` };
  const m = await channel.send({ embeds: [renderDraft(guild, d)] }).catch((e) => {
    console.error("[embed]", e.message); return null;
  });
  if (!m) return { ok: false, reason: "Discord a refusé le message. Vérifie les adresses d'image." };
  return { ok: true, message: m, channel };
}

/* ========================================================================== */
/*                   19 - INVITATIONS ET ROLE DE CONFIANCE                    */
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
 * Rôle qui détient toutes les permissions du bot.
 * Priorité : l'identifiant fixé (TRUSTED_ROLE_ID), puis un nom reconnaissable.
 */
function findLikeRole(guild) {
  const byId = guild.roles.cache.get(TRUSTED_ROLE_ID);
  if (byId) return byId;

  const roles = [...guild.roles.cache.values()].filter((r) => r.id !== guild.id && !r.managed);
  const flat = (r) => norm(r.name).replace(/-/g, "");
  return roles.find((r) => norm(r.name) === "like-me")
    ?? roles.find((r) => flat(r) === "likeme")
    ?? roles.find((r) => flat(r).includes("likeme"))
    ?? roles.find((r) => norm(r.name) === "like")
    ?? null;
}

/** Niveau accordé au rôle de confiance : le plus haut sous le propriétaire. */
const TRUSTED_LEVEL = 6;

/**
 * Repère le rôle de confiance et lui donne le niveau 6.
 * Un rôle choisi à la main dans le panneau n'est jamais écrasé tant qu'il existe,
 * sauf si l'identifiant fixé est présent sur le serveur : il fait toujours foi.
 */
async function syncTrustedRole(guild, { force = false } = {}) {
  const config = await getConfig(guild.id);
  const pinned = guild.roles.cache.get(TRUSTED_ROLE_ID);

  // L'identifiant fixé prime sur tout
  if (pinned) {
    const current = Number(config.perms.roles?.[pinned.id] ?? 0);
    const already = config.trustedRoleId === pinned.id && current >= TRUSTED_LEVEL;
    if (already) return { found: true, role: pinned, changed: false, pinned: true };
    await updateConfig(guild.id, {
      trustedRoleId: pinned.id,
      perms: { roles: { ...config.perms.roles, [pinned.id]: TRUSTED_LEVEL } },
    });
    return { found: true, role: pinned, changed: true, pinned: true };
  }

  // Choix manuel toujours valide : on le garde
  if (!force && config.trustedRoleId && guild.roles.cache.has(config.trustedRoleId)) {
    const role = guild.roles.cache.get(config.trustedRoleId);
    const current = Number(config.perms.roles?.[role.id] ?? 0);
    if (current < TRUSTED_LEVEL) {
      await updateConfig(guild.id, { perms: { roles: { ...config.perms.roles, [role.id]: TRUSTED_LEVEL } } });
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
  if (!roles[role.id] || Number(roles[role.id]) < TRUSTED_LEVEL) roles[role.id] = TRUSTED_LEVEL;
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
/*                      20 - ACTIONS, ARTICLES, ESCALADE                      */
/* ========================================================================== */

// actions.js — la logique métier, appelable depuis n'importe quelle interface.
// Chaque fonction renvoie { ok, title, text, color } prêt à afficher.


const ok = (title, text, color = COLORS.success) => ({ ok: true, title, text, color });
const no = (text) => ({ ok: false, title: "Impossible", text, color: COLORS.danger });

/** Vérifie hiérarchie Discord + niveau de perm avant toute sanction. */
function checkTarget(guild, actor, target, config) {
  if (!target) return "Membre introuvable sur le serveur.";
  if (target.id === actor.id) return "Tu ne peux pas te cibler toi-même.";
  if (target.id === guild.members.me.id) return "Je ne vais pas me sanctionner moi-même.";

  const actorLevel = permLevel(actor, config);

  // Immunité « Administrateur » : seul le propriétaire de 0x peut passer outre,
  // sinon un administrateur devenu incontrôlable serait définitivement hors de portée.
  if (hasAdminImmunity(target, config) && !isOwner(actor.id)) {
    return `**${target.user.tag}** a la permission Discord « Administrateur » : il est immunisé sur tout le serveur.`;
  }

  if (isOwner(target.id)) {
    // Le propriétaire de 0x est sanctionnable au-dessus d'un certain niveau.
    const need = Number(config?.ownerSanctionLevel ?? 5);
    if (need <= 0) return "C'est le propriétaire de 0x — il ne peut pas être ciblé.";
    if (actorLevel < need) {
      return `Sanctionner le propriétaire de 0x demande le niveau **${need}**. Tu es niveau ${actorLevel}.`;
    }
    // Autorisé : on saute la comparaison de niveaux et on passe au contrôle Discord.
  } else {
    if (target.id === guild.ownerId) return "C'est le propriétaire du serveur.";
    const targetLevel = permLevel(target, config);
    if (actorLevel <= targetLevel) {
      return `**${target.user.tag}** est de niveau ${targetLevel}, toi ${actorLevel}. Il faut un niveau strictement supérieur.`;
    }
  }

  if (target.roles.highest.position >= guild.members.me.roles.highest.position) {
    return "Mon rôle est trop bas. Remonte le rôle de 0x au-dessus dans les paramètres du serveur.";
  }
  return null;
}

/* ================================ SANCTIONS =============================== */

/**
 * Carte de sanction envoyée au journal. Repli silencieux sur l'embed seul.
 */
async function carteSanction(guild, type, target, moderator, reason, duree, total) {
  if (!renderReady()) return null;
  try {
    const avatar = await chargerAvatar(target.user.displayAvatarURL({ extension: "png", size: 128 }));
    const buffer = renderSanction({
      type, pseudo: target.displayName ?? target.user.username, avatar,
      raison: reason, moderateur: moderator.tag ?? moderator.username ?? "—",
      duree, total, serveur: guild.name,
    });
    return buffer ? { attachment: buffer, name: `sanction-${target.id}.png` } : null;
  } catch (e) { console.error("[sanction]", e.message); return null; }
}

async function actionWarn(guild, target, moderator, reason) {
  const total = await addSanction(guild.id, target.id, moderator.id, "warn", reason);
  const config = await getConfig(guild.id);
  await tryDm(target.user, guild.name, "Avertissement", reason);
  await log(guild, "warn", embed({
    guild, color: COLORS.warning, author: { name: `${ICONS.warn}  Avertissement` },
    description: `**${target.user.tag}**\n\`${target.id}\``,
    fields: [
      { name: "Total", value: `${total}`, inline: true },
      { name: "Modérateur", value: `<@${moderator.id}>`, inline: true },
      { name: "Raison", value: reason },
    ],
  }), await carteSanction(guild, "warn", target, moderator, reason, null, total));
  const esc = await applyEscalation(guild, target, config).catch(() => ({ applied: false }));
  return ok("Avertissement enregistré",
    `**${target.user.tag}** cumule **${total}** avertissement(s).${esc.applied ? `\n\n${esc.text}` : ""}`,
    esc.applied ? COLORS.danger : COLORS.warning);
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
  }), await carteSanction(guild, "timeout", target, moderator, reason, formatDuration(ms),
    await countSanctions(guild.id, target.id)));
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
  }), await carteSanction(guild, "kick", target, moderator, reason, null,
    await countSanctions(guild.id, target.id)));
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
  }), await carteSanction(guild, "ban", target, moderator, reason, null,
    await countSanctions(guild.id, target.id)));
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

/* ================================ ESCALADE ================================ */

const ESCALATION_ACTIONS = {
  timeout:  { label: "Réduction au silence", emoji: "🔇", needsDuration: true },
  kick:     { label: "Expulsion", emoji: "👢", needsDuration: false },
  ban:      { label: "Bannissement", emoji: "⛔", needsDuration: false },
  alcatraz: { label: "Alcatraz", emoji: "🤚", needsDuration: true },
};

/** Décrit une règle en une ligne lisible. */
function describeRule(rule) {
  const a = ESCALATION_ACTIONS[rule.action];
  return `**${rule.warns}** avertissement(s) → ${a?.emoji ?? ""} ${a?.label ?? rule.action}`
    + (rule.duration ? ` (${rule.duration})` : "");
}

/**
 * Applique la règle d'escalade correspondant au nombre d'avertissements.
 * Le bot agit en son nom propre : la sanction est incontestable.
 * @returns {Promise<{applied:boolean, text?:string, rule?:object}>}
 */
async function applyEscalation(guild, target, config) {
  const esc = config.escalation;
  if (!esc?.enabled || !esc.rules?.length) return { applied: false };
  if (hasAdminImmunity(target, config)) return { applied: false, immune: true };

  const count = await countRecentSanctions(guild.id, target.id, "warn", esc.expireDays ?? 0);
  const rule = esc.rules.find((r) => Number(r.warns) === count);
  if (!rule) return { applied: false, count };

  const me = { id: guild.members.me.id, tag: `${guild.client.user.username} (escalade)` };
  const reason = `Escalade automatique : ${count} avertissement(s)`;
  let result;

  if (rule.action === "timeout") result = await actionTimeout(guild, target, me, parseDuration(rule.duration ?? "1h"), reason);
  else if (rule.action === "kick") result = await actionKick(guild, target, me, reason);
  else if (rule.action === "ban") result = await actionBan(guild, target, me, reason);
  else if (rule.action === "alcatraz") result = await actionJail(guild, target, me, reason, parseDuration(rule.duration ?? ""));
  else return { applied: false, count };

  if (!result?.ok) return { applied: false, count, text: result?.text };

  await log(guild, "sanction", embed({
    guild, color: COLORS.danger, author: { name: "⚖️  Escalade automatique" },
    description: `**${target.user.tag}** atteint **${count}** avertissement(s).`,
    fields: [
      { name: "Règle", value: describeRule(rule), inline: true },
      { name: "Résultat", value: result.title, inline: true },
    ],
  }));

  return { applied: true, count, rule, text: `⚖️ Seuil de **${count}** atteint → ${describeRule(rule)}` };
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
  return serialiser(guild.id, user.id, () => daily(guild, user),
    () => no("Une action est déjà en cours, patiente une seconde."));
}

async function daily(guild, user) {
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
    `Tu reçois **${config.economy.currency} ${num(gain)}**${bonus ? ` (dont ${num(bonus)} de série)` : ""}.\n`
    + (total < 0 ? `🚨 Il te reste **${num(-total)}** de dette.` : `Solde : **${num(total)}** · série de ${streak} jour(s).`),
    total < 0 ? COLORS.warning : COLORS.gold);
}

const WORK_FLAVOR = ["as modéré le chat", "as rangé les vocaux", "as animé un event", "as aidé un nouveau", "as trié les tickets", "as tenu la boutique"];

async function actionWork(guild, user) {
  return serialiser(guild.id, user.id, () => work(guild, user),
    () => no("Une action est déjà en cours, patiente une seconde."));
}

async function work(guild, user) {
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
    `Tu ${WORK_FLAVOR[Math.floor(Math.random() * WORK_FLAVOR.length)]} et gagnes **${config.economy.currency} ${num(gain)}**.\n`
    + (total < 0 ? `🚨 Il te reste **${num(-total)}** de dette.` : `Solde : **${num(total)}**.`),
    total < 0 ? COLORS.warning : COLORS.success);
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
  return serialiser(guild.id, member.id, () => buy(guild, member, itemId, extra),
    () => no("Un achat est déjà en cours, patiente une seconde."));
}

async function buy(guild, member, itemId, extra = {}) {
  const dette = await blockedByDebt(guild.id, member.id);
  if (dette) return no(dette);
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
  return serialiser(guild.id, from.id, () => pay(guild, from, toUser, amount),
    () => no("Un transfert est déjà en cours, patiente une seconde."));
}

async function pay(guild, from, toUser, amount) {
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

/**
 * Crédite ou retire à n'importe qui : propriétaire du serveur, du bot,
 * administrateur immunisé, tout le monde. Ce n'est pas une sanction, donc
 * la hiérarchie ne s'applique pas. Le solde peut passer sous zéro.
 */
async function actionGrantCoins(guild, target, amount, moderator, reason) {
  const total = await addCoins(guild.id, target.id, amount, true);
  await log(guild, "coins", embed({
    guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Ajustement` },
    fields: [
      { name: "Membre", value: target.user?.tag ?? target.tag, inline: true },
      { name: "Montant", value: `${amount >= 0 ? "+" : ""}${num(amount)}`, inline: true },
      { name: "Par", value: `<@${moderator.id}>`, inline: true },
      { name: "Raison", value: reason || "Non précisée" },
    ],
  }));
  return ok("Solde ajusté",
    `${amount >= 0 ? "+" : ""}${num(amount)} pour **${target.user?.tag ?? target.tag}**\n`
    + (total < 0 ? `🚨 Il est maintenant **en dette de ${num(-total)}**.` : `Nouveau solde : **${num(total)}**.`),
    total < 0 ? COLORS.danger : COLORS.gold);
}

/* ========================================================================== */
/*                          21 - COMMANDES A PREFIXE                          */
/* ========================================================================== */

// prefix.js — commandes à préfixe. Le caractère et la liste se règlent au panneau.


/** Préfixes proposés dans le panneau. */
const PREFIX_CHOICES = ["!", "?", "*", ".", "-", "+", "$", "%", ">", "&"];

/* ========================================================================== */
/*                              LES COMMANDES                                 */
/* ========================================================================== */

const pOk = (title, text, color = COLORS.success) => ({ title, text, color });
const pNo = (text) => ({ ok: false, title: "Impossible", text, color: COLORS.danger });

/**
 * Chaque commande déclare son niveau, son usage et si elle vise un membre.
 * `run` reçoit ({ message, args, rest, target, config, level }).
 */
const PREFIX_COMMANDS = {
  ban: {
    aliases: ["bannir"], level: 3, target: true, usage: "<@membre> [raison]",
    desc: "Bannit un membre",
    run: ({ message, target, rest }) => actionBan(message.guild, target, message.author, rest || "Non précisée"),
  },
  unban: {
    aliases: ["debannir", "déban"], level: 3, usage: "<identifiant> [raison]",
    desc: "Révoque un bannissement",
    run: ({ message, args, rest }) => actionUnban(message.guild, (args[0] ?? "").replace(/\D/g, ""), message.author, rest.split(" ").slice(1).join(" ") || "Non précisée"),
  },
  kick: {
    aliases: ["expulser"], level: 2, target: true, usage: "<@membre> [raison]",
    desc: "Expulse un membre",
    run: ({ message, target, rest }) => actionKick(message.guild, target, message.author, rest || "Non précisée"),
  },
  mute: {
    aliases: ["timeout", "muet"], level: 2, target: true, usage: "<@membre> <durée> [raison]",
    desc: "Réduit au silence (10m, 2h, 7d)",
    run: ({ message, target, args, rest }) => {
      const ms = parseDuration(args[1]);
      if (!ms) return pNo("Durée manquante ou invalide. Exemples : `10m`, `2h`, `7d`.");
      return actionTimeout(message.guild, target, message.author, ms, rest.split(" ").slice(1).join(" ") || "Non précisée");
    },
  },
  unmute: {
    aliases: ["untimeout"], level: 2, target: true, usage: "<@membre>",
    desc: "Rend la parole",
    run: ({ message, target }) => actionUntimeout(message.guild, target, message.author),
  },
  warn: {
    aliases: ["avertir"], level: 1, target: true, usage: "<@membre> <raison>",
    desc: "Donne un avertissement",
    run: ({ message, target, rest }) => {
      if (!rest) return pNo("Il faut une raison.");
      return actionWarn(message.guild, target, message.author, rest);
    },
  },
  casier: {
    aliases: ["historique", "warns"], level: 1, target: true, usage: "<@membre>",
    desc: "Historique des sanctions",
    run: ({ message, target }) => actionHistory(message.guild, target),
  },
  clearwarns: {
    aliases: ["effacer"], level: 4, target: true, usage: "<@membre>",
    desc: "Efface le casier",
    run: ({ message, target }) => actionClearSanctions(message.guild, target),
  },
  clear: {
    aliases: ["purge", "clean"], level: 1, usage: "<nombre> [@membre]",
    desc: "Supprime des messages récents",
    run: ({ message, args }) => {
      const n = Math.min(100, Math.max(1, parseInt(args[0], 10) || 0));
      if (!n) return pNo("Indique un nombre entre 1 et 100.");
      const cible = message.mentions.users.first()?.id ?? null;
      return actionPurge(message.channel, n, cible, message.author);
    },
  },
  jail: {
    aliases: ["alcatraz"], level: 2, target: true, usage: "<@membre> <raison> [durée]",
    desc: "Envoie en Alcatraz",
    run: ({ message, target, rest, args }) => {
      const last = args[args.length - 1];
      const ms = parseDuration(last);
      const raison = ms ? rest.split(" ").slice(0, -1).join(" ") : rest;
      if (!raison) return pNo("Il faut une raison.");
      return actionJail(message.guild, target, message.author, raison, ms);
    },
  },
  unjail: {
    aliases: ["liberer", "libérer"], level: 2, target: true, usage: "<@membre>",
    desc: "Libère d'Alcatraz",
    run: ({ message, target }) => actionFree(message.guild, target, message.author),
  },
  slowmode: {
    aliases: ["lent"], level: 2, usage: "<secondes>",
    desc: "Règle le mode lent",
    run: async ({ message, args }) => {
      const s = Math.max(0, Math.min(21600, parseInt(args[0], 10) || 0));
      await message.channel.setRateLimitPerUser(s, message.author.tag).catch(() => null);
      return pOk("Mode lent", s ? `${s} seconde(s) entre chaque message.` : "Mode lent coupé.");
    },
  },
  lock: {
    level: 2, usage: "",
    desc: "Verrouille le salon",
    run: async ({ message }) => {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: false }).catch(() => null);
      return pOk("Salon verrouillé", "Plus personne ne peut écrire ici.", COLORS.danger);
    },
  },
  unlock: {
    level: 2, usage: "",
    desc: "Déverrouille le salon",
    run: async ({ message }) => {
      await message.channel.permissionOverwrites.edit(message.guild.roles.everyone, { SendMessages: null }).catch(() => null);
      return pOk("Salon déverrouillé", "Les membres peuvent réécrire.");
    },
  },
  give: {
    aliases: ["donner", "addcoins"], level: 4, target: true, noHierarchy: true, usage: "<@membre> <montant>",
    desc: "Crédite des coins",
    run: ({ message, target, args }) => {
      const n = parseInt((args[1] ?? "").replace(/\D/g, ""), 10);
      if (!Number.isFinite(n) || n < 1) return pNo("Indique un montant.");
      return actionGrantCoins(message.guild, target, n, message.author, "Commande give");
    },
  },
  take: {
    aliases: ["retirer", "removecoins"], level: 4, target: true, noHierarchy: true, usage: "<@membre> <montant>",
    desc: "Retire des coins",
    run: ({ message, target, args }) => {
      const n = parseInt((args[1] ?? "").replace(/\D/g, ""), 10);
      if (!Number.isFinite(n) || n < 1) return pNo("Indique un montant.");
      return actionGrantCoins(message.guild, target, -n, message.author, "Commande take");
    },
  },
  solde: {
    aliases: ["coins", "balance"], level: 0, usage: "[@membre]",
    desc: "Affiche un solde",
    run: async ({ message, config }) => {
      const u = message.mentions.users.first() ?? message.author;
      const w = await getWallet(message.guild.id, u.id);
      return pOk(w.coins < 0 ? `${u.username} est en dette` : `Solde de ${u.username}`,
        w.coins < 0
          ? `## − ${config.economy.currency} ${num(-w.coins)}\nTables et boutique fermées jusqu'au remboursement.`
          : `## ${config.economy.currency} ${num(w.coins)}`,
        w.coins < 0 ? COLORS.danger : COLORS.gold);
    },
  },
  daily: {
    aliases: ["quotidien"], level: 0, usage: "",
    desc: "Récompense quotidienne",
    run: ({ message }) => actionDaily(message.guild, message.author),
  },
  work: {
    aliases: ["travail", "travailler"], level: 0, usage: "",
    desc: "Travailler pour des coins",
    run: ({ message }) => actionWork(message.guild, message.author),
  },
  grade: {
    aliases: ["rank", "niveau"], level: 0, usage: "[@membre]",
    desc: "Ton grade et ta progression",
    embedOnly: true,
    run: async ({ message, config }) => {
      const u = message.mentions.users.first() ?? message.author;
      const stats = await memberStats(message.guild.id, u.id);
      return { embed: progressEmbed(message.guild, u, config, stats) };
    },
  },
  grades: {
    aliases: ["echelle", "échelle"], level: 0, usage: "",
    desc: "L'échelle complète des grades",
    embedOnly: true,
    run: async ({ message, config }) => ({ embed: ladderEmbed(message.guild, config) }),
  },
  stats: {
    aliases: ["profil"], level: 0, usage: "[@membre]",
    desc: "Temps vocal et messages",
    run: async ({ message }) => {
      const u = message.mentions.users.first() ?? message.author;
      const min = await getVoiceMinutes(message.guild.id, u.id);
      const msg = await getMessageCount(message.guild.id, u.id);
      return pOk(`Statistiques de ${u.username}`,
        `🎙️ **${Math.floor(min / 60)} h ${min % 60} min** de vocal\n💬 **${num(msg)}** messages`, COLORS.primary);
    },
  },
  /* ------------------------------- MUSIQUE ------------------------------ */
  setup: {
    aliases: ["reglages", "config"], level: 0, usage: "",
    desc: "Réglages du lecteur audio",
    embedOnly: true,
    run: async ({ message, config }) => {
      await message.channel.send(vueReglages(message.guild, config)).catch(() => null);
      return { envoye: true };
    },
  },

  play: {
    aliases: ["p", "jouer"], level: 0, voiceOnly: true, usage: "<lien ou titre>",
    desc: "Joue une piste, ou l'ajoute à la file",
    run: async ({ message, rest, config }) => {
      if (!rest) return pNo("Donne un lien ou un titre à chercher.");

      // Un lien part directement ; un titre passe par le catalogue Deezer
      const estLien = /^https?:\/\/\S+$/i.test(rest);
      if (!estLien && (config.musique?.proposerChoix ?? true)) {
        const v = verifierSalon(message);
        if (!v.ok) return pNo(v.raison);
        const liste = await propositions(rest, 5);
        if (liste.length > 1) {
          memoriserChoix(message.guild.id, message.author.id,
            { liste, salonVocal: v.salonVocal, salonTexte: message.channel });
          await message.channel.send(vueChoix(message.guild, liste, rest)).catch(() => null);
          return { envoye: true };
        }
      }

      const r = await jouer(message, rest);
      if (!r) return null;                       // le message de lecture est déjà parti
      return r.ok ? pOk(r.titre, r.texte, COLORS.primary) : pNo(r.texte);
    },
  },
  skip: {
    aliases: ["s", "suivant"], level: 0, voiceOnly: true, usage: "",
    desc: "Passe la piste en cours",
    run: ({ message }) => {
      const r = passer(message.guild.id);
      return r.ok ? pOk(r.titre, r.texte) : pNo(r.texte);
    },
  },
  leave: {
    aliases: ["stop", "quitter"], level: 0, voiceOnly: true, usage: "",
    desc: "Fait quitter le vocal au bot",
    run: ({ message }) => quitter(message.guild.id)
      ? pOk("Vocal quitté", "La file a été vidée.")
      : pNo("Je ne suis dans aucun vocal."),
  },
  queue: {
    aliases: ["file", "q"], level: 0, voiceOnly: true, usage: "",
    desc: "Affiche la file d'attente",
    embedOnly: true,
    run: ({ message }) => ({ embed: fileEmbed(message.guild) }),
  },
  pause: {
    level: 0, voiceOnly: true, usage: "",
    desc: "Met la lecture en pause",
    run: ({ message }) => { const r = mettreEnPause(message.guild.id); return r.ok ? pOk(r.titre, r.texte) : pNo(r.texte); },
  },
  resume: {
    aliases: ["reprendre"], level: 0, voiceOnly: true, usage: "",
    desc: "Reprend la lecture",
    run: ({ message }) => { const r = mettreEnPause(message.guild.id, true); return r.ok ? pOk(r.titre, r.texte) : pNo(r.texte); },
  },
  volume: {
    aliases: ["vol"], level: 1, voiceOnly: true, usage: "<0 à 200>",
    desc: "Règle le volume",
    run: ({ message, args }) => {
      const v = parseInt(args[0], 10);
      if (!Number.isFinite(v)) return pNo("Donne un nombre entre 0 et 200.");
      const r = reglerVolume(message.guild.id, v);
      return r.ok ? pOk(r.titre, r.texte) : pNo(r.texte);
    },
  },

  help: {
    aliases: ["aide", "commandes"], level: 0, usage: "",
    desc: "Liste des commandes disponibles",
    embedOnly: true,
    run: async ({ message, config, level }) => {
      const p = config.prefix?.char ?? "!";
      const dispo = Object.entries(PREFIX_COMMANDS)
        .filter(([n]) => !(config.prefix?.disabled ?? []).includes(n))
        .filter(([n, c]) => level >= prefixRequiredLevel(n, c, config));
      const parNiveau = {};
      for (const [n, c] of dispo) (parNiveau[prefixRequiredLevel(n, c, config)] ??= []).push(`\`${p}${n}\``);
      return {
        embed: embed({
          guild: message.guild, color: COLORS.primary,
          author: { name: `⌨️  Commandes en ${p}` },
          description: `Ton niveau : **${PERM_LABELS[level]}** · ${dispo.length} commande(s) accessibles`,
          fields: Object.keys(parNiveau).sort((a, b) => a - b).map((lv) => ({
            name: PERM_LABELS[lv], value: parNiveau[lv].join(" "),
          })),
          footer: `${p}aide <commande> pour le détail · tout est aussi dans /panel`,
        }),
      };
    },
  },
};

/** Niveau requis, surcharge du panneau comprise. */
function prefixRequiredLevel(name, cmd, config) {
  const custom = config.prefix?.levels?.[name];
  return custom !== undefined ? Number(custom) : (cmd?.level ?? 0);
}

/** Retrouve une commande par son nom ou un alias. */
function findCommand(word) {
  const w = word.toLowerCase();
  if (PREFIX_COMMANDS[w]) return [w, PREFIX_COMMANDS[w]];
  for (const [name, c] of Object.entries(PREFIX_COMMANDS)) {
    if (c.aliases?.some((a) => a.toLowerCase() === w)) return [name, c];
  }
  return [null, null];
}

/* ========================================================================== */
/*                              EXÉCUTION                                     */
/* ========================================================================== */

/**
 * Traite un message susceptible d'être une commande.
 * @returns {Promise<boolean>} true si la commande a été prise en charge
 */
async function handlePrefix(message, config) {
  const conf = config.prefix ?? {};
  const pMusique = config.musique?.prefixe || "+";
  const p = conf.char || "!";

  // Deux préfixes cohabitent : général pour tout, musique réservé au lecteur.
  // S'ils sont identiques, les deux familles de commandes sont acceptées.
  let prefixeUtilise = null;
  let musiqueSeule = false;
  const startsMus = message.content.startsWith(pMusique);
  const startsGen = conf.enabled !== false && message.content.startsWith(p);

  if (startsMus && startsGen && pMusique === p) {
    prefixeUtilise = p;
    musiqueSeule = false;
  } else if (startsMus) {
    prefixeUtilise = pMusique;
    musiqueSeule = true;
  } else if (startsGen) {
    prefixeUtilise = p;
  }
  if (!prefixeUtilise) return false;

  const parts = message.content.slice(prefixeUtilise.length).trim().split(/\s+/);
  const word = parts.shift() ?? "";
  if (!word) return false;

  const [name, cmd] = findCommand(word);
  if (!cmd) return false;
  if ((conf.disabled ?? []).includes(name)) return false;
  // Le préfixe musique ne donne accès qu'au lecteur
  if (musiqueSeule && !cmd.voiceOnly && name !== "setup") return false;

  const level = permLevel(message.member, config);
  const need = prefixRequiredLevel(name, cmd, config);

  // Les commandes audio ne répondent que dans le chat d'un salon vocal
  if (cmd.voiceOnly) {
    if (!musiqueReady()) {
      await message.channel.send({ embeds: [embed({ guild: message.guild, color: COLORS.danger,
        author: { name: `${ICONS.no}  Lecteur indisponible` },
        description: "Les bibliothèques audio ne sont pas installées sur cet hébergement." })] }).catch(() => null);
      return true;
    }
    const v = verifierSalon(message);
    if (!v.ok) {
      await message.channel.send({ embeds: [embed({ guild: message.guild, color: COLORS.warning,
        author: { name: "🎧  Pas au bon endroit" }, description: v.raison })] }).catch(() => null);
      return true;
    }
  }
  const envoyer = async (payload) => {
    if (!canSend(message.channel)) return;
    const m = await message.channel.send(payload).catch(() => null);
    if (conf.deleteInvocation) await message.delete().catch(() => null);
    return m;
  };

  if (level < need) {
    await envoyer({ embeds: [embed({ guild: message.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Accès refusé` },
      description: `\`${p}${name}\` demande **${PERM_LABELS[need]}**.\nTon niveau : **${PERM_LABELS[level]}**.` })] });
    return true;
  }

  // Résolution de la cible pour les commandes qui en attendent une
  let target = null;
  if (cmd.target) {
    const id = message.mentions.users.first()?.id ?? (parts[0] ?? "").replace(/\D/g, "");
    target = id ? await message.guild.members.fetch(id).catch(() => null) : null;
    if (!target) {
      await envoyer({ embeds: [embed({ guild: message.guild, color: COLORS.warning,
        author: { name: "Membre introuvable" },
        description: `Usage : \`${p}${name} ${cmd.usage}\`` })] });
      return true;
    }
    const problem = cmd.noHierarchy ? null : checkTarget(message.guild, message.member, target, config);
    if (problem) {
      await envoyer({ embeds: [embed({ guild: message.guild, color: COLORS.danger,
        author: { name: "Action refusée" }, description: problem })] });
      return true;
    }
  }

  const rest = parts.slice(cmd.target ? 1 : 0).join(" ").trim();

  try {
    const r = await cmd.run({ message, args: parts, rest, target, config, level });
    if (!r) { await envoyer({ embeds: [embed({ guild: message.guild, color: COLORS.success,
      author: { name: `${ICONS.ok}  Fait` } })] }); return true; }
    if (r.envoye) { if (conf.deleteInvocation) await message.delete().catch(() => null); return true; }
    if (r.embed) { await envoyer({ embeds: [r.embed] }); return true; }
    await envoyer({ embeds: [embed({ guild: message.guild, color: r.color ?? COLORS.success,
      author: { name: `${r.ok === false ? ICONS.no : ICONS.ok}  ${r.title ?? "Fait"}` },
      description: r.text })] });
  } catch (e) {
    console.error("[prefixe]", name, e.message);
    await envoyer({ embeds: [embed({ guild: message.guild, color: COLORS.danger,
      author: { name: `${ICONS.no}  Erreur` },
      description: `\`${p}${name}\` a échoué. Vérifie mes permissions et l'usage : \`${p}${name} ${cmd.usage}\`` })] });
  }
  return true;
}

/* ========================================================================== */
/*                 22 - ESPACE COINS : REGLEMENT ET PANNEAUX                  */
/* ========================================================================== */

// coinsspace.js — remplissage complet de la catégorie ESPACE COINS.


const b = (id, label, style = ButtonStyle.Secondary, emoji) => {
  const x = new ButtonBuilder().setCustomId(id).setStyle(style);
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) x.setLabel(clean.slice(0, 80));
  if (emoji) x.setEmoji(emoji);
  if (!clean && !emoji) x.setLabel("·");
  return x;
};

/* ========================================================================== */
/*                          PANNEAUX DE L'ESPACE COINS                        */
/* ========================================================================== */

/** Devanture du casino, publiée dans l'espace coins. */
function casinoPanel(guild, config) {
  const cas = config.casino ?? {};
  const actifs = Object.entries(GAMES).filter(([id]) => cas.games?.[id] !== false);
  return {
    embeds: [embed({
      guild, color: COLORS.gold, author: { name: "🎰  Casino de Naoya" },
      description: [
        "```",
        "  ╔═══════════════════════════╗",
        "  ║   🎰   C A S I N O   🎰   ║",
        "  ╚═══════════════════════════╝",
        "```",
        `Mise de **${num(cas.minBet ?? 50)}** à **${num(cas.maxBet ?? 250000)}** ${config.economy.currency}`,
      ].join("\n"),
      fields: actifs.map(([, g]) => ({ name: `${g.emoji} ${g.label}`, value: g.desc, inline: true })),
      footer: "Gains calculés comme dans un vrai casino · la maison garde 3 %",
    })],
    components: [new ActionRowBuilder().addComponents(
      b("cas:open", "Entrer au casino", ButtonStyle.Danger, "🎰"),
      b("cr:open", "Arrière-salle", ButtonStyle.Secondary, "🚬"),
      b("pub:coins", "Mes jetons", ButtonStyle.Secondary, "🪙"),
      b("pub:top:coins", "Les plus riches", ButtonStyle.Secondary, "🏆"),
    )],
  };
}

function shopPanel(guild, config) {
  return {
    embeds: [embed({
      guild, color: COLORS.gold, author: { name: `${ICONS.coin}  Boutique` },
      description: [
        "```",
        "  ┌───────────────────────────┐",
        "  │   🛒   B O U T I Q U E    │",
        "  └───────────────────────────┘",
        "```",
        `Dépense tes ${config.economy.currency} contre du concret.`,
      ].join("\n"),
      fields: [
        { name: "🕊️ Pardon", value: "Efface ton dernier avertissement", inline: true },
        { name: "📈 XP", value: "Crédité sur ton niveau", inline: true },
        { name: "🚀 Boost", value: "XP multiplié pendant des heures", inline: true },
        { name: "✨ Rôle personnalisé", value: "Ton nom, ta couleur", inline: true },
        { name: "🎭 Rôles du serveur", value: "Mis en vente par le staff", inline: true },
        { name: "\u200b", value: "\u200b", inline: true },
      ],
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
      description: [
        "```",
        "  ┌───────────────────────────┐",
        "  │  🎁  R É C O M P E N S E S │",
        "  └───────────────────────────┘",
        "```",
        "Tout est gratuit. Il suffit de revenir.",
      ].join("\n"),
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
        name: "🎰 Les faire fructifier",
        value: `Machine à sous, blackjack, roulette, démineur, dés, pile ou face. La maison garde 3 % : sur la durée, le casino gagne. Joue ce que tu acceptes de perdre.`,
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

  // Les panneaux passent par la table d'affectation : emplacement mémorisé,
  // message modifié plutôt que dupliqué, vérification possible ensuite.
  const pub = await publishAllDestinations(guild);
  for (const line of pub.done) report.push({ ok: true, label: "Panneau", detail: line });
  for (const line of pub.failed) report.push({ ok: false, label: "Panneau", detail: line });

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
/*                23 - AFFECTATION ET VERIFICATION DES SALONS                 */
/* ========================================================================== */

// destinations.js — la table d'affectation : quel panneau, quelle fonction, quel salon.


/* ========================================================================== */
/*                          ACCÈS PAR CHEMIN POINTÉ                           */
/* ========================================================================== */

const getPath = (obj, path) => path.split(".").reduce((o, k) => o?.[k], obj);

function patchPath(path, value) {
  const parts = path.split(".");
  const out = {};
  let cur = out;
  parts.forEach((k, idx) => {
    if (idx === parts.length - 1) cur[k] = value;
    else { cur[k] = {}; cur = cur[k]; }
  });
  return out;
}

/* ========================================================================== */
/*                            TABLE D'AFFECTATION                             */
/* ========================================================================== */

/**
 * kind : "panel"   → le bot y publie un message à boutons
 *        "function"→ le bot y écrit quand un événement se produit
 *        "counter" → salon vocal renommé automatiquement
 * path  : où l'identifiant est rangé dans la configuration
 * auto  : noms de salons cherchés si aucun salon n'est imposé
 */
const DESTINATIONS = [
  // ---------------------------------- Panneaux ----------------------------
  { id: "memberPanel", label: "Espace membre", emoji: "🧭", kind: "panel",
    path: "funcOverrides.memberPanel", auto: ["commandes", "cmds-coins", "bot"],
    signature: "🧭  Espace membre", build: (g) => memberPanel(g) },

  { id: "ticketPanel", label: "Panneau de tickets", emoji: "🎫", kind: "panel",
    path: "funcOverrides.ticketPanel", auto: ["tickets"],
    build: (g, c) => ticketPanel(g, c), signature: `${ICONS.ticket}  Centre d'aide` },


  { id: "boutique", label: "Panneau boutique", emoji: "🛒", kind: "panel",
    path: "funcOverrides.boutique", auto: ["boutique-coins", "boutique"],
    signature: `${ICONS.coin}  Boutique`, build: (g, c) => shopPanel(g, c) },

  { id: "roleMenus", label: "Menus de rôles", emoji: "🎭", kind: "panel",
    path: "funcOverrides.roleMenus", auto: ["role", "roles", "choix-des-roles"],
    signature: "🎭  Choisis tes rôles", special: "roleMenus" },

  { id: "casino", label: "Panneau casino", emoji: "🎰", kind: "panel",
    path: "funcOverrides.casino", auto: ["casino", "coins"],
    signature: "🎰  Casino de Naoya", build: (g, c) => casinoPanel(g, c) },

  { id: "recompense", label: "Panneau récompenses", emoji: "🎁", kind: "panel",
    path: "funcOverrides.recompense", auto: ["recompense", "recompenses"],
    signature: "🎁  Tes récompenses", build: (g, c) => rewardPanel(g, c) },

  { id: "coinsRules", label: "Règlement des coins", emoji: "📜", kind: "panel",
    path: "funcOverrides.coinsRules", auto: ["reglement-coins", "regles-coins"],
    signature: "📜  Règlement de l'espace coins", build: (g, c) => ({ embeds: [rulesEmbed(g, c)] }) },

  { id: "coinsHowTo", label: "Guide « comment jouer »", emoji: "💡", kind: "panel",
    path: "funcOverrides.coinsHowTo", auto: ["comment-jouer"],
    signature: "💡  Comment gagner des coins", build: (g, c) => ({ embeds: [howToPlayEmbed(g, c)] }) },

  { id: "ticketCounter", label: "Compteur de tickets", emoji: "📨", kind: "panel",
    path: "funcOverrides.ticketCounter", auto: ["compteur-tickets"],
    signature: "Compteur de tickets", special: "ticketCounter" },

  // ---------------------------------- Fonctions ---------------------------
  { id: "welcome", label: "Messages de bienvenue", emoji: "👋", kind: "function",
    path: "welcomeChannelId", auto: ["bienvenue", "welcome", "arrivees"] },

  { id: "goodbye", label: "Messages de départ", emoji: "🚪", kind: "function",
    path: "goodbyeChannelId", auto: ["departs", "logs-leave"] },

  { id: "levelUp", label: "Annonces de niveau", emoji: "📈", kind: "function",
    path: "funcOverrides.levelUp", auto: ["niveaux"] },

  { id: "drops", label: "Colis de coins", emoji: "📦", kind: "function",
    path: "economy.dropChannelId", auto: ["drop-colis"] },

  { id: "invites", label: "Annonces d'invitation", emoji: "🔗", kind: "function",
    path: "invites.channelId", auto: ["invitations"] },

  { id: "absences", label: "Absences du staff", emoji: "🛌", kind: "function",
    path: "funcOverrides.absences", auto: ["absences"] },

  { id: "coinsAccess", label: "Accès à l'espace coins", emoji: "🎰", kind: "function",
    path: "funcOverrides.coinsAccess", auto: ["acces-coins"] },

  // ---------------------------------- Compteurs ---------------------------
  { id: "counterMembers", label: "Compteur Membres", emoji: "💎", kind: "counter", voice: true,
    path: "counters.members", auto: [] },
  { id: "counterOnline", label: "Compteur Connectés", emoji: "🍋", kind: "counter", voice: true,
    path: "counters.online", auto: [] },
  { id: "counterVoice", label: "Compteur Vocal", emoji: "🎧", kind: "counter", voice: true,
    path: "counters.voice", auto: [] },
];

const KIND_LABEL = { panel: "Panneaux publiés", function: "Salons où le bot écrit", counter: "Compteurs vocaux" };

/* ========================================================================== */
/*                              RÉSOLUTION                                    */
/* ========================================================================== */

/** @returns {{channel, forced:boolean}} */
function resolveDestination(guild, config, dest) {
  const forcedId = getPath(config, dest.path);
  if (forcedId) {
    const ch = guild.channels.cache.get(forcedId);
    if (ch) return { channel: ch, forced: true };
  }
  if (dest.kind === "counter") {
    const counter = COUNTERS.find((c) => dest.id.toLowerCase().endsWith(c.key));
    const ch = counter && guild.channels.cache.find(
      (x) => (x.type === ChannelType.GuildVoice || x.type === ChannelType.GuildStageVoice) && counter.test.test(x.name));
    return { channel: ch ?? null, forced: false };
  }
  return { channel: dest.auto?.length ? findChannel(guild, dest.auto) : null, forced: false };
}

async function setDestination(guildId, dest, channelId) {
  return updateConfig(guildId, patchPath(dest.path, channelId));
}

async function clearDestination(guildId, dest) {
  return updateConfig(guildId, patchPath(dest.path, null));
}

/* ========================================================================== */
/*                              PUBLICATION                                   */
/* ========================================================================== */

/** Modifie notre message existant plutôt que d'en empiler un nouveau. */
async function publishOrEdit(channel, payload, signature = null) {
  let mine = null;
  try {
    const recent = await channel.messages.fetch({ limit: 25 });
    const list = typeof recent?.find === "function" ? recent : [...(recent?.values?.() ?? [])];
    mine = list.find((m) => m.author?.id === channel.guild.members.me.id
      && (signature ? matchesSignature(m, signature) : m.embeds?.length));
  } catch { mine = null; }
  if (mine) return mine.edit(payload).then(() => mine).catch(() => channel.send(payload).catch(() => null));
  return channel.send(payload).catch(() => null);
}

/** Ce message est-il bien le panneau attendu ? */
function matchesSignature(message, signature) {
  const e = message?.embeds?.[0];
  if (!e) return false;
  const author = e.author?.name ?? e.data?.author?.name ?? "";
  const title = e.title ?? e.data?.title ?? "";
  return author === signature || title === signature;
}

/** Publie un panneau dans son salon affecté. */
async function publishDestination(guild, config, dest) {
  if (dest.kind !== "panel") return { ok: false, reason: "Ce n'est pas un panneau." };
  const { channel } = resolveDestination(guild, config, dest);
  if (!channel) return { ok: false, reason: "Aucun salon affecté." };
  if (!canSend(channel)) return { ok: false, reason: `Je ne peux pas écrire dans ${channel}.` };

  if (dest.special === "ticketCounter") {
    await refreshTicketCounter(guild);
    return { ok: true, channel };
  }
  if (dest.special === "roleMenus") {
    const r = await publishRoleMenus(guild, channel);
    return r.ok ? { ok: true, channel } : { ok: false, reason: r.reason };
  }
  const message = await publishOrEdit(channel, dest.build(guild, config), dest.signature);
  if (message?.id) {
    await updateConfig(guild.id, { panelMessages: { ...(config.panelMessages ?? {}),
      [dest.id]: { channelId: channel.id, messageId: message.id } } });
  }
  return { ok: true, channel, message };
}

/** Publie tous les panneaux affectés d'un coup. */
async function publishAllDestinations(guild) {
  const config = await getConfig(guild.id);
  const done = [];
  const failed = [];
  for (const dest of DESTINATIONS.filter((d) => d.kind === "panel")) {
    try {
      const r = await publishDestination(guild, config, dest);
      if (r.ok) done.push(`${dest.emoji} ${dest.label} → ${r.channel}`);
      else failed.push(`${dest.emoji} ${dest.label} — ${r.reason}`);
    } catch (e) {
      failed.push(`${dest.emoji} ${dest.label} — ${e.message.slice(0, 80)}`);
    }
  }
  return { done, failed };
}

/* ========================================================================== */
/*                                 RÉSUMÉ                                     */
/* ========================================================================== */

function destinationReport(guild, config) {
  const groups = { panel: [], function: [], counter: [] };
  for (const dest of DESTINATIONS) {
    const { channel, forced } = resolveDestination(guild, config, dest);
    groups[dest.kind].push({
      dest, channel, forced,
      line: `${channel ? "✅" : "🔴"} ${dest.emoji} **${dest.label}** → ${channel ? `${channel}` : "_non affecté_"}${forced ? " ⚙️" : ""}`,
    });
  }
  return groups;
}


/* ========================================================================== */
/*                   VÉRIFICATION : EST-CE AU BON ENDROIT ?                   */
/* ========================================================================== */

const ISSUE_LABEL = {
  ok: "En place",
  unassigned: "Aucun salon",
  ambiguous: "Plusieurs salons possibles",
  unpublished: "Salon défini, panneau absent",
  misplaced: "Panneau publié ailleurs",
  unreachable: "Salon inaccessible",
};

/**
 * Contrôle chaque affectation : salon défini, non ambigu, panneau réellement présent.
 * @returns {Promise<Array<{dest, status, channel, candidates, foundIn}>>}
 */
async function verifyDestinations(guild, config) {
  const out = [];

  for (const dest of DESTINATIONS) {
    const forcedId = getPath(config, dest.path);
    const candidates = dest.auto?.length ? findCandidates(guild, dest.auto) : [];
    const { channel } = resolveDestination(guild, config, dest);

    // 1. aucun salon du tout
    if (!channel) { out.push({ dest, status: "unassigned", channel: null, candidates }); continue; }

    // 2. plusieurs salons portent le même nom et rien n'a été imposé
    if (!forcedId && candidates.length > 1) {
      out.push({ dest, status: "ambiguous", channel, candidates });
      continue;
    }

    // 3. le bot doit pouvoir y écrire
    if (dest.kind !== "counter" && !canSend(channel)) {
      out.push({ dest, status: "unreachable", channel, candidates });
      continue;
    }

    // 4. pour un panneau : le message est-il vraiment là ?
    if (dest.kind === "panel") {
      const known = config.panelMessages?.[dest.id];
      let found = null;

      if (known?.messageId) {
        const ch = guild.channels.cache.get(known.channelId);
        if (ch) found = await ch.messages.fetch(known.messageId).catch(() => null);
        if (found && known.channelId !== channel.id) {
          out.push({ dest, status: "misplaced", channel, candidates, foundIn: ch });
          continue;
        }
      }

      if (!found && dest.signature) {
        try {
          const recent = await channel.messages.fetch({ limit: 25 });
          const list = typeof recent?.find === "function" ? recent : [...(recent?.values?.() ?? [])];
          found = list.find((m) => m.author?.id === guild.members.me.id && matchesSignature(m, dest.signature));
        } catch { found = null; }
      }

      if (!found) { out.push({ dest, status: "unpublished", channel, candidates }); continue; }
    }

    out.push({ dest, status: "ok", channel, candidates });
  }

  return out;
}

/** Cherche des copies égarées de nos panneaux dans les salons candidats. */
async function scanStrayPanels(guild, config) {
  const strays = [];
  for (const dest of DESTINATIONS.filter((d) => d.kind === "panel" && d.signature)) {
    const { channel: assigned } = resolveDestination(guild, config, dest);
    for (const ch of findCandidates(guild, dest.auto ?? [])) {
      if (assigned && ch.id === assigned.id) continue;
      if (!canSend(ch)) continue;
      try {
        const recent = await ch.messages.fetch({ limit: 25 });
        const list = typeof recent?.find === "function" ? recent : [...(recent?.values?.() ?? [])];
        const hit = list.find((m) => m.author?.id === guild.members.me.id && matchesSignature(m, dest.signature));
        if (hit) strays.push({ dest, channel: ch, message: hit });
      } catch { /* salon illisible */ }
    }
  }
  return strays;
}

/** Résumé court pour l'accueil du panneau. */
function summarizeIssues(results) {
  const bad = results.filter((r) => r.status !== "ok");
  return { total: results.length, ok: results.length - bad.length, bad };
}

/* ========================================================================== */
/*                       24 - INSTALLATION AUTOMATIQUE                        */
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
  // Un rôle nommé exactement « Staff » fait foi ; sinon le rôle staff le plus bas.
  const named = [...guild.roles.cache.values()].find((r) => norm(r.name) === "staff" && !r.managed);
  const entryStaff = named ?? [...detected].filter((d) => d.level >= 1).sort((a, b) => a.level - b.level)[0]?.role;
  if (entryStaff) {
    patch.staffRoleId = entryStaff.id;
    steps.push(step(true, "Rôle staff des tickets",
      `${entryStaff} verra les tickets${named ? " (rôle « Staff » reconnu par son nom)" : ""}`));
  } else {
    steps.push(step(false, "Rôle staff des tickets", "Aucun rôle « Staff » — à définir dans Configuration → Rôles clés"));
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

  /* 8c-bis — table d'affectation ------------------------------------------- */
  {
    const cfgD = await getConfig(guild.id);
    const assigned = DESTINATIONS.filter((d) => resolveDestination(guild, cfgD, d).channel).length;
    steps.push(step(assigned >= DESTINATIONS.length * 0.7, `Affectations (${assigned}/${DESTINATIONS.length})`,
      assigned === DESTINATIONS.length ? "Chaque panneau et chaque fonction a son salon"
        : "Ouvre 📍 Affectations pour placer ce qui manque"));
  }

  /* 8d — espace coins ------------------------------------------------------- */
  await updateConfig(guild.id, patch);   // la boutique doit exister avant d'écrire les panneaux
  const space = await setupCoinsSpace(guild, memberPanel).catch(() => null);
  if (space) {
    steps.push(step(space.ko === 0, `Espace coins (${space.ok}/${space.ok + space.ko})`,
      space.report.filter((r) => r.ok).map((r) => r.label).join(", ") || "aucun salon rempli"));
  }

  /* 8e — vocaux temporaires -------------------------------------------------- */
  {
    const hub = resolveHub(guild, await getConfig(guild.id));
    if (hub) {
      patch.tempVoice = { ...(patch.tempVoice ?? {}), enabled: true, hubId: hub.id };
      steps.push(step(true, "Vocaux temporaires",
        `${hub} — chaque membre obtient son salon juste en dessous, sans limite de places`));
    } else {
      steps.push(step(false, "Vocaux temporaires",
        "Aucun vocal nommé « Créer ton vocal » — crée-le, ou désigne-le dans Vocal → Vocaux temporaires"));
    }
  }

  /* 9 — catégories de tickets ---------------------------------------------- */
  const cats = TICKET_TYPES.filter((t) => findCategory(guild, t.categories));
  steps.push(step(true, `Catégories de tickets (${cats.length}/${TICKET_TYPES.length} existantes)`,
    cats.length === TICKET_TYPES.length
      ? "Toutes présentes"
      : "Les manquantes seront créées automatiquement au premier ticket, masquées à tous sauf au rôle staff"));

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

/** Publie tous les panneaux dans les salons de la table d'affectation. */
async function publishAll(guild) {
  const r = await publishAllDestinations(guild);
  return r.done;
}

/** Ancienne version, conservée pour compatibilité. */
async function publishAllLegacy(guild) {
  const config = await getConfig(guild.id);
  const done = [];

  const ticketCh = findChannel(guild, FUNC_CHANNELS.ticketPanel);
  if (ticketCh && canSend(ticketCh)) {
    await ticketCh.send(ticketPanel(guild, await getConfig(guild.id))).catch(() => null);
    done.push(`Tickets → ${ticketCh}`);
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
/*             25 - PANNEAU, MENUS CONTEXTUELS, PANNEAUX PUBLICS              */
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
  { id: "dest", label: "Affectations", emoji: "📍", level: 4, desc: "Quel panneau va dans quel salon", trusted: true },
  { id: "publish", label: "Publications", emoji: "📢", level: 3, desc: "Panneaux, rôles, annonces, sondages" },
  { id: "tickets", label: "Tickets", emoji: "🎫", level: 4, desc: "Panneau, statistiques, compteur" },
  { id: "gw", label: "Giveaways", emoji: "🎁", level: 4, desc: "Lancer, terminer, retirer au sort" },
  { id: "counters", label: "Compteurs", emoji: "📊", level: 4, desc: "Membres, connectés, vocal", trusted: true },
  { id: "eco", label: "Économie", emoji: "🪙", level: 4, desc: "Coins, boutique, colis", trusted: true },
  { id: "money", label: "Trésorerie", emoji: "💸", level: 4, desc: "Donner et retirer des coins", trusted: true },
  { id: "rolemenus", label: "Menus de rôles", emoji: "🎭", level: 4, desc: "Rôles que les membres se donnent", trusted: true },
  { id: "look", label: "Apparence", emoji: "🎨", level: 4, desc: "Couleur du bot et créateur d'embed", trusted: true },
  { id: "prefix", label: "Préfixe", emoji: "⌨️", level: 5, desc: "Commandes texte : !ban, ?kick…", trusted: true },
  { id: "levels", label: "Niveaux", emoji: "📈", level: 4, desc: "XP, récompenses, annonces", trusted: true },
  { id: "ranks", label: "Grades", emoji: "🎖️", level: 4, desc: "Montée au temps de vocal et au message", trusted: true },
  { id: "voice", label: "Vocal", emoji: "🔊", level: 4, desc: "XP et coins gagnés en vocal", trusted: true },
  { id: "channels", label: "Droits des salons", emoji: "🔐", level: 4, desc: "Qui peut voir, écrire et parler où", trusted: true },
  { id: "escalation", label: "Escalade", emoji: "⚖️", level: 4, desc: "Sanction automatique au cumul d'avertissements", trusted: true },
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

const btn = (id, label, style = ButtonStyle.Secondary, emoji, disabled = false) => {
  const btnB = new ButtonBuilder().setCustomId(id).setStyle(style).setDisabled(disabled);
  const clean = (label ?? "").replace(/[\u200B-\u200D\uFEFF]/g, "").trim();
  if (clean) btnB.setLabel(clean.slice(0, 80));
  if (emoji) btnB.setEmoji(emoji);
  if (!clean && !emoji) btnB.setLabel("·");
  return btnB;
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

  try {
    const results = await verifyDestinations(guild, config);
    const { bad } = summarizeIssues(results);
    push(bad.length === 0, `Panneaux au bon endroit (${results.length - bad.length}/${results.length})`,
      bad.length === 1
        ? `${bad[0].dest.label} : ${ISSUE_LABEL[bad[0].status].toLowerCase()} — Affectations → Vérifier`
        : "Affectations → 🔎 Vérifier les emplacements");
  } catch { /* la vérification ne doit jamais bloquer l'accueil */ }

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
  const verrou = etatVerrou(i.guildId, i.user.id);

  const etat = [
    `${dot(config.automod.enabled)} Automod`, `${dot(config.antiraid.enabled)} Anti-raid`,
    `${dot(config.antinuke.enabled)} Anti-nuke`, `${dot(config.logsEnabled)} Journaux`,
    `${dot(config.levelsEnabled)} Niveaux`, `${dot(config.economy.enabled)} Économie`,
  ].join("  ·  ")
    + `\n${verrou.ouvert ? `🔓 Modifications ouvertes — ${verrou.minutes} min restantes` : "🔒 Code exigé pour toute modification"}`;

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
      btn("p:setup:publish", "Mettre à jour les panneaux", ButtonStyle.Primary, "🔄"),
      btn("p:verrou:basculer", verrou.ouvert ? `Verrouiller (${verrou.minutes} min)` : "Déverrouiller",
        verrou.ouvert ? ButtonStyle.Success : ButtonStyle.Secondary, verrou.ouvert ? "🔓" : "🔒"),
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
        row(btn("p:mod:page:mass", "Purge de masse — plusieurs salons", ButtonStyle.Danger, "🧹")),
        backRow(),
      ],
    };
  }

  /* ---------------------------- PURGE DE MASSE --------------------------- */
  if (id === "mod" && page === "mass") {
    const need = Number(config.purge?.level ?? 7);
    if (level < need) {
      return { embeds: [embed({ guild, color: COLORS.danger, author: { name: "🔒  Purge de masse" },
        description: `Cette opération demande **${PERM_LABELS[need]}**.\nTon niveau : **${PERM_LABELS[level]}**.` })],
        components: [backRow("p:mod")] };
    }
    const protectedCount = Object.keys(LOG_ROUTES).filter((k) => resolveLogChannel(guild, k, config)).length;
    return {
      embeds: [embed({ guild, author: { name: "🧹  Purge de masse" }, color: COLORS.danger,
        description: [
          "Vide plusieurs salons d'un coup. **Les salons ne sont pas supprimés.**",
          "",
          "**Ce qui n'est jamais touché :**",
          "• les messages de plus de **14 jours** — limite Discord, rien à y faire",
          "• les messages **épinglés**",
          `• tes **salons de journaux** (${protectedCount} détectés) et ceux que tu protèges`,
        ].join("\n"),
        fields: [
          { name: "Niveau requis", value: PERM_LABELS[need], inline: true },
          { name: "Protégés à la main", value: `${config.purge?.protectedChannels?.length ?? 0}`, inline: true },
        ],
        footer: "Un aperçu s'affiche avant toute suppression" })],
      components: [
        row(new ChannelSelectMenuBuilder().setCustomId("p:mod:mpsel")
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice)
          .setMinValues(1).setMaxValues(25).setPlaceholder("Purger des salons précis…")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:mod:mpcat")
          .setChannelTypes(ChannelType.GuildCategory).setPlaceholder("Purger toute une catégorie…")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:mod:mpprot")
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement, ChannelType.GuildVoice)
          .setPlaceholder("Protéger / déprotéger un salon…")),
        row(btn("p:mod:mpall", "Tout le serveur", ButtonStyle.Danger, "🌍"),
            btn("p:mod:mplevel", "Qui peut le faire", ButtonStyle.Secondary, "🛡️"),
            btn("p:mod", "Retour", ButtonStyle.Secondary, "◀️")),
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

    if (page === "backup") {
      const list = await listBackups(guild.id);
      const comps = [row(
        btn("p:config:bkcreate", "Créer une sauvegarde", ButtonStyle.Success, "💾"),
        btn("p:config:bkexport", "Télécharger en JSON", ButtonStyle.Primary, "📥"),
        btn("p:config:page:backup", "Actualiser", ButtonStyle.Secondary, "🔄"))];
      if (list.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:config:bkpick")
        .setPlaceholder("Agir sur une sauvegarde…")
        .addOptions(list.map((b) => ({ label: b.name.slice(0, 100), value: String(b.id),
          description: new Date(b.created_at).toLocaleString("fr-FR").slice(0, 100) })))));
      comps.push(backRow("p:config"));
      return {
        embeds: [embed({ guild, author: { name: "💾  Sauvegardes de la configuration" }, color: COLORS.primary,
          description: list.length
            ? list.map((b) => `\`#${b.id}\` **${b.name}** — ${ts(b.created_at)}`).join("\n")
            : "_Aucune sauvegarde._ Crées-en une avant chaque grosse modification.",
          footer: "10 sauvegardes conservées · seuls les réglages sont enregistrés, pas les données des membres" })],
        components: comps,
      };
    }

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
            btn("p:config:page:backup", "Sauvegardes", ButtonStyle.Success, "💾"),
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
          { name: "Épargné à partir de", value: (a.exemptFromLevel ?? 4) > 0 ? PERM_LABELS[a.exemptFromLevel ?? 4] : "personne", inline: true },
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
            btn("p:automod:mots", "Mots interdits", ButtonStyle.Primary, "🚫"),
            btn("p:automod:floor", "Qui est épargné", ButtonStyle.Secondary, "🛡️")),
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
        fields: [
          ...(Object.keys(config.perms.users).length
            ? [{ name: "Forçages individuels", value: Object.entries(config.perms.users).map(([u, l]) => `\`${l}\` <@${u}>`).join("\n").slice(0, 1000) }] : []),
          { name: "👑 Immunité « Administrateur »", value: config.adminImmunity === false
            ? "🔴 coupée — les administrateurs sont traités comme tout le monde"
            : "🟢 active — permission Discord Administrateur = intouchable sur tout le serveur" },
        ],
        footer: `Propriétaire du serveur : niveau 6 · propriétaire de 0x : niveau 7 · sanctionnable à partir du niveau ${config.ownerSanctionLevel ?? 5}` })],
      components: [
        row(btn("p:perms:auto", "Détection automatique", ButtonStyle.Primary, "🪄"),
            btn("p:perms:page:sections", "Niveau des sections", ButtonStyle.Secondary, "📋"),
            btn("p:perms:owner", "Ma protection", ButtonStyle.Secondary, "🛡️"),
            btn("p:perms:adminimm", config.adminImmunity === false ? "Immunité admin : coupée" : "Immunité admin : active",
              config.adminImmunity === false ? ButtonStyle.Danger : ButtonStyle.Success, "👑"),
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
        row(new StringSelectMenuBuilder().setCustomId("p:tickets:style").setPlaceholder("Personnaliser une catégorie…")
          .addOptions(TICKET_TYPES.map((t) => {
            const k = { ...t, ...(config.ticketStyle?.[t.id] ?? {}) };
            return { label: k.label.slice(0, 100), value: t.id, description: (k.desc ?? "").slice(0, 100) };
          }))),
        row(btn("p:tickets:refresh", "Actualiser le compteur", ButtonStyle.Primary, "🔄"),
            btn("p:tickets:remind", config.ticketReminder?.enabled ? "Couper les rappels" : "Activer les rappels",
              config.ticketReminder?.enabled ? ButtonStyle.Danger : ButtonStyle.Success, "⏰"),
            btn("p:tickets:delay", "Délai", ButtonStyle.Primary, "⏱️"),
            btn("p:tickets:check", "Vérifier maintenant", ButtonStyle.Secondary, "🔍"),
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

  /* --------------------------------- GRADES ------------------------------ */
  if (id === "ranks") {
    const r = config.ranks ?? {};
    const list = ladder(config);
    const comps = [
      row(btn("p:ranks:detect", "Détecter automatiquement", ButtonStyle.Success, "🪄"),
          btn("p:ranks:t", r.enabled ? "Couper les grades" : "Activer les grades",
            r.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          btn("p:ranks:auto", r.autoPromote ? "Promotion auto : oui" : "Promotion auto : non",
            r.autoPromote ? ButtonStyle.Success : ButtonStyle.Secondary, "⬆️"),
          btn("p:ranks:both", r.requireBoth === false ? "Un seul critère" : "Les deux critères",
            ButtonStyle.Secondary, "🎯"),
          btn("p:ranks:prev", r.removePrevious === false ? "Cumule les grades" : "Retire l'ancien",
            ButtonStyle.Secondary, "🔁")),
      row(new RoleSelectMenuBuilder().setCustomId("p:ranks:add").setPlaceholder("Ajouter un grade : choisis le rôle…")),
    ];
    if (list.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:ranks:del")
      .setPlaceholder("Retirer un grade…")
      .addOptions(list.slice(0, 25).map((x) => ({ label: (x.name ?? guild.roles.cache.get(x.roleId)?.name ?? x.roleId).slice(0, 100),
        value: x.roleId, description: `${x.hours} h · ${num(x.messages)} messages`.slice(0, 100) })))));
    comps.push(row(btn("p:ranks:recalc", "Recalculer tout le monde", ButtonStyle.Primary, "🔄"),
                   btn("p:home", "Retour", ButtonStyle.Secondary, "◀️")));

    const e = ladderEmbed(guild, config);
    e.data.description = `État : **${onOff(r.enabled)}** · promotion ${r.autoPromote ? "automatique" : "manuelle"}\n`
      + `${r.requireBoth === false ? "Un seul critère suffit" : "Heures **et** messages requis"}\n\n`
      + (e.data.description ?? "");
    return { embeds: [e], components: comps };
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

  /* -------------------------------- ESCALADE ----------------------------- */
  if (id === "escalation") {
    const e = config.escalation ?? {};
    const rules = [...(e.rules ?? [])].sort((a, b) => a.warns - b.warns);
    const comps = [
      row(btn("p:escalation:t", e.enabled ? "Couper l'escalade" : "Activer l'escalade",
            e.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
          btn("p:escalation:add", "Ajouter un palier", ButtonStyle.Primary, "➕"),
          btn("p:escalation:expire", "Péremption", ButtonStyle.Secondary, "⏳"),
          btn("p:escalation:default", "Paliers recommandés", ButtonStyle.Secondary, "🪄")),
    ];
    if (rules.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:escalation:del")
      .setPlaceholder("Retirer un palier…")
      .addOptions(rules.slice(0, 25).map((r) => ({ label: `${r.warns} avertissement(s)`, value: String(r.warns),
        emoji: ESCALATION_ACTIONS[r.action]?.emoji,
        description: `${ESCALATION_ACTIONS[r.action]?.label ?? r.action}${r.duration ? ` · ${r.duration}` : ""}`.slice(0, 100) })))));
    comps.push(backRow());

    return {
      embeds: [embed({ guild, author: { name: "⚖️  Escalade des sanctions" }, color: e.enabled ? COLORS.warning : COLORS.neutral,
        description: [
          `État : **${onOff(e.enabled)}**`,
          e.expireDays ? `Les avertissements ne comptent plus après **${e.expireDays} jours**.` : "Les avertissements **ne périment jamais**.",
          "",
          rules.length ? rules.map((r) => `\`${String(r.warns).padStart(2)}\` ${describeRule(r).replace(/^\*\*\d+\*\* avertissement\(s\) → /, "")}`).join("\n")
            : "_Aucun palier : rien ne se déclenche automatiquement._",
        ].join("\n"),
        footer: "Le bot agit en son nom propre — la sanction est la même pour tous" })],
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
    if (page === "temp") {
      const tv = config.tempVoice ?? {};
      const hub = resolveHub(guild, config);
      const actifs = await listTempVoice(guild.id);
      return {
        embeds: [embed({ guild, author: { name: "➕  Vocaux temporaires" },
          color: hub ? COLORS.success : COLORS.warning,
          description: hub
            ? `Salon d'accueil : ${hub}\nChaque membre qui le rejoint obtient **son propre vocal**, créé juste en dessous, dans la même catégorie.`
            : "Aucun salon d'accueil. Choisis un vocal ci-dessous : quiconque le rejoindra obtiendra son propre salon.",
          fields: [
            { name: "État", value: onOff(tv.enabled), inline: true },
            { name: "Places par défaut", value: tv.defaultLimit ? `${tv.defaultLimit}` : "illimité", inline: true },
            { name: "Salons ouverts", value: `${actifs.length}`, inline: true },
            { name: "Nom donné", value: `\`${tv.nameTemplate ?? "🔊 {user}"}\` — \`{user}\` devient le pseudo` },
            { name: "Ce que le propriétaire peut faire",
              value: "Renommer · limiter les places · verrouiller · masquer · régler la qualité · autoriser ou expulser quelqu'un · transférer · supprimer" },
          ],
          footer: "Le salon disparaît tout seul dès qu'il se vide" })],
        components: [
          row(new ChannelSelectMenuBuilder().setCustomId("p:voice:hub")
            .setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Salon d'accueil « Créer ton vocal »…")),
          row(btn("p:voice:tempt", tv.enabled ? "Couper les vocaux temporaires" : "Activer les vocaux temporaires",
                tv.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
              btn("p:voice:tempcfg", "Nom et places", ButtonStyle.Primary, "✏️"),
              btn("p:voice:purge", "Nettoyer les salons vides", ButtonStyle.Secondary, "🧹")),
          backRow("p:voice"),
        ],
      };
    }

    const v = config.voice ?? {};
    const top = await topVoice(guild.id, 8);
    let live = 0;
    for (const vs of guild.voiceStates.cache.values()) if (vs.channelId) live++;
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
            btn("p:voice:tick", "Distribuer maintenant", ButtonStyle.Secondary, "⚡"),
            btn("p:voice:page:temp", "Vocaux temporaires", ButtonStyle.Success, "➕")),
        row(new ChannelSelectMenuBuilder().setCustomId("p:voice:ignore")
          .setChannelTypes(ChannelType.GuildVoice).setPlaceholder("Ajouter/retirer un salon ignoré")),
        backRow(),
      ],
    };
  }

  /* -------------------------------- APPARENCE ---------------------------- */
  if (id === "look") {
    /* --- créateur d'embed --- */
    if (page === "embed") {
      const d = getDraft(i);
      const comps = [
        row(btn("p:look:etexte", "Titre et corps", ButtonStyle.Primary, "✏️"),
            btn("p:look:epied", "Auteur et pied de page", ButtonStyle.Primary, "🖋️"),
            btn("p:look:eimg", "Images", ButtonStyle.Secondary, "🖼️"),
            btn("p:look:ets", d.timestamp ? "Masquer l'heure" : "Afficher l'heure", ButtonStyle.Secondary, "🕒")),
        row(new StringSelectMenuBuilder().setCustomId("p:look:ecouleur").setPlaceholder("Couleur de cet embed…")
          .addOptions([...PALETTE.map((p) => ({ label: p.nom, value: String(p.hex), emoji: p.emoji })),
            { label: "Autre couleur…", value: "custom", emoji: "🎯" }])),
        row(new ChannelSelectMenuBuilder().setCustomId("p:look:eenvoi")
          .setChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
          .setPlaceholder(draftReady(d) ? "Envoyer dans…" : "Remplis d'abord le titre ou le corps")),
        row(btn("p:look:eraz", "Recommencer", ButtonStyle.Danger, "🗑️"),
            btn("p:look", "Retour", ButtonStyle.Secondary, "◀️")),
      ];
      return {
        embeds: draftReady(d) ? [draftSummary(guild, d), renderDraft(guild, d)] : [draftSummary(guild, d)],
        components: comps,
      };
    }

    /* --- couleur du bot --- */
    const actuelle = config.brandColor ?? COLORS.primary;
    return {
      embeds: [embed({ guild, author: { name: "🎨  Apparence" }, color: actuelle,
        description: [
          `Couleur actuelle : **${nomDeCouleur(actuelle)}** \`${hexOf(actuelle)}\``,
          "",
          "Elle remplace le bleu partout : panneau, annonces, fiches, panneaux publics.",
          "Les couleurs de sens restent inchangées — vert pour une réussite, rouge pour une erreur.",
        ].join("\n"),
        footer: "Cet encadré est déjà à la couleur choisie" })],
      components: [
        row(new StringSelectMenuBuilder().setCustomId("p:look:couleur").setPlaceholder("Choisir une couleur…")
          .addOptions([...PALETTE.map((p) => ({ label: p.nom, value: String(p.hex), emoji: p.emoji,
            default: p.hex === actuelle })), { label: "Autre couleur…", value: "custom", emoji: "🎯" }])),
        row(btn("p:look:page:embed", "Créateur d'embed", ButtonStyle.Success, "✨"),
            btn("p:look:raz", "Revenir au bleu", ButtonStyle.Secondary, "↩️"),
            btn("p:home", "Retour", ButtonStyle.Secondary, "◀️")),
      ],
    };
  }

  /* ----------------------------- MENUS DE RÔLES -------------------------- */
  if (id === "rolemenus") {
    const groups = config.roleMenus ?? [];

    if (page?.startsWith("g_")) {
      const g = groups.find((x) => x.id === page.slice(2));
      if (g) {
        const roles = g.roleIds.map((r) => guild.roles.cache.get(r)).filter(Boolean);
        return {
          embeds: [embed({ guild, author: { name: `${g.emoji}  ${g.title}` }, color: COLORS.primary,
            description: `${g.desc ?? ""}\n\n**${g.max === 1 ? "Un seul choix" : "Choix multiples"}** · ${roles.length} rôle(s)`,
            fields: [{ name: "Rôles proposés", value: roles.length
              ? roles.map((r) => `${r} — _${roleLabel(r).label}_`).join("\n").slice(0, 1000) : "_aucun_" }] })],
          components: [
            row(new RoleSelectMenuBuilder().setCustomId(`p:rolemenus:add:${g.id}`)
              .setMinValues(1).setMaxValues(20).setPlaceholder("Ajouter des rôles à cette catégorie…")),
            ...(roles.length ? [row(new StringSelectMenuBuilder().setCustomId(`p:rolemenus:rm:${g.id}`)
              .setPlaceholder("Retirer un rôle…")
              .addOptions(roles.slice(0, 25).map((r) => ({ label: roleLabel(r).label.slice(0, 100), value: r.id }))))] : []),
            row(btn(`p:rolemenus:max:${g.id}`, g.max === 1 ? "Passer en choix multiples" : "Passer en choix unique",
                  ButtonStyle.Primary, "🔁"),
                btn(`p:rolemenus:drop:${g.id}`, "Supprimer la catégorie", ButtonStyle.Danger, "🗑️"),
                btn("p:rolemenus", "Retour", ButtonStyle.Secondary, "◀️")),
          ],
        };
      }
    }

    const sansGroupe = [...guild.roles.cache.values()]
      .filter((r) => r.id !== guild.id && !r.managed && !isSeparator(r) && !groups.some((g) => g.roleIds.includes(r.id)));

    const comps = [
      row(btn("p:rolemenus:detect", "Détecter automatiquement", ButtonStyle.Success, "🪄"),
          btn("p:rolemenus:pub", "Publier dans le salon", ButtonStyle.Primary, "📤"),
          btn("p:rolemenus:clear", "Tout effacer", ButtonStyle.Danger, "🗑️")),
    ];
    if (groups.length) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:rolemenus:pick")
      .setPlaceholder("Ouvrir une catégorie…")
      .addOptions(groups.slice(0, 25).map((g) => ({ label: g.title.slice(0, 100), value: g.id, emoji: g.emoji,
        description: `${g.roleIds.length} rôle(s) · ${g.max === 1 ? "un seul" : "multiples"}`.slice(0, 100) })))));
    comps.push(backRow());

    return {
      embeds: [embed({ guild, author: { name: "🎭  Menus de rôles" },
        color: groups.length ? COLORS.success : COLORS.warning,
        description: groups.length
          ? "Les membres se donnent ces rôles eux-mêmes, catégorie par catégorie."
          : "Aucune catégorie. Appuie sur **Détecter automatiquement** : je reconnais les couleurs, le genre, l'âge, la situation, les notifications et les centres d'intérêt.",
        fields: [
          ...groups.map((g) => ({ name: `${g.emoji} ${g.title}`,
            value: g.roleIds.map((r) => `<@&${r}>`).join(" ").slice(0, 1000) || "_vide_",
            inline: false })),
          { name: "Rôles hors catégorie", value: sansGroupe.length
            ? `${sansGroupe.length} rôle(s) non proposés` : "aucun", inline: true },
        ].slice(0, 25),
        footer: "Les rôles séparateurs (barres) sont ignorés d'office" })],
      components: comps,
    };
  }

  /* ------------------------------- TRÉSORERIE ---------------------------- */
  if (id === "money") {
    const c = config.economy.currency;
    const s2 = await coinsSummary(guild.id);
    const top = await topCoins(guild.id, 5);
    return {
      embeds: [embed({ guild, author: { name: "💸  Trésorerie" }, color: COLORS.gold,
        description: "Crédite ou retire des coins, à une personne, à un rôle entier ou à tout le serveur.",
        fields: [
          { name: "En circulation", value: `${c} **${num(s2.total)}**`, inline: true },
          { name: "Porteurs", value: `${s2.porteurs}`, inline: true },
          { name: "Endettés", value: s2.endettes ? `🚨 ${s2.endettes}` : "aucun", inline: true },
          { name: "Les plus riches", value: top.length
            ? top.map((x, n) => `**${n + 1}.** <@${x.userId}> — ${c} ${num(x.coins)}`).join("\n") : "_personne_" },
        ],
        footer: "Chaque mouvement part dans tes journaux" })],
      components: [
        row(new UserSelectMenuBuilder().setCustomId("p:money:user").setPlaceholder("Créditer ou retirer à une personne…")),
        row(new RoleSelectMenuBuilder().setCustomId("p:money:role").setPlaceholder("Créditer tout un rôle…")),
        row(btn("p:money:all", "Créditer tout le serveur", ButtonStyle.Success, "🌍"),
            btn("p:money:reset", "Remettre un solde à zéro", ButtonStyle.Danger, "🧹"),
            btn("p:money", "Actualiser", ButtonStyle.Secondary, "🔄")),
        backRow(),
      ],
    };
  }

  /* --------------------------------- PRÉFIXE ----------------------------- */
  if (id === "prefix") {
    const pc = config.prefix ?? {};
    const p2 = pc.char || "!";
    const coupees = pc.disabled ?? [];
    const noms = Object.keys(PREFIX_COMMANDS);
    const actives = noms.filter((n) => !coupees.includes(n));

    if (page === "cmds") {
      return {
        embeds: [embed({ guild, author: { name: `⌨️  Les ${noms.length} commandes` }, color: COLORS.primary,
          description: noms.map((n) => {
            const cmd = PREFIX_COMMANDS[n];
            return `${coupees.includes(n) ? "🔴" : "🟢"} \`${p2}${n}\` — ${cmd.desc} · _${PERM_LABELS[prefixRequiredLevel(n, cmd, config)]}_`;
          }).join("\n").slice(0, 4000),
          footer: "Choisis-en une pour l'ouvrir, la fermer ou changer son niveau" })],
        components: [
          row(new StringSelectMenuBuilder().setCustomId("p:prefix:pick").setPlaceholder("Régler une commande…")
            .addOptions(noms.slice(0, 25).map((n) => ({ label: `${p2}${n}`, value: n,
              description: PREFIX_COMMANDS[n].desc.slice(0, 100) })))),
          backRow("p:prefix"),
        ],
      };
    }

    return {
      embeds: [embed({ guild, author: { name: "⌨️  Commandes à préfixe" }, color: pc.enabled ? COLORS.success : COLORS.neutral,
        description: [
          `État : **${onOff(pc.enabled)}** · préfixe actuel : **\`${p2}\`**`,
          "",
          `Exemples : \`${p2}ban @membre spam\` · \`${p2}mute @membre 10m\` · \`${p2}clear 50\``,
        ].join("\n"),
        fields: [
          { name: `Ouvertes (${actives.length}/${noms.length})`,
            value: actives.map((n) => `\`${p2}${n}\``).join(" ").slice(0, 1000) || "_aucune_" },
          ...(coupees.length ? [{ name: "Fermées", value: coupees.map((n) => `\`${p2}${n}\``).join(" ").slice(0, 1000) }] : []),
          { name: "Message de commande", value: pc.deleteInvocation ? "supprimé après exécution" : "conservé", inline: true },
        ],
        footer: "Le niveau de perm s'applique aussi aux commandes texte" })],
      components: [
        row(new StringSelectMenuBuilder().setCustomId("p:prefix:char").setPlaceholder(`Changer le préfixe (actuel : ${p2})`)
          .addOptions(PREFIX_CHOICES.map((ch) => ({ label: `${ch}ban  ${ch}kick  ${ch}mute`, value: ch,
            default: ch === p2 })))),
        row(btn("p:prefix:t", pc.enabled ? "Couper les commandes texte" : "Activer les commandes texte",
              pc.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
            btn("p:prefix:page:cmds", "Régler chaque commande", ButtonStyle.Primary, "📋"),
            btn("p:prefix:del", pc.deleteInvocation ? "Garder le message" : "Supprimer le message",
              ButtonStyle.Secondary, "🧹")),
        backRow(),
      ],
    };
  }

  /* --------------------------------- CASINO ------------------------------ */
  if (id === "eco" && page === "casino") {
    const cas = config.casino ?? {};
    const actifs = Object.entries(GAMES).filter(([id2]) => cas.games?.[id2] !== false);
    return {
      embeds: [embed({ guild, author: { name: "🎰  Casino" }, color: cas.enabled === false ? COLORS.neutral : COLORS.gold,
        description: `État : **${onOff(cas.enabled !== false)}** · mises de **${num(cas.minBet ?? 50)}** à **${num(cas.maxBet ?? 250000)}**`,
        fields: [
          { name: `Jeux ouverts (${actifs.length}/${Object.keys(GAMES).length})`,
            value: Object.entries(GAMES).map(([id2, g]) =>
              `${cas.games?.[id2] === false ? "🔴" : "🟢"} ${g.emoji} ${g.label}`).join("\n") },
          { name: "Avantage de la maison", value: "3 % sur les dés et le démineur · 2,7 % à la roulette (zéro unique) · ×1,96 au pile ou face", inline: false },
          { name: "🚬 Arrière-salle", value: config.crime?.enabled === false ? "🔴 fermée" :
            [`🟢 ouverte · dette max **${num(config.crime?.maxDebt ?? 100000)}**`,
             ...Object.values(JOBS).map((j) =>
               `${j.emoji} ${j.label} — ${Math.round(j.chance * 100)} % · ${num(j.min)}–${num(j.max)}`)].join("\n") },
          { name: "Exemples de gains", value: [
            `Démineur 3 mines, 5 cases : **×${minesMultiplier(3, 5).toFixed(2)}**`,
            `Dés seuil 50 : **×${diceOdds(50, true).mult.toFixed(2)}**`,
            "Machine à sous 🌟🌟🌟 : **×1500**",
          ].join("\n") },
        ],
        footer: "Sur la durée la maison gagne : c'est ce qui empêche l'économie de s'emballer" })],
      components: [
        row(btn("p:eco:cast", cas.enabled === false ? "Ouvrir le casino" : "Fermer le casino",
              cas.enabled === false ? ButtonStyle.Success : ButtonStyle.Danger, "🎰"),
            btn("p:eco:caslim", "Mises min et max", ButtonStyle.Primary, "🎚️"),
            btn("p:eco:crimet", config.crime?.enabled === false ? "Ouvrir l'arrière-salle" : "Fermer l'arrière-salle",
              config.crime?.enabled === false ? ButtonStyle.Success : ButtonStyle.Danger, "🚬"),
            btn("p:eco:debtt", config.crime?.debtBlocksCasino === false ? "Dette : jeu autorisé" : "Dette : jeu bloqué",
              ButtonStyle.Secondary, "🚨")),
        row(new StringSelectMenuBuilder().setCustomId("p:eco:casgame").setPlaceholder("Ouvrir / fermer un jeu…")
          .addOptions(Object.entries(GAMES).map(([id2, g]) => ({ label: g.label, value: id2, emoji: g.emoji,
            description: (cas.games?.[id2] === false ? "fermé" : "ouvert") })))),
        backRow("p:eco"),
      ],
    };
  }

  /* -------------------------------- ÉCONOMIE ----------------------------- */
  if (id === "eco") {
    const e = config.economy;
    const comps = [
      row(btn("p:eco:t", e.enabled ? "Couper l'économie" : "Activer l'économie", e.enabled ? ButtonStyle.Danger : ButtonStyle.Success),
        btn("p:eco:montants", "Montants", ButtonStyle.Primary, "🎚️"),
        btn("p:eco:page:casino", "Casino et arrière-salle", ButtonStyle.Danger, "🎰")),
      row(btn("p:eco:drop", "Lâcher un colis", ButtonStyle.Primary, "📦"),
        btn("p:eco:space", "Remplir l'espace coins", ButtonStyle.Success, "🏛️"),
        btn("p:setup:publish", "Mettre à jour les panneaux", ButtonStyle.Primary, "🔄")),
      row(new StringSelectMenuBuilder().setCustomId("p:eco:addtype").setPlaceholder("Ajouter un article : quel type ?")
        .addOptions(Object.entries(ITEM_TYPES).map(([k, v]) => ({ label: v.label, value: k, emoji: v.emoji, description: v.desc.slice(0, 100) })))),
      row(new ChannelSelectMenuBuilder().setCustomId("p:eco:dropch").setChannelTypes(ChannelType.GuildText).setPlaceholder("Salon des colis automatiques")),
    ];
    if (e.shop.length && comps.length < 4) comps.push(row(new StringSelectMenuBuilder().setCustomId("p:eco:del")
      .setPlaceholder("Retirer un article…")
      .addOptions(e.shop.slice(0, 25).map((x) => ({ label: x.name.slice(0, 100), value: x.id,
        emoji: ITEM_TYPES[x.type ?? "role"]?.emoji, description: `${num(x.price)} coins` })))));
    if (comps.length < 5) comps.push(backRow());
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

  /* ------------------------------ AFFECTATIONS --------------------------- */
  if (id === "dest") {
    // Rapport de vérification : p:dest:page:__check
    if (page === "__check") {
      const results = await verifyDestinations(guild, config);
      const { ok, bad } = summarizeIssues(results);
      const icon = { unassigned: "🔴", ambiguous: "❓", unpublished: "📭", misplaced: "📍", unreachable: "🚫" };
      const comps = [];

      if (bad.length) {
        comps.push(row(new StringSelectMenuBuilder().setCustomId("p:dest:fix")
          .setPlaceholder("Régler un problème…")
          .addOptions(bad.slice(0, 25).map((r) => ({ label: r.dest.label.slice(0, 100), value: r.dest.id,
            emoji: r.dest.emoji, description: ISSUE_LABEL[r.status].slice(0, 100) })))));
      }
      comps.push(row(
        btn("p:dest:page:__check", "Revérifier", ButtonStyle.Primary, "🔄"),
        btn("p:dest:stray", "Chercher des copies égarées", ButtonStyle.Secondary, "🧹"),
        btn("p:dest", "Retour", ButtonStyle.Secondary, "◀️")));

      return {
        embeds: [embed({ guild, author: { name: "🔎  Vérification des emplacements" },
          color: bad.length ? COLORS.warning : COLORS.success,
          description: bad.length
            ? `**${ok}/${results.length}** en place. ${bad.length} à régler :`
            : `### ${ICONS.ok} Les ${results.length} éléments sont au bon endroit.`,
          fields: bad.length ? [{ name: "\u200b", value: bad.slice(0, 12).map((r) =>
            `${icon[r.status] ?? "⚠️"} ${r.dest.emoji} **${r.dest.label}** — ${ISSUE_LABEL[r.status]}`
            + (r.status === "ambiguous" ? `\n └ ${r.candidates.map((c) => `${c}`).join(" ")}` : "")
            + (r.status === "misplaced" ? `\n └ trouvé dans ${r.foundIn} au lieu de ${r.channel}` : "")
            + (r.status === "unpublished" ? `\n └ ${r.channel} attend son panneau` : "")
            + (r.status === "unreachable" ? `\n └ je ne peux pas écrire dans ${r.channel}` : "")
          ).join("\n").slice(0, 1000) }] : [],
          footer: bad.length ? "Choisis un problème dans le menu pour le régler" : undefined })],
        components: comps,
      };
    }

    // Fiche de correction d'un problème : p:dest:page:fix_<destId>
    if (page?.startsWith("fix_")) {
      const dest = DESTINATIONS.find((d) => d.id === page.slice(4));
      if (dest) {
        const results = await verifyDestinations(guild, config);
        const r = results.find((x) => x.dest.id === dest.id) ?? { status: "ok", candidates: [] };
        const comps = [];

        if (r.candidates?.length > 1) {
          comps.push(row(new StringSelectMenuBuilder().setCustomId(`p:dest:choose:${dest.id}`)
            .setPlaceholder("Lequel est le bon ?")
            .addOptions(r.candidates.slice(0, 25).map((c) => ({ label: `#${c.name}`.slice(0, 100), value: c.id,
              description: (c.parent?.name ? `dans ${c.parent.name}` : "sans catégorie").slice(0, 100) })))));
        }
        comps.push(row(new ChannelSelectMenuBuilder().setCustomId(`p:dest:set:${dest.id}`)
          .setChannelTypes(...(dest.voice ? [ChannelType.GuildVoice, ChannelType.GuildStageVoice]
            : [ChannelType.GuildText, ChannelType.GuildAnnouncement]))
          .setPlaceholder("…ou choisis n'importe quel autre salon")));
        const acts = [];
        if (dest.kind === "panel" && r.channel) acts.push(btn(`p:dest:pub:${dest.id}`, "Publier ici", ButtonStyle.Success, "📤"));
        if (r.status === "misplaced") acts.push(btn(`p:dest:movehere:${dest.id}`, "Garder là où il est", ButtonStyle.Secondary, "📍"));
        acts.push(btn("p:dest:page:__check", "Retour", ButtonStyle.Secondary, "◀️"));
        comps.push(row(...acts));

        const explain = {
          unassigned: "Aucun salon n'est associé. Choisis-en un ci-dessous.",
          ambiguous: `**${r.candidates.length} salons** portent ce nom sur ton serveur. Je ne peux pas deviner lequel tu veux — dis-le moi.`,
          unpublished: `Le salon est bien ${r.channel}, mais le panneau n'y est pas. Publie-le.`,
          misplaced: `Le panneau se trouve dans ${r.foundIn}, alors que l'affectation dit ${r.channel}.`,
          unreachable: `Je n'ai pas le droit d'écrire dans ${r.channel}. Donne-moi l'accès ou change de salon.`,
          ok: "Tout est en ordre pour cet élément.",
        };

        return {
          embeds: [embed({ guild, author: { name: `${dest.emoji}  ${dest.label}` },
            color: r.status === "ok" ? COLORS.success : COLORS.warning,
            description: `**${ISSUE_LABEL[r.status]}**\n\n${explain[r.status]}`,
            fields: r.candidates?.length ? [{ name: "Salons portant ce nom",
              value: r.candidates.map((c) => `${c}${c.parent ? ` — _${c.parent.name}_` : ""}`).join("\n").slice(0, 1000) }] : [] })],
          components: comps,
        };
      }
    }

    // Fiche d'une affectation : p:dest:page:<destId>
    const one = page ? DESTINATIONS.find((d) => d.id === page) : null;
    if (one) {
      const { channel, forced } = resolveDestination(guild, config, one);
      const comps = [
        row(new ChannelSelectMenuBuilder().setCustomId(`p:dest:set:${one.id}`)
          .setChannelTypes(...(one.voice ? [ChannelType.GuildVoice, ChannelType.GuildStageVoice]
            : [ChannelType.GuildText, ChannelType.GuildAnnouncement]))
          .setPlaceholder("Choisis le salon…")),
      ];
      const actions = [];
      if (one.kind === "panel" && channel) actions.push(btn(`p:dest:pub:${one.id}`, "Publier maintenant", ButtonStyle.Success, "📤"));
      if (forced) actions.push(btn(`p:dest:auto:${one.id}`, "Revenir en automatique", ButtonStyle.Secondary, "🪄"));
      actions.push(btn("p:dest", "Retour", ButtonStyle.Secondary, "◀️"));
      comps.push(row(...actions));

      return {
        embeds: [embed({ guild, author: { name: `${one.emoji}  ${one.label}` }, color: channel ? COLORS.success : COLORS.warning,
          description: [
            `**Type :** ${KIND_LABEL[one.kind]}`,
            `**Salon actuel :** ${channel ? `${channel}` : "_aucun_"}`,
            `**Origine :** ${forced ? "⚙️ imposé par toi" : one.auto?.length ? `🪄 détecté par le nom (${one.auto.join(", ")})` : "🪄 détection automatique"}`,
            "",
            one.kind === "panel" ? "Le message est **modifié** s'il existe déjà : aucune relance ne crée de doublon."
              : one.kind === "counter" ? "Ce salon vocal sera renommé automatiquement toutes les 10 minutes."
              : "Le bot écrira ici quand l'événement se produira.",
          ].join("\n") })],
        components: comps,
      };
    }

    const groups = destinationReport(guild, config);
    const missing = Object.values(groups).flat().filter((x) => !x.channel).length;
    return {
      embeds: [embed({ guild, author: { name: "📍  Affectations" }, color: missing ? COLORS.warning : COLORS.success,
        description: missing ? `**${missing}** élément(s) sans salon.` : "Tout est affecté.",
        fields: Object.entries(groups).map(([kind, items]) => ({
          name: `${KIND_LABEL[kind]} (${items.filter((x) => x.channel).length}/${items.length})`,
          value: items.map((x) => x.line).join("\n").slice(0, 1000),
        })),
        footer: "⚙️ = salon imposé · sinon détecté par le nom" })],
      components: [
        row(new StringSelectMenuBuilder().setCustomId("p:dest:pick").setPlaceholder("Changer une affectation…")
          .addOptions(DESTINATIONS.slice(0, 25).map((d) => {
            const { channel } = resolveDestination(guild, config, d);
            return { label: d.label.slice(0, 100), value: d.id, emoji: d.emoji,
              description: (channel ? `→ ${channel.name}` : "aucun salon").slice(0, 100) };
          }))),
        row(btn("p:dest:page:__check", "Vérifier les emplacements", ButtonStyle.Primary, "🔎"),
            btn("p:dest:puball", "Mettre à jour les panneaux", ButtonStyle.Success, "🔄"),
            btn("p:dest:autoall", "Tout remettre en automatique", ButtonStyle.Secondary, "🪄"),
            btn("p:dest", "Actualiser", ButtonStyle.Secondary, "🔄")),
        backRow(),
      ],
    };
  }

  /* ------------------------------ PUBLICATIONS --------------------------- */
  if (id === "publish") {
    return {
      embeds: [embed({ guild, author: { name: "📢  Publications" }, color: COLORS.primary,
        description: ["**Espace membre** — niveau, solde, quotidien, travail, classements, boutique",
          "**Tickets** — menu des types d'aide",
          "**Menu de rôles** — rôles à cocher", "", "Chaque publication demande ensuite le salon cible."].join("\n") })],
      components: [
        row(btn("p:setup:publish", "Mettre à jour tous les panneaux", ButtonStyle.Success, "🔄"),
            btn("p:dest", "Choisir où va chaque panneau", ButtonStyle.Primary, "📍")),
        row(btn("p:publish:pick:member", "Espace membre", ButtonStyle.Primary, "🧭"),
            btn("p:publish:pick:ticket", "Tickets", ButtonStyle.Primary, "🎫"),
            btn("p:publish:pick:roles", "Menu de rôles", ButtonStyle.Primary, "🎭")),
        row(btn("p:publish:pick:say", "Annonce", ButtonStyle.Secondary, "📣"),
            btn("p:publish:pick:poll", "Sondage", ButtonStyle.Secondary, "📊")),
        backRow(),
      ],
    };
  }

  return homeView(i, config);
}

/**
 * Attache une image au message. Repli silencieux sur le texte si le dessin
 * est éteint ou si le rendu échoue.
 */
async function avecVisuel(payload, fabriquer) {
  if (!renderReady()) return payload;
  try {
    const buffer = await fabriquer();
    if (!buffer) return payload;
    const nom = `0x-${Date.now()}.png`;
    const e = payload.embeds?.[0];
    if (e?.setImage) {
      e.setImage(`attachment://${nom}`);
      e.data.description = undefined;
      e.data.fields = [];
    }
    return { ...payload, files: [{ attachment: buffer, name: nom }], attachments: [] };
  } catch (err) {
    console.error("[visuel]", err.message);
    return payload;
  }
}

/** Récupère jusqu'à trois avatars pour le podium d'un classement. */
async function avatarsPodium(guild, ids) {
  const out = [];
  for (const id of ids.slice(0, 3)) {
    const m = guild.members.cache.get(id) ?? await guild.members.fetch(id).catch(() => null);
    out.push(m ? await chargerAvatar(m.user.displayAvatarURL({ extension: "png", size: 128 })) : null);
  }
  return out;
}

/** Nom affichable d'un membre, même s'il a quitté. */
async function nomDe(guild, id) {
  const m = guild.members.cache.get(id) ?? await guild.members.fetch(id).catch(() => null);
  return m?.displayName ?? m?.user?.username ?? "Parti du serveur";
}

/** Classement en image, avec repli texte. */
async function classementVisuel(i, titre, unite, brut, valeurDe) {
  const entrees = [];
  for (const x of brut.slice(0, 10)) entrees.push({ nom: await nomDe(i.guild, x.userId), valeur: valeurDe(x) });
  const avatars = await avatarsPodium(i.guild, brut.map((x) => x.userId));
  entrees.forEach((e, n) => { if (n < 3) e.avatar = avatars[n]; });
  const moi = await nomDe(i.guild, i.user.id);
  return (payload) => avecVisuel(payload, () =>
    renderLeaderboard({ titre, unite, entrees, serveur: i.guild.name, moi }));
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
    description: `\`${member.id}\` · **${PERM_LABELS[permLevel(member, config)]}**`
      + (hasAdminImmunity(member, config) ? "\n👑 **Immunisé** — permission Discord « Administrateur »" : "")
      + (muted ? `\n${ICONS.timeout} Muet jusqu'à ${ts(member.communicationDisabledUntil)}` : ""),
    fields: [
      { name: "Avertissements", value: `${warns}`, inline: true },
      { name: "Sanctions totales", value: `${all}`, inline: true },
      { name: "Compte créé", value: ts(member.user.createdAt), inline: true },
      { name: "A rejoint", value: member.joinedAt ? ts(member.joinedAt) : "—", inline: true },
      { name: "Niveau", value: `${lvl.level} · ${num(lvl.xp)} XP`, inline: true },
      { name: "Coins", value: wallet.coins < 0 ? `🚨 − ${num(-wallet.coins)}` : num(wallet.coins), inline: true },
      { name: "Rôles", value: member.roles.cache.filter((r) => r.id !== i.guild.id).sort((a, b) => b.position - a.position).map((r) => r.toString()).slice(0, 10).join(" ") || "_aucun_" },
    ],
  }).thumb(member.user.displayAvatarURL({ size: 256 }));

  // Fiche en image, avec repli sur l'encadré texte si le dessin est éteint
  let fichier = null;
  if (renderReady()) {
    try {
      const avatar = await chargerAvatar(member.user.displayAvatarURL({ extension: "png", size: 256 }));
      const roles = member.roles.cache.filter((r) => r.id !== i.guild.id)
        .sort((a, b) => b.position - a.position);
      const stats = await memberStats(i.guild.id, userId);
      const situation = situate(config, stats).current;
      const inv = await inviterStats(i.guild.id, userId).catch(() => ({ total: 0 }));

      const buffer = renderMemberCard({
        pseudo: member.displayName ?? member.user.username,
        tag: `@${member.user.username}`,
        identifiant: member.id,
        rang: PERM_LABELS[permLevel(member, config)],
        immunise: hasAdminImmunity(member, config),
        muetJusqua: muted ? member.communicationDisabledUntil.toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : null,
        alcatraz: config.jailRoleId ? member.roles.cache.has(config.jailRoleId) : false,
        coins: wallet.coins, niveau: lvl.level, xp: lvl.xp,
        minutesVocal: stats.minutes, messages: stats.messages,
        invitations: inv?.total ?? 0,
        grade: situation ? `${situation.name} — ${situation.hours} h / ${num(situation.messages)}` : null,
        avertissements: warns,
        timeouts: await countSanctions(i.guild.id, userId, "timeout"),
        expulsions: await countSanctions(i.guild.id, userId, "kick"),
        bannissements: await countSanctions(i.guild.id, userId, "ban"),
        compteCree: member.user.createdAt.toLocaleDateString("fr-FR"),
        arriveLe: member.joinedAt ? member.joinedAt.toLocaleDateString("fr-FR") : "—",
        roles: roles.size,
        rolesNoms: roles.map((r) => roleLabel(r).label),
        avatar, serveur: i.guild.name,
      });
      if (buffer) {
        const nom = `fiche-${member.id}.png`;
        card.setImage(`attachment://${nom}`);
        card.data.fields = [];
        card.data.description = undefined;
        fichier = { attachment: buffer, name: nom };
      }
    } catch (e) { console.error("[fiche]", e.message); }
  }

  return respond(i, {
    ...(fichier ? { files: [fichier], attachments: [] } : {}),
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

  /* ---- code de sécurité avant toute écriture dans la configuration ---- */
  if (exigeCode(parts[1], parts[2], parts[3]) && !estOuvert(i.guildId, i.user.id)) {
    return i.showModal(modal(`pm:verrou:ouvrir:${parts[1]}`, "Code de sécurité", [
      { id: "code", label: "Entre le code pour modifier le bot", required: true, max: 60 },
    ])).catch(() => null);
  }

  /* -------- installation, interrupteurs : propriétaire uniquement -------- */
  if (parts[1] === "setup" || parts[1] === "sw") {
    if (isOwner(i.user.id) && !estOuvert(i.guildId, i.user.id)) {
      return i.showModal(modal("pm:verrou:ouvrir:home", "Code de sécurité", [
        { id: "code", label: "Entre le code pour modifier le bot", required: true, max: 60 },
      ])).catch(() => null);
    }
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
      const r = await publishAllDestinations(i.guild);
      return feedback(i, r.done.length
        ? { ok: true, title: `${r.done.length} panneau(x) publié(s)`,
            text: [...r.done.map((x) => `✅ ${x}`), ...r.failed.map((x) => `⚠️ ${x}`)].join("\n").slice(0, 3000) }
        : { ok: false, title: "Rien publié",
            text: "Aucun salon affecté. Ouvre **📍 Affectations** pour dire où va chaque panneau.", color: COLORS.warning });
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

    if (["mpsel", "mpcat", "mpall", "mpprot", "mplevel", "mplvlset", "mprun"].includes(action)) {
      const need = Number(config.purge?.level ?? 7);
      if (level < need) return feedback(i, { ok: false, title: "Niveau insuffisant",
        text: `La purge de masse demande **${PERM_LABELS[need]}**.`, color: COLORS.danger }, "mod", "mass");

      if (action === "mplevel") return respond(i, { embeds: [embed({ guild: i.guild,
        author: { name: "🛡️  Qui peut lancer une purge de masse" }, color: COLORS.warning,
        description: "Une purge mal lancée efface des milliers de messages sans retour possible.\nGarde ce niveau le plus haut possible." })],
        components: [row(new StringSelectMenuBuilder().setCustomId("p:mod:mplvlset").setPlaceholder("Niveau requis…")
          .addOptions([{ label: PERM_LABELS[7], value: "7", emoji: "🔒" },
            ...[6, 5, 4].map((l) => ({ label: PERM_LABELS[l], value: String(l) }))])),
          row(btn("p:mod:page:mass", "Retour", ButtonStyle.Secondary, "◀️"))] });

      if (action === "mplvlset") {
        await updateConfig(i.guildId, { purge: { level: Number(i.values[0]) } });
        return feedback(i, { ok: true, title: "Niveau enregistré",
          text: `Seul un **${PERM_LABELS[i.values[0]]}** peut lancer une purge de masse.` }, "mod", "mass");
      }

      if (action === "mpprot") {
        const list = [...(config.purge?.protectedChannels ?? [])];
        const v = i.values[0];
        const idx = list.indexOf(v);
        idx === -1 ? list.push(v) : list.splice(idx, 1);
        await updateConfig(i.guildId, { purge: { protectedChannels: list } });
        return feedback(i, { ok: true, title: idx === -1 ? "Salon protégé" : "Protection retirée",
          text: `<#${v}> ${idx === -1 ? "ne sera jamais purgé" : "peut de nouveau être purgé"}.` }, "mod", "mass");
      }

      if (action === "mprun") {
        if (!takePurge(i.user.id)) return feedback(i, { ok: false, title: "Aperçu expiré",
          text: "Recommence la sélection.", color: COLORS.warning }, "mod", "mass");
        return i.showModal(modal(`pm:mod:mprun:${arg}`, "Confirmer la purge",
          [{ id: "mot", label: "Tape PURGER en majuscules", required: true, max: 10 }]));
      }

      let plan = null, label = "";
      if (action === "mpsel") { plan = planPurge(i.guild, config, { scope: "channels", channelIds: i.values }); label = `${i.values.length} salon(s) choisi(s)`; }
      else if (action === "mpcat") { plan = planPurge(i.guild, config, { scope: "category", categoryId: i.values[0] }); label = `catégorie ${i.guild.channels.cache.get(i.values[0])?.name ?? "?"}`; }
      else if (action === "mpall") { plan = planPurge(i.guild, config, { scope: "all" }); label = "tout le serveur"; }

      if (plan) {
        if (!plan.targets.length) return feedback(i, { ok: false, title: "Rien à purger",
          text: "Tous les salons visés sont protégés ou hors de ma portée.", color: COLORS.warning }, "mod", "mass");
        stashPurge(i.user.id, { guildId: i.guildId, ids: plan.targets.map((c) => c.id), label });
        return respond(i, { embeds: [previewEmbed(i.guild, plan, label)],
          components: [row(
            btn("p:mod:mprun:100", "Purger 100 par salon", ButtonStyle.Danger, "🧹"),
            btn("p:mod:mprun:0", "Tout purger", ButtonStyle.Danger, "🔥"),
            btn("p:mod:page:mass", "Annuler", ButtonStyle.Secondary, "◀️"))] });
      }
    }

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
    // « coins » est retiré volontairement : donner ou retirer de l'argent
    // n'est pas une sanction et doit fonctionner sur n'importe qui.
    if (["warn", "timeout", "kick", "ban", "jail", "clear"].includes(action)) {
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

    if (action === "bkcreate") return i.showModal(modal("pm:config:bkcreate", "Nouvelle sauvegarde",
      [{ id: "name", label: "Nom de la sauvegarde", required: true, value: `Avant modification ${new Date().toLocaleDateString("fr-FR")}`, max: 60 }]));

    if (action === "bkexport") {
      await i.deferReply(EPH);
      const json = JSON.stringify(config, null, 2);
      return i.editReply({ content: "Voici toute ta configuration. Garde ce fichier hors de Discord.",
        files: [{ attachment: Buffer.from(json, "utf8"), name: `0x-config-${i.guild.name.replace(/[^a-z0-9]/gi, "-")}.json` }] });
    }

    if (action === "bkpick") {
      const bk = await getBackup(i.guildId, i.values[0]);
      if (!bk) return feedback(i, { ok: false, title: "Introuvable", text: "Cette sauvegarde n'existe plus.", color: COLORS.danger }, "config", "backup");
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: `💾  ${bk.name}` }, color: COLORS.primary,
        description: `Créée ${ts(bk.created_at)}.\n\n**Restaurer** écrase intégralement la configuration actuelle.` })],
        components: [row(
          btn(`p:config:bkrestore:${bk.id}`, "Restaurer", ButtonStyle.Danger, "♻️"),
          btn(`p:config:bkdelete:${bk.id}`, "Supprimer", ButtonStyle.Secondary, "🗑️"),
          btn("p:config:page:backup", "Annuler", ButtonStyle.Secondary, "◀️"))] });
    }

    if (action === "bkrestore") {
      const bk = await getBackup(i.guildId, arg);
      if (!bk) return feedback(i, { ok: false, title: "Introuvable", text: "Cette sauvegarde n'existe plus.", color: COLORS.danger }, "config", "backup");
      await saveBackup(i.guildId, `Avant restauration de « ${bk.name} »`, config);
      await replaceConfig(i.guildId, bk.data);
      return feedback(i, { ok: true, title: "Configuration restaurée",
        text: `Les réglages de **${bk.name}** sont de nouveau actifs.\nL'état précédent a été sauvegardé au cas où.` }, "config", "backup");
    }

    if (action === "bkdelete") {
      await deleteBackup(i.guildId, arg);
      return feedback(i, { ok: true, title: "Sauvegarde supprimée", text: "Elle a été retirée de la liste." }, "config", "backup");
    }

    if (action === "reset") {
      await saveBackup(i.guildId, "Avant réinitialisation", config);
      await updateConfig(i.guildId, structuredClone(DEFAULT_CONFIG));
      return feedback(i, { ok: true, title: "Configuration réinitialisée",
        text: "Tous les réglages sont revenus à leur valeur d'origine.\nUne sauvegarde a été créée automatiquement avant l'effacement." }, "config");
    }
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
    if (action === "floor") return respond(i, { embeds: [embed({ guild: i.guild,
      author: { name: "🛡️  Qui échappe à l'automod" }, color: COLORS.primary,
      description: "Ce seuil s'applique **en plus** de l'immunité « Administrateur ».\nLes administrateurs Discord sont déjà épargnés tant qu'elle est active.",
      footer: "Toi, propriétaire de 0x, es toujours épargné" })],
      components: [row(new StringSelectMenuBuilder().setCustomId("p:automod:floorlvl")
        .setPlaceholder("Épargné à partir du niveau…")
        .addOptions([{ label: "Personne — tout le monde est filtré", value: "0", emoji: "🔍" },
          ...[1, 2, 3, 4, 5, 6].map((l) => ({ label: PERM_LABELS[l], value: String(l) }))])),
        row(btn("p:automod", "Retour", ButtonStyle.Secondary, "◀️"))] });
    if (action === "floorlvl") {
      const lvl = Number(i.values[0]);
      await updateConfig(i.guildId, { automod: { exemptFromLevel: lvl } });
      return feedback(i, { ok: true, title: "Exemption enregistrée",
        text: lvl === 0 ? "Plus personne n'échappe à l'automod, hormis toi."
          : `À partir de **${PERM_LABELS[lvl]}**, l'automod n'intervient plus.` }, "automod");
    }
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
    if (action === "adminimm") {
      const next = config.adminImmunity === false;
      await updateConfig(i.guildId, { adminImmunity: next });
      return feedback(i, { ok: true, title: next ? "Immunité activée" : "Immunité coupée",
        text: next
          ? "Toute personne ayant la permission Discord « Administrateur » est désormais **intouchable** : sanctions, automod, anti-nuke, anti-raid et piège vocal ne l'atteignent plus."
          : "Les administrateurs Discord redeviennent sanctionnables et filtrés comme les autres membres.",
        color: next ? COLORS.warning : COLORS.success }, "perms");
    }

    if (action === "owner") {
      const cur = Number(config.ownerSanctionLevel ?? 5);
      return respond(i, { embeds: [embed({ guild: i.guild, author: { name: "🛡️  Ta protection personnelle" },
        color: cur === 0 ? COLORS.success : COLORS.warning,
        description: [
          cur === 0 ? "Personne ne peut te sanctionner." : `Il faut être **${PERM_LABELS[cur]}** pour te sanctionner.`,
          "",
          "Attention : le bot se met en veille totale si tu quittes le serveur ou si tu en es expulsé.",
          "Autoriser un niveau bas revient donc à laisser ces personnes couper 0x.",
        ].join("\n"),
        footer: "L'automod, l'anti-nuke et le piège vocal continuent de t'épargner" })],
        components: [row(new StringSelectMenuBuilder().setCustomId("p:perms:ownerlvl")
          .setPlaceholder("Niveau minimum pour me sanctionner…")
          .addOptions([{ label: "Personne — intouchable", value: "0", emoji: "🔒" },
            ...[1, 2, 3, 4, 5, 6].map((l) => ({ label: PERM_LABELS[l], value: String(l) }))])),
          row(btn("p:perms", "Retour", ButtonStyle.Secondary, "◀️"))] });
    }

    if (action === "ownerlvl") {
      const lvl = Number(i.values[0]);
      await updateConfig(i.guildId, { ownerSanctionLevel: lvl });
      return feedback(i, { ok: true, title: "Protection enregistrée",
        text: lvl === 0 ? "Plus personne ne peut te sanctionner."
          : `Un **${PERM_LABELS[lvl]}** peut désormais te sanctionner.`,
        color: lvl <= 2 && lvl > 0 ? COLORS.warning : COLORS.success }, "perms");
    }

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
      await ch.send(ticketPanel(i.guild, config));
      return feedback(i, { ok: true, title: "Panneau publié", text: `Le menu est en ligne dans ${ch}.` }, "tickets");
    }
    if (action === "refresh") { await refreshTicketCounter(i.guild); return feedback(i, { ok: true, title: "Compteur actualisé", text: "Le salon compteur-tickets est à jour." }, "tickets"); }
    if (action === "style") {
      const id = i.values[0];
      const base = TICKET_TYPES.find((t) => t.id === id);
      const k = { ...base, ...(config.ticketStyle?.[id] ?? {}) };
      return i.showModal(modal(`pm:tickets:style:${id}`, `Catégorie — ${base.label}`.slice(0, 45), [
        { id: "label", label: "Nom affiché", required: true, value: k.label, max: 90 },
        { id: "emoji", label: "Emoji — unicode ou :nomdelemoji:", value: String(k.emoji ?? ""), max: 60 },
        { id: "desc", label: "Petite description sous le nom", value: k.desc ?? "", max: 95 },
      ]));
    }
    if (action === "remind") { await updateConfig(i.guildId, { ticketReminder: { enabled: !config.ticketReminder?.enabled } });
      return respond(i, await buildSection("tickets", i, await getConfig(i.guildId))); }
    if (action === "delay") return i.showModal(modal("pm:tickets:delay", "Délai avant rappel",
      [{ id: "hours", label: "Heures sans réponse du staff", required: true, value: `${config.ticketReminder?.hours ?? 6}`, max: 3 }]));
    if (action === "check") {
      await i.deferUpdate();
      const r = await checkStaleTickets(i.guild);
      return feedback(i, { ok: true, title: r.reminded ? `${r.reminded} ticket(s) relancé(s)` : "Aucun ticket en retard",
        text: r.reminded ? r.details.map((d) => `${d.channel} — ${d.waited} h d'attente`).join("\n") : "Le staff suit le rythme.",
        color: r.reminded ? COLORS.warning : COLORS.success }, "tickets");
    }
  }

  /* ------------------------------- COMPTEURS ----------------------------- */
  if (section === "counters") {
    if (action === "set") { await updateConfig(i.guildId, { counters: { ...config.counters, [arg]: i.values[0] } });
      return feedback(i, { ok: true, title: "Compteur rattaché", text: `**${arg}** → <#${i.values[0]}>` }, "counters"); }
    if (action === "clear") { await updateConfig(i.guildId, { counters: { members: null, online: null, voice: null } });
      return feedback(i, { ok: true, title: "Compteurs déliés", text: "Retour à la détection par le motif « Nom : nombre »." }, "counters"); }
    if (action === "force") { await i.deferUpdate(); await updateCounters(i.guild, true); return respond(i, await buildSection("counters", i, config)); }
  }

  /* --------------------------------- GRADES ------------------------------ */
  if (section === "ranks") {
    const r = config.ranks ?? {};
    if (action === "t") { await updateConfig(i.guildId, { ranks: { enabled: !r.enabled } });
      return respond(i, await buildSection("ranks", i, await getConfig(i.guildId))); }
    if (action === "auto") { await updateConfig(i.guildId, { ranks: { autoPromote: !r.autoPromote } });
      return respond(i, await buildSection("ranks", i, await getConfig(i.guildId))); }
    if (action === "both") { await updateConfig(i.guildId, { ranks: { requireBoth: r.requireBoth === false } });
      return respond(i, await buildSection("ranks", i, await getConfig(i.guildId))); }
    if (action === "prev") { await updateConfig(i.guildId, { ranks: { removePrevious: r.removePrevious === false } });
      return respond(i, await buildSection("ranks", i, await getConfig(i.guildId))); }

    if (action === "detect") {
      const d = detectLadder(i.guild);
      if (!d.ladder.length) return feedback(i, { ok: false, title: "Aucun grade reconnu",
        text: `Je cherche des rôles nommés ${PRESET_LADDER.slice(0, 4).map((p) => `**${p.match}**`).join(", ")}… et les 14 autres.`,
        color: COLORS.warning }, "ranks");
      await updateConfig(i.guildId, { ranks: { enabled: true, ladder: d.ladder } });
      return feedback(i, { ok: d.manquants.length === 0,
        title: `${d.trouves} grade(s) sur ${PRESET_LADDER.length}`,
        text: d.ladder.map((g) => `<@&${g.roleId}> — **${g.hours} h** · **${num(g.messages)}** msg`).join("\n").slice(0, 1500)
          + (d.manquants.length ? `\n\n⚠️ Introuvables : ${d.manquants.join(", ")}` : ""),
        color: d.manquants.length ? COLORS.warning : COLORS.gold }, "ranks");
    }

    if (action === "add") {
      const role = i.guild.roles.cache.get(i.values[0]);
      if (role.position >= i.guild.members.me.roles.highest.position)
        return feedback(i, { ok: false, title: "Rôle trop haut", text: `${role} est au-dessus du mien, je ne pourrai pas l'attribuer.`, color: COLORS.danger }, "ranks");
      return i.showModal(modal(`pm:ranks:add:${role.id}`, `Grade — ${role.name}`.slice(0, 45), [
        { id: "hours", label: "Heures de vocal requises", required: true, placeholder: "10", max: 5 },
        { id: "messages", label: "Messages requis", required: true, placeholder: "700", max: 8 },
        { id: "name", label: "Nom affiché (vide = nom du rôle)", max: 60 },
      ]));
    }

    if (action === "del") {
      const kept = (r.ladder ?? []).filter((x) => x.roleId !== i.values[0]);
      await updateConfig(i.guildId, { ranks: { ladder: kept } });
      return feedback(i, { ok: true, title: "Grade retiré", text: `<@&${i.values[0]}> ne fait plus partie de l'échelle.` }, "ranks");
    }

    if (action === "recalc") {
      await i.deferUpdate();
      let n = 0, vus = 0;
      for (const m of i.guild.members.cache.values()) {
        if (m.user.bot) continue;
        vus++;
        const up = await applyRank(m, config).catch(() => ({ promoted: false }));
        if (up.promoted) n++;
      }
      return feedback(i, { ok: true, title: `${n} promotion(s)`,
        text: `${num(vus)} membre(s) passés en revue. Les grades sont à jour.` }, "ranks");
    }
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

  /* -------------------------------- ESCALADE ----------------------------- */
  if (section === "escalation") {
    const rules = [...(config.escalation?.rules ?? [])];
    if (action === "t") { await updateConfig(i.guildId, { escalation: { enabled: !config.escalation.enabled } });
      return respond(i, await buildSection("escalation", i, await getConfig(i.guildId))); }
    if (action === "add") return i.showModal(modal("pm:escalation:add", "Nouveau palier", [
      { id: "warns", label: "À combien d'avertissements ?", required: true, placeholder: "3", max: 3 },
      { id: "act", label: "timeout / kick / ban / alcatraz", required: true, placeholder: "timeout", max: 10 },
      { id: "duration", label: "Durée (10m, 1h, 7d) — timeout et alcatraz", placeholder: "1h", max: 10 },
    ]));
    if (action === "expire") return i.showModal(modal("pm:escalation:expire", "Péremption des avertissements",
      [{ id: "days", label: "Jours avant oubli (0 = jamais)", required: true, value: `${config.escalation.expireDays ?? 0}`, max: 4 }]));
    if (action === "default") {
      await updateConfig(i.guildId, { escalation: { enabled: true, expireDays: 60, rules: [
        { warns: 3, action: "timeout", duration: "1h" },
        { warns: 5, action: "timeout", duration: "1d" },
        { warns: 7, action: "kick" },
        { warns: 10, action: "ban" }] } });
      return feedback(i, { ok: true, title: "Paliers recommandés posés",
        text: "3 → 1 h de silence · 5 → 1 jour · 7 → expulsion · 10 → bannissement. Oubli après 60 jours." }, "escalation");
    }
    if (action === "del") {
      const kept = rules.filter((r) => String(r.warns) !== i.values[0]);
      await updateConfig(i.guildId, { escalation: { rules: kept } });
      return feedback(i, { ok: true, title: "Palier retiré", text: `Plus rien ne se déclenche à ${i.values[0]} avertissement(s).` }, "escalation");
    }
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
    if (action === "hub") {
      await updateConfig(i.guildId, { tempVoice: { hubId: i.values[0], enabled: true } });
      return feedback(i, { ok: true, title: "Salon d'accueil défini",
        text: `<#${i.values[0]}> crée désormais un vocal personnel à chaque connexion.` }, "voice", "temp");
    }
    if (action === "tempt") {
      await updateConfig(i.guildId, { tempVoice: { enabled: !config.tempVoice?.enabled } });
      return respond(i, await buildSection("voice", i, await getConfig(i.guildId), "temp"));
    }
    if (action === "tempcfg") return i.showModal(modal("pm:voice:tempcfg", "Vocaux temporaires", [
      { id: "name", label: "Nom du salon ({user} = pseudo)", required: true, value: config.tempVoice?.nameTemplate ?? "🔊 {user}", max: 90 },
      { id: "limit", label: "Places par défaut (0 = illimité)", required: true, value: `${config.tempVoice?.defaultLimit ?? 0}`, max: 2 },
    ]));
    if (action === "purge") {
      await i.deferUpdate();
      const n = await purgeOrphans(i.guild);
      return feedback(i, { ok: true, title: n ? `${n} salon(s) nettoyé(s)` : "Rien à nettoyer",
        text: n ? "Les vocaux temporaires vides ont été supprimés." : "Aucun salon temporaire vide." }, "voice", "temp");
    }
    if (action === "tick") {
      await i.deferUpdate();
      const r = await tickVoiceRewards(i.guild);
      return feedback(i, { ok: true, title: "Distribution effectuée",
        text: r.rewarded ? `${r.rewarded} personne(s) récompensée(s)${r.levelUps.length ? ` · ${r.levelUps.length} montée(s) de niveau` : ""}.`
          : "Personne d'éligible : salons vides, membres seuls ou casque coupé." }, "voice");
    }
  }

  /* -------------------------------- APPARENCE ---------------------------- */
  if (section === "verrou") {
    if (action === "basculer") {
      if (estOuvert(i.guildId, i.user.id)) {
        fermer(i.guildId, i.user.id);
        return feedback(i, { ok: true, title: "🔒  Verrouillé",
          text: "Le code sera redemandé à la prochaine modification." }, "home");
      }
      return i.showModal(modal("pm:verrou:ouvrir:home", "Code de sécurité", [
        { id: "code", label: "Entre le code pour modifier le bot", required: true, max: 60 },
      ]));
    }
  }

  if (section === "look") {
    if (action === "couleur") {
      if (i.values[0] === "custom") return i.showModal(modal("pm:look:brand", "Couleur personnalisée",
        [{ id: "hex", label: "Code couleur, par exemple #FF5733", required: true, value: hexOf(config.brandColor ?? COLORS.primary), max: 9 }]));
      const c = Number(i.values[0]);
      await updateConfig(i.guildId, { brandColor: c });
      return feedback(i, { ok: true, title: "Couleur enregistrée",
        text: `Le bot passe en **${nomDeCouleur(c)}** \`${hexOf(c)}\`.`, color: c }, "look");
    }
    if (action === "raz") {
      await updateConfig(i.guildId, { brandColor: null });
      return feedback(i, { ok: true, title: "Couleur d'origine", text: "Retour au bleu Discord." }, "look");
    }

    if (action === "etexte") {
      const d = getDraft(i);
      return i.showModal(modal("pm:look:etexte", "Titre et corps", [
        { id: "titre", label: "Titre", value: d.title, max: 250 },
        { id: "corps", label: "Corps du message", long: true, value: d.description, max: 3800 },
      ]));
    }
    if (action === "epied") {
      const d = getDraft(i);
      return i.showModal(modal("pm:look:epied", "Auteur et pied de page", [
        { id: "auteur", label: "Ligne d'auteur (en haut)", value: d.author, max: 250 },
        { id: "pied", label: "Pied de page (signature)", value: d.footer, max: 1000 },
      ]));
    }
    if (action === "eimg") {
      const d = getDraft(i);
      return i.showModal(modal("pm:look:eimg", "Images", [
        { id: "image", label: "Grande image — adresse https://", value: d.image, max: 400 },
        { id: "thumb", label: "Miniature en haut à droite", value: d.thumb, max: 400 },
      ]));
    }
    if (action === "ets") {
      setDraft(i, { timestamp: !getDraft(i).timestamp });
      return respond(i, await buildSection("look", i, config, "embed"));
    }
    if (action === "ecouleur") {
      if (i.values[0] === "custom") return i.showModal(modal("pm:look:ecouleur", "Couleur de l'embed",
        [{ id: "hex", label: "Code couleur, par exemple #FF5733", required: true, max: 9 }]));
      setDraft(i, { color: Number(i.values[0]) });
      return respond(i, await buildSection("look", i, config, "embed"));
    }
    if (action === "eraz") {
      resetDraft(i);
      return respond(i, await buildSection("look", i, config, "embed"));
    }
    if (action === "eenvoi") {
      const ch = i.guild.channels.cache.get(i.values[0]);
      const r = await sendDraft(i.guild, ch, getDraft(i));
      return feedback(i, r.ok
        ? { ok: true, title: "Embed envoyé", text: `Il est en ligne dans ${r.channel}.` }
        : { ok: false, title: "Envoi impossible", text: r.reason, color: COLORS.danger }, "look", "embed");
    }
  }

  /* ----------------------------- MENUS DE RÔLES -------------------------- */
  if (section === "rolemenus") {
    const groups = [...(config.roleMenus ?? [])];

    if (action === "detect") {
      const trouves = detectGroups(i.guild);
      if (!trouves.length) return feedback(i, { ok: false, title: "Rien reconnu",
        text: "Aucun rôle ne correspond aux catégories connues. Crée les catégories à la main.", color: COLORS.warning }, "rolemenus");
      await updateConfig(i.guildId, { roleMenus: trouves });
      return feedback(i, { ok: true, title: `${trouves.length} catégorie(s) reconnue(s)`,
        text: trouves.map((g) => `${g.emoji} **${g.title}** — ${g.roleIds.length} rôle(s)`).join("\n") }, "rolemenus");
    }

    if (action === "pick") return respond(i, await buildSection("rolemenus", i, config, `g_${i.values[0]}`));

    if (action === "add") {
      const g = groups.find((x) => x.id === arg);
      if (!g) return respond(i, await buildSection("rolemenus", i, config));
      const monRang = i.guild.members.me.roles.highest.position;
      const refuses = i.values.filter((id) => (i.guild.roles.cache.get(id)?.position ?? 0) >= monRang);
      g.roleIds = [...new Set([...g.roleIds, ...i.values.filter((id) => !refuses.includes(id))])].slice(0, 25);
      await updateConfig(i.guildId, { roleMenus: groups });
      return feedback(i, { ok: refuses.length === 0, title: "Rôles ajoutés",
        text: `${g.emoji} **${g.title}** propose maintenant ${g.roleIds.length} rôle(s).`
          + (refuses.length ? `\n\n⚠️ Ignorés car au-dessus de mon rôle : ${refuses.map((r) => `<@&${r}>`).join(" ")}` : ""),
        color: refuses.length ? COLORS.warning : COLORS.success }, "rolemenus", `g_${g.id}`);
    }

    if (action === "rm") {
      const g = groups.find((x) => x.id === arg);
      if (!g) return respond(i, await buildSection("rolemenus", i, config));
      g.roleIds = g.roleIds.filter((r) => r !== i.values[0]);
      await updateConfig(i.guildId, { roleMenus: groups });
      return feedback(i, { ok: true, title: "Rôle retiré", text: `<@&${i.values[0]}> n'est plus proposé.` }, "rolemenus", `g_${g.id}`);
    }

    if (action === "max") {
      const g = groups.find((x) => x.id === arg);
      if (!g) return respond(i, await buildSection("rolemenus", i, config));
      g.max = g.max === 1 ? 0 : 1;
      await updateConfig(i.guildId, { roleMenus: groups });
      return respond(i, await buildSection("rolemenus", i, await getConfig(i.guildId), `g_${g.id}`));
    }

    if (action === "drop") {
      await updateConfig(i.guildId, { roleMenus: groups.filter((x) => x.id !== arg) });
      return feedback(i, { ok: true, title: "Catégorie supprimée", text: "Elle n'apparaîtra plus dans le panneau publié." }, "rolemenus");
    }

    if (action === "clear") {
      await updateConfig(i.guildId, { roleMenus: [] });
      return feedback(i, { ok: true, title: "Tout effacé", text: "Relance la détection quand tu veux." }, "rolemenus");
    }

    if (action === "pub") {
      await i.deferUpdate();
      const dest = DESTINATIONS.find((d) => d.id === "roleMenus");
      const { channel } = resolveDestination(i.guild, config, dest);
      if (!channel) return feedback(i, { ok: false, title: "Aucun salon",
        text: "Crée un salon **rôles**, ou choisis-en un dans 📍 Affectations.", color: COLORS.warning }, "rolemenus");
      const r = await publishRoleMenus(i.guild, channel);
      return feedback(i, r.ok
        ? { ok: true, title: "Panneau publié", text: `${r.posees} catégorie(s) dans ${channel}.` }
        : { ok: false, title: "Publication impossible", text: r.reason, color: COLORS.danger }, "rolemenus");
    }
  }

  /* ------------------------------- TRÉSORERIE ---------------------------- */
  if (section === "money") {
    if (action === "user") return i.showModal(modal(`pm:money:one:${i.values[0]}`, "Créditer ou retirer", [
      { id: "montant", label: "Montant (négatif pour retirer)", required: true, max: 12 },
      { id: "raison", label: "Raison", max: 200 },
    ]));
    if (action === "role") return i.showModal(modal(`pm:money:role:${i.values[0]}`, "Créditer un rôle entier", [
      { id: "montant", label: "Montant par personne", required: true, max: 12 },
    ]));
    if (action === "all") return i.showModal(modal("pm:money:all", "Créditer tout le serveur", [
      { id: "montant", label: "Montant par personne", required: true, max: 12 },
    ]));
    if (action === "reset") return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.danger,
      author: { name: "🧹  Remettre un solde à zéro" }, description: "Choisis la personne dont le solde sera remis à 0." })],
      components: [row(new UserSelectMenuBuilder().setCustomId("p:money:resetpick").setPlaceholder("Choisis un membre…")),
        backRow("p:money")] });
    if (action === "resetpick") {
      const solde = await setCoins(i.guildId, i.values[0], 0);
      await log(i.guild, "coins", embed({ guild: i.guild, color: COLORS.warning,
        author: { name: `${ICONS.coin}  Solde remis à zéro` },
        fields: [{ name: "Membre", value: `<@${i.values[0]}>`, inline: true }, { name: "Par", value: i.user.tag, inline: true }] }));
      return feedback(i, { ok: true, title: "Solde remis à zéro", text: `<@${i.values[0]}> repart de **${num(solde)}**.` }, "money");
    }
  }

  /* --------------------------------- PRÉFIXE ----------------------------- */
  if (section === "prefix") {
    const pc = config.prefix ?? {};
    if (action === "t") { await updateConfig(i.guildId, { prefix: { enabled: !pc.enabled } });
      return respond(i, await buildSection("prefix", i, await getConfig(i.guildId))); }
    if (action === "del") { await updateConfig(i.guildId, { prefix: { deleteInvocation: !pc.deleteInvocation } });
      return respond(i, await buildSection("prefix", i, await getConfig(i.guildId))); }
    if (action === "char") {
      await updateConfig(i.guildId, { prefix: { char: i.values[0], enabled: true } });
      return feedback(i, { ok: true, title: "Préfixe enregistré",
        text: `Les commandes s'écrivent maintenant \`${i.values[0]}ban\`, \`${i.values[0]}kick\`, \`${i.values[0]}mute\`…` }, "prefix");
    }
    if (action === "pick") {
      const n = i.values[0];
      const cmd = PREFIX_COMMANDS[n];
      const coupee = (pc.disabled ?? []).includes(n);
      return respond(i, { embeds: [embed({ guild: i.guild, color: coupee ? COLORS.neutral : COLORS.success,
        author: { name: `⌨️  ${pc.char || "!"}${n}` },
        description: `${cmd.desc}\n\nUsage : \`${pc.char || "!"}${n} ${cmd.usage}\``,
        fields: [
          { name: "État", value: coupee ? "🔴 fermée" : "🟢 ouverte", inline: true },
          { name: "Niveau requis", value: PERM_LABELS[prefixRequiredLevel(n, cmd, config)], inline: true },
          ...(cmd.aliases?.length ? [{ name: "Autres écritures", value: cmd.aliases.map((a) => `\`${pc.char || "!"}${a}\``).join(" "), inline: true }] : []),
        ] })],
        components: [
          row(btn(`p:prefix:toggle:${n}`, coupee ? "Ouvrir" : "Fermer", coupee ? ButtonStyle.Success : ButtonStyle.Danger),
              btn("p:prefix:page:cmds", "Retour", ButtonStyle.Secondary, "◀️")),
          row(new StringSelectMenuBuilder().setCustomId(`p:prefix:lvl:${n}`).setPlaceholder("Changer le niveau requis…")
            .addOptions([0, 1, 2, 3, 4, 5, 6].map((l) => ({ label: PERM_LABELS[l], value: String(l) })))),
        ] });
    }
    if (action === "toggle") {
      const list = [...(pc.disabled ?? [])];
      const idx = list.indexOf(arg);
      idx === -1 ? list.push(arg) : list.splice(idx, 1);
      await updateConfig(i.guildId, { prefix: { disabled: list } });
      return feedback(i, { ok: true, title: idx === -1 ? "Commande fermée" : "Commande ouverte",
        text: `\`${pc.char || "!"}${arg}\` est ${idx === -1 ? "désormais indisponible" : "de nouveau utilisable"}.` }, "prefix", "cmds");
    }
    if (action === "lvl") {
      await updateConfig(i.guildId, { prefix: { levels: { ...(pc.levels ?? {}), [arg]: Number(i.values[0]) } } });
      return feedback(i, { ok: true, title: "Niveau enregistré",
        text: `\`${pc.char || "!"}${arg}\` demande maintenant **${PERM_LABELS[i.values[0]]}**.` }, "prefix", "cmds");
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
    if (action === "cast") { await updateConfig(i.guildId, { casino: { enabled: config.casino?.enabled === false } });
      return respond(i, await buildSection("eco", i, await getConfig(i.guildId), "casino")); }
    if (action === "casgame") {
      const g = i.values[0];
      const games = { ...(config.casino?.games ?? {}) };
      games[g] = games[g] === false;
      await updateConfig(i.guildId, { casino: { games } });
      return respond(i, await buildSection("eco", i, await getConfig(i.guildId), "casino"));
    }
    if (action === "crimet") { await updateConfig(i.guildId, { crime: { enabled: config.crime?.enabled === false } });
      return respond(i, await buildSection("eco", i, await getConfig(i.guildId), "casino")); }
    if (action === "debtt") { await updateConfig(i.guildId, { crime: { debtBlocksCasino: config.crime?.debtBlocksCasino === false } });
      return respond(i, await buildSection("eco", i, await getConfig(i.guildId), "casino")); }
    if (action === "caslim") return i.showModal(modal("pm:eco:caslim", "Limites de mise", [
      { id: "min", label: "Mise minimum", required: true, value: `${config.casino?.minBet ?? 50}`, max: 9 },
      { id: "max", label: "Mise maximum", required: true, value: `${config.casino?.maxBet ?? 250000}`, max: 9 },
    ]));
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

  /* ------------------------------ AFFECTATIONS --------------------------- */
  if (section === "dest") {
    if (action === "pick") return respond(i, await buildSection("dest", i, config, i.values[0]));
    if (action === "fix") return respond(i, await buildSection("dest", i, config, `fix_${i.values[0]}`));

    if (action === "choose") {
      const d = DESTINATIONS.find((x) => x.id === arg);
      const ch = i.guild.channels.cache.get(i.values[0]);
      await setDestination(i.guildId, d, ch.id);
      const cfg2 = await getConfig(i.guildId);
      if (d.kind === "panel") await publishDestination(i.guild, cfg2, d).catch(() => null);
      return feedback(i, { ok: true, title: "Ambiguïté levée",
        text: `${d.emoji} **${d.label}** est désormais fixé sur ${ch}${d.kind === "panel" ? " et le panneau vient d'y être publié." : "."}` },
        "dest", "__check");
    }

    if (action === "movehere") {
      const d = DESTINATIONS.find((x) => x.id === arg);
      const known = config.panelMessages?.[d.id];
      const ch = known?.channelId ? i.guild.channels.cache.get(known.channelId) : null;
      if (!ch) return feedback(i, { ok: false, title: "Introuvable", text: "Je ne retrouve plus ce panneau.", color: COLORS.danger }, "dest", "__check");
      await setDestination(i.guildId, d, ch.id);
      return feedback(i, { ok: true, title: "Affectation corrigée",
        text: `${d.emoji} **${d.label}** est officiellement dans ${ch}.` }, "dest", "__check");
    }

    if (action === "stray") {
      await i.deferUpdate();
      const strays = await scanStrayPanels(i.guild, config);
      if (!strays.length) return feedback(i, { ok: true, title: "Aucune copie égarée",
        text: "Chaque panneau n'existe qu'à un seul endroit." }, "dest", "__check");
      return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.warning,
        author: { name: `🧹  ${strays.length} copie(s) égarée(s)` },
        description: strays.map((s2) => `${s2.dest.emoji} **${s2.dest.label}** traîne dans ${s2.channel}`).join("\n").slice(0, 3000),
        footer: "Supprimer efface uniquement ces messages en double" })],
        components: [row(
          btn("p:dest:straydel", "Supprimer les doublons", ButtonStyle.Danger, "🗑️"),
          btn("p:dest:page:__check", "Laisser en place", ButtonStyle.Secondary, "◀️"))] });
    }

    if (action === "straydel") {
      await i.deferUpdate();
      const strays = await scanStrayPanels(i.guild, config);
      let n = 0;
      for (const s2 of strays) { if (await s2.message.delete().then(() => true).catch(() => false)) n++; }
      return feedback(i, { ok: true, title: `${n} doublon(s) supprimé(s)`,
        text: "Les panneaux ne subsistent plus que dans leur salon affecté." }, "dest", "__check");
    }

    if (action === "puball") {
      await i.deferUpdate();
      const r = await publishAllDestinations(i.guild);
      return respond(i, { embeds: [embed({ guild: i.guild, color: r.failed.length ? COLORS.warning : COLORS.success,
        author: { name: `📤  ${r.done.length} panneau(x) publié(s)` },
        description: [...r.done.map((x) => `✅ ${x}`), ...r.failed.map((x) => `⚠️ ${x}`)].join("\n").slice(0, 4000),
        footer: "Les messages existants ont été mis à jour, pas dupliqués" })],
        components: (await buildSection("dest", i, await getConfig(i.guildId))).components });
    }

    if (action === "autoall") {
      for (const d of DESTINATIONS) await clearDestination(i.guildId, d);
      return feedback(i, { ok: true, title: "Tout en automatique",
        text: "Chaque panneau et chaque fonction retrouve le salon détecté par son nom." }, "dest");
    }

    const dest = DESTINATIONS.find((d) => d.id === arg);
    if (!dest) return respond(i, await buildSection("dest", i, config));

    if (action === "set") {
      const ch = i.guild.channels.cache.get(i.values[0]);
      if (dest.kind !== "counter" && !canSend(ch))
        return feedback(i, { ok: false, title: "Salon inaccessible",
          text: `Je ne peux pas écrire dans ${ch}. Donne-moi « Voir le salon », « Envoyer des messages » et « Intégrer des liens ».`,
          color: COLORS.danger }, "dest", dest.id);
      await setDestination(i.guildId, dest, ch.id);
      return feedback(i, { ok: true, title: "Affectation enregistrée",
        text: `${dest.emoji} **${dest.label}** → ${ch}` }, "dest", dest.id);
    }

    if (action === "auto") {
      await clearDestination(i.guildId, dest);
      const { channel } = resolveDestination(i.guild, await getConfig(i.guildId), dest);
      return feedback(i, { ok: true, title: "Retour en automatique",
        text: channel ? `${dest.emoji} **${dest.label}** → ${channel} (détecté)` : `Aucun salon détecté pour **${dest.label}**.`,
        color: channel ? COLORS.success : COLORS.warning }, "dest", dest.id);
    }

    if (action === "pub") {
      await i.deferUpdate();
      const r = await publishDestination(i.guild, config, dest);
      return feedback(i, r.ok
        ? { ok: true, title: "Panneau publié", text: `${dest.emoji} **${dest.label}** est en ligne dans ${r.channel}.` }
        : { ok: false, title: "Publication impossible", text: r.reason, color: COLORS.danger }, "dest", dest.id);
    }
  }

  /* ------------------------------ PUBLICATIONS --------------------------- */
  if (section === "publish") {
    if (action === "pick") {
      const labels = { member: "Espace membre", ticket: "Tickets", roles: "Menu de rôles", say: "Annonce", poll: "Sondage" };
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
        else await ch.send(ticketPanel(i.guild, config)).catch(() => null);
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
    if (action === "mprun") {
      if (f("mot").trim().toUpperCase() !== "PURGER")
        return feedback(i, { ok: false, title: "Confirmation refusée",
          text: "Il fallait taper `PURGER`. Rien n'a été supprimé.", color: COLORS.warning }, "mod", "mass");
      const job = takePurge(i.user.id);
      if (!job) return feedback(i, { ok: false, title: "Aperçu expiré",
        text: "Recommence la sélection.", color: COLORS.warning }, "mod", "mass");
      clearPurge(i.user.id);

      await i.deferReply(EPH);
      const targets = job.ids.map((id) => i.guild.channels.cache.get(id)).filter(Boolean);
      const r = await runMassPurge(i.guild, targets, Number(arg) || 0, i.user);

      return i.editReply({ embeds: [embed({ guild: i.guild,
        color: r.partial ? COLORS.warning : COLORS.success,
        author: { name: `🧹  ${num(r.deleted)} message(s) supprimé(s)` },
        description: `Portée : **${job.label}** · ${r.perChannel.length} salon(s) nettoyé(s)`
          + (r.partial ? "\n\n⚠️ Arrêtée au bout de 9 minutes — relance pour finir." : ""),
        fields: r.perChannel.length
          ? [{ name: "Détail", value: r.perChannel.slice(0, 20).map((x) => `${x.channel} — ${num(x.count)}`).join("\n").slice(0, 1000) }]
          : [{ name: "Résultat", value: "Aucun message de moins de 14 jours à supprimer." }],
        footer: "Rapport complet dans tes journaux" })] });
    }

    if (action === "unban") return feedback(i, await actionUnban(i.guild, f("userid").replace(/\D/g, ""), i.user, f("reason") || "Non précisée"), "mod");

    const target = await i.guild.members.fetch(arg).catch(() => null);
    if (!target) return feedback(i, { ok: false, title: "Introuvable", text: "Ce membre a quitté le serveur.", color: COLORS.danger }, "mod");
    const reason = f("reason") || "Non précisée";
    if (action !== "coins") {
      const problem = checkTarget(i.guild, i.member, target, config);
      if (problem) return feedback(i, { ok: false, title: "Action refusée", text: problem, color: COLORS.danger }, "mod");
    }

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
    if (action === "bkcreate") {
      const id = await saveBackup(i.guildId, f("name"), config);
      return feedback(i, { ok: true, title: "Sauvegarde créée", text: `\`#${id}\` **${f("name")}** — restaurable à tout moment.` }, "config", "backup");
    }
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
  if (section === "ranks" && action === "add") {
    const hours = Number(f("hours").replace(",", "."));
    const messages = int("messages");
    if (!Number.isFinite(hours) || hours < 0 || messages === null || messages < 0)
      return feedback(i, { ok: false, title: "Valeurs invalides", text: "Entre un nombre d'heures et un nombre de messages.", color: COLORS.danger }, "ranks");
    const role = i.guild.roles.cache.get(arg);
    const list = (config.ranks?.ladder ?? []).filter((x) => x.roleId !== arg);
    list.push({ roleId: arg, name: f("name") || role?.name || "Grade", hours, messages });
    await updateConfig(i.guildId, { ranks: { ladder: list } });
    return feedback(i, { ok: true, title: "Grade enregistré",
      text: `${role} — **${hours} h** de vocal et **${num(messages)}** messages.`, color: COLORS.gold }, "ranks");
  }

  if (section === "levels" && action === "reward") {
    const lvl = int("level");
    if (lvl === null || lvl < 1) return feedback(i, { ok: false, title: "Niveau invalide", text: "Entre un nombre supérieur à 0.", color: COLORS.danger }, "levels");
    await updateConfig(i.guildId, { levelRewards: { ...config.levelRewards, [lvl]: arg } });
    return feedback(i, { ok: true, title: "Récompense enregistrée", text: `<@&${arg}> sera donné au niveau **${lvl}**.` }, "levels");
  }

  /* -------------------------------- ESCALADE ----------------------------- */
  if (section === "escalation") {
    const rules = [...(config.escalation?.rules ?? [])];
    if (action === "t") { await updateConfig(i.guildId, { escalation: { enabled: !config.escalation.enabled } });
      return respond(i, await buildSection("escalation", i, await getConfig(i.guildId))); }
    if (action === "add") return i.showModal(modal("pm:escalation:add", "Nouveau palier", [
      { id: "warns", label: "À combien d'avertissements ?", required: true, placeholder: "3", max: 3 },
      { id: "act", label: "timeout / kick / ban / alcatraz", required: true, placeholder: "timeout", max: 10 },
      { id: "duration", label: "Durée (10m, 1h, 7d) — timeout et alcatraz", placeholder: "1h", max: 10 },
    ]));
    if (action === "expire") return i.showModal(modal("pm:escalation:expire", "Péremption des avertissements",
      [{ id: "days", label: "Jours avant oubli (0 = jamais)", required: true, value: `${config.escalation.expireDays ?? 0}`, max: 4 }]));
    if (action === "default") {
      await updateConfig(i.guildId, { escalation: { enabled: true, expireDays: 60, rules: [
        { warns: 3, action: "timeout", duration: "1h" },
        { warns: 5, action: "timeout", duration: "1d" },
        { warns: 7, action: "kick" },
        { warns: 10, action: "ban" }] } });
      return feedback(i, { ok: true, title: "Paliers recommandés posés",
        text: "3 → 1 h de silence · 5 → 1 jour · 7 → expulsion · 10 → bannissement. Oubli après 60 jours." }, "escalation");
    }
    if (action === "del") {
      const kept = rules.filter((r) => String(r.warns) !== i.values[0]);
      await updateConfig(i.guildId, { escalation: { rules: kept } });
      return feedback(i, { ok: true, title: "Palier retiré", text: `Plus rien ne se déclenche à ${i.values[0]} avertissement(s).` }, "escalation");
    }
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
  if (section === "tickets" && action === "style") {
    const emoji = f("emoji").trim();
    if (emoji && !resolveEmojiRef(i.guild, emoji)) {
      return feedback(i, { ok: false, title: "Emoji introuvable",
        text: `Aucun emoji nommé \`${emoji}\` sur ce serveur. Utilise un emoji du clavier, ou \`:nom:\` exactement comme il apparaît dans tes réactions.`,
        color: COLORS.danger }, "tickets");
    }
    const style = { ...(config.ticketStyle ?? {}) };
    style[arg] = { label: f("label"), emoji: emoji || undefined, desc: f("desc") || undefined };
    await updateConfig(i.guildId, { ticketStyle: style });
    return feedback(i, { ok: true, title: "Catégorie personnalisée",
      text: `${emoji} **${f("label")}**\n${f("desc") || "_sans description_"}\n\nRepublie le panneau pour l'appliquer.` }, "tickets");
  }

  if (section === "tickets" && action === "delay") {
    const h = int("hours");
    if (h === null || h < 1) return feedback(i, { ok: false, title: "Valeur invalide", text: "Entre un nombre d'heures supérieur à 0.", color: COLORS.danger }, "tickets");
    await updateConfig(i.guildId, { ticketReminder: { hours: Math.min(168, h) } });
    return feedback(i, { ok: true, title: "Délai enregistré", text: `Le staff sera relancé après **${Math.min(168, h)} h** sans réponse.` }, "tickets");
  }

  if (section === "escalation") {
    if (action === "add") {
      const warns = int("warns");
      const act = f("act").toLowerCase();
      const duration = f("duration");
      if (warns === null || warns < 1) return feedback(i, { ok: false, title: "Seuil invalide", text: "Entre un nombre d'avertissements supérieur à 0.", color: COLORS.danger }, "escalation");
      if (!ESCALATION_ACTIONS[act]) return feedback(i, { ok: false, title: "Action inconnue",
        text: "Choisis parmi : `timeout`, `kick`, `ban`, `alcatraz`.", color: COLORS.danger }, "escalation");
      if (ESCALATION_ACTIONS[act].needsDuration && act === "timeout" && !parseDuration(duration))
        return feedback(i, { ok: false, title: "Durée invalide", text: "Un timeout demande une durée : `10m`, `1h`, `7d` (max 28j).", color: COLORS.danger }, "escalation");
      const rules = [...(config.escalation?.rules ?? [])].filter((r) => Number(r.warns) !== warns);
      rules.push({ warns, action: act, duration: duration || null });
      await updateConfig(i.guildId, { escalation: { rules } });
      return feedback(i, { ok: true, title: "Palier enregistré", text: describeRule({ warns, action: act, duration }) }, "escalation");
    }
    if (action === "expire") {
      const days = int("days");
      if (days === null || days < 0) return feedback(i, { ok: false, title: "Valeur invalide", text: "Entre un nombre de jours.", color: COLORS.danger }, "escalation");
      await updateConfig(i.guildId, { escalation: { expireDays: Math.min(3650, days) } });
      return feedback(i, { ok: true, title: "Péremption enregistrée",
        text: days ? `Un avertissement cesse de compter après **${days} jours**.` : "Les avertissements comptent **à vie**." }, "escalation");
    }
  }

  if (section === "verrou") {
    const r = verifier(i.guildId, i.user.id, f("code"));
    if (r.ok) {
      return feedback(i, { ok: true, title: "🔓  Déverrouillé",
        text: `Tu peux modifier le bot pendant **${r.minutes} minutes**.\nRelance l'action que tu voulais faire.` },
        arg || "home");
    }
    if (r.bloqueMin) {
      return feedback(i, { ok: false, title: "🔒  Trop d'essais",
        text: `Attends **${r.bloqueMin} minutes** avant de réessayer.`, color: COLORS.danger }, "home");
    }
    return feedback(i, { ok: false, title: "🔒  Code incorrect",
      text: `Il te reste **${r.restants}** essai(s).`, color: COLORS.danger }, arg || "home");
  }

  if (section === "look") {
    if (action === "brand") {
      const c = parseColor(f("hex"));
      if (c === null) return feedback(i, { ok: false, title: "Code invalide",
        text: "Attendu : `#RRGGBB`, par exemple `#FF5733`.", color: COLORS.danger }, "look");
      await updateConfig(i.guildId, { brandColor: c });
      return feedback(i, { ok: true, title: "Couleur enregistrée", text: `Le bot passe en \`${hexOf(c)}\`.`, color: c }, "look");
    }
    if (action === "etexte") { setDraft(i, { title: f("titre"), description: f("corps") });
      return respond(i, await buildSection("look", i, config, "embed")); }
    if (action === "epied") { setDraft(i, { author: f("auteur"), footer: f("pied") });
      return respond(i, await buildSection("look", i, config, "embed")); }
    if (action === "eimg") { setDraft(i, { image: f("image").trim(), thumb: f("thumb").trim() });
      return respond(i, await buildSection("look", i, config, "embed")); }
    if (action === "ecouleur") {
      const c = parseColor(f("hex"));
      if (c === null) return feedback(i, { ok: false, title: "Code invalide",
        text: "Attendu : `#RRGGBB`.", color: COLORS.danger }, "look", "embed");
      setDraft(i, { color: c });
      return respond(i, await buildSection("look", i, config, "embed"));
    }
  }

  if (section === "money") {
    const montant = int("montant");
    if (montant === null || montant === 0)
      return feedback(i, { ok: false, title: "Montant invalide", text: "Entre un nombre différent de zéro.", color: COLORS.danger }, "money");
    const c = config.economy.currency;

    if (action === "one") {
      const membre = await i.guild.members.fetch(arg).catch(() => null);
      if (!membre) return feedback(i, { ok: false, title: "Introuvable", text: "Ce membre a quitté le serveur.", color: COLORS.danger }, "money");
      const r = await actionGrantCoins(i.guild, membre, montant, i.user, f("raison") || "Trésorerie");
      return feedback(i, r, "money");
    }

    if (action === "role") {
      const role = i.guild.roles.cache.get(arg);
      if (!role) return feedback(i, { ok: false, title: "Rôle introuvable", text: "Il a peut-être été supprimé.", color: COLORS.danger }, "money");
      const ids = [...i.guild.members.cache.values()].filter((m) => !m.user.bot && m.roles.cache.has(role.id)).map((m) => m.id);
      if (!ids.length) return feedback(i, { ok: false, title: "Personne", text: `Aucun membre ne porte ${role}.`, color: COLORS.warning }, "money");
      await addCoinsBulk(i.guildId, ids, montant, true);
      await log(i.guild, "coins", embed({ guild: i.guild, color: COLORS.gold,
        author: { name: `${ICONS.coin}  Distribution à un rôle` },
        fields: [{ name: "Rôle", value: `${role}`, inline: true }, { name: "Par personne", value: num(montant), inline: true },
          { name: "Bénéficiaires", value: `${ids.length}`, inline: true }, { name: "Par", value: i.user.tag, inline: true }] }));
      return feedback(i, { ok: true, title: "Distribution effectuée",
        text: `${c} **${num(montant)}** × **${ids.length}** membre(s) de ${role}.`, color: COLORS.gold }, "money");
    }

    if (action === "all") {
      const ids = [...i.guild.members.cache.values()].filter((m) => !m.user.bot).map((m) => m.id);
      if (!ids.length) return feedback(i, { ok: false, title: "Cache vide",
        text: "Je n'ai pas la liste des membres. Active Server Members Intent.", color: COLORS.danger }, "money");
      await i.deferReply(EPH);
      await addCoinsBulk(i.guildId, ids, montant, true);
      await log(i.guild, "coins", embed({ guild: i.guild, color: COLORS.gold,
        author: { name: `${ICONS.coin}  Distribution générale` },
        fields: [{ name: "Par personne", value: num(montant), inline: true },
          { name: "Bénéficiaires", value: `${ids.length}`, inline: true }, { name: "Par", value: i.user.tag, inline: true }] }));
      return i.editReply({ embeds: [embed({ guild: i.guild, color: COLORS.gold,
        author: { name: `${ICONS.ok}  Distribution générale` },
        description: `${c} **${num(montant)}** versés à **${num(ids.length)}** membre(s).` })] });
    }
  }

  if (section === "voice" && action === "tempcfg") {
    const limit = int("limit");
    await updateConfig(i.guildId, { tempVoice: {
      nameTemplate: f("name").slice(0, 90) || "🔊 {user}",
      defaultLimit: Math.max(0, Math.min(99, limit ?? 0)) } });
    return feedback(i, { ok: true, title: "Vocaux temporaires réglés",
      text: `Nom : \`${f("name")}\` · ${limit ? `${limit} place(s)` : "illimité"}` }, "voice", "temp");
  }

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
    if (action === "caslim") {
      const mn = int("min"), mx = int("max");
      if (mn === null || mx === null || mn < 1 || mx <= mn)
        return feedback(i, { ok: false, title: "Valeurs invalides", text: "Le maximum doit dépasser le minimum.", color: COLORS.danger }, "eco", "casino");
      await updateConfig(i.guildId, { casino: { minBet: mn, maxBet: mx } });
      return feedback(i, { ok: true, title: "Limites enregistrées",
        text: `Mises de **${num(mn)}** à **${num(mx)}**.`, color: COLORS.gold }, "eco", "casino");
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

  /* ------------------------------ AFFECTATIONS --------------------------- */
  if (section === "dest") {
    if (action === "pick") return respond(i, await buildSection("dest", i, config, i.values[0]));
    if (action === "fix") return respond(i, await buildSection("dest", i, config, `fix_${i.values[0]}`));

    if (action === "choose") {
      const d = DESTINATIONS.find((x) => x.id === arg);
      const ch = i.guild.channels.cache.get(i.values[0]);
      await setDestination(i.guildId, d, ch.id);
      const cfg2 = await getConfig(i.guildId);
      if (d.kind === "panel") await publishDestination(i.guild, cfg2, d).catch(() => null);
      return feedback(i, { ok: true, title: "Ambiguïté levée",
        text: `${d.emoji} **${d.label}** est désormais fixé sur ${ch}${d.kind === "panel" ? " et le panneau vient d'y être publié." : "."}` },
        "dest", "__check");
    }

    if (action === "movehere") {
      const d = DESTINATIONS.find((x) => x.id === arg);
      const known = config.panelMessages?.[d.id];
      const ch = known?.channelId ? i.guild.channels.cache.get(known.channelId) : null;
      if (!ch) return feedback(i, { ok: false, title: "Introuvable", text: "Je ne retrouve plus ce panneau.", color: COLORS.danger }, "dest", "__check");
      await setDestination(i.guildId, d, ch.id);
      return feedback(i, { ok: true, title: "Affectation corrigée",
        text: `${d.emoji} **${d.label}** est officiellement dans ${ch}.` }, "dest", "__check");
    }

    if (action === "stray") {
      await i.deferUpdate();
      const strays = await scanStrayPanels(i.guild, config);
      if (!strays.length) return feedback(i, { ok: true, title: "Aucune copie égarée",
        text: "Chaque panneau n'existe qu'à un seul endroit." }, "dest", "__check");
      return respond(i, { embeds: [embed({ guild: i.guild, color: COLORS.warning,
        author: { name: `🧹  ${strays.length} copie(s) égarée(s)` },
        description: strays.map((s2) => `${s2.dest.emoji} **${s2.dest.label}** traîne dans ${s2.channel}`).join("\n").slice(0, 3000),
        footer: "Supprimer efface uniquement ces messages en double" })],
        components: [row(
          btn("p:dest:straydel", "Supprimer les doublons", ButtonStyle.Danger, "🗑️"),
          btn("p:dest:page:__check", "Laisser en place", ButtonStyle.Secondary, "◀️"))] });
    }

    if (action === "straydel") {
      await i.deferUpdate();
      const strays = await scanStrayPanels(i.guild, config);
      let n = 0;
      for (const s2 of strays) { if (await s2.message.delete().then(() => true).catch(() => false)) n++; }
      return feedback(i, { ok: true, title: `${n} doublon(s) supprimé(s)`,
        text: "Les panneaux ne subsistent plus que dans leur salon affecté." }, "dest", "__check");
    }

    if (action === "puball") {
      await i.deferUpdate();
      const r = await publishAllDestinations(i.guild);
      return respond(i, { embeds: [embed({ guild: i.guild, color: r.failed.length ? COLORS.warning : COLORS.success,
        author: { name: `📤  ${r.done.length} panneau(x) publié(s)` },
        description: [...r.done.map((x) => `✅ ${x}`), ...r.failed.map((x) => `⚠️ ${x}`)].join("\n").slice(0, 4000),
        footer: "Les messages existants ont été mis à jour, pas dupliqués" })],
        components: (await buildSection("dest", i, await getConfig(i.guildId))).components });
    }

    if (action === "autoall") {
      for (const d of DESTINATIONS) await clearDestination(i.guildId, d);
      return feedback(i, { ok: true, title: "Tout en automatique",
        text: "Chaque panneau et chaque fonction retrouve le salon détecté par son nom." }, "dest");
    }

    const dest = DESTINATIONS.find((d) => d.id === arg);
    if (!dest) return respond(i, await buildSection("dest", i, config));

    if (action === "set") {
      const ch = i.guild.channels.cache.get(i.values[0]);
      if (dest.kind !== "counter" && !canSend(ch))
        return feedback(i, { ok: false, title: "Salon inaccessible",
          text: `Je ne peux pas écrire dans ${ch}. Donne-moi « Voir le salon », « Envoyer des messages » et « Intégrer des liens ».`,
          color: COLORS.danger }, "dest", dest.id);
      await setDestination(i.guildId, dest, ch.id);
      return feedback(i, { ok: true, title: "Affectation enregistrée",
        text: `${dest.emoji} **${dest.label}** → ${ch}` }, "dest", dest.id);
    }

    if (action === "auto") {
      await clearDestination(i.guildId, dest);
      const { channel } = resolveDestination(i.guild, await getConfig(i.guildId), dest);
      return feedback(i, { ok: true, title: "Retour en automatique",
        text: channel ? `${dest.emoji} **${dest.label}** → ${channel} (détecté)` : `Aucun salon détecté pour **${dest.label}**.`,
        color: channel ? COLORS.success : COLORS.warning }, "dest", dest.id);
    }

    if (action === "pub") {
      await i.deferUpdate();
      const r = await publishDestination(i.guild, config, dest);
      return feedback(i, r.ok
        ? { ok: true, title: "Panneau publié", text: `${dest.emoji} **${dest.label}** est en ligne dans ${r.channel}.` }
        : { ok: false, title: "Publication impossible", text: r.reason, color: COLORS.danger }, "dest", dest.id);
    }
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

  if (action === "grade") {
    const stats = await memberStats(i.guildId, i.user.id);
    const base = { embeds: [progressEmbed(i.guild, i.user, config, stats)] };
    const place = situate(config, stats);
    const niv = await getUserLevel(i.guildId, i.user.id);
    const w2 = await getWallet(i.guildId, i.user.id);
    return reply(await avecVisuel(base, async () => renderProfile({
      pseudo: i.member?.displayName ?? i.user.username,
      avatar: await chargerAvatar(i.user.displayAvatarURL({ extension: "png", size: 128 })),
      serveur: i.guild.name, monnaie: config.economy.currency,
      grade: place.current?.name ?? null,
      gradeSuivant: place.next?.name ?? null,
      heures: stats.hours, heuresCible: place.next?.hours ?? 0,
      messages: stats.messages, messagesCible: place.next?.messages ?? 0,
      coins: w2.coins, niveau: niv.level, xp: niv.xp,
      xpNiveau: niv.xp - xpForLevel(niv.level),
      xpSuivant: xpForLevel(niv.level + 1) - xpForLevel(niv.level),
      rang: niv.rank ? `${niv.rank}ᵉ` : null,
    })));
  }

  if (action === "echelle") {
    const stats = await memberStats(i.guildId, i.user.id);
    return reply({ embeds: [ladderEmbed(i.guild, config, stats)] });
  }

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
      .thumb(i.user.displayAvatarURL({ size: 128 }))] });
  }
  if (action === "coins") {
    const w = await getWallet(i.guildId, i.user.id);
    const dette = w.coins < 0;
    return reply({ embeds: [embed({ guild: i.guild, color: dette ? COLORS.danger : COLORS.gold,
      author: { name: dette ? "🚨  Tu es en dette" : `${ICONS.coin}  Ton solde` },
      description: dette
        ? `## − ${config.economy.currency} ${num(-w.coins)}\nTables et boutique fermées jusqu'au remboursement.\nLe quotidien et le travail réduisent la dette.`
        : `## ${config.economy.currency} ${num(w.coins)}`,
      footer: w.streak ? `Série quotidienne : ${w.streak} jour(s)` : undefined })] });
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
      const habiller = await classementVisuel(i, "TOP VOCAL", "min", r, (x) => x.minutes);
      return reply(await habiller({ embeds: [embed({ guild: i.guild, author: { name: "🔊  Top temps vocal" },
        description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — ${fmt(x.minutes)}`).join("\n") })] }));
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
      const habillerC = await classementVisuel(i, "TOP COINS", "coins", r, (x) => x.coins);
      return reply(await habillerC({ embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "💰  Top coins" },
        description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — ${config.economy.currency} **${num(x.coins)}**`).join("\n") })] }));
    }
    const r = await topLevels(i.guildId, 10);
    if (!r.length) return reply({ content: "Personne n'a encore d'XP." });
    const habillerN = await classementVisuel(i, "TOP NIVEAUX", "XP", r, (x) => x.xp);
    return reply(await habillerN({ embeds: [embed({ guild: i.guild, author: { name: "🏆  Top niveaux" },
      description: r.map((x, n) => `${medals[n] ?? `**${n + 1}.**`} <@${x.userId}> — niveau **${x.level}** · ${num(x.xp)} XP`).join("\n") })] }));
  }
  if (action === "shop") {
    const shop = config.economy.shop;
    if (!shop.length) return reply({ content: "La boutique est vide pour le moment." });
    const w = await getWallet(i.guildId, i.user.id);
    const vitrine = { embeds: [embed({ guild: i.guild, color: COLORS.gold, author: { name: "🛒  Boutique" },
      description: shop.map((x) => {
        const ty = ITEM_TYPES[x.type ?? "role"];
        const what = (x.type ?? "role") === "role" ? `<@&${x.roleId}>`
          : x.type === "xp" ? `${num(x.amount ?? 0)} XP immédiats`
          : x.type === "multiplier" ? `XP ×${x.amount ?? 2} pendant ${x.hours ?? 24} h`
          : x.type === "pardon" ? "Efface ton dernier avertissement"
          : "Ton propre rôle, nom et couleur au choix";
        return `${w.coins >= x.price ? "🟢" : "🔴"} ${ty?.emoji ?? ""} **${x.name}** — ${config.economy.currency} ${num(x.price)}\n${what}`;
      }).join("\n\n"),
      footer: w.coins < 0 ? `Tu dois ${num(-w.coins)} — achats bloqués` : `Ton solde : ${num(w.coins)}` })],
      components: [row(new StringSelectMenuBuilder().setCustomId("pub:buy").setPlaceholder("Acheter un article…")
        .addOptions(shop.slice(0, 25).map((x) => ({ label: x.name.slice(0, 100), value: x.id,
          emoji: ITEM_TYPES[x.type ?? "role"]?.emoji,
          description: `${num(x.price)} coins${x.stock != null ? ` · stock ${x.stock}` : ""}`.slice(0, 100) }))))] };

    return reply(await avecVisuel(vitrine, async () => renderShop({
      joueur: i.member?.displayName ?? i.user.username,
      avatar: await chargerAvatar(i.user.displayAvatarURL({ extension: "png", size: 128 })),
      serveur: i.guild.name, solde: w.coins, monnaie: config.economy.currency,
      articles: shop.map((x) => ({ nom: x.name, type: x.type ?? "role", prix: x.price })),
    })));
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

  return false;
}

/* ========================================================================== */
/*                    26 - COMMANDES ET MENUS CONTEXTUELS                     */
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
        description: "Tu es **Membre**. Les fonctions qui te concernent (niveau, coins, quotidien, boutique, tickets, vocaux) sont sur les panneaux publiés dans les salons du serveur.",
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
        value: "Aucune commande à taper. Les panneaux publiés dans les salons donnent accès au niveau, au solde, au quotidien, au travail, aux classements, à la boutique et aux tickets. Le salon « Créer ton vocal » leur donne leur propre vocal.",
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

    // Les sous-commandes qui écrivent exigent le code de sécurité
    if (["set", "reset", "actif"].includes(sub) && !estOuvert(i.guildId, i.user.id)) {
      return i.reply({ content: "🔒 Ouvre d'abord les modifications : `/panel` → bouton **Déverrouiller**.", ...EPH });
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
/*                     27 - CLIENT, EVENEMENTS, DEMARRAGE                     */
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

  // Dessin des jeux : si la bibliothèque ou la police manquent, le casino
  // repassera en texte au lieu de faire tomber le bot.
  await initRender();
  console.log(`[images] casino en ${renderReady() ? "image" : "texte"}`);
  await initMusique();
  console.log(`[musique] ${musiqueReady() ? "lecteur actif" : "lecteur indisponible"}`);

  for (const guild of c.guilds.cache.values()) {
    const watch = await watchOwner(guild, { announce: false }).catch(() => ({ suspended: false }));
    if (watch.suspended) {
      console.warn(`[veille] ${guild.name} : propriétaire ${OWNER_ID} absent → bot en veille totale`);
      continue;
    }
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
    const orphans = await purgeOrphans(guild).catch(() => 0);
    if (orphans) console.log(`[vocal] ${orphans} salon(x) temporaire(s) orphelin(s) supprimé(s)`);
    const hub = resolveHub(guild, await getConfig(guild.id));
    console.log(hub ? `[vocal] salon d'accueil : ${hub.name}` : "[vocal] aucun salon « Créer ton vocal » trouvé");

    try {
      const results = await verifyDestinations(guild, await getConfig(guild.id));
      const { ok, bad } = summarizeIssues(results);
      console.log(`[emplacements] ${ok}/${results.length} au bon endroit`);
      for (const r of bad) console.log(`  ⚠️  ${r.dest.label} — ${ISSUE_LABEL[r.status]}`);
    } catch (e) { console.warn("[emplacements] vérification impossible :", e.message); }
    await refreshTicketCounter(guild).catch(() => null);
  }

  const presence = () => {
    if (refreshPresenceStatus(c)) return;
    const total = c.guilds.cache.reduce((t, g) => t + g.memberCount, 0);
    c.user.setPresence({ activities: [{ name: `${num(total)} membres · /help`, type: ActivityType.Watching }], status: "online" });
  };
  presence();
  setInterval(presence, 10 * 60_000).unref();

  // Compteurs vocaux : 10 min (Discord limite les renommages à 2 / 10 min / salon)
  setInterval(() => {
    for (const g of c.guilds.cache.values()) { if (!isSuspended(g.id)) updateCounters(g).catch(() => null); }
  }, 10 * 60_000).unref();

  // Filet de sécurité : on revérifie la présence du propriétaire
  if (SUSPEND_ENABLED) {
    setInterval(async () => {
      for (const g of c.guilds.cache.values()) {
        const r = await watchOwner(g).catch(() => null);
        if (r?.changed) {
          console.log(`[veille] ${g.name} : ${r.suspended ? "mise en veille" : "reprise"}`);
          refreshPresenceStatus(c);
          if (!r.suspended) { buildIndex(g); await updateCounters(g, true).catch(() => null); }
        }
      }
    }, 5 * 60_000).unref();
  }

  // Giveaways
  setInterval(() => { if (!c.guilds.cache.some((g) => !isSuspended(g.id))) return; tickGiveaways(c).catch(() => null); }, 20_000).unref();

  // Récompenses vocales : on relit l'intervalle configuré à chaque minute
  const voiceTicks = new Map();
  setInterval(async () => {
    for (const g of c.guilds.cache.values()) {
      try {
        if (isSuspended(g.id)) continue;
        const cfg = await getConfig(g.id);
        if (!cfg.voice?.enabled) continue;
        const every = Math.max(1, cfg.voice.intervalMinutes ?? 5);
        const n = (voiceTicks.get(g.id) ?? 0) + 1;
        if (n < every) { voiceTicks.set(g.id, n); continue; }
        voiceTicks.set(g.id, 0);
        const r = await tickVoiceRewards(g);
        if (r.rewarded) console.log(`[vocal] ${g.name} : ${r.rewarded} récompensé(s)`);

        // Le temps de vocal peut déclencher une montée de grade
        if (cfg.ranks?.enabled && cfg.ranks?.autoPromote) {
          for (const vs of g.voiceStates.cache.values()) {
            if (!vs.channelId) continue;
            const m = g.members.cache.get(vs.id);
            if (!m || m.user.bot) continue;
            const up = await applyRank(m, cfg).catch(() => ({ promoted: false }));
            if (up.promoted) await announceRank(g, m, up, cfg);
          }
        }
      } catch (e) { console.error("[vocal]", e.message); }
    }
  }, 60_000).unref();

  // Tickets laissés sans réponse
  setInterval(async () => {
    for (const g of c.guilds.cache.values()) {
      try {
        if (isSuspended(g.id)) continue;
        const r = await checkStaleTickets(g);
        if (r.reminded) console.log(`[tickets] ${g.name} : ${r.reminded} rappel(s)`);
      } catch (e) { console.error("[tickets]", e.message); }
    }
  }, 15 * 60_000).unref();

  // Libérations automatiques d'Alcatraz
  setInterval(async () => {
    for (const row of await dueJail()) {
      const guild = c.guilds.cache.get(row.guild_id);
      if (!guild || isSuspended(guild.id)) continue;
      const member = await guild.members.fetch(row.user_id).catch(() => null);
      if (member) await releaseFromJail(guild, member, "Fin de peine").catch(() => null);
    }
  }, 60_000).unref();
});

/* ============================== INTERACTIONS ============================== */

client.on(Events.InteractionCreate, async (i) => {
  try {
    if (i.inGuild() && isSuspended(i.guildId)) {
      if (i.isAutocomplete()) return i.respond([]).catch(() => null);
      if (i.isRepliable()) return i.reply({ ...suspendedNotice(i.guild), ...EPH }).catch(() => null);
      return;
    }

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

    if (i.isStringSelectMenu() || i.isUserSelectMenu()) {
      if (i.customId?.startsWith("tv:")) return handleTempVoice(i);
      if (i.customId?.startsWith("mus:")) return handleMusique(i, await getConfig(i.guildId), isOwner(i.user.id));
    }

    if (i.isModalSubmit() && i.customId?.startsWith("tvm:")) return handleTempVoiceModal(i);
    if (i.isModalSubmit() && i.customId?.startsWith("casm:")) return handleCasinoModal(i);

    if (i.isStringSelectMenu()) {
      if (i.customId === "ticket:pick") { await i.deferReply(EPH); return createTicket(i, i.values[0]); }
      if (i.customId === "rolemenu") return handleRoleMenu(i);
      if (i.customId?.startsWith("rm:")) return handleRoleMenuSelect(i);
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
      if (ns === "tv") return handleTempVoice(i);
      if (ns === "cas") return handleCasino(i);
      if (ns === "cr") return handleCrime(i);
      if (ns === "mus") return handleMusique(i, await getConfig(i.guildId), isOwner(i.user.id));
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
  if (SUSPEND_ENABLED && member.id === OWNER_ID) {
    const r = await applyPresence(member.guild, true);
    if (r.changed) {
      console.log(`[veille] ${member.guild.name} : le propriétaire est revenu, reprise complète`);
      refreshPresenceStatus(client);
    }
  }
  if (isSuspended(member.guild.id)) return;

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
    if (isLockdown(member.guild.id) && config.antiraid.onRaid === "kick"
        && member.kickable && !hasAdminImmunity(member, config)) {
      await member.kick("Anti-raid : arrivée pendant un raid").catch(() => null);
      return;
    }
  }

  scheduleCounters(member.guild);
  await handleInviteJoin(member).catch((e) => console.error("[invites]", e.message));

  if (config.autoroleId) await member.roles.add(config.autoroleId, "Autorole").catch(() => null);

  if (config.welcomeChannelId) {
    const ch = member.guild.channels.cache.get(config.welcomeChannelId);
    if (ch && canSend(ch)) {
      let fichierBienvenue = null;
      if (renderReady()) {
        try {
          const avatar = await chargerAvatar(member.user.displayAvatarURL({ extension: "png", size: 256 }));
          const invitation = await getInviter(member.guild.id, member.id).catch(() => null);
          const parrain = invitation?.inviterId
            ? (member.guild.members.cache.get(invitation.inviterId)?.displayName ?? null) : null;
          const buffer = renderWelcome({
            pseudo: member.displayName ?? member.user.username, avatar,
            serveur: member.guild.name, numero: member.guild.memberCount,
            invitePar: parrain, membres: member.guild.memberCount,
          });
          if (buffer) fichierBienvenue = { attachment: buffer, name: `bienvenue-${member.id}.png` };
        } catch (e) { console.error("[bienvenue]", e.message); }
      }
      await ch.send({
        ...(fichierBienvenue ? { files: [fichierBienvenue] } : {}),
        embeds: [embed({ description: fill(config.welcomeMessage, member), color: COLORS.success })
        .thumb(member.user.displayAvatarURL({ size: 128 }))] }).catch(() => null);
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
  if (SUSPEND_ENABLED && member.id === OWNER_ID) {
    const r = await watchOwner(member.guild);
    if (r.changed && r.suspended) {
      console.warn(`[veille] ${member.guild.name} : propriétaire absent, mise en veille totale`);
      refreshPresenceStatus(client);
    }
    if (isSuspended(member.guild.id)) return;
  }
  if (isSuspended(member.guild.id)) return;

  scheduleCounters(member.guild);
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

client.on(Events.PresenceUpdate, (before, after) => {
  const guild = after?.guild;
  if (!guild || isSuspended(guild.id)) return;
  if (before?.status === after?.status) return;
  scheduleCounters(guild);
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

/**
 * Rafraîchit les compteurs peu après un changement, sans rafale :
 * on regroupe les mouvements sur 3 secondes avant de renommer.
 */
const counterTimers = new Map();
function scheduleCounters(guild) {
  if (counterTimers.has(guild.id)) return;
  counterTimers.set(guild.id, setTimeout(() => {
    counterTimers.delete(guild.id);
    updateCounters(guild).catch(() => null);
  }, 3000));
}

client.on(Events.MessageCreate, async (message) => {
  if (!message.guild || message.author.bot) return;
  if (isSuspended(message.guild.id)) return;
  const config = await getConfig(message.guild.id);

  // Suivi des tickets : une réponse du staff annule le rappel
  if (message.channel.name?.includes("ticket-")) {
    touchTicket(message.channel.id, permLevel(message.member, config) >= 1).catch(() => null);
  }

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

  // Commandes à préfixe : « ! » pour tout, « + » pour le lecteur audio
  const prefixes = [config.prefix?.char || "!", config.musique?.prefixe || "+"];
  if (prefixes.some((p) => message.content.startsWith(p))) {
    const pris = await handlePrefix(message, config).catch((e) => { console.error("[prefixe]", e.message); return false; });
    if (pris) return;
  }

  // Compteur de messages : il sert aux grades, sans temporisation
  if (config.ranks?.enabled) {
    const total = await addMessageCount(message.guild.id, message.author.id, 1);
    // On ne vérifie la promotion que sur les paliers, pour ne pas marteler la base
    if (total % 25 === 0 && message.member) {
      const r = await applyRank(message.member, config).catch(() => ({ promoted: false }));
      if (r.promoted) await announceRank(message.guild, message.member, r, config);
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

/** Annonce une montée de grade dans le salon des niveaux. */
async function announceRank(guild, member, result, config) {
  if (config.ranks?.announce === false) return;
  const target = resolveFuncChannel(guild, "levelUp", config);
  if (!target || !canSend(target)) return;
  let fichier = null;
  if (renderReady()) {
    try {
      const avatar = await chargerAvatar(member.user.displayAvatarURL({ extension: "png", size: 128 }));
      const buffer = renderPromotion({
        pseudo: member.displayName ?? member.user.username, avatar,
        titre: "Montée de grade", ancien: null,
        nouveau: result.rank.name ?? result.role.name,
        detail: `${Math.floor(result.stats.hours)} h de vocal et ${num(result.stats.messages)} messages`,
        teinte: "#f5c518",
      });
      if (buffer) fichier = { attachment: buffer, name: `grade-${member.id}.png` };
    } catch (e) { console.error("[grade]", e.message); }
  }
  await target.send({
    ...(fichier ? { files: [fichier] } : {}),
    embeds: [embed({
      guild, color: COLORS.gold, author: { name: "🎖️  Montée de grade" },
      description: `${member} atteint **${result.rank.name ?? result.role.name}** ${result.role}`,
      fields: fichier ? [] : [
        { name: "Temps vocal", value: `${Math.floor(result.stats.hours)} h`, inline: true },
        { name: "Messages", value: num(result.stats.messages), inline: true },
      ],
    })],
  }).catch(() => null);
}

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
  if (isSuspended(guild.id)) return;
  const config = await getConfig(guild.id);

  // « Créer ton vocal » : on fabrique le salon du membre
  if (config.tempVoice?.enabled && after.channelId && after.channelId !== before.channelId) {
    const hub = resolveHub(guild, config);
    if (hub && after.channelId === hub.id) {
      await createTempVoice(member, hub, config).catch((e) => console.error("[vocal]", e.message));
      return;
    }
  }
  // Vocal temporaire quitté : suppression s'il est vide
  if (before.channelId && before.channelId !== after.channelId) {
    await cleanupIfEmpty(guild, before.channelId, config).catch(() => null);
  }

  // Le compteur vocal réagit tout de suite, dans la limite autorisée par Discord
  if (before.channelId !== after.channelId) scheduleCounters(guild);

  // Le lecteur quitte de lui-même un vocal qui se vide
  if (musiqueReady() && before.channelId && before.channelId !== after.channelId) {
    surVocalVide(guild, before.channelId);
  }

  // Piège vocal (JOIN = sanction)
  if (config.trapVoiceId && config.trapAction !== "off" && after.channelId === config.trapVoiceId && before.channelId !== after.channelId) {
    const staff = isOwner(member.id) || member.id === guild.ownerId
      || hasAdminImmunity(member, config) || permLevel(member, config) >= 2;
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
  if (isSuspended(guild.id)) return null;
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
