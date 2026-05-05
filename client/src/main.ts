// ============================================================
// FIXED main.ts — replace client/src/main.ts with this file
// Fixes: demographics label parsing, results page rendering,
//        navigation between form and results, scholarship cards
// ============================================================

const button = document.querySelector('button[type="button"]');
const loadingOverlay = document.querySelector('.absolute.inset-0') as HTMLElement | null;

// ── Demographic label map ────────────────────────────────────
// BUG FIX 1: The original code grabbed the full label text
// e.g. "First-generation college student" which doesn't match
// the backend values. This map normalises each checkbox to the
// exact string the backend expects.
const DEMO_LABEL_MAP: Record<string, string> = {
  'first-generation': 'first-generation',
  'african american':  'african-american',
  'hispanic / latino': 'hispanic',
  'female':            'female',
};

function getCheckedDemographics(): string[] {
  const result: string[] = [];
  document.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
    // Grab ONLY the sibling <span> text, not the whole label
    const span = cb.nextElementSibling as HTMLElement | null;
    if (!span) return;
    const raw = span.textContent?.trim().toLowerCase() ?? '';
    const mapped = DEMO_LABEL_MAP[raw];
    if (mapped) result.push(mapped);
  });
  return result;
}

// ── GPA conversion ───────────────────────────────────────────
function gpaFromSelect(val: string): number {
  if (val === '4.0+')    return 4.0;
  if (val === '3.5-3.9') return 3.7;
  if (val === '3.0-3.4') return 3.2;
  if (val === '2.5-2.9') return 2.7;
  if (val === '2.0-2.4') return 2.2;
  return 0;
}

