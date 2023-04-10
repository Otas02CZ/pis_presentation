const message = "otas02cz@pop-os: echo HELLO THERE!<br/>otas02cz@pop-os: HELLO THERE!<br/>otas02cz@pop-os:";
let showedMessage = "";
let loaded = false;
let state = false;
let counter = 0;

const helloElement = document.getElementById("hello-there");
let inst = setInterval(change, 75);
const trumpElement = document.getElementById("trump-gif");
const trumpButton = document.getElementById("important-button");
let trumpContextSwitcher = false;

function change() {
    if (loaded) {
        if (state)
            showedMessage = message;
        else
            showedMessage = message + "__";
        state = !state;
    }
    else {
        showedMessage += message[counter];
        counter++;
        if (counter === message.length) {
            loaded = true;
            clearInterval(inst);
            inst = setInterval(change, 600);
        }
    }
    helloElement.innerHTML = showedMessage;
}
function switchContextTrump() {
    if (trumpContextSwitcher) {
        trumpButton.innerHTML = "Zobrazit skryté informace";
        trumpElement.innerHTML = "";
        trumpContextSwitcher = false;
    }
    else {
        trumpButton.innerHTML = "Raději zase skrýt ...";
        trumpElement.innerHTML = "<p class='block-text text-center'>Já říkal Vám, že chodit sem nemáte. Ale vy neposlouchat.</p>" +
            "                <iframe src=\"https://giphy.com/embed/fItgT774J3nWw\" width=\"480\" height=\"480\" class=\"giphy-embed center\" allowFullScreen></iframe><p><a href=\"https://giphy.com/gifs/yoda-count-dooku-fItgT774J3nWw\">via GIPHY</a>\n";
        trumpContextSwitcher = true;
    }
}

const SERVER_URL = "../php/server.php";
function dispatchRequest(data, url) {
    axios({
        method: 'post',
        url: url,
        data: data,
    })
        .then((response) => {
            if (response.status !== 200) {
                handleError();
                return;
            }
            const lastOccurrenceIndex = response.data.lastIndexOf("-->");
            if (lastOccurrenceIndex !== -1)
                response.data = response.data.substring(lastOccurrenceIndex+3);
            response.data = JSON.parse(response.data);
            switch (response.data.type) {
                case "getData":
                    handleGetDataResponse(response.data);
                    break;
                case "addExam":
                    handleAddExamResponse(response.data);
                    break;
                case "rmExam":
                    handleRmDataResponse(response.data);
                    break;
                case "getIp":
                    handleGetIpResponse(response.data);
                    break;
                default:
                    handleError();
                    break;
            }
        }, (error) => {
            handleError();
        });
}

function handleError() {
    alert("Během zpracovávání se vyskytla chyba.");
}
function handleAddExamResponse(data) {
    const addExamInfoElement = document.getElementById("add-exam-info");
    if (data.msg==="error") {
        addExamInfoElement.innerHTML = "<div class=\"alert alert-danger alert-dismissible fade show\">\n" +
            "    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>\n" +
            "    <strong>Chyba!</strong> Došlo k chybě při přidávání záznamu o zkoušce.\n" +
            "  </div>";
    }
    else {
        addExamInfoElement.innerHTML = "<div class=\"alert alert-success alert-dismissible fade show\">\n" +
            "    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>\n" +
            "    <strong>V pořádku!</strong> Záznam o zkoušce byl úspěšně vložen.\n" +
            "  </div>";
    }
    handleGetDataResponse(data);
}
function handleRmDataResponse(data) {
    const rmExamInfoElement = document.getElementById("rm-exam-info");
    if (data.msg==="error") {
        rmExamInfoElement.innerHTML = "<div class=\"alert alert-danger alert-dismissible fade show\">\n" +
            "    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>\n" +
            "    <strong>Chyba!</strong> Došlo k chybě při mazání záznamu o zkoušce.\n" +
            "  </div>";
    }
    else {
        rmExamInfoElement.innerHTML = "<div class=\"alert alert-success alert-dismissible fade show\">\n" +
            "    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"alert\"></button>\n" +
            "    <strong>V pořádku!</strong> Záznam o zkoušce byl úspěšně smazán.\n" +
            "  </div>";
    }
    handleGetDataResponse(data);

}
function switchVisibilityAllDataElements(visible) {
    switchVisibilityDataElement("exam-table", "exam-table-empty", visible);
    switchVisibilityDataElement("weighted-average", "weighted-average-empty", visible);
    switchVisibilityDataElement("best-exam", "best-exam-empty", visible);
    switchVisibilityDataElement("worst-exam", "worst-exam-empty", visible);
    switchVisibilityDataElement("visualisation-weighted-average", "visualisation-weighted-average-empty", visible);
    switchVisibilityDataElement("rm-exam", "rm-exam-empty", visible);
}
function switchVisibilityDataElement(normal, empty, visible) {
    if (visible) {
        let element = document.getElementById(normal);
        element.hidden = false;
        element = document.getElementById(empty);
        element.hidden = true;
    }
    else {
        let element = document.getElementById(normal);
        element.hidden = true;
        element = document.getElementById(empty);
        element.hidden = false;
    }

}
function handleGetDataResponse(data) {
    if (data.msg==="error") {
        handleError();
        return;
    }
    if (data.data.length===0) {
        switchVisibilityAllDataElements(false);
        return;
    }
    switchVisibilityAllDataElements(true);
    clearInterval(visualisationInterval);
    let tableHTML = ""
    let optionListHTML = "";
    for (const index in data.data) {
        const exam = data.data[index]
        tableHTML += "<tr>" +
            "   <td>"+ exam.name +"</td>" +
            "   <td>" + exam.date + "</td>" +
            "   <td>" + getStringExamGrade(exam.grade) + "</td>" +
            "</tr>";
        optionListHTML += "<option value='" + exam.id + "'>" +
            exam.id + " - " + exam.name + " - " + exam.date + " - " + getStringExamGrade(exam.grade) +
            "</option>";
    }
    document.getElementById("table-results").innerHTML = tableHTML;
    document.getElementById("rm-exam-option").innerHTML = optionListHTML;

    const worstBest = findWorstBest(data.data);
    tableHTML = "";
    for (let index in worstBest.worst) {
        let exam = data.data[worstBest.worst[index]];
        tableHTML += "<tr>" +
            "   <td>"+ exam.name +"</td>" +
            "   <td>" + exam.date + "</td>" +
            "   <td>" + getStringExamGrade(exam.grade) + "</td>" +
            "</tr>";
    }
    document.getElementById("table-worst-exam").innerHTML = tableHTML;
    tableHTML = "";
    for (let index in worstBest.best) {
        let exam = data.data[worstBest.best[index]];
        tableHTML += "<tr>" +
            "   <td>"+ exam.name +"</td>" +
            "   <td>" + exam.date + "</td>" +
            "   <td>" + getStringExamGrade(exam.grade) + "</td>" +
            "</tr>";
    }
    document.getElementById("table-best-exam").innerHTML = tableHTML;

    const weightedAverage = calculateWeightedAverage(data.data);
    if (isNaN(weightedAverage))
        document.getElementById("weighted-average").innerHTML = "<h2>Vážený průměř není možné stanovit</h2>";
    else
        document.getElementById("weighted-average").innerHTML = "<h2>Vážený průměř ze všech zkoušek" +
            " je " + weightedAverage.toFixed(2) + "</h2>";
    makeVisualisation(data.data);
}
function calculateWeightedAverage(exams) {
    let sum = 0;
    let fixF = 0;
    for (const index in exams) {
        const exam = exams[index];
        if (exam.grade !== 6)
            sum += exam.grade;
        else
            fixF++;
    }
    return sum/(exams.length-fixF);
}
function getStringExamGrade(grade) {
    switch (grade) {
        case 6:
            return "F";
        case 1:
            return "A";
        case 2:
            return "B";
        case 3:
            return "C";
        case 4:
            return "D";
        case 5:
            return "E";
        default:
            return "F";
    }
}
function handleGetIpResponse(data) {
    alert("Dle serveru používáte IP adresu: " + data.data);
}

