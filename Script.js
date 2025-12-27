window.addEventListener('load', () => {
    if (!document.getElementById('date').value) {
        // Format date as YYYY-MM-DD (required by HTML date input)
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        document.getElementById('date').value = `${year}-${month}-${day}`;
    }
});

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
        diameterofsteelbar: parseFloat(document.getElementById('diameter-of-steel-bar').value) || 12
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
    return depth + 50 + (diameter / 2);
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

function getshearforce() {
    const upwardforce = getupwardpressure();
    const width = getwidth();
    const wallthickness = getwallthickness();
    const effectivedepth = geteffectivedepth();
    let shearforce = upwardforce * (((width - wallthickness) / 2) - (effectivedepth / 1000));
    return Math.floor(shearforce * 1000) / 1000;
}

function getpercentsteel() {
    const areaprovided = getareaprovide();
    const effectivedepth = geteffectivedepth();
    return areaprovided * 100 / (1000 * effectivedepth);
}

function getshearstress() {
    const shearforce = getshearforce();
    const effectivedepth = geteffectivedepth();
    return shearforce / effectivedepth;
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

const tauCTable = {
    "15": [0.28, 0.28, 0.46, 0.54, 0.60, 0.64, 0.68, 0.71, 0.71, 0.71, 0.71, 0.71, 0.71],
    "20": [0.28, 0.36, 0.48, 0.56, 0.62, 0.66, 0.72, 0.75, 0.79, 0.81, 0.82, 0.82, 0.82],
    "25": [0.29, 0.36, 0.49, 0.57, 0.64, 0.70, 0.74, 0.78, 0.82, 0.85, 0.87, 0.90, 0.92],
    "30": [0.29, 0.37, 0.50, 0.59, 0.66, 0.71, 0.76, 0.80, 0.84, 0.88, 0.91, 0.94, 0.96],
    "35": [0.29, 0.37, 0.50, 0.59, 0.67, 0.73, 0.78, 0.82, 0.86, 0.90, 0.93, 0.96, 0.99],
    "40+": [0.30, 0.38, 0.51, 0.60, 0.68, 0.74, 0.79, 0.83, 0.87, 0.92, 0.94, 0.98, 1.01]
};

function getPtIndex(pt) {
    if (pt <= 0.15) return 0;
    else if (pt <= 0.25) return 1;
    else if (pt <= 0.50) return 2;
    else if (pt <= 0.75) return 3;
    else if (pt <= 1.00) return 4;
    else if (pt <= 1.25) return 5;
    else if (pt <= 1.50) return 6;
    else if (pt <= 1.75) return 7;
    else if (pt <= 2.00) return 8;
    else if (pt <= 2.25) return 9;
    else if (pt <= 2.50) return 10;
    else if (pt <= 2.75) return 11;
    else return 12;
}

function getDesignShearStrength(percentsteel, gradeofcement) {
    if (gradeofcement >= 40) gradeofcement = "40+";

    const validGrades = ["15", "20", "25", "30", "35", "40+"];
    if (!validGrades.includes(String(gradeofcement))) {
        return 0;
    }

    const rowIndex = getPtIndex(percentsteel);
    const colArray = tauCTable[String(gradeofcement)];
    return colArray[rowIndex] || 0;
}

function gettauc() {
    const percentsteel = getpercentsteel();
    const gradeofcement = getgradeofcement();
    return getDesignShearStrength(percentsteel, gradeofcement);
}

function populateReport() {
    const data = collectData();

    // Calculate all structural values
    const totalLoad = gettotalload();
    const depth = getdepth();
    const spacing = getspacing();
    const areaProvided = getareaprovide();
    const barLength = getbarlength();

    // Update header
    document.getElementById('reportProjectName').textContent = `Project: ${data.projectName}`;
    document.getElementById('reportLocation').textContent = `Location: ${data.location}`;
    document.getElementById('reportDate').textContent = `Date: ${data.date}`;
    document.getElementById('reportEngineer').textContent = `Prepared By: ${data.engineer}`;

    // Update site info
    document.getElementById('summaryProjectName').textContent = data.projectName;
    document.getElementById('summaryLocation').textContent = data.location;
    document.getElementById('investigationDate').textContent = data.date;

    // Section 3: SOIL PROPERTIES
    if (document.getElementById('tablebearingcapacity'))
        document.getElementById('tablebearingcapacity').textContent = data.bearingcapacity.toFixed(2);
    if (document.getElementById('tablewallthickness'))
        document.getElementById('tablewallthickness').textContent = data.wallthickness.toFixed(2);

    // Section 4: GRADES
    if (document.getElementById('tablegradeofsteel'))
        document.getElementById('tablegradeofsteel').textContent = data.gradeofsteel.toFixed(0);
    if (document.getElementById('tablegradeofcement'))
        document.getElementById('tablegradeofcement').textContent = data.gradeofcement.toFixed(0);
    if (document.getElementById('tablediameterofsteelbar'))
        document.getElementById('tablediameterofsteelbar').textContent = data.diameterofsteelbar.toFixed(0);

    // Section 5: LOAD ANALYSIS
    if (document.getElementById('tableDeadLoad'))
        document.getElementById('tableDeadLoad').textContent = data.deadLoad.toFixed(2);
    if (document.getElementById('tableLiveLoad'))
        document.getElementById('tableLiveLoad').textContent = data.liveLoad.toFixed(2);
    if (document.getElementById('totalLoad'))
        document.getElementById('totalLoad').textContent = totalLoad.toFixed(2);
    if (document.getElementById('deadLoadPercent'))
        document.getElementById('deadLoadPercent').textContent = ((data.deadLoad / totalLoad) * 100).toFixed(1) + '%';
    if (document.getElementById('liveLoadPercent'))
        document.getElementById('liveLoadPercent').textContent = ((data.liveLoad / totalLoad) * 100).toFixed(1) + '%';

    // Section 6: FINAL OUTPUT
    if (document.getElementById('tabledepth'))
        document.getElementById('tabledepth').textContent = depth.toFixed(2);
    if (document.getElementById('tablespacing'))
        document.getElementById('tablespacing').textContent = spacing.toFixed(2);
    if (document.getElementById('tablearearequired'))
        document.getElementById('tablearearequired').textContent = areaProvided.toFixed(2);
    if (document.getElementById('tabletotallength'))
        document.getElementById('tabletotallength').textContent = barLength.toFixed(2);
}

async function generatePDF() {
    console.log('=== STARTING PDF GENERATION ===');
    
    try {
        // STEP 1: Test collectData
        console.log('STEP 1: Testing collectData()...');
        const data = collectData();
        console.log('✅ collectData succeeded:', data);
        
        // Check for NaN or invalid values
        Object.keys(data).forEach(key => {
            if (isNaN(data[key]) && typeof data[key] !== 'string') {
                console.warn('⚠️ WARNING: ' + key + ' is NaN:', data[key]);
            }
        });
        
        // STEP 2: Test populateReport
        console.log('STEP 2: Testing populateReport()...');
        populateReport();
        console.log('✅ populateReport succeeded');
        
        // STEP 3: Show and prepare report
        console.log('STEP 3: Preparing report element...');
        const element = document.getElementById('reportContent');
        if (!element) throw new Error('reportContent element missing!');
        element.style.display = 'block';
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Report element ready');
        
        // STEP 4: Convert to canvas
        console.log('STEP 4: Converting to canvas...');
        const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff',
            logging: false
        });
        console.log('✅ Canvas created:', canvas.width, 'x', canvas.height);
        
        // STEP 5: Convert canvas to image
        console.log('STEP 5: Converting canvas to image data...');
        const imgData = canvas.toDataURL('image/png');
        console.log('✅ Image data created, size:', imgData.length);
        
        // STEP 6: Create PDF
        console.log('STEP 6: Creating PDF...');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF('p', 'mm', 'a4');
        console.log('✅ PDF instance created');
        
        // STEP 7: Calculate dimensions
        console.log('STEP 7: Calculating dimensions...');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const imgWidth = pageWidth - 10;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        console.log('✅ Dimensions:', imgWidth, 'x', imgHeight);
        
        // STEP 8: Add pages
        console.log('STEP 8: Adding pages to PDF...');
        let heightLeft = imgHeight;
        let position = 5;
        pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        
        let pageCount = 1;
        while (heightLeft > 0) {
            position = heightLeft - imgHeight + 5;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 5, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
            pageCount++;
        }
        console.log('✅ Pages added:', pageCount);
        
        // STEP 9: Create filename
        console.log('STEP 9: Creating filename...');
        const timestamp = new Date().toISOString().slice(0, 10);
        const safeProjectName = (data.projectName || 'Report').replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `PRIUS_Report_${safeProjectName}_${timestamp}.pdf`;
        console.log('✅ Filename:', filename);
        
        // STEP 10: Download
        console.log('STEP 10: Downloading PDF...');
        const blob = pdf.output('blob');
        console.log('✅ Blob created, size:', blob.size);
        
        const blobUrl = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = blobUrl;
        downloadLink.download = filename;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        
        console.log('✅ Download link created and appended');
        downloadLink.click();
        console.log('✅ DOWNLOAD TRIGGERED!');
        
        // Cleanup
        setTimeout(() => {
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(blobUrl);
        }, 1000);
        
        // Hide report
        element.style.display = 'none';
        
        console.log('=== SUCCESS ===');
        alert('✅ PDF Downloaded: ' + filename);
        
    } catch (error) {
        console.error('❌ ❌ ❌ ERROR ❌ ❌ ❌');
        console.error('Error at:', error.message);
        console.error('Full error:', error);
        console.error('Stack trace:', error.stack);
        
        const element = document.getElementById('reportContent');
        if (element) element.style.display = 'none';
        
        alert('❌ ERROR: ' + error.message);
    }
}

function clearForm() {
    document.getElementById('paramForm').reset();
    document.getElementById('output').innerHTML = '';
    alert('✅ Form cleared!');
}


function calculate() {
    const depth = getdepth();
    const spacing = getspacing();
    const areaProvided = getareaprovide();
    const barLength = getbarlength();

    const result = `
        <h2>Calculated Results:</h2>
        <p><strong>Depth:</strong> ${depth.toFixed(2)} mm</p>
        <p><strong>Spacing:</strong> ${spacing.toFixed(2)} mm</p>
        <p><strong>Total Area to be Provided:</strong> ${areaProvided.toFixed(2)} mm²</p>
        <p><strong>Steel Bar Length:</strong> ${barLength.toFixed(2)} mm</p>
    `;

    const outputDiv = document.getElementById('output');
    if (outputDiv) {
        outputDiv.innerHTML = result;
    }
}
