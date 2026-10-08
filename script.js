/* =====================================================
   HEALTHWISE AI
   Frontend-only healthcare recommender
===================================================== */


/* =========================
   STATE
========================= */

const defaultState = {

    profile: {

        name: "Niranjan",
        age: "",
        height: "",
        weight: "",
        gender: "",
        goal: "general"

    },

    tracker: {

        water: 4,
        sleep: 7.2,
        steps: 6842

    },

    assessment: {

        symptoms: [],
        sleep: 7.5,
        activity: "medium",
        water: 4,
        stress: "medium"

    },

    history: []

};


let state = loadState();


/* =========================
   LOCAL STORAGE
========================= */

function loadState() {

    const saved =
        localStorage.getItem("healthwiseState");

    if (!saved) {

        return structuredClone(defaultState);

    }

    try {

        const parsed = JSON.parse(saved);

        return {

            ...defaultState,

            ...parsed,

            profile: {
                ...defaultState.profile,
                ...(parsed.profile || {})
            },

            tracker: {
                ...defaultState.tracker,
                ...(parsed.tracker || {})
            },

            assessment: {
                ...defaultState.assessment,
                ...(parsed.assessment || {})
            }

        };

    } catch {

        return structuredClone(defaultState);

    }

}


function saveState() {

    localStorage.setItem(
        "healthwiseState",
        JSON.stringify(state)
    );

}


/* =========================
   DOM HELPERS
========================= */

const $ = selector =>
    document.querySelector(selector);


const $$ = selector =>
    document.querySelectorAll(selector);


/* =========================
   NAVIGATION
========================= */

function showSection(sectionId) {

    $$(".section").forEach(section => {

        section.classList.remove("active");

    });


    const target =
        document.getElementById(sectionId);

    if (target) {

        target.classList.add("active");

    }


    $$(".nav-item").forEach(item => {

        item.classList.toggle(
            "active",
            item.dataset.section === sectionId
        );

    });


    updatePageHeader(sectionId);

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });

}


function updatePageHeader(sectionId) {

    const titles = {

        dashboard: [
            `Good morning, ${state.profile.name || "Niru"} 👋`,
            "Here's your personalized health overview."
        ],

        assessment: [
            "Health Assessment",
            "Tell us how you're feeling today."
        ],

        recommendations: [
            "AI Recommendations",
            "Personalized wellness guidance."
        ],

        tracker: [
            "Health Tracker",
            "Track your daily wellness habits."
        ],

        history: [
            "Assessment History",
            "Review your previous health assessments."
        ],

        profile: [
            "Health Profile",
            "Manage your personal health information."
        ]

    };


    const data =
        titles[sectionId] || titles.dashboard;


    $("#pageTitle").innerHTML =
        data[0];

    $("#pageSubtitle").textContent =
        data[1];

}


/* Navigation buttons */

$$(".nav-item").forEach(button => {

    button.addEventListener("click", () => {

        showSection(button.dataset.section);

        $("#sidebar").classList.remove("open");

    });

});


/* data-go buttons */

$$("[data-go]").forEach(button => {

    button.addEventListener("click", () => {

        showSection(button.dataset.go);

    });

});


/* Mobile menu */

$("#menuBtn").addEventListener("click", () => {

    $("#sidebar").classList.toggle("open");

});


/* =========================
   DATE
========================= */

function setDate() {

    const date = new Date();

    $("#todayDate").textContent =
        date.toLocaleDateString(
            "en-IN",
            {
                weekday: "short",
                month: "short",
                day: "numeric"
            }
        );

}


/* =========================
   PROFILE
========================= */

function loadProfile() {

    const p = state.profile;


    $("#nameInput").value =
        p.name || "";

    $("#ageInput").value =
        p.age || "";

    $("#heightInput").value =
        p.height || "";

    $("#weightInput").value =
        p.weight || "";

    $("#genderInput").value =
        p.gender || "";

    $("#goalInput").value =
        p.goal || "general";


    updateProfileUI();

}