function handleRmExamRequest() {
    const request = {
        type: "rmExam",
        data: {
            id: document.getElementById("rm-exam-option").value,
        },
    };
    dispatchRequest(request, SERVER_URL);
}
function handleAddExamRequest() {
    const request = {
        type: "addExam",
        data: {
            name: document.getElementById("name").value,
            date: document.getElementById("date").value,
            grade: document.getElementById("grade").value,
        },
    };
    dispatchRequest(request, SERVER_URL);
}
function getData() {
    const request = {
        type: "getData",
        data: {},
    };
    dispatchRequest(request, SERVER_URL);
}
function getIp() {
    const request = {
        type: "getIp",
        data: {},
    }
    dispatchRequest(request, SERVER_URL);
}

function findWorstBest(exams)
{
    let min = 0;
    let max = 0;
    if (exams.length > 1) {
        for (let i=1;i<exams.length;i++) {
            if (exams[min].grade > exams[i].grade)
                min = i;
            if (exams[max].grade < exams[i].grade)
                max = i;
        }
        let worst = [max];
        let best = [min];
        for (let i=0;i<exams.length;i++) {
            if (min !== i && exams[min].grade === exams[i].grade)
                best.push(i);
            if (max !== i && exams[max].grade === exams[i].grade)
                worst.push(i);
        }
        return {worst: worst, best: best};
    }
    else
        return {worst: [min], best: [max]};
}

let indexVisual = 0;
let visualisationInterval;
function makeVisualisation(exams) {
    exams.sort((a, b) => new Date(a.date) - new Date(b.date));
    updateVisualisation(exams);
    visualisationInterval = setInterval(function () {updateVisualisation(exams)}, 2500);

}

function updateVisualisation(exams) {
    const subExams = exams.slice(0, indexVisual+1);
    const avg = calculateWeightedAverage(subExams);
    let avgMsg;
    if (isNaN(avg))
        avgMsg = "Nelze stanovit";
    else
        avgMsg = avg.toFixed(2);
    let visualisationHTML = "<div class='text-center'>" +
        "<p><b>Po zkoušce:</b></p><p>" + (indexVisual+1) + ".</p><p>" + exams[indexVisual].name + "</p>\n<p>" + exams[indexVisual].date +"</p></p>" +
        "<h2>" + avgMsg + "</h2>" +
        "</div>";
    indexVisual++;
    if (indexVisual === exams.length) {
        indexVisual = 0;
    }
    document.getElementById("visualisation-weighted-average").innerHTML = visualisationHTML;
}

function easterEgg() {
    document.getElementById("easterEgg").innerHTML = "<div class=\"toast show\">\n" +
        "  <div class=\"toast-header bg-secondary text-white\">\n" +
        "    Easter Egg\n" +
        "    <button type=\"button\" class=\"btn-close\" data-bs-dismiss=\"toast\"></button>\n" +
        "  </div>\n" +
        "  <div class=\"toast-body bg-secondary text-white\">\n" +
        "    This is easter egg\n" +
        "  </div>\n" +
        "</div>"
}


getData();

