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

const caseTabs = Array.from(document.querySelectorAll(".case-tab, .proof-card"));
const casePanels = Array.from(document.querySelectorAll("[data-case-panel]"));

caseTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const target = tab.dataset.case;

    caseTabs.forEach((item) => item.classList.toggle("is-active", item.dataset.case === target));
    casePanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.casePanel === target);
    });
  });
});

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
