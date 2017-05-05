var FOLDERID;
var FILEID;
var idFolderMask   = 'folder-';
var idCheckboxMask = 'checkbox-';
var idFileMask     = 'file-';

showItems();
removeItem();
renameItem();
addInternal();

if (document.getElementsByClassName('folder').length < 1) {
  FOLDERID = 1;
} else {
  FOLDERID = document.getElementsByClassName('folder').length + 1
}

if (document.getElementsByClassName('file').length < 1) {
  FILEID = 1;
} else {
  FILEID = document.getElementsByClassName('file').length + 1
}

create_folder.addEventListener('click', function() {
  var nameFolder = prompt('Введіть назву папки', '');

  if (nameFolder) {
    var folder = document.createElement('li');
    var folderPlace = document.createElement('ul');
    var ids = idFolderMask + FOLDERID;
    FOLDERID++;

    folder.className = 'folder';
    folder.id = ids;

    folder.innerHTML = buttonsItem(nameFolder, true);

    var checkbox = createCheckboxForFolder(ids);

    document.getElementById('file-manager').appendChild(folder);
    document.getElementById(ids).insertBefore(checkbox, document.getElementById(ids).childNodes[0]);
    document.getElementById(ids).appendChild(folderPlace);

    var folderJSON = { 'name': nameFolder, 'parent': null };

    localStorage.setItem(ids, JSON.stringify(folderJSON));
  } else {
    alert('Не можна зробити папку без імені');
  }
});

create_file.addEventListener('click', function() {
  var nameFile = prompt('Введіть назву файла', '');
  if (nameFile.length > 0) {
    var ids = document.getElementsByClassName('file');
    var file = document.createElement('li');

    ids = idFileMask + FILEID;
    FILEID++;

    file.className = 'file';
    file.id = ids;
    file.innerHTML = buttonsItem(nameFile, false);

    document.getElementById('file-manager').appendChild(file);

    var fileJSON = { 'name': nameFile, 'parent': null };
    localStorage.setItem(ids, JSON.stringify(fileJSON));
  } else {
    alert('Не можна зробити папку без імені');
  }
});

function removeItem() {
  document.addEventListener('click', function(e) {
    if (hasClass(e.target, 'glyphicon-remove')) {
      e.preventDefault();
      if (confirm('Ви впевнені що бажаєте видалити  даний об\'єкт?')) {
        var currentItemId = e.target.parentElement.parentElement.id;
        var childItemsNeedDelete = document.getElementById(currentItemId).getElementsByTagName('li');

        document.getElementById(currentItemId).parentNode.removeChild(document.getElementById(currentItemId));

        for (var _i = 0; _i < childItemsNeedDelete.length; _i++) {
          localStorage.removeItem(childItemsNeedDelete[_i].id);
        };
        localStorage.removeItem(currentItemId);
      };
    };
  });
};

function renameItem () {
  document.addEventListener('click', function(e) {
    if (hasClass(e.target, 'glyphicon-pencil')) {
      e.preventDefault();
      var newName = prompt('Введіть нову назву', '');

      if (newName.length > 0) {
        var currentItemId = e.target.parentNode.parentNode.id;
        var currentItemName = (currentItemId.indexOf('folder') != -1) ? e.target.parentNode.parentNode.childNodes[1] : e.target.parentNode.parentNode.childNodes[0];
        var currentItemJSON = JSON.parse(localStorage[currentItemId]);

        currentItemJSON['name'] = newName;
        localStorage[currentItemId] = JSON.stringify(currentItemJSON);
        currentItemName.innerHTML = ' '+newName;
      } else {
        alert('Обов\'язково повинна бути назва');
      }
    };
  });
};

