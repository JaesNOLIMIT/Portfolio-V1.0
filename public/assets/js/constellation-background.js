(() => {
  const canvas = document.querySelector('[data-constellation]');
  const context = canvas?.getContext('2d');
  if (!canvas || !context) return;

  const reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  const LINK_DISTANCE = 140;
  const FLASHLIGHT_RADIUS = 220;
  const ASTEROID_COUNT = 12;
  const MILKY_WAY_ANGLE = -0.36;

  let width = 0;
  let height = 0;
  let stars = [];
  let planets = [];
  let asteroids = [];
  let milkyWayDust = [];
  let shootingStars = [];
  let nextShootingStarAt = performance.now() + 2000 + Math.random() * 4000;
  let animationFrame = null;
  let resizeTimer = null;

  const pointer = {
    x: 0,
    y: 0,
    active: false,
  };

  class Star {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 1.4 + 0.4;
      this.velocityX = (Math.random() - 0.5) * 0.08;
      this.velocityY = (Math.random() - 0.5) * 0.08;
      this.baseAlpha = Math.random() * 0.5 + 0.25;
      this.twinklePhase = Math.random() * Math.PI * 2;
      this.twinkle = 0;
    }

    update(time) {
      this.x += this.velocityX;
      this.y += this.velocityY;

      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      this.twinkle = Math.sin(time * 0.0008 + this.twinklePhase) * 0.15;
    }
  }

  const PLANET_DEFINITIONS = [
    { name: 'Sun', radius: 26, type: 'sun' },
    { name: 'Mercury', radius: 8, type: 'rocky', base: [180, 172, 165], edge: [70, 64, 58] },
    { name: 'Venus', radius: 12, type: 'rocky', base: [225, 200, 150], edge: [110, 90, 55] },
    { name: 'Earth', radius: 14, type: 'earth' },
    { name: 'Mars', radius: 11, type: 'rocky', base: [205, 110, 78], edge: [95, 42, 28] },
    {
      name: 'Jupiter',
      radius: 20,
      type: 'banded',
      bands: [[215, 185, 145], [175, 125, 85], [205, 165, 115], [155, 105, 75]],
    },
    {
      name: 'Saturn',
      radius: 18,
      type: 'ringed',
      base: [222, 200, 150],
      edge: [125, 105, 65],
      ringScale: 0.38,
      ringAngle: -0.32,
    },
    {
      name: 'Uranus',
      radius: 15,
      type: 'ringed',
      base: [165, 220, 220],
      edge: [55, 100, 100],
      ringScale: 0.92,
      ringAngle: -0.15,
    },
    { name: 'Neptune', radius: 13, type: 'rocky', base: [80, 115, 195], edge: [28, 40, 82] },
    { name: 'Pluto', radius: 7, type: 'rocky', base: [200, 185, 168], edge: [85, 72, 60] },
  ];

  class Planet {
    constructor(definition, x, y) {
      this.name = definition.name;
      this.type = definition.type;
      this.radius = definition.radius;
      this.base = definition.base;
      this.edge = definition.edge;
      this.bands = definition.bands;
      this.ringScale = definition.ringScale;
      this.ringAngle = definition.ringAngle;
      this.x = x;
      this.y = y;
      this.velocityX = (Math.random() - 0.5) * (definition.type === 'sun' ? 0.008 : 0.02);
      this.velocityY = (Math.random() - 0.5) * (definition.type === 'sun' ? 0.008 : 0.02);
      this.baseAlpha = definition.type === 'sun' ? 0.9 : Math.random() * 0.15 + 0.55;
      this.rotation = Math.random() * Math.PI * 2;
      this.pulsePhase = Math.random() * Math.PI * 2;
      this.pulse = 0;
    }

    update(time) {
      this.x += this.velocityX;
      this.y += this.velocityY;

      if (this.x < -30) this.x = width + 30;
      if (this.x > width + 30) this.x = -30;
      if (this.y < -30) this.y = height + 30;
      if (this.y > height + 30) this.y = -30;

      this.pulse = this.type === 'sun'
        ? Math.sin(time * 0.0012 + this.pulsePhase) * 0.08
        : 0;
    }
  }

  class Asteroid {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.radius = Math.random() * 2.2 + 1.8;
      this.velocityX = (Math.random() - 0.5) * 0.045;
      this.velocityY = (Math.random() - 0.5) * 0.045;
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.0025;
      this.baseAlpha = Math.random() * 0.25 + 0.3;
      this.vertices = Array.from({ length: 7 }, () => 0.65 + Math.random() * 0.55);
    }

    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;

      if (this.x < -10) this.x = width + 10;
      if (this.x > width + 10) this.x = -10;
      if (this.y < -10) this.y = height + 10;
      if (this.y > height + 10) this.y = -10;

      this.rotation += this.rotationSpeed;
    }
  }

  class ShootingStar {
    constructor() {
      const startsAtTop = Math.random() < 0.65;
      this.x = startsAtTop ? Math.random() * width * 0.8 : -20;
      this.y = startsAtTop ? -20 : Math.random() * height * 0.5;

      const angle = Math.PI / 4 + Math.random() * 0.3 - 0.15;
      const speed = Math.random() * 4.5 + 6.5;
      this.velocityX = Math.cos(angle) * speed;
      this.velocityY = Math.sin(angle) * speed;
      this.length = Math.random() * 70 + 70;
      this.life = 1;
      this.decay = Math.random() * 0.008 + 0.01;
    }

    update() {
      this.x += this.velocityX;
      this.y += this.velocityY;
      this.life -= this.decay;
    }

    get finished() {
      return this.life <= 0 || this.x > width + 80 || this.y > height + 80;
    }
  }

  const scatterPlanets = () => {
    const columns = width < 600 ? 3 : 4;
    const rows = Math.ceil(PLANET_DEFINITIONS.length / columns) + 1;
    const cellWidth = width / columns;
    const cellHeight = height / rows;
    const cells = Array.from({ length: columns * rows }, (_, index) => index);

    for (let index = cells.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [cells[index], cells[swapIndex]] = [cells[swapIndex], cells[index]];
    }

    return PLANET_DEFINITIONS.map((definition, index) => {
      const cell = cells[index];
      const column = cell % columns;
      const row = Math.floor(cell / columns);
      const padding = Math.min(cellWidth, cellHeight) * 0.25;
      const x = column * cellWidth + padding + Math.random() * Math.max(cellWidth - padding * 2, 1);
      const y = row * cellHeight + padding + Math.random() * Math.max(cellHeight - padding * 2, 1);
      return new Planet(definition, x, y);
    });
  };

  const buildMilkyWayDust = () => {
    const diagonal = Math.hypot(width, height);
    return Array.from({ length: 260 }, () => {
      const spread = (Math.random() + Math.random() + Math.random()) / 3;
      return {
        localX: (Math.random() - 0.5) * diagonal * 1.4,
        localY: (spread - 0.5) * 170,
        radius: Math.random() * 1.1 + 0.3,
        alpha: Math.random() * 0.5 + 0.15,
      };
    });
  };

  const distanceToPointer = (x, y) => Math.hypot(x - pointer.x, y - pointer.y);

  const drawMilkyWay = () => {
    const diagonal = Math.hypot(width, height);
    context.save();
    context.translate(width / 2, height / 2);
    context.rotate(MILKY_WAY_ANGLE);

    const bandGradient = context.createLinearGradient(0, -150, 0, 150);
    bandGradient.addColorStop(0, 'rgba(130, 140, 180, 0)');
    bandGradient.addColorStop(0.5, 'rgba(160, 160, 195, 0.07)');
    bandGradient.addColorStop(1, 'rgba(130, 140, 180, 0)');
    context.fillStyle = bandGradient;
    context.fillRect(-diagonal * 0.7, -150, diagonal * 1.4, 300);

    [
      { x: -diagonal * 0.28, y: -12, radius: 230, color: '150, 140, 190' },
      { x: diagonal * 0.08, y: 22, radius: 260, color: '175, 150, 140' },
      { x: diagonal * 0.3, y: -22, radius: 200, color: '140, 155, 185' },
      { x: -diagonal * 0.44, y: 16, radius: 190, color: '165, 140, 150' },
    ].forEach((cloud) => {
      const cloudGradient = context.createRadialGradient(
        cloud.x,
        cloud.y,
        0,
        cloud.x,
        cloud.y,
        cloud.radius,
      );
      cloudGradient.addColorStop(0, `rgba(${cloud.color}, 0.05)`);
      cloudGradient.addColorStop(1, `rgba(${cloud.color}, 0)`);
      context.beginPath();
      context.fillStyle = cloudGradient;
      context.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
      context.fill();
    });

    milkyWayDust.forEach((dust) => {
      context.beginPath();
      context.fillStyle = `rgba(230, 230, 245, ${dust.alpha})`;
      context.arc(dust.localX, dust.localY, dust.radius, 0, Math.PI * 2);
      context.fill();
    });

    context.restore();
  };

  const drawPlanet = (planet, alpha, boost) => {
    const { x, y, radius } = planet;

    if (planet.type === 'sun') {
      const pulsingRadius = radius * (1 + planet.pulse);
      const coronaRadius = pulsingRadius + 40;
      const corona = context.createRadialGradient(
        x,
        y,
        pulsingRadius * 0.6,
        x,
        y,
        coronaRadius,
      );
      corona.addColorStop(0, `rgba(255, 190, 90, ${0.35 * alpha})`);
      corona.addColorStop(1, 'rgba(255, 190, 90, 0)');
      context.beginPath();
      context.fillStyle = corona;
      context.arc(x, y, coronaRadius, 0, Math.PI * 2);
      context.fill();

      const core = context.createRadialGradient(
        x - pulsingRadius * 0.3,
        y - pulsingRadius * 0.3,
        1,
        x,
        y,
        pulsingRadius,
      );
      core.addColorStop(0, `rgba(255, 235, 180, ${alpha})`);
      core.addColorStop(0.6, `rgba(250, 190, 90, ${alpha})`);
      core.addColorStop(1, `rgba(220, 130, 40, ${alpha})`);
      context.beginPath();
      context.fillStyle = core;
      context.arc(x, y, pulsingRadius, 0, Math.PI * 2);
      context.fill();
      return;
    }

    if (planet.type === 'ringed') {
      context.save();
      context.translate(x, y);
      context.rotate(planet.ringAngle);
      context.scale(1, planet.ringScale);
      context.beginPath();
      context.arc(0, 0, radius * 2.1, 0, Math.PI * 2);
      context.strokeStyle = `rgba(${planet.base.join(',')}, ${alpha * 0.55})`;
      context.lineWidth = 2.2;
      context.stroke();
      context.restore();
    }

    if (planet.type === 'banded') {
      context.save();
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.clip();
      const bandHeight = radius * 2 / planet.bands.length;
      planet.bands.forEach((color, index) => {
        context.fillStyle = `rgba(${color.join(',')}, ${alpha})`;
        context.fillRect(x - radius, y - radius + index * bandHeight, radius * 2, bandHeight + 1);
      });
      context.restore();

      const shade = context.createRadialGradient(
        x - radius * 0.3,
        y - radius * 0.3,
        radius * 0.2,
        x,
        y,
        radius,
      );
      shade.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
      shade.addColorStop(1, 'rgba(0, 0, 0, 0.25)');
      context.beginPath();
      context.fillStyle = shade;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    } else if (planet.type === 'earth') {
      const ocean = context.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.35,
        radius * 0.1,
        x,
        y,
        radius,
      );
      ocean.addColorStop(0, `rgba(90, 150, 210, ${alpha})`);
      ocean.addColorStop(1, `rgba(20, 45, 80, ${alpha})`);
      context.beginPath();
      context.fillStyle = ocean;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();

      context.save();
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.clip();
      context.fillStyle = `rgba(95, 140, 80, ${alpha * 0.85})`;
      context.beginPath();
      context.ellipse(
        x + Math.cos(planet.rotation) * radius * 0.3,
        y + Math.sin(planet.rotation) * radius * 0.3,
        radius * 0.55,
        radius * 0.35,
        planet.rotation,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.beginPath();
      context.ellipse(
        x - Math.cos(planet.rotation) * radius * 0.4,
        y - Math.sin(planet.rotation) * radius * 0.2,
        radius * 0.4,
        radius * 0.25,
        planet.rotation + 1,
        0,
        Math.PI * 2,
      );
      context.fill();
      context.restore();

      context.beginPath();
      context.fillStyle = `rgba(255, 255, 255, ${alpha * 0.12})`;
      context.arc(x - radius * 0.2, y - radius * 0.2, radius * 0.9, 0, Math.PI * 2);
      context.fill();
    } else {
      const surface = context.createRadialGradient(
        x - radius * 0.35,
        y - radius * 0.35,
        radius * 0.1,
        x,
        y,
        radius,
      );
      surface.addColorStop(0, `rgba(${planet.base.join(',')}, ${alpha})`);
      surface.addColorStop(1, `rgba(${planet.edge.join(',')}, ${alpha * 0.85})`);
      context.beginPath();
      context.fillStyle = surface;
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
    }

    if (boost > 0.2) {
      context.beginPath();
      context.strokeStyle = `rgba(240, 168, 60, ${boost * 0.5})`;
      context.lineWidth = 1.5;
      context.arc(x, y, radius + 2, 0, Math.PI * 2);
      context.stroke();
    }
  };

  const drawAsteroid = (asteroid, alpha) => {
    context.save();
    context.translate(asteroid.x, asteroid.y);
    context.rotate(asteroid.rotation);
    context.beginPath();

    asteroid.vertices.forEach((vertex, index) => {
      const angle = index / asteroid.vertices.length * Math.PI * 2;
      const vertexRadius = asteroid.radius * vertex;
      const x = Math.cos(angle) * vertexRadius;
      const y = Math.sin(angle) * vertexRadius;
      if (index === 0) context.moveTo(x, y);
      else context.lineTo(x, y);
    });

    context.closePath();
    context.fillStyle = `rgba(150, 138, 122, ${alpha})`;
    context.fill();
    context.restore();
  };

  const drawShootingStar = (shootingStar) => {
    const velocity = Math.hypot(shootingStar.velocityX, shootingStar.velocityY) || 1;
    const tailX = shootingStar.x - shootingStar.velocityX / velocity * shootingStar.length;
    const tailY = shootingStar.y - shootingStar.velocityY / velocity * shootingStar.length;
    const fade = Math.max(shootingStar.life, 0);
    const trail = context.createLinearGradient(tailX, tailY, shootingStar.x, shootingStar.y);
    trail.addColorStop(0, 'rgba(255, 240, 210, 0)');
    trail.addColorStop(1, `rgba(255, 240, 210, ${0.85 * fade})`);

    context.beginPath();
    context.strokeStyle = trail;
    context.lineWidth = 1.6;
    context.lineCap = 'round';
    context.moveTo(tailX, tailY);
    context.lineTo(shootingStar.x, shootingStar.y);
    context.stroke();

    context.beginPath();
    context.fillStyle = `rgba(255, 250, 230, ${fade})`;
    context.shadowColor = 'rgba(255, 230, 170, 0.9)';
    context.shadowBlur = 6;
    context.arc(shootingStar.x, shootingStar.y, 1.4, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  };

  const render = (time = 0) => {
    const shouldAnimate = !reduceMotionQuery.matches;
    context.clearRect(0, 0, width, height);
    drawMilkyWay();

    if (shouldAnimate) {
      stars.forEach((star) => star.update(time));
      planets.forEach((planet) => planet.update(time));
      asteroids.forEach((asteroid) => asteroid.update());
    }

    planets.forEach((planet) => {
      const pointerDistance = pointer.active
        ? distanceToPointer(planet.x, planet.y)
        : Number.POSITIVE_INFINITY;
      const labelRange = planet.radius + 70;
      const boost = pointerDistance < FLASHLIGHT_RADIUS * 1.3
        ? 1 - pointerDistance / (FLASHLIGHT_RADIUS * 1.3)
        : 0;
      const alpha = Math.min(planet.baseAlpha + boost * 0.25, 1);
      drawPlanet(planet, alpha, boost);

      if (pointerDistance < labelRange) {
        const labelAlpha = Math.min(1 - pointerDistance / labelRange, 1) * 0.95;
        context.font = '11px "JetBrains Mono", monospace';
        context.textAlign = 'center';
        context.fillStyle = `rgba(240, 168, 60, ${labelAlpha})`;
        context.fillText(planet.name.toUpperCase(), planet.x, planet.y - planet.radius - 12);
      }
    });

    for (let index = 0; index < stars.length; index += 1) {
      for (let nextIndex = index + 1; nextIndex < stars.length; nextIndex += 1) {
        const first = stars[index];
        const second = stars[nextIndex];
        const distance = Math.hypot(first.x - second.x, first.y - second.y);
        if (distance >= LINK_DISTANCE) continue;

        const pointerDistance = pointer.active
          ? distanceToPointer((first.x + second.x) / 2, (first.y + second.y) / 2)
          : Number.POSITIVE_INFINITY;
        const boost = pointerDistance < FLASHLIGHT_RADIUS
          ? (1 - pointerDistance / FLASHLIGHT_RADIUS) * 0.5
          : 0;
        const opacity = Math.min((1 - distance / LINK_DISTANCE) * 0.12 + boost, 0.65);

        context.strokeStyle = boost > 0.05
          ? `rgba(240, 168, 60, ${opacity})`
          : `rgba(160, 170, 190, ${opacity})`;
        context.lineWidth = 0.6;
        context.beginPath();
        context.moveTo(first.x, first.y);
        context.lineTo(second.x, second.y);
        context.stroke();
      }
    }

    stars.forEach((star) => {
      const pointerDistance = pointer.active
        ? distanceToPointer(star.x, star.y)
        : Number.POSITIVE_INFINITY;
      const boost = pointerDistance < FLASHLIGHT_RADIUS
        ? 1 - pointerDistance / FLASHLIGHT_RADIUS
        : 0;
      const alpha = Math.min(star.baseAlpha + star.twinkle + boost * 0.6, 1);
      const radius = star.radius + boost * 1.6;

      context.beginPath();
      context.fillStyle = boost > 0.15
        ? `rgba(240, 168, 60, ${alpha})`
        : `rgba(220, 224, 235, ${alpha})`;
      context.shadowColor = 'rgba(240, 168, 60, 0.9)';
      context.shadowBlur = boost > 0.15 ? 8 * boost : 0;
      context.arc(star.x, star.y, radius, 0, Math.PI * 2);
      context.fill();
      context.shadowBlur = 0;
    });

    asteroids.forEach((asteroid) => {
      const pointerDistance = pointer.active
        ? distanceToPointer(asteroid.x, asteroid.y)
        : Number.POSITIVE_INFINITY;
      const boost = pointerDistance < FLASHLIGHT_RADIUS
        ? 1 - pointerDistance / FLASHLIGHT_RADIUS
        : 0;
      drawAsteroid(asteroid, Math.min(asteroid.baseAlpha + boost * 0.4, 0.9));
    });

    if (shouldAnimate && time > nextShootingStarAt) {
      shootingStars.push(new ShootingStar());
      nextShootingStarAt = time + 3500 + Math.random() * 5500;
    }

    if (shouldAnimate) shootingStars.forEach((shootingStar) => shootingStar.update());
    shootingStars = shootingStars.filter((shootingStar) => !shootingStar.finished);
    shootingStars.forEach(drawShootingStar);

    if (pointer.active) {
      const glow = context.createRadialGradient(
        pointer.x,
        pointer.y,
        0,
        pointer.x,
        pointer.y,
        FLASHLIGHT_RADIUS * 1.4,
      );
      glow.addColorStop(0, 'rgba(240, 168, 60, 0.05)');
      glow.addColorStop(1, 'rgba(240, 168, 60, 0)');
      context.fillStyle = glow;
      context.fillRect(0, 0, width, height);
    }

    if (shouldAnimate && !document.hidden) {
      animationFrame = window.requestAnimationFrame(render);
    } else {
      animationFrame = null;
    }
  };

  const resize = () => {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
    width = Math.max(Math.round(bounds.width), 1);
    height = Math.max(Math.round(bounds.height), 1);
    canvas.width = Math.round(width * pixelRatio);
    canvas.height = Math.round(height * pixelRatio);
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const starCount = Math.max(34, Math.floor(width * height / 9000));
    stars = Array.from({ length: starCount }, () => new Star());
    planets = scatterPlanets();
    asteroids = Array.from({ length: ASTEROID_COUNT }, () => new Asteroid());
    milkyWayDust = buildMilkyWayDust();
    shootingStars = [];

    if (reduceMotionQuery.matches) render(performance.now());
  };

  const startAnimation = () => {
    if (reduceMotionQuery.matches || document.hidden || animationFrame !== null) return;
    animationFrame = window.requestAnimationFrame(render);
  };

  const stopAnimation = () => {
    if (animationFrame === null) return;
    window.cancelAnimationFrame(animationFrame);
    animationFrame = null;
  };

  resize();
  startAnimation();

  window.addEventListener('pointermove', (event) => {
    pointer.x = event.clientX;
    pointer.y = event.clientY;
    pointer.active = true;
    if (reduceMotionQuery.matches) render(performance.now());
  }, { passive: true });

  document.documentElement.addEventListener('pointerleave', () => {
    pointer.active = false;
    if (reduceMotionQuery.matches) render(performance.now());
  });

  window.addEventListener('blur', () => {
    pointer.active = false;
    if (reduceMotionQuery.matches) render(performance.now());
  });

  window.addEventListener('resize', () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(resize, 120);
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stopAnimation();
    else startAnimation();
  });

  reduceMotionQuery.addEventListener('change', () => {
    stopAnimation();
    if (reduceMotionQuery.matches) render(performance.now());
    else startAnimation();
  });
})();
