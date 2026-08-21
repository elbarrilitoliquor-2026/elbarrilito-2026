import React from 'react';

export default function BulkPromoBanner() {
  return (
    <section className="bulk-promo-banner" style={{
      background: 'linear-gradient(135deg, #2b1111 0%, #111 100%)',
      color: '#fff',
      padding: '50px 20px',
      textAlign: 'center',
      margin: '40px auto',
      maxWidth: '1200px',
      border: '1px solid var(--gold-mid, #c8a97e)',
      borderRadius: '4px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{ position: 'relative', zIndex: 2 }}>
        <div style={{ 
          display: 'inline-block', 
          background: 'var(--gold-mid, #c8a97e)', 
          color: '#000', 
          padding: '4px 12px', 
          fontSize: '0.85rem', 
          fontWeight: 'bold', 
          letterSpacing: '1px', 
          marginBottom: '16px',
          borderRadius: '2px',
          fontFamily: 'var(--font-sans, sans-serif)'
        }}>
          LIMITED TIME OFFER
        </div>
        <h2 style={{ 
          fontSize: '3rem', 
          marginBottom: '16px', 
          textTransform: 'uppercase', 
          fontFamily: 'var(--font-vintage, serif)',
          color: 'var(--gold-light, #f0e6d2)',
          textShadow: '0 2px 4px rgba(0,0,0,0.5)',
          letterSpacing: '1px'
        }}>
          Throwing a Party?
        </h2>
        <p style={{ 
          fontSize: '1.2rem', 
          marginBottom: '28px', 
          maxWidth: '700px', 
          margin: '0 auto 28px', 
          opacity: 0.9, 
          lineHeight: 1.6,
          fontFamily: 'var(--font-sans, sans-serif)'
        }}>
          Stock up and save big on your favorites! Get <strong style={{ color: 'var(--gold-mid, #c8a97e)', fontSize: '1.3rem' }}>15% OFF</strong> on all bulk orders of 12 bottles or more. Mix and match premium spirits, wines, and craft beers.
        </p>
        <a href="#shop" className="btn-dark" style={{
          display: 'inline-block',
          backgroundColor: 'var(--gold-mid, #c8a97e)',
          color: '#111',
          padding: '14px 36px',
          fontWeight: 'bold',
          textDecoration: 'none',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          transition: 'all 0.3s ease',
          border: '1px solid var(--gold-mid, #c8a97e)',
          fontFamily: 'var(--font-sans, sans-serif)'
        }}
        onMouseOver={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'var(--gold-mid, #c8a97e)'; }}
        onMouseOut={(e) => { e.currentTarget.style.backgroundColor = 'var(--gold-mid, #c8a97e)'; e.currentTarget.style.color = '#111'; }}
        >
          Claim Bulk Discount
        </a>
      </div>
      
      {/* Decorative subtle elements */}
      <div style={{ position: 'absolute', top: '-50px', left: '-50px', width: '200px', height: '200px', background: 'radial-gradient(circle, rgba(200,169,126,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
      <div style={{ position: 'absolute', bottom: '-80px', right: '-20px', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(200,169,126,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
    </section>
  );
}
