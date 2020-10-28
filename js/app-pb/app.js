(function() {
    // START: CODE
  function initApp() {
    const navToggle = document.getElementById('navToggle');
    const appNav = document.getElementById('appNav');
    const toolbar = document.getElementById('toolbar');
    const dataContainer = document.getElementById('pageContent');
    const storage = window.sessionStorage;
    let currentView;

    // Reset app state
    document.querySelector('a[href="#home"]').addEventListener('click', e => {
      e.preventDefault();
      document.querySelector('h1').innerText = 'Welcome';
      dataContainer.innerHTML = '';
      toolbar.innerHTML = '';
    });

    // Fetch content
    function fetchData(url, callback) {
      const dataInStorage = storage.getItem(currentView);

      if (dataInStorage) {
        callback(JSON.parse(dataInStorage));

      } else {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.responseType = 'json';
        xhr.withCredentials = false;
        xhr.send();
        xhr.onload = function() {
          if (xhr.status !== 200) { // HTTP-errors
            console.error(`Error ${xhr.status}: ${xhr.statusText}`);

          } else {
            const res = xhr.response;
            callback(res.data);
            storage.setItem(currentView, JSON.stringify(res.data));
          }
        };
        xhr.onerror = function() { // non-HTTP error e.g. connection error
          console.error('Error on transactions');
        };
      }
    }

    // Remove selected class from currently selected checkbox
    function clearSelection() {
      const selectedCheckbox = dataContainer.querySelector('.checkbox.selected');
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

      alertMessage = fieldsInvalid ? 'All fields are required' : nameInvalid ? 'NAME is required' : codeInvalid ? 'CODE is required' : '';

      if (fieldInvalid) {
        alert(alertMessage);
      } else {
        // TODO add record
      }
    }

    // Create new user
    function createNewUser() {
      setViewHeader('Add new user', 'create');

      const buttonCreate = toolbar.querySelector('button');
      const buttonBackTemplate = document.getElementById('templateButton_back');
      const buttonBackClone = buttonBackTemplate && buttonBackTemplate.content.cloneNode(true);
      const toolbarParentNode = toolbar.parentNode;
      const formTemplate = document.getElementById('templateCreateUserForm');
      const formClone = formTemplate && formTemplate.content.cloneNode(true);

      dataContainer.innerHTML = '';

      // Set toolbar buttons
      buttonBackTemplate && toolbarParentNode.insertBefore(buttonBackClone, toolbar.nextSibling);//&& toolbar.appendChild(buttonBackClone);
      const buttonBack = toolbarParentNode.querySelector('button[data-action="back"]');

      // Set view content
      if (formTemplate) {
        dataContainer.appendChild(formClone);

      } else {
        dataContainer.innerText = 'Form data could not be initialized.';
      }
      // Add events
      buttonBack.addEventListener('click', () => {
        const usersLink = document.querySelector('a[data-view="users"]');
        buttonBack.remove();
        usersLink && usersLink.click();
      });

      buttonCreate.addEventListener('click', addUser, true);
    }

    // Remove selected entry
    function removeEntry() {
      const selectedCheckbox = dataContainer.querySelector('.checkbox.selected');
      const parentRow = selectedCheckbox && selectedCheckbox.closest("tr");

      if (parentRow && window.confirm("Do you really want to delete this entry?")) {
        // Remove entry from data & storage
        let storageData = JSON.parse(sessionStorage.getItem(currentView));

        if (storageData) {
          storageData = storageData.filter(item => {
            return item.id !== +selectedCheckbox.dataset['id'];
          });
        }

        parentRow.remove();
        storage.setItem(currentView, JSON.stringify(storageData));
      }
    }

    function dataClickHandler(e) {
      const _t = e.target;
      if(!_t || _t.tagName !== 'SPAN') return;

      const deleteButton = toolbar.querySelector('button[data-action="delete"]');
      const isSelected = _t.classList.contains('selected');

      // remove selected class from previous selected checkbox. and disable button
      clearSelection();
      deleteButton && deleteButton.setAttribute('disabled','disabled');

      // add selected class to selection
      if (isSelected) {
        _t.classList.remove('selected');

      } else {
        _t.classList.add('selected');
        deleteButton && deleteButton.removeAttribute('disabled');
      }
    }

    function createTabularData(data) {
      const keys = Object.keys(data[0]);
      const tableWrapper = document.createElement('div');
      const selectionEnabled = currentView === 'products';
      let headers = selectionEnabled ? '<tr><th></th>': '<tr>';
      let rowsHtml = '';

      // Create table headers
      keys.map(key => {
        headers += `<th>${key.toUpperCase().replace('_',' ')}</th>`;
      });
      headers += '</tr>';

      // Create rows and cells
      data.map(item => {
        rowsHtml += '<tr>';
        if (selectionEnabled) {
          rowsHtml += `<td width="50"><span class="checkbox" data-id=${item['id']}></span></td>`;
        }

        for (const property in item) {
          let itemValue = item[property];
          if (property === 'avatar') {
            let split = itemValue.split('/');
            itemValue = split[split.length - 2];
          }
          rowsHtml += `<td>${itemValue}</td>`;
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

    // Set view header
    function setViewHeader(title, action) {
      const heading = document.querySelector('h1');

      // Set view heading title
      heading && (heading.innerHTML = title)
      // Reset toolbar
      toolbar.innerHTML = '';

      if (!action) return;

      // Update toolbar
      const buttonTemplate = document.getElementById(`templateButton_${action}`);
      const buttonClone = buttonTemplate && buttonTemplate.content.cloneNode(true);

      buttonTemplate && toolbar.appendChild(buttonClone);
    }

    // Update view
    function updateView(title, action) {
      setViewHeader(title, action);

      const button = toolbar.querySelector('button');

      // Set event listeners
      action
        ? dataContainer.addEventListener('click', dataClickHandler)
        : dataContainer.removeEventListener('click', dataClickHandler);

      if (currentView === 'products') {
        button.addEventListener('click', removeEntry);
      } else if (currentView === 'users') {
        button.addEventListener('click', createNewUser);
      }
    }

    appNav.addEventListener('click', function(e) {
      const target = e.target;
      const fetchUrl = target && target.dataset['endpoint'];
      const action = target && target.dataset['action'];

      currentView = target.dataset['view'];
      if (!target.href || !currentView) return;

      dataContainer.classList.add('loader-bar');
      fetchUrl && fetchData(fetchUrl, createTabularData);

      updateView(target.innerText, action);

      // Hide mobile nav
      window.innerWidth < 992 && navToggle.click();
    });

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
