export class Editor {
  constructor() {
    this.iframe = document.querySelector("#iframe");
  }
  open(page) {
    this.iframe.src = "../" + page;
  }
}
