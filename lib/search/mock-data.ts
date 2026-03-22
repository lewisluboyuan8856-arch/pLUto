import { DEFAULT_FILTERS } from "@/lib/constants";
import { scoreArticles } from "@/lib/search/ranker";
import type {
  QueryRewrite,
  ResearchArticle,
  SearchFilters,
  SearchResponse
} from "@/lib/types";

type MockScenario = {
  id: string;
  label: string;
  prompt: string;
  matchTerms: string[];
  rewrite: QueryRewrite;
  featuredArticleIds: string[];
};

export const MOCK_ARTICLES: ResearchArticle[] = [
  {
    id: "mock-urban-greening-meta",
    externalIds: { doi: "10.1000/mock.2024.101" },
    title: "Cooling Dense Cities with Trees: A Meta-analysis of Urban Greening Interventions and Heat Island Intensity",
    authors: ["Natalie Goh", "Ian Mercer", "Farah Idris"],
    year: 2024,
    journal: "Urban Climate Review",
    abstract:
      "This meta-analysis synthesizes 61 studies on tree canopies, parks, green roofs, and mixed blue-green infrastructure in high-density districts. Urban greening reduced land-surface temperature most consistently when interventions combined shade, evapotranspiration, and reflective materials near pedestrian corridors.",
    url: "https://example.org/articles/cooling-dense-cities",
    pdfUrl: "https://example.org/articles/cooling-dense-cities.pdf",
    isOpenAccess: true,
    isReviewArticle: true,
    citationCount: 84,
    source: "Mock",
    concepts: ["urban greening", "heat island", "tree canopy", "dense cities"],
    relevanceScore: 93,
    studentFitScore: 89,
    recencyScore: 95,
    whyRelevant:
      "This is the best starting point for students because it compares multiple greening strategies and gives broad evidence they can cite with confidence.",
    plainEnglishSummary:
      "Across many cities, greenery cools built-up areas most when it adds shade close to where people walk and live, not just when it increases green space on paper.",
    difficulty: "Accessible",
    tags: ["Meta-analysis", "Open access", "Recent"],
    limitations: [
      "Cooling effects vary by climate zone and how studies measure temperature.",
      "The paper compares interventions with different implementation scales."
    ],
    keyFindings: [
      "Tree canopy and mixed blue-green designs produced the strongest neighborhood cooling.",
      "Cooling benefits were larger in compact districts with low existing vegetation."
    ],
    suggestedUses: [
      "Use it in the introduction to define the overall evidence base.",
      "Pair it with one city case study for a stronger evaluation paragraph."
    ],
    followUpTerms: [
      "street canyon shading thermal comfort",
      "urban canopy density heat mitigation"
    ]
  },
  {
    id: "mock-street-tree-cooling",
    externalIds: { doi: "10.1000/mock.2023.102" },
    title: "Street Trees, Shade, and Surface Temperature in High-Rise Neighborhoods: Evidence from Singapore and Hong Kong",
    authors: ["Melissa Tan", "Kai Leung"],
    year: 2023,
    journal: "Cities and Sustainability",
    abstract:
      "Using satellite imagery, mobile sensors, and pedestrian-level observations, this study compares surface temperature and perceived heat across dense high-rise districts. Streets with continuous tree shade recorded lower afternoon temperatures and improved thermal comfort even where overall green cover remained modest.",
    url: "https://example.org/articles/street-tree-cooling",
    isOpenAccess: true,
    isReviewArticle: false,
    citationCount: 46,
    source: "Mock",
    concepts: ["street trees", "thermal comfort", "surface temperature", "high-density housing"],
    relevanceScore: 89,
    studentFitScore: 87,
    recencyScore: 90,
    whyRelevant:
      "This paper helps students move from broad claims to a concrete city comparison with measurable temperature effects.",
    plainEnglishSummary:
      "The study shows that where trees are placed matters a lot. Shaded walking routes can cool daily urban experience even if a neighborhood is still very built up overall.",
    difficulty: "Accessible",
    tags: ["Case study", "Open access"],
    limitations: [
      "Findings come from humid Asian cities and may not transfer directly to dry climates.",
      "Perceived comfort depends on wind and humidity as well as shade."
    ],
    keyFindings: [
      "Continuous street shade lowered peak afternoon surface temperature.",
      "Residents reported better comfort on routes with consistent canopy cover."
    ],
    suggestedUses: [
      "Use it to support a paragraph about design quality rather than green quantity alone.",
      "Compare it with a broader review when discussing transferability."
    ],
    followUpTerms: [
      "pedestrian thermal comfort shaded streets",
      "high-rise neighborhood canopy planning"
    ]
  },
  {
    id: "mock-green-roofs-compact-cities",
    externalIds: { doi: "10.1000/mock.2022.103" },
    title: "Pocket Parks vs Green Roofs: Comparative Heat Mitigation Across Compact Urban Districts",
    authors: ["Josephine Reid", "Arun Kannan", "Wei Min"],
    year: 2022,
    journal: "Journal of Environmental Design",
    abstract:
      "This comparative study examines how pocket parks and green roofs influence daytime heat in compact districts with limited available land. Pocket parks improved nearby pedestrian cooling more strongly, while green roofs reduced rooftop heat loads and building-level temperature stress.",
    url: "https://example.org/articles/pocket-parks-green-roofs",
    isOpenAccess: false,
    isReviewArticle: false,
    citationCount: 39,
    source: "Mock",
    concepts: ["green roofs", "pocket parks", "compact districts", "heat mitigation"],
    relevanceScore: 82,
    studentFitScore: 79,
    recencyScore: 78,
    whyRelevant:
      "Useful for students comparing which urban-greening intervention works best in land-constrained cities.",
    plainEnglishSummary:
      "Small parks cool people more directly at street level, but green roofs still help by lowering heat absorbed by buildings. The best choice depends on the question being asked.",
    difficulty: "Intermediate",
    tags: ["Comparative study"],
    limitations: [
      "Different districts had different building forms and traffic levels.",
      "The study focuses on daytime effects more than night-time cooling."
    ],
    keyFindings: [
      "Pocket parks improved pedestrian-level cooling more than green roofs.",
      "Green roofs still reduced heat stress on exposed building surfaces."
    ],
    suggestedUses: [
      "Use it when evaluating tradeoffs between different greening strategies.",
      "Helpful for a discussion section on policy priorities in dense cities."
    ],
    followUpTerms: [
      "green roof albedo compact city cooling",
      "pocket parks urban microclimate"
    ]
  },
  {
    id: "mock-crispr-ethics-food-security",
    externalIds: { doi: "10.1000/mock.2024.201" },
    title: "CRISPR Crops and Food Security: Ethical Trade-offs in Precision Agriculture",
    authors: ["Alicia Menon", "Thomas Reed", "Priya Nair"],
    year: 2024,
    journal: "Ethics in Bioscience",
    abstract:
      "This review explores how gene-edited crops are framed in debates about sustainability, yield resilience, and food access. It highlights tensions between promising climate-adaptation benefits and concerns about governance, corporate control, ecological uncertainty, and public trust.",
    url: "https://example.org/articles/crispr-food-security-ethics",
    pdfUrl: "https://example.org/articles/crispr-food-security-ethics.pdf",
    isOpenAccess: true,
    isReviewArticle: true,
    citationCount: 53,
    source: "Mock",
    concepts: ["CRISPR", "food security", "agriculture ethics", "governance"],
    relevanceScore: 91,
    studentFitScore: 88,
    recencyScore: 94,
    whyRelevant:
      "This paper is strong for essay questions because it maps both benefits and ethical concerns instead of arguing from only one side.",
    plainEnglishSummary:
      "Gene-edited crops may help food systems adapt, but the paper argues that fairness, regulation, and public trust matter just as much as the science itself.",
    difficulty: "Accessible",
    tags: ["Review article", "Open access", "Recent"],
    limitations: [
      "It is a conceptual review rather than a primary field study.",
      "The paper covers multiple regions with very different regulatory systems."
    ],
    keyFindings: [
      "Food-security benefits are often strongest in arguments about climate resilience.",
      "Public trust depends heavily on transparent regulation and ownership structures."
    ],
    suggestedUses: [
      "Use it to structure both sides of an ethics paragraph.",
      "Helpful as a bridge between science benefits and policy evaluation."
    ],
    followUpTerms: [
      "gene editing governance agriculture",
      "public trust precision breeding"
    ]
  },
  {
    id: "mock-gene-editing-public-trust",
    externalIds: { doi: "10.1000/mock.2023.202" },
    title: "Who Benefits from Gene Editing? Public Trust and Fairness Perceptions in Agricultural Biotechnology",
    authors: ["Helena Brooks", "Yusuf Rahman"],
    year: 2023,
    journal: "Public Understanding of Science",
    abstract:
      "Survey and focus-group data from students, consumers, and farmers are used to examine how people judge gene editing in food systems. Fairness concerns were shaped less by technical understanding alone and more by who controlled patents, access, and long-term monitoring.",
    url: "https://example.org/articles/gene-editing-public-trust",
    isOpenAccess: true,
    isReviewArticle: false,
    citationCount: 28,
    source: "Mock",
    concepts: ["public trust", "fairness", "agricultural biotechnology", "consumer attitudes"],
    relevanceScore: 86,
    studentFitScore: 85,
    recencyScore: 88,
    whyRelevant:
      "This gives students real evidence about how ethics debates play out in public opinion, not just in theory.",
    plainEnglishSummary:
      "People were more comfortable with gene editing when benefits felt shared fairly and when regulation looked independent, transparent, and long term.",
    difficulty: "Accessible",
    tags: ["Mixed methods", "Open access"],
    limitations: [
      "Attitudes can change quickly with media coverage and political context.",
      "Survey participants may not represent all farming communities."
    ],
    keyFindings: [
      "Perceived fairness shaped support more strongly than technical knowledge alone.",
      "Patent concentration reduced trust even among people who saw possible benefits."
    ],
    suggestedUses: [
      "Use it to support an argument about ethics beyond pure safety concerns.",
      "Compare it with a policy paper for stronger evaluation."
    ],
    followUpTerms: [
      "biotech fairness perception food systems",
      "consumer trust gene edited crops"
    ]
  },
  {
    id: "mock-editing-governance-comparative",
    externalIds: { doi: "10.1000/mock.2021.203" },
    title: "Regulating Precision Breeding: A Comparative Analysis of Gene-Editing Governance in Agriculture",
    authors: ["Sonia Velasquez", "Martin Koh"],
    year: 2021,
    journal: "Global Food Policy",
    abstract:
      "This policy analysis compares how countries classify and regulate agricultural gene editing, including distinctions between transgenic modification and targeted edits without foreign DNA. The study argues that regulatory clarity affects innovation speed, public legitimacy, and cross-border trade.",
    url: "https://example.org/articles/gene-editing-governance",
    isOpenAccess: false,
    isReviewArticle: false,
    citationCount: 64,
    source: "Mock",
    concepts: ["gene editing regulation", "precision breeding", "policy analysis", "trade"],
    relevanceScore: 80,
    studentFitScore: 73,
    recencyScore: 72,
    whyRelevant:
      "Best for students who need a policy dimension or want to compare how ethics translate into regulation.",
    plainEnglishSummary:
      "Different countries treat gene editing very differently, and that changes how quickly products move from labs to farms and markets.",
    difficulty: "Intermediate",
    tags: ["Policy analysis"],
    limitations: [
      "Regulations can change quickly as technologies and court rulings evolve.",
      "The paper focuses more on governance than on biological outcomes."
    ],
    keyFindings: [
      "Regulatory uncertainty slows agricultural adoption and weakens public confidence.",
      "Policy frameworks differ most in how they classify non-transgenic edits."
    ],
    suggestedUses: [
      "Use it to compare national responses in a discussion or evaluation section.",
      "Helpful when your research question includes governance or policy implications."
    ],
    followUpTerms: [
      "precision breeding policy comparison",
      "non transgenic gene editing regulation"
    ]
  },
  {
    id: "mock-social-media-attention-review",
    externalIds: { doi: "10.1000/mock.2024.001" },
    title: "Social Media Use and Adolescent Attention: A Systematic Review of Cognitive Outcomes",
    authors: ["Rachel Lim", "David Peters", "Amira Hasan"],
    year: 2024,
    journal: "Journal of Adolescent Learning Sciences",
    abstract:
      "This review synthesizes evidence on how social media multitasking, notification exposure, and compulsive checking behaviors relate to adolescent attention span and executive control. Across 48 studies, effects are stronger for heavy multitaskers and during developmental periods with higher academic pressure.",
    url: "https://example.org/articles/social-media-attention-review",
    pdfUrl: "https://example.org/articles/social-media-attention-review.pdf",
    isOpenAccess: true,
    isReviewArticle: true,
    citationCount: 62,
    source: "Mock",
    concepts: ["adolescents", "attention", "social media", "executive function"],
    relevanceScore: 92,
    studentFitScore: 90,
    recencyScore: 90,
    whyRelevant:
      "This review is directly aligned with the topic and gives a strong evidence base students can cite for both mechanisms and overall trends.",
    plainEnglishSummary:
      "The paper says social media does not affect all students equally. The biggest attention problems appear when students constantly switch tasks or respond to notifications while studying.",
    difficulty: "Accessible",
    tags: ["Review article", "Open access", "Recent"],
    limitations: [
      "Many underlying studies are correlational rather than experimental.",
      "Effects vary depending on how attention is measured."
    ],
    keyFindings: [
      "Frequent multitasking predicts weaker sustained attention.",
      "Notification-heavy environments reduce performance on focused tasks."
    ],
    suggestedUses: [
      "Use as a foundation source in an introduction or literature review.",
      "Quote it when comparing broad trends with individual experimental studies."
    ],
    followUpTerms: [
      "notification interruption executive function",
      "teenage multitasking attention control"
    ]
  },
  {
    id: "mock-classroom-phone-study",
    externalIds: { doi: "10.1000/mock.2023.007" },
    title: "Mobile Phone Availability and Sustained Attention in Classroom Simulation Tasks",
    authors: ["Leah Wong", "Mikael Jensen"],
    year: 2023,
    journal: "Computers & Education Research",
    abstract:
      "In a simulated classroom environment, undergraduate and late-secondary students completed sustained attention tasks with and without smartphone access. Students with visible devices performed worse even when they did not actively use them.",
    url: "https://example.org/articles/mobile-phone-availability",
    isOpenAccess: true,
    isReviewArticle: false,
    citationCount: 31,
    source: "Mock",
    concepts: ["classroom attention", "phone availability", "students"],
    relevanceScore: 87,
    studentFitScore: 86,
    recencyScore: 80,
    whyRelevant:
      "This is useful if the student wants a concrete experimental study showing how devices affect attention during learning tasks.",
    plainEnglishSummary:
      "Even having a phone nearby made students less focused. The paper suggests part of the distraction comes from mental effort spent resisting the phone, not only from active scrolling.",
    difficulty: "Accessible",
    tags: ["Open access", "Experimental study"],
    limitations: [
      "Simulated tasks are not identical to real classroom behavior.",
      "Short study duration may understate longer-term habits."
    ],
    keyFindings: [
      "Visible phones reduced sustained attention scores.",
      "Students reported greater task switching urges when devices were nearby."
    ],
    suggestedUses: [
      "Use as supporting evidence in a paragraph on study conditions.",
      "Pair with a broader review article for stronger argument balance."
    ],
    followUpTerms: [
      "device proximity cognitive load students",
      "smartphone presence study performance"
    ]
  },
  {
    id: "mock-screen-time-meta",
    externalIds: { doi: "10.1000/mock.2022.014" },
    title: "Screen Time, Sleep, and Learning Readiness: A Meta-analysis for School-age Learners",
    authors: ["Arjun Patel", "Nina Romero", "Grace Chua"],
    year: 2022,
    journal: "Educational Psychology Review",
    abstract:
      "This meta-analysis examines how screen time affects sleep quality and next-day learning readiness in school-age populations. It highlights indirect pathways linking digital media habits to poorer concentration and classroom functioning.",
    url: "https://example.org/articles/screen-time-meta",
    isOpenAccess: false,
    isReviewArticle: true,
    citationCount: 118,
    source: "Mock",
    concepts: ["screen time", "sleep", "learning readiness"],
    relevanceScore: 84,
    studentFitScore: 82,
    recencyScore: 70,
    whyRelevant:
      "This source is valuable when the topic needs a wider explanation for why social media may affect attention indirectly through sleep and readiness to learn.",
    plainEnglishSummary:
      "The paper argues that some attention problems come from poor sleep patterns caused by heavy screen use, not just from distraction during study itself.",
    difficulty: "Intermediate",
    tags: ["Meta-analysis", "High citation count"],
    limitations: [
      "Combines multiple types of screen exposure, not only social media.",
      "Some studies use self-reported sleep data."
    ],
    keyFindings: [
      "Higher evening screen time is linked to poorer sleep quality.",
      "Poorer sleep predicts lower attention and classroom readiness."
    ],
    suggestedUses: [
      "Use for a causal chain paragraph connecting habits to learning outcomes.",
      "Helpful for evaluation because it covers indirect mechanisms."
    ],
    followUpTerms: [
      "digital media sleep adolescent cognition",
      "learning readiness screen exposure"
    ]
  },
  {
    id: "mock-microplastic-trophic-review",
    externalIds: { doi: "10.1000/mock.2024.301" },
    title: "Microplastics Through Marine Food Webs: A Review of Trophic Transfer Evidence",
    authors: ["Shreya Bose", "Daniel Fischer", "Mariam Ong"],
    year: 2024,
    journal: "Marine Pollution Perspectives",
    abstract:
      "This review evaluates evidence on how microplastics move through marine food webs, from plankton and filter feeders to predators consumed by humans. The authors compare laboratory and field evidence and emphasize that transfer is influenced by particle size, prey choice, and local contamination patterns.",
    url: "https://example.org/articles/microplastic-trophic-review",
    pdfUrl: "https://example.org/articles/microplastic-trophic-review.pdf",
    isOpenAccess: true,
    isReviewArticle: true,
    citationCount: 71,
    source: "Mock",
    concepts: ["microplastics", "marine food webs", "trophic transfer", "bioaccumulation"],
    relevanceScore: 92,
    studentFitScore: 88,
    recencyScore: 94,
    whyRelevant:
      "This is the clearest entry point for narrow research on marine food chains because it summarizes both mechanisms and evidence gaps.",
    plainEnglishSummary:
      "Microplastics can move up food chains, but the pattern is not identical in every species or ecosystem. The strongest evidence often comes from specific particles and feeding relationships.",
    difficulty: "Accessible",
    tags: ["Review article", "Open access", "Recent"],
    limitations: [
      "Many studies still use laboratory concentrations that are higher than natural conditions.",
      "Field evidence remains uneven across species and regions."
    ],
    keyFindings: [
      "Filter feeders and small prey species are common entry points into marine food webs.",
      "Particle size and feeding behavior strongly affect transfer patterns."
    ],
    suggestedUses: [
      "Use it as the base source for definitions and mechanisms.",
      "Pair with one species-specific study for concrete detail."
    ],
    followUpTerms: [
      "bioaccumulation marine plastics trophic transfer",
      "filter feeders microplastic pathway"
    ]
  },
  {
    id: "mock-mussels-microplastic-transfer",
    externalIds: { doi: "10.1000/mock.2023.302" },
    title: "From Mussels to Predators: Tracking Microplastic Transfer in a Coastal Food Chain",
    authors: ["Luca Pereira", "Asha Menon"],
    year: 2023,
    journal: "Coastal Ecology Letters",
    abstract:
      "This experimental study tracks fluorescent microplastic particles from mussels to crab and fish predators under controlled coastal conditions. Transfer occurred most clearly through repeated feeding exposure, but retention differed substantially between trophic levels.",
    url: "https://example.org/articles/mussels-predators-microplastics",
    isOpenAccess: true,
    isReviewArticle: false,
    citationCount: 34,
    source: "Mock",
    concepts: ["mussels", "coastal food chain", "predators", "particle retention"],
    relevanceScore: 86,
    studentFitScore: 83,
    recencyScore: 88,
    whyRelevant:
      "Great for students who need one concrete experiment showing how transfer can happen between specific marine species.",
    plainEnglishSummary:
      "The researchers showed that microplastics can pass from prey to predators, but some organisms keep particles longer than others. That matters when explaining why transfer is hard to measure consistently.",
    difficulty: "Accessible",
    tags: ["Experimental study", "Open access"],
    limitations: [
      "Controlled feeding conditions are simpler than real ecosystems.",
      "Fluorescent particles may not behave exactly like all environmental plastics."
    ],
    keyFindings: [
      "Repeated prey consumption increased trophic transfer signals.",
      "Predators differed in how long microplastic particles remained detectable."
    ],
    suggestedUses: [
      "Use it for a body paragraph on mechanism and evidence.",
      "Helpful when comparing lab-based and field-based evidence."
    ],
    followUpTerms: [
      "predator retention microplastic particles",
      "coastal trophic transfer experiment"
    ]
  },
  {
    id: "mock-nanoplastic-predator-prey",
    externalIds: { doi: "10.1000/mock.2022.303" },
    title: "Nanoplastics, Predator-Prey Dynamics, and Uncertainty in Marine Risk Assessment",
    authors: ["Eleanor Cruz", "Haruto Sato", "Noor Ilyas"],
    year: 2022,
    journal: "Aquatic Risk Analysis",
    abstract:
      "Focusing on nanoplastics rather than larger fragments, this review discusses how particle size may alter absorption, predator-prey interactions, and toxicological risk. It argues that food-chain effects remain difficult to generalize because methods and particle definitions vary widely.",
    url: "https://example.org/articles/nanoplastics-risk-assessment",
    isOpenAccess: false,
    isReviewArticle: true,
    citationCount: 59,
    source: "Mock",
    concepts: ["nanoplastics", "risk assessment", "marine predators", "toxicology"],
    relevanceScore: 81,
    studentFitScore: 75,
    recencyScore: 76,
    whyRelevant:
      "This paper is useful if the research question needs nuance about uncertainty, especially around smaller particles and measurement challenges.",
    plainEnglishSummary:
      "The paper says researchers still disagree on how risky nanoplastics are in food chains because methods vary so much. It is strong for evaluation and limitations.",
    difficulty: "Intermediate",
    tags: ["Review article"],
    limitations: [
      "It focuses on uncertainty more than on one clear causal conclusion.",
      "Nanoplastic detection methods are still developing."
    ],
    keyFindings: [
      "Particle size affects both biological uptake and research uncertainty.",
      "Risk claims are limited by inconsistent methods across studies."
    ],
    suggestedUses: [
      "Use it in an evaluation paragraph about evidence quality.",
      "Pair it with a clearer trophic-transfer experiment to balance the discussion."
    ],
    followUpTerms: [
      "nanoplastic marine detection methods",
      "particle size trophic risk assessment"
    ]
  }
];

