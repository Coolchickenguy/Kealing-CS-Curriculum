let runButton = document.querySelector(".editor-run");
let resetButton = document.querySelector(".editor-reset");

let codeEditor = ace.edit("editorCode");
let cnsl = document.getElementById("console")

codeEditor.setTheme(`ace/theme/tomorrow_night`);
codeEditor.session.setMode(`ace/mode/javascript`);

function log([message], color) {
    let spn = document.createElement("span");
    spn.innerText = `${message}\n`;
    spn.style.color = color;
    spn.classList.add("console-log");
    cnsl.appendChild(spn);
}

async function run() {
    let code = codeEditor.getValue(); // get the code
    
    let iframe = document.createElement("iframe"); // create the iframe for sandboxing
    iframe.style.display = "none";
    iframe.src = "docs/runCodeIframe.html";
    document.body.appendChild(iframe);

    // console shit
    cnsl.innerHTML = "";
    let output = iframe.contentWindow.console;
    output.log = function(...message) {
        log(message, "#fff")
    }
    output.error = function(...message) {
        let spn = document.createElement("span");
        spn.innerText = `${message.join(" ")}\n`;
        spn.style.color = "red";
        cnsl.appendChild(spn);
    }
    output.warn = function(...message) {
        let spn = document.createElement("span");
        spn.innerText = `${message.join(" ")}\n`;
        spn.style.color = "yellow";
        cnsl.appendChild(spn);
    }
    output.clear = function() {
        cnsl.innerHTML = ""
    }

    try {
        iframe.contentWindow.eval(code);
    } catch(e) {
        let spn = document.createElement("span");

        spn.innerText += `${e}`;

        let line = `${e.lineNumber}: ${code.split("\n")[e.lineNumber-1]}`;
        let temp = "^".repeat(line.length);
        spn.innerText += `\n${line}\n${temp}\n`;

        spn.style.color = "red";
        cnsl.innerHTML = "";
        cnsl.appendChild(spn);
    }
}