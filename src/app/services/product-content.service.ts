import { Injectable } from '@angular/core';
import { Game } from '../Models/game.model';

export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface ProductContentBlock {
  heading: string;
  paragraphs: string[];
}

export interface ProductContent {
  /** Meta description optimisée (elle sera tronquée proprement par le SeoService). */
  metaDescription: string;
  /** Mots-clés longue traîne injectés dans la balise meta keywords. */
  keywords: string[];
  introParagraphs: string[];
  highlights: string[];
  blocks: ProductContentBlock[];
  faq: ProductFaqItem[];
}

interface GenreProfile {
  short: string;
  strengths: string[];
  audience: string;
  beginner: string;
  keywords: string[];
}

interface PlatformProfile {
  experience: string;
  advice: string;
  keywords: string[];
}

const DEFAULT_GENRE: GenreProfile = {
  short: 'accessible aussi bien aux joueurs occasionnels qu’aux passionnés',
  strengths: [
    'une prise en main progressive et immédiate',
    'des sessions de jeu flexibles, courtes ou longues',
    'une communauté active et des mises à jour régulières'
  ],
  audience: 'les joueurs curieux qui veulent découvrir un titre complet sans se perdre dans des mécaniques trop complexes',
  beginner: 'Oui : les premières heures servent de tutoriel et accompagnent progressivement le joueur.',
  keywords: ['jeu vidéo', 'jeu console', 'jeu PC']
};

