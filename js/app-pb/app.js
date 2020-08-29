(function(){
    // START: CODE
  function initApp() {
    const navToggle = document.getElementById('navToggle');
    const appNav = document.getElementById('appNav');
    const dataContainer = document.getElementById('pageContent');
    const STORAGE_KEY = '_products';
    const _strorage = window.sessionStorage;
    let _productsLoaded = false;
    let _view;

    // Fetch content
    function fetchData(url, callback, params) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200) {
          const res = xhr.responseText;
          callback(JSON.parse(res), params);
        }
      }
      xhr.open("GET", url, true);
      xhr.send(null);
    }

    // Remove selected class from currently selected checkbox
    function clearSelection() {
      const selectedCheckbox = document.querySelector('#pageContent .checkbox.selected');
      selectedCheckbox && selectedCheckbox.classList.remove('selected');
    }

    // Add new entry
    function addEntry(entry) {
    // TODO
    }

    // Remove selected entry
    function removeEntry() {
      const selectedCheckbox = document.querySelector('#pageContent .checkbox.selected');
      const parentRow = selectedCheckbox && selectedCheckbox.closest("tr");

      if (parentRow && window.confirm("Do you really want to delete this entry?")) {
        // Remove entry from data & storage
        let storageData = JSON.parse(sessionStorage.getItem(STORAGE_KEY));

        if (storageData) {
          storageData = storageData.filter(item => {
            return item.code !== selectedCheckbox.dataset['code'];
          });
        }

        parentRow.remove();
        _strorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
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

      // Set data to storage
      if (_view === 'products') {
        _strorage.setItem(STORAGE_KEY, JSON.stringify(data));
        _productsLoaded = true;
      }
    }

    // Set toolbar actions
    function setToolbarActions(action) {
      const button = document.querySelector('#toolbar button');
      const isAddAction = action === "add";

      if (button && action) {
        button.removeAttribute('disabled');
        button.removeAttribute('hidden');
        button.textContent = isAddAction ? "Add New" : "Delete";
        isAddAction
          ? button.addEventListener('click', addEntry)
          : button.addEventListener('click', removeEntry);

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

        _view = target.href && target.href.split('#')[1];

        if (!target.href || !_view) return;

        dataContainer.classList.add('loader-bar');
        _productsLoaded && _view === 'products'
          ? createTabularData(JSON.parse(sessionStorage.getItem(STORAGE_KEY)), true)
          : fetchUrl && fetchData(fetchUrl, createTabularData, !!action);

        document.querySelector('h1').innerHTML = target.innerText;
        setToolbarActions(action);

      } catch(error) {
        console.error(error);
      }
    });

    //region Mobile navigation
    function toggleNavigation(e) {
      e.preventDefault();
      e.stopPropagation();
      const navElem = e.currentTarget.nextElementSibling;

      navElem && navElem.classList.contains('open')
        ? navElem.classList.remove('open')
        : navElem.classList.add('open');
    }

    if (window.innerWidth < 992) {
      navToggle.addEventListener('click', toggleNavigation);
    } else {
      navToggle.removeEventListener('click', toggleNavigation);
    }
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
