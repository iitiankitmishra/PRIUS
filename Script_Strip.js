window.addEventListener('load', () => {
    if (document.getElementById('date') && !document.getElementById('date').value) {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('date').value = `${year}-${month}-${day}`;
    }
});

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        sidebar.classList.toggle('open');
    } else {
        sidebar.classList.toggle('collapsed');
    }
}

function openTab(evt, tabId) {
    const tabContents = document.getElementsByClassName("tab-content");
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].style.display = "none";
        tabContents[i].classList.remove("active");
    }

    const tabBtns = document.getElementsByClassName("tab-btn");
    for (let i = 0; i < tabBtns.length; i++) {
        tabBtns[i].className = tabBtns[i].className.replace(" active", "");
    }

    document.getElementById(tabId).style.display = "block";
    evt.currentTarget.className += " active";
}

function clearForm() {
    document.getElementById('paramForm').reset();

    const outputDiv = document.getElementById('output');
    outputDiv.innerHTML = `
        <div class="state-empty">
            <i class="fa-solid fa-calculator"></i>
            <p>No calculation yet</p>
            <small>Enter parameters above and click Calculate</small>
        </div>
    `;
    alert('✅ Form cleared!');
}

function collectData() {
    return {
        projectName: document.getElementById('projectName').value || 'N/A',
        location: document.getElementById('location').value || 'N/A',
        engineer: document.getElementById('engineer').value || 'N/A',
        date: document.getElementById('date').value || (() => {
            const today = new Date();
            return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        })(),
        bearingcapacity: parseFloat(document.getElementById('bearing-capacity').value) || 0,
        wallthickness: parseFloat(document.getElementById('wall-thickness').value) || 0,
        gradeofsteel: parseFloat(document.getElementById('grade-of-steel').value) || 415,
        gradeofcement: parseFloat(document.getElementById('grade-of-cement').value) || 20,
        deadLoad: parseFloat(document.getElementById('dead-load').value) || 0,
        liveLoad: parseFloat(document.getElementById('live-load').value) || 0,
        diameterofsteelbar: parseFloat(document.getElementById('diameter-of-steel-bar').value) || 12,
        depthOfFoundation: parseFloat(document.getElementById('depth-of-foundation').value) || 500,
        nominalCover: parseFloat(document.getElementById('nominal-cover').value) || 50,
        distBarDiameter: parseFloat(document.getElementById('diameter-of-dist-bar').value) || 8
    };
}

function getliveload() {
    return parseFloat(document.getElementById("live-load").value) || 0;
}

function getdeadload() {
    return parseFloat(document.getElementById("dead-load").value) || 0;
}

function getbearingcapacity() {
    return parseFloat(document.getElementById("bearing-capacity").value) || 0;
}

function getwallthickness() {
    return parseFloat(document.getElementById("wall-thickness").value) || 0;
}

function getgradeofsteel() {
    return parseFloat(document.getElementById("grade-of-steel").value) || 415;
}

function getgradeofcement() {
    return parseFloat(document.getElementById("grade-of-cement").value) || 20;
}

function getdiameterofsteelbar() {
    return parseFloat(document.getElementById("diameter-of-steel-bar").value) || 12;
}

function getdepthoffoundation() {
    return parseFloat(document.getElementById("depth-of-foundation").value) || 0;
}

function getnominalcover() {
    return parseFloat(document.getElementById("nominal-cover").value) || 0;
}

function getdistbardiameter() {
    return parseFloat(document.getElementById("diameter-of-dist-bar").value) || 8;
}

function gettotalload() {
    return getdeadload() + getliveload();
}

function getfactoredload() {
    return gettotalload() * 1.5;
}

function getwidth() {
    const ftl = getfactoredload();
    const bearing = getbearingcapacity();
    let width = ftl / bearing;
    return Math.floor(width * 1000) / 1000;
}

function getdownwardload() {
    return getfactoredload() * 0.9;
}

function getupwardpressure() {
    const download = getdownwardload();
    const width = getwidth();
    let upward = download / width;
    return Math.floor(upward * 1000) / 1000;
}

function getbmultimate() {
    const width = getwidth();
    const wall = getwallthickness();
    const upward = getupwardpressure();
    const a = (width / 2) - (wall / 4);
    let bmultimate = (upward / 2) * Math.pow(a, 2);
    return Math.floor(bmultimate * 1000) / 1000;
}