const GENRE_PROFILES: Record<string, GenreProfile> = {
  action: {
    short: 'nerveux, spectaculaire et immédiatement gratifiant',
    strengths: [
      'des combats dynamiques avec un vrai sentiment de puissance',
      'des séquences spectaculaires dignes d’un film d’action',
      'un rythme soutenu qui évite les temps morts',
      'des objectifs variés : infiltrer, combattre, explorer, survivre'
    ],
    audience:
      'les joueurs qui aiment les défis rapides, les scènes fortes et les mécaniques de combat faciles à comprendre mais difficiles à maîtriser',
    beginner:
      'Oui : la difficulté est généralement progressive et les commandes sont pensées pour être prises en main rapidement.',
    keywords: ['jeu d’action', 'jeu action PC', 'jeu action console', 'jeu baston aventure']
  },
  rpg: {
    short: 'profond, riche en choix et construit autour de la progression de votre personnage',
    strengths: [
      'une progression de personnage sur le long terme',
      'des choix scénaristiques qui influencent l’aventure',
      'un univers dense, avec quêtes principales et secondaires',
      'un système d’équipement, de compétences et de statistiques à personnaliser'
    ],
    audience:
      'les joueurs qui aiment prendre leur temps, explorer un univers riche et construire un personnage qui leur ressemble',
    beginner:
      'Oui, à condition d’aimer lire, comparer et progresser étape par étape : un RPG récompense la patience.',
    keywords: ['jeu RPG', 'jeu de rôle', 'RPG PC', 'RPG console', 'jeu de rôle en ligne']
  },
  fps: {
    short: 'précis, compétitif et centré sur le contrôle du terrain',
    strengths: [
      'des gunfights précis qui récompensent l’aim et la réactivité',
      'des cartes et des modes pensés pour le jeu en équipe',
      'un équilibrage régulier et des saisons de contenu',
      'une forte rejouabilité en multijoueur'
    ],
    audience:
      'les joueurs qui aiment la compétition, le travail d’équipe et les parties rapides à forte intensité',
    beginner:
      'Oui, mais comptez quelques parties pour assimiler les cartes et les armes avant de viser le classement.',
    keywords: ['jeu FPS', 'jeu de tir', 'FPS PC', 'FPS console', 'jeu multijoueur compétitif']
  },
  sport: {
    short: 'une simulation sportive complète, entre compétition et gestion',
    strengths: [
      'des matchs fidèles au sport et à ses règles',
      'des modes carrière pour faire évoluer un club ou un joueur',
      'des effectifs, maillots et compétitions licenciés',
      'un mode multijoueur pour défier ses amis'
    ],
    audience:
      'les amateurs de sport qui veulent jouer un match rapide ou construire une carrière sur toute une saison',
    beginner:
      'Oui : les modes débutant et les réglages d’assistance permettent de jouer sans connaître toutes les subtilités.',
    keywords: ['jeu de sport', 'simulation sportive', 'jeu football', 'jeu sport console']
  },
  racing: {
    short: 'rapide, technique et orienté sensations de conduite',
    strengths: [
      'une conduite nerveuse avec un vrai travail de trajectoire',
      'un large choix de véhicules à collectionner et à améliorer',
      'des circuits variés, du tracé urbain au circuit fermé',
      'des modes solo et multijoueur pour comparer ses chronos'
    ],
    audience:
      'les passionnés d’automobile et de pilotage, du joueur occasionnel au chrono-maniaque',
    beginner:
      'Oui : les aides au pilotage et les modes arcade permettent de prendre du plaisir dès les premières courses.',
    keywords: ['jeu de course', 'jeu racing', 'simulation automobile', 'jeu voiture PC', 'jeu voiture console']
  },
  aventure: {
    short: 'narratif, immersif et porté par l’exploration',
    strengths: [
      'une histoire forte avec des personnages marquants',
      'des environnements ouverts à explorer librement',
      'un rythme qui laisse la place à l’observation et aux découvertes',
      'des quêtes secondaires qui enrichissent l’univers'
    ],
    audience:
      'les joueurs qui préfèrent vivre une histoire et explorer un monde plutôt que d’enchaîner les combats',
    beginner:
      'Oui : l’aventure s’installe progressivement et ne demande pas de compétence particulière en jeu vidéo.',
    keywords: ['jeu d’aventure', 'jeu aventure PC', 'jeu aventure console', 'jeu monde ouvert']
  },
  adventure: {
    short: 'narratif, immersif et porté par l’exploration',
    strengths: [
      'une histoire forte avec des personnages marquants',
      'des environnements ouverts à explorer librement',
      'un rythme qui laisse la place à l’observation et aux découvertes',
      'des quêtes secondaires qui enrichissent l’univers'
    ],
    audience:
      'les joueurs qui préfèrent vivre une histoire et explorer un monde plutôt que d’enchaîner les combats',
    beginner:
      'Oui : l’aventure s’installe progressivement et ne demande pas de compétence particulière en jeu vidéo.',
    keywords: ['jeu d’aventure', 'jeu aventure PC', 'jeu aventure console', 'jeu monde ouvert']
  },
  fighting: {
    short: 'technique, compétitif et basé sur la maîtrise des enchaînements',
    strengths: [
      'des combattants variés avec chacun leur style',
      'un système de combat profond mais lisible',
      'des modes entraînement et histoire pour progresser',
      'une scène compétitive locale et en ligne'
    ],
    audience:
      'les joueurs qui aiment le versus, les combos et la progression technique, que ce soit en local ou en ligne',
    beginner:
      'Oui : les tutoriels et les modes assistés permettent d’apprendre les bases avant de passer au versus.',
    keywords: ['jeu de combat', 'jeu fighting', 'jeu versus', 'jeu baston', 'esport combat']
  },
  simulation: {
    short: 'réaliste, détaillé et orienté gestion ou immersion',
    strengths: [
      'une simulation fidèle au domaine représenté',
      'des réglages nombreux pour adapter l’expérience',
      'une progression gratifiante sur la durée',
      'un contenu qui récompense la patience et l’observation'
    ],
    audience:
      'les joueurs qui aiment comprendre des systèmes, optimiser et prendre le temps de faire les choses correctement',
    beginner:
      'Oui, mais il faut accepter un temps d’apprentissage : la simulation demande de lire et d’expérimenter.',
    keywords: ['jeu de simulation', 'jeu gestion', 'simulation réaliste', 'jeu simulation PC']
  },
  platformer: {
    short: 'coloré, inventif et basé sur le timing et la précision',
    strengths: [
      'des niveaux conçus autour du rythme et de la précision',
      'des mécaniques simples à comprendre et difficiles à maîtriser',
      'une direction artistique lisible et agréable',
      'un excellent équilibre entre challenge et accessibilité'
    ],
    audience:
      'les joueurs de tous âges qui aiment les jeux de plateforme, les défis de précision et les univers colorés',
    beginner:
      'Oui : c’est l’un des genres les plus accessibles, avec une difficulté qui monte progressivement.',
    keywords: ['jeu de plateforme', 'jeu platformer', 'jeu famille', 'jeu enfant console']
  },
  survival: {
    short: 'exigeant, coopératif et centré sur la gestion des ressources',
    strengths: [
      'un cycle jour/nuit qui rythme l’exploration',
      'la construction et l’amélioration de sa base',
      'la gestion des ressources, de la faim et des dangers',
      'un mode coopératif qui renforce la progression'
    ],
    audience:
      'les joueurs qui aiment planifier, construire et surmonter des défis avec leurs amis',
    beginner:
      'Oui, mais mieux vaut commencer en coopératif : la courbe d’apprentissage est plus douce à plusieurs.',
    keywords: ['jeu de survie', 'jeu survival', 'jeu coopération', 'jeu crafting', 'jeu survie PC']
  },
  party: {
    short: 'convivial, familial et pensé pour jouer à plusieurs',
    strengths: [
      'des mini-jeux rapides et faciles à comprendre',
      'des parties courtes parfaites pour les soirées',
      'un mode multijoueur local immédiat',
      'un univers coloré adapté à toute la famille'
    ],
    audience:
      'les familles et les groupes d’amis qui cherchent un jeu à partager sans temps mort',
    beginner:
      'Oui, c’est même le cœur du jeu : tout le monde peut participer dès la première partie.',
    keywords: ['jeu de soirée', 'jeu party', 'jeu famille', 'jeu multijoueur local', 'jeu enfant']
  },
  shooter: {
    short: 'nerveux, compétitif et immédiatement lisible',
    strengths: [
      'des parties courtes et intenses',
      'des armes et des styles de jeu complémentaires',
      'un multijoueur accessible dès les premières minutes',
      'un équilibrage pensé pour la compétition'
    ],
    audience:
      'les joueurs qui aiment le jeu en ligne, la compétition et les sessions rapides',
    beginner:
      'Oui : les tutoriels et les modes non classés permettent d’apprendre sans pression.',
    keywords: ['jeu de tir', 'jeu shooter', 'jeu multijoueur', 'jeu compétitif', 'jeu en ligne']
  },
  horror: {
    short: 'tendu, immersif et construit autour de l’angoisse',
    strengths: [
      'une ambiance sonore et visuelle oppressante',
      'des moments de tension mémorables',
      'une gestion du danger qui entretient le suspense',
      'une forte immersion avec un casque'
    ],
    audience:
      'les joueurs qui aiment les émotions fortes, le suspense et les univers sombres',
    beginner:
      'Oui, mais le jeu est déconseillé aux joueurs sensibles au stress et aux atmosphères angoissantes.',
    keywords: ['jeu horreur', 'jeu d’horreur', 'jeu survival horror', 'jeu angoisse', 'jeu zombie']
  },
  strategy: {
    short: 'intelligent, structuré et tourné vers la planification',
    strengths: [
      'des décisions qui ont un impact réel sur la partie',
      'une gestion de ressources à optimiser',
      'une grande rejouabilité grâce aux multiples approches',
      'un rythme posé qui récompense la réflexion'
    ],
    audience:
      'les joueurs qui aiment analyser, planifier et construire une stratégie gagnante',
    beginner:
      'Oui, mais il faut aimer réfléchir : les premiers scénarios servent de tutoriel progressive.',
    keywords: ['jeu de stratégie', 'jeu strategy', 'jeu gestion', 'jeu tactique', 'jeu PC stratégie']
  }
};

