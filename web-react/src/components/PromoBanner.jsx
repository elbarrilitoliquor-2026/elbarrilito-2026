export default function PromoBanner() {
  return (
    <section className="promo-banner" id="promo-banner">
      <div className="promo-inner">
        <div className="promo-content reveal-up">
          <p className="promo-spanish-top">¡Bienvenidos a El Barrilito!</p>
          <h2 className="section-heading-center">Your Neighborhood <em>Liquor Store</em></h2>
          <p className="promo-spanish-sub">Tu Tienda de Licores Favorita en Pasadena, TX</p>
          <div className="promo-cards">
            <div className="promo-card" id="pc-promo-1">
              <span className="promo-emoji">🥃</span>
              <h3>Tequila &amp; Mezcal</h3>
              <p>Over 500 varieties from Mexico&apos;s finest distilleries</p>
              <p className="promo-es">Más de 500 variedades de las mejores destilerías de México</p>
            </div>
            <div className="promo-card" id="pc-promo-2">
              <span className="promo-emoji">🍺</span>
              <h3>Cerveza &amp; Beer</h3>
              <p>Mexican imports, craft beers &amp; domestic favorites</p>
              <p className="promo-es">Cervezas mexicanas, artesanales y nacionales</p>
            </div>
            <div className="promo-card" id="pc-promo-3">
              <span className="promo-emoji">🍷</span>
              <h3>Wine &amp; Spirits</h3>
              <p>Curated wines, whiskey, vodka, rum &amp; more</p>
              <p className="promo-es">Vinos selectos, whiskey, vodka, ron y más</p>
            </div>
          </div>
          <a href="#shop" className="btn-dark" id="promo-cta">VER COLECCIÓN / VIEW COLLECTION</a>
        </div>
      </div>
    </section>
  );
}
