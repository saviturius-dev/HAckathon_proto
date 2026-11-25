(function () {
  'use strict';

  var SPRITE_URL = '/assets/aistudio/image__1__3b954c6d.png';
  var DOUBLE_INTERVAL_MS = 10000;
  var MAX_RABBITS = 64;
  var HIT_RADIUS = 20;
  var MIN_SEPARATION = 26;
  var TARGET_SPRITE_HEIGHT = 24;
  var TOP_CLEARANCE = 72;
  var EDGE_PAD = 18;

  var reducedMotionQuery = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)')
    : null;
  var isReducedMotion = reducedMotionQuery ? reducedMotionQuery.matches : false;

  var canvas = null;
  var ctx = null;
  var vw = window.innerWidth || 1280;
  var vh = window.innerHeight || 720;
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  var rabbits = [];
  var particles = [];
  var nextRabbitId = 1;
  var lastTime = 0;
  var doubleTimer = null;
  var rafId = null;

  var sprites = {
    ready: false,
    idle: null,
    hop: null,
    curious: null,
    sleep: null,
  };

  var mouse = {
    x: vw * 0.5,
    y: vh * 0.5,
    anchorX: vw * 0.5,
    anchorY: vh * 0.5,
    active: false,
    settledAt: 0,
    gatherStrength: 0,
  };

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function isInteractiveTarget(el) {
    if (!el || !el.closest) return false;
    return Boolean(
      el.closest(
        'button, a, input, select, textarea, label, [role="button"], [role="tab"], [role="menuitem"], summary'
      )
    );
  }

  function trimAndScaleSprite(sourceCanvas) {
    var sw = sourceCanvas.width;
    var sh = sourceCanvas.height;
    var sctx = sourceCanvas.getContext('2d');
    var imgData = sctx.getImageData(0, 0, sw, sh).data;

    var minX = sw;
    var minY = sh;
    var maxX = -1;
    var maxY = -1;

    for (var y = 0; y < sh; y++) {
      for (var x = 0; x < sw; x++) {
        var idx = (y * sw + x) * 4;
        if (imgData[idx + 3] > 18) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    if (maxX < minX || maxY < minY) {
      return sourceCanvas;
    }

    var cropW = maxX - minX + 1;
    var cropH = maxY - minY + 1;

    // Mipmap progressive 2x downsampling for crisp 24px (x dpr) sprite edges
    var work = document.createElement('canvas');
    work.width = cropW;
    work.height = cropH;
    var wctx = work.getContext('2d');
    wctx.drawImage(sourceCanvas, minX, minY, cropW, cropH, 0, 0, cropW, cropH);

    var targetH = Math.round(TARGET_SPRITE_HEIGHT * dpr);
    var targetW = Math.max(1, Math.round((cropW / cropH) * targetH));

    while (work.height * 0.5 > targetH * 1.4) {
      var nextW = Math.max(targetW, Math.round(work.width * 0.5));
      var nextH = Math.max(targetH, Math.round(work.height * 0.5));
      var step = document.createElement('canvas');
      step.width = nextW;
      step.height = nextH;
      var stepCtx = step.getContext('2d');
      stepCtx.imageSmoothingEnabled = true;
      stepCtx.imageSmoothingQuality = 'high';
      stepCtx.drawImage(work, 0, 0, nextW, nextH);
      work = step;
    }

    var finalCanvas = document.createElement('canvas');
    finalCanvas.width = targetW;
    finalCanvas.height = targetH;
    var fctx = finalCanvas.getContext('2d');
    fctx.imageSmoothingEnabled = true;
    fctx.imageSmoothingQuality = 'high';
    fctx.drawImage(work, 0, 0, targetW, targetH);

    return {
      canvas: finalCanvas,
      drawWidth: targetW / dpr,
      drawHeight: targetH / dpr,
    };
  }

  function keyOutWhiteIfOpaque(workCanvas) {
    var w = workCanvas.width;
    var h = workCanvas.height;
    var wctx = workCanvas.getContext('2d');
    var img = wctx.getImageData(0, 0, w, h);
    var data = img.data;

    // Check top-left corner alpha; if already transparent, keep alpha intact
    if (data[3] < 20) return;

    // Flood-fill pure white background from outer edges so cream bunny interior stays intact
    var visited = new Uint8Array(w * h);
    var stack = [0, w - 1, (h - 1) * w, h * w - 1];

    while (stack.length > 0) {
      var pos = stack.pop();
      if (visited[pos]) continue;
      visited[pos] = 1;

      var idx = pos * 4;
      var r = data[idx];
      var g = data[idx + 1];
      var b = data[idx + 2];
      var a = data[idx + 3];

      if (a > 0 && r > 246 && g > 246 && b > 246) {
        data[idx + 3] = 0;
        var px = pos % w;
        var py = (pos - px) / w;
        if (px > 0) stack.push(pos - 1);
        if (px < w - 1) stack.push(pos + 1);
        if (py > 0) stack.push(pos - w);
        if (py < h - 1) stack.push(pos + w);
      }
    }

    wctx.putImageData(img, 0, 0);
  }

  function loadSprites() {
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = function () {
      var w = img.naturalWidth || img.width;
      var h = img.naturalHeight || img.height;

      var full = document.createElement('canvas');
      full.width = w;
      full.height = h;
      var fctx = full.getContext('2d');
      fctx.drawImage(img, 0, 0);

      // Strip center artist signature band cleanly
      fctx.clearRect(
        Math.floor(w * 0.32),
        Math.floor(h * 0.45),
        Math.ceil(w * 0.36),
        Math.ceil(h * 0.11)
      );

      keyOutWhiteIfOpaque(full);

      var midX = Math.floor(w * 0.5);
      var midY = Math.floor(h * 0.49);

      function sliceQuad(sx, sy, sw, sh) {
        var q = document.createElement('canvas');
        q.width = sw;
        q.height = sh;
        var qctx = q.getContext('2d');
        qctx.drawImage(full, sx, sy, sw, sh, 0, 0, sw, sh);
        return trimAndScaleSprite(q);
      }

      sprites.idle = sliceQuad(0, 0, midX, midY);
      sprites.hop = sliceQuad(midX, 0, w - midX, midY);
      sprites.curious = sliceQuad(0, midY, midX, h - midY);
      sprites.sleep = sliceQuad(midX, midY, w - midX, h - midY);
      sprites.ready = true;
    };
    img.src = SPRITE_URL;
  }

  function emitPuff(x, y, color, count) {
    var n = count || 6;
    for (var i = 0; i < n; i++) {
      var ang = (Math.PI * 2 * i) / n + rand(-0.25, 0.25);
      var spd = rand(24, 62);
      particles.push({
        x: x,
        y: y - 8,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - rand(10, 26),
        radius: rand(3.2, 5.8),
        color: color,
        age: 0,
        life: rand(0.32, 0.52),
      });
    }
  }

  function createCornerRabbit() {
    var corners = [
      { x: EDGE_PAD, y: TOP_CLEARANCE, qx: vw * 0.25, qy: vh * 0.28 },
      { x: vw - EDGE_PAD, y: TOP_CLEARANCE, qx: vw * 0.75, qy: vh * 0.28 },
      { x: EDGE_PAD, y: vh - EDGE_PAD, qx: vw * 0.25, qy: vh * 0.72 },
      { x: vw - EDGE_PAD, y: vh - EDGE_PAD, qx: vw * 0.75, qy: vh * 0.72 },
    ];
    var corner = corners[Math.floor(Math.random() * corners.length)];
    var inwardAngle =
      Math.atan2(corner.qy - corner.y, corner.qx - corner.x) + rand(-0.425, 0.425);
    var speed = rand(85, 130);
    var id = nextRabbitId++;

    return {
      id: id,
      x: corner.x,
      y: corner.y,
      vx: Math.cos(inwardAngle) * speed,
      vy: Math.sin(inwardAngle) * speed,
      facing: Math.cos(inwardAngle) >= 0 ? 1 : -1,
      wanderAngle: inwardAngle,
      hopPhase: 0,
      hopDuration: rand(0.2, 0.31),
      hopAmp: rand(6, 11),
      restTimer: 0,
      curiousTimer: 0.6,
      sleepTimer: 0,
      isSleeping: false,
      hopCount: 0,
      squash: 0,
      spawnScale: 0.25,
      breathPhase: rand(0, Math.PI * 2),
      orbitAngle: (id * 2.39996) % (Math.PI * 2),
      orbitRadius: 20 + (id % 5) * 8,
      localAngleJitter: rand(-0.6, 0.6),
    };
  }

  function beginHop(r, angle, speed, amp, duration) {
    r.hopPhase = 0;
    r.hopDuration = duration || rand(0.19, 0.3);
    r.hopAmp = amp || rand(6, 11);
    r.vx = Math.cos(angle) * speed;
    r.vy = Math.sin(angle) * speed;
    if (Math.abs(r.vx) > 2) {
      r.facing = r.vx >= 0 ? 1 : -1;
    }
    r.isSleeping = false;
    r.sleepTimer = 0;
    r.hopCount += 1;
  }

  function handleLanding(r, nearMouse) {
    r.hopPhase = -1;
    r.vx *= 0.25;
    r.vy *= 0.25;
    r.squash = 0.26;

    if (nearMouse) {
      // Keep lively in a smaller locality surrounding the mouse — brief pause then hop again!
      r.facing = mouse.x >= r.x ? 1 : -1;
      if (Math.random() < 0.22) {
        r.isSleeping = true;
        r.sleepTimer = rand(0.65, 1.35);
        r.restTimer = r.sleepTimer;
      } else if (Math.random() < 0.45) {
        r.curiousTimer = rand(0.2, 0.42);
        r.restTimer = r.curiousTimer;
      } else {
        r.restTimer = rand(0.1, 0.28);
      }
      return;
    }

    if (r.hopCount % 8 === 0 || Math.random() < 0.1) {
      r.isSleeping = true;
      r.sleepTimer = rand(0.9, 2.0);
      r.restTimer = r.sleepTimer;
    } else if (Math.random() < 0.3) {
      r.curiousTimer = rand(0.35, 0.7);
      r.restTimer = rand(0.15, 0.4);
    } else {
      r.restTimer = rand(0.08, 0.34);
    }
  }

  function updateRabbits(dt) {
    var now = performance.now();

    // Update mouse gather ramp
    if (mouse.active && now - mouse.settledAt > 350) {
      mouse.gatherStrength = clamp((now - mouse.settledAt - 350) / 1200, 0, 1);
    } else {
      mouse.gatherStrength = 0;
    }

    var gathering = mouse.active && mouse.gatherStrength > 0.05;

    for (var i = 0; i < rabbits.length; i++) {
      var r = rabbits[i];
      r.breathPhase += dt * 3.1;
      if (r.spawnScale < 1) {
        r.spawnScale = Math.min(1, r.spawnScale + dt * 3.8);
      }
      if (r.squash > 0) {
        r.squash = Math.max(0, r.squash - dt * 1.9);
      }
      if (r.curiousTimer > 0) {
        r.curiousTimer = Math.max(0, r.curiousTimer - dt);
      }

      if (isReducedMotion) {
        r.hopPhase = -1;
        r.vx = 0;
        r.vy = 0;
        continue;
      }

      // Compute golden-angle slot around waiting cursor, gently drifting so local ring stays alive
      if (gathering) {
        r.orbitAngle = (r.orbitAngle + dt * 0.42 * (r.id % 2 === 0 ? 1 : -1)) % (Math.PI * 2);
      }
      var slotX = clamp(
        mouse.x + Math.cos(r.orbitAngle) * r.orbitRadius,
        EDGE_PAD,
        vw - EDGE_PAD
      );
      var slotY = clamp(
        mouse.y + Math.sin(r.orbitAngle) * r.orbitRadius,
        TOP_CLEARANCE,
        vh - EDGE_PAD
      );
      var dxSlot = slotX - r.x;
      var dySlot = slotY - r.y;
      var gd = Math.hypot(dxSlot, dySlot);
      var distToCursor = Math.hypot(mouse.x - r.x, mouse.y - r.y);
      var nearMouse = gathering && distToCursor <= 72;

      if (gathering && gd > 12) {
        r.isSleeping = false;
        r.sleepTimer = 0;
        if (r.restTimer > 0.12) {
          r.restTimer = 0.12;
        }
      }

      if (r.hopPhase >= 0) {
        r.hopPhase += dt / r.hopDuration;
        r.x += r.vx * dt;
        r.y += r.vy * dt;

        // Gentle mid-hop steering toward cursor slot if gathering
        if (gathering && gd > 12) {
          var targetAng = Math.atan2(dySlot, dxSlot);
          var speedNow = Math.hypot(r.vx, r.vy);
          var steerX = Math.cos(targetAng) * speedNow;
          var steerY = Math.sin(targetAng) * speedNow;
          r.vx += (steerX - r.vx) * Math.min(1, dt * 4.5);
          r.vy += (steerY - r.vy) * Math.min(1, dt * 4.5);
          if (Math.abs(r.vx) > 2) r.facing = r.vx >= 0 ? 1 : -1;
        }

        if (r.hopPhase >= 1) {
          handleLanding(r, nearMouse);
        }
      } else {
        // On ground rest
        r.x += r.vx * dt;
        r.y += r.vy * dt;
        r.vx *= Math.pow(0.06, dt);
        r.vy *= Math.pow(0.06, dt);

        if (r.isSleeping) {
          r.sleepTimer -= dt;
          if (r.sleepTimer <= 0) {
            r.isSleeping = false;
            r.sleepTimer = 0;
          }
        }

        r.restTimer -= dt;
        if (r.restTimer <= 0) {
          if (gathering && gd > 12) {
            var chaseAngle = Math.atan2(dySlot, dxSlot) + rand(-0.22, 0.22);
            var chaseSpeed = 68 + mouse.gatherStrength * 74;
            beginHop(r, chaseAngle, chaseSpeed, rand(6, 10), rand(0.19, 0.29));
          } else if (nearMouse) {
            // Keep moving around in a smaller locality surrounding the mouse!
            r.localAngleJitter = rand(-0.95, 0.95);
            var localTargetX = clamp(
              mouse.x + Math.cos(r.orbitAngle + r.localAngleJitter) * rand(18, 56),
              EDGE_PAD,
              vw - EDGE_PAD
            );
            var localTargetY = clamp(
              mouse.y + Math.sin(r.orbitAngle + r.localAngleJitter) * rand(18, 56),
              TOP_CLEARANCE,
              vh - EDGE_PAD
            );
            var localAng = Math.atan2(localTargetY - r.y, localTargetX - r.x);
            beginHop(r, localAng, rand(34, 68), rand(4.5, 7.5), rand(0.18, 0.26));
          } else {
            r.wanderAngle += rand(-1.0, 1.0);
            beginHop(r, r.wanderAngle, rand(72, 136), rand(6, 11), rand(0.19, 0.3));
          }
        }
      }

      // Viewport boundary containment
      if (r.x < EDGE_PAD) {
        r.x = EDGE_PAD;
        r.vx = Math.abs(r.vx);
        r.wanderAngle = Math.atan2(r.vy, r.vx);
        r.facing = 1;
      } else if (r.x > vw - EDGE_PAD) {
        r.x = vw - EDGE_PAD;
        r.vx = -Math.abs(r.vx);
        r.wanderAngle = Math.atan2(r.vy, r.vx);
        r.facing = -1;
      }

      if (r.y < TOP_CLEARANCE) {
        r.y = TOP_CLEARANCE;
        r.vy = Math.abs(r.vy);
        r.wanderAngle = Math.atan2(r.vy, r.vx);
      } else if (r.y > vh - EDGE_PAD) {
        r.y = vh - EDGE_PAD;
        r.vy = -Math.abs(r.vy);
        r.wanderAngle = Math.atan2(r.vy, r.vx);
      }
    }

    // Pairwise collision avoidance (MIN_SEPARATION = 26px)
    for (var a = 0; a < rabbits.length; a++) {
      for (var b = a + 1; b < rabbits.length; b++) {
        var ra = rabbits[a];
        var rb = rabbits[b];
        var dx = rb.x - ra.x;
        var dy = rb.y - ra.y;
        var dist = Math.hypot(dx, dy);

        if (dist < MIN_SEPARATION) {
          var nx = dist > 0.001 ? dx / dist : Math.cos(a * 1.7);
          var ny = dist > 0.001 ? dy / dist : Math.sin(a * 1.7);
          var overlap = (MIN_SEPARATION - dist) * 0.5;

          ra.x = clamp(ra.x - nx * overlap, EDGE_PAD, vw - EDGE_PAD);
          ra.y = clamp(ra.y - ny * overlap, TOP_CLEARANCE, vh - EDGE_PAD);
          rb.x = clamp(rb.x + nx * overlap, EDGE_PAD, vw - EDGE_PAD);
          rb.y = clamp(rb.y + ny * overlap, TOP_CLEARANCE, vh - EDGE_PAD);

          ra.vx -= nx * 48 * dt;
          ra.vy -= ny * 48 * dt;
          rb.vx += nx * 48 * dt;
          rb.vy += ny * 48 * dt;
        }
      }
    }

    // Update puff particles
    for (var p = particles.length - 1; p >= 0; p--) {
      var pt = particles[p];
      pt.age += dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vx *= Math.pow(0.15, dt);
      pt.vy *= Math.pow(0.15, dt);
      if (pt.age >= pt.life) {
        particles.splice(p, 1);
      }
    }
  }

  function renderScene() {
    if (!ctx) return;
    ctx.clearRect(0, 0, vw, vh);

    // Depth sort top-to-bottom
    var sorted = rabbits.slice().sort(function (a, b) {
      return a.y - b.y;
    });

    // Pass 1: Ground shadows
    for (var i = 0; i < sorted.length; i++) {
      var r = sorted[i];
      var lift =
        r.hopPhase >= 0 ? Math.sin(clamp(r.hopPhase, 0, 1) * Math.PI) * r.hopAmp : 0;
      var shadowScale = clamp(1 - lift / 28, 0.45, 1) * r.spawnScale;
      var shadowAlpha = clamp(0.22 * (1 - lift / 32), 0.08, 0.24) * r.spawnScale;

      ctx.save();
      ctx.fillStyle = 'rgba(30, 19, 29, ' + shadowAlpha.toFixed(3) + ')';
      ctx.beginPath();
      ctx.ellipse(
        r.x,
        r.y + 1,
        7.5 * shadowScale,
        2.5 * shadowScale,
        0,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();
    }

    // Pass 2: Rabbits
    if (sprites.ready) {
      for (var j = 0; j < sorted.length; j++) {
        var rb = sorted[j];
        var hopLift =
          rb.hopPhase >= 0 ? Math.sin(clamp(rb.hopPhase, 0, 1) * Math.PI) * rb.hopAmp : 0;

        var poseKey = 'idle';
        if (rb.hopPhase >= 0 && !isReducedMotion) {
          poseKey = 'hop';
        } else if (rb.isSleeping) {
          poseKey = 'sleep';
        } else if (rb.curiousTimer > 0) {
          poseKey = 'curious';
        }

        var sprite = sprites[poseKey] || sprites.idle;
        if (!sprite || !sprite.canvas) continue;

        var scaleX = rb.spawnScale;
        var scaleY = rb.spawnScale;

        // Squash & stretch on landing
        if (rb.squash > 0) {
          scaleX *= 1 + rb.squash * 0.7;
          scaleY *= 1 - rb.squash * 0.65;
        }

        // Subtle ±3.2% breathing pulse while sleeping
        if (poseKey === 'sleep') {
          var pulse = 1 + Math.sin(rb.breathPhase) * 0.032;
          scaleX *= pulse;
          scaleY *= 1 + Math.cos(rb.breathPhase) * 0.024;
        }

        // Orientation rules:
        // hop (top-right sprite faces left by default -> flip by -facing)
        // sleep never flips horizontally so ZZ stays upright
        // curious mirrors toward facing
        var flipX = 1;
        if (poseKey === 'hop') {
          flipX = -rb.facing;
        } else if (poseKey === 'curious') {
          flipX = rb.facing;
        } else {
          flipX = 1;
        }

        ctx.save();
        ctx.translate(rb.x, rb.y - hopLift);
        ctx.scale(flipX * scaleX, scaleY);
        ctx.drawImage(
          sprite.canvas,
          -sprite.drawWidth * 0.5,
          -sprite.drawHeight,
          sprite.drawWidth,
          sprite.drawHeight
        );
        ctx.restore();
      }
    }

    // Pass 3: Puff particles
    for (var p = 0; p < particles.length; p++) {
      var pt = particles[p];
      var alpha = clamp(1 - pt.age / pt.life, 0, 1);
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.radius * (0.6 + 0.4 * alpha), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function loop(ts) {
    if (!lastTime) lastTime = ts;
    var dt = Math.min(0.05, Math.max(0.001, (ts - lastTime) / 1000));
    lastTime = ts;

    updateRabbits(dt);
    renderScene();
    rafId = window.requestAnimationFrame(loop);
  }

  function findHitRabbit(x, y) {
    var best = null;
    var bestDist = HIT_RADIUS;
    for (var i = rabbits.length - 1; i >= 0; i--) {
      var r = rabbits[i];
      var lift = r.hopPhase >= 0 ? Math.sin(clamp(r.hopPhase, 0, 1) * Math.PI) * r.hopAmp : 0;
      var cy = r.y - lift - 10;
      var d = Math.hypot(x - r.x, y - cy);
      if (d <= bestDist) {
        bestDist = d;
        best = r;
      }
    }
    return best;
  }

  function handleWindowClick(e) {
    if (isInteractiveTarget(e.target)) return;
    var hit = findHitRabbit(e.clientX, e.clientY);
    if (!hit) return;

    var count = rabbits.length;
    if (count <= 1) {
      // Single remaining rabbit stays alive, wakes up, does a high startled hop, looks curious 1.4s, emits #AEE3F5 puff
      hit.isSleeping = false;
      hit.sleepTimer = 0;
      hit.curiousTimer = 1.4;
      hit.wanderAngle = rand(0, Math.PI * 2);
      beginHop(hit, hit.wanderAngle, rand(95, 130), 14, 0.28);
      emitPuff(hit.x, hit.y, '#AEE3F5', 6);
      return;
    }

    var targetCount = Math.max(1, Math.floor(count / 2));

    // Clicked rabbit vanishes first in #FFF8E5 puff burst (6 particles)
    var hitIdx = rabbits.indexOf(hit);
    if (hitIdx !== -1) {
      emitPuff(hit.x, hit.y, '#FFF8E5', 6);
      rabbits.splice(hitIdx, 1);
    }

    // Randomly remove remaining rabbits in #F3DFC6 bursts until targetCount reached
    while (rabbits.length > targetCount) {
      var victimIdx = Math.floor(Math.random() * rabbits.length);
      var victim = rabbits[victimIdx];
      emitPuff(victim.x, victim.y, '#F3DFC6', 6);
      rabbits.splice(victimIdx, 1);
    }

    // Remaining rabbits immediately wake up and enter startled curious look for 1.3–2.0s
    for (var i = 0; i < rabbits.length; i++) {
      var rem = rabbits[i];
      rem.isSleeping = false;
      rem.sleepTimer = 0;
      rem.curiousTimer = rand(1.3, 2.0);
    }
  }

  function handleMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
    mouse.active = true;

    var moved = Math.hypot(mouse.x - mouse.anchorX, mouse.y - mouse.anchorY);
    if (moved > 12 || mouse.settledAt === 0) {
      mouse.anchorX = mouse.x;
      mouse.anchorY = mouse.y;
      mouse.settledAt = performance.now();
    }

    // Only show pointer cursor when hovering a rabbit over non-interactive space
    if (!isInteractiveTarget(e.target) && findHitRabbit(mouse.x, mouse.y)) {
      document.body.style.cursor = 'pointer';
    } else if (document.body.style.cursor === 'pointer') {
      document.body.style.cursor = '';
    }
  }

  function handleMouseLeave() {
    mouse.active = false;
    mouse.gatherStrength = 0;
    if (document.body.style.cursor === 'pointer') {
      document.body.style.cursor = '';
    }
  }

  function handleResize() {
    vw = window.innerWidth || 1280;
    vh = window.innerHeight || 720;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    if (canvas) {
      canvas.width = Math.round(vw * dpr);
      canvas.height = Math.round(vh * dpr);
      canvas.style.width = vw + 'px';
      canvas.style.height = vh + 'px';
      ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    for (var i = 0; i < rabbits.length; i++) {
      rabbits[i].x = clamp(rabbits[i].x, EDGE_PAD, vw - EDGE_PAD);
      rabbits[i].y = clamp(rabbits[i].y, TOP_CLEARANCE, vh - EDGE_PAD);
    }
  }

  function doublePopulation() {
    if (rabbits.length >= MAX_RABBITS) return;
    var toAdd = Math.min(rabbits.length, MAX_RABBITS - rabbits.length);
    for (var i = 0; i < toAdd; i++) {
      var nb = createCornerRabbit();
      if (isReducedMotion) {
        nb.x = rand(EDGE_PAD + 20, vw - EDGE_PAD - 20);
        nb.y = rand(TOP_CLEARANCE + 20, vh - EDGE_PAD - 20);
        nb.spawnScale = 1;
        nb.hopPhase = -1;
        var mode = nb.id % 3;
        if (mode === 0) {
          nb.isSleeping = true;
          nb.curiousTimer = 0;
        } else if (mode === 1) {
          nb.isSleeping = false;
          nb.curiousTimer = 9999;
        } else {
          nb.isSleeping = false;
          nb.curiousTimer = 0;
        }
      }
      rabbits.push(nb);
    }
  }

  function start() {
    if (canvas) return;

    canvas = document.createElement('canvas');
    canvas.setAttribute('aria-hidden', 'true');
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = vw + 'px';
    canvas.style.height = vh + 'px';
    canvas.style.zIndex = '45';
    canvas.style.pointerEvents = 'none';
    document.body.appendChild(canvas);

    handleResize();
    loadSprites();

    // Start with 1 rabbit
    rabbits.push(createCornerRabbit());
    if (isReducedMotion) {
      rabbits[0].x = vw * 0.85;
      rabbits[0].y = vh * 0.82;
      rabbits[0].spawnScale = 1;
      rabbits[0].hopPhase = -1;
      rabbits[0].curiousTimer = 9999;
    }

    doubleTimer = window.setInterval(doublePopulation, DOUBLE_INTERVAL_MS);
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('blur', handleMouseLeave);
    window.addEventListener('click', handleWindowClick);

    if (reducedMotionQuery && reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', function (ev) {
        isReducedMotion = ev.matches;
      });
    }

    rafId = window.requestAnimationFrame(loop);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