const DEFAULT_PLATFORM: PlatformProfile = {
  experience:
    'le jeu profite d’une manette ou d’un clavier/souris selon votre préférence, avec des réglages accessibles',
  advice:
    'Vérifiez simplement la compatibilité indiquée sur la fiche avant la commande.',
  keywords: ['jeu console', 'jeu PC']
};

const PLATFORM_PROFILES: Record<string, PlatformProfile> = {
  pc: {
    experience:
      'sur PC, vous profitez de réglages graphiques fins et d’une expérience qui peut évoluer avec votre configuration',
    advice:
      'Un PC récent est recommandé pour activer les détails élevés. Les configurations modestes restent jouables en réduisant la qualité graphique.',
    keywords: ['jeu PC', 'jeu PC Tunisie', 'jeu PC pas cher', 'jeu ordinateur', 'clé PC']
  },
  'playstation-5': {
    experience:
      'sur PlayStation 5, le jeu profite du SSD ultra-rapide, de la manette DualSense et d’un rendu 4K fluide',
    advice:
      'Le Blu-ray PS5 permet de jouer hors ligne après installation. Un espace de stockage libre est nécessaire pour l’installation.',
    keywords: ['jeu PS5', 'jeu PlayStation 5', 'jeu PS5 Tunisie', 'jeu console PS5']
  },
  'playstation-4': {
    experience:
      'sur PlayStation 4, le jeu reste accessible avec une expérience stable et une manette DualShock 4',
    advice:
      'Prévoyez de l’espace de stockage et les mises à jour du jeu pour bénéficier des corrections et du mode en ligne.',
    keywords: ['jeu PS4', 'jeu PlayStation 4', 'jeu PS4 Tunisie']
  },
  xbox: {
    experience:
      'sur Xbox Series X|S, le jeu profite du Quick Resume, de temps de chargement réduits et d’un rendu optimisé',
    advice:
      'La version Xbox est compatible avec la manette Xbox et les fonctionnalités en ligne de la console.',
    keywords: ['jeu Xbox', 'jeu Xbox Series X', 'jeu Xbox Tunisie', 'jeu console Xbox']
  },
  'xbox-one': {
    experience:
      'sur Xbox One, le jeu conserve une expérience fluide et l’accès aux fonctionnalités en ligne',
    advice:
      'Vérifiez l’espace disque disponible avant l’installation et connectez la console pour les mises à jour.',
    keywords: ['jeu Xbox One', 'jeu Xbox Tunisie']
  },
  'nintendo-switch': {
    experience:
      'sur Nintendo Switch, le jeu peut se jouer en portable, en mode table ou sur téléviseur',
    advice:
      'La cartouche Switch permet de jouer sans connexion après installation des mises à jour éventuelles.',
    keywords: ['jeu Switch', 'jeu Nintendo Switch', 'jeu Switch Tunisie', 'jeu portable']
  },
  mobile: {
    experience:
      'sur mobile, le jeu est pensé pour des sessions courtes avec des commandes tactiles',
    advice:
      'Vérifiez la compatibilité de votre appareil et l’espace de stockage disponible avant l’installation.',
    keywords: ['jeu mobile', 'jeu téléphone', 'jeu iOS', 'jeu Android']
  }
};

