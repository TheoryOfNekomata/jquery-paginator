(function () {
    var $pagination;

    $pagination = $('#pagination');

    $pagination.paginate({
        size: {
            width: '8.5in',
            height: '5.5in'
        }
    });

    setTimeout(function () {
        var html = '';

        for (var i = 1; i <= 100; i++) {
            html += '<span><span id="el-' + i + '" style="display: block"><span id="el-child-' + i + '" style="display: block;"><span>The quick brown fox jumps over the lazy dog.</span></span></span></span>';
        }

        $pagination
            .children('.model')
            .children('.content')
            .append(html);
    }, 1000);
})();
