<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="ie=edge">
  <title>admin</title>

  <link rel="stylesheet" href="style.css">
</head>
<body>


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







  <script src="https://cdn.jsdelivr.net/npm/vue/dist/vue.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
  <!-- <script src="editor.js"></script> -->
  <script src="js/script.js?v=<?= rand(0, 111111); ?>"></script>
</body>
</html>