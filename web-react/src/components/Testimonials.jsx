import ReviewForm from './ReviewForm';

const STATIC_TESTIMONIALS = [
  {
    id: 'tc-1',
    delayCls: '',
    text: 'Best liquor store in Pasadena, hands down! The tequila selection is incredible — they carry brands I can’t find anywhere else in Houston. The staff is super friendly and always helps me pick the perfect bottle. ¡Los recomiendo!',
    initials: 'MG',
    avatarCls: 'av-1',
    name: 'Maria Garcia',
    meta: 'Local Customer · Pasadena, TX',
  },
  {
    id: 'tc-2',
    delayCls: 'delay-1',
    text: 'I’ve been coming to El Barrilito for years. Their prices are always fair and they have an amazing selection of mezcals and craft beers. The bilingual service makes everyone feel welcome. This is my go-to spot!',
    initials: 'CR',
    avatarCls: 'av-2',
    name: 'Carlos Rodriguez',
    meta: 'Regular Customer · South Houston',
  },
  {
    id: 'tc-3',
    delayCls: 'delay-2',
    text: 'Stopped by looking for a specific añejo tequila and the staff knew exactly what I needed. Great atmosphere, clean store, and the selection rivals shops twice its size. A real gem on Shaver Street!',
    initials: 'JT',
    avatarCls: 'av-3',
    name: 'James Thompson',
    meta: 'Spirits Enthusiast · Deer Park',
  },
];

function formatReview(r) {
  const initials = r.customer_name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const stars = '★★★★★'.slice(0, r.rating) + '☆☆☆☆☆'.slice(0, 5 - r.rating);
  return { initials, stars };
}

/* Renders Supabase-approved reviews when present, otherwise falls back
   to the original static 3 testimonials — same graceful-degradation
   spirit as the vanilla site (which kept its static cards until
   loadApprovedReviews() successfully replaced them). */
export default function Testimonials({ reviews, loading }) {
  const useDynamic = !loading && reviews.length > 0;

  return (
    <section className="testimonials" id="testimonials">
      <div className="testi-inner">
        <div className="section-header reveal-up">
          <p className="eyebrow-line"><span className="eyebrow-dash"></span> Our Customers <span className="eyebrow-dash"></span></p>
          <h2 className="section-heading">Words of <em>Distinction</em></h2>
        </div>

        <div className="testi-grid">
          {useDynamic
            ? reviews.map((r) => {
                const { initials, stars } = formatReview(r);
                return (
                  <div className="testi-card reveal-up" id={`tc-${r.id}`} key={r.id}>
                    <div className="testi-quote">&quot;</div>
                    <p className="testi-text">{r.review_text}</p>
                    <div className="testi-author">
                      <div className="testi-avatar">{initials}</div>
                      <div>
                        <strong>{r.customer_name}</strong>
                        <span>{r.location || ''}</span>
                      </div>
                      <div className="testi-stars">{stars}</div>
                    </div>
                  </div>
                );
              })
            : STATIC_TESTIMONIALS.map((t) => (
                <div className={`testi-card reveal-up${t.delayCls ? ` ${t.delayCls}` : ''}`} id={t.id} key={t.id}>
                  <div className="testi-quote">&quot;</div>
                  <p className="testi-text">{t.text}</p>
                  <div className="testi-author">
                    <div className={`testi-avatar ${t.avatarCls}`}>{t.initials}</div>
                    <div>
                      <strong>{t.name}</strong>
                      <span>{t.meta}</span>
                    </div>
                    <div className="testi-stars">★★★★★</div>
                  </div>
                </div>
              ))}
        </div>

        <ReviewForm />
      </div>
    </section>
  );
}
