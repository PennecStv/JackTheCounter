// Text of the three guide pages. The French copy must have exactly the English shape.
import type { Lang } from '@/i18n'

const en = {
  // For each count: what it is for, how to read it, and what to do at each value.
  howTo: {
    hilo: {
      purpose: 'Counting tells you when the cards left in the shoe are rich in tens and aces. That is when you bet more and change a handful of plays; the rest of the time you bet the minimum.',
      read: 'Hi-Lo decides on the true count: the running count divided by the decks left. With one deck, the running count is close enough.',
      countHead: 'True count',
      rows: [
        ['−3 or less', 'Bet the minimum or leave the table. Hit 12 against a 4, 5 or 6, and 13 against a 2 or 3.'],
        ['−2', 'Bet the minimum. Hit 12 against a 4 or 6, and 13 against a 2.'],
        ['−1', 'Bet the minimum. Hit 12 against a 4.'],
        ['0', 'Bet the minimum and play the charts. Without surrender, stand on 16 against a 10.'],
        ['+1', 'Still the minimum: the game is about even. Double 11 against an ace and 9 against a 2.'],
        ['+2', 'Bet 2 units. Stand on 12 against a 3.'],
        ['+3', 'Bet 4 units and take insurance. Stand on 12 against a 2, double 9 against a 7.'],
        ['+4', 'Bet 6 units. Stand on 15 against a 10, double 10 against a 10 or an ace, split tens against a 6.'],
        ['+5 or more', 'Bet 8 units. Stand on 16 against a 9, split tens against a 5.'],
      ],
      note: 'Plays add up: one listed at +3 still applies at +4 and above, one listed at −2 still applies at −3 and below. Where surrender is offered, also see the Fab 4 on the Charts page.',
    },
    ko: {
      purpose: 'The same goal as Hi-Lo, without the division. Sevens count +1, so the count climbs as the shoe is dealt, and the running count alone tells you when to bet more.',
      read: 'Start at 4 − 4 × decks (−4 with 2 decks, −28 with 8) and add each card. The moves below read that running count directly.',
      countHead: 'Running count',
      rows: [
        ['Below the key count', 'Bet the minimum and play the charts.'],
        ['Key count', 'Raise your bet: the edge starts turning yours. The key count is +2 with 1 deck, +1 with 2 decks, −4 with 6 decks and −6 with 8 decks.'],
        ['+3 or more', 'Take insurance.'],
        ['+4 or more', 'The pivot: your edge is about that of a Hi-Lo true count of +4. Bet big.'],
      ],
      note: 'With 3, 4, 5 or 7 decks, use the key count of the next smaller shoe in that list: you raise a little later, which is the safe side.',
    },
    omega: {
      purpose: 'The same goal again, with finer weights: fours to sixes and tens count double, aces count zero. It judges playing decisions better than Hi-Lo, at the cost of harder arithmetic.',
      read: 'Decide on the true count, as with Hi-Lo. Omega II counts in twos, so its true counts run about twice as high as Hi-Lo’s.',
      countHead: 'True count',
      rows: [
        ['+2 or less', 'Bet the minimum and play the charts.'],
        ['+3 or +4', 'Bet 2 units.'],
        ['+5 or +6', 'Bet 4 units.'],
        ['+7 or +8', 'Bet 6 units.'],
        ['+9 or more', 'Bet 8 units.'],
      ],
      note: 'These bets double the Hi-Lo steps as a rule of thumb. For playing deviations use Omega II’s own index tables (Bryce Carlson, Blackjack for Blood), not Hi-Lo’s, and keep a side count of aces: more aces left than usual means bet more.',
    },
  },
  moveHead: 'What to do',

  atLeast: (n: string) => `${n} or more`,
  orLess: (n: string) => `${n} or less`,
  below: (n: string) => `below ${n}`,
  units: (n: number) => `${n} ${n === 1 ? 'unit' : 'units'}`,
  head: {
    upCard: 'Dealer’s up card',
    you: 'You',
    dealer: 'Dealer',
    play: 'Play',
    trueCount: 'True count',
    bet: 'Bet',
    card: 'Card',
    tens: '10 to K',
    fullDeck: 'Full deck',
    insurance: 'Insurance',
  },

  rules: {
    lead: 'Beat the dealer by finishing closer to 21 without going over. You only play against the dealer: the other players at the table never change your result.',
    values: {
      title: 'Card values',
      list: ['Two to ten are worth their number.', 'Jacks, queens and kings are worth 10.', 'An ace is worth 11, or 1 when 11 would take you over 21.'],
    },
    examples: ['Blackjack: 21 in two cards', 'Soft 17: the ace can still drop to 1', 'Hard 17: no ace to fall back on'],
    round: {
      title: 'How a round goes',
      steps: [
        'Everyone bets before the deal.',
        'Each player and the dealer get two cards. The dealer’s first card, the up card, is face up. The second, the hole card, stays face down.',
        'With an ace showing, the dealer offers insurance. With an ace or a ten showing, the dealer checks the hole card. A dealer blackjack ends the round: every hand loses except a player blackjack, which is a push.',
        'Players act one at a time, starting on the dealer’s left.',
        'The dealer turns the hole card over and draws by fixed rules.',
        'Winning bets are paid, losing bets collected.',
      ],
    },
    options: {
      title: 'Your options',
      terms: [
        ['Hit', 'Take another card. Keep hitting until you stand or bust. Signal: tap the table.'],
        ['Stand', 'Keep your total and end your turn. Signal: wave a flat hand over your cards.'],
        ['Double down', 'Double your bet and take exactly one more card. Usually only on your first two cards. Signal: put the extra chips next to your bet.'],
        ['Split', 'Two cards of the same value become two hands, each with its own bet. Split aces usually get one card each. Signal: put the extra chips down and show two fingers.'],
        ['Surrender', 'Give up on your first two cards and get half your bet back. Late surrender comes after the dealer has checked for blackjack. Not every casino offers it, and you say it out loud.'],
        ['Insurance', 'With an ace showing, a side bet of up to half your bet that pays 2 to 1 if the dealer has blackjack. Without a count it loses money; with Hi-Lo, take it at a true count of +3 or more.'],
      ],
    },
    dealer: {
      title: 'The dealer’s rules',
      p: 'The dealer makes no choices: they draw on 16 or less and stand on 17 or more. The felt says what happens on a soft 17.',
      terms: [
        ['S17', 'Dealer stands on all 17s. Better for you.'],
        ['H17', 'Dealer hits soft 17. Costs you about 0.2%.'],
      ],
    },
    payouts: {
      title: 'Payouts',
      terms: [
        ['Win', 'Paid 1 to 1.'],
        ['Blackjack', 'An ace and a ten-value card as your first two cards, paid 3 to 2. After a split it only counts as 21.'],
        ['Push', 'Same total as the dealer: your bet comes back.'],
        ['Bust', 'Over 21 loses at once, even if the dealer busts afterwards. That is the house edge: you act first.'],
        ['Insurance', 'Paid 2 to 1.'],
      ],
    },
    table: {
      title: 'Read the table before you sit',
      list: [
        'Blackjack must pay 3 to 2. Tables paying 6 to 5 add about 1.4% to the house edge: walk past them.',
        'Dealer stands on soft 17, double after split and surrender all help you.',
        'Fewer decks are better, and for counting, so is a deep cut card: look for three quarters of the shoe dealt or more.',
        'A continuous shuffling machine puts the cards back after every round. Counting is useless there.',
      ],
    },
  },

  charts: {
    lead: 'Basic strategy for 4 to 8 decks, dealer stands on soft 17, double after split allowed, late surrender. Learn it before you count: counting only pays when every hand is played right.',
    moves: 'Moves',
    // Letter shown in the charts, then its meaning.
    moveNames: {
      H: ['H', 'Hit'],
      S: ['S', 'Stand'],
      D: ['D', 'Double, otherwise hit'],
      Ds: ['Ds', 'Double, otherwise stand'],
      P: ['P', 'Split'],
      R: ['R', 'Surrender, otherwise hit'],
    },
    plays: { H: 'Hit', S: 'Stand', D: 'Double', P: 'Split', R: 'Surrender', I: 'Take it' },
    hard: 'Hard totals',
    soft: { title: 'Soft totals', p: 'Hands with an ace still counted as 11.' },
    pairs: 'Pairs',
    i18: {
      title: 'The Illustrious 18',
      p: 'The eighteen Hi-Lo plays where the true count overrules the chart, most valuable first. When the count is in range, make the play; otherwise follow the chart.',
    },
    fab4: { title: 'The Fab 4 surrenders', p: 'Where late surrender is offered, check these before the Illustrious 18.' },
    values: { title: 'Count values', p: 'What each card is worth in the three counts you can train here, and what a full deck adds up to.' },
  },

  bible: {
    lead: 'What a counter needs between the first deck and the first real shoe. Blackjack is still gambling: only ever bet money you can afford to lose.',
    why: {
      title: 'Why counting works',
      p: 'A dealt card is gone until the shuffle. When the cards left are rich in tens and aces, the game swings your way:',
      list: [
        'Blackjacks come more often, and you are paid 3 to 2 for yours while the dealer’s only take 1 to 1.',
        'Doubles on 10 and 11 catch a ten more often.',
        'The dealer must draw to 12 through 16, and busts more.',
        'Insurance turns into a good bet once more than a third of the cards left are tens.',
      ],
      end: 'Small cards left do the opposite. A count tracks the balance between the two, one card at a time.',
    },
    edge: {
      title: 'The edge in numbers',
      list: [
        'Perfect basic strategy on a good table leaves the house about 0.5%.',
        'Each point of Hi-Lo true count moves roughly 0.5% to your side.',
        'So the edge turns yours around a true count of +1, and at +5 you are about 2% ahead.',
        'Most of a shoe is played at a count near zero or below. The profit comes from the few rounds where you bet big.',
      ],
    },
    trueCount: {
      title: 'From running count to true count',
      p: 'The running count says how many extra high or low cards are left. The true count says how concentrated they are: divide the running count by the decks still in the shoe, which is the decks in play minus the decks in the discard tray.',
      terms: [
        ['Running count +6, 3 decks left', 'True count +2.'],
        ['Running count +6, 1.5 decks left', 'True count +4: the same six cards matter twice as much.'],
        ['Running count −4, 4 decks left', 'True count −1.'],
      ],
      end: 'Judge the tray to the nearest half deck and round down. In this trainer, anything within one of the exact value counts as right.',
    },
    betting: {
      title: 'Betting your edge',
      p: 'Bet the minimum while the count is low and raise only when the true count says the edge is yours. A common ramp for shoe games, in betting units:',
      end: 'Back-counting, or wonging, goes one step further: count a shoe standing behind the table, sit down when the true count climbs, leave when it drops. Many casinos now forbid joining in the middle of a shoe.',
    },
    bankroll: {
      title: 'Bankroll and swings',
      p: 'A 1% edge is real, but it is small next to the swings: a single hand varies by more than a whole bet. Losing sessions, even losing weeks, are normal when you play perfectly.',
      list: [
        'Keep a separate bankroll and never top it up with money you need.',
        'Counters usually plan on several hundred to a thousand units. With less, an ordinary bad run can wipe you out.',
        'Size your unit to your bankroll, not to the table minimum. If the minimum is too big a share, find a cheaper table.',
      ],
    },
    which: {
      title: 'Which count?',
      terms: [
        ['Hi-Lo', 'Balanced and level one: every card is +1, 0 or −1. The most studied count, and the one the index plays on the Charts page are built for. Start here.'],
        ['KO', 'Hi-Lo with sevens at +1, so a deck adds up to +4 instead of 0, which spares you the true count: you bet on the running count alone. The count starts at 4 − 4 × decks (−20 for six decks), as in the KO book, so that +4 means about the same edge in any shoe; raise your bet from the key count.'],
        ['Omega II', 'Balanced and level two: fours to sixes are +2, tens −2, aces 0. It plays hands more accurately than Hi-Lo, but it is harder to keep at speed and needs a side count of aces to bet as well.'],
      ],
    },
    practise: {
      title: 'How to practise',
      steps: [
        'Learn basic strategy until every cell of the charts is automatic.',
        'Count down a single deck one card at a time, ending on 0 (+4 for KO), in under 30 seconds.',
        'Count cards in pairs. In Hi-Lo a high card and a low card cancel, so you only add what is left.',
        'Clear the antes here from one deck to eight, then raise the speed to ×2 and ×3.',
        'Learn the index plays a few at a time, starting with insurance and 16 against a 10.',
        'Practise with noise around you. A casino is loud, and nobody waits for you to finish counting.',
      ],
    },
    welcome: {
      title: 'Staying welcome',
      list: [
        'Counting in your head is legal in most places, but a casino is private property: it can limit your bets, shuffle early or ask you to leave.',
        'Using a device to count is a crime in many places, Nevada included.',
        'Move your bets smoothly, chat, and never stare at the cards. A bet that jumps from one unit to eight right after a run of small cards is the first thing the pit looks for.',
      ],
    },
  },
}