const MOCK_SCENARIOS: MockScenario[] = [
  {
    id: "urban-heat",
    label: "Urban greening and heat islands",
    prompt: "How does urban greening affect heat islands in dense cities?",
    matchTerms: ["urban", "greening", "heat", "city", "cities", "shade", "roof"],
    rewrite: {
      improvedQuery:
        "\"urban greening\" AND \"urban heat island\" AND (dense cities OR compact districts OR pedestrian thermal comfort)",
      relatedTerms: [
        "street canopy cover",
        "land surface temperature reduction",
        "pedestrian thermal comfort",
        "green roofs in compact cities"
      ],
      intentSummary:
        "Looking for empirical and review evidence on which greening strategies reduce urban heat most effectively in dense city environments."
    },
    featuredArticleIds: [
      "mock-urban-greening-meta",
      "mock-street-tree-cooling",
      "mock-green-roofs-compact-cities"
    ]
  },
  {
    id: "gene-editing",
    label: "Gene editing ethics in agriculture",
    prompt: "What are the ethical trade-offs of gene editing in agriculture?",
    matchTerms: ["gene", "editing", "crispr", "agriculture", "crop", "food", "ethics"],
    rewrite: {
      improvedQuery:
        "\"gene editing\" AND agriculture AND ethics AND (food security OR governance OR public trust)",
      relatedTerms: [
        "CRISPR crops regulation",
        "precision breeding governance",
        "public trust in biotechnology",
        "food security ethics"
      ],
      intentSummary:
        "Looking for academically credible sources that balance scientific benefits with governance, fairness, and public-trust concerns."
    },
    featuredArticleIds: [
      "mock-crispr-ethics-food-security",
      "mock-gene-editing-public-trust",
      "mock-editing-governance-comparative"
    ]
  },
  {
    id: "social-media-attention",
    label: "Social media and student attention",
    prompt: "How does social media affect attention span in students?",
    matchTerms: ["social", "media", "attention", "students", "phone", "screen", "sleep"],
    rewrite: {
      improvedQuery:
        "\"social media use\" AND adolescents AND (attention span OR executive function OR classroom focus)",
      relatedTerms: [
        "digital distraction in teenagers",
        "social media multitasking",
        "adolescent executive function",
        "attention regulation and screen time"
      ],
      intentSummary:
        "Looking for sources that connect social media habits to attention mechanisms, learning conditions, and student outcomes."
    },
    featuredArticleIds: [
      "mock-social-media-attention-review",
      "mock-classroom-phone-study",
      "mock-screen-time-meta"
    ]
  },
  {
    id: "microplastics",
    label: "Microplastics in marine food chains",
    prompt: "How does microplastic exposure affect marine food chains?",
    matchTerms: ["microplastic", "marine", "food", "chain", "ocean", "predator", "plastics"],
    rewrite: {
      improvedQuery:
        "\"microplastics\" AND \"marine food web\" AND (trophic transfer OR bioaccumulation OR predator prey)",
      relatedTerms: [
        "marine trophic transfer",
        "bioaccumulation of plastics",
        "filter feeder exposure",
        "predator prey particle transfer"
      ],
      intentSummary:
        "Looking for review and experimental evidence on how plastic particles move between marine species and where the evidence is still uncertain."
    },
    featuredArticleIds: [
      "mock-microplastic-trophic-review",
      "mock-mussels-microplastic-transfer",
      "mock-nanoplastic-predator-prey"
    ]
  }
];

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ");
}

