import { Calculator } from "./calculator.js";
import { createHistory } from "./history.js";

let input = document.getElementById("input");
let output = document.getElementById("output");
let historyBox = document.getElementById("historyBox");

let historyObj = createHistory();
let calc = new Calculator(input, output, historyObj);

function loadHistory() {
    let history = historyObj.getAll();
    historyBox.innerHTML = "";

    history.forEach(item => {
        let div = document.createElement("div");
        div.className = "border p-2 mb-2 rounded";

        div.innerHTML = `
      <div class="history-input text-muted">${item.input}</div>
      <div class="history-output fw-bold">${item.output}</div>
    `;

        historyBox.appendChild(div);
    });
}

loadHistory();

const clearHistoryBtn = document.getElementById("clearHistoryBtn");

if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener("click", () => {
        historyObj.clear(); 
        historyBox.innerHTML = ""; 
    });
}

// Theme Toggle
const toggle = document.getElementById("themeToggle");

if (toggle) {
    toggle.addEventListener("change", () => {
        document.body.classList.toggle("dark-mode");
    });
}

const sciBtn = document.querySelector(".scientific");
const stdBtn = document.querySelector(".standard");

if (sciBtn) {
    sciBtn.addEventListener("click", () => {
        document.getElementById("standardGrid").classList.add("d-none");
        document.getElementById("scientificGrid").classList.remove("d-none");
        document.getElementById("scientificGrid1").classList.remove("d-none");
        document.getElementById("calcTitle").innerText = "Scientific";
    });
}

if (stdBtn) {
    stdBtn.addEventListener("click", () => {
        document.getElementById("scientificGrid").classList.add("d-none");
        document.getElementById("scientificGrid1").classList.add("d-none");
        document.getElementById("standardGrid").classList.remove("d-none");
        document.getElementById("calcTitle").innerText = "Standard";
    });
}


document.querySelectorAll(".calc-btn").forEach(btn => {
    btn.addEventListener("click", function () {

        let value = btn.innerText;
        let type = btn.dataset.value;

        if (value === "C") calc.clear();
        else if (value === "=") {
            calc.evaluate();
            loadHistory();
        }
        else if (btn.querySelector("i")?.classList.contains("bi-backspace")) calc.backspace();
        else if (type === "sin") calc.sin();
        else if (type === "cos") calc.cos();
        else if (type === "tan") calc.tan();
        else if (type === "sqrt") calc.sqrt();
        else if (type === "log") calc.log();
        else if (type === "ln") calc.ln();
        else if (type === "fact") calc.fact();
        else if (value === "CE") calc.clearEntry();
        else if (type === "1byx") calc.inverse();
        else if (type === "square") calc.square();
        else if (value === "+/-") calc.toggleSign();
        else if (type === "pow") calc.pow();
        else if (value === "π") {
            calc.append(Math.PI.toString());
        }
        else if (value === "e") {
            calc.append(Math.E.toString());
        }
        else if (type === "pow") calc.pow();
        else if (type === "10pow") calc.tenPower();
        else if (type === "exp") calc.exp();
        else if (type === "sec") calc.sec();
        else if (type === "csc") calc.csc();
        else if (type === "cot") calc.cot();
        else if (type === "abs") calc.abs();
        else if (type === "floor") calc.floor();
        else if (type === "ceil") calc.ceil();
        else if (type === "rand") calc.rand();
        else if (type === "dms") calc.dms();
        else if (type === "deg") calc.deg();
        else if (value === "mod") calc.mod();
        else if (type === "modX") calc.modX();
        else if (type === "2pow") calc.twoPower();

        else calc.append(value);

    });
});