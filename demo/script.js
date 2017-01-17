(function () {
    var $paginationEl;

    $paginationEl = $('#pagination');

    $paginationEl.paginate().refresh();

    $paginationEl.on('paginator.modelchangeend', function (e) {
        console.log(e);
    });
})();
