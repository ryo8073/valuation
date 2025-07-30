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
