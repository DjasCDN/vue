document.addEventListener('DOMContentLoaded', function() {

  // import {HTMLIFrameElement.prototype.load} from './iframe-load.js';
  // import {Editor} from './editor.js';

  //
  HTMLIFrameElement.prototype.load = function (url, callback) {
      const iframe = this;
      try {
          iframe.src = url + "?rnd=" + Math.random().toString().substring(2);
      } catch (error) {
          if (!callback) {
              return new Promise((resolve, reject) => {
                  reject(error);
              })
          } else {
              callback(error);
          }
      }

      const maxTime = 60000;
      const interval = 200;

      let timerCount = 0;

      if (!callback) {
          return new Promise((resolve, reject) => {
              const timer = setInterval(function () {
                  if (!iframe) return clearInterval(timer);
                  timerCount++;
                  if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
                      clearInterval(timer);
                      resolve();
                  } else if (timerCount * interval > maxTime) {
                      reject(new Error("Iframe load fail!"));
                  }
              }, interval);
          })
      } else {
          const timer = setInterval(function () {
              if (!iframe) return clearInterval(timer);
              if (iframe.contentDocument && iframe.contentDocument.readyState === "complete") {
                  clearInterval(timer);
                  callback();
              } else if (timerCount * interval > maxTime) {
                  callback(new Error("Iframe load fail!"));
              }
          }, interval);
      }
  };







  //
  class DOMHalper {
    static parseStrToDom(str) {
      let  parser = new DOMParser();
      // return parser.parseFromString(str, "application/xml");
      return parser.parseFromString(str, "text/html");
    }

    static serializeDomStr(dom) {
      let serializer = new XMLSerializer();
      // console.log(serializer.serializeToString(dom));
      return serializer.serializeToString(dom);
    }

    static wrapTextNodes(dom) {
      // console.log(dom);
      let body = dom.body;
      // console.log(body);
      let textNodes = [];

      function recursy(element) {
        element.childNodes.forEach((node) => {
          // console.log(node);
          if(node.nodeName === "#text" && node.nodeValue.replace(/\s+/g, "").length > 0) {
            // console.log(node);
            textNodes.push(node);
          } else {
            // if(node.nextElementSibling !== null) {
            //   if(node.nextElementSibling.nodeName !== "SCRIPT") {
            //     // console.log(node);
            //     // recursy(node);
            //   }
            // }
            // console.log(node);
            recursy(node);
          }
        });
      }
      recursy(body);

      textNodes.forEach((node, i) => {
        const wrapper = dom.createElement("text-editor");
        node.parentNode.replaceChild(wrapper, node);
        wrapper.appendChild(node);
        wrapper.contentEditable = "true";
        wrapper.setAttribute("nodeid", i);
      });

      // console.log(dom);

      return dom;
    }

    static unwrapTextNodes(dom) {
      dom.body.querySelectorAll("text-editor").forEach((element) => {
        element.parentNode.replaceChild(element.firstChild, element);
      })
    }
  }

  //
  let requestURL = "api/index.php";

  //
  class Editor {
    constructor() {
      this.iframe = document.querySelector("#iframe");
    }

    open(page) {
      this.currentPage = page;

      axios
        .get("../" + page)
        .then((res) => DOMHalper.parseStrToDom(res.data))
        .then(DOMHalper.wrapTextNodes)
        .then((dom) => {
          this.virtualDom = dom;
          return dom;
        })
        .then(DOMHalper.serializeDomStr)
        .then((html) => {
          let body = {
              param: "saveTemPage",
              html: html
            };
          const str = JSON.stringify(body);
          axios.post(requestURL, str)
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            })
        })
        .then(() => this.iframe.load("../temp.html"))
        .then(() => this.enableEditing())
    }



    enableEditing() {
      this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach((element) => {
        element.contentEditable = "true";
        element.addEventListener("input", () => {
          // console.log(this);
          this.onTextEdit(element);
        });
      })
    }

    onTextEdit(element) {
      // console.log(element);
      let id = element.getAttribute("nodeid");
      // console.log(id);
      this.virtualDom.body.querySelector(`[nodeid="${id}"]`).innerHTML = element.innerHTML;
    }

    save() {
      let newDom = this.virtualDom.cloneNode(this.virtualDom);
      DOMHalper.unwrapTextNodes(newDom);
      let html = DOMHalper.serializeDomStr(newDom);
      // console.log(html);
      let body = {
          param: "savePage",
          pageName: this.currentPage,
          html: html
        };
      const str = JSON.stringify(body);
      axios.post(requestURL, str)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        })
    }
  }




  //
  window.editor = new Editor();
  // window.addEventListener("load", function() {
  //   window.editor.open("index.html");
  // });
  window.onload = window.editor.open("index.html");




























  // // XHR
  // function sendRequest(method, url, body = null) {
  //   return new Promise((resolve, reject) => {
  //     let xhr = new XMLHttpRequest();
  //     xhr.open(method, url);
  //     xhr.responseType = "json";
  //     xhr.setRequestHeader("Cotent-Type", "application/json");
  //     // xhr.responseType = "text";
  //     // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  //     xhr.onload = () => {
  //       if (xhr.status >= 400) {
  //         reject(xhr.response);
  //       } else {
  //         resolve(xhr.response);
  //       }
  //     }
  //     xhr.onerror = () => {
  //       reject(xhr.response);
  //     }
  //     xhr.send(JSON.stringify(body));
  //     // xhr.send(body);
  //   })
  // }
  //
  // let requestURL = "api/index.php";
  //
  // // добавить фаил
  // document.querySelector("#form_new_file_submit").addEventListener("click", function(e){
  //   e.preventDefault();
  //   let file_name_input = document.querySelector("#new_file").value;
  //   if(file_name_input !== ""){
  //     let body = {
  //       param: "htmlCreate",
  //       file_name_value: file_name_input
  //     }
  //     sendRequest("POST", requestURL, body)
  //       .then(data => {
  //         // console.log(data);
  //         document.querySelector("#new_file_message").innerHTML = data;
  //         fileListGet();
  //         document.querySelector("#form_new_file").reset();
  //       })
  //       .catch(err => {
  //         // console.log(err);
  //         document.querySelector("#new_file_message").innerHTML = err;
  //         document.querySelector("#form_new_file").reset();
  //       })
  //   } else {
  //     document.querySelector("#new_file_message").innerHTML = "Введите имя файла";
  //   }
  // });
  //
  // // удалить фаил
  // document.querySelector("#form_delete_file_submit").addEventListener("click", function(e){
  //   e.preventDefault();
  //   let file_name_input = document.querySelector("#delete_file").value;
  //   if(file_name_input !== "") {
  //     let body = {
  //       param: "htmlDelete",
  //       file_name_value: file_name_input
  //     }
  //     sendRequest("POST", requestURL, body)
  //       .then(data => {
  //         // console.log(data);
  //         document.querySelector("#delete_file_message").innerHTML = data;
  //         fileListGet();
  //         document.querySelector("#form_delete_file").reset();
  //       })
  //       .catch(err => {
  //         // console.log(err);
  //         document.querySelector("#delete_file_message").innerHTML = err;
  //         document.querySelector("#form_delete_file").reset()
  //       })
  //   } else {
  //     document.querySelector("#delete_file_message").innerHTML = "Введите имя файла";
  //
  //   }
  // });
  //
  //
  // //  получить список файлов
  // document.querySelector("#file_list_get").addEventListener("click", function(e){
  //   e.preventDefault();
  //   fileListGet();
  // });
  //
  // function fileListGet() {
  //   document.querySelector("#file_list").innerHTML = "";
  //   let body = {
  //     param: "htmlFilesName"
  //   }
  //   sendRequest("POST", requestURL, body)
  //     .then(data => {
  //       // console.log(data);
  //       data.forEach((file_name) => {
  //         let li = document.createElement('li');
  //         li.innerHTML = file_name;
  //         document.querySelector("#file_list").append(li);
  //         li = null;
  //       });
  //     })
  //     .catch(err => console.log(err))
  // }














  // let requestURL = "api/index.php";
  //
  // new Vue({
  //   el: "#app",
  //   data: {
  //     "pageList": null,
  //     "new_file": null,
  //     "new_file_message": null,
  //     "delete_file": null,
  //     "delete_file_message": null,
  //     "list_file_message": null
  //   },
  //   methods: {
  //     form_new_file_submit() {
  //       if(this.new_file !== null) {
  //         let body = {
  //             param: "htmlCreate",
  //             file_name_value: this.new_file
  //           };
  //         const str = JSON.stringify(body);
  //         axios.post(requestURL, str)
  //           .then((response) => {
  //             console.log(response);
  //             this.new_file_message = response.data;
  //             this.file_list_get();
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //           })
  //       } else {
  //         this.new_file_message = "Введите имя файла";
  //       }
  //
  //     },
  //     form_delete_file_submit() {
  //       if(this.delete_file !== null) {
  //         let body = {
  //             param: "htmlDelete",
  //             file_name_value: this.delete_file + ".html"
  //           };
  //         const str = JSON.stringify(body);
  //         axios.post(requestURL, str)
  //           .then((response) => {
  //             console.log(response);
  //             this.delete_file_message = response.data;
  //             this.file_list_get();
  //           })
  //           .catch((error) => {
  //             console.log(error);
  //           })
  //       } else {
  //         this.delete_file_message = "Введите имя файла";
  //       }
  //
  //     },
  //     list_delete_file_message(page) {
  //       // console.log(page);
  //       let body = {
  //           param: "htmlDelete",
  //           file_name_value: page
  //         };
  //       const str = JSON.stringify(body);
  //       axios.post(requestURL, str)
  //         .then((response) => {
  //           console.log(response);
  //           this.list_file_message = response.data;
  //           this.file_list_get();
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //         })
  //     },
  //     file_list_get() {
  //       let body = { param: "htmlFilesName" }
  //       const str = JSON.stringify(body);
  //       axios.post(requestURL, str)
  //         .then((response) => {
  //           this.pageList = response.data;
  //           console.log(response);
  //         })
  //         .catch((error) => {
  //           console.log(error);
  //         })
  //     }
  //   }
  // })



}, false);
