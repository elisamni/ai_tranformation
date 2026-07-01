const formatMoney = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll("[data-reveal]").forEach((element) => {
  revealObserver.observe(element);
});

function initOwnerLiveBubbles() {
  const section = document.querySelector(".owner-bubbles");
  const bubbles = Array.from(document.querySelectorAll(".owner-bubbles .phrase-bubble"));
  if (!section || bubbles.length < 2) return;

  const liveQuery = window.matchMedia("(min-width: 981px)");
  const reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  const activeCount = Math.min(4, bubbles.length);
  let intervalId = null;
  let activeQueue = [];
  let nextIndex = 0;

  function stopLiveMode({ showAll = false } = {}) {
    if (intervalId) window.clearInterval(intervalId);
    intervalId = null;
    section.classList.remove("live-bubbles");
    activeQueue = [];
    bubbles.forEach((bubble) => {
      bubble.classList.toggle("is-live-visible", showAll);
    });
  }

  function startLiveMode() {
    stopLiveMode();

    if (!liveQuery.matches || reduceMotionQuery.matches) {
      stopLiveMode({ showAll: true });
      return;
    }

    section.classList.add("live-bubbles");
    nextIndex = activeCount;
    activeQueue = bubbles.slice(0, activeCount).map((_, index) => index);

    activeQueue.forEach((index, order) => {
      window.setTimeout(() => {
        bubbles[index]?.classList.add("is-live-visible");
      }, order * 180);
    });

    intervalId = window.setInterval(() => {
      const outgoingIndex = activeQueue.shift();
      if (typeof outgoingIndex === "number") {
        bubbles[outgoingIndex]?.classList.remove("is-live-visible");
      }

      const incomingIndex = nextIndex;
      activeQueue.push(incomingIndex);
      window.setTimeout(() => {
        bubbles[incomingIndex]?.classList.add("is-live-visible");
      }, 260);

      nextIndex = (nextIndex + 1) % bubbles.length;
    }, 1900);
  }

  startLiveMode();
  liveQuery.addEventListener?.("change", startLiveMode);
  reduceMotionQuery.addEventListener?.("change", startLiveMode);
}

initOwnerLiveBubbles();

const caseTabs = Array.from(document.querySelectorAll(".case-tab, .proof-card"));
const casePanels = Array.from(document.querySelectorAll("[data-case-panel]"));

caseTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    const scrollPosition = { x: window.scrollX, y: window.scrollY };
    const target = tab.dataset.case;

    caseTabs.forEach((item) => {
      const isActive = item.dataset.case === target;
      item.classList.toggle("is-active", isActive);
      if (item.classList.contains("proof-card")) {
        item.setAttribute("aria-selected", String(isActive));
      }
    });
    casePanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.casePanel === target);
    });

    requestAnimationFrame(() => {
      window.scrollTo(scrollPosition.x, scrollPosition.y);
    });
  });
});

const navLinks = Array.from(document.querySelectorAll(".site-nav a"));
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute("href")))
  .filter(Boolean);

if (navLinks.length && navSections.length) {
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      const id = `#${entry.target.id}`;
      navLinks.forEach((link) => {
        link.classList.toggle("is-active", link.getAttribute("href") === id);
      });
    });
  }, { rootMargin: "-30% 0px -55% 0px", threshold: 0.01 });

  navSections.forEach((section) => navObserver.observe(section));
}

navLinks.forEach((link) => {
  link.addEventListener("click", (event) => {
    const href = link.getAttribute("href");
    if (!href?.startsWith("#")) return;

    const target = document.querySelector(href);
    const header = document.querySelector(".site-header");
    if (!target) return;

    event.preventDefault();
    const headerBottom = header?.getBoundingClientRect().bottom || 0;
    const scrollTarget = href === "#results"
      ? target.querySelector(".section-intro h2") || target
      : target;
    const desiredTop = href === "#results"
      ? headerBottom + 46
      : href === "#employee-cases"
        ? headerBottom + 22
        : headerBottom;
    const top = scrollTarget.getBoundingClientRect().top + window.scrollY - desiredTop;
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    window.history.pushState(null, "", href);
    root.style.scrollBehavior = "auto";
    window.scrollTo(0, top);
    requestAnimationFrame(() => {
      const currentHeaderBottom = header?.getBoundingClientRect().bottom || 0;
      const currentDesiredTop = href === "#results"
        ? currentHeaderBottom + 46
        : href === "#employee-cases"
          ? currentHeaderBottom + 22
          : currentHeaderBottom;
      const delta = scrollTarget.getBoundingClientRect().top - currentDesiredTop;
      if (Math.abs(delta) > 1) {
        window.scrollBy(0, delta);
      }
      root.style.scrollBehavior = previousScrollBehavior;
    });
  });
});

