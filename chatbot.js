/* chatbot.js - Chatbot logic */

(function() {
    if (!document.querySelector('link[href*="font-awesome"], link[href*="fontawesome"]')) {
        const faLink = document.createElement('link');
        faLink.rel = 'stylesheet';
        faLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css';
        document.head.appendChild(faLink);
    }

    // Inject HTML
    const container = document.createElement('div');
    container.innerHTML = `
        <button id="gcti-fab"><svg width="24" height="24" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg><div id="gcti-fab-badge"></div></button>
        <div id="gcti-chat-panel">
            <div class="gcti-header"><h3><i class="fas fa-robot" aria-hidden="true"></i> GCTI Assistant</h3></div>
            <div class="gcti-messages" id="gcti-messages"></div>
            <div class="gcti-input-row">
                <input type="text" class="gcti-input" id="gcti-input" placeholder="Type a message...">
                <button class="gcti-send" id="gcti-send">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(container);

    const fab = document.getElementById('gcti-fab');
    const panel = document.getElementById('gcti-chat-panel');
    const msgArea = document.getElementById('gcti-messages');
    const input = document.getElementById('gcti-input');
    const sendBtn = document.getElementById('gcti-send');
    let lastIntent = null;

    fab.onclick = () => panel.classList.toggle('open');
    sendBtn.onclick = handleSend;
    input.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };

    function addMsg(text, sender, options = null) {
        const div = document.createElement('div');
        div.className = `gcti-msg ${sender}`;
        div.innerText = text;
        msgArea.appendChild(div);

        if (options) {
            const chips = document.createElement('div');
            chips.className = 'gcti-chips';
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'gcti-chip';
                btn.innerText = opt;
                btn.onclick = () => { handleUserMsg(opt); chips.remove(); };
                chips.appendChild(btn);
            });
            msgArea.appendChild(chips);
        }
        msgArea.scrollTop = msgArea.scrollHeight;
    }

    function handleSend() {
        const val = input.value.trim();
        if (!val) return;
        addMsg(val, 'user');
        input.value = '';
        handleUserMsg(val);
    }

    const INTENT_MAP = [
        { keywords: ["what is", "tell me", "new to", "about the programme", "traineeship", "what's this"], id: "about" },
        { keywords: ["job guarantee", "guarantee", "jobs", "salary", "career", "employment", "get a job"], id: "careers" },
        { keywords: ["curriculum", "learn", "modules", "hands-on", "labs", "certifications", "cert", "study"], id: "curriculum" },
        { keywords: ["join", "apply", "eligibility", "requirements", "experience", "part-time", "full-time", "can i"], id: "admissions" },
        { keywords: ["cost", "fee", "price", "pay", "instalment", "installment", "funding", "worth it", "refund"], id: "fees" },
        { keywords: ["global", "recognised", "recognized", "remote", "international", "country"], id: "global" },
        { keywords: ["mentor", "mentorship", "community", "support", "coach"], id: "support" },
        { keywords: ["outcome", "graduate", "end of", "what will i have", "finish", "complete"], id: "outcomes" },
        { keywords: ["human", "speak to", "advisor", "whatsapp", "email", "phone", "talk to someone"], id: "handoff" }
    ];

    const RESPONSES = {
        about: { text: "The Global Cyber Talent Traineeship is a job-focused cybersecurity training programme designed to take beginners or early-career professionals into job-ready roles such as SOC Analyst, Cybersecurity Technician, or GRC Analyst. What would you like to explore?", options: ["Who is it for?", "How long does it take?", "What makes it different?", "Entry requirements"] },
        careers: { text: "Yes — we offer a job guarantee. If you complete the programme and follow the career process, you receive a job offer or a refund. What would you like to explore?", options: ["How the guarantee works", "Roles I can get", "Salary expectations", "Career support"] },
        curriculum: { text: "Our curriculum follows the global 2026 cybersecurity roadmap. What would you like to explore?", options: ["Modules", "Hands-on labs", "Certifications", "Portfolio projects"] },
        admissions: { text: "Let's check your eligibility. What would you like to know?", options: ["Experience required?", "Technical requirements", "Study schedule", "Who succeeds?"] },
        fees: { text: "We offer flexible pricing and instalment plans. What would you like to explore?", options: ["Programme cost", "Payment plans", "ROI & salary recovery", "Refund policy"] },
        global: { text: "Yes — our curriculum aligns with global cybersecurity standards. What would you like to explore?", options: ["International recognition", "Remote job opportunities", "Country-specific pathways"] },
        support: { text: "You'll have access to mentors, instructors, and a global community. What would you like to explore?", options: ["Mentorship", "Community", "Career coaching"] },
        outcomes: { text: "By the end, you'll have a job-ready portfolio, industry certifications, hands-on experience, interview readiness, and a guaranteed job offer. Would you like to see a graduate success roadmap?", options: ["Graduate roadmap", "Apply now"] },
        handoff: { text: "I can connect you to a human advisor. Which would you prefer?", options: ["WhatsApp", "Email", "Phone call"] },
        default: { text: "I'm not sure I understood that — here are some things I can help you with:", options: ["About the programme", "Job guarantee", "Curriculum", "Fees & funding", "Speak to someone"] }
    };

    function handleUserMsg(text) {
        if (text === "Back to main menu") {
            lastIntent = null;
            addMsg(RESPONSES.default.text, "bot", RESPONSES.default.options);
            return;
        }
        if (text === "Apply now") {
            window.open("https://www.globalcybertalent.org/contact.html", "_blank");
            addMsg("Great! I'm redirecting you to our application page.", "bot");
            return;
        }

        // Typing indicator simulation
        const indicator = document.createElement('div');
        indicator.className = 'gcti-typing';
        indicator.innerHTML = '<div class="gcti-dot"></div><div class="gcti-dot" style="animation-delay:0.2s"></div><div class="gcti-dot" style="animation-delay:0.4s"></div>';
        msgArea.appendChild(indicator);
        msgArea.scrollTop = msgArea.scrollHeight;

        setTimeout(() => {
            indicator.remove();
            let response = null;

            // Sub-intent logic (branching)
            if (lastIntent && RESPONSES[lastIntent] && RESPONSES[lastIntent].sub && RESPONSES[lastIntent].sub[text]) {
                response = RESPONSES[lastIntent].sub[text];
            } else {
                // Keyword match
                const match = INTENT_MAP.find(m => m.keywords.some(k => text.toLowerCase().includes(k)));
                if (match) {
                    lastIntent = match.id;
                    response = RESPONSES[match.id];
                } else {
                    response = RESPONSES.default;
                }
            }
            addMsg(response.text, "bot", response.options);
        }, 1000);
    }

    // Initialize
    setTimeout(() => {
        addMsg("Hi! I'm the GCTI Assistant. I can help you learn about the programme, job guarantee, curriculum, fees, and more. What would you like to know?", "bot", ["About the programme", "Job guarantee", "Curriculum", "Fees & funding", "Speak to someone"]);
    }, 400);
})();