function geteffectivedepth() {
    const gradeofsteel = getgradeofsteel();
    const gradeofcement = getgradeofcement();
    const bmultimate = getbmultimate();
    const width = 1000;
    const frac = bmultimate * 1000000 / (gradeofcement * width);

    if (gradeofsteel === 500) {
        let depth = Math.pow(frac / 0.133, 0.5);
        return Math.floor(depth * 100) / 100;
    } else if (gradeofsteel === 415) {
        let depth = Math.pow(frac / 0.138, 0.5);
        return Math.floor(depth * 100) / 100;
    } else if (gradeofsteel === 250) {
        let depth = Math.pow(frac / 0.148, 0.5);
        return Math.floor(depth * 100) / 100;
    }
    return 0;
}

function getdepth() {
    const diameter = getdiameterofsteelbar();
    const depth = geteffectivedepth();
    const cover = getnominalcover() || 50;
    return depth + cover + (diameter / 2);
}

function gettotalarea() {
    const cementgrade = getgradeofcement();
    const steelgrade = getgradeofsteel();
    const width = 1000;
    const depth = geteffectivedepth();
    const bmultimate = getbmultimate();
    let frac = 1 - Math.pow(1 - ((4.6 * bmultimate * Math.pow(10, 6)) / (cementgrade * width * Math.pow(depth, 2))), 0.5);
    frac = 0.5 * cementgrade * frac * width * depth / steelgrade;
    return Math.floor(frac * 1000) / 1000;
}

function getbararea() {
    const dia = getdiameterofsteelbar();
    return Math.PI * dia * dia / 4;
}

function getspacing() {
    const bararea = getbararea();
    const totalarea = gettotalarea();
    let spacing = bararea * 1000 / totalarea;
    spacing = spacing * 0.96;
    return Math.floor(spacing * 1000) / 1000;
}

function getareaprovide() {
    const bararea = getbararea();
    const spacing = getspacing();
    let areaprovided = bararea * 1000 / spacing;
    return Math.floor(areaprovided * 1000) / 1000;
}

function getbarlength() {
    const steelgrade = getgradeofsteel();
    const cementgrade = getgradeofcement();
    const diameter = getdiameterofsteelbar();
    let frac = 0.87 * steelgrade * diameter / 4;

    if (steelgrade === 250) {
        frac = frac / (0.16 * Math.pow(cementgrade, 0.66));
    } else if (steelgrade === 415 || steelgrade === 500) {
        frac = frac / (0.16 * 1.6 * Math.pow(cementgrade, 0.66));
    }
    return Math.floor(frac * 100) / 100;
}

function populateReport() {
    const data = collectData();
    const totalLoad = gettotalload();
    const depth = getdepth();
    const spacing = getspacing();
    const areaProvided = getareaprovide();
    const barLength = getbarlength();

    if (document.getElementById('reportProjectName')) document.getElementById('reportProjectName').textContent = `Project: ${data.projectName}`;
    if (document.getElementById('reportLocation')) document.getElementById('reportLocation').textContent = `Location: ${data.location}`;
    if (document.getElementById('reportDate')) document.getElementById('reportDate').textContent = `Date: ${data.date}`;
    if (document.getElementById('reportEngineer')) document.getElementById('reportEngineer').textContent = `Prepared By: ${data.engineer}`;

    if (document.getElementById('summaryProjectName')) document.getElementById('summaryProjectName').textContent = data.projectName;
    if (document.getElementById('summaryLocation')) document.getElementById('summaryLocation').textContent = data.location;
    if (document.getElementById('investigationDate')) document.getElementById('investigationDate').textContent = data.date;

    if (document.getElementById('tablebearingcapacity')) document.getElementById('tablebearingcapacity').textContent = data.bearingcapacity.toFixed(2);
    if (document.getElementById('tablewallthickness')) document.getElementById('tablewallthickness').textContent = data.wallthickness.toFixed(2);

    if (document.getElementById('tablegradeofsteel')) document.getElementById('tablegradeofsteel').textContent = data.gradeofsteel.toFixed(0);
    if (document.getElementById('tablegradeofcement')) document.getElementById('tablegradeofcement').textContent = data.gradeofcement.toFixed(0);
    if (document.getElementById('tablediameterofsteelbar')) document.getElementById('tablediameterofsteelbar').textContent = data.diameterofsteelbar.toFixed(0);

    if (document.getElementById('tableDeadLoad')) document.getElementById('tableDeadLoad').textContent = data.deadLoad.toFixed(2);
    if (document.getElementById('tableLiveLoad')) document.getElementById('tableLiveLoad').textContent = data.liveLoad.toFixed(2);
    if (document.getElementById('totalLoad')) document.getElementById('totalLoad').textContent = totalLoad.toFixed(2);

    const dPercent = totalLoad > 0 ? (data.deadLoad / totalLoad) * 100 : 0;
    const lPercent = totalLoad > 0 ? (data.liveLoad / totalLoad) * 100 : 0;
    if (document.getElementById('deadLoadPercent')) document.getElementById('deadLoadPercent').textContent = dPercent.toFixed(1) + '%';
    if (document.getElementById('liveLoadPercent')) document.getElementById('liveLoadPercent').textContent = lPercent.toFixed(1) + '%';

    if (document.getElementById('tabledepth')) document.getElementById('tabledepth').textContent = depth.toFixed(2);
    if (document.getElementById('tablespacing')) document.getElementById('tablespacing').textContent = spacing.toFixed(2);
    if (document.getElementById('tablearearequired')) document.getElementById('tablearearequired').textContent = areaProvided.toFixed(2);
    if (document.getElementById('tabletotallength')) document.getElementById('tabletotallength').textContent = barLength.toFixed(2);
}