const fr: typeof en = {
  howTo: {
    hilo: {
      purpose: 'Compter te dit quand les cartes qui restent dans le sabot sont riches en dix et en as. C’est là que tu mises plus et que tu changes quelques coups ; le reste du temps, tu mises le minimum.',
      read: 'Hi-Lo se décide au compte réel : le compte courant divisé par le nombre de jeux restants. Avec un seul jeu, le compte courant suffit.',
      countHead: 'Compte réel',
      rows: [
        ['−3 ou moins', 'Mise le minimum ou quitte la table. Tire sur 12 contre un 4, 5 ou 6, et sur 13 contre un 2 ou 3.'],
        ['−2', 'Mise le minimum. Tire sur 12 contre un 4 ou 6, et sur 13 contre un 2.'],
        ['−1', 'Mise le minimum. Tire sur 12 contre un 4.'],
        ['0', 'Mise le minimum et suis les tableaux. Sans abandon, reste sur 16 contre un 10.'],
        ['+1', 'Toujours le minimum : le jeu est à peu près équilibré. Double 11 contre un as et 9 contre un 2.'],
        ['+2', 'Mise 2 unités. Reste sur 12 contre un 3.'],
        ['+3', 'Mise 4 unités et prends l’assurance. Reste sur 12 contre un 2, double 9 contre un 7.'],
        ['+4', 'Mise 6 unités. Reste sur 15 contre un 10, double 10 contre un 10 ou un as, sépare les dix contre un 6.'],
        ['+5 ou plus', 'Mise 8 unités. Reste sur 16 contre un 9, sépare les dix contre un 5.'],
      ],
      note: 'Les coups s’additionnent : un coup indiqué à +3 vaut aussi à +4 et au-delà, un coup indiqué à −2 vaut aussi à −3 et en dessous. Si l’abandon est proposé, vois aussi les Fab 4 dans les Tableaux.',
    },
    ko: {
      purpose: 'Le même but que Hi-Lo, sans division. Les sept valent +1, donc le compte monte au fil du sabot, et le compte courant suffit à dire quand miser plus.',
      read: 'Pars de 4 − 4 × jeux (−4 avec 2 jeux, −28 avec 8) et ajoute chaque carte. Les coups ci-dessous se lisent directement sur ce compte courant.',
      countHead: 'Compte courant',
      rows: [
        ['Sous le compte clé', 'Mise le minimum et suis les tableaux.'],
        ['Compte clé', 'Augmente ta mise : l’avantage commence à passer de ton côté. Le compte clé vaut +2 avec 1 jeu, +1 avec 2 jeux, −4 avec 6 jeux et −6 avec 8 jeux.'],
        ['+3 ou plus', 'Prends l’assurance.'],
        ['+4 ou plus', 'Le pivot : ton avantage vaut à peu près celui d’un compte réel Hi-Lo de +4. Mise gros.'],
      ],
      note: 'Avec 3, 4, 5 ou 7 jeux, prends le compte clé du sabot juste en dessous dans cette liste : tu augmentes un peu plus tard, ce qui est le côté prudent.',
    },
    omega: {
      purpose: 'Toujours le même but, avec des poids plus fins : les quatre à six et les dix comptent double, les as comptent zéro. Il juge mieux les décisions de jeu que Hi-Lo, au prix d’un calcul plus difficile.',
      read: 'Décide au compte réel, comme en Hi-Lo. Omega II compte par deux, donc ses comptes réels montent à peu près deux fois plus haut que ceux de Hi-Lo.',
      countHead: 'Compte réel',
      rows: [
        ['+2 ou moins', 'Mise le minimum et suis les tableaux.'],
        ['+3 ou +4', 'Mise 2 unités.'],
        ['+5 ou +6', 'Mise 4 unités.'],
        ['+7 ou +8', 'Mise 6 unités.'],
        ['+9 ou plus', 'Mise 8 unités.'],
      ],
      note: 'Ces mises doublent les paliers de Hi-Lo, c’est une règle approximative. Pour les écarts de jeu, utilise les tables propres à Omega II (Bryce Carlson, Blackjack for Blood), pas celles de Hi-Lo, et tiens un compte séparé des as : s’il en reste plus que d’habitude, mise davantage.',
    },
  },
  moveHead: 'Que faire',

  atLeast: (n) => `${n} ou plus`,
  orLess: (n) => `${n} ou moins`,
  below: (n) => `sous ${n}`,
  units: (n) => `${n} ${n === 1 ? 'unité' : 'unités'}`,
  head: {
    upCard: 'Carte visible du croupier',
    you: 'Toi',
    dealer: 'Croupier',
    play: 'Coup',
    trueCount: 'Compte réel',
    bet: 'Mise',
    card: 'Carte',
    tens: '10 à K',
    fullDeck: 'Jeu complet',
    insurance: 'Assurance',
  },

  rules: {
    lead: 'Bats le croupier en finissant plus près de 21 que lui, sans dépasser. Tu ne joues que contre le croupier : les autres joueurs de la table ne changent jamais ton résultat.',
    values: {
      title: 'Valeur des cartes',
      list: ['Du deux au dix, chaque carte vaut son chiffre.', 'Valets, dames et rois valent 10.', 'L’as vaut 11, ou 1 si 11 te ferait dépasser 21.'],
    },
    examples: ['Blackjack : 21 en deux cartes', '17 souple : l’as peut encore redescendre à 1', '17 dur : pas d’as pour se rattraper'],
    round: {
      title: 'Déroulé d’une manche',
      steps: [
        'Tout le monde mise avant la distribution.',
        'Chaque joueur et le croupier reçoivent deux cartes. La première carte du croupier, la carte visible, est face visible. La seconde, la carte cachée, reste face cachée.',
        'Avec un as visible, le croupier propose l’assurance. Avec un as ou un dix visible, il vérifie sa carte cachée. Un blackjack du croupier termine la manche : toutes les mains perdent, sauf un blackjack du joueur, qui fait égalité.',
        'Les joueurs jouent chacun leur tour, en commençant à la gauche du croupier.',
        'Le croupier retourne sa carte cachée et tire selon des règles fixes.',
        'Les mises gagnantes sont payées, les perdantes ramassées.',
      ],
    },
    options: {
      title: 'Tes options',
      terms: [
        ['Tirer', 'Prendre une carte de plus. Tu peux tirer jusqu’à rester ou sauter. Geste : tapote la table.'],
        ['Rester', 'Garder ton total et finir ton tour. Geste : passe la main à plat au-dessus de tes cartes.'],
        ['Doubler', 'Doubler ta mise et recevoir exactement une carte de plus. En général seulement sur tes deux premières cartes. Geste : pose les jetons supplémentaires à côté de ta mise.'],
        ['Séparer (split)', 'Deux cartes de même valeur deviennent deux mains, chacune avec sa mise. Les as séparés ne reçoivent souvent qu’une carte chacun. Geste : pose les jetons et montre deux doigts.'],
        ['Abandonner', 'Renoncer sur tes deux premières cartes et récupérer la moitié de ta mise. L’abandon tardif se fait après que le croupier a vérifié son blackjack. Tous les casinos ne le proposent pas, et ça se dit à voix haute.'],
        ['Assurance', 'Avec un as visible, un pari annexe d’au plus la moitié de ta mise, payé 2 contre 1 si le croupier a blackjack. Sans comptage, c’est un pari perdant ; avec Hi-Lo, prends-la à partir d’un compte réel de +3.'],
      ],
    },
    dealer: {
      title: 'Les règles du croupier',
      p: 'Le croupier n’a aucun choix : il tire jusqu’à 16 et reste à partir de 17. Le tapis indique ce qu’il fait sur un 17 souple.',
      terms: [
        ['S17', 'Le croupier reste sur tous les 17. Mieux pour toi.'],
        ['H17', 'Le croupier tire sur 17 souple. Ça te coûte environ 0,2 %.'],
      ],
    },
    payouts: {
      title: 'Paiements',
      terms: [
        ['Gain', 'Payé 1 contre 1.'],
        ['Blackjack', 'Un as et une carte de valeur 10 en deux premières cartes, payé 3 contre 2. Après un split, ça ne compte que comme 21.'],
        ['Égalité', 'Même total que le croupier : ta mise t’est rendue.'],
        ['Sauter', 'Au-delà de 21, tu perds tout de suite, même si le croupier saute ensuite. C’est ça, l’avantage de la maison : tu joues en premier.'],
        ['Assurance', 'Payée 2 contre 1.'],
      ],
    },
    table: {
      title: 'Lis la table avant de t’asseoir',
      list: [
        'Le blackjack doit payer 3 contre 2. Les tables à 6 contre 5 ajoutent environ 1,4 % à l’avantage de la maison : passe ton chemin.',
        'Un croupier qui reste sur 17 souple, le double après split et l’abandon jouent tous en ta faveur.',
        'Moins il y a de jeux, mieux c’est, et pour compter, une carte de coupe profonde aussi : vise au moins les trois quarts du sabot distribués.',
        'Un mélangeur continu remet les cartes après chaque manche. Compter n’y sert à rien.',
      ],
    },
  },

  charts: {
    lead: 'Stratégie de base pour 4 à 8 jeux, croupier qui reste sur 17 souple, double après split autorisé, abandon tardif. Apprends-la avant de compter : le comptage ne rapporte que si chaque main est bien jouée.',
    moves: 'Les coups',
    moveNames: {
      H: ['T', 'Tirer'],
      S: ['R', 'Rester'],
      D: ['D', 'Doubler, sinon tirer'],
      Ds: ['Dr', 'Doubler, sinon rester'],
      P: ['S', 'Séparer'],
      R: ['A', 'Abandonner, sinon tirer'],
    },
    plays: { H: 'Tirer', S: 'Rester', D: 'Doubler', P: 'Séparer', R: 'Abandonner', I: 'La prendre' },
    hard: 'Totaux durs',
    soft: { title: 'Totaux souples', p: 'Mains avec un as qui compte encore pour 11.' },
    pairs: 'Paires',
    i18: {
      title: 'Les Illustrious 18',
      p: 'Les dix-huit écarts Hi-Lo où le compte réel l’emporte sur le tableau, du plus rentable au moins rentable. Quand le compte est dans la zone, joue le coup indiqué ; sinon, suis le tableau.',
    },
    fab4: { title: 'Les Fab 4 (abandons)', p: 'Là où l’abandon tardif est proposé, vérifie-les avant les Illustrious 18.' },
    values: { title: 'Valeurs de comptage', p: 'Ce que vaut chaque carte dans les trois comptages que tu peux travailler ici, et le total d’un jeu complet.' },
  },

  bible: {
    lead: 'Tout ce qu’il faut à un compteur entre son premier jeu de cartes et son premier vrai sabot. Le blackjack reste un jeu d’argent : ne mise jamais plus que ce que tu peux te permettre de perdre.',
    why: {
      title: 'Pourquoi le comptage marche',
      p: 'Une carte distribuée ne revient pas avant le mélange. Quand il reste beaucoup de dix et d’as, le jeu penche de ton côté :',
      list: [
        'Les blackjacks tombent plus souvent, et les tiens sont payés 3 contre 2 alors que ceux du croupier ne te coûtent que ta mise.',
        'Les doubles sur 10 et 11 attrapent plus souvent un dix.',
        'Le croupier doit tirer de 12 à 16, et saute plus souvent.',
        'L’assurance devient un bon pari dès que plus d’un tiers des cartes restantes sont des dix.',
      ],
      end: 'Quand il reste surtout des petites cartes, c’est l’inverse. Un comptage suit l’équilibre entre les deux, carte après carte.',
    },
    edge: {
      title: 'L’avantage en chiffres',
      list: [
        'Avec une stratégie de base parfaite sur une bonne table, la maison garde environ 0,5 %.',
        'Chaque point de compte réel Hi-Lo fait passer environ 0,5 % de ton côté.',
        'L’avantage bascule donc vers toi autour d’un compte réel de +1, et à +5 tu as environ 2 % d’avance.',
        'L’essentiel d’un sabot se joue avec un compte proche de zéro ou négatif. Le gain vient des quelques manches où tu mises gros.',
      ],
    },
    trueCount: {
      title: 'Du compte courant au compte réel',
      p: 'Le compte courant dit combien de grosses ou de petites cartes restent en trop. Le compte réel dit à quel point elles sont concentrées : divise le compte courant par le nombre de jeux encore dans le sabot, c’est-à-dire le nombre total de jeux moins ceux déjà dans le bac de défausse.',
      terms: [
        ['Compte courant +6, 3 jeux restants', 'Compte réel +2.'],
        ['Compte courant +6, 1,5 jeu restant', 'Compte réel +4 : les mêmes six cartes pèsent deux fois plus.'],
        ['Compte courant −4, 4 jeux restants', 'Compte réel −1.'],
      ],
      end: 'Estime le bac au demi-jeu près et arrondis vers le bas. Dans cet entraîneur, toute réponse à moins de 1 de la valeur exacte est acceptée.',
    },
    betting: {
      title: 'Miser selon ton avantage',
      p: 'Mise le minimum tant que le compte est bas, et n’augmente que quand le compte réel dit que l’avantage est à toi. Une progression courante pour les sabots, en unités de mise :',
      end: 'Le back-counting, ou wonging, va plus loin : compte un sabot debout derrière la table, assieds-toi quand le compte réel monte, pars quand il baisse. Beaucoup de casinos interdisent maintenant de rejoindre une table en cours de sabot.',
    },
    bankroll: {
      title: 'Bankroll et variance',
      p: 'Un avantage de 1 % est réel, mais il est minuscule face aux écarts : une seule main varie de plus d’une mise entière. Les sessions perdantes, et même les semaines perdantes, sont normales quand tu joues parfaitement.',
      list: [
        'Garde une bankroll séparée et ne la renfloue jamais avec de l’argent dont tu as besoin.',
        'Les compteurs prévoient en général de plusieurs centaines à mille unités. En dessous, une mauvaise série ordinaire peut tout emporter.',
        'Fixe ton unité d’après ta bankroll, pas d’après le minimum de la table. Si le minimum en représente une trop grosse part, trouve une table moins chère.',
      ],
    },
    which: {
      title: 'Quel comptage choisir ?',
      terms: [
        ['Hi-Lo', 'Équilibré et de niveau un : chaque carte vaut +1, 0 ou −1. Le comptage le plus étudié, et celui pour lequel sont calculés les écarts de la page Tableaux. Commence par lui.'],
        ['KO', 'Hi-Lo avec les sept à +1 : un jeu fait +4 au lieu de 0, ce qui t’épargne le compte réel. Tu mises sur le compte courant seul. Le compte part de 4 − 4 × jeux (−20 pour six jeux), comme dans le livre KO, pour que +4 donne à peu près le même avantage quel que soit le sabot ; augmente ta mise à partir du compte clé.'],
        ['Omega II', 'Équilibré et de niveau deux : les quatre à six valent +2, les dix −2, les as 0. Il joue les mains plus précisément que Hi-Lo, mais il est plus dur à tenir à vitesse réelle et demande un compte séparé des as pour bien miser.'],
      ],
    },
    practise: {
      title: 'Comment s’entraîner',
      steps: [
        'Apprends la stratégie de base jusqu’à ce que chaque case des tableaux soit automatique.',
        'Compte un jeu entier carte par carte et termine sur le bon total (0, ou +4 en KO) en moins de 30 secondes.',
        'Compte les cartes par paires. En Hi-Lo, une grosse et une petite carte s’annulent : tu n’ajoutes que ce qui reste.',
        'Termine les antes ici, d’un jeu à huit, puis monte la vitesse à ×2 et ×3.',
        'Apprends les écarts quelques-uns à la fois, en commençant par l’assurance et 16 contre un 10.',
        'Entraîne-toi avec du bruit autour de toi. Un casino est bruyant, et personne n’attend que tu aies fini de compter.',
      ],
    },
    welcome: {
      title: 'Rester le bienvenu',
      list: [
        'Compter de tête est légal presque partout, mais un casino est une propriété privée : il peut limiter tes mises, mélanger plus tôt ou te demander de partir.',
        'Utiliser un appareil pour compter est un délit dans beaucoup d’endroits, dont le Nevada.',
        'Fais évoluer tes mises en douceur, discute, et ne fixe jamais les cartes. Une mise qui passe d’une à huit unités juste après une série de petites cartes, c’est la première chose que surveille le casino.',
      ],
    },
  },
}

export const COPY: Record<Lang, typeof en> = { en, fr }