const diagnosticModal = document.querySelector("[data-diagnostic-modal]");
const diagnosticDialog = document.querySelector(".diagnostic-dialog");
const diagnosticTriggers = Array.from(document.querySelectorAll("[data-diagnostic-trigger]"));
const diagnosticCloseButtons = Array.from(document.querySelectorAll("[data-diagnostic-close]"));
const diagnosticStart = document.querySelector("[data-diagnostic-start]");
let diagnosticReturnTarget = null;

function openDiagnosticModal(event) {
  event.preventDefault();

  if (!diagnosticModal) return;
  diagnosticReturnTarget = event.currentTarget;
  diagnosticModal.hidden = false;
  document.body.classList.add("is-modal-open");

  requestAnimationFrame(() => {
    diagnosticModal.classList.add("is-open");
    diagnosticDialog?.focus();
  });
}

function closeDiagnosticModal({ moveFocus = true, scrollToNext = false } = {}) {
  if (!diagnosticModal) return;

  diagnosticModal.classList.remove("is-open");
  document.body.classList.remove("is-modal-open");

  window.setTimeout(() => {
    diagnosticModal.hidden = true;
    if (moveFocus) diagnosticReturnTarget?.focus();
    if (scrollToNext) {
      const quizTarget = document.querySelector("#aiQuiz") || document.querySelector("#diagnostic");
      quizTarget?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, 220);
}

diagnosticTriggers.forEach((trigger) => {
  trigger.addEventListener("click", openDiagnosticModal);
});

diagnosticCloseButtons.forEach((button) => {
  button.addEventListener("click", () => closeDiagnosticModal());
});

diagnosticStart?.addEventListener("click", () => {
  closeDiagnosticModal({ moveFocus: false, scrollToNext: true });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && diagnosticModal?.classList.contains("is-open")) {
    closeDiagnosticModal();
  }
});

const platformRows = Array.from(document.querySelectorAll("[data-platform-row]"));

platformRows.forEach((row) => {
  row.addEventListener("click", () => {
    const item = row.closest(".platform-item");
    if (!item) return;

    platformRows.forEach((otherRow) => {
      const otherItem = otherRow.closest(".platform-item");
      const isOpen = otherItem === item;
      otherItem?.classList.toggle("is-open", isOpen);
      otherRow.setAttribute("aria-expanded", String(isOpen));
    });
  });
});

const employeeSlider = document.querySelector("[data-employee-slider]");
const employeePrev = document.querySelector("[data-slider-prev]");
const employeeNext = document.querySelector("[data-slider-next]");
const employeeSlides = Array.from(document.querySelectorAll(".employee-slide"));

function getCurrentEmployeeSlideIndex() {
  if (!employeeSlider || !employeeSlides.length) return 0;
  const sliderCenter = employeeSlider.scrollLeft + employeeSlider.clientWidth / 2;
  return employeeSlides.reduce((closestIndex, slide, index) => {
    const closestSlide = employeeSlides[closestIndex];
    const currentDistance = Math.abs(slide.offsetLeft + slide.offsetWidth / 2 - sliderCenter);
    const closestDistance = Math.abs(closestSlide.offsetLeft + closestSlide.offsetWidth / 2 - sliderCenter);
    return currentDistance < closestDistance ? index : closestIndex;
  }, 0);
}

function scrollEmployeeCases(direction) {
  if (!employeeSlider || !employeeSlides.length) return;
  const currentIndex = getCurrentEmployeeSlideIndex();
  const targetIndex = (currentIndex + direction + employeeSlides.length) % employeeSlides.length;
  employeeSlider.scrollTo({ left: employeeSlides[targetIndex].offsetLeft, behavior: "smooth" });
}

employeePrev?.addEventListener("click", () => scrollEmployeeCases(-1));
employeeNext?.addEventListener("click", () => scrollEmployeeCases(1));

const opsTabs = Array.from(document.querySelectorAll(".ops-tab"));
const opsPanels = Array.from(document.querySelectorAll("[data-ops-panel]"));
const opsWindowTitle = document.querySelector("#opsWindowTitle");
const opsTitles = {
  money: "AI Booster · Деньги",
  teams: "AI Booster · Команды",
  solutions: "AI Booster · AI-решения"
};

opsTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.ops;

    opsTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.ops === target));
    opsPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.opsPanel === target);
    });

    if (opsWindowTitle) {
      opsWindowTitle.textContent = opsTitles[target] || "AI Booster";
    }
  });
});

