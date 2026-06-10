// js/social.js

window.Social = {
  getIdeas: function() {
    const pool = [
      { title: 'Behind the scenes', description: 'Muestra a tu equipo trabajando en un proyecto real. Humaniza la marca.', platform: 'Instagram', type: 'Reel' },
      { title: 'Tutorial rápido', description: 'Enseña un truco útil de una herramienta que usen tus clientes (ej. atajo de teclado, extensión).', platform: 'TikTok', type: 'Video' },
      { title: 'Antes y después', description: 'Caso de estudio visual mostrando el estado inicial vs final de un proyecto de cliente.', platform: 'LinkedIn', type: 'Carrusel' },
      { title: 'Datos curiosos', description: 'Estadísticas impactantes sobre tecnología o crecimiento en tu sector.', platform: 'Instagram', type: 'Carrusel' },
      { title: 'Meme tech del momento', description: 'Adapta un meme viral a una situación típica de tu industria o clientes.', platform: 'Twitter', type: 'Texto' },
      { title: 'Q&A en stories', description: 'Abre caja de preguntas sobre tus servicios y responde en video.', platform: 'Instagram', type: 'Story' },
      { title: 'Testimonial de cliente', description: 'Entrevista corta en video a un cliente feliz contando sus resultados.', platform: 'LinkedIn', type: 'Video' },
      { title: 'Tips de productividad', description: '3 herramientas o metodologías que usen internamente para ser más eficientes.', platform: 'TikTok', type: 'Video' },
      { title: 'Infografía estadística', description: 'Resumen visual de tendencias actuales en tecnología para el año en curso.', platform: 'LinkedIn', type: 'Imagen' },
      { title: 'Unboxing de equipo', description: 'Muestra nueva tecnología o setup de la oficina.', platform: 'YouTube', type: 'Video' },
      { title: 'Día en la vida', description: 'Vlog corto mostrando la rutina de un desarrollador o miembro del equipo.', platform: 'TikTok', type: 'Video' },
      { title: 'Comparativa de herramientas', description: 'Ejemplo: Notion vs Jira, o React vs Vue. Pros y contras objetivos.', platform: 'LinkedIn', type: 'Carrusel' },
      { title: 'Predicciones del sector', description: '¿Hacia dónde va el mercado tech? Da tu opinión experta.', platform: 'Twitter', type: 'Hilo' },
      { title: 'Colaboración (Live)', description: 'Directo con otro experto de la industria hablando sobre un tema relevante.', platform: 'Instagram', type: 'Live' },
      { title: 'Contenido educativo', description: 'Explica un concepto técnico complejo con palabras simples o analogías.', platform: 'LinkedIn', type: 'Texto' }
    ];

    // Shuffle and pick 4
    return pool.sort(() => 0.5 - Math.random()).slice(0, 4);
  },

  getStrategies: function() {
    const pool = [
      { title: 'Respuestas Rápidas', description: 'Responde TODOS los comentarios en los primeros 30 minutos de publicación.', impact: 'Alto', tip: 'Activa notificaciones solo por esa media hora.' },
      { title: 'Fórmula de Hashtags', description: 'Usa 3-5 hashtags relevantes amplios + 2 de nicho hiper-específicos.', impact: 'Medio', tip: 'No uses hashtags baneados o muy genéricos como #love o #tech.' },
      { title: 'Horarios Pico', description: 'Publica en momentos de mayor tráfico: 12:00-14:00 y 19:00-21:00.', impact: 'Medio', tip: 'Revisa tus propias analíticas para confirmar tus horarios.' },
      { title: 'CTA Claro', description: 'Incluye un Call-To-Action (Llamado a la acción) claro en CADA publicación.', impact: 'Alto', tip: 'Varía entre "Guarda este post", "Comenta tu opinión" o "Link en bio".' },
      { title: 'Regla 80/20', description: 'Asegura que el 80% del contenido aporta valor educativo/entretenimiento, y solo el 20% es promocional.', impact: 'Alto', tip: 'La gente no sigue marcas para ver anuncios constantemente.' },
      { title: 'Contenido Serializado', description: 'Crea series (Parte 1, Parte 2...) para generar expectativa y retorno.', impact: 'Alto', tip: 'Incentiva a que te sigan para no perderse la siguiente parte.' },
      { title: 'Repost de UGC', description: 'Comparte (con permiso) contenido generado por tus clientes sobre ti.', impact: 'Medio', tip: 'Genera confianza y prueba social (social proof).' },
      { title: 'Interacción Proactiva', description: 'Interactúa comentando en cuentas similares 15 mins al día.', impact: 'Alto', tip: 'Deja comentarios de valor, no solo emojis. Atrae miradas a tu perfil.' },
      { title: 'Formatos Nativos', description: 'Adopta rápidamente las nuevas funciones (stickers, filtros) que lanza cada plataforma.', impact: 'Medio', tip: 'El algoritmo premia a quienes usan sus nuevas herramientas.' },
      { title: 'Contenido Guardable', description: 'Diseña posts que la gente quiera guardar para consultar después (listas, cheatsheets, guías).', impact: 'Alto', tip: 'Los "saves" son el super-like para el algoritmo de Instagram.' }
    ];

    // Shuffle and pick 4
    return pool.sort(() => 0.5 - Math.random()).slice(0, 4);
  },

  calculateEngagement: function(posts) {
    if (!posts || posts.length === 0) return '0%';
    
    let totalReach = 0;
    let totalEngagement = 0;

    posts.forEach(p => {
      totalReach += Number(p.reach) || 0;
      totalEngagement += (Number(p.likes) || 0) + (Number(p.comments) || 0) + (Number(p.shares) || 0);
    });

    if (totalReach === 0) return '0%';
    
    return ((totalEngagement / totalReach) * 100).toFixed(2) + '%';
  },

  renderIdeas: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const ideas = this.getIdeas();
    let html = '';

    ideas.forEach(idea => {
      html += `
        <div class="idea-card">
          <div class="idea-title">${idea.title}</div>
          <div class="idea-description">${idea.description}</div>
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <span class="idea-tag">${idea.platform}</span>
            <span class="idea-tag" style="background: rgba(255,255,255,0.1); color: var(--silver);">${idea.type}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderStrategies: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const strategies = this.getStrategies();
    let html = '';

    strategies.forEach(s => {
      const impactClass = s.impact === 'Alto' ? 'badge-success' : 'badge-warning';
      
      html += `
        <div class="strategy-card">
          <div class="idea-title">${s.title}</div>
          <div class="idea-description">${s.description}</div>
          <div style="margin-top: 12px;">
            <span class="badge ${impactClass}">Impacto: ${s.impact}</span>
          </div>
          <div class="idea-description" style="margin-top: 8px; font-style: italic; color: var(--purple-light);">
            💡 TIP: ${s.tip}
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  renderBrandColors: function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const colors = [
      { name: 'Purple Primary', hex: '#9b59f0' },
      { name: 'Purple Light', hex: '#b47aff' },
      { name: 'Purple Dark', hex: '#6a3db5' },
      { name: 'Background Primary', hex: '#0a0a0f' },
      { name: 'Background Secondary', hex: '#12121a' },
      { name: 'Text Primary', hex: '#f0f0f5' }
    ];

    let html = '';

    colors.forEach(c => {
      html += `
        <div class="color-swatch" onclick="navigator.clipboard.writeText('${c.hex}'); App.showNotification('Color ${c.hex} copiado al portapapeles', 'info')" title="Click para copiar">
          <div class="swatch-preview" style="background: ${c.hex}"></div>
          <div class="swatch-info">
            <span class="swatch-name">${c.name}</span>
            <span class="swatch-hex">${c.hex}</span>
          </div>
        </div>
      `;
    });

    container.innerHTML = html;
  },

  updatePlatformCards: function(posts) {
    const platforms = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Twitter', 'YouTube'];

    platforms.forEach(platform => {
      const platformPosts = posts.filter(p => p.platform === platform);
      
      // Update Post Count (in place of followers for this demo)
      const countEl = document.getElementById(`${platform.toLowerCase()}-followers`);
      if (countEl) countEl.textContent = platformPosts.length;

      // Update Engagement
      const engEl = document.getElementById(`${platform.toLowerCase()}-engagement`);
      if (engEl) engEl.textContent = this.calculateEngagement(platformPosts);
    });
  }
};
