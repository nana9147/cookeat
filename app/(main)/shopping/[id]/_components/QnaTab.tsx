import { MOCK_QNA } from '../../data/mockQna';

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
