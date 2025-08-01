import { flowchartQuestions, resultsContent } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const startScreen = document.getElementById('start-screen');
    const quizScreen = document.getElementById('quiz-screen');
    const resultScreen = document.getElementById('result-screen');

    const startBtn = document.getElementById('start-btn');
    const backBtn = document.getElementById('back-btn');
    const resetBtn = document.getElementById('reset-btn');

    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-text');
    const questionContainer = document.getElementById('question-container');
    const questionText = document.getElementById('question-text');
    const questionHelpContainer = document.getElementById('question-help-container');
    const optionsContainer = document.getElementById('options-container');

    const resultTitle = document.getElementById('result-title');
    const resultSummary = document.getElementById('result-summary');
    const resultFeatures = document.getElementById('result-features');
    const resultNotes = document.getElementById('result-notes');
    const answersSummary = document.getElementById('answers-summary');

    const appContainer = document.getElementById('app-container');
    const helpModal = document.getElementById('help-modal');
    const helpModalContent = document.getElementById('help-modal-content');
    const helpModalTitle = document.getElementById('help-modal-title');
    const helpModalText = document.getElementById('help-modal-text');
    const helpModalClose = document.getElementById('help-modal-close');

    let state = {
        currentQuestionId: null,
        answers: {},
        history: [],
        totalQuestions: 0,
        quizType: 'flowchart',
        questionSet: flowchartQuestions,
    };

    function init() {
        startScreen.classList.remove('hidden');
        quizScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');

        state = {
            currentQuestionId: null,
            answers: {},
            history: [],
            totalQuestions: 0,
            quizType: 'flowchart',
            questionSet: flowchartQuestions,
        };
    }
    
    function startQuiz() {
        state.currentQuestionId = 'FQ1';
        state.totalQuestions = Object.keys(state.questionSet).length;
        
        startScreen.classList.add('hidden');
        quizScreen.classList.remove('hidden');
        renderQuestion(state.currentQuestionId);
    }

    function renderQuestion(id) {
        questionContainer.classList.add('question-fade-exit');
        
        setTimeout(() => {
            const question = state.questionSet[id]; 
            if (!question) {
                evaluateResult();
                return;
            }

            state.currentQuestionId = id;
            updateProgress();
            
            // Show flowchart visualization
            updateFlowchartPosition(id);
            
            questionText.textContent = question.text;
            
            questionHelpContainer.innerHTML = '';
            if (question.help) {
                const helpBtn = document.createElement('button');
                helpBtn.className = 'flex items-center text-sm text-blue-600 hover:text-blue-800 transition';
                helpBtn.innerHTML = `<i data-lucide="help-circle" class="w-4 h-4 mr-1"></i> <span>${question.help.title}</span>`;
                helpBtn.onclick = () => showHelp(question.help);
                questionHelpContainer.appendChild(helpBtn);
                lucide.createIcons();
            }

            optionsContainer.innerHTML = '';
            const options = question.options;

            options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option.text;
                button.className = 'option-button';
                button.onclick = () => handleAnswer(option.value);
                optionsContainer.appendChild(button);
            });

            backBtn.classList.toggle('hidden', state.history.length === 0);

            questionContainer.classList.remove('question-fade-exit');
        }, 250);
    }

    function handleAnswer(value) {
        const question = state.questionSet[state.currentQuestionId];
        state.answers[state.currentQuestionId] = { answer: value, text: question.text, optionText: question.options.find(o => o.value === value)?.text };

        state.history.push(state.currentQuestionId);
        
        let nextQuestionId = null;
        if (typeof question.next === 'function') {
            nextQuestionId = question.next(value, state.answers);
        }
        
        if (nextQuestionId) {
            renderQuestion(nextQuestionId);
        } else {
            let resultKey;
            if (question.result) {
                resultKey = typeof question.result === 'function' ? question.result(value) : question.result;
                showResult(resultKey);
            } else {
                evaluateResult();
            }
        }
    }

    function goBack() {
        if (state.history.length > 0) {
            const lastQuestionId = state.history.pop();
            delete state.answers[lastQuestionId];
            renderQuestion(lastQuestionId);
        }
    }

    function evaluateResult() {
        // This evaluation is for the flowchart path which has direct results
        console.error("Evaluation error: Reached end of flowchart without a result.");
    }

    function showResult(resultKey) {
        const content = resultsContent[resultKey];
        
        resultTitle.textContent = content.title;
        resultSummary.textContent = content.summary;
        resultFeatures.textContent = content.features;
        resultNotes.textContent = content.notes;
        
        answersSummary.innerHTML = '';
        Object.values(state.answers).forEach(ans => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="font-medium">${ans.text}</span> → ${ans.optionText}`;
            answersSummary.appendChild(li);
        });

        quizScreen.classList.add('hidden');
        resultScreen.classList.remove('hidden');
    }

    function updateProgress() {
        const currentStep = state.history.length + 1;
        const progress = (state.history.length / state.totalQuestions) * 100;
        progressBar.style.width = `${Math.min(progress, 100)}%`;
        progressText.textContent = `質問 ${currentStep} / ${state.totalQuestions}`;
    }

    function showHelp(helpContent) {
        helpModalTitle.textContent = helpContent.title;
        helpModalText.innerHTML = helpContent.text.replace(new RegExp('\n', 'g'), '<br>');
        helpModal.classList.remove('hidden');
        appContainer.setAttribute('aria-hidden', 'true');
        
        const focusableElements = helpModal.querySelectorAll('button');
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        firstFocusableElement.focus();

        helpModal.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                if (e.shiftKey) { // Shift + Tab
                    if (document.activeElement === firstFocusableElement) {
                        lastFocusableElement.focus();
                        e.preventDefault();
                    }
                } else { // Tab
                    if (document.activeElement === lastFocusableElement) {
                        firstFocusableElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    function hideHelp() {
        helpModal.classList.add('hidden');
        appContainer.setAttribute('aria-hidden', 'false');
    }

    // Helper function to update flowchart position text
    function updateFlowchartPosition(questionId) {
        const positionText = document.getElementById('flowchart-position');
        const positionMap = {
            'FQ1': '筆頭株主グループの議決権割合を確認中',
            'FQ2_A': '50%超の場合：あなたの株主区分を確認中',
            'FQ2_B': '30%以上50%以下の場合：あなたの株主区分を確認中',
            'FQ2_C': '30%未満の場合：あなたの株主区分を確認中',
            'FQ3': '取得後の議決権割合を確認中',
            'FQ3_B': '同族株主以外の場合：特例的評価方式が適用されます',
            'FQ4': '5%未満の場合：中心的な同族株主（株主）の有無を確認中',
            'FQ5': '中心的な同族株主がいる場合：あなたの該当性を確認中',
            'FQ6': '役員の有無を確認中'
        };
        
        positionText.textContent = positionMap[questionId] || 'フローチャート進行中';
        
        // Update flowchart highlighting
        updateFlowchartHighlighting(questionId);
        updatePathDisplay();
    }

    // Helper function to highlight current step in flowchart
    function updateFlowchartHighlighting(questionId) {
        // Remove all highlights first
        document.querySelectorAll('.flowchart-step').forEach(step => {
            step.querySelector('div').classList.remove('border-blue-500', 'bg-blue-50');
            step.querySelector('div').classList.add('border-slate-300', 'bg-slate-100');
        });
        
        document.querySelectorAll('.flowchart-option').forEach(option => {
            option.classList.remove('text-blue-700', 'font-semibold');
            option.classList.add('text-slate-600');
        });
        
        // Determine the current path based on answers
        const currentPath = determineCurrentPath();
        
        // Highlight current step based on path
        const currentStep = document.querySelector(`[data-path="${currentPath}"]`);
        if (currentStep) {
            currentStep.querySelector('div').classList.remove('border-slate-300', 'bg-slate-100');
            currentStep.querySelector('div').classList.add('border-blue-500', 'bg-blue-50');
        }
        
        // Highlight selected options based on answers
        highlightSelectedOptions();
    }

    // Helper function to determine current path
    function determineCurrentPath() {
        const answers = state.answers;
        let path = '';
        
        // Step 1: Voting rights
        if (answers['FQ1']) {
            const votingRights = answers['FQ1'].answer;
            if (votingRights === 'over_50') path = 'over_50';
            else if (votingRights === '30_to_50') path = '30_to_50';
            else if (votingRights === 'under_30') path = 'under_30';
        }
        
        // Step 2: Taxpayer type
        if (answers['FQ2_A'] || answers['FQ2_B'] || answers['FQ2_C']) {
            const taxpayerType = answers['FQ2_A']?.answer || answers['FQ2_B']?.answer || answers['FQ2_C']?.answer;
            if (path === 'over_50') {
                path += '_' + (taxpayerType === 'family' ? 'family' : 'other');
            } else if (path === '30_to_50') {
                path += '_' + (taxpayerType === 'family' ? 'family' : 'other');
            } else if (path === 'under_30') {
                path += '_' + (taxpayerType === 'family_etc' ? 'family_etc' : 'other');
            }
        }
        
        // Step 3: Voting rights after acquisition
        if (answers['FQ3']) {
            const votingAfter = answers['FQ3'].answer;
            path += '_' + (votingAfter ? '5plus' : '5minus');
        }
        
        // Step 4: Central family shareholder
        if (answers['FQ4']) {
            const centralFamily = answers['FQ4'].answer;
            path += '_central_' + (centralFamily ? 'yes' : 'no');
        }
        
        // Step 5: Taxpayer central family shareholder
        if (answers['FQ5']) {
            const taxpayerCentral = answers['FQ5'].answer;
            path += '_' + (taxpayerCentral ? 'yes' : 'no');
        }
        
        // Step 6: Officer status
        if (answers['FQ6']) {
            const officer = answers['FQ6'].answer;
            path += '_' + (officer ? 'yes' : 'no');
        }
        
        return path;
    }

    // Helper function to highlight selected options
    function highlightSelectedOptions() {
        Object.entries(state.answers).forEach(([questionId, answer]) => {
            const step = document.querySelector(`[data-step="${questionId}"]`);
            if (step) {
                const option = step.querySelector(`[data-option="${answer.answer}"]`);
                if (option) {
                    option.classList.remove('text-slate-600');
                    option.classList.add('text-blue-700', 'font-semibold');
                }
            }
        });
    }

    // Helper function to update path display
    function updatePathDisplay() {
        const pathDisplay = document.getElementById('path-display');
        const pathSteps = [];
        
        // Build path based on answers
        if (state.answers['FQ1']) {
            const answer = state.answers['FQ1'].answer;
            if (answer === 'over_50') pathSteps.push('50%超');
            else if (answer === '30_to_50') pathSteps.push('30%以上50%以下');
            else if (answer === 'under_30') pathSteps.push('30%未満');
        }
        
        if (state.answers['FQ2_A'] || state.answers['FQ2_B'] || state.answers['FQ2_C']) {
            const answer = state.answers['FQ2_A']?.answer || state.answers['FQ2_B']?.answer || state.answers['FQ2_C']?.answer;
            if (answer === 'family') pathSteps.push('同族株主');
            else if (answer === 'family_etc') pathSteps.push('同族株主等');
            else if (answer === 'other') pathSteps.push('同族株主以外');
        }
        
        if (state.answers['FQ3']) {
            const answer = state.answers['FQ3'].answer;
            pathSteps.push(answer ? '5%以上' : '5%未満');
        }
        
        if (state.answers['FQ4']) {
            const answer = state.answers['FQ4'].answer;
            pathSteps.push(answer ? '中心的な同族株主（株主）がいる' : '中心的な同族株主（株主）がいない');
        }
        
        if (state.answers['FQ5']) {
            const answer = state.answers['FQ5'].answer;
            pathSteps.push(answer ? '中心的な同族株主に該当' : '中心的な同族株主に該当しない');
        }
        
        if (state.answers['FQ6']) {
            const answer = state.answers['FQ6'].answer;
            pathSteps.push(answer ? '役員である' : '役員でない');
        }
        
        if (pathSteps.length > 0) {
            pathDisplay.innerHTML = pathSteps.map((step, index) => 
                `<span class="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">${index + 1}. ${step}</span>`
            ).join('');
        } else {
            pathDisplay.innerHTML = '<span class="text-slate-500">まだ選択されていません</span>';
        }
    }

    // Event Listeners
    startBtn.addEventListener('click', startQuiz);
    backBtn.addEventListener('click', goBack);
    resetBtn.addEventListener('click', init);
    helpModalClose.addEventListener('click', hideHelp);
    helpModal.addEventListener('click', (e) => {
        if (e.target === helpModal) {
            hideHelp();
        }
    });

    init();
});
