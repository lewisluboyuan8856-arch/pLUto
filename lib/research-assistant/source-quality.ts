import type { ResearchArticle, ResearchAssistantSourceQuality } from "@/lib/types";

function articleAge(year?: number) {
  if (!year) return null;
  return new Date().getFullYear() - year;
}

export function scoreSourceStrength(article: ResearchArticle) {
  const reviewBonus = article.isReviewArticle ? 24 : 10;
  const recencyBonus =
    article.year && articleAge(article.year) !== null
      ? Math.max(10, 28 - Math.min(articleAge(article.year) || 0, 18))
      : 14;
  const citationBonus = article.citationCount
    ? Math.min(24, Math.round(Math.log10(article.citationCount + 1) * 8))
    : 8;
  const accessBonus = article.isOpenAccess ? 8 : 4;
  const readabilityBonus =
    article.difficulty === "Accessible"
      ? 16
      : article.difficulty === "Intermediate"
        ? 12
        : 7;

  return Math.min(100, reviewBonus + recencyBonus + citationBonus + accessBonus + readabilityBonus);
}

export function describeSourceStrength(score: number) {
  if (score >= 86) {
    return "a very strong starting point";
  }

  if (score >= 72) {
    return "a solid source with good support signals";
  }

  if (score >= 58) {
    return "a usable source, but not the strongest in the set";
  }

  return "a lighter-confidence source that should be paired with stronger evidence";
}

function recencyLabel(article: ResearchArticle) {
  const age = articleAge(article.year);

  if (age === null) {
    return "Publication year unavailable";
  }

  if (age <= 2) {
    return `Very recent (${article.year})`;
  }

  if (age <= 5) {
    return `Recent (${article.year})`;
  }

  if (age <= 10) {
    return `Moderately recent (${article.year})`;
  }

  return `Older but still citable (${article.year})`;
}

function citationLabel(article: ResearchArticle) {
  if (article.citationCount === undefined) {
    return "Citation count unavailable";
  }

  if (article.citationCount >= 200) {
    return `${article.citationCount} citations (strong signal)`;
  }

  if (article.citationCount >= 50) {
    return `${article.citationCount} citations (solid signal)`;
  }

  return `${article.citationCount} citations`;
}

function studentUsefulnessLabel(article: ResearchArticle) {
  if (article.isReviewArticle && article.difficulty !== "Advanced") {
    return "Strong for building background knowledge and framing an argument";
  }

  if (article.difficulty === "Accessible") {
    return "Accessible for quick scanning and direct essay use";
  }

  if (article.difficulty === "Intermediate") {
    return "Useful with light interpretation or comparison";
  }

  return "More specialist, so use carefully and verify claims in full text";
}

function suggestedRole(article: ResearchArticle): ResearchAssistantSourceQuality["suggestedRole"] {
  if (article.isReviewArticle) {
    return article.citationCount && article.citationCount > 100 ? "Evaluation" : "Background";
  }

  if (article.relevanceScore >= 84) {
    return "Evidence";
  }

  if (article.limitations?.length) {
    return "Counterargument";
  }

  return "Background";
}

export function buildSourceQualitySnapshot(
  article: ResearchArticle
): ResearchAssistantSourceQuality {
  return {
    articleId: article.id,
    title: article.title,
    studyType: article.isReviewArticle
      ? "Review or meta-analysis"
      : "Non-review paper or likely single study",
    recency: recencyLabel(article),
    citations: citationLabel(article),
    openAccess: article.isOpenAccess ? "Open access available" : "Open access not confirmed",
    studentUsefulness: studentUsefulnessLabel(article),
    suggestedRole: suggestedRole(article),
    confidenceNote:
      "This quality snapshot is based on metadata only, so methodology and evidence strength should still be checked in the full paper.",
    strengthScore: scoreSourceStrength(article)
  };
}

export function buildSourceQualitySnapshots(articles: ResearchArticle[]) {
  return articles.map((article) => buildSourceQualitySnapshot(article));
}