function normalizeKey(value: string | undefined | null): string {
  return (value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function formatPrice(value: number | string | undefined): string {
  const price = Number(value);
  if (!Number.isFinite(price) || price <= 0) return '';
  return `${price.toFixed(price % 1 === 0 ? 0 : 2)} DT`;
}

function formatReleaseYear(value: string | undefined): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const match = String(value).match(/(\d{4})/);
    return match?.[1] ?? '';
  }
  return String(date.getFullYear());
}

@Injectable({ providedIn: 'root' })
export class ProductContentService {
  /**
   * Construit un contenu éditorial long et unique par jeu.
   * Le contenu est dérivé des données du produit (titre, genre, plateforme,
   * tags, prix, stock, note) afin de rester valable même quand le catalogue
   * évolue côté backend.
   */
  build(game: Game, stats?: { averageRating?: number; reviewCount?: number }): ProductContent {
    const title = (game?.title || 'Ce jeu').trim();
    const genre = (game?.genre || 'Action').trim();
    const platform = (game?.platform || 'PC').trim();
    const tags = Array.isArray(game?.tags) ? game.tags.filter(Boolean) : [];
    const genreKey = normalizeKey(genre);
    const platformKey = normalizeKey(platform);
    const genreProfile = GENRE_PROFILES[genreKey] ?? DEFAULT_GENRE;
    const platformProfile = PLATFORM_PROFILES[platformKey] ?? DEFAULT_PLATFORM;
    const price = formatPrice(game?.price);
    const releaseYear = formatReleaseYear(game?.release_date);
    const inStock = Number(game?.stock) > 0;
    const promo = !!game?.promo;
    const safeTitle = title.replace(/\s+/g, ' ');

    const tagsLabel = tags.length
      ? tags.slice(0, 4).join(', ')
      : `${genre}, ${platform}`;

    const metaDescription = [
      `Achetez ${safeTitle} sur ${platform} chez GameMart Tunisie.`,
      `Jeu ${genre.toLowerCase()} ${genreProfile.short.split(',')[0]}.`,
      price ? `Prix ${price}.` : '',
      inStock ? 'En stock, livraison rapide.' : 'Disponible sur commande.',
      promo ? 'Promotion en cours.' : ''
    ]
      .filter(Boolean)
      .join(' ');

    const introParagraphs = [
      `${safeTitle} est un jeu ${genre.toLowerCase()} disponible sur ${platform}. ` +
        `Son univers s’articule autour de ${tagsLabel.toLowerCase()}, avec une expérience ${genreProfile.short}. ` +
        `Sur GameMart, la fiche présente le prix en dinars tunisiens, la disponibilité réelle, la note des joueurs et toutes les informations utiles avant l’achat.`,
      `Que vous soyez attiré par ${tags.slice(0, 2).join(' et ') || 'son univers'} ou que vous cherchiez simplement un jeu ${genre.toLowerCase()} complet sur ${platform}, ` +
        `${safeTitle} propose une expérience qui se prend en main progressivement. ` +
        `${releaseYear ? `Sorti en ${releaseYear}, ` : ''}il reste aujourd’hui une référence appréciée des joueurs grâce à son contenu et à sa communauté.`
    ];

    const highlights = [
      ...genreProfile.strengths.slice(0, 3),
      `${platformProfile.experience}`,
      inStock
        ? `Disponible immédiatement chez GameMart${price ? ` à ${price}` : ''}.`
        : 'Disponible sur commande : contactez-nous pour le délai exact.',
      promo ? 'Bénéficiez de la promotion en cours sur cette fiche.' : 'Prix affiché en dinars tunisiens (TND).'
    ];

    const blocks: ProductContentBlock[] = [
      {
        heading: `Pourquoi jouer à ${safeTitle} ?`,
        paragraphs: [
          `${safeTitle} séduit par ${genreProfile.strengths[0] ?? 'une expérience équilibrée'}. ` +
            `Le jeu a été pensé pour offrir une expérience ${genreProfile.short}, sans sacrifier la lisibilité : les objectifs sont clairs, les commandes sont cohérentes et la progression reste gratifiante.`,
          `Sur la durée, ${safeTitle} mise sur ${genreProfile.strengths[1] ?? 'un contenu varié'}. ` +
            `C’est le genre de titre que l’on peut terminer une première fois puis relancer pour explorer d’autres approches, d’autres builds ou d’autres modes de jeu.`
        ]
      },
      {
        heading: `Gameplay et points forts de ${safeTitle}`,
        paragraphs: [
          `Le cœur de l’expérience repose sur ${genreProfile.strengths[2] ?? 'des mécaniques solides et accessibles'}. ` +
            `Chaque session apporte quelque chose de nouveau : une mécanique à maîtriser, un lieu à découvrir ou une situation à résoudre. ` +
            `${tags.length ? `Les thèmes ${tagsLabel.toLowerCase()} donnent au jeu une identité immédiatement reconnaissable.` : ''}`,
          `${genreProfile.strengths[3] ? `Autre point fort : ${genreProfile.strengths[3]}. ` : ''}` +
            `Cette combinaison fait de ${safeTitle} un jeu qui récompense autant la curiosité que la maîtrise. ` +
            `Pour les joueurs pressés, les sessions peuvent rester courtes ; pour les autres, le contenu permet d’y passer de nombreuses heures.`
        ]
      },
      {
        heading: `${safeTitle} sur ${platform} : ce qu’il faut savoir`,
        paragraphs: [
          `Sur ${platform}, ${safeTitle} profite de ${platformProfile.experience.replace(/^sur [^,]+, /i, '')}. ` +
            `L’expérience a été pensée pour rester fluide et lisible, quel que soit votre niveau.`,
          `${platformProfile.advice} ` +
            `Pensez également à vérifier la langue du jeu et les éventuelles mises à jour indiquées sur l’emballage ou la fiche produit avant de finaliser votre commande.`
        ]
      },
      {
        heading: `Acheter ${safeTitle} en Tunisie : prix, stock et livraison`,
        paragraphs: [
          `Chez GameMart, ${safeTitle} est proposé ${price ? `à ${price}` : 'à un prix compétitif'} sur ${platform}. ` +
            `${inStock ? 'Le produit est actuellement en stock, ce qui permet une préparation rapide de la commande.' : 'Le produit est momentanément indisponible en stock : il peut être commandé selon les délais communiqués par notre équipe.'} ` +
            `${promo ? 'Une promotion est active sur cette référence : le prix affiché tient déjà compte de la réduction.' : ''}`,
          `La commande se fait en quelques clics : ajoutez le jeu au panier, choisissez votre adresse de livraison puis validez le paiement sécurisé. ` +
            `Vous pouvez ensuite suivre l’état de votre commande depuis votre espace personnel, dans la rubrique « Mes commandes ». ` +
            `Pour toute question sur la disponibilité ou la livraison en Tunisie, notre équipe vous répond et vous accompagne.`
        ]
      },
      {
        heading: `À qui s’adresse ${safeTitle} ?`,
        paragraphs: [
          `${safeTitle} est particulièrement adapté à ${genreProfile.audience}. ` +
            `Si vous recherchez un jeu ${genre.toLowerCase()} sur ${platform} avec une expérience ${genreProfile.short}, cette référence mérite clairement une place dans votre sélection.`,
          `${stats?.reviewCount ? `Il est déjà noté ${Number(stats.averageRating ?? 0).toFixed(1)}/5 par ${stats.reviewCount} joueur${stats.reviewCount > 1 ? 's' : ''} sur GameMart, ce qui donne un premier aperçu de la satisfaction des acheteurs. ` : ''}` +
            `Consultez les avis en bas de page et les jeux similaires pour comparer avant de faire votre choix.`
        ]
      }
    ];

    const faq: ProductFaqItem[] = [
      {
        question: `Où acheter ${safeTitle} pas cher en Tunisie ?`,
        answer:
          `Sur GameMart, ${safeTitle} est disponible sur la fiche produit ${platform} au prix de ${price || 'notre tarif en dinars tunisiens'}. ` +
          `La fiche indique en temps réel la disponibilité, les promotions et les informations de livraison.`
      },
      {
        question: `Quel est le prix de ${safeTitle} chez GameMart ?`,
        answer:
          `${price ? `${safeTitle} est affiché à ${price}.` : `Le prix de ${safeTitle} est affiché directement sur cette fiche.`} ` +
          `Les prix sont en dinars tunisiens (TND). ${promo ? 'Une promotion est actuellement active.' : 'Surveillez la fiche : des promotions sont régulièrement proposées.'}`
      },
      {
        question: `${safeTitle} est-il disponible sur ${platform} ?`,
        answer:
          `Oui, cette fiche correspond à la version ${platform} de ${safeTitle}. ` +
          `${inStock ? 'Le jeu est en stock et peut être ajouté au panier immédiatement.' : 'Le jeu est disponible sur commande selon les délais indiqués par notre équipe.'}`
      },
      {
        question: `${safeTitle} convient-il aux débutants ?`,
        answer: genreProfile.beginner
      },
      {
        question: `Comment suivre la livraison de ${safeTitle} ?`,
        answer:
          `Après validation de la commande, connectez-vous à votre compte GameMart puis ouvrez « Mes commandes » pour consulter le statut. ` +
          `Vous recevez également une confirmation avec le récapitulatif de votre achat.`
      }
    ];

    const keywords = this.uniqueKeywords([
      title,
      `acheter ${title}`,
      `${title} pas cher`,
      `${title} prix`,
      `${title} Tunisie`,
      `${title} ${platform}`,
      `${title} ${genre}`,
      `jeu ${genre} ${platform}`,
      `jeu ${genre} Tunisie`,
      `jeu ${platform} Tunisie`,
      ...genreProfile.keywords,
      ...platformProfile.keywords,
      ...tags.map((tag) => `jeu ${tag}`),
      'jeux vidéo Tunisie',
      'boutique jeux vidéo en ligne',
      'GameMart Tunisie',
      promo ? `promotion ${title}` : ''
    ]);

    return {
      metaDescription,
      keywords,
      introParagraphs,
      highlights,
      blocks,
      faq
    };
  }

  private uniqueKeywords(values: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];

    for (const value of values) {
      const keyword = (value || '').replace(/\s+/g, ' ').trim();
      if (!keyword) continue;
      const key = normalizeKey(keyword);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(keyword);
    }

    return result;
  }
}
