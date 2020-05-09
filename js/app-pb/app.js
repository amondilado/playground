(function(){
    // START: CODE
  function contentLoadedHandler() {
    const navToggle = document.getElementById('navToggle');
    const appNav = document.getElementById('appNav');
    const appTitle = document.querySelector('h1');
    const dataContainer = document.getElementById('pageContent');

    // Fetch content
    function fetchData(url, callback, params) {
      const xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function() {
        if (xhr.readyState == 4 && xhr.status == 200)
          callback(JSON.parse(xhr.responseText), params);
      }
      xhr.open("GET", url, true); // true for asynchronous
      xhr.send(null);
    }

    function clickHandler(e) {
      const _t = e.target;
      if(!_t || _t.tagName !== 'SPAN') return;

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
          rowsHtml += `<td><span class="checkbox"></span></td>`;
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

      actionEnabled && dataContainer.addEventListener('click', clickHandler);
      window.setTimeout(()=> {
      dataContainer.classList.remove('loader-bar');
      }, 2000);
    }

    appNav.addEventListener('click', function(e) {
      try {
        const target = e.target;
        const view = target.href && target.href.split('#')[1];
        const fetchUrl = e.target.dataset['url'];
        const hasAction = !!e.target.dataset['action'];

        if (!target.href || !view) return;

        dataContainer.removeEventListener('click', clickHandler);
        dataContainer.classList.add('loader-bar');

        appTitle.innerHTML = target.innerText;

        switch(view) {
          case 'customers':
            break;
          case 'products':
            break;
          case 'users':
            break;
          default: return false;
        }

        fetchUrl && fetchData(fetchUrl, createTabularData, hasAction);

      } catch(error) {
        console.error(error.message);
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

  document.addEventListener("DOMContentLoaded", contentLoadedHandler);

    // END: CODE
}());