function updateProfileUI() {

    const name =
        state.profile.name || "Niranjan";


    $("#headerName").textContent =
        name.split(" ")[0];


    $("#profileDisplayName").textContent =
        name;


    const firstLetter =
        name.charAt(0).toUpperCase() || "N";


    $("#avatar").textContent =
        firstLetter;

    $("#profileAvatar").textContent =
        firstLetter;

}


$("#saveProfile").addEventListener(
    "click",
    saveProfile
);


function saveProfile() {

    state.profile = {

        name: $("#nameInput").value.trim()
            || "Niranjan",

        age: $("#ageInput").value,

        height: $("#heightInput").value,

        weight: $("#weightInput").value,

        gender: $("#genderInput").value,

        goal: $("#goalInput").value

    };


    saveState();

    updateProfileUI();

    calculateBMI();

    showToast(
        "Profile saved",
        "Your health profile has been updated."
    );

}


/* =========================
   BMI
========================= */

function calculateBMI() {

    const height =
        parseFloat(state.profile.height);

    const weight =
        parseFloat(state.profile.weight);


    if (!height || !weight) {

        $("#bmiValue").textContent = "--";

        $("#bmiLabel").textContent =
            "Enter height and weight";

        $("#bmiIndicator").style.left = "0%";

        return;

    }


    const meters =
        height / 100;


    const bmi =
        weight / (meters * meters);


    $("#bmiValue").textContent =
        bmi.toFixed(1);


    let label = "";


    if (bmi < 18.5) {

        label = "Below general BMI range";

    } else if (bmi < 25) {

        label = "Within general BMI range";

    } else if (bmi < 30) {

        label = "Above general BMI range";

    } else {

        label = "High BMI range";

    }


    $("#bmiLabel").textContent =
        label;


    const position =
        Math.min(
            100,
            Math.max(
                5,
                ((bmi - 15) / 25) * 100
            )
        );


    $("#bmiIndicator").style.left =
        `${position}%`;

}


/* =========================
   HEALTH SCORE
========================= */

function calculateHealthScore() {

    const t = state.tracker;

    const a = state.assessment;


    let score = 100;


    /* Water */

    if (t.water < 4) {

        score -= 15;

    } else if (t.water < 7) {

        score -= 7;

    }


    /* Sleep */

    if (t.sleep < 5) {

        score -= 18;

    } else if (t.sleep < 7) {

        score -= 9;

    } else if (t.sleep > 10) {

        score -= 5;

    }


    /* Steps */

    if (t.steps < 3000) {

        score -= 15;

    } else if (t.steps < 6000) {

        score -= 8;

    }


    /* Symptoms */

    score -= Math.min(
        20,
        (a.symptoms || []).length * 3
    );


    /* Stress */

    if (a.stress === "high") {

        score -= 8;

    } else if (a.stress === "medium") {

        score -= 3;

    }


    return Math.max(
        0,
        Math.min(100, score)
    );

}


function updateDashboard() {

    const score =
        calculateHealthScore();


    $("#healthScore").textContent =
        score;


    $("#healthProgress").style.width =
        `${score}%`;


    if (score >= 80) {

        $("#healthMessage").textContent =
            "Excellent health habits";

    } else if (score >= 60) {

        $("#healthMessage").textContent =
            "Good, with room to improve";

    } else {

        $("#healthMessage").textContent =
            "Consider improving your habits";

    }


    /* Water */

    $("#waterValue").textContent =
        state.tracker.water;


    $("#waterProgress").style.width =
        `${Math.min(
            100,
            state.tracker.water / 8 * 100
        )}%`;


    /* Sleep */

    $("#sleepValue").textContent =
        state.tracker.sleep;


    $("#sleepProgress").style.width =
        `${Math.min(
            100,
            state.tracker.sleep / 9 * 100
        )}%`;


    /* Steps */

    $("#stepsValue").textContent =
        state.tracker.steps.toLocaleString();


    $("#stepsProgress").style.width =
        `${Math.min(
            100,
            state.tracker.steps / 8000 * 100
        )}%`;


    /* Tracker */

    $("#trackerWater").textContent =
        state.tracker.water;


    $("#trackerSteps").textContent =
        state.tracker.steps.toLocaleString();


    $("#trackerStepsProgress").style.width =
        `${Math.min(
            100,
            state.tracker.steps / 8000 * 100
        )}%`;


    $("#sleepRange").value =
        state.tracker.sleep;


    $("#sleepRangeValue").textContent =
        `${state.tracker.sleep} hours`;


    updateWaterButtons();

}


