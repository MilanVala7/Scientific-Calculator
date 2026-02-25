import { degToRad, factorial } from "./util.js";

export class Calculator {
  constructor(inputEl, outputEl, historyObj) {
    this.inputEl = inputEl;
    this.outputEl = outputEl;
    this.historyObj = historyObj;

    this.expression = "";
    this.fromScientific = false;

    this.lastOperator = "";
    this.lastOperand = "";
    this.lastResult = null;
    this.justEvaluated = false;
  }


  isOperator(ch) {
    return ["+", "-", "x", "÷", "*", "/"].includes(ch);
  }

  #getBracketCount() {
    let openCount = (this.expression.match(/\(/g) || []).length;
    let closeCount = (this.expression.match(/\)/g) || []).length;
    return { open: openCount, close: closeCount };
  }

  #isValidBracketOperation(value) {
    if (value === "(") {
      return true; 
    }

    if (value === ")") {
      const { open, close } = this.#getBracketCount();
      if (open === 0) {
        this.outputEl.innerText = "Error: No opening bracket";
        return false;
      }
      if (close >= open) {
        return;
      }
      return true;
    }

    return true;
  }

  #areBracketsBalanced() {
    const { open, close } = this.#getBracketCount();
    if (open !== close) {
      this.outputEl.innerText = "Error: Unmatched brackets";
      return false;
    }
    return true;
  }

  #addImplicitMultiplication(expr) {
    expr = expr.replace(/\)\(/g, ")*(");
    expr = expr.replace(/(\d)\(/g, "$1*(");
    expr = expr.replace(/\)(\d)/g, ")*$1");
    
    return expr;
  }

  append(value) {
    if (this.justEvaluated && !this.isOperator(value)) {
      this.expression = "";
      this.outputEl.innerText = "";
      this.justEvaluated = false;
    }

    if (value === "(" || value === ")") {
      if (!this.#isValidBracketOperation(value)) {
        return;
      }
    }

    const last = this.expression.slice(-1);

    if (this.isOperator(value) && this.isOperator(last)) {
      this.expression = this.expression.slice(0, -1) + value;
      this.outputEl.innerText = this.expression;
      this.justEvaluated = false;
      return;
    }

    if (!this.expression && this.isOperator(value) && value !== "-") return;

    if (value === ".") {
      const parts = this.expression.split(/[\+\-x÷*/]/);
      if (parts[parts.length - 1].includes(".")) return;
    }

    this.expression += value;
    this.outputEl.innerText = this.expression;
    this.justEvaluated = false;
  }

  clear() {
    this.expression = "";
    this.inputEl.innerText = "";
    this.outputEl.innerText = "";

    this.lastOperator = "";
    this.lastOperand = "";
    this.lastResult = null;
    this.justEvaluated = false;
  }

  backspace() {
    this.expression = this.expression.slice(0, -1);
    this.outputEl.innerText = this.expression;
  }

  evaluate() {
    try {
      if (!this.#areBracketsBalanced()) {
        return;
      }

      if (this.justEvaluated && this.lastOperator && this.lastOperand !== "") {
        if (this.lastOperator === "/" && Number(this.lastOperand) === 0) {
          this.outputEl.innerText = "Cannot divide by zero.";
          return;
        }

        const repeatExp = `${this.lastResult}${this.lastOperator}${this.lastOperand}`;
        const repeatResult = eval(repeatExp);

        if (!isFinite(repeatResult)) {
          this.outputEl.innerText = "Cannot divide by zero.";
          return;
        }

        this.lastResult = repeatResult;
        this.outputEl.innerText = repeatResult;
        return;
      }

      let finalExp = this.expression.replaceAll("x", "*").replaceAll("÷", "/");
      
      finalExp = this.#addImplicitMultiplication(finalExp);
      
      let result = eval(finalExp);

      if (!isFinite(result)) {
        this.outputEl.innerText = "Cannot divide by zero.";
        return;
      }

      const match = finalExp.match(/(.+)([+\-*/])(\d+(\.\d+)?)$/);
      if (match) {
        this.lastOperator = match[2];
        this.lastOperand = match[3];
      }

      this.inputEl.innerText = this.outputEl.innerText;
      this.outputEl.innerText = result;

      if (!this.fromScientific) {
        this.historyObj.add(this.inputEl.innerText || this.expression, result);
      }

      this.lastResult = result;
      this.expression = "";
      this.justEvaluated = true;
      this.fromScientific = false;

    } catch {
      this.outputEl.innerText = "Error";
    }
  }


  sin() { this.#trig("sin", Math.sin); }
  cos() { this.#trig("cos", Math.cos); }
  tan() { this.#trig("tan", Math.tan); }

  sec() { this.#invTrig("sec", Math.cos); }
  csc() { this.#invTrig("csc", Math.sin); }
  cot() { this.#invTrig("cot", Math.tan); }

  #trig(name, fn) {
    try {
      let num = eval(this.expression);
      let result = fn(degToRad(num));
      if (!isFinite(result)) {
        this.outputEl.innerText = "Math Error";
        return;
      }
      this.#finalize(`${name}(${num})`, result);
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  #invTrig(name, fn) {
    try {
      let num = eval(this.expression);
      let denom = fn(degToRad(num));
      if (denom === 0) {
        this.outputEl.innerText = "Cannot divide by zero.";
        return;
      }
      this.#finalize(`${name}(${num})`, 1 / denom);
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  sqrt() {
    try {
      let num = eval(this.expression);
      if (num < 0) throw Error();
      this.#finalize(`√(${num})`, Math.sqrt(num));
    } catch {
      this.outputEl.innerText = "Math Error";
    }
  }

  square() {
    try {
      let num = eval(this.expression);
      this.#finalize(`(${num})²`, num * num);
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  inverse() {
    try {
      let num = eval(this.expression);
      if (num === 0) {
        this.outputEl.innerText = "Cannot divide by zero.";
        return;
      }
      this.#finalize(`1/(${num})`, 1 / num);
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  log() {
    try {
      let num = eval(this.expression);
      if (num <= 0) throw Error();
      this.#finalize(`log(${num})`, Math.log10(num));
    } catch {
      this.outputEl.innerText = "Math Error";
    }
  }

  ln() {
    try {
      let num = eval(this.expression);
      if (num <= 0) throw Error();
      this.#finalize(`ln(${num})`, Math.log(num));
    } catch {
      this.outputEl.innerText = "Math Error";
    }
  }

  fact() {
    try {
      let num = eval(this.expression);
      let result = factorial(num);
      if (result === null) throw Error();
      this.#finalize(`${num}!`, result);
    } catch {
      this.outputEl.innerText = "Math Error";
    }
  }

  tenPower() {
    try {
      let num = eval(this.expression);
      this.#finalize(`10^(${num})`, Math.pow(10, num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  twoPower() {
    try {
      let num = eval(this.expression);
      this.#finalize(`2^(${num})`, Math.pow(2, num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  exp() {
    try {
      let num = eval(this.expression);
      this.#finalize(`exp(${num})`, Math.exp(num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  abs() {
    try {
      let num = eval(this.expression);
      this.#finalize(`|${num}|`, Math.abs(num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  floor() {
    try {
      let num = eval(this.expression);
      this.#finalize(`floor(${num})`, Math.floor(num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  ceil() {
    try {
      let num = eval(this.expression);
      this.#finalize(`ceil(${num})`, Math.ceil(num));
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  rand() {
    this.#finalize("rand()", Math.random());
  }


  #finalize(displayExp, result) {
    this.inputEl.innerText = displayExp;
    this.outputEl.innerText = result;
    this.historyObj.add(displayExp, result);

    this.expression = result.toString();
    this.lastResult = result;
    this.justEvaluated = true;
    this.fromScientific = true;
  }

  toggleSign() {
    if (!this.expression) return;
    this.expression = this.expression.startsWith("-")
      ? this.expression.slice(1)
      : "-" + this.expression;
    this.outputEl.innerText = this.expression;
  }

  pow() {
    if (this.expression.endsWith("**")) return;
    this.expression += "**";
    this.outputEl.innerText = this.expression;
  }

  clearEntry() {
    this.expression = "";
    this.outputEl.innerText = "";
  }

  dms() {
    if (!this.expression) return;

    let deg = eval(this.expression);

    let d = Math.floor(deg);
    let minFloat = (deg - d) * 60;
    let m = Math.floor(minFloat);
    let s = Math.floor((minFloat - m) * 60);

    let result = `${d}° ${m}' ${s}"`;

    this.inputEl.innerText = deg + "°";
    this.outputEl.innerText = result;
  }

  deg() {
    try {
      let parts = this.expression.split(" ");

      let d = parseFloat(parts[0]) || 0;
      let m = parseFloat(parts[1]) || 0;
      let s = parseFloat(parts[2]) || 0;

      let result = d + (m / 60) + (s / 3600);

      this.outputEl.innerText = result;
      this.expression = result.toString();
    } catch {
      this.outputEl.innerText = "Error";
    }
  }

  mod() {
    if (!this.expression) return;
    this.expression += "%";
    this.outputEl.innerText = this.expression;
  }

  modX() {
    try {
      let num = eval(this.expression);
      let result = Math.abs(num);

      this.inputEl.innerText = "|" + num + "|";
      this.outputEl.innerText = result;
      this.expression = result.toString();
    } catch {
      this.outputEl.innerText = "Error";
    }
  }
}

Calculator.prototype.add = (a, b) => a + b;
Calculator.prototype.sub = (a, b) => a - b;
Calculator.prototype.mul = (a, b) => a * b;
Calculator.prototype.div = (a, b) => (b === 0 ? "Math Error" : a / b);