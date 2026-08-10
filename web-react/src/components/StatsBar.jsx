export default function StatsBar() {
  return (
    <div className="stats-bar reveal-up" id="stats-bar">
      <div className="stats-item" id="si-1">
        <span className="stats-num">1000+</span>
        <span className="stats-name">Premium Brands</span>
      </div>
      <div className="stats-item" id="si-2">
        <span className="stats-num">500+</span>
        <span className="stats-name">Tequilas &amp; Mezcals</span>
      </div>
      <div className="stats-item" id="si-3">
        <span className="stats-num">200+</span>
        <span className="stats-name">Craft &amp; Import Beers</span>
      </div>
      <div className="stats-item" id="si-4">
        <span className="stats-num">5</span>
        <span className="stats-name">★ Google Rating</span>
      </div>
    </div>
  );
}
