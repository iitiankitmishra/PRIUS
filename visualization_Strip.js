function drawVisualization() {
    const B_mm = getwidth() * 1000;
    const D_mm = getdepth();
    const b_mm = getwallthickness() * 1000;
    const Df_mm = parseFloat(document.getElementById("depth-of-foundation").value) || 500;
    const cover = parseFloat(document.getElementById("nominal-cover").value) || 50;
    const spacing = getspacing();
    const mainBarDia = getdiameterofsteelbar();
    const distBarDia = parseFloat(document.getElementById("diameter-of-dist-bar").value) || 8;
    const totalLoad_kN = parseFloat(document.getElementById('dead-load').value || 0) + parseFloat(document.getElementById('live-load').value || 0);

    const length_mm = 1000;

    const colorMainBar = "#0056b3";
    const colorDistBar = "#2e7d32";
    const colorConcrete = "#e0e0e0";
    const colorGround = "#c0392b";
    const colorText = "#000000";

    const container = document.getElementById('viz-container');
    container.innerHTML = '';

    const canvas = document.createElement('canvas');
    const baseWidth = 1200;
    const baseHeight = 1100;

    canvas.width = baseWidth;
    canvas.height = baseHeight;
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    const marginLeft = 120;
    const marginRight = 250;
    const marginTop = 100;

    const availableWidth = baseWidth - marginLeft - marginRight;
    const scale = availableWidth / (B_mm * 1.25);
    const centerX = marginLeft + availableWidth / 2;

    const groundLevelY = marginTop + 60;
    const footingBottomY = groundLevelY + (Df_mm * scale);
    const footingTopY = footingBottomY - (D_mm * scale);
    const wallTopY = groundLevelY - 40;

    const axisX = marginLeft - 40;
    ctx.strokeStyle = "#888";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(axisX, groundLevelY - 20);
    ctx.lineTo(axisX, footingBottomY + 20);
    ctx.stroke();

    let tickInterval = 100;
    if (Df_mm > 1000) tickInterval = 250;
    if (Df_mm > 2000) tickInterval = 500;

    for (let d = 0; d <= Df_mm + 50; d += tickInterval) {
        const y = groundLevelY + (d * scale);
        drawTick(ctx, axisX, y, "left", d.toFixed(0));
    }

    ctx.save();
    ctx.font = "bold 16px Arial";
    ctx.fillStyle = "#666";
    ctx.translate(axisX - 55, (groundLevelY + footingBottomY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Depth (mm)", 0, 0);
    ctx.restore();

    ctx.beginPath();
    ctx.strokeStyle = colorGround;
    ctx.lineWidth = 2;
    ctx.moveTo(marginLeft - 40, groundLevelY);
    ctx.lineTo(baseWidth - marginRight + 20, groundLevelY);
    ctx.stroke();

    ctx.fillStyle = colorGround;
    ctx.textAlign = "right";
    ctx.font = "bold 14px Arial";
    ctx.fillText("GROUND LEVEL", baseWidth - marginRight, groundLevelY - 10);
    ctx.textAlign = "center";
    ctx.font = "16px Arial";

    const wallW_px = b_mm * scale;
    const footingW_px = B_mm * scale;
    const footingH_px = D_mm * scale;

    ctx.fillStyle = "#f5f5f5";
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.fillRect(centerX - (wallW_px / 2), wallTopY, wallW_px, (footingTopY - wallTopY) + 2);
    ctx.strokeRect(centerX - (wallW_px / 2), wallTopY, wallW_px, (footingTopY - wallTopY) + 2);

    ctx.fillStyle = colorConcrete;
    ctx.fillRect(centerX - (footingW_px / 2), footingTopY, footingW_px, footingH_px);
    ctx.strokeRect(centerX - (footingW_px / 2), footingTopY, footingW_px, footingH_px);

    const arrowStartX = centerX;
    const arrowStartY = marginTop - 60;
    const arrowEndY = wallTopY;
    drawArrow(ctx, arrowStartX, arrowStartY, arrowStartX, arrowEndY, `P = ${totalLoad_kN.toFixed(1)} kN`);

    const mainBarRadius = Math.max(3, (mainBarDia / 2) * scale);
    const blueBarY = footingBottomY - (cover * scale) - mainBarRadius - 2;
    const greenBarY = blueBarY + (mainBarRadius / 2) + 3;

    ctx.beginPath();
    ctx.strokeStyle = colorDistBar;
    ctx.lineWidth = Math.max(4, distBarDia * scale);
    const distBarStartX = centerX - (footingW_px / 2) + (cover * scale);
    const distBarEndX = centerX + (footingW_px / 2) - (cover * scale);
    ctx.moveTo(distBarStartX, greenBarY);
    ctx.lineTo(distBarEndX, greenBarY);
    ctx.stroke();

    ctx.fillStyle = colorMainBar;

    const effectiveWidth = B_mm - (2 * cover);
    const numSpaces = Math.floor(effectiveWidth / spacing);
    const numBars = numSpaces + 1;
    const actualCover = (B_mm - (numSpaces * spacing)) / 2;
    const startBarX = centerX - (footingW_px / 2) + (actualCover * scale);

    for (let i = 0; i < numBars; i++) {
        let x = startBarX + (i * spacing * scale);
        ctx.beginPath();
        ctx.arc(x, blueBarY, mainBarRadius, 0, 2 * Math.PI);
        ctx.fill();
    }

    ctx.fillStyle = colorText;
    ctx.font = "bold 18px Arial";
    ctx.fillText("ELEVATION VIEW", centerX, footingBottomY + 70);
    ctx.font = "16px Arial";

    drawDimensionLine(ctx, centerX + (footingW_px / 2) + 30, footingTopY, centerX + (footingW_px / 2) + 30, footingBottomY, `D=${D_mm.toFixed(0)} mm`);
    drawDimensionLine(ctx, centerX + (footingW_px / 2) + 100, groundLevelY, centerX + (footingW_px / 2) + 100, footingBottomY, `Df=${Df_mm.toFixed(0)} mm`);
    drawDimensionLine(ctx, centerX - (wallW_px / 2), wallTopY - 20, centerX + (wallW_px / 2), wallTopY - 20, `b=${b_mm.toFixed(0)} mm`);

    const planTopY = footingBottomY + 150;
    const planH_px = length_mm * scale;
    const planBottomY = planTopY + planH_px;
    const planCenterY = planTopY + (planH_px / 2);

    ctx.fillStyle = colorConcrete;
    ctx.fillRect(centerX - (footingW_px / 2), planTopY, footingW_px, planH_px);
    ctx.strokeStyle = "#333";
    ctx.lineWidth = 2;
    ctx.strokeRect(centerX - (footingW_px / 2), planTopY, footingW_px, planH_px);

    ctx.beginPath();
    ctx.setLineDash([10, 8]);
    ctx.strokeStyle = "#555";
    ctx.moveTo(centerX - (wallW_px / 2), planTopY);
    ctx.lineTo(centerX - (wallW_px / 2), planBottomY);
    ctx.moveTo(centerX + (wallW_px / 2), planTopY);
    ctx.lineTo(centerX + (wallW_px / 2), planBottomY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = colorMainBar;
    ctx.lineWidth = 2;
    const numMainBarsPlan = Math.floor(length_mm / spacing);
    const startMainY = planCenterY - ((numMainBarsPlan - 1) * spacing * scale) / 2;

    for (let i = 0; i < numMainBarsPlan; i++) {
        let y = startMainY + (i * spacing * scale);
        ctx.beginPath();
        ctx.moveTo(centerX - (footingW_px / 2) + (cover * scale), y);
        ctx.lineTo(centerX + (footingW_px / 2) - (cover * scale), y);
        ctx.stroke();
    }

    ctx.strokeStyle = colorDistBar;
    ctx.lineWidth = 2;
    for (let i = 0; i < numBars; i++) {
        let x = startBarX + (i * spacing * scale);
        ctx.beginPath();
        ctx.moveTo(x, planTopY + (cover * scale));
        ctx.lineTo(x, planBottomY - (cover * scale));
        ctx.stroke();
    }

    ctx.fillStyle = colorText;
    ctx.font = "16px Arial";

    drawDimensionLine(ctx, centerX - (footingW_px / 2), planBottomY + 25, centerX + (footingW_px / 2), planBottomY + 25, `Width = ${B_mm.toFixed(0)} mm`);
    drawDimensionLine(ctx, centerX + (footingW_px / 2) + 30, planTopY, centerX + (footingW_px / 2) + 30, planBottomY, "1000 mm Strip");
    drawDimensionLine(ctx, centerX - (wallW_px / 2), planTopY - 20, centerX + (wallW_px / 2), planTopY - 20, `b=${b_mm.toFixed(0)} mm`);

    ctx.fillStyle = colorMainBar;
    ctx.textAlign = "left";
    const labelX = centerX + (footingW_px / 2) + 60;

    ctx.beginPath();
    ctx.strokeStyle = colorMainBar;
    ctx.lineWidth = 1;
    ctx.moveTo(labelX - 10, startMainY);
    ctx.lineTo(centerX + (footingW_px / 2), startMainY);
    ctx.stroke();

    ctx.font = "bold 16px Arial";
    ctx.fillText(`Main: ${mainBarDia}mm @ ${spacing.toFixed(0)} mm c/c`, labelX, startMainY);

    ctx.fillStyle = colorDistBar;
    ctx.textAlign = "center";
    const distLabelY = planTopY - 50;
    const targetBarX = startBarX + (spacing * scale * 2);

    ctx.beginPath();
    ctx.strokeStyle = colorDistBar;
    ctx.moveTo(targetBarX, planTopY + (cover * scale));
    ctx.lineTo(targetBarX - 30, distLabelY + 15);
    ctx.stroke();
    ctx.fillText(`Dist: ${distBarDia}mm bars`, targetBarX - 100, distLabelY);

    ctx.fillStyle = colorText;
    ctx.font = "bold 20px Arial";
    ctx.fillText("PLAN VIEW", centerX, planBottomY + 80);

    setupPanZoom(canvas, container);
}

function setupPanZoom(canvas, container) {
    let pointX = 0;
    let pointY = 0;
    let panning = false;
    let startX = 0;
    let startY = 0;

    const containerW = container.clientWidth || 500;
    const containerH = container.clientHeight || 500;
    const canvasW = canvas.width;
    const canvasH = canvas.height;

    const scaleX = (containerW - 40) / canvasW;
    const scaleY = (containerH - 40) / canvasH;

    let currentScale = Math.min(scaleX, scaleY);

    const updateTransform = () => {
        canvas.style.transform = `translate(${pointX}px, ${pointY}px) scale(${currentScale})`;
    };
    updateTransform();

    container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        e.preventDefault();
        startX = e.clientX - pointX;
        startY = e.clientY - pointY;
        panning = true;
        container.style.cursor = 'grabbing';
    });

    window.addEventListener('mouseup', () => {
        if (panning) {
            panning = false;
            container.style.cursor = 'grab';
        }
    });

    window.addEventListener('mousemove', (e) => {
        if (!panning) return;
        e.preventDefault();
        pointX = e.clientX - startX;
        pointY = e.clientY - startY;
        updateTransform();
    });

    container.addEventListener('wheel', (e) => {
        e.preventDefault();
        const zoomSpeed = 0.1;
        const delta = -Math.sign(e.deltaY);

        if (delta > 0) {
            currentScale *= (1 + zoomSpeed);
        } else {
            currentScale /= (1 + zoomSpeed);
        }

        currentScale = Math.min(Math.max(0.1, currentScale), 3);
        updateTransform();
    });

    if (!container.querySelector('.viz-controls')) {
        const controls = document.createElement('div');
        controls.className = 'viz-controls';
        controls.innerHTML = `
            <button class="viz-btn" id="btn-zoom-in" title="Zoom In"><i class="fa-solid fa-plus"></i></button>
            <button class="viz-btn" id="btn-zoom-out" title="Zoom Out"><i class="fa-solid fa-minus"></i></button>
            <button class="viz-btn" id="btn-reset" title="Fit to Screen"><i class="fa-solid fa-compress"></i></button>
        `;
        container.appendChild(controls);

        document.getElementById('btn-zoom-in').addEventListener('click', (e) => {
            e.preventDefault();
            currentScale *= 1.2;
            updateTransform();
        });

        document.getElementById('btn-zoom-out').addEventListener('click', (e) => {
            e.preventDefault();
            currentScale /= 1.2;
            updateTransform();
        });

        document.getElementById('btn-reset').addEventListener('click', (e) => {
            e.preventDefault();
            currentScale = Math.min((container.clientWidth - 40) / canvas.width, (container.clientHeight - 40) / canvas.height);
            pointX = 0;
            pointY = 0;
            updateTransform();
        });
    }
}

function drawDimensionLine(ctx, x1, y1, x2, y2, text) {
    ctx.save();
    ctx.strokeStyle = "#000";
    ctx.fillStyle = "#000";
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    const tickSize = 6;
    ctx.beginPath();
    if (Math.abs(x1 - x2) < 1) {
        ctx.moveTo(x1 - tickSize, y1);
        ctx.lineTo(x1 + tickSize, y1);
        ctx.moveTo(x2 - tickSize, y2);
        ctx.lineTo(x2 + tickSize, y2);
        ctx.stroke();
        ctx.translate((x1 + x2) / 2, (y1 + y2) / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, 0, -5);
    } else {
        ctx.moveTo(x1, y1 - tickSize);
        ctx.lineTo(x1, y1 + tickSize);
        ctx.moveTo(x2, y2 - tickSize);
        ctx.lineTo(x2, y2 + tickSize);
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.textBaseline = "bottom";
        ctx.fillText(text, (x1 + x2) / 2, y1 - 5);
    }
    ctx.restore();
}

function drawArrow(ctx, fromX, fromY, toX, toY, label) {
    ctx.save();
    ctx.strokeStyle = "#c0392b";
    ctx.fillStyle = "#c0392b";
    ctx.lineWidth = 3;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.stroke();

    const headLen = 15;
    const angle = Math.atan2(toY - fromY, toX - fromX);
    ctx.beginPath();
    ctx.moveTo(toX, toY);
    ctx.lineTo(toX - headLen * Math.cos(angle - Math.PI / 6), toY - headLen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(toX - headLen * Math.cos(angle + Math.PI / 6), toY - headLen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "bottom";
    ctx.fillText(label, fromX, fromY - 8);
    ctx.restore();
}

function drawTick(ctx, x, y, position, text) {
    ctx.save();
    ctx.strokeStyle = "#888";
    ctx.fillStyle = "#555";
    ctx.lineWidth = 1;
    const tickLen = 8;
    ctx.font = "14px Arial";

    ctx.beginPath();
    if (position === "left") {
        ctx.moveTo(x, y);
        ctx.lineTo(x - tickLen, y);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.fillText(text, x - tickLen - 5, y);
    }
    ctx.stroke();
    ctx.restore();
}