/* =========================
   WATER TRACKER
========================= */

function updateWaterButtons() {

    $$("#waterGlasses button").forEach(button => {

        const glass =
            Number(button.dataset.glass);


        button.classList.toggle(
            "active",
            glass <= state.tracker.water
        );

    });

}


$$("#waterGlasses button").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            state.tracker.water =
                Number(button.dataset.glass);

            saveState();

            updateDashboard();

            showToast(
                "Water updated",
                `${state.tracker.water} glasses logged today.`
            );

        }
    );

});


/* =========================
   SLEEP TRACKER
========================= */

$("#sleepRange").addEventListener(
    "input",
    event => {

        const value =
            Number(event.target.value);


        $("#sleepRangeValue").textContent =
            `${value.toFixed(1)} hours`;

    }
);


$("#saveSleep").addEventListener(
    "click",
    () => {

        state.tracker.sleep =
            Number($("#sleepRange").value);


        saveState();

        updateDashboard();

        showToast(
            "Sleep saved",
            "Your sleep data has been updated."
        );

    }
);


/* =========================
   STEPS
========================= */

$("#addSteps").addEventListener(
    "click",
    () => {

        state.tracker.steps += 500;

        saveState();

        updateDashboard();

        showToast(
            "Activity updated",
            "+500 steps added."
        );

    }
);


/* =========================
   ASSESSMENT
========================= */

let assessmentStep = 1;


function showAssessmentStep(step) {

    assessmentStep = step;


    $$(".assessment-step").forEach(item => {

        item.classList.remove("active");

    });


    const target =
        $(`#step${step}`);


    if (target) {

        target.classList.add("active");

    }


    $$(".step-indicator .step").forEach(
        (item, index) => {

            item.classList.toggle(
                "active",
                index < step
            );

        }
    );

}


$$(".next-btn").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const next =
                Number(button.dataset.next);


            if (next === 2) {

                collectAssessmentStepOne();

            }


            if (next === 3) {

                collectAssessmentStepTwo();

            }


            showAssessmentStep(next);

        }
    );

});


$$(".prev-btn").forEach(button => {

    button.addEventListener(
        "click",
        () => {

            showAssessmentStep(
                Number(button.dataset.prev)
            );

        }
    );

});


function collectAssessmentStepOne() {

    const symptoms = [];


    $$(".symptom input:checked")
        .forEach(input => {

            symptoms.push(input.value);

        });


    state.assessment.symptoms =
        symptoms;

}


function collectAssessmentStepTwo() {

    state.assessment.sleep =
        Number($("#assessmentSleep").value);


    state.assessment.activity =
        $("#assessmentActivity").value;


    state.assessment.water =
        Number($("#assessmentWater").value);


    state.assessment.stress =
        $("#assessmentStress").value;

}


/* =========================
   EMERGENCY DETECTION
========================= */

function checkEmergencySymptoms(symptoms) {

    /*
       Demo safety rule.

       We intentionally do not attempt to diagnose.
       Certain serious symptoms simply trigger
       a recommendation to seek professional help.
    */

    const emergencyKeywords = [

        "chest_pain",
        "difficulty_breathing",
        "fainting",
        "severe_bleeding"

    ];


    return symptoms.some(
        symptom =>
            emergencyKeywords.includes(symptom)
    );

}


