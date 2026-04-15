// ============================================
// 未上場株式 評価方式かんたん診断
// メインアプリケーション
// ============================================

import { guidedQuestions, flowchartQuestions, industryThresholds, resultsContent } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    // ===== DOM Elements =====
    const $ = (id) => document.getElementById(id);

    const modeScreen = $('mode-screen');
    const quizScreen = $('quiz-screen');
    const resultScreen = $('result-screen');

    const modeGuidedBtn = $('mode-guided');
    const modeFlowchartBtn = $('mode-flowchart');
    const backToModeBtn = $('back-to-mode');
    const backBtn = $('back-btn');
    const resetBtn = $('reset-btn');
    const retryBtn = $('retry-btn');

    const progressBar = $('progress-bar');
    const stepLabel = $('step-label');
    const categoryLabel = $('category-label');
    const questionText = $('question-text');
    const helpBtn = $('help-btn');
    const helpBtnText = $('help-btn-text');
    const optionsContainer = $('options-container');
    const decisionPath = $('decision-path');
    const decisionPathItems = $('decision-path-items');

    const flowchartPanel = $('flowchart-panel');
    const flowchartTree = $('flowchart-tree');

    const resultBadge = $('result-badge');
    const resultTitle = $('result-title');
    const resultSubtitle = $('result-subtitle');
    const resultSummary = $('result-summary');
    const resultFeatures = $('result-features');
    const resultNotes = $('result-notes');
    const resultDetails = $('result-details');
    const answerTrail = $('answer-trail');

    const helpModal = $('help-modal');
    const helpModalTitle = $('help-modal-title');
    const helpModalText = $('help-modal-text');
    const helpModalClose = $('help-modal-close');

    // ===== State =====
    let state = {
        mode: null, // 'guided' or 'flowchart'
        currentQuestionId: null,
        answers: {},    // { questionId: { answer, text, optionText, desc } }
        history: [],    // [questionId, ...]
        questionSet: null,
    };

    // ===== Screen Management =====
    function showScreen(screen) {
        [modeScreen, quizScreen, resultScreen].forEach(s => s.classList.add('hidden'));
        screen.classList.remove('hidden');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // ===== Mode Selection =====
    function selectMode(mode) {
        state = {
            mode,
            currentQuestionId: null,
            answers: {},
            history: [],
            questionSet: mode === 'guided' ? guidedQuestions : flowchartQuestions,
        };

        const firstQ = mode === 'guided' ? 'Q1' : 'FQ1';
        state.currentQuestionId = firstQ;

        showScreen(quizScreen);

        // Show/hide flowchart panel
        if (flowchartPanel) {
            flowchartPanel.classList.toggle('hidden', mode !== 'flowchart');
        }

        renderQuestion(firstQ);
    }

    // ===== Question Rendering =====
    function renderQuestion(id) {
        const container = $('question-card');
        container.classList.add('fade-out');

        setTimeout(() => {
            const question = state.questionSet[id];
            if (!question) {
                evaluateResult();
                return;
            }

            state.currentQuestionId = id;

            // Update progress
            updateProgress();

            // Category label
            if (question.category) {
                categoryLabel.textContent = question.category;
                categoryLabel.classList.remove('hidden');
            } else {
                categoryLabel.classList.add('hidden');
            }

            // Determine if we should use alt text (Q1b path = 同族株主のいない会社)
            const useAltText = state.mode === 'guided' && state.answers['Q1b'] && !state.answers['Q2'];

            // Question text (with dynamic alt text support)
            const displayText = (useAltText && question.altText) ? question.altText : question.text;
            questionText.textContent = displayText;

            // Help button (with dynamic alt help support)
            const displayHelp = (useAltText && question.altHelp) ? question.altHelp : question.help;
            if (displayHelp) {
                helpBtn.classList.remove('hidden');
                helpBtnText.textContent = displayHelp.title;
                helpBtn.onclick = () => showHelp(displayHelp);
            } else {
                helpBtn.classList.add('hidden');
            }

            // Options (with dynamic alt options support)
            optionsContainer.innerHTML = '';
            let options = (useAltText && question.altOptions) ? question.altOptions : question.options;

            // Dynamic options for industry-dependent questions (guided mode)
            if (state.mode === 'guided') {
                const industry = state.answers['Q8']?.answer;
                if (industry && id === 'Q10') {
                    options = industryThresholds[industry].assets;
                } else if (industry && id === 'Q11') {
                    options = industryThresholds[industry].sales;
                }
            }

            options.forEach((option, index) => {
                const btn = document.createElement('button');
                btn.className = 'option-btn';
                btn.innerHTML = `
                    <span class="option-text">${option.text}</span>
                    ${option.desc ? `<span class="option-desc">${option.desc}</span>` : ''}
                `;
                btn.style.animationDelay = `${index * 0.05}s`;
                btn.onclick = () => handleAnswer(option.value, option.text, option.desc);
                optionsContainer.appendChild(btn);
            });

            // Back button
            backBtn.classList.toggle('hidden', state.history.length === 0);

            // Decision path
            updateDecisionPath();

            // Flowchart tree (flowchart mode)
            if (state.mode === 'flowchart' && flowchartPanel) {
                updateFlowchartTree();
            }

            container.classList.remove('fade-out');
            container.classList.add('fade-in');
            setTimeout(() => container.classList.remove('fade-in'), 300);
        }, 200);
    }

    // ===== Answer Handling =====
    function handleAnswer(value, optionText, desc) {
        const question = state.questionSet[state.currentQuestionId];

        // For dynamic option text (guided Q10/Q11)
        let actualOptionText = optionText;
        if (state.mode === 'guided' && (state.currentQuestionId === 'Q10' || state.currentQuestionId === 'Q11')) {
            const industry = state.answers['Q8']?.answer;
            if (industry) {
                const thresholds = state.currentQuestionId === 'Q10'
                    ? industryThresholds[industry].assets
                    : industryThresholds[industry].sales;
                const opt = thresholds.find(o => o.value === value);
                if (opt) actualOptionText = opt.text;
            }
        }

        state.answers[state.currentQuestionId] = {
            answer: value,
            text: question.text,
            optionText: actualOptionText,
            desc: desc || ''
        };
        state.history.push(state.currentQuestionId);

        // Determine next question
        let nextQ = null;
        if (typeof question.next === 'function') {
            nextQ = question.next(value, state.answers);
        }

        if (nextQ) {
            renderQuestion(nextQ);
        } else {
            // Check for direct result (flowchart mode)
            if (question.result) {
                const resultKey = typeof question.result === 'function'
                    ? question.result(value)
                    : question.result;
                if (resultKey) {
                    showResult(resultKey);
                    return;
                }
            }
            // Evaluate based on answers
            evaluateResult();
        }
    }

    // ===== Back Navigation =====
    function goBack() {
        if (state.history.length > 0) {
            const lastQ = state.history.pop();
            delete state.answers[lastQ];
            renderQuestion(lastQ);
        }
    }

    // ===== Result Evaluation =====
    function evaluateResult() {
        const ans = state.answers;

        if (state.mode === 'guided') {
            evaluateGuidedResult(ans);
        } else {
            // Flowchart: should not normally reach here (results via question.result)
            console.error('Flowchart reached evaluateResult without direct result');
            showResult('原則的評価');
        }
    }

    function evaluateGuidedResult(ans) {
        // Phase 1: 株主判定
        // Q2=No(同族株主でない) or Q1b=No(15%グループでない) or Q6=No(役員でない) → 配当還元
        // これらの場合は next=null で終了し、Q7に到達しない

        // Q7に到達しているかチェック
        if (!ans['Q7']) {
            showResult('配当還元方式');
            return;
        }

        // Phase 2: 特定の評価会社
        if (ans['Q7'].answer === true) {
            showResult('純資産価額方式');
            return;
        }

        // Phase 3: 会社規模判定
        // 従業員70人以上 → 大会社
        if (ans['Q9']?.answer === 'over70') {
            showResult('類似業種比準価額方式');
            return;
        }

        // 70人未満 → 総資産と取引金額の大きい方の区分を採用
        const assetSize = ans['Q10']?.answer;
        const salesSize = ans['Q11']?.answer;

        const sizeRank = { large: 3, medium: 2, small: 1 };
        const assetRank = sizeRank[assetSize] || 1;
        const salesRank = sizeRank[salesSize] || 1;
        const maxRank = Math.max(assetRank, salesRank);

        if (maxRank === 3) {
            showResult('類似業種比準価額方式');
        } else if (maxRank === 2) {
            showResult('併用方式');
        } else {
            showResult('純資産価額方式');
        }
    }

    // ===== Result Display =====
    function showResult(resultKey) {
        const content = resultsContent[resultKey];
        if (!content) {
            console.error('Unknown result:', resultKey);
            return;
        }

        // Hero card color
        const resultHero = $('result-hero');
        resultHero.className = `result-hero result-hero--${content.color} rounded-2xl p-8 md:p-10 text-center mb-8`;

        // Badge
        resultBadge.className = 'result-badge mx-auto mb-5';
        resultBadge.innerHTML = `<i data-lucide="${content.icon}" class="w-7 h-7"></i>`;

        // Title & subtitle
        resultTitle.textContent = content.title;
        if (content.subtitle && resultSubtitle) {
            resultSubtitle.textContent = content.subtitle;
            resultSubtitle.classList.remove('hidden');
        } else if (resultSubtitle) {
            resultSubtitle.classList.add('hidden');
        }

        // Content sections
        resultSummary.textContent = content.summary;
        resultFeatures.textContent = content.features;
        resultNotes.textContent = content.notes;

        // Details
        resultDetails.innerHTML = '';
        if (content.details) {
            content.details.forEach(d => {
                const div = document.createElement('div');
                div.className = 'result-detail-item';
                div.innerHTML = `<span class="result-detail-label">${d.label}</span><span class="result-detail-text">${d.text}</span>`;
                resultDetails.appendChild(div);
            });
        }

        // Answer trail
        answerTrail.innerHTML = '';
        let stepNum = 1;
        for (const qId of state.history) {
            const a = state.answers[qId];
            if (!a) continue;
            const item = document.createElement('div');
            item.className = 'trail-item';
            item.innerHTML = `
                <div class="trail-number">${stepNum}</div>
                <div class="trail-content">
                    <div class="trail-question">${a.text}</div>
                    <div class="trail-answer">${a.optionText}</div>
                </div>
            `;
            answerTrail.appendChild(item);
            stepNum++;
        }

        showScreen(resultScreen);
        lucide.createIcons();
    }

    // ===== Progress Update =====
    function updateProgress() {
        const answered = state.history.length;
        // Estimate total based on mode and path
        let estimatedTotal;
        if (state.mode === 'flowchart') {
            estimatedTotal = 6;
        } else {
            // Guided: min 2 (Q1→Q2=No), max 11
            const hasQ7 = state.answers['Q7'] !== undefined;
            if (hasQ7) {
                estimatedTotal = 11;
            } else {
                estimatedTotal = 7; // estimate until we know
            }
        }

        const progress = Math.min((answered / estimatedTotal) * 100, 95);
        progressBar.style.width = `${progress}%`;
        stepLabel.textContent = `ステップ ${answered + 1}`;
    }

    // ===== Decision Path =====
    function updateDecisionPath() {
        decisionPathItems.innerHTML = '';

        if (state.history.length === 0) {
            decisionPath.classList.add('hidden');
            return;
        }

        decisionPath.classList.remove('hidden');

        state.history.forEach((qId, index) => {
            const a = state.answers[qId];
            if (!a) return;

            const pill = document.createElement('span');
            pill.className = 'path-pill';
            pill.textContent = a.optionText;
            pill.title = a.text;
            decisionPathItems.appendChild(pill);

            if (index < state.history.length - 1) {
                const arrow = document.createElement('span');
                arrow.className = 'path-arrow';
                arrow.innerHTML = '<i data-lucide="chevron-right" class="w-3 h-3"></i>';
                decisionPathItems.appendChild(arrow);
            }
        });

        lucide.createIcons();
    }

    // ===== Flowchart Tree =====
    function updateFlowchartTree() {
        if (!flowchartTree) return;

        // Full decision tree with branching info
        const steps = [
            {
                id: 'FQ1', label: '筆頭株主グループの議決権割合', shortLabel: '①',
                branches: [
                    { condition: '50%超', next: '② 株主区分の判定' },
                    { condition: '30%〜50%', next: '② 株主区分の判定' },
                    { condition: '30%未満', next: '② 同族株主等の判定' }
                ]
            },
            {
                id: 'FQ2', label: '同族株主 / 同族株主等の判定', shortLabel: '②',
                variants: ['FQ2_A', 'FQ2_B', 'FQ2_C'],
                branches: [
                    { condition: '同族株主(等)', next: '③ 5%判定へ' },
                    { condition: 'それ以外', next: '配当還元方式', isResult: true }
                ]
            },
            {
                id: 'FQ3', label: '取得後の議決権割合（5%判定）', shortLabel: '③',
                branches: [
                    { condition: '5%以上', next: '原則的評価方式', isResult: true },
                    { condition: '5%未満', next: '④ 中心的株主の有無へ' }
                ]
            },
            {
                id: 'FQ4', label: '中心的な同族株主の有無', shortLabel: '④',
                branches: [
                    { condition: 'いる', next: '⑤ 該当性の確認へ' },
                    { condition: 'いない', next: '原則的評価方式', isResult: true }
                ]
            },
            {
                id: 'FQ5', label: '中心的な同族株主への該当', shortLabel: '⑤',
                branches: [
                    { condition: '該当する', next: '原則的評価方式', isResult: true },
                    { condition: '該当しない', next: '⑥ 役員判定へ' }
                ]
            },
            {
                id: 'FQ6', label: '役員かどうか', shortLabel: '⑥',
                branches: [
                    { condition: '役員', next: '原則的評価方式', isResult: true },
                    { condition: '役員でない', next: '配当還元方式', isResult: true }
                ]
            },
        ];

        let html = '';
        const currentQ = state.currentQuestionId;

        steps.forEach((step, i) => {
            const isAnswered = state.answers[step.id] ||
                (step.variants && step.variants.some(v => state.answers[v]));
            const isCurrent = step.id === currentQ ||
                (step.variants && step.variants.includes(currentQ));

            // Check if this step is in the future path (after current)
            const answeredIds = new Set(state.history);
            const isPast = answeredIds.has(step.id) ||
                (step.variants && step.variants.some(v => answeredIds.has(v)));

            let statusClass = 'tree-step--future';
            let answer = '';

            if (isAnswered || isPast) {
                statusClass = 'tree-step--done';
                const a = state.answers[step.id] ||
                    (step.variants && step.variants.map(v => state.answers[v]).find(Boolean));
                if (a) answer = a.optionText;
            } else if (isCurrent) {
                statusClass = 'tree-step--active';
            }

            // Find matching branch for the answer
            let matchedBranch = null;
            if (isAnswered) {
                const a = state.answers[step.id] ||
                    (step.variants && step.variants.map(v => state.answers[v]).find(Boolean));
                if (a) {
                    const question = state.questionSet[step.id] ||
                        (step.variants && step.variants.map(v => state.questionSet[v]).find(Boolean));
                    if (question && question.result) {
                        const r = typeof question.result === 'function' ? question.result(a.answer) : question.result;
                        if (r) {
                            matchedBranch = { next: r, isResult: true };
                        }
                    }
                }
            }

            // Build branches HTML
            let branchesHtml = '';
            if (step.branches && (isCurrent || statusClass === 'tree-step--future')) {
                branchesHtml = '<div class="tree-branches">';
                step.branches.forEach(b => {
                    const resultClass = b.isResult ? 'tree-branch--result' : '';
                    branchesHtml += `<div class="tree-branch ${resultClass}">
                        <span class="tree-branch-condition">${b.condition}</span>
                        <span class="tree-branch-arrow">→</span>
                        <span class="tree-branch-next">${b.next}</span>
                    </div>`;
                });
                branchesHtml += '</div>';
            }

            // Show result if answered and has result
            let resultHtml = '';
            if (matchedBranch) {
                resultHtml = `<div class="tree-step-result">→ ${matchedBranch.next}</div>`;
            }

            html += `
                <div class="tree-step ${statusClass}">
                    <div class="tree-step-marker">
                        <div class="tree-step-dot">${step.shortLabel}</div>
                        ${i < steps.length - 1 ? '<div class="tree-step-line"></div>' : ''}
                    </div>
                    <div class="tree-step-content">
                        <div class="tree-step-label">${step.label}</div>
                        ${answer ? `<div class="tree-step-answer">${answer}</div>` : ''}
                        ${resultHtml}
                        ${branchesHtml}
                    </div>
                </div>
            `;
        });

        flowchartTree.innerHTML = html;
    }

    // ===== Help Modal =====
    function showHelp(helpContent) {
        helpModalTitle.textContent = helpContent.title;
        helpModalText.innerHTML = helpContent.text.replace(/\n/g, '<br>');
        helpModal.classList.remove('hidden');
        helpModal.classList.add('modal-open');

        // Focus management
        setTimeout(() => helpModalClose.focus(), 100);

        // Escape key
        const handleEsc = (e) => {
            if (e.key === 'Escape') {
                hideHelp();
                document.removeEventListener('keydown', handleEsc);
            }
        };
        document.addEventListener('keydown', handleEsc);
    }

    function hideHelp() {
        helpModal.classList.remove('modal-open');
        helpModal.classList.add('hidden');
    }

    // ===== Reset =====
    function resetToMode() {
        showScreen(modeScreen);
        state = {
            mode: null,
            currentQuestionId: null,
            answers: {},
            history: [],
            questionSet: null,
        };
    }

    function retryQuiz() {
        if (state.mode) {
            selectMode(state.mode);
        } else {
            resetToMode();
        }
    }

    // ===== Event Listeners =====
    modeGuidedBtn.addEventListener('click', () => selectMode('guided'));
    modeFlowchartBtn.addEventListener('click', () => selectMode('flowchart'));
    backToModeBtn.addEventListener('click', resetToMode);
    backBtn.addEventListener('click', goBack);
    resetBtn.addEventListener('click', resetToMode);
    retryBtn.addEventListener('click', retryQuiz);
    helpModalClose.addEventListener('click', hideHelp);
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) hideHelp();
    });

    // Initialize
    showScreen(modeScreen);
    lucide.createIcons();
});