function buildGenericRewrite(query: string): QueryRewrite {
  const normalized = normalizeText(query)
    .split(/\s+/)
    .filter((token) => token.length > 3)
    .slice(0, 4);

  return {
    improvedQuery: `${query} AND ("systematic review" OR "empirical study") AND ("student explanation" OR impact)`,
    relatedTerms: [
      ...(normalized.length ? normalized.map((token) => `${token} research`) : ["research gap"]),
      "systematic review",
      "comparative analysis"
    ].slice(0, 4),
    intentSummary:
      "Looking for a focused academic shortlist with a mix of broader review papers and concrete studies that a student can understand quickly."
  };
}

function matchScenario(query: string) {
  const normalizedQuery = normalizeText(query);
  const scored = MOCK_SCENARIOS.map((scenario) => ({
    scenario,
    score: scenario.matchTerms.reduce(
      (count, term) => (normalizedQuery.includes(term) ? count + 1 : count),
      0
    )
  })).sort((left, right) => right.score - left.score);

  return scored[0]?.score ? scored[0].scenario : null;
}

export function getFeaturedMockTopics() {
  return MOCK_SCENARIOS.map((scenario) => ({
    id: scenario.id,
    label: scenario.label,
    prompt: scenario.prompt
  }));
}

export function getMockArticleById(id: string) {
  return MOCK_ARTICLES.find((article) => article.id === id) || null;
}

