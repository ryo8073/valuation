import { guidedQuestions, flowchartQuestions, resultsContent, industryThresholds } from './data.js';

// ===== データモジュールの直接テスト =====
// jest.mock を使わず、実際の data.js のロジックを検証する

describe('国税庁ロジック検証 - ガイド形式', () => {

    test('Q1=Yes → Q2 (同族株主の判定に進む)', () => {
        const q = guidedQuestions['Q1'];
        expect(q.next(true)).toBe('Q2');
    });

    test('Q1=No → Q1b (15%グループの確認)', () => {
        const q = guidedQuestions['Q1'];
        expect(q.next(false)).toBe('Q1b');
    });

    test('Q2=Yes(同族株主) → Q3 (中心的な同族株主の確認)', () => {
        const q = guidedQuestions['Q2'];
        expect(q.next(true)).toBe('Q3');
    });

    test('Q2=No(同族株主以外) → null (配当還元方式)', () => {
        const q = guidedQuestions['Q2'];
        expect(q.next(false)).toBeNull();
    });

    test('Q1b=Yes(15%グループ) → Q3', () => {
        const q = guidedQuestions['Q1b'];
        expect(q.next(true)).toBe('Q3');
    });

    test('Q1b=No → null (配当還元方式)', () => {
        const q = guidedQuestions['Q1b'];
        expect(q.next(false)).toBeNull();
    });

    test('Q3=No(中心的がいない) → Q7 (原則的評価が確定、会社規模判定へ)', () => {
        // 重要: 中心的な同族株主がいない場合、例外条件不成立で原則的評価
        const q = guidedQuestions['Q3'];
        expect(q.next(false)).toBe('Q7');
    });

    test('Q3=Yes(中心的がいる) → Q4', () => {
        const q = guidedQuestions['Q3'];
        expect(q.next(true)).toBe('Q4');
    });

    test('Q4=Yes(中心的に該当) → Q7 (原則的評価)', () => {
        const q = guidedQuestions['Q4'];
        expect(q.next(true)).toBe('Q7');
    });

    test('Q4=No(中心的でない) → Q5 (5%判定)', () => {
        const q = guidedQuestions['Q4'];
        expect(q.next(false)).toBe('Q5');
    });

    test('Q5=Yes(5%以上) → Q7 (原則的評価)', () => {
        const q = guidedQuestions['Q5'];
        expect(q.next(true)).toBe('Q7');
    });

    test('Q5=No(5%未満) → Q6 (役員判定)', () => {
        const q = guidedQuestions['Q5'];
        expect(q.next(false)).toBe('Q6');
    });

    test('Q6=Yes(役員) → Q7 (原則的評価)', () => {
        const q = guidedQuestions['Q6'];
        expect(q.next(true)).toBe('Q7');
    });

    test('Q6=No(役員でない) → null (配当還元方式: 4条件全該当)', () => {
        // 中心的がいる AND 中心的でない AND 5%未満 AND 役員でない → 配当還元
        const q = guidedQuestions['Q6'];
        expect(q.next(false)).toBeNull();
    });

    test('Q7=Yes(特定の評価会社) → null (純資産価額方式)', () => {
        const q = guidedQuestions['Q7'];
        expect(q.next(true)).toBeNull();
    });

    test('Q7=No → Q8 (業種判定へ)', () => {
        const q = guidedQuestions['Q7'];
        expect(q.next(false)).toBe('Q8');
    });

    test('Q9=over70(従業員70人以上) → null (大会社確定)', () => {
        const q = guidedQuestions['Q9'];
        expect(q.next('over70')).toBeNull();
    });

    test('Q9=under70(従業員70人未満) → Q10 (総資産判定)', () => {
        const q = guidedQuestions['Q9'];
        expect(q.next('under70')).toBe('Q10');
    });
});

