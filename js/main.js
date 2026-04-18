// ===========================
// CRAFTIVIO AI – MAIN JS
// ===========================

// ---- NAV HAMBURGER ----
const hamburger = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobileMenu');
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });
}

// ---- SCROLL ANIMATIONS ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.animation = 'fadeUp 0.5s ease both';
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feature-card, .testimonial, .pricing-card, .preview-card').forEach(el => {
  el.style.opacity = '0';
  observer.observe(el);
});

// ---- AUTH HELPERS ----
function getUsers() {
  return JSON.parse(localStorage.getItem('craftivio_users') || '{}');
}
function saveUsers(users) {
  localStorage.setItem('craftivio_users', JSON.stringify(users));
}
function getCurrentUser() {
  return JSON.parse(localStorage.getItem('craftivio_current_user') || 'null');
}
function setCurrentUser(user) {
  localStorage.setItem('craftivio_current_user', JSON.stringify(user));
}
function logout() {
  localStorage.removeItem('craftivio_current_user');
  window.location.href = '../index.html';
}

// ---- USAGE TRACKING ----
function getUsage() {
  const today = new Date().toDateString();
  const usage = JSON.parse(localStorage.getItem('craftivio_usage') || '{}');
  if (usage.date !== today) return { date: today, count: 0 };
  return usage;
}
function incrementUsage() {
  const usage = getUsage();
  usage.count++;
  localStorage.setItem('craftivio_usage', JSON.stringify(usage));
}
function canGenerate() {
  const user = getCurrentUser();
  if (!user) return false;
  if (user.plan === 'pro') return true;
  return getUsage().count < 5;
}
function getRemainingGenerations() {
  const user = getCurrentUser();
  if (!user) return 0;
  if (user.plan === 'pro') return Infinity;
  return Math.max(0, 5 - getUsage().count);
}

// ---- TOAST ----
function showToast(message, type = '') {
  let toast = document.getElementById('toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'toast';
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.className = `toast ${type}`;
  setTimeout(() => toast.classList.add('show'), 10);
  setTimeout(() => toast.classList.remove('show'), 3000);
}

// ---- COPY TO CLIPBOARD ----
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('copied');
      setTimeout(() => {
        btn.textContent = orig;
        btn.classList.remove('copied');
      }, 2000);
    }
    showToast('Copied to clipboard!', 'success');
  });
}

// ---- SIDEBAR MOBILE ----
function initSidebar() {
  const toggle = document.querySelector('.sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  let overlay = document.getElementById('sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    overlay.id = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('show');
  });
  overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('show');
  });
}

// ---- AI MOCK (fallback) ----
const mockResponses = {
  hook: [
    "Stop scrolling. This ONE thing changed how 47,000 people grow online — and it takes less than 5 minutes.",
    "I was broke, burnt out, and ready to quit. Then I discovered this strategy no one talks about.",
    "The algorithm doesn't care about you. But this does — and it's working RIGHT NOW.",
  ],
  caption: [
    "Growth isn't linear. Some days you post into the void. Other days the algorithm gods smile on you. The difference? You showed up either way. 💪 Drop a 🔥 if you're building something big.",
    "They said it couldn't be done. (I saved the screenshot.) Here's exactly how we proved them wrong — and what's coming next. Comment 'DETAILS' and I'll DM you the full breakdown.",
    "Hot take: Consistency beats talent every single time. I've watched brilliant people fail because they quit. I've watched average people win because they stayed. Which one are you choosing? 👇",
  ],
  hashtag: [
    "#ContentCreator #ViralMarketing #GrowthHacking #SocialMediaMarketing #CreatorEconomy #DigitalMarketing #OnlineGrowth #ContentStrategy #InstagramMarketing #BuildInPublic",
    "#Entrepreneur #BusinessGrowth #StartupLife #MarketingTips #BrandBuilding #SocialMediaGrowth #ContentMarketing #DigitalCreator #GrowthMindset #OnlineBusiness",
    "#PersonalBrand #TikTokMarketing #LinkedInGrowth #TwitterGrowth #CreativeContent #ViralContent #MarketingStrategy #SocialMediaTips #Influencer #ContentCreation",
  ]
};

function getMockResponse(tool, input) {
  const responses = mockResponses[tool];
  const index = Math.floor(Math.random() * responses.length);
  return responses[index];
}

// ---- AI GENERATION ----
async function generateContent(tool, topic, tone, platform) {
  const OPENAI_KEY = window.CRAFTIVIO_OPENAI_KEY || '';

  const prompts = {
    hook: `Generate 3 viral social media hook lines for a post about: "${topic}". 
Tone: ${tone}. Platform: ${platform}.
Make them punchy, scroll-stopping, and compelling. Number them 1. 2. 3.`,
    caption: `Write 3 engaging social media captions about: "${topic}". 
Tone: ${tone}. Platform: ${platform}.
Include a call-to-action at the end. Make them authentic and engaging. Number them 1. 2. 3.`,
    hashtag: `Generate 3 sets of 10 highly relevant hashtags for a post about: "${topic}".
Platform: ${platform}. Include a mix of niche, trending, and broad hashtags.
Format each set on a new line, starting with Set 1:, Set 2:, Set 3:.`
  };

  if (!OPENAI_KEY) {
    // Return mock response
    await new Promise(r => setTimeout(r, 1200));
    const variants = [];
    for (let i = 0; i < 3; i++) variants.push(getMockResponse(tool, topic));
    return variants;
  }

  try {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: 'You are a viral content strategist. Provide crisp, effective social media content.' },
          { role: 'user', content: prompts[tool] }
        ],
        max_tokens: 600,
        temperature: 0.85
      })
    });
    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || '';
    // Split numbered variants
    const variants = text.split(/\n(?=\d\.|Set \d)/).map(v => v.replace(/^\d\.\s*|^Set \d:\s*/i, '').trim()).filter(Boolean);
    return variants.length ? variants : [text];
  } catch (e) {
    const variants = [];
    for (let i = 0; i < 3; i++) variants.push(getMockResponse(tool, topic));
    return variants;
  }
}

// ---- INIT ----
document.addEventListener('DOMContentLoaded', () => {
  initSidebar();
});

// Export helpers for page scripts
window.CraftivioAI = {
  getCurrentUser, setCurrentUser, getUsers, saveUsers,
  logout, canGenerate, getRemainingGenerations, incrementUsage,
  generateContent, copyToClipboard, showToast
};
