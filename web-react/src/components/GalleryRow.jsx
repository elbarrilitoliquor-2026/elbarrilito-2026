export default function GalleryRow() {
  return (
    <section className="gallery-row" id="gallery-row">
      <div className="gallery-inner">
        <div className="gallery-item" id="gal-1">
          <img src="/assets/images/tequila_bottles_lineup.png" alt="Premium Tequila Bottles Lineup" loading="lazy" decoding="async" />
        </div>
        <div className="gallery-item" id="gal-2">
          <img src="/assets/images/premium_bottles_shelf.png" alt="Premium Liquor Shelf Display" loading="lazy" decoding="async" />
        </div>
        <div className="gallery-item" id="gal-3">
          <img src="/assets/images/cocktail_glasses_bar.png" alt="Craft Tequila Cocktails" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}
