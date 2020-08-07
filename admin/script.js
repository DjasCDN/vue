document.addEventListener('DOMContentLoaded', function() {
  // XHR
  function sendRequest(method, url, body = null) {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();
      xhr.open(method, url);
      xhr.responseType = "json";
      xhr.setRequestHeader("Cotent-Type", "application/json");
      // xhr.responseType = "text";
      // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      xhr.onload = () => {
        if (xhr.status >= 400) {
          reject(xhr.response);
        } else {
          resolve(xhr.response);
        }
      }
      xhr.onerror = () => {
        reject(xhr.response);
      }
      xhr.send(JSON.stringify(body));
      // xhr.send(body);
    })
  }

  let requestURL = "api/index.php";

  // добавить фаил
  document.querySelector("#form_new_file_submit").addEventListener("click", function(e){
    e.preventDefault();
    let file_name_input = document.querySelector("#new_file").value;
    if(file_name_input !== ""){
      let body = {
        param: "htmlCreate",
        file_name_value: file_name_input
      }
      sendRequest("POST", requestURL, body)
        .then(data => {
          // console.log(data);
          document.querySelector("#new_file_message").innerHTML = data;
          fileListGet();
          document.querySelector("#form_new_file").reset();
        })
        .catch(err => {
          // console.log(err);
          document.querySelector("#new_file_message").innerHTML = err;
          document.querySelector("#form_new_file").reset();
        })
    } else {
      document.querySelector("#new_file_message").innerHTML = "Введите имя файла";
    }
  });

  // удалить фаил
  document.querySelector("#form_delete_file_submit").addEventListener("click", function(e){
    e.preventDefault();
    let file_name_input = document.querySelector("#delete_file").value;
    if(file_name_input !== "") {
      let body = {
        param: "htmlDelete",
        file_name_value: file_name_input
      }
      sendRequest("POST", requestURL, body)
        .then(data => {
          // console.log(data);
          document.querySelector("#delete_file_message").innerHTML = data;
          fileListGet();
          document.querySelector("#form_delete_file").reset();
        })
        .catch(err => {
          // console.log(err);
          document.querySelector("#delete_file_message").innerHTML = err;
          document.querySelector("#form_delete_file").reset()
        })
    } else {
      document.querySelector("#delete_file_message").innerHTML = "Введите имя файла";

    }
  });


  //  получить список файлов
  document.querySelector("#file_list_get").addEventListener("click", function(e){
    e.preventDefault();
    fileListGet();
  });

  function fileListGet() {
    document.querySelector("#file_list").innerHTML = "";
    let body = {
      param: "htmlFilesName"
    }
    sendRequest("POST", requestURL, body)
      .then(data => {
        // console.log(data);
        data.forEach((file_name) => {
          let li = document.createElement('li');
          li.innerHTML = file_name;
          document.querySelector("#file_list").append(li);
          li = null;
        });
      })
      .catch(err => console.log(err))
  }













}, false);