/* =========================
   RECOMMENDATION ENGINE
========================= */

function generateRecommendations() {

    const symptoms =
        state.assessment.symptoms || [];


    const recommendations = [];


    /* ======================
       SYMPTOM RULES
    ====================== */


    if (symptoms.includes("headache")) {

        recommendations.push({

            category: "HEADACHE",
            icon: "🤕",
            color: "blue",

            title: "Take a recovery break",

            text:
                "Consider resting in a quiet environment, staying hydrated, and taking regular screen breaks. If headaches are severe, sudden, recurring, or concerning, seek medical advice.",

            priority: "Medium"

        });

    }


    if (
        symptoms.includes("fever") &&
        symptoms.includes("cough")
    ) {

        recommendations.push({

            category: "RESPIRATORY",
            icon: "😷",
            color: "purple",

            title: "Monitor your symptoms",

            text:
                "Rest, maintain hydration, and monitor your temperature and symptoms. Consider professional medical advice if symptoms are severe, persistent, or worsening.",

            priority: "High"

        });

    }


    if (symptoms.includes("fatigue")) {

        recommendations.push({

            category: "ENERGY",
            icon: "⚡",
            color: "orange",

            title: "Prioritize recovery",

            text:
                "Review your sleep, hydration and daily activity. Give yourself adequate recovery time and seek medical advice if unexplained fatigue persists.",

            priority: "Medium"

        });

    }


    if (symptoms.includes("stress")) {

        recommendations.push({

            category: "MENTAL WELLNESS",
            icon: "🧘",
            color: "purple",

            title: "Create a stress reset",

            text:
                "Try a short walk, slow breathing exercise, brief screen-free time, or another activity that helps you relax.",

            priority: "Medium"

        });

    }


    if (symptoms.includes("sleep")) {

        recommendations.push({

            category: "SLEEP",
            icon: "😴",
            color: "purple",

            title: "Build a consistent sleep routine",

            text:
                "Keep a consistent bedtime, reduce stimulating screen use before sleep, and aim for approximately 7–9 hours when possible.",

            priority: "High"

        });

    }


    if (symptoms.includes("stomach")) {

        recommendations.push({

            category: "DIGESTION",
            icon: "🥗",
            color: "green",

            title: "Choose lighter meals",

            text:
                "Stay hydrated and consider smaller, simple meals while monitoring how you feel. Seek medical care for severe or persistent symptoms.",

            priority: "Medium"

        });

    }


    /* ======================
       LIFESTYLE RULES
    ====================== */


    if (state.assessment.water < 6) {

        recommendations.push({

            category: "HYDRATION",
            icon: "💧",
            color: "blue",

            title: "Increase hydration",

            text:
                "Your reported water intake is relatively low. Drink water regularly throughout the day and adjust your intake based on activity, climate and individual needs.",

            priority: "High"

        });

    }


    if (state.assessment.sleep < 7) {

        recommendations.push({

            category: "RECOVERY",
            icon: "😴",
            color: "purple",

            title: "Protect your sleep",

            text:
                "Your reported sleep is below the commonly recommended range for adults. Try creating a consistent sleep and wake schedule.",

            priority: "High"

        });

    }


    if (state.assessment.activity === "low") {

        recommendations.push({

            category: "ACTIVITY",
            icon: "🏃",
            color: "orange",

            title: "Add more movement",

            text:
                "Try adding short walks or movement breaks throughout the day. Gradually work toward regular moderate physical activity.",

            priority: "Medium"

        });

    }


    if (state.assessment.stress === "high") {

        recommendations.push({

            category: "STRESS",
            icon: "🧘",
            color: "purple",

            title: "Focus on stress management",

            text:
                "Consider short breathing exercises, movement, social connection and regular breaks. If stress feels overwhelming or persistent, consider talking with a qualified professional.",

            priority: "High"

        });

    }


    /* Default */

    if (recommendations.length === 0) {

        recommendations.push({

            category: "GENERAL WELLNESS",
            icon: "🌱",
            color: "green",

            title: "Keep your healthy routine",

            text:
                "Continue focusing on balanced nutrition, regular movement, adequate sleep, hydration and preventive healthcare.",

            priority: "Low"

        });

    }


    return recommendations;

}