describe('国税庁ロジック検証 - フローチャート形式', () => {

    test('FQ1: 議決権割合による分岐', () => {
        const q = flowchartQuestions['FQ1'];
        expect(q.next('over_50')).toBe('FQ2_A');
        expect(q.next('30_to_50')).toBe('FQ2_B');
        expect(q.next('under_30')).toBe('FQ2_C');
    });

    test('FQ2_A: 同族株主 → FQ3, 同族株主以外 → 配当還元', () => {
        const q = flowchartQuestions['FQ2_A'];
        expect(q.next('family')).toBe('FQ3');
        expect(q.next('other')).toBeNull();
        expect(q.result('other')).toBe('配当還元方式');
        expect(q.result('family')).toBeNull();
    });

    test('FQ2_C: 同族株主等 → FQ3, それ以外 → 配当還元', () => {
        const q = flowchartQuestions['FQ2_C'];
        expect(q.next('family_etc')).toBe('FQ3');
        expect(q.next('other')).toBeNull();
        expect(q.result('other')).toBe('配当還元方式');
    });

    test('FQ3: 5%以上 → 原則的評価, 5%未満 → FQ4', () => {
        const q = flowchartQuestions['FQ3'];
        expect(q.next(true)).toBeNull();
        expect(q.result(true)).toBe('原則的評価');
        expect(q.next(false)).toBe('FQ4');
        expect(q.result(false)).toBeNull();
    });

    test('FQ4=No(中心的がいない) → 原則的評価(直接結果)', () => {
        // 重要なバグ修正: 中心的がいない → 原則的評価が確定
        const q = flowchartQuestions['FQ4'];
        expect(q.next(false)).toBeNull();
        expect(q.result(false)).toBe('原則的評価');
    });

    test('FQ4=Yes(中心的がいる) → FQ5', () => {
        const q = flowchartQuestions['FQ4'];
        expect(q.next(true)).toBe('FQ5');
    });

    test('FQ5=Yes(中心的に該当) → 原則的評価', () => {
        const q = flowchartQuestions['FQ5'];
        expect(q.next(true)).toBeNull();
        expect(q.result(true)).toBe('原則的評価');
    });

    test('FQ5=No(中心的でない) → FQ6', () => {
        const q = flowchartQuestions['FQ5'];
        expect(q.next(false)).toBe('FQ6');
    });

    test('FQ6: 役員=原則的, 非役員=配当還元', () => {
        const q = flowchartQuestions['FQ6'];
        expect(q.result(true)).toBe('原則的評価');
        expect(q.result(false)).toBe('配当還元方式');
    });
});

describe('業種別閾値の検証', () => {

    test('卸売業の閾値が正しい', () => {
        const t = industryThresholds.wholesale;
        expect(t.assets[0].text).toContain('20億円以上');
        expect(t.assets[2].text).toContain('7千万円未満');
        expect(t.sales[0].text).toContain('30億円以上');
        expect(t.sales[2].text).toContain('2億円未満');
    });

    test('小売・サービス業の閾値が正しい（平成29年改正後）', () => {
        const t = industryThresholds.retail_service;
        expect(t.assets[0].text).toContain('15億円以上');  // 改正前10億→15億
        expect(t.assets[2].text).toContain('4千万円未満');
        expect(t.sales[0].text).toContain('20億円以上');
        expect(t.sales[2].text).toContain('6千万円未満');
    });

    test('その他の業種の閾値が正しい（平成29年改正後）', () => {
        const t = industryThresholds.other;
        expect(t.assets[0].text).toContain('15億円以上');
        expect(t.assets[2].text).toContain('5千万円未満');
        expect(t.sales[0].text).toContain('15億円以上');   // 改正前25億→15億
        expect(t.sales[2].text).toContain('8千万円未満');   // 改正前1.5億→8千万
    });
});

describe('結果コンテンツの検証', () => {

    test('全5種類の結果が定義されている', () => {
        expect(resultsContent['原則的評価']).toBeDefined();
        expect(resultsContent['類似業種比準価額方式']).toBeDefined();
        expect(resultsContent['純資産価額方式']).toBeDefined();
        expect(resultsContent['併用方式']).toBeDefined();
        expect(resultsContent['配当還元方式']).toBeDefined();
    });

    test('各結果に必要なフィールドがある', () => {
        Object.values(resultsContent).forEach(r => {
            expect(r.title).toBeTruthy();
            expect(r.summary).toBeTruthy();
            expect(r.features).toBeTruthy();
            expect(r.notes).toBeTruthy();
            expect(r.color).toBeTruthy();
            expect(r.icon).toBeTruthy();
            expect(r.details).toBeDefined();
            expect(Array.isArray(r.details)).toBe(true);
        });
    });
});

