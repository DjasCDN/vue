<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>admin</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.5.5/css/uikit.min.css" />
  <link rel="stylesheet" href="style.css">
</head>
<body>

<div id="app">
  <div class="panel">
    <button class="uk-button uk-button-primary" type="button" uk-toggle="target: #modal-save">Опубликовать</button>
  </div>
  <!-- This is the modal -->
  <div id="modal-save" uk-modal>
      <div class="uk-modal-dialog uk-modal-body">
          <h2 class="uk-modal-title">Сохранение</h2>
          <p>Сохранить и опубликовать изменения?</p>
          <p class="uk-text-right">
              <button class="uk-button uk-button-default uk-modal-close" type="button">Отмена</button>
              <button class="uk-button uk-button-primary uk-modal-close" type="button" @click="onBtnSave">Сохранить</button>
          </p>
      </div>
  </div>

  <div class="loader" v-bind:class="{ 'active' : showLoader }">
    <span uk-spinner="ratio: 4.5"></span>
  </div>
</div>


<iframe src="" frameborder="0" id="iframe" class="iframe"></iframe>



<!-- <div id="app">
  <h2>Создать фаил</h2>
  <p id="new_file_message">
    {{ new_file_message }}
  </p>
  <div id="form_new_file">
    <input type="text" id="new_file" placeholder="Введите имя файла" v-model="new_file">
    <button id="form_new_file_submit" v-on:click="form_new_file_submit">Создать</button>
  </div>

  <h2>Удалить фаил</h2>
  <p id="delete_file_message">
    {{ delete_file_message }}
  </p>
  <div id="form_delete_file">
    <input type="text" id="delete_file" placeholder="Введите имя файла" v-model="delete_file">
    <button id="form_delete_file_submit" v-on:click="form_delete_file_submit">Удалить</button>
  </div>

  <h2>Список файлов</h2>
  <p id="list_file_message">
    {{ list_file_message }}
  </p>
    <ol id="file_list">
      <li v-for="(page, index) in pageList" >
        {{ page }} - index="{{ index }}" <a href="#" v-on:click="list_delete_file_message(page)">(X)</a>
      </li>
    </ol>
  <button id="file_list_get" v-on:click="file_list_get">Получить список файлов</button>
</div> -->





  <script src="https://code.jquery.com/jquery-3.5.1.min.js" integrity="sha256-9/aliU8dGd2tb6OSsuzixeV4y/faTqgFtohetphbbj0=" crossorigin="anonymous"></script>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/uikit/3.5.5/js/uikit.min.js"></script>

  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>

  <script src="js/script.js?v=<?= rand(0, 111111); ?>"></script>
</body>
</html>