/* =========================
   GENERATE BUTTON
========================= */

$("#generateBtn").addEventListener(
    "click",
    () => {

        collectAssessmentStepTwo();

        saveState();


        const symptoms =
            state.assessment.symptoms || [];


        if (
            checkEmergencySymptoms(symptoms)
        ) {

            $("#emergencyModal")
                .classList.add("active");

        }


        const recommendations =
            generateRecommendations();


        renderRecommendations(
            recommendations
        );


        saveAssessmentHistory();


        updateDashboard();


        showToast(
            "Assessment complete",
            "Your personalized recommendations are ready."
        );


        setTimeout(
            () => {

                showSection(
                    "recommendations"
                );

            },
            400
        );

    }
);


/* =========================
   RENDER RECOMMENDATIONS
========================= */

function renderRecommendations(
    recommendations
) {

    const container =
        $("#recommendationContainer");


    container.innerHTML = "";


    const grid =
        document.createElement("div");


    grid.className =
        "recommendation-grid";


    recommendations.forEach(rec => {

        const card =
            document.createElement("div");


        card.className =
            "recommendation-card";


        card.innerHTML = `

            <div class="rec-icon ${rec.color}">
                ${rec.icon}
            </div>

            <span class="rec-category">
                ${rec.category}
            </span>

            <h3>
                ${rec.title}
            </h3>

            <p>
                ${rec.text}
            </p>

            <div class="rec-action">

                <span>Priority</span>

                <strong>
                    ${rec.priority}
                </strong>

            </div>

        `;


        grid.appendChild(card);

    });


    container.appendChild(grid);


    $("#recommendationSubtitle")
        .textContent =
        `${recommendations.length} personalized recommendations generated from your latest assessment.`;

}


/* =========================
   HISTORY
========================= */

function saveAssessmentHistory() {

    const score =
        calculateHealthScore();


    const item = {

        id: Date.now(),

        date:
            new Date().toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            ),

        score,

        symptoms:
            [...state.assessment.symptoms]

    };


    state.history.unshift(item);


    /* Keep last 10 */

    state.history =
        state.history.slice(0, 10);


    saveState();

    renderHistory();

}


function renderHistory() {

    const container =
        $("#historyContainer");


    if (!state.history.length) {

        container.innerHTML = `

            <div class="empty-state">

                <div>📋</div>

                <h3>No assessments yet</h3>

                <p>
                    Complete your first health assessment
                    to see your history here.
                </p>

                <button
                    class="primary-btn"
                    data-go="assessment"
                >
                    Start Assessment
                </button>

            </div>

        `;


        container
            .querySelector("[data-go]")
            .addEventListener(
                "click",
                () => showSection("assessment")
            );

        return;

    }


    container.innerHTML =
        state.history.map(item => {

            let risk = "Healthy";


            if (item.score < 60) {

                risk = "Needs attention";

            } else if (item.score < 80) {

                risk = "Moderate";

            }


            return `

                <div class="history-item">

                    <div>

                        <strong>
                            Health Assessment
                        </strong>

                        <div class="history-date">
                            ${item.date}
                        </div>

                    </div>

                    <div class="history-score">
                        ${item.score}/100
                    </div>

                    <div class="history-risk">
                        ${risk}
                    </div>

                </div>

            `;

        }).join("");

}


$("#clearHistory").addEventListener(
    "click",
    () => {

        if (!state.history.length) {

            showToast(
                "Nothing to clear",
                "Your assessment history is already empty."
            );

            return;

        }


        const confirmed =
            confirm(
                "Clear all assessment history?"
            );


        if (!confirmed) return;


        state.history = [];

        saveState();

        renderHistory();

        showToast(
            "History cleared",
            "Your assessment history has been removed."
        );

    }
);


