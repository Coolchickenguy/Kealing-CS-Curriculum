/*
Get basic info
*/

const url = new URL(window.location.href);
let level = url.searchParams.get("level");
const user = localStorage.getItem("username");


if (!level) level = "sandbox"

/*
Check that the user has the level exists and that the user has it unlocked
The checking that it exists is kinda messy, it just checks if the level has instructions
This should work but for clarity should mabye be changed later
*/

async function checks() {

    await fetch(`/api/login?user=${user}&password=${localStorage.getItem("password")}`)
    .then(res => res.json())
    .then(res => {
        if (!res[0]) {
            window.location.href = "/login";
        }
    });

    await fetch(`/api/getUnlocked?user=${user}`)
    .then(res => res.json())
    .then(res => {
        if (!res.includes(level)) {
            window.location.href = "/tree";
        }
    });

    await fetch(`/api/getInstructions?level=${level}`)
    .then(res => {
        if (res.status == 404) {
            console.log("404")
            window.location.href = "/tree";
        }
        return res.text();
    })
    .then(res => {
        document.getElementById("instructions").innerHTML = res;
    });
}

/*
load ace
*/

let baseJsCode = "// loading...";
let baseHTMLCode = "<!-- loading... -->";
let baseCSSCode = "/* loading... */"

let runButton = document.querySelector(".editor-run");
let resetButton = document.querySelector(".editor-reset");
let instructions = document.querySelector(".editor-instructions");

let codeEditor = ace.edit("editorCode");
let cnsl = document.getElementById("console");

let jsFile = ace.createEditSession(baseJsCode.split("\n"));
let htmlFile = ace.createEditSession(baseHTMLCode.split("\n"));
let cssFile = ace.createEditSession(baseCSSCode.split("\n"));

codeEditor.setSession(htmlFile);

codeEditor.setTheme(`ace/theme/tomorrow_night`);
codeEditor.session.setMode(`ace/mode/html`);

let instructionsContainer = document.querySelector(".instructions-container");
let instructionsClose = document.querySelector(".instructions-close");

instructions.addEventListener("click", function() {
    instructionsContainer.style.display = "flow";
});

instructionsClose.addEventListener("click", function() {
    instructionsContainer.style.display = "none";
});

/*
get the base code for the level
*/

async function baseCode() {
    let baseCode = await fetch(`/api/getBaseCode?level=${level}`)
    .then(res => res.json())
    .then(res => {
        return res;
    });

    baseJsCode = baseCode.js;
    baseHTMLCode = baseCode.html;
    baseCSSCode = baseCode.css;

    jsFile.setValue(baseJsCode);
    htmlFile.setValue(baseHTMLCode);
    cssFile.setValue(baseCSSCode);
    
    run();
}

baseCode();

/*
base log
*/

function log(message, color, image=null, end="\n") {
    if (image) {
        let img = document.createElement("img");
        img.src = image;
        img.classList.add("console-image");
        cnsl.appendChild(img);
    }
    let spn = document.createElement("span");
    spn.innerText = `${message}${end}`;
    spn.style.color = color;
    spn.style.overflowWrap = "anywhere";
    spn.classList.add("console-log");
    cnsl.appendChild(spn);
}

/*
change edit mode
*/

function jsButton() {
    codeEditor.setSession(jsFile);
    codeEditor.session.setMode(`ace/mode/javascript`);
}

function htmlButton() {
    codeEditor.setSession(htmlFile);
    codeEditor.session.setMode(`ace/mode/html`);
}

function cssButton() {
    codeEditor.setSession(cssFile);
    codeEditor.session.setMode(`ace/mode/css`);
}

/*
run the code
*/

function runJS(iframe, code) {
    cnsl.innerHTML = "";
    let output = {};
    output.log = function(...message) {
        log(message, "#fff");
    };
    output.error = function(message, lineNo, columnNo) {
        log(`${message}\t`, "red", "static/assets/images/error.svg", "");
        let btn = document.createElement("button");
        btn.innerText = `(line ${lineNo-12}, column ${columnNo})`;
        btn.classList.add("error-pos");
        btn.onclick = function() {
            codeEditor.setSession(jsFile);
            codeEditor.gotoLine(lineNo-12, columnNo-1, true);
        };
        cnsl.appendChild(btn);
    };
    output.warn = function(...message) {
        log(message, "yellow", "static/assets/images/warning.svg");
    };

    window.onmessage = function(e) {
        if (e.data.type == "log") {
            output.log(e.data.message);
        } else if (e.data.type == "error") {
            output.error(e.data.message, e.data.lineNo, e.data.columnNo);
        } else if (e.data.type == "warn") {
            output.warn(e.data.message);
        } else if (e.data.type == "clear") {
            cnsl.innerHTML = "";
        }
    };

    let out = "";
    // handle errors:
    let doc = iframe.contentWindow.document;
    let scriptObj = doc.createElement("script");
    scriptObj.type = "text/javascript";
    scriptObj.innerHTML = `
    window.onerror = function(msg, url, lineNo, columnNo, error) {console.error(msg, lineNo, columnNo);return true;};console.log = function(...message) {window.parent.postMessage({type: "log", message: message}, "*");};console.error = function(message, lineNo, columnNo) {window.parent.postMessage({type: "error", message: message, lineNo: lineNo, columnNo: columnNo}, "*");};console.warn = function(...message) {window.parent.postMessage({type: "warn", message: message}, "*");};console.clear = function() {window.parent.postMessage({type: "clear"}, "*");};`;
    out += scriptObj.outerHTML;

    let tempcode = `\n${code.replace("</script>", "<\\/script>")}\n`;
    scriptObj = doc.createElement("script");
    scriptObj.type = "text/javascript";
    scriptObj.innerHTML = tempcode;
    out += scriptObj.outerHTML;
    return out;
}

function runCSS(iframe, code) {
    let doc = iframe.contentWindow.document;
    let styleObj = doc.createElement("style");
    styleObj.type = "text/css";
    styleObj.innerHTML = code;
    return styleObj.outerHTML;
}

async function run() {
    let existing = document.getElementsByTagName("iframe");
    for (var i = 0; i < existing.length; i++) {
        existing[i].remove()
    }
    let iframe = document.createElement("iframe"); // create the iframe for sandboxing
    document.body.appendChild(iframe);
    iframe.id = "codeIframe"
    iframe.classList.add("code-iframe")
    let code = "";
    code += await htmlFile.getValue()
    code += await runJS(iframe, jsFile.getValue());
    code += runCSS(iframe, cssFile.getValue());
    iframe.srcdoc = code;
}


run()