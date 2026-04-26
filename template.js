export function generateHTML(drama, products) {
  return `
  <h1>${drama} Inspired Korean Fashion</h1>
  <p>Shop trending outfits inspired by ${drama}.</p>

  <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:15px;">
    ${products.map(p => `
      <div style="border:1px solid #ddd;padding:10px;border-radius:10px;text-align:center;">
        <img src="${p.image}" style="width:100%;height:200px;object-fit:cover;border-radius:8px;" />
        <h3 style="font-size:14px;">${p.title}</h3>
        <a href="${p.link}" target="_blank" style="display:inline-block;background:#E91E63;color:#fff;padding:8px 12px;border-radius:5px;text-decoration:none;">
          Buy Now
        </a>
      </div>
    `).join("")}
  </div>
  `;
}