function addInternal() {
  document.addEventListener('click', function(e) {
    if ((hasClass(e.target, 'internal-folder')) || (hasClass(e.target, 'internal-file'))) {
      e.preventDefault();
      var isFolder = hasClass(e.target, 'internal-folder');
      var parentFolder = e.target.parentElement.parentElement.id;
      var nameItem = prompt('Введіть назву папки', '');

      if (nameItem) {
        var item = document.createElement('li');
        var container = e.target.parentElement.parentElement.lastElementChild;
        var ids;

        if (isFolder) {
          var folderPlace = document.createElement('ul');
          ids = idFolderMask + FOLDERID;
          FOLDERID++;
          var checkbox = createCheckboxForFolder(ids);
        } else {
          ids = idFileMask + FILEID;
          FILEID++;
        }

        item.id = ids;
        item.innerHTML = buttonsItem(nameItem, isFolder);
        item.className = (isFolder) ? 'folder' : 'file';
        container.appendChild(item);

        if (isFolder) {
          document.getElementById(ids).insertBefore(checkbox, document.getElementById(ids).childNodes[0]);
          document.getElementById(ids).appendChild(folderPlace);
        }

        var folderJSON = { 'name': nameItem, 'parent': parentFolder };
        localStorage.setItem(ids, JSON.stringify(folderJSON));
      } else {
        alert ('Обов\'яково вказати ім\'я і підтвердити');
      }
    };
  });
}

function showItems() {
  if (localStorage.length > 0) {
    var arrFolder = [];
    var arrFile = [];

    for (_key in localStorage) {
      if (_key.indexOf('folder') != -1) arrFolder.push(+(_key.slice(7)));
      else if (_key.indexOf('file') != -1) arrFile.push(+(_key.slice(5)));
    }

    arrFolder = arrFolder.sort(sortNumber);
    arrFile = arrFile.sort(sortNumber);

    draftingItems(arrFolder, true);
    draftingItems(arrFile, false);
  };
};

function draftingItems(arr, isFolder) {
  for (var i = 0; i < arr.length; i++) {
    var storageKey = ((isFolder) ? idFolderMask : idFileMask) + arr[i];
    var item = document.createElement('li');
    var itemIcon = (isFolder) ? 'glyphicon-folder-open' : 'glyphicon-file';
    var itemName = JSON.parse(localStorage[storageKey])['name'];
    var container;

    if (JSON.parse(localStorage[storageKey])['parent']) {
      container = document.getElementById(JSON.parse(localStorage[storageKey])['parent']).lastElementChild;
    } else {
      container = document.getElementById('file-manager');
    }

    item.className = (isFolder) ? 'folder' : 'file';
    item.id = storageKey;
    item.innerHTML = buttonsItem(itemName, isFolder);
    container.appendChild(item);

    if (isFolder) {
      var folderPlace = document.createElement('ul');
      var checkbox = createCheckboxForFolder(storageKey);

      document.getElementById(item.id).insertBefore(checkbox, document.getElementById(item.id).childNodes[0]);
      document.getElementById(item.id).appendChild(folderPlace);
    };
  };
};

function sortNumber(a,b) { return a - b; };

function hasClass(elem, className) { return elem.className.split(' ').indexOf(className) > -1; };

function buttonsItem(itemName, isFolder) {
  var itemIcon = (isFolder) ? 'glyphicon-folder-open' : 'glyphicon-file';
  var itemBtns = '<span class="glyphicon ' + itemIcon + '"> ' + itemName + '</span>\
    <a href="#"><span class="glyphicon glyphicon-remove"></span></a>\
    <a href="#"><span class="glyphicon glyphicon-pencil"></span></a>';
  var itemBtnsForFolder = '<a href="#"><span class="glyphicon glyphicon-folder-open internal-folder"></span></a>\
    <a href="#"><span class="glyphicon glyphicon-file internal-file"></span></a>';
  
  return (isFolder) ? (itemBtns + itemBtnsForFolder) : itemBtns;
};

function createCheckboxForFolder(storageKey) {
  var checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.name = idCheckboxMask + storageKey;
  checkbox.value = 'value';
  checkbox.id = idCheckboxMask + storageKey;
  return checkbox;
};