// ── Results page renderer ────────────────────────────────────
// BUG FIX 3 & 4: Instead of alert(), replace the whole <main>
// with a proper results page showing scholarship cards.
function renderResultsPage(scholarships: any[], zipCode: string) {
  const main = document.querySelector('main');
  if (!main) return;

  const sortedByAmount = [...scholarships].sort((a, b) => b.amount - a.amount);

  const deadlineColor = (deadline: string) => {
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000);
    return days <= 60 ? 'text-[#C4860A]' : 'text-on-surface-variant';
  };

  const matchBarColor = (score: number) => {
    if (score >= 80) return 'bg-[#2A6B4F]';
    if (score >= 60) return 'bg-[#C4860A]';
    return 'bg-outline-variant';
  };

  main.innerHTML = `
    <div class="w-full max-w-5xl mx-auto px-margin py-lg">

      <!-- Header -->
      <div class="mb-lg border-b border-surface-container-highest pb-md">
        <p class="font-label-sm text-label-sm text-outline uppercase mb-xs">Results for zip code ${zipCode || 'Connecticut'}</p>
        <h1 class="font-h2 text-h2 text-on-surface">
          ${scholarships.length === 0
            ? 'No matches found yet.'
            : `We found <span class="text-[#2A6B4F]">${scholarships.length} scholarship${scholarships.length !== 1 ? 's' : ''}</span> for you.`
          }
        </h1>
        ${scholarships.length > 0
          ? `<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Sorted by award amount. Click "Draft my application" to generate a personalized essay.</p>`
          : `<p class="font-body-md text-body-md text-on-surface-variant mt-xs">Try a nearby zip code or broaden your search.</p>`
        }
      </div>

      <!-- Sort bar -->
      ${scholarships.length > 0 ? `
      <div class="flex gap-sm mb-md">
        <button onclick="sortCards('amount')" id="sort-amount" class="sort-btn px-sm py-xs border border-on-surface bg-on-surface text-surface font-button text-button uppercase text-xs">By Amount</button>
        <button onclick="sortCards('deadline')" id="sort-deadline" class="sort-btn px-sm py-xs border border-surface-container-highest font-button text-button uppercase text-xs text-on-surface-variant hover:border-on-surface transition-colors">By Deadline</button>
        <button onclick="sortCards('score')" id="sort-score" class="sort-btn px-sm py-xs border border-surface-container-highest font-button text-button uppercase text-xs text-on-surface-variant hover:border-on-surface transition-colors">By Match</button>
      </div>` : ''}

      <!-- Cards -->
      <div id="cards-container" class="space-y-xs">
        ${sortedByAmount.map(s => scholarshipCard(s, deadlineColor, matchBarColor)).join('')}
      </div>

      <!-- Back button -->
      <div class="mt-lg pt-md border-t border-surface-container-highest">
        <button onclick="goBack()" class="px-sm py-xs border border-surface-container-highest text-on-surface-variant font-button text-button uppercase text-xs hover:border-on-surface hover:text-on-surface transition-colors">
          ← Search again
        </button>
      </div>
    </div>

    <!-- Draft panel (slides in) -->
    <div id="draft-panel" class="hidden fixed inset-0 z-50 flex justify-end bg-on-surface/30" onclick="closeDraft(event)">
      <div class="bg-surface-bright w-full max-w-lg h-full overflow-y-auto p-lg border-l border-surface-container-highest" onclick="event.stopPropagation()">
        <div id="draft-content"></div>
      </div>
    </div>
  `;

  // Attach global helpers
  (window as any).sortCards = (by: string) => {
    const container = document.getElementById('cards-container');
    if (!container) return;
    const sorted = [...scholarships].sort((a, b) => {
      if (by === 'amount')   return b.amount - a.amount;
      if (by === 'deadline') return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
      if (by === 'score')    return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      return 0;
    });
    container.innerHTML = sorted.map(s => scholarshipCard(s, deadlineColor, matchBarColor)).join('');
    // Update active sort button
    document.querySelectorAll('.sort-btn').forEach(btn => {
      btn.classList.remove('bg-on-surface','text-surface');
      btn.classList.add('text-on-surface-variant','border-surface-container-highest');
    });
    const active = document.getElementById(`sort-${by}`);
    if (active) {
      active.classList.add('bg-on-surface','text-surface');
      active.classList.remove('text-on-surface-variant','border-surface-container-highest');
    }
  };

  (window as any).openDraft = (id: string) => {
    const s = scholarships.find(x => x.id === id);
    if (!s) return;
    const panel = document.getElementById('draft-panel');
    const content = document.getElementById('draft-content');
    if (!panel || !content) return;

    content.innerHTML = `
      <div class="flex justify-between items-start mb-md">
        <div>
          <p class="font-label-sm text-label-sm text-outline uppercase mb-xs">${s.name}</p>
          <p class="font-h3 text-h3 text-[#2A6B4F]">$${s.amount.toLocaleString()}</p>
        </div>
        <button onclick="closeDraft()" class="text-on-surface-variant hover:text-on-surface text-xl font-light">✕</button>
      </div>

      <div class="mb-md p-sm bg-surface-container-low border-l-2 border-[#2A6B4F]">
        <p class="font-label-sm text-label-sm text-outline uppercase mb-xs">Essay prompt</p>
        <p class="font-body-md text-body-md text-on-surface italic">${s.essayPrompt}</p>
      </div>

      <div class="space-y-sm mb-md">
        <div class="space-y-xs">
          <label class="font-button text-button text-on-surface block uppercase text-xs">Your first name</label>
          <input id="draft-name" type="text" placeholder="e.g. Priya"
            class="w-full p-sm border border-surface-container-highest bg-surface-container-lowest font-body-md text-on-surface placeholder:text-outline-variant focus:border-on-surface transition-colors" />
        </div>
        <div class="space-y-xs">
          <label class="font-button text-button text-on-surface block uppercase text-xs">One thing about yourself not on the form</label>
          <textarea id="draft-note" rows="3" placeholder="e.g. I helped raise my younger brothers while my mom worked two jobs"
            class="w-full p-sm border border-surface-container-highest bg-surface-container-lowest font-body-md text-on-surface placeholder:text-outline-variant focus:border-on-surface transition-colors resize-none"></textarea>
        </div>
      </div>

      <button onclick="generateDraft('${s.id}')"
        class="w-full bg-[#2A6B4F] text-white font-button text-button p-sm uppercase hover:bg-[#1d5239] transition-colors mb-md">
        Generate my draft →
      </button>

      <div id="essay-output" class="hidden">
        <div class="border-t border-surface-container-highest pt-md mb-sm">
          <p class="font-label-sm text-label-sm text-outline uppercase mb-sm">Your draft</p>
          <div id="essay-text" class="font-body-md text-body-md text-on-surface leading-relaxed whitespace-pre-wrap min-h-[200px]"></div>
        </div>
        <div class="flex gap-sm mt-sm">
          <button onclick="copyEssay()" class="px-sm py-xs border border-surface-container-highest text-on-surface-variant font-button text-button uppercase text-xs hover:border-on-surface transition-colors">Copy</button>
          <button onclick="downloadEssay('${s.name}')" class="px-sm py-xs border border-surface-container-highest text-on-surface-variant font-button text-button uppercase text-xs hover:border-on-surface transition-colors">Download .txt</button>
        </div>
      </div>
    `;

    panel.classList.remove('hidden');
  };

  (window as any).closeDraft = (e?: Event) => {
    const panel = document.getElementById('draft-panel');
    if (panel) panel.classList.add('hidden');
  };

  (window as any).generateDraft = async (scholarshipId: string) => {
    const firstName = (document.getElementById('draft-name') as HTMLInputElement)?.value || 'Student';
    const personalNote = (document.getElementById('draft-note') as HTMLTextAreaElement)?.value || '';
    const essayOutput = document.getElementById('essay-output');
    const essayText = document.getElementById('essay-text');
    const generateBtn = document.querySelector(`button[onclick="generateDraft('${scholarshipId}')"]`) as HTMLButtonElement;

    if (!essayOutput || !essayText) return;

    if (generateBtn) {
      generateBtn.textContent = 'Generating...';
      generateBtn.disabled = true;
    }

    essayOutput.classList.remove('hidden');
    essayText.textContent = '';

    // First, get a JWT cookie by calling /api/auth/login
    try {
      await fetch(`https://grantpath-rj83refrh-janshafin28csa-5309s-projects.vercel.app/api/auth/login`, { method: 'POST', credentials: 'include' });
    } catch (_) {}

    try {
      const response = await fetch(`https://grantpath-rj83refrh-janshafin28csa-5309s-projects.vercel.app/api/draft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          scholarshipId,
          studentProfile: {
            firstName,
            major: (document.getElementById('major') as HTMLInputElement)?.value || 'Undecided',
            gpa: 3.0,
            demographics: [],
            extracurriculars: [],
            personalNote,
          }
        })
      });

      if (!response.ok || !response.body) {
        essayText.textContent = 'Error generating draft. Please try again.';
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const text = line.slice(6);
            if (text === '[DONE]' || text === '[ERROR]') continue;
            essayText.textContent += text;
          }
        }
      }
    } catch (err) {
      essayText.textContent = 'Network error. Is the backend running on port 3001?';
    } finally {
      if (generateBtn) {
        generateBtn.textContent = 'Regenerate →';
        generateBtn.disabled = false;
      }
    }
  };

  (window as any).copyEssay = () => {
    const text = document.getElementById('essay-text')?.textContent || '';
    navigator.clipboard.writeText(text);
  };

  (window as any).downloadEssay = (name: string) => {
    const text = document.getElementById('essay-text')?.textContent || '';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type: 'text/plain' }));
    a.download = `${name.replace(/\s+/g, '_')}_draft.txt`;
    a.click();
  };

  (window as any).goBack = () => location.reload();
}

function scholarshipCard(
  s: any,
  deadlineColor: (d: string) => string,
  matchBarColor: (score: number) => string
): string {
  const days = Math.ceil((new Date(s.deadline).getTime() - Date.now()) / 86400000);
  const formattedDeadline = new Date(s.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return `
    <div class="flex border border-surface-container-highest hover:border-on-surface transition-colors bg-surface-bright">
      <!-- Match score bar -->
      <div class="w-1 flex-shrink-0 ${matchBarColor(s.matchScore ?? 50)}"></div>

      <!-- Content -->
      <div class="flex-1 p-md flex flex-col sm:flex-row gap-md justify-between">
        <div class="flex-1">
          <p class="font-h3 text-h3 text-on-surface mb-xs leading-tight">${s.name}</p>
          <p class="font-body-md text-body-md text-on-surface-variant mb-sm">${s.description}</p>
          <p class="font-label-sm text-label-sm ${deadlineColor(s.deadline)} uppercase">
            Deadline: ${formattedDeadline}${days <= 60 ? ` · ${days} days left` : ''}
          </p>
          ${s.matchReason ? `<p class="font-label-sm text-label-sm text-outline mt-xs">${s.matchReason}</p>` : ''}
        </div>

        <!-- Amount + CTA -->
        <div class="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-sm flex-shrink-0">
          <div class="text-right">
            <p class="font-['Newsreader'] text-3xl font-semibold text-[#2A6B4F]">$${s.amount.toLocaleString()}</p>
            <p class="font-label-sm text-label-sm text-outline uppercase">Award</p>
          </div>
          <button
            onclick="openDraft('${s.id}')"
            class="px-sm py-xs bg-[#2A6B4F] text-white font-button text-button uppercase text-xs hover:bg-[#1d5239] transition-colors whitespace-nowrap">
            Draft application →
          </button>
        </div>
      </div>
    </div>
  `;
}

// ── Form submission ──────────────────────────────────────────
button?.addEventListener('click', async () => {
  if (!loadingOverlay) return;

  // Show loading
  loadingOverlay.classList.remove('opacity-0', 'pointer-events-none');
  loadingOverlay.classList.add('opacity-100');

  const zipCode  = (document.getElementById('zipcode') as HTMLInputElement)?.value?.trim() ?? '';
  const gpaVal   = (document.getElementById('gpa') as HTMLSelectElement)?.value ?? '';
  const gpa      = gpaFromSelect(gpaVal);
  const major    = (document.getElementById('major') as HTMLInputElement)?.value?.trim() ?? '';
  const extText  = (document.getElementById('extracurriculars') as HTMLInputElement)?.value ?? '';
  const extracurriculars = extText ? extText.split(',').map(s => s.trim()).filter(Boolean) : [];

  // BUG FIX 1: use the normalised demographics helper
  const demographics = getCheckedDemographics();

  try {
    const res = await fetch(`https://grantpath-rj83refrh-janshafin28csa-5309s-projects.vercel.app/api/find`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ zipCode, gpa, major, demographics, extracurriculars })
    });

    const data = await res.json();

    // Hide loading
    loadingOverlay.classList.remove('opacity-100');
    loadingOverlay.classList.add('opacity-0', 'pointer-events-none');

    if (res.ok) {
      // BUG FIX 4: render proper results page instead of alert()
      renderResultsPage(data.scholarships ?? [], zipCode);
    } else {
      alert('Error: ' + JSON.stringify(data.errors || data.error, null, 2));
    }
  } catch (err) {
    loadingOverlay.classList.remove('opacity-100');
    loadingOverlay.classList.add('opacity-0', 'pointer-events-none');
    alert('Network error. Is the backend running on port 3001?');
  }
});