async function generatePDF() {
    populateReport();

    const element = document.getElementById('reportContent');
    const vizCanvas = document.querySelector('#viz-container canvas');
    let addedVizSection = null;

    if (vizCanvas) {
        addedVizSection = document.createElement('div');
        addedVizSection.className = 'report-section';

        const title = document.createElement('h2');
        title.textContent = '7. GRAPHIC VISUALIZATION';
        addedVizSection.appendChild(title);

        const img = document.createElement('img');
        img.src = vizCanvas.toDataURL('image/png');
        img.style.width = '100%';
        img.style.height = 'auto';
        img.style.border = '1px solid #ccc';
        img.style.marginTop = '10px';
        img.style.borderRadius = '4px';

        addedVizSection.appendChild(img);
        element.appendChild(addedVizSection);
    }

    element.style.display = 'block';

    try {
        await new Promise(resolve => setTimeout(resolve, 300));

        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        const imgData = canvas.toDataURL('image/png');

        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 10;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        let heightLeft = imgHeight;
        let position = 5;

        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 5;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }

        const data = collectData();
        const safeName = (data.projectName || 'Report').replace(/[^a-z0-9]/gi, '_');
        pdf.save(`PRIUS_Report_${safeName}.pdf`);
    } catch (e) {
        console.error("PDF Error", e);
        alert("Error generating PDF: " + e.message);
    } finally {
        element.style.display = 'none';
        if (addedVizSection) {
            element.removeChild(addedVizSection);
        }
    }
}

function calculate() {
    if (
        document.getElementById("dead-load").value === "" ||
        document.getElementById("live-load").value === "" ||
        document.getElementById("bearing-capacity").value === "" ||
        document.getElementById("wall-thickness").value === "" ||
        document.getElementById("grade-of-steel").value === "" ||
        document.getElementById("grade-of-cement").value === "" ||
        document.getElementById("diameter-of-steel-bar").value === "" ||
        document.getElementById("depth-of-foundation").value === "" ||
        document.getElementById("nominal-cover").value === ""
    ) {
        document.getElementById("output").innerHTML =
            `<div class="state-empty">
            <i class="fa-solid fa-circle-exclamation"></i>
            <p>Please fill all input fields first</p>
        </div>`;

        const vizWarning = document.getElementById("viz-warning");
        if (vizWarning) vizWarning.style.display = "block";

        return;
    }

    const vizWarning = document.getElementById("viz-warning");
    if (vizWarning) vizWarning.style.display = "none";

    const depth = getdepth();
    const spacing = getspacing();
    const areaProvided = getareaprovide();
    const barLength = getbarlength();

    const resultHTML = `
        <div class="results-list">
            <h2>Calculated Results</h2>
            <p><strong>Total Depth:</strong> ${depth.toFixed(2)} mm</p>
            <p><strong>Spacing:</strong> ${spacing.toFixed(2)} mm</p>
            <p><strong>Total Area to be Provided:</strong> ${areaProvided.toFixed(2)} mm²</p>
            <p><strong>Steel Bar Length:</strong> ${barLength.toFixed(2)} mm</p>
        </div>
    `;

    const outputDiv = document.getElementById('output');
    if (outputDiv) {
        outputDiv.innerHTML = resultHTML;
    }
    if (typeof drawVisualization === "function") {
        drawVisualization();
    }
}