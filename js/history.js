export function createHistory() {
  let history = JSON.parse(localStorage.getItem("calcHistory")) || [];

  function save() {
    localStorage.setItem("calcHistory", JSON.stringify(history));
  }

  return {
    add(input, output) {
      history.unshift({ input, output });
      save();
    },

    getAll() {
      return history;
    },

    clear() {
      history = [];
      save();
    }
  };
}