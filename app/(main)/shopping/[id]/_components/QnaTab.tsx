interface Qna {
  id: string;
  author: string;
  question: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
}

const MOCK_QNA: Qna[] = [
  {
    id: '1',
    author: '김*주',
    question: '이 양파 당도가 높은 편인가요? 샐러드용으로 쓰려고 하는데 맵지 않았으면 해서요.',
    createdAt: '2026.06.10',
    answer:
      '안녕하세요! 무안 햇양파는 수분이 많고 단맛이 강해 샐러드나 생으로 드시기에 적합합니다. 매운맛이 적어 많은 분들이 만족하고 계세요 😊',
    answeredAt: '2026.06.11',
  },
  {
    id: '2',
    author: '이*연',
    question: '2박스 이상 주문하면 할인이 되나요?',
    createdAt: '2026.06.12',
    answer: '현재 대량 구매 할인은 별도 운영하고 있지 않으나, 3만원 이상 구매 시 무료배송 혜택이 적용됩니다.',
    answeredAt: '2026.06.13',
  },
  {
    id: '3',
    author: '박*현',
    question: '산지 직송이면 보통 수확 후 며칠 이내에 배송되나요?',
    createdAt: '2026.06.14',
  },
];

export function QnaTab() {
  return (
    <div className="space-y-3">
      {MOCK_QNA.map((qna) => (
        <div key={qna.id} className="bg-card rounded-2xl p-4 space-y-3">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center mt-0.5">
              Q
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-sm font-medium text-dark-text">{qna.question}</span>
                <span
                  className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
                    qna.answer ? 'bg-primary/10 text-primary' : 'bg-border text-muted'
                  }`}
                >
                  {qna.answer ? '답변완료' : '답변대기'}
                </span>
              </div>
              <p className="text-xs text-light-gray">
                {qna.author} · {qna.createdAt}
              </p>
            </div>
          </div>
          {qna.answer && (
            <div className="flex items-start gap-3 pl-2 border-l-2 border-primary/30">
              <span className="shrink-0 w-5 h-5 rounded-full bg-beige text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                A
              </span>
              <div>
                <p className="text-sm text-gray-text leading-relaxed">{qna.answer}</p>
                <p className="text-xs text-light-gray mt-1">판매자 · {qna.answeredAt}</p>
              </div>
            </div>
          )}
        </div>
      ))}
      <button className="w-full h-10 rounded-xl border border-border text-sm text-gray-text hover:bg-hover transition-colors">
        문의하기
      </button>
    </div>
  );
}
