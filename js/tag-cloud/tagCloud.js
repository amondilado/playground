var tagCloud = (function () {
    var _instance, _data;

    function dedup(data) {
        const _deduped = {},
              _res = [];

        data.filter(item => {
            var k = item.title.toLowerCase().replace(/\s/g, "") + '_' + item.priority;

            if (_deduped.hasOwnProperty(k)) {
                _deduped[k]['weight'] += 1;
                return false;
            } else {
                item['weight'] = 1;
                _deduped[k] = item;
                return true;
            }
        });

        // Convert to array for sorting
        for (var key in _deduped) {
            _res.push(_deduped[key]);
        }
        return _res;
    }

    function init(data, isWeighted) {
        _instance = document.getElementById('tagCloudHolder');
        _data = !isWeighted ? dedup(data) : data;

        // Sort by priority
        _data.sort((a, b) => a.priority > b.priority ? -1 : 1);

        // Sort alphabetically
        _data.sort((a, b) => {
            if (a.priority === b.priority) {
                return a.title > b.title ? 1 : -1;
            }
        });

        const _formattedData = _data.map(item => {
            const {priority, weight, title} = item;
            return '<li class="tag-cloud-item" data-priority="' + priority + '" data-weight="' + weight + '">' + title + '</li>'
        }).join("");

        // Prepare and append the list element
        const ul = document.createElement('ul');
        ul.classList.add('tag-cloud');
        ul.innerHTML = _formattedData;
        _instance.appendChild(ul);
    }

    return {
        init: init
    };
})();

//  example usage
document.addEventListener('DOMContentLoaded', () => {
    // tagCloud.init(TAG_CLOUD_DATA, false);
    tagCloud.init(TAG_CLOUD_WEIGHTED_DATA, true);
});
