(function(){
    // START: CODE
  function initApp() {
    const navToggle = document.getElementById('navToggle');
    const appNav = document.getElementById('appNav');
    const dataContainer = document.getElementById('pageContent');
    const storage = window.sessionStorage;
    let currentView;

    // Fetch content
    function fetchData(url, callback, params) {
      const dataInStorage = storage.getItem(currentView);

      if (dataInStorage) {
        callback(JSON.parse(dataInStorage), params);

      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
        xhr.withCredentials = false;
        xhr.send();
        xhr.onload = function() {
          if (xhr.status != 200) { // HTTP-errors
            console.error(`Error ${xhr.status}: ${xhr.statusText}`);

          } else {
            const res = xhr.response;
            callback(res, params);
            storage.setItem(currentView, JSON.stringify(res));
          }
        };
        xhr.onerror = function() { // non-HTTP error e.g. connection error
          console.error('Error on transactions');
        };
      }
    }

    // Remove selected class from currently selected checkbox
    function clearSelection() {
      const selectedCheckbox = document.querySelector('#pageContent .checkbox.selected');
      selectedCheckbox && selectedCheckbox.classList.remove('selected');
    }

    // Add new entry
    function addUser() {
      const nameInput = document.getElementById('userName');
      const codeInput = document.getElementById('userCode');
      let alertMessage;
      const nameInvalid = nameInput.value === '';
      const codeInvalid = codeInput.value === '';
      const fieldInvalid = nameInvalid || codeInvalid;
      const fieldsInvalid = nameInvalid && codeInvalid;

      alertMessage = fieldsInvalid ? 'All fields are required' : nameInvalid ? 'NAME is required' : fieldInvalid ? 'CODE is required' : '';

      if (fieldInvalid) {
        alert(alertMessage);
      } else {
        // TODO add record
      }
    }

    // Create new user
    function createNewUser() {
      const h1Elem = document.querySelector('h1');
      const h1Parent = h1Elem.parentNode;
      const buttonCreate = h1Parent.querySelector('button[data-action="main"]');
      const buttonBack = h1Parent.querySelector('button[data-action="back"]');

      let htmlString = '<div class="form-group required">\n' +
        ' <label for="userName">NAME</label>\n' +
        ' <input id="userName" type="text" required />\n' +
        '</div>\n' +
        '<div class="form-group required">\n' +
        ' <label for="userCode">CODE</label>\n' +
        ' <input id="userCode" type="text" required />\n' +
        '</div>';

      // Update view header // TODO
      h1Elem.innerHTML = 'Add new user';

      // Add elements to DOM
      dataContainer.innerHTML = htmlString;

      // Update view's buttons
      buttonCreate.textContent = 'Create';
      buttonCreate.removeEventListener('click', createNewUser);
      buttonCreate.addEventListener('click', addUser, true);

      buttonBack.removeAttribute('hidden');
      buttonBack.removeAttribute('disabled');

      buttonBack.addEventListener('click', function _clickHandler() {
        document.querySelector('a[href="#users"]').click();
        buttonCreate.removeEventListener('click', addUser, true);
        buttonBack.setAttribute('hidden', 'hidden');
        buttonBack.setAttribute('disabled', 'disabled');
        buttonBack.removeEventListener('click', _clickHandler, true);
      }, true);
    }

    // Remove selected entry
    function removeEntry() {
      const selectedCheckbox = document.querySelector('#pageContent .checkbox.selected');
      const parentRow = selectedCheckbox && selectedCheckbox.closest("tr");

      if (parentRow && window.confirm("Do you really want to delete this entry?")) {
        // Remove entry from data & storage
        let storageData = JSON.parse(sessionStorage.getItem(currentView));

        if (storageData) {
          storageData = storageData.filter(item => {
            return item.code !== selectedCheckbox.dataset['code'];
          });
        }

        parentRow.remove();
        storage.setItem(currentView, JSON.stringify(storageData));
      }
    }

    function dataClickHandler(e) {
      const _t = e.target;
      if(!_t || _t.tagName !== 'SPAN') return;

      // remove selected class from previous selected checkbox
      clearSelection();

      // add selected class to last selected checkbox
      _t.classList.contains('selected')
        ? _t.classList.remove('selected')
        : _t.classList.add('selected');
    }

    function createTabularData(data, actionEnabled) {
      const keys = Object.keys(data[0]);
      const tableWrapper = document.createElement('div');
      let headers = actionEnabled ? '<tr><th></th>': '<tr>';
      let rowsHtml = '';

      // Create table headers
      keys.map(key => {
        headers += `<th>${key.toUpperCase()}</th>`;
      });
      headers += '</tr>';

      // Create rows and cells
      data.map(item => {
        rowsHtml += '<tr>';
        if(actionEnabled) {
          rowsHtml += `<td width="50"><span class="checkbox" data-code=${item['code']}></span></td>`;
        }

        for (const property in item) {
          rowsHtml += `<td>${item[property]}</td>`;
        }
        rowsHtml += ('</tr>')
      });

      tableWrapper.classList.add('table-responsive');
      tableWrapper.innerHTML = `<table>${headers} ${rowsHtml}</table>`;
      dataContainer.innerHTML = '';
      dataContainer.appendChild(tableWrapper);

      // window.setTimeout(()=> {
      dataContainer.classList.remove('loader-bar');
      // }, 2000);
    }

    // Set toolbar actions
    function setToolbarActions(action) {
      const button = document.querySelector('button[data-action="main"]');
      let buttonText = '';

      if (button && action) {
        button.removeAttribute('disabled');
        button.removeAttribute('hidden');

        switch (action) {
          case 'add':
            buttonText = "Add new";
            button.addEventListener('click', createNewUser);
            break;
          case 'delete':
            buttonText = "Delete";
            button.addEventListener('click', removeEntry)
            break;
          default: return false;
        }

        button.textContent = buttonText;
        dataContainer.addEventListener('click', dataClickHandler);

      } else {
        button.setAttribute('disabled', 'disabled');
        button.setAttribute('hidden', 'hidden');
        button.textContent = "";
        dataContainer.removeEventListener('click', dataClickHandler);
      }
    }

    appNav.addEventListener('click', function(e) {
      try {
        const target = e.target;
        const fetchUrl = e.target.dataset['url'];
        const action = e.target.dataset['action'];

        currentView = target.href && target.href.split('#')[1];

        if (!target.href || !currentView) return;

        dataContainer.classList.add('loader-bar');
        fetchUrl && fetchData(fetchUrl, createTabularData, !!action);

        document.querySelector('h1').innerHTML = target.innerText;
        setToolbarActions(action);

        // Hide nav
        window.innerWidth < 992 && navToggle.click();

      } catch(error) {
        console.error(error);
      }
    }, true);

    //region Mobile navigation
    function toggleNavigation(e) {
      e.preventDefault();
      e.stopPropagation();
      const parentElem = e.currentTarget.parentNode;
      parentElem && parentElem.classList.toggle('nav-open')
    }

    window.innerWidth < 992
      ? navToggle.addEventListener('click', toggleNavigation, false)
      : navToggle.removeEventListener('click', toggleNavigation, false);
    //endregion

  }

  // Alternative to DOMContentLoaded event
  document.addEventListener('readystatechange', e => {
    if (e.target.readyState === 'interactive') {
      document.body.classList.add('loading');
    }
    else if (e.target.readyState === 'complete') {
      initApp();
      document.body.removeAttribute('class');
    }
  });

    // END: CODE
}());
