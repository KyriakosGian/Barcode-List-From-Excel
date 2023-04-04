//Name the list title 
const typeHandler = function (e) {
    document.getElementById('printTitle').innerHTML = e.target.value;
    localStorage.setItem('Title', e.target.value); //Save Title to localStorage
}

document.getElementById('inputTitle').addEventListener('input', typeHandler);
document.getElementById('inputTitle').addEventListener('propertychange', typeHandler);

//Load Title from localStorage if exist
if (localStorage.getItem("Title") != null) {
    document.getElementById('printTitle').innerHTML = localStorage.getItem("Title");
    document.getElementById('inputTitle').defaultValue = localStorage.getItem("Title");
}

//Add date to bottom
document.getElementById('date').innerHTML = Date();

//Excel barcode functions
const uploadedFile = document.getElementById('uploadedFile');
const excelDataTable = document.getElementById('excelDataTable');

uploadedFile.addEventListener('change', handleFileSelect, false);

function handleFileSelect(evt) {
    excelDataTable.innerHTML = "";
    const files = evt.target.files;
    const xl2json = new ExcelToJSON();
    xl2json.parseExcel(files[0]);
}

class ExcelToJSON {
    parseExcel(file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = e.target.result;
            const workbook = XLSX.read(data, { type: 'binary' });

            workbook.SheetNames.forEach((sheetName) => {
                const XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                const json_object = JSON.stringify(XL_row_object);
                buildHtmlTable(JSON.parse(json_object), 'excelDataTable');

                const targetTDs = excelDataTable.querySelectorAll('tr > td:first-child');

                for (let i = 0; i < targetTDs.length; i++) {
                    const td = targetTDs[i];
                    td.innerHTML = `<svg class="barcode" jsbarcode-value="${td.innerHTML}" jsbarcode-height="35" jsbarcode-width="2"</svg>`;
                }

                JsBarcode(".barcode").init();
            });
        };

        reader.onerror = (ex) => console.log(ex);

        reader.readAsBinaryString(file);
    }
}

// Builds the HTML Table out of myList.
function buildHtmlTable(myList, selector) {
    const columns = addAllColumnHeaders(myList, selector);
    const table = document.getElementById(selector);

    for (let i = 0; i < myList.length; i++) {
        const row = table.insertRow(-1);
        for (let colIndex = 0; colIndex < columns.length; colIndex++) {
            let cellValue = myList[i][columns[colIndex]];

            if (colIndex === 0) {
                // do nothing
            }
            if (cellValue == null) {
                cellValue = "";
            }
            const cell = row.insertCell(-1);
            cell.innerHTML = cellValue;
        }
    }
}

// Adds a header row to the table and returns the set of columns.
// Need to do union of keys from all records as some records may not contain
// all records.
function addAllColumnHeaders(myList, selector) {
    const columnSet = [];
    const headerTr = document.createElement('tr');

    for (let i = 0; i < myList.length; i++) {
        const rowHash = myList[i];
        for (const key in rowHash) {
            if (!columnSet.includes(key)) {
                columnSet.push(key);
                const th = document.createElement('th');
                th.textContent = key;
                headerTr.appendChild(th);
            }
        }
    }
    document.getElementById(selector).appendChild(headerTr);
    return columnSet;
}

function SetBarcodeHeight(height) {
    const elements = document.querySelectorAll(".barcode");
    for (let i = 0; i < elements.length; i++) {
        const currentElements = elements[i];
        currentElements.setAttribute('jsbarcode-height', height);
    }
    JsBarcode(".barcode").init();
}