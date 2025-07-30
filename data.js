export const questions = {
    'Q1': {
        text: 'Q1. あなたが株式を取得する会社は、議決権の30%以上を保有する「同族株主グループ」が存在する会社ですか？',
        help: {
            title: '同族株主グループとは？',
            text: '会社の議決権の30%以上を保有する株主とその親族（6親等内の血族、3親等内の姻族など）からなるグループのことです。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: (answer) => answer ? 'Q2' : null // If no group, they can't be a controlling member. Simplified logic leads to dividend reduction.
    },
    'Q2': {
        text: 'Q2. その会社には「中心的な同族株主」がいますか？',
        help: {
            title: '中心的な同族株主とは？',
            text: '同族株主の一人とその配偶者、親子、兄弟姉妹などが保有する議決権の合計が25%以上になる場合の、その株主を指します。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ・わからない', value: false }
        ],
        next: (answer) => answer ? 'Q3' : 'Q4'
    },
    'Q3': {
        text: 'Q3. あなた自身は、その「中心的な同族株主」に該当しますか？',
        help: {
            title: '中心的な同族株主への該当',
            text: 'あなた自身とあなたの近親者（配偶者、親子、兄弟姉妹など）の議決権を合計して25%以上になるかをご確認ください。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: () => 'Q4'
    },
    'Q4': {
        text: 'Q4. あなたは、株式を取得する会社の役員ですか？',
        help: {
            title: '役員とは？',
            text: '会社の経営に直接関与している取締役、監査役などが該当します。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: () => 'Q5'
    },
    'Q5': {
        text: 'Q5. 今回の株式取得によって、あなたの議決権割合は5%以上になりますか？',
        help: {
            title: '取得後の議決権割合',
            text: '今回取得する株式と、もともと保有している株式を合算した議決権の割合です。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: (answer, answers) => {
            const isPrinciple = (answers['Q3'] && answers['Q3'].answer) || (answers['Q4'] && answers['Q4'].answer) || answer;
            return isPrinciple ? 'Q6' : null; // null ends quiz, triggers evaluation
        }
    },
    'Q6': {
        text: 'Q6. 会社は「特定の評価会社」に該当しますか？（開業3年未満、休業中、土地・株式の保有割合が高いなど）',
        help: {
            title: '特定の評価会社とは？',
            text: '土地保有特定会社、株式保有特定会社、開業3年未満の会社、比準要素が1つ以下の会社などが該当します。\n詳細は国税庁のウェブサイト等でご確認ください。'
        },
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ・わからない', value: false }
        ],
        next: (answer) => answer ? null : 'Q6_5' // 'はい' leads to pure net asset method
    },
    'Q6_5': {
        text: 'Q. 会社の業種はどれに該当しますか？',
        options: [
            { text: '卸売業', value: 'wholesale' },
            { text: '小売・サービス業', value: 'retail_service' },
            { text: '上記以外の業種', value: 'other' }
        ],
        next: () => 'Q7'
    },
    'Q7': {
        text: 'Q7. 会社の従業員数（役員を除く、継続勤務する者）は何人ですか？',
        help: {
            title: '従業員数の計算方法',
            text: '正社員のほか、パート・アルバイトは年間の労働時間数を1,800で割って1人として換算します。'
        },
        options: [
            { text: '70人以上', value: 'Large' },
            { text: '6人～69人', value: 'Medium' },
            { text: '5人以下', value: 'Small' }
        ],
        next: () => 'Q8'
    },
    'Q8': {
        text: 'Q8. 直前期末の総資産価額（帳簿価額）はいくらですか？',
        help: {
            title: '総資産価額',
            text: '貸借対照表の資産合計額です。'
        },
        options: [
            { text: '20億円以上', value: 'Large' },
            { text: '5億円以上 20億円未満', value: 'Medium' },
            { text: '5億円未満', value: 'Small' }
        ],
        next: () => 'Q9'
    },
    'Q9': {
        text: 'Q9. 直前期の取引金額（売上高）はいくらですか？',
        help: {
            title: '取引金額',
            text: '損益計算書の売上高です。'
        },
        options: [
            { text: '30億円以上', value: 'Large' },
            { text: '3億円以上 30億円未満', value: 'Medium' },
            { text: '3億円未満', value: 'Small' }
        ],
        next: () => null // End of questions
    }
};

export const flowchartQuestions = {
    'FQ1': {
        text: '筆頭株主グループの議決権割合はどのくらいですか？',
        help: {
            title: '筆頭株主グループとは？',
            text: '株主（その配偶者や6親等内の血族、3親等内の姻族を含む）の中で、最も多くの議決権を持つグループのことです。'
        },
        options: [
            { text: '50%超', value: 'over_50' },
            { text: '30%以上50%以下', value: '30_to_50' },
            { text: '30%未満', value: 'under_30' }
        ],
        next: (answer) => {
            if (answer === 'over_50') return 'FQ2_A';
            if (answer === '30_to_50') return 'FQ2_B';
            if (answer === 'under_30') return 'FQ2_C';
        }
    },
    'FQ2_A': { // Path for >50%
        text: 'あなた（納税義務者）は同族株主ですか、それとも同族株主以外の株主ですか？',
        options: [
            { text: '同族株主', value: 'family' },
            { text: '同族株主以外の株主', value: 'other' }
        ],
        next: (answer) => answer === 'family' ? 'FQ3_A' : 'FQ3_B'
    },
    'FQ2_B': { // Path for 30%-50%
        text: 'あなた（納税義務者）は同族株主ですか、それとも同族株主以外の株主ですか？',
        options: [
            { text: '同族株主', value: 'family' },
            { text: '同族株主以外の株主', value: 'other' }
        ],
        next: (answer) => answer === 'family' ? 'FQ3_A' : 'FQ3_B'
    },
    'FQ2_C': { // Path for <30%
        text: 'あなた（納税義務者）は同族株主等ですか、それとも同族株主等以外の株主ですか？',
        help: {
            title: '同族株主等とは？',
            text: '議決権総数の15%以上、30%未満であるグループの株主を指します。'
        },
        options: [
            { text: '同族株主等', value: 'family_etc' },
            { text: '同族株主等以外の株主', value: 'other' }
        ],
        next: (answer) => answer === 'family_etc' ? 'FQ3_A' : 'FQ3_B'
    },
    'FQ3_A': { // Path for all "family" types
        text: '取得後のあなたの議決権割合は5%以上ですか？',
        options: [
            { text: 'はい（5%以上）', value: true },
            { text: 'いいえ（5%未満）', value: false }
        ],
        next: (answer) => answer ? 'FQ4_A' : 'FQ4_B'
    },
    'FQ3_B': { // Path for all "other" types -> leads to Special method
        text: 'これで診断は完了です。',
        options: [],
        next: () => null,
        result: '配当還元方式'
    },
    'FQ4_A': { // Path for >=5%
        text: '同族株主の中に中心的な同族株主がいますか？',
        help: {
            title: '中心的な同族株主とは？',
            text: '同族株主の1人とその親族等の議決権合計が25%以上となる場合の、その株主を指します。'
        },
        options: [
            { text: 'いる', value: true },
            { text: 'いない', value: false }
        ],
        next: (answer) => answer ? 'FQ5_A' : 'FQ5_B'
    },
    'FQ4_B': { // Path for <5%
        text: 'あなた（納税義務者）は役員ですか？',
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: () => null, // Final question
        result: (answer) => answer ? '原則的評価' : '配当還元方式'
    },
    'FQ5_A': { // Path for "いる"
        text: 'あなた自身は、その中心的な同族株主に該当しますか？',
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: (answer) => answer ? 'FQ6' : 'FQ4_B'
    },
    'FQ5_B': { // Path for "いない"
        text: 'あなた（納税義務者）は役員ですか？',
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: () => null,
        result: (answer) => answer ? '原則的評価' : '配当還元方式'
    },
    'FQ6': { // Final question for "Principle" path
        text: 'あなた（納税義務者）は役員ですか？',
        options: [
            { text: 'はい', value: true },
            { text: 'いいえ', value: false }
        ],
        next: () => null,
        result: '原則的評価'
    }
};

export const resultsContent = {
    '原則的評価': {
        title: '原則的評価方式',
        summary: '会社の規模（大会社、中会社、小会社）に応じて、「類似業種比準価額方式」と「純資産価額方式」を単独または組み合わせて評価します。',
        features: '会社の経営に実質的に関与する株主（支配株主）向けの評価方法です。会社の資産や収益力が株価に反映されやすいです。',
        notes: 'この診断では、原則的評価方式（類似業種比準価額方式、純資産価額方式、併用方式）のいずれに該当するかまでの詳細な判定は行いません。詳細な評価額の算定には専門家への相談が必要です。'
    },
    '類似業種比準価額方式': {
        title: '原則的評価方式（類似業種比準価額方式）',
        summary: 'あなたの会社と事業内容が似ている上場企業の株価を参考に、会社の「配当」「利益」「純資産」の3つの要素を比較して株価を評価する方法です。',
        features: '主に大会社に適用されます。市場の動向が反映されやすく、一般的に純資産価額方式よりも評価額が低くなる傾向があります。',
        notes: '業績が好調な会社では評価額が高くなることがあります。また、比準すべき類似業種が存在しない場合や、特定の会社には適用できません。'
    },
    '純資産価額方式': {
        title: '原則的評価方式（純資産価額方式）',
        summary: '「もし今会社を解散したら、株主にはいくら分配されるか」という考え方に基づく評価方法です。会社の資産と負債を全て時価で評価し直し、その純資産額から株価を算出します。',
        features: '主に小会社や、土地・株式などの資産保有割合が高い特定の評価会社に適用されます。会社の内部留保や資産の含み益が直接評価額に反映されます。',
        notes: '内部留保が厚い会社や、購入時より値上がりした不動産などを多く保有する会社では、評価額が非常に高くなる可能性があります。'
    },
    '併用方式': {
        title: '原則的評価方式（併用方式）',
        summary: '「類似業種比準価額方式」と「純資産価額方式」を、会社の規模に応じた一定の割合で組み合わせて（加重平均して）評価する方法です。',
        features: '主に中会社に適用されます。会社規模が大きいほど類似業種比準価額方式の割合が高くなります。',
        notes: '計算が複雑になりますが、大会社と小会社の中間的な性質を評価に反映させることができます。'
    },
    '配当還元方式': {
        title: '特例的評価方式（配当還元方式）',
        summary: '会社の経営に直接関与しない少数株主向けの評価方法です。その株式から将来受け取れる「配当金」の額に着目して株価を評価します。',
        features: '経営支配権のない少数株主が株式を取得する場合に適用されます。過去2年間の配当実績を基に計算され、一般的に原則的評価方式に比べて評価額が大幅に低くなる傾向があります。',
        notes: '配当実績がない会社の場合、最低評価額（1株あたり額面50円の株式で2.5円）で計算されます。同族株主には適用できません。'
    }
};
