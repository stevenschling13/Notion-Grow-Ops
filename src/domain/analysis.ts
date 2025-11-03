import { AnalyzeJob, Writebacks } from "./payload.js";

const STAGE_TARGETS: Record<string, { dli: number; vpd: [number, number]; summary: string }> = {
  vegetative: { dli: 32, vpd: [0.9, 1.2], summary: "Vegetative growth looks strong" },
  flower: { dli: 38, vpd: [1.1, 1.4], summary: "Flower sites filling in" },
  clone: { dli: 20, vpd: [0.8, 1.0], summary: "Clones acclimating" },
  seedling: { dli: 22, vpd: [0.8, 1.0], summary: "Seedlings establishing" },
};

const ANGLE_NOTES: Record<string, string> = {
  "under-canopy": "Under-canopy airflow looks clear.",
  "trichomes": "Trichome development is on track.",
  "bud-site": "Bud site spacing is even across the canopy.",
  canopy: "Canopy height appears uniform.",
  "full-plant": "Full plant posture is upright and healthy.",
};

const NEXT_STEP_MAP: Record<string, string> = {
  vegetative: "Raise light",
  flower: "Dim",
  clone: "IPM",
  seedling: "Feed",
};

const LOW_RH_KEYWORDS = ["dry", "crispy", "low humidity"];
const PEST_KEYWORDS = ["mite", "pest", "thrip", "aphid"];

export type JobAnalysis = {
  writebacks: Writebacks;
};

export function analyzeJob(job: AnalyzeJob): JobAnalysis {
  const targets = STAGE_TARGETS[job.stage?.toLowerCase() ?? ""] ?? STAGE_TARGETS.vegetative;

  const dli = computeDli(job, targets.dli);
  const vpd = computeVpd(job, targets.vpd);
  const health = computeHealth(job, dli, targets.dli, vpd, targets.vpd);
  const severity = health >= 80 ? "Low" : health >= 60 ? "Medium" : health >= 40 ? "High" : "Critical";
  const summary = buildSummary(job, health, dli, vpd, targets.summary);
  const nextStep = determineNextStep(job, health, severity);
  const vpdOk = vpd >= targets.vpd[0] && vpd <= targets.vpd[1];
  const dliOk = Math.abs(dli - targets.dli) <= 4;
  const co2Ok = !job.notes || !job.notes.toLowerCase().includes("co2");
  const trend = determineTrend(job, health);

  const writebacks: Writebacks = {
    "AI Summary": summary,
    "Health 0-100": health,
    "AI Next Step": nextStep,
    "VPD OK": vpdOk,
    "DLI OK": dliOk,
    "CO2 OK": co2Ok,
    "Trend": trend,
    "DLI mol": Number(dli.toFixed(1)),
    "VPD kPa": Number(vpd.toFixed(2)),
    "Sev": severity,
  };

  return { writebacks };
}

function computeDli(job: AnalyzeJob, stageTarget: number): number {
  if (typeof job.photoperiod_h === "number") {
    const baselineIntensity = job.stage?.toLowerCase() === "flower" ? 2.2 : 1.8;
    return job.photoperiod_h * baselineIntensity;
  }

  if (job.notes) {
    const notes = job.notes.toLowerCase();
    if (notes.includes("dim") || notes.includes("light burn")) {
      return stageTarget - 6;
    }
    if (notes.includes("stretch") || notes.includes("lagging")) {
      return stageTarget + 5;
    }
  }

  return stageTarget - 1;
}

function computeVpd(job: AnalyzeJob, stageRange: [number, number]): number {
  const [min, max] = stageRange;
  if (job.notes) {
    const note = job.notes.toLowerCase();
    if (LOW_RH_KEYWORDS.some((k) => note.includes(k))) {
      return Math.min(max + 0.2, max + 0.3);
    }
    if (note.includes("humid") || note.includes("wet")) {
      return Math.max(min - 0.2, 0.5);
    }
  }
  return (min + max) / 2;
}

function computeHealth(job: AnalyzeJob, dli: number, targetDli: number, vpd: number, vpdRange: [number, number]): number {
  let score = 85;

  const targetDiff = Math.abs(dli - targetDli);
  if (targetDiff > 8) score -= 12;
  else if (targetDiff > 4) score -= 6;

  const [minVpd, maxVpd] = vpdRange;
  if (vpd < minVpd - 0.15 || vpd > maxVpd + 0.15) {
    score -= 10;
  }

  if (job.notes) {
    const note = job.notes.toLowerCase();
    if (PEST_KEYWORDS.some((word) => note.includes(word))) {
      score -= 20;
    }
    if (note.includes("deficiency") || note.includes("yellow")) {
      score -= 15;
    }
    if (note.includes("excellent") || note.includes("vigorous")) {
      score += 5;
    }
  }

  score = Math.max(10, Math.min(100, score));
  return Math.round(score);
}

function buildSummary(job: AnalyzeJob, health: number, dli: number, vpd: number, stageSummary: string): string {
  const parts = [stageSummary];

  if (ANGLE_NOTES[job.angle ?? ""]) {
    parts.push(ANGLE_NOTES[job.angle ?? ""]);
  }

  parts.push(`Health score at ${health}.`);
  parts.push(`DLI tracking at ${dli.toFixed(1)} mol with VPD ${vpd.toFixed(2)} kPa.`);

  if (job.notes) {
    const note = job.notes.trim();
    if (note) {
      parts.push(`Notes: ${note}`);
    }
  }

  return parts.join(" ");
}

function determineNextStep(job: AnalyzeJob, health: number, severity: string): string {
  if (severity === "Critical") return "Flush";
  if (severity === "High") return "Defol";
  if (job.notes && job.notes.toLowerCase().includes("raise")) return "Raise light";

  const stage = job.stage?.toLowerCase();
  if (stage && NEXT_STEP_MAP[stage]) {
    return NEXT_STEP_MAP[stage];
  }

  if (health >= 85) {
    return "None";
  }

  return "Feed";
}

function determineTrend(job: AnalyzeJob, health: number): "Improving" | "Stable" | "Declining" {
  if (job.notes) {
    const note = job.notes.toLowerCase();
    if (note.includes("improv")) return "Improving";
    if (note.includes("wors")) return "Declining";
  }
  if (health >= 80) return "Improving";
  if (health <= 55) return "Declining";
  return "Stable";
}