const teamSize = document.querySelector("#teamSize");
const hourRate = document.querySelector("#hourRate");
const hoursSaved = document.querySelector("#hoursSaved");
const teamSizeOut = document.querySelector("#teamSizeOut");
const hourRateOut = document.querySelector("#hourRateOut");
const hoursSavedOut = document.querySelector("#hoursSavedOut");
const monthHours = document.querySelector("#monthHours");
const monthMoney = document.querySelector("#monthMoney");
const yearMoney = document.querySelector("#yearMoney");

function updateCalculator() {
  const people = Number(teamSize.value);
  const rate = Number(hourRate.value);
  const hours = Number(hoursSaved.value);
  const monthlyHours = people * hours * 4;
  const monthlyMoney = monthlyHours * rate;

  teamSizeOut.textContent = people;
  hourRateOut.textContent = formatMoney.format(rate);
  hoursSavedOut.textContent = `${hours} ч`;
  monthHours.textContent = `${monthlyHours.toLocaleString("ru-RU")} ч`;
  monthMoney.textContent = formatMoney.format(monthlyMoney);
  yearMoney.textContent = formatMoney.format(monthlyMoney * 12);
}

[teamSize, hourRate, hoursSaved].forEach((input) => {
  input.addEventListener("input", updateCalculator);
});

updateCalculator();

const quizForm = document.querySelector("#aiQuiz");
const quizSteps = Array.from(document.querySelectorAll(".quiz-step"));
const quizStepLabel = document.querySelector("#quizStepLabel");
const quizProgress = document.querySelector("#quizProgress");
const quizResult = document.querySelector("#quizResult");
const restartQuiz = document.querySelector("#restartQuiz");
const quizAnswers = [];
let currentStep = 0;

function showQuizStep(step) {
  if (!quizForm) return;

  currentStep = step;
  quizSteps.forEach((item, index) => {
    item.classList.toggle("is-active", index === step);
  });

  if (step < 4) {
    quizStepLabel.textContent = `${step + 1} из 4`;
    quizProgress.style.width = `${((step + 1) / 4) * 100}%`;
  } else {
    quizStepLabel.textContent = "Контакты";
    quizProgress.style.width = "100%";
  }
}

if (quizForm) {
  quizSteps.forEach((stepElement, stepIndex) => {
    stepElement.querySelectorAll("button[data-answer]").forEach((button) => {
      button.addEventListener("click", () => {
        quizAnswers[stepIndex] = button.dataset.answer;
        showQuizStep(Math.min(stepIndex + 1, 4));
      });
    });
  });

  quizForm.addEventListener("submit", (event) => {
    event.preventDefault();
    quizForm.style.display = "none";
    quizResult.classList.add("is-visible");
    console.log("AI Booster quiz draft", {
      answers: quizAnswers,
      contact: Object.fromEntries(new FormData(quizForm).entries())
    });
  });

  restartQuiz.addEventListener("click", () => {
    quizAnswers.length = 0;
    quizForm.reset();
    quizForm.style.display = "";
    quizResult.classList.remove("is-visible");
    showQuizStep(0);
  });

  showQuizStep(0);
}