describe('End-to-End パス検証', () => {

    // ガイド形式: 同族株主 → 中心的 → 原則的 → 大会社
    test('ガイド: 同族株主・中心的・原則的・大会社(70人以上) → 類似業種比準', () => {
        const qs = guidedQuestions;
        const path = [];

        let id = 'Q1';
        // Q1=Yes(30%以上グループあり)
        path.push(id);
        id = qs[id].next(true);
        expect(id).toBe('Q2');

        // Q2=Yes(同族株主)
        path.push(id);
        id = qs[id].next(true);
        expect(id).toBe('Q3');

        // Q3=Yes(中心的がいる)
        path.push(id);
        id = qs[id].next(true);
        expect(id).toBe('Q4');

        // Q4=Yes(中心的に該当)
        path.push(id);
        id = qs[id].next(true);
        expect(id).toBe('Q7');

        // Q7=No(特定会社でない)
        path.push(id);
        id = qs[id].next(false);
        expect(id).toBe('Q8');

        // Q8=wholesale
        path.push(id);
        id = qs[id].next('wholesale');
        expect(id).toBe('Q9');

        // Q9=over70(70人以上) → 大会社確定
        path.push(id);
        id = qs[id].next('over70');
        expect(id).toBeNull(); // 終了 → 類似業種比準価額方式
    });

    // ガイド形式: 同族株主以外 → 配当還元
    test('ガイド: 同族株主以外 → 配当還元', () => {
        const qs = guidedQuestions;
        let id = 'Q1';
        id = qs[id].next(true);  // Q1=Yes → Q2
        id = qs[id].next(false); // Q2=No → null(配当還元)
        expect(id).toBeNull();
    });

    // ガイド形式: 中心的がいない → 原則的評価確定
    test('ガイド: 中心的がいない → 原則的評価(Q7へ直行)', () => {
        const qs = guidedQuestions;
        let id = 'Q1';
        id = qs[id].next(true);  // Q1=Yes → Q2
        id = qs[id].next(true);  // Q2=Yes → Q3
        id = qs[id].next(false); // Q3=No(中心的がいない) → Q7
        expect(id).toBe('Q7');   // 原則的評価確定、会社規模判定へ
    });

    // フローチャート: 50%超 → 同族 → 5%未満 → 中心的がいない → 原則的
    test('フローチャート: 中心的がいない → 原則的評価(直接結果)', () => {
        const qs = flowchartQuestions;

        let id = 'FQ1';
        id = qs[id].next('over_50'); // → FQ2_A
        expect(id).toBe('FQ2_A');

        id = qs[id].next('family'); // → FQ3
        expect(id).toBe('FQ3');

        id = qs[id].next(false); // 5%未満 → FQ4
        expect(id).toBe('FQ4');

        // FQ4=No(中心的がいない) → 原則的評価(直接結果)
        const result = qs['FQ4'].result(false);
        expect(result).toBe('原則的評価');
        expect(qs['FQ4'].next(false)).toBeNull();
    });

    // フローチャート: 配当還元パス(全条件該当)
    test('フローチャート: 5%未満→中心的がいる→該当しない→役員でない → 配当還元', () => {
        const qs = flowchartQuestions;

        let id = 'FQ1';
        id = qs[id].next('30_to_50'); // → FQ2_B
        id = qs[id].next('family');   // → FQ3
        id = qs[id].next(false);      // 5%未満 → FQ4
        id = qs[id].next(true);       // 中心的がいる → FQ5
        expect(id).toBe('FQ5');

        id = qs[id].next(false);      // 中心的でない → FQ6
        expect(id).toBe('FQ6');

        const result = qs['FQ6'].result(false); // 役員でない
        expect(result).toBe('配当還元方式');
    });
});