export function buildMockSearchResponse(
  query: string,
  partialFilters?: Partial<SearchFilters>
): SearchResponse {
  const filters: SearchFilters = {
    ...DEFAULT_FILTERS,
    ...partialFilters
  };
  const trimmedQuery = query.trim() || "How does urban greening affect heat islands in dense cities?";
  const scenario = matchScenario(trimmedQuery);
  const rewrite = scenario?.rewrite || buildGenericRewrite(trimmedQuery);
  const featuredIds = new Set(scenario?.featuredArticleIds || []);

  const ranked = scoreArticles(
    MOCK_ARTICLES.map((article) => ({ ...article })),
    trimmedQuery,
    rewrite.relatedTerms,
    filters
  ).sort((left, right) => {
    const leftFeatured = featuredIds.has(left.id) ? 1 : 0;
    const rightFeatured = featuredIds.has(right.id) ? 1 : 0;

    if (leftFeatured !== rightFeatured) {
      return rightFeatured - leftFeatured;
    }

    if (filters.sort === "recent") {
      return (right.year || 0) - (left.year || 0);
    }

    return right.relevanceScore - left.relevanceScore;
  });

  return {
    query: trimmedQuery,
    rewrite,
    filters,
    articles: ranked.slice(0, 6),
    usedFallback: true,
    generatedAt: new Date().toISOString()
  };
}