/* =========================
   EMERGENCY MODAL
========================= */

$("#closeEmergency").addEventListener(
    "click",
    () => {

        $("#emergencyModal")
            .classList.remove("active");

    }
);


$("#emergencyModal")
    .addEventListener(
        "click",
        event => {

            if (
                event.target ===
                $("#emergencyModal")
            ) {

                $("#emergencyModal")
                    .classList.remove("active");

            }

        }
    );


/* =========================
   TOAST
========================= */

let toastTimer;


function showToast(
    title,
    message
) {

    $("#toastTitle").textContent =
        title;

    $("#toastMessage").textContent =
        message;


    $("#toast").classList.add("show");


    clearTimeout(toastTimer);


    toastTimer =
        setTimeout(
            () => {

                $("#toast")
                    .classList.remove("show");

            },
            3000
        );

}


/* =========================
   CHART
========================= */

let healthChart;


function createChart() {

    const canvas =
        $("#healthChart");


    if (!canvas) return;


    const ctx =
        canvas.getContext("2d");


    const gradient =
        ctx.createLinearGradient(
            0,
            0,
            0,
            220
        );


    gradient.addColorStop(
        0,
        "rgba(23,105,255,.20)"
    );


    gradient.addColorStop(
        1,
        "rgba(23,105,255,0)"
    );


    const labels = [
        "Mon",
        "Tue",
        "Wed",
        "Thu",
        "Fri",
        "Sat",
        "Today"
    ];


    const data = [
        73,
        77,
        75,
        81,
        79,
        84,
        calculateHealthScore()
    ];


    healthChart =
        new Chart(
            ctx,
            {

                type: "line",

                data: {

                    labels,

                    datasets: [

                        {

                            data,

                            borderColor:
                                "#1769ff",

                            backgroundColor:
                                gradient,

                            fill: true,

                            tension: .4,

                            pointRadius: 3,

                            pointBackgroundColor:
                                "#1769ff",

                            borderWidth: 2

                        }

                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        }

                    },

                    scales: {

                        y: {

                            min: 40,

                            max: 100,

                            ticks: {
                                font: {
                                    size: 9
                                }
                            },

                            grid: {
                                color:
                                    "#edf0f4"
                            }

                        },

                        x: {

                            ticks: {
                                font: {
                                    size: 9
                                }
                            },

                            grid: {
                                display: false
                            }

                        }

                    }

                }

            }
        );

}


/* =========================
   CHART PERIOD
========================= */

$("#chartPeriod").addEventListener(
    "change",
    event => {

        if (!healthChart) return;


        if (
            event.target.value ===
            "30 Days"
        ) {

            healthChart.data.labels = [
                "1",
                "5",
                "10",
                "15",
                "20",
                "25",
                "30"
            ];


            healthChart.data.datasets[0]
                .data = [
                    70,
                    75,
                    73,
                    79,
                    82,
                    80,
                    calculateHealthScore()
                ];

        } else {

            healthChart.data.labels = [
                "Mon",
                "Tue",
                "Wed",
                "Thu",
                "Fri",
                "Sat",
                "Today"
            ];


            healthChart.data.datasets[0]
                .data = [
                    73,
                    77,
                    75,
                    81,
                    79,
                    84,
                    calculateHealthScore()
                ];

        }


        healthChart.update();

    }
);


/* =========================
   NOTIFICATION
========================= */

$("#notificationBtn").addEventListener(
    "click",
    () => {

        showToast(
            "Health reminder",
            "Remember to stay hydrated today."
        );

    }
);


/* =========================
   INITIALIZATION
========================= */

function initialize() {

    setDate();

    loadProfile();

    calculateBMI();

    updateDashboard();

    renderHistory();

    createChart();

    updatePageHeader(
        "dashboard"
    );

}


/* Start */

initialize();