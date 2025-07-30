# Product Requirements Document (PRD): Unlisted Stock Valuation Tool

## 1. Introduction & Vision

This document outlines the requirements for the Unlisted Stock Valuation Tool.

*   **Vision:** To empower individuals who own or are acquiring unlisted stocks with a simple, transparent, and reliable way to understand the potential valuation methods applicable to their situation. The tool aims to demystify a complex financial topic, reducing uncertainty and providing a clear, educated starting point for further professional consultation.

## 2. Goals & Objectives

*   Provide an instant, preliminary assessment of the likely stock valuation method.
*   Offer multiple, user-friendly paths to the same conclusion to accommodate different user preferences (guided vs. expert/flowchart-driven).
*   Educate users on the meaning and implications of each valuation method.
*   Maintain a clean, accessible, and professional user interface.

## 3. Target Audience

*   **Primary:** Individuals who are inheriting, gifting, or trading unlisted company shares and have little to no prior financial expertise.
*   **Secondary:** Financial advisors, accountants, and tax professionals looking for a quick reference tool to guide conversations with their clients.

## 4. Features & Scope

### 4.1. Method Selection Screen
*   **Description:** The initial screen of the application. It allows users to choose between two different assessment paths.
*   **Details:**
    *   Presents two clear choices: "Guided Questionnaire" and "Flowchart Quiz".
    *   Each choice includes a brief description of what the user can expect.

### 4.2. Guided Questionnaire
*   **Description:** A step-by-step quiz that abstracts the complex logic into a series of simple, easy-to-understand questions.
*   **Details:**
    *   Designed for users with no prior knowledge.
    *   Includes help text and tooltips for technical terms.
    *   Dynamically adapts questions based on previous answers.

### 4.3. Flowchart-Based Quiz
*   **Description:** An alternative path that directly mirrors the structure of the official tax agency flowchart for determining valuation methods.
*   **Details:**
    *   Designed for users who are familiar with the flowchart or prefer a more direct, expert-level approach.
    *   Questions and options map directly to the nodes and branches of the flowchart.

### 4.4. Results Display
*   **Description:** A final screen that clearly presents the determined valuation method.
*   **Details:**
    *   Displays the title of the valuation method (e.g., "配当還元方式").
    *   Provides a summary, key features, and important notes for the determined method.
    *   Shows a summary of the user's answers that led to the result.
    *   Includes a button to easily restart the quiz.

---

## 5. User Stories

### Epic: Valuation Method Determination

As a user of the valuation tool, I want to accurately determine the stock valuation method applicable to my situation so that I can make informed financial decisions.

*   **Story 1: Method Choice**
    *   **As a user,** I want to choose between a simple Q&A format and a flowchart-based format
    *   **so that** I can use the method I am most comfortable with.

*   **Story 2: Guided Path**
    *   **As a user new to stock valuation,** I want to be guided through a series of simple questions
    *   **so that** I can determine my valuation method without needing extensive prior knowledge.

*   **Story 3: Flowchart Path**
    *   **As a user familiar with the official flowchart,** I want to follow a quiz that maps directly to it
    *   **so that** I can verify my understanding and find the correct valuation method efficiently.

*   **Story 4: Clear Results**
    *   **As a user,** I want to see a clear result with a simple explanation of the valuation method
    *   **so that** I understand what it means and what my next steps might be.

*   **Story 5: Restart Quiz**
    *   **As a user,** I want to be able to easily restart the quiz
    *   **so that** I can correct a mistake or try a different scenario without refreshing the page. 