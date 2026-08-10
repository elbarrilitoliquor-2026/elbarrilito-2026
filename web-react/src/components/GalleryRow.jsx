export default function GalleryRow() {
  return (
    <section className="gallery-row" id="gallery-row">
      <div className="gallery-inner">
        <div className="gallery-item arch-frame" id="gal-1">
          <img src="/assets/images/collection_bottles.png" alt="Premium Spirits Collection at El Barrilito" loading="lazy" decoding="async" />
        </div>
        <div className="gallery-item" id="gal-2">
          <img src="/assets/images/craft_beer.png" alt="Mexican & Craft Beer Selection" loading="lazy" decoding="async" />
        </div>
        <div className="gallery-item arch-frame" id="gal-3">
          <img src="/assets/images/limited_edition.png" alt="Limited Edition Tequila & Mezcal Bottles" loading="lazy" decoding="async" />
        </div>
      </div>
    </section>
  );
}
