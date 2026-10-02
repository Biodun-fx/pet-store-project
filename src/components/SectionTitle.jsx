function SectionTitle({ eyebrow, title, subtitle, align = 'left' }) {
  return (
    <div className="section-header" style={{ alignItems: align === 'left' ? 'end' : 'center' }}>
      <div>
        {eyebrow ? <span className="eyebrow">{eyebrow}</span> : null}
        <h2 className="section-title">{title}</h2>
      </div>
      {subtitle ? <p className="text-muted">{subtitle}</p> : null}
    </div>
  );
}

export default SectionTitle;
