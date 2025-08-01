import { questions, flowchartQuestions, resultsContent } from './data.js';

document.addEventListener('DOMContentLoaded', () => {
    // Screens
    const choiceScreen = document.getElementById('choice-screen');
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

    // New Buttons from Choice Screen
    const startGuidedBtn = document.getElementById('start-guided-btn');
    const startFlowchartBtn = document.getElementById('start-flowchart-btn');

    const industryAssetOptions = {
        'wholesale': [
            { text: '20億円以上', value: 'Large' },
            { text: '7千万円以上 20億円未満', value: 'Medium' },
            { text: '7千万円未満', value: 'Small' }
        ],
        'retail_service': [
            { text: '10億円以上', value: 'Large' },
            { text: '4千万円以上 10億円未満', value: 'Medium' },
            { text: '4千万円未満', value: 'Small' }
        ],
        'other': [
            { text: '15億円以上', value: 'Large' },
            { text: '5千万円以上 15億円未満', value: 'Medium' },
            { text: '5千万円未満', value: 'Small' }
        ]
    };

    const industryTransactionOptions = {
        'wholesale': [
            { text: '30億円以上', value: 'Large' },
            { text: '2億円以上 30億円未満', value: 'Medium' },
            { text: '2億円未満', value: 'Small' }
        ],
        'retail_service': [
            { text: '20億円以上', value: 'Large' },
            { text: '6千万円以上 20億円未満', value: 'Medium' },
            { text: '6千万円未満', value: 'Small' }
        ],
        'other': [
            { text: '25億円以上', value: 'Large' },
            { text: '1億5千万円以上 25億円未満', value: 'Medium' },
            { text: '1億5千万円未満', value: 'Small' }
        ]
    };

    let state = {
        currentQuestionId: null,
        answers: {},
        history: [],
        totalQuestions: 0,
        quizType: null, // 'guided' or 'flowchart'
        questionSet: null,
    };

    function init() {
        choiceScreen.classList.remove('hidden');
        startScreen.classList.add('hidden');
        quizScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');

        state = {
            currentQuestionId: null,
            answers: {},
            history: [],
            totalQuestions: 0,
            quizType: null,
            questionSet: null,
        };
    }
    
    function showStartScreen() {
        choiceScreen.classList.add('hidden');
        startScreen.classList.remove('hidden');
    }

    function startQuiz(type) {
        state.quizType = type;
        if (type === 'guided') {
            state.questionSet = questions;
            state.currentQuestionId = 'Q1';
        } else {
            state.questionSet = flowchartQuestions;
            state.currentQuestionId = 'FQ1';
        }
        // Calculate total questions dynamically based on the question set
        state.totalQuestions = Object.keys(state.questionSet).length;
        
        startScreen.classList.add('hidden');
        choiceScreen.classList.add('hidden');
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
            
            // Show/hide flowchart visualization
            const flowchartViz = document.getElementById('flowchart-visualization');
            const currentPath = document.getElementById('current-path');
            if (state.quizType === 'flowchart') {
                flowchartViz.classList.remove('hidden');
                currentPath.classList.remove('hidden');
                updateFlowchartPosition(id);
            } else {
                flowchartViz.classList.add('hidden');
                currentPath.classList.add('hidden');
            }
            
            // Add dynamic question numbering for guided path
            let displayText = question.text;
            if (state.quizType === 'guided') {
                const questionNumber = getQuestionNumber(id);
                displayText = `${questionNumber} ${question.text}`;
            }
            
            questionText.textContent = displayText;
            
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
            let options = question.options;

            if (id === 'Q8' || id === 'Q9') {
                const industry = state.answers['Q6_5']?.answer;
                if (industry) {
                    if (id === 'Q8') {
                        options = industryAssetOptions[industry];
                    } else { // Q9
                        options = industryTransactionOptions[industry];
                    }
                }
            }

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

        // For dynamic questions, find the text from the correct options source
        if (state.currentQuestionId === 'Q8' || state.currentQuestionId === 'Q9') {
            const industry = state.answers['Q6_5']?.answer;
            const dynamicOptions = state.currentQuestionId === 'Q8' ? industryAssetOptions[industry] : industryTransactionOptions[industry];
            state.answers[state.currentQuestionId].optionText = dynamicOptions.find(o => o.value === value)?.text;
        }

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
        // This evaluation is now only for the 'guided' path.
        // Flowchart path has direct results.
        if (state.quizType !== 'guided') {
            // Should not happen if flowchart logic is correct
            console.error("Evaluation error: Reached end of flowchart without a result.");
            return;
        }

        let resultKey;
        const ans = state.answers;
        const phase1Answers = {
            q3: ans['Q3'] ? ans['Q3'].answer : null,
            q4: ans['Q4'] ? ans['Q4'].answer : null,
            q5: ans['Q5'] ? ans['Q5'].answer : null
        };

        if (phase1Answers.q3 === true || phase1Answers.q4 === true || phase1Answers.q5 === true) {

            if (ans['Q6'] && ans['Q6'].answer === true) {
                resultKey = '純資産価額方式';
            } else {
                const employeeSize = ans['Q7'].answer;
                const assetSize = ans['Q8'].answer;
                const transactionSize = ans['Q9'].answer;

                const sizes = [employeeSize, assetSize, transactionSize];
                
                const isLarge = sizes.filter(s => s === 'Large').length >= 2;
                const isSmall = sizes.filter(s => s === 'Small').length >= 2;

                let companySize;
                if (isLarge) {
                    companySize = 'Large';
                } else if (isSmall) {
                    companySize = 'Small';
                } else {
                    companySize = 'Medium';
                }

                if (companySize === 'Large') {
                    resultKey = '類似業種比準価額方式';
                } else if (companySize === 'Medium') {
                    resultKey = '併用方式';
                } else { // Small
                    resultKey = '純資産価額方式';
                }
            }
        } else {

            resultKey = '配当還元方式';
        }
        
        showResult(resultKey);
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

    // Helper function to get question number for guided path
    function getQuestionNumber(questionId) {
        const questionOrder = ['Q1', 'Q1_5', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q6_5', 'Q7', 'Q8', 'Q9'];
        const index = questionOrder.indexOf(questionId);
        return index !== -1 ? `Q${index + 1}.` : '';
    }

    // Helper function to update flowchart position text
    function updateFlowchartPosition(questionId) {
        const positionText = document.getElementById('flowchart-position');
        const positionMap = {
            'FQ1': '筆頭株主グループの議決権割合を確認中',
            'FQ2_A': '50%超の場合：あなたの株主区分を確認中',
            'FQ2_B': '30%以上50%以下の場合：あなたの株主区分を確認中',
            'FQ2_C': '30%未満の場合：あなたの株主区分を確認中',
            'FQ3_A': '同族株主の場合：取得後の議決権割合を確認中',
            'FQ3_B': '同族株主以外の場合：特例的評価方式が適用されます',
            'FQ4_A': '5%以上の場合：中心的な同族株主の有無を確認中',
            'FQ4_B': '5%未満の場合：役員の有無を確認中',
            'FQ5_A': '中心的な同族株主がいる場合：あなたの該当性を確認中',
            'FQ5_B': '中心的な同族株主がいない場合：役員の有無を確認中',
            'FQ6': '中心的な同族株主に該当する場合：役員の有無を確認中'
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
        if (answers['FQ3_A']) {
            const votingAfter = answers['FQ3_A'].answer;
            path += '_' + (votingAfter ? '5plus' : '5minus');
        }
        
        // Step 4: Central family shareholder or officer
        if (answers['FQ4_A'] || answers['FQ4_B']) {
            const centralFamily = answers['FQ4_A']?.answer;
            if (centralFamily !== undefined) {
                path += '_central_' + (centralFamily ? 'yes' : 'no');
            } else {
                // This is an officer question (FQ4_B)
                path += '_officer';
            }
        }
        
        // Step 5: Taxpayer central family shareholder or officer
        if (answers['FQ5_A'] || answers['FQ5_B']) {
            const taxpayerCentral = answers['FQ5_A']?.answer;
            if (taxpayerCentral !== undefined) {
                path += '_' + (taxpayerCentral ? 'yes' : 'no');
            } else {
                // This is an officer question (FQ5_B)
                path += '_officer';
            }
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
        
        if (state.answers['FQ3_A']) {
            const answer = state.answers['FQ3_A'].answer;
            pathSteps.push(answer ? '5%以上' : '5%未満');
        }
        
        if (state.answers['FQ4_A']) {
            const answer = state.answers['FQ4_A'].answer;
            pathSteps.push(answer ? '中心的な同族株主がいる' : '中心的な同族株主がいない');
        }
        
        if (state.answers['FQ5_A']) {
            const answer = state.answers['FQ5_A'].answer;
            pathSteps.push(answer ? '中心的な同族株主に該当' : '中心的な同族株主に該当しない');
        }
        
        if (state.answers['FQ6'] || state.answers['FQ4_B'] || state.answers['FQ5_B']) {
            const answer = state.answers['FQ6']?.answer || state.answers['FQ4_B']?.answer || state.answers['FQ5_B']?.answer;
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
    startGuidedBtn.addEventListener('click', showStartScreen);
    startFlowchartBtn.addEventListener('click', () => startQuiz('flowchart'));
    startBtn.addEventListener('click', () => startQuiz('guided'));
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
