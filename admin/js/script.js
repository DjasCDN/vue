document.addEventListener('DOMContentLoaded', function() {

  // import {HTMLIFrameElement.prototype.load} from './iframe-load.js';
  // import {Editor} from './editor.js';

  //
  HTMLIFrameElement.prototype.load = function (url, callback) {
    const iframe = this;
    try {
        iframe.src = url + "?rnd=" + Math.random().toString().substring(2);
        // iframe.onload = () => {
        //   setTimeout(function(){
        //     console.log("Load");
        //     const str = JSON.stringify({ param: "htmlDelete", file_name_value: "temporary.html" });
        //     axios.post(requestURL, str)
        //       .then((response) => {
        //         console.log(response);
        //       })
        //       .catch((error) => {
        //         console.log(error);
        //       })
        //   }, 5000);
        // }

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
      let parser = new DOMParser();
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
        wrapper.contentEditable = "false";
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
  class EditorText {
    constructor(element, virtualElement) {
      this.element = element;
      this.virtualElement = virtualElement;

      this.element.addEventListener("click", () => this.onClick());
      if(this.element.parentNode.nodeName === "A" || this.element.parentNode.nodeName === "BUTTON") {
        this.element.addEventListener("contextmenu", (e) => this.onCtxMenu(e));

      }
      this.element.addEventListener("blur", () => this.onBlur());
      this.element.addEventListener("keypress", (e) => this.onKeypress(e));
      this.element.addEventListener("input", () => this.onTextEdit());
    }

    onClick() {
      // console.log("onClick");
      this.element.contentEditable = "true";
      this.element.focus();
    }

    onCtxMenu(e) {
      e.preventDefault();
      this.onClick();
    }

    onBlur() {
      this.element.contentEditable = "false";
    }

    onKeypress(e) {
      if(e.keyCode === 13) {
        this.element.blur();
      }
    }

    onTextEdit() {
      // console.log(element);
      this.virtualElement.innerHTML = this.element.innerHTML;
    }
  }

  //
  let requestURL = "api/index.php";

  //
  class Editor {
    constructor() {
      this.iframe = document.querySelector("#iframe");
    }

    open(page, cb) {
      this.currentPage = page;
      // console.log(page);
      axios
        .get("../" + page) // + "?v=" + Math.random()
        .then((res) => DOMHalper.parseStrToDom(res.data))
        .then(DOMHalper.wrapTextNodes)
        .then((dom) => {
          this.virtualDom = dom;
          return dom;
        })
        .then(DOMHalper.serializeDomStr)
        .then((html) => {
          const str = JSON.stringify({ param: "saveTemPage", html: html });
          axios.post(requestURL, str)
            .then((response) => {
              console.log(response);
              // this.iframe.src = "../temporary.html";
              this.iframe.load("../temporary.html");
              // this.enableEditing();
              // this.injectStyles();
            })
            .catch((error) => {
              console.log(error);
            })
        })
        // .then(() => this.iframe.src = "../temporary.html")
        // .then(() => this.iframe.load("../temporary.html"))
        .then(() => this.iframe.onload = () => {
          // console.log("Load");
          const str = JSON.stringify({ param: "htmlDelete", file_name_value: "temporary.html" });
          axios.post(requestURL, str)
            .then((response) => {
              console.log(response);
            })
            .catch((error) => {
              console.log(error);
            })
          this.enableEditing();
          this.injectStyles();
        })
        // .then(() => this.iframe.onload = setTimeout(() => {
        //   this.enableEditing();
        // }, 1000))
        // .then(() => this.iframe.onload = () => {
        //   this.injectStyles();
        // })
        .then(cb)
    }

    enableEditing() {
      this.iframe.contentDocument.body.querySelectorAll("text-editor").forEach((element) => {
        let id = element.getAttribute("nodeid");
        let virtualElement = this.virtualDom.body.querySelector(`[nodeid="${id}"]`);
        new EditorText(element, virtualElement);
      })
    }

    injectStyles() {
      let style = this.iframe.contentDocument.createElement("style");
      style.innerHTML = `
        text-editor:hover {
          outline: 3px solid orange;
          outline-offset: 8px;
        }
        text-editor:focus {
          outline: 3px solid red;
          outline-offset: 8px;
        }
      `;
      this.iframe.contentDocument.head.appendChild(style);
    }

    save(onSucces, onError) {
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
        // .then((response) => {
        //   console.log(response);
        // })
        .then(onSucces)
        // .catch((error) => {
        //   console.log(error);
        // })
        .catch(onError)

    }
  }

  //
  window.editor = new Editor();
  // // window.addEventListener("load", function() {
  // //   window.editor.open("index.html");
  // // });
  // window.onload = window.editor.open("index.html");




  new Vue({
    el: "#app",
    data: {
      page: "index.html",
      showLoader: true,
      pageList: null,
      backupList: null
    },
    methods: {
      onBtnSave() {
        // console.log("Click");
        this.showLoader = true;
        window.editor.save(
          () => {
            this.showLoader = false;
            UIkit.notification({message: 'Успешно сохранено!', status: 'success'});
            this.loadBackupList();
          },
          () => {
            this.showLoader = false;
            UIkit.notification({message: 'Ошибка сохранения', status: 'danger'});
          }
        );
      },
      openPage(page) {
        this.showLoader = true;
        window.editor.open(page, () => {
          this.showLoader = false;
        });
        this.page = page;
        this.loadBackupList();
      },
      loadBackupList() {
        axios.get("./backup/backup.json")
          .then((response) => {
            this.backupList = response.data.filter((backup) => {
              return (backup.page === this.page);
            })
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          })
      },
      restoreBackup(backup) {
        UIkit.modal
          .confirm(
            "Восстановить из резервной копии?",
            { labels: { ok: "Восстановить", cancel: "Отмена" } }
          )
          .then(() => {
            const str = JSON.stringify({ param: "backup", page: this.page, file: backup.file });
            axios.post(requestURL, str)
              .then((response) => {
                console.log(response);
                window.editor.open(this.page, () => {
                  this.showLoader = false;
                });
              })
              .catch((error) => {
                console.log(error);
              });
        })
      }
    },
    created() {
      window.editor.open(this.page, () => {
        this.showLoader = false;
      });

      const str = JSON.stringify({ param: "htmlFilesName" });
      axios.post(requestURL, str)
        .then((response) => {
          this.pageList = response.data;
          // console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
      this.loadBackupList();
    }
  })




























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